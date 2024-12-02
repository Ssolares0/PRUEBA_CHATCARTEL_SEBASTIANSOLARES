import { Request, Response, NextFunction } from 'express';
import {verificarTk } from '../autenticacion/auth';
import jwt from 'jsonwebtoken';


const SECRET_KEY = 'secretkey123';

export const autenticarUsuario = (req: Request, res: Response, next: NextFunction) => {

   
    const authHeader = req.headers['authorization'];
    console.log('Authorization Header:', authHeader); // Imprimir el encabezado para verificar

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token no proporcionado o inválido' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY) as { id_user: number; id_role: string };
        (req as any).user = decoded;
        next();
    } catch (error) {
        console.error('Error al verificar el token:', error);
        return res.status(403).json({ message: 'Token inválido o expirado' });
    }
    
}