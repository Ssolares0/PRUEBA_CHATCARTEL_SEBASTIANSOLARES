import express, { Request, Response } from 'express';
import mysql, { RowDataPacket } from 'mysql2';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { generateToken, comparePassword, hashPassword } from '../autenticacion/auth';


// Definición de la interfaz para el cuerpo de la solicitud
interface UserRequestBody {
    name: string;
    username: string;
    password: string;
}

interface LoginRequestBody {
    username: string;
    password: string;
}

interface User {
    id_user: number | null;
    name: string;
    username: string;
    password: string;
    id_role: number;
}
// Middleware para verificar el token JWT
interface AutenticacionRequest extends Request {
    user?: JwtPayload;
}
// Función para la ruta index
const index = (req: Request, res: Response): void => {
    res.status(200).json({ message: "Funcionando" });
}

// Configuración de la conexión a la base de datos
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'solares',
    database: 'chatcartel_db'
});

// Probamos la conexión
connection.connect((error) => {
    if (error) {
        console.log("Error en la conexión a la base de datos", error);
    } else {
        console.log("Conexión a la base de datos exitosa");
    }
});

// endpoint para crear un nuevo usuario
const createUser = (req: Request, res: Response): void => {
    const body: UserRequestBody = req.body;

    // Validamos los campos
    console.log(body.username);

    if (!body.username || !body.password || !body.name) {
        res.json("Existe un error en los datos");
    } else {
        // Si no existe ningún error seguimos
        const user: User = {
            id_user: null,
            name: body.name,
            username: body.username,
            password: body.password,
            id_role: 2
        };

        // Verificamos si el usuario ya existe en la db
        connection.query('SELECT * FROM users WHERE username = ?', [user.username], (error, results: RowDataPacket[], fields) => {
            if (results.length > 0) {
                res.json("El usuario ya existe, prueba con otro username");
            } else {
                // Si no existe el usuario lo insertamos en la db
                connection.query('INSERT INTO users SET ?', user, (err, result) => {
                    if (err) {
                        console.log("Existe un error al insertar los datos en la tabla", err);
                        res.json("Existe un error al insertar los datos en la tabla");
                    } else {
                        res.json("Usuario creado exitosamente");
                    }
                });
            }
        });
    }
}

// endpoint para hacer login

const login = (req: Request, res: Response): void => {

    const { username, password } = req.body;

    // primero verificamos si  se mandaron los campos de usuario y contraseña
    const body: LoginRequestBody = req.body;

    if (!body.username || !body.password) {
        res.status(400).json({ message: 'username y contraseña son requeridos' });
    } else {

        //entonces como no existe error seguimos
        // buscamos el usuario en la base de datos

        connection.query('SELECT * FROM users WHERE username = ?', [username], (error, results: RowDataPacket[], fields) => {
            if (error) {
                console.log('Error en la consulta:', error);
                return res.status(500).json({ message: 'Error en la  consulta de la base de datos' });
            }
            if (results.length === 0) {
                return res.status(401).json({ message: 'Usuario no encontrado' });
            }
            // como si encontro el usuario seguimos
            const user = results[0];


            // ahora hacemos la comprobacion de la contraseña con bcrypt
            // Verificar si la contraseña coincide usando bcrypt  y async
            const isMatch = comparePassword(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Credenciales incorrectas' });
            }

            // como las credenciales son correctas generamos el token
            const payload = {
                id_user: user.id_user,
                name: user.name,
                username: user.username,
                id_role: user.id_role
            };

            const token = generateToken(payload);

            // Responder con el token
            res.json({
                message: 'Autenticación exitosa',
                token: token
            });




        });


    }

}

// endpoint para obtener informacion del usuario autenticado
const getUserInfo = (req: AutenticacionRequest, res: Response): void => {
    const userId = parseInt(req.params.id);
    console.log('userId:', userId); 
    // obtenemos el usuario autenticado
    if(!req.user){
        res.status(401).json({ message: 'No estas autenticado!!' });
        return;
    }
    const userIdAutenticado = req.user.id_user;
    const RoleAutenticado = req.user.id_role;

    // Verificar si el usuario autenticado es el mismo o tiene rol de administrador
    if (userIdAutenticado !== userId && RoleAutenticado !== 1) {
         res.status(403).json({ message: 'No autorizado para acceder a esta información' });
         return;
    }
    // como si tiene permisos de admin obtenemos la informacion de la database
    connection.query('SELECT id_user, name, username, id_role FROM users WHERE id_user = ?', [userId], (err, results) => {
        if (err) {
            console.log('Error en la consulta:', err);
            return res.status(500).json({ message: 'Error en la consulta de la base de datos' });
        }

        

        const user = results;
        res.status(200).json(user);
    });
}
export {
    index,
    createUser,
    login,
    getUserInfo

};
