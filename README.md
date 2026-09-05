# source_trace_invoker_function
Repositorio encargado de invocar la instancia para el análisis de código para el proyecto source trace

# Instrucciones de uso

1. Descargar dependencias
```bash
npm install
```
2. Levantar aplicacion en local

La aplicación levantara en el puerto 3001, aunque se puede configurar cambiando le puerto en el archivo server.ts

```bash
npm start
```
3. Consumir apis

```bash
postman request POST 'http://localhost:3001/V1/product/questionaire/registryQuestion' \
  --header 'Content-Type: application/json' \
  --body '{
    "text": "Como defino una función que no retorna información PRUEBA",
    "answer": "void",
    "category": "nodeJs",
    "difficulty": "easy",
    "type": "multiple",
    "options": ["public", "static", "void", "async"]
}'
```
# Consideraciones

Tener en cuenta la cuenta de AWS conectada desde consola, si no se tiene configurada la cuenta ni los recursos requeridos desde local, no funcionara la aplicación.

