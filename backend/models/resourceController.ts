import { Request, Response } from 'express';
import { CrearLog } from './logService';



export const createResource = async (req: Request, res: Response) => {
  try {
    const { userId, data } = req.body;
    // Lógica para crear el recurso
    const createdResource = { /* lógica del recurso creado */ };

    // Registrar log
    await CrearLog({
      userId,
      action: 'CREATE',
      resource: 'TASK', // Cambiar según el recurso
    });

    res.status(201).json({ message: 'Resource created', createdResource });
  } catch (error) {
    res.status(500).json({ message: 'Error creating resource' });
  }
};