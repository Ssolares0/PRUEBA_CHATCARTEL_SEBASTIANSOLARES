import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app = express();

// Opciones de CORS
const corsOptions: cors.CorsOptions = {
    origin: "*"
};

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(cors(corsOptions));

// Rutas
import indexRoutes from './routes/index.routes';

// Rutas de prueba
app.use('/', indexRoutes);

// Ruta por defecto para manejar errores 404
app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json("No se encontró la ruta");
});

export default app;
