# source_trace_invoker_function

API de entrada del sistema **Source Trace**. Recibe una petición para analizar código
fuente y **arranca la Step Function** que orquesta el análisis en ECS. También entrega
**URLs prefirmadas de S3** para que el front suba un artefacto (`.zip`/`.tar.gz`) sin que
el archivo pase por esta Lambda.

Corre como app Express, empaquetada para **AWS Lambda** detrás de **API Gateway**
mediante `aws-serverless-express`.

---

## Flujo

```
                 ┌──────────────────────── modo UPLOAD ────────────────────────┐
                 │                                                             │
front ──GET /uploadUrl──▶ Lambda ──presign──▶ (devuelve URL) ──PUT archivo──▶ S3
                 │                                                             │
                 └─────────────────────────────────────────────────────────────┘

front ──POST /invoke──▶ Lambda
                          │  1. valida el body
                          │  2. DynamoDB PutItem  PK=JOB#<jobId> SK=META status=QUEUED
                          │  3. StepFunctions StartExecution  input={ jobId, payload }
                          ▼
                     Step Function ──▶ getSource ▶ basicAnalysis ▶ … (tasks ECS)
                          │
                     DynamoDB  status=RUNNING → SUCCEEDED | FAILED
```

`jobId` (UUID) identifica el trabajo de punta a punta: PK `JOB#<jobId>` en DynamoDB y
env `JOB_ID` en cada task ECS.

---

## Estructura

```
src/
  app.ts                     Express: JSON, CORS (Access-Control-Allow-Origin: *), preflight, rutas
  bin/server.ts              Entrypoint local (escucha en PORT)
  config.ts                  Configuración leída de variables de entorno
  adapters/
    routes.ts                Definición de rutas
    invokeAdapter/            POST /V1/product/analysis/invoke
    uploadAdapter/            GET  /V1/product/analysis/uploadUrl
  domain/
    analysisRequestValidator.ts   Valida y normaliza el body de /invoke
    uploadRequestValidator.ts     Valida los query params de /uploadUrl
    models/                       Interfaces y enums
  ports/
    AnalysisPort/            Step Functions — StartExecution
    jobPort/                 DynamoDB — PutItem (item QUEUED)
    uploadPort/              S3 — URL prefirmada (PutObject)
lambda/index.js              Handler de AWS Lambda (aws-serverless-express)
static/source_trace_invoker_api.json   Especificación OpenAPI 3
.github/workflows/deploy.yml OIDC + aws lambda update-function-code
```

---

## Requisitos

- **Node.js 20** y npm
- Credenciales de AWS con acceso a Step Functions, DynamoDB y S3 (los ports llaman a AWS
  incluso en local). Configúralas con `aws configure`, SSO, o variables
  `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_SESSION_TOKEN`.

---

## Variables de entorno

| Variable | Requerida | Default | Uso |
|---|---|---|---|
| `PORT` | no | `3001` | Puerto del servidor local |
| `DEBUG` | no | `invoker:*` | Namespaces de logs (librería `debug`) |
| `AWS_REGION` | no | `us-east-1` | Región de los clientes AWS |
| `ANALYSIS_STATE_MACHINE_ARN` | sí (para `/invoke`) | — | ARN de la Step Function a arrancar |
| `DYNAMODB_TABLE` | sí (para `/invoke`) | `source_trace_db` | Tabla de jobs (PK `JOB#<jobId>`, SK `META`). También acepta `DYNAMODB_TABLE_NAME` |
| `UPLOAD_BUCKET` | sí (para `/uploadUrl`) | — | Bucket S3 donde se suben los artefactos |
| `UPLOAD_PREFIX` | no | `uploads` | Prefijo/carpeta de la key en S3 |
| `UPLOAD_URL_EXPIRES_SECONDS` | no | `900` | Validez de la URL prefirmada (segundos) |

> El proyecto **no carga `.env` automáticamente**. Exporta las variables en tu shell
> (ver abajo) o usa un cargador como `dotenv`. En [`.env.example`](.env.example) hay una
> plantilla.

---

## Levantar en local

```bash
# 1. Dependencias
npm install

# 2. Variables de entorno (PowerShell)
$env:ANALYSIS_STATE_MACHINE_ARN = "arn:aws:states:us-east-1:<acct>:stateMachine:source-trace-analysis"
$env:DYNAMODB_TABLE            = "source_trace_db"
$env:UPLOAD_BUCKET             = "source-trace-uploads"
$env:AWS_REGION                = "us-east-1"
$env:DEBUG                     = "invoker:*,invoke:*,upload:*"

#    …o en bash / git-bash:
# export ANALYSIS_STATE_MACHINE_ARN=arn:aws:states:...
# export DYNAMODB_TABLE=source_trace_db
# export UPLOAD_BUCKET=source-trace-uploads

# 3. Compilar y arrancar (escucha en http://localhost:3001)
npm start
```

`npm start` corre `tsc` (salida en `build/`) y luego `node ./build/bin/server.js`.
Para recompilar sin arrancar: `npm run build`.

---

## Endpoints

Base local: `http://localhost:3001`

### `POST /V1/product/analysis/invoke`

Arranca el análisis. El body tiene dos modos **mutuamente excluyentes**:

**Modo GIT** — el repo se clona más adelante en el ECS:

| Campo | Req. | Notas |
|---|---|---|
| `sourceType` | sí | `"GIT"` |
| `repoUrl` | sí | `http(s)://`, `git@`, `ssh://` o `git://` |
| `branch` | no | |
| `commit` | no | |
| `authTokenRef` | no | Referencia a un secreto para repos privados |
| `projectId` | no | |
| `callbackUrl` | no | URL `http(s)` para notificar el resultado |

**Modo UPLOAD** — artefacto ya subido a S3 (ver `/uploadUrl`):

| Campo | Req. | Notas |
|---|---|---|
| `sourceType` | sí | `"UPLOAD"` |
| `artifactPath` | sí | `s3://bucket/key` devuelto por `/uploadUrl` |
| `artifactFormat` | no | `zip` (default) o `tar.gz` |
| `projectId` | no | |
| `callbackUrl` | no | |

**Respuestas**

- `202` → `{ "jobId": "<uuid>", "status": "STARTED" }`
- `400` → `{ "message": "Invalid analysis request", "errors": ["…"] }`
- `500` → `{ "message": "Error invoking analysis source", "error": "…" }`

**Ejemplo**

```bash
curl -X POST http://localhost:3001/V1/product/analysis/invoke \
  -H 'Content-Type: application/json' \
  -d '{
    "sourceType": "GIT",
    "repoUrl": "https://github.com/spring-projects/spring-petclinic",
    "branch": "main",
    "projectId": "demo"
  }'
```

### `GET /V1/product/analysis/uploadUrl`

Devuelve una URL prefirmada `PUT` para subir el artefacto directo a S3.

| Query param | Req. | Notas |
|---|---|---|
| `fileName` | sí | Se sanitiza. Debe terminar en `.zip`, `.tar.gz` o `.tgz` (máx. 200 chars) |
| `contentType` | no | Default `application/octet-stream`. Debe coincidir con el header del PUT |
| `projectId` | no | Se incluye en el prefijo de la key |

**Respuesta `200`** (`UploadTicket`)

```json
{
  "uploadId": "<uuid>",
  "bucket": "source-trace-uploads",
  "key": "uploads/demo/2026/09/06/<uploadId>/repo.zip",
  "artifactPath": "s3://source-trace-uploads/uploads/demo/2026/09/06/<uploadId>/repo.zip",
  "method": "PUT",
  "url": "https://source-trace-uploads.s3.us-east-1.amazonaws.com/…firma…",
  "headers": { "Content-Type": "application/zip" },
  "expiresIn": 900
}
```

**Flujo completo (UPLOAD)**

```bash
# 1. pedir la URL
TICKET=$(curl -s "http://localhost:3001/V1/product/analysis/uploadUrl?fileName=repo.zip&contentType=application/zip&projectId=demo")

# 2. subir el archivo a S3 (Content-Type debe ser idéntico al del ticket)
curl -X PUT "$(echo "$TICKET" | jq -r .url)" \
  -H "Content-Type: application/zip" \
  --data-binary @repo.zip

# 3. invocar el análisis con el artifactPath del ticket
curl -X POST http://localhost:3001/V1/product/analysis/invoke \
  -H 'Content-Type: application/json' \
  -d "{ \"sourceType\": \"UPLOAD\", \"artifactPath\": $(echo "$TICKET" | jq .artifactPath), \"artifactFormat\": \"zip\" }"
```

### `OPTIONS *`

Preflight CORS: responde `204` con `Access-Control-Allow-Origin: *`.

---

## Contrato con la Step Function

`AnalysisPort` llama a `StartExecution` con `name = jobId` (sanitizado, máx. 80 chars) y
este `input`:

```json
{
  "jobId": "62252add-9525-480d-a3c4-dac09a91054b",
  "payload": {
    "schemaVersion": "1.0",
    "requestedAt": "2026-09-06T02:54:42.195Z",
    "type": "git",
    "jobType": "git",
    "sourceType": "git",
    "repoUrl": "https://github.com/spring-projects/spring-petclinic"
  }
}
```

- `payload` es **siempre un objeto** (nunca `string` ni ausente).
- `type` / `jobType` / `sourceType` llevan el mismo valor **en minúscula**: `git` o `s3`
  (`GIT` → `git`, `UPLOAD` → `s3`). Cubre lo que lee la state machine (`$.payload.sourceType`)
  y lo que valida el contenedor `analysis-mngr`.
- Las claves opcionales ausentes **se omiten** (no van en `null`).

Antes de `StartExecution`, la Lambda hace `PutItem` en DynamoDB:
`PK=JOB#<jobId>`, `SK=META`, `status=QUEUED`, `createdAt=<ISO>`
(con `ConditionExpression: attribute_not_exists(PK)`).

---

## Tests

```bash
node --test tests/
```

(`npm test` es todavía un placeholder.)

---

## Despliegue

Automático con **GitHub Actions** ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml))
en cada push a `main`:

1. `npm install` + `npm run build`
2. Empaqueta `index.js` + `build/` + `static/` + `node_modules` en `lambda.zip`
3. Autenticación **OIDC** (`aws-actions/configure-aws-credentials@v4`, sin claves estáticas)
4. `aws lambda update-function-code`

**Configuración del repo** (Settings → Secrets and variables → Actions):

| Nombre | Tipo | Valor |
|---|---|---|
| `AWS_DEPLOY_ROLE_ARN` | secret | ARN del rol que asume GitHub Actions vía OIDC |
| `LAMBDA_FUNCTION_NAME` | secret | Nombre de la función Lambda |
| `AWS_REGION` | variable | p. ej. `us-east-1` |

### Infraestructura (fuera de este repo)

**Variables de entorno de la Lambda:** `ANALYSIS_STATE_MACHINE_ARN`, `DYNAMODB_TABLE`,
`UPLOAD_BUCKET` (y opcionalmente `DEBUG`, `UPLOAD_PREFIX`, `UPLOAD_URL_EXPIRES_SECONDS`).

**Permisos del rol de ejecución de la Lambda:**

| Acción | Recurso |
|---|---|
| `states:StartExecution` | ARN de la state machine |
| `dynamodb:PutItem` | ARN de la tabla de jobs |
| `s3:PutObject` | `arn:aws:s3:::<UPLOAD_BUCKET>/<UPLOAD_PREFIX>/*` |
| `logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents` | (`AWSLambdaBasicExecutionRole`) |

**API Gateway:** usar **REST API** (payload v1.0). `aws-serverless-express@3` no entiende
los eventos v2.0 de HTTP API.

**CORS en el bucket S3:** permitir `PUT` desde el origen del front
(`AllowedMethods: [PUT]`, `AllowedHeaders: ["*"]`, `AllowedOrigins: ["<tu-front>"]`).
