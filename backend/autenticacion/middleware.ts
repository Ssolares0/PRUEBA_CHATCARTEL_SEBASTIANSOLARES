import { Request, Response, NextFunction } from 'express';
import {verificarTk } from '../autenticacion/auth';
import jwt from 'jsonwebtoken';


const SECRET_KEY = 'secretkey123';

export const autenticarUsuario = (tk: string) => {

    return async (req: Request, res: Response, next: NextFunction) => {
        // Verificar si el token es válido
        const decoded = verificarTk(tk);
        if (decoded) {
            // Si el token es válido, almacenar el id del usuario en la solicitud
            req.body.userId = decoded.userId;
            next();
        } else {
            res.status(401).json({ message: 'No autorizado' });
        }
    }

   
    
    
    
}