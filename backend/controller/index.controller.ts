import express, { Request, Response } from 'express';
import mysql, { RowDataPacket } from 'mysql2';

import bcrypt from 'bcryptjs';
import { generateToken, comparePassword, hashPassword, verificarTk } from '../autenticacion/auth';
import mongoose from 'mongoose';
//import {resourceController} from '../models/resourceController';    

//almacenar el token
let globalToken: string | null = null;

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

// Función para la ruta index
const index = (req: Request, res: Response): void => {
    res.status(200).json({ message: "Funcionando" });
}

// Configuración de la conexión a la base de datos mysql
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'solares123',
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
const createUser = async (req: Request, res: Response) => {
    const body: UserRequestBody = req.body;

    //primero creamos el administrador


    // Validamos los campos
    console.log(body.username);

    if (!body.username || !body.password || !body.name) {
        res.status(401).json({ message: 'existe un error en los campos' });
    } else {
        // Si no existe ningún error seguimos

        //encriptamos la contraseña
        const hashedPassword = await hashPassword(body.password);
        console.log('hashedPassword:', hashedPassword);
        const user: User = {
            id_user: null,
            name: body.name,
            username: body.username,
            password: hashedPassword,
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

const login = async (req: Request, res: Response) => {

    const { username, password } = req.body;



    // primero verificamos si  se mandaron los campos de usuario y contraseña
    const body: LoginRequestBody = req.body;

    if (!body.username || !body.password) {
        res.status(400).json({ message: 'username y contraseña son requeridos' });
    } else {

        //entonces como no existe error seguimos
        // buscamos el usuario en la base de datos

        connection.query('SELECT * FROM users WHERE username = ?', [username], async (error, results: RowDataPacket[], fields) => {
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
            console.log(user.password);
            // Comparamos la contraseña ingresada con el hash almacenado en la base de datos
            const ismatch = await bcrypt.compare(password, user.password);

            if (!ismatch) {
                return res.status(401).json({ message: 'Contraseña incorrecta' });
            }

            // como las credenciales son correctas generamos el token
            const payload = {
                id_user: user.id_user,
                name: user.name,
                username: user.username,
                id_role: user.id_role
            };

            const token = generateToken(payload);

            //guardamos el token en una variable global
            //globalToken = token;

            
            
            // Responder con el token
            res.json({
                message: 'Autenticación exitosa',
                token: token
            });


        });

    }

}

// endpoint para obtener informacion del usuario autenticado
const getUserInfo = (req: Request, res: Response): void => {
    //console.log('globalToken:', globalToken);
    
    
    const { myid } = req.params; //obtengo el id de los parametros

    console.log('myid:', myid);


    connection.query('SELECT * FROM users WHERE id_user = ?', [myid], (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Error al consultar la base de datos' });
        }


        res.json(results);
    });


}
//prueba 


export {
    index,
    createUser,
    login,
    getUserInfo

};
