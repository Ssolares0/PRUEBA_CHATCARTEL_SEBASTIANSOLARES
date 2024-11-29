import { Request, Response, NextFunction } from 'express';
import {verificarTk } from '../autenticacion/auth';


export const autenticarUsuario = (req: Request, res: Response, next: NextFunction) => {

    // Obtener el token de la cabecera
    console.log(req.headers);
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado o erroneo' });

        
    }
    //como no hay error procedemos a verificar el token
    const decoded = verificarTk(token);

    // Si el token no es valido, retornamos un error
    if (!decoded) {
        return res.status(401).json({ message: 'Token no válido o ya expiro!' });
    }

   
    // Ahora comparamos el id_user del token con el id proporcionado en la solicitud
    const { id_user } = decoded;  // El payload contiene id_user, asegúrate de que esto es lo que tu token contiene

    const { id } = req.body;  // Supongamos que el id se pasa en el cuerpo de la solicitud

    if (id_user !== id) {
        return res.status(403).json({ message: 'No tienes permiso para acceder a estos datos' });
    }

    // Si todo está bien, continuamos con la solicitud
    next();
}