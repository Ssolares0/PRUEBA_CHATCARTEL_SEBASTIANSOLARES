import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// se crea una funcion para generar el token jwt
export const generateToken = (payload: object) => {
    const llave = 'secretkey123';

    const options = {
        expiresIn: '1h', // expira en 1 hora
    };

    return jwt.sign(payload, llave, options);

    
}

// Función para comparar contraseñas con bcrypt
export const comparePassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(plainPassword, hashedPassword);
};

// esta funcion sirve para encriptar la contraseña
export const hashPassword = (password: string): Promise<string> => {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);

    

};

// funcion que nos sirve para verificar el token jwt
export const verificarTk = (token: string): Record<string, any> | null => {
    const secretKey = process.env.JWT_SECRET_KEY || 'secretkey123';

    try {
        
        // Decodifica y verifica el token usando nuestra llave secreta
        const decoded = jwt.verify(token, secretKey);
        return decoded as Record<string, any>;
    } catch (error) {
        // Si el token no es válido o ha expirado, retornar null o vacio
        return null;
    }
    //
};