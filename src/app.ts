import express, { NextFunction, Response, Request } from 'express'; // NOSONAR
import logger from 'morgan';
import path from 'path';
import routes from './adapters/routes';

const app = express();
app.disable('x-powered-by');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../static')));

app.use((req: Request, res: Response, next: NextFunction) => {
	console.log(`Petición recibida: ${req.method} ${req.originalUrl}`);
	next();
  });

app.use((_, res: Response, next: NextFunction) => {
	res.header('Access-Control-Allow-Origin', '*'); // NOSONAR
	res.header('Access-Control-Allow-Headers', '*'); // NOSONAR
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE'); // NOSONAR
	res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
	next();
});
app.use(routes);

export default app;
