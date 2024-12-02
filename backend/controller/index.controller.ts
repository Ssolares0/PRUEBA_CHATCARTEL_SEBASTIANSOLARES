import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import {mysqlconnection,connectToMySQL,connectToMongoDB} from '../basefunctions/conections';
import { generateToken, comparePassword, hashPassword, verificarTk } from '../autenticacion/auth';
import { MongoClient } from 'mongodb';
import { UserRequestBody, User, LoginRequestBody } from '../interfaces/interfaces';
import { RowDataPacket } from 'mysql2';

import registerLog from '../models/registerLog';

//almacenar el token
let globalToken: string = '';
let isAdmin: boolean = false;

const urlMDB = "mongodb+srv://solares:Pennywise2@cluster0.v1qki.mongodb.net/logs_db?retryWrites=true&w=majority&appName=Cluster0";




// Función para la ruta index
const index = (req: Request, res: Response): void => {
    res.status(200).json({ message: "Funcionando" });
}

// Función para establecer las conexiones a las bases de datos
const setupConnection = async () => {

    try{
        //tratemos de conectar a la base de datos mysql
        await connectToMySQL();

        //tratamos de conectar a la base de datos mongoDB
        await connectToMongoDB();


    }catch(error){
        console.error("No se pueden establecer las conexiones de las BD", error);
    }

}



// endpoint para crear un nuevo usuario
const createUser = async (req: Request, res: Response) => {
    const body: UserRequestBody = req.body;

    // Validamos los campos
    console.log(body.username);

    if (!body.username || !body.password || !body.name) {
        res.status(401).json({ message: 'existe un error en los campos' });
    } else {
        // Si no existe ningún error seguimos

        //encriptamos la contraseña
        const hashedPassword = await hashPassword(body.password);
        
        const user: User = {
            id_user: null,
            name: body.name,
            username: body.username,
            password: hashedPassword,
            id_role: 2
        };

        // Verificamos si el usuario ya existe en la db
        mysqlconnection.query('SELECT * FROM Users WHERE username = ?', [user.username], (error, results: RowDataPacket[], fields) => {
            if (results.length > 0) {
                res.json("El usuario ya existe, prueba con otro username");
            } else {
                // Si no existe el usuario lo insertamos en la db
                mysqlconnection.query('INSERT INTO Users SET ?', user, (err, result) => {
                    if (err) {
                        console.log("Existe un error al insertar los datos en la tabla", err);
                        res.json("Existe un error al insertar los datos en la tabla");
                    } else {
                        
                        // Obtener el id del usuario recién creado
                        mysqlconnection.query('SELECT id_user FROM Users WHERE username = ?', [user.username], (error, results: RowDataPacket[], fields) => {
                            console.log("results:", results);
                            // Registrar el log
                            registerLog(results[0].id_user.toString(), "CREATE", "USER")
                            .then(() => console.log("Log registrado"))
                            .catch((err) => console.error("Error al registrar log:", err));
                        });
                        

                        return res.status(200).json("Usuario creado exitosamente");
                    }
                });
            }
        });
    }
}

// endpoint para hacer login

const login = async (req: Request, res: Response) => {

    const { username, password} = req.body;


    // primero verificamos si  se mandaron los campos de usuario y contraseña
    const body: LoginRequestBody = req.body;

    if (!body.username || !body.password) {
        res.status(400).json({ message: 'username y contraseña son requeridos' });
    } else {

        //entonces como no existe error seguimos
        // buscamos el usuario en la base de datos


        mysqlconnection.query('SELECT * FROM Users WHERE username = ?', [username], async (error, results: RowDataPacket[], fields) => {
            if (error) {
                console.log('Error en la consulta:', error);
                return res.status(500).json({ message: 'Error en la  consulta de la base de datos' });
            }
            if (results.length === 0) {
                return res.status(401).json({ message: 'Usuario no encontrado' });
            }
            // como si encontro el usuario seguimos
            const user = results[0];

            // Verificamos si el usuario es administrador
            

            if (user.id_role === 1 && username === 'admin' && password === 'admin') { 
                isAdmin = true;
                

                globalToken = "admin";
                
                
                // Responder con el token
                res.json({
                    message: 'Autenticación exitosa Como Administrador!!',
                    
                });
                
            } else {
                //como no es administrador verificamos el password con bcrypt
                isAdmin = false;
                
               
                // Comparamos la contraseña ingresada con el hash almacenado en la base de datos
                const ismatch = await bcrypt.compare(password, user.password);

                if (!ismatch) {
                    return res.status(401).json({ message: ' Usuario o Contraseña incorrecta' });
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
                globalToken = token;
                // Responder con el token
                res.json({
                    message: `Bienvenido ${username}!!`,
                    
                });

                }
           

        });

    }

}

// endpoint para obtener informacion del usuario autenticado
const getUserInfo = (req: Request, res: Response): void => {
    // Verificar si el token es válido
    const token = globalToken;

    //con la funcion verificarTk verificamos si el token es valido
    const decoded = verificarTk(token);
    
    if (decoded ) {
        //como si esta autorizado entonces obtenemos el id del usuario
        const { id } = req.params; //obtengo el id de los parametros

        //verificamos si el id de los parametros  es igual al id del usuario autenticado

       if (id.toString() === decoded.id_user.toString()) {
            mysqlconnection.query('SELECT * FROM Users WHERE id_user = ?', [id], (error, results) => {
                if (error) {
                    return res.status(500).json({ message: 'Error al consultar la base de datos' });
                }
        
        
                res.json(results);
            });
        } else {
            res.status(400).json({ message: 'El id no coincide con el usuario logeado' });
        }
        
    } else if (token === 'admin') { 
        //como es admin entonces puede ver todos los usuarios
        mysqlconnection.query('SELECT * FROM Users', (error, results) => {
            if (error) {
                return res.status(500).json({ message: 'Error al consultar la base de datos' });
            }
    
    
            res.json(results);
        });
    } else {
        res.status(401).json({ message: 'No estas autorizado o ha finalizado la sesion!!' });
        
    }
    

}
//endpoint para actualizar la informacion del usuario
const updateUserInfo = (req: Request, res: Response) => {
    //obtenemos el id del usuario de los parametros
    const { id } = req.params; //obtengo el id de los parametros
    //obtengo los datos del body
    const {name, username} = req.body;

    if (!name || !username )  {
        return res.status(401).json({ message: 'Los campos name y username son obligatorios' });
    } 

    // Verificar si el token es válido
    const token = globalToken;

    //con la funcion verificarTk verificamos si el token es valido
    const decoded = verificarTk(token);
    
    if (decoded ) {

        //verificamos si el id de los parametros  es igual al id del usuario autenticado

       if (id.toString() === decoded.id_user.toString()) {
            mysqlconnection.query('UPDATE Users SET name = ?, username = ? WHERE id_user = ?', [name,username,id], (error, results) => {
                if (error) {
                    return res.status(500).json({ message: 'Error al actualizar datos en la BD' });
                }
                registerLog(id.toString(), "UPDATE", "USER")
                .then(() => console.log("Log registrado"))
                .catch((err) => console.error("Error al registrar log:", err));
        
        
                res.json(results);
            });
        } else {
            res.status(400).json({ message: 'El id no coincide con el usuario logeado' });
        }
        
    } else if (token === 'admin') { 
        //como es admin entonces puede modificar todos los usuarios
        mysqlconnection.query('UPDATE Users SET name = ?, username = ? WHERE id_user = ?', [name,username,id], (error, results) => {
            if (error) {
                return res.status(500).json({ message: 'Error al actualizar datos en la BD' });
            }

            // Registrar el log 
            registerLog("1", "UPDATE", "USER")
            .then(() => console.log("Log registrado"))
            .catch((err) => console.error("Error al registrar log:", err));
    
    
            res.json(results);
        });
    } else {
        res.status(401).json({ message: 'No estas autorizado o ha finalizado la sesion,inicia sesion nuevamente!!' });
        
    }
}

//endpoint para eliminar un usuario
const deleteUser = (req: Request, res: Response) => {

    //obtenemos el id del usuario de los parametros
    const { id } = req.params; //obtengo el id de los parametros

    // Verificar si el token es válido
    const token = globalToken;

    
    
    // solo administrador puede eliminar un usuario registrado
    if (token === 'admin') {

        if (!id ) {
            return res.status(401).json({ message: 'ERROR: El id es obligatorio' });
        } else if (id === '1') {
            return res.status(401).json({ message: 'ERROR: No puedes eliminar al administrador' });
        } mysqlconnection.query('DELETE FROM Users WHERE id_user = ?', [id], (error, results) => {
            if (error) {
                    return res.status(500).json({ message: 'Error al eliminar datos en la BD' });
            }

            registerLog("1", "DELETE", "USER")
                .then(() => console.log("Log registrado"))
                .catch((err) => console.error("Error al registrar log:", err));
        
        
            res.json(results);
        });
        
    } else {
        res.status(401).json({ message: 'ERROR: No estas autorizado o ha finalizado la sesion!!' });
    }
}

// endpoint para crar un proyecto
const createProject = (req: Request, res: Response) => {

    const token = globalToken;

    //solo el administrador puede crearle projectos a los usuarios y tareas

    if (token === 'admin') {
        //obtenemos los datos del body
        const {name_project, id_user} = req.body;

        if (!name_project  || !id_user ) {
            return res.status(401).json({ message: 'Los campos name y id_user son obligatorios' });
        } 
         // Obtengo la fecha actual  y la formateo
        const now = new Date();
        const created_time  = now.toISOString().slice(0, 19).replace('T', ' ');

        //verificamos que el usuario exista
        mysqlconnection.query('SELECT * FROM Users WHERE id_user = ?', [id_user], (error, results: RowDataPacket[], fields) => {

            if (error) {
                console.log('Error en la consulta:', error);
                return res.status(500).json({ message: 'Error en la  consulta de la base de datos' });
            }
            if (results.length === 0) {
                return res.status(401).json({ message: 'ERROR: Al usuario que deseas agregar un proyecto no existe!' });

            }
            // como si existe insertamos los datos en la tabla projects

            mysqlconnection.query('INSERT INTO projects SET ?', {name_project,created_time , id_user}, (error, results) => {
                if (error) {
                    return res.status(500).json({ message: 'Error al insertar datos en la BD', error });
                }
                // Registrar el log
                registerLog("1", "CREATE", "PROJECT")
                .then(() => console.log("Log registrado"))
                .catch((err) => console.error("Error al registrar log:", err));
            
            
                res.json({ message: 'Proyecto creado exitosamente al usuario ', results });
            });


        });

        
    } else {
        res.status(401).json({ message: 'ERROR: No estas autorizado o ha finalizado la sesion!!' });
    }
}


//endpoint para obtener los projectos

const getProjects = (req: Request, res: Response) => {
    // Verificar si el token es válido
    const token = globalToken;

    //con la funcion verificarTk verificamos si el token es valido
    const decoded = verificarTk(token);

    if (decoded){
        
        let id = decoded.id_user.toString();
        if (decoded.id_user.toString()) {
            mysqlconnection.query('SELECT * FROM projects WHERE id_user = ?', [id], (error, results) => {
                if (error) {
                    return res.status(500).json({ message: 'Error al consultar la base de datos' });
                }
        
        
                res.json(results);
            });
        } else {
            res.status(400).json({ message: 'El id no coincide con el usuario logeado' });
        }
    } else if (token === 'admin') {
        mysqlconnection.query('SELECT * FROM projects', (error, results) => {
            if (error) {
                return res.status(500).json({ message: 'Error al consultar la base de datos' });
            }
    
    
            res.json(results);
        });
        
    } else {
        res.status(401).json({ message: 'No estas autorizado o ha finalizado la sesion!!' });
    }
}


// endpoint para asignrar tareas a un proyecto especifico

const assignTask = (req: Request, res: Response) => {

    const {id} = req.params;
    

    const {task_name, status, id_user, due_date} = req.body;

    // valido de  que los datos datos requeridos esten completos
    if (!task_name || !status || !id_user || !due_date) {
        return res.status(400).json({ message: 'ERROR: Todos los campos (task_name, status, id_user, due_date) son obligatorios!!.' });
    }
    // obtengo el token
    const token = globalToken;

    //solo el administrador puede asignar tareas a los usuarios

    if (token === 'admin') {
        //verificamos que el proyecto exista
        mysqlconnection.query('SELECT * FROM projects WHERE id_project = ?', [id], (error, results: RowDataPacket[], fields) => {

            if (error) {
                console.log('Error en la consulta:', error);
                return res.status(500).json({ message: 'ERROR: en la  consulta de la base de datos' });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'ERROR: El proyecto al que deseas asignar una tarea no existe!' });

            }
            // como si existe insertamos los datos en la tabla tasks

            const id_project = id;

            mysqlconnection.query('INSERT INTO tasks SET ?', {task_name, status, id_user, due_date, id_project}, (error, results) => {
                if (error) {
                    return res.status(500).json({ 
                        message: 'Error al insertar datos en la BD', error 
                    
                    });
                }
                
                registerLog("1", "CREATE", "TASK")
                .then(() => console.log("Log registrado"))
                .catch((err) => console.error("Error al registrar log:", err));
            
                res.json({ 
                    message: 'Tarea asignada exitosamente al proyecto ',
                    task_name,
                    status,
                    id_user,
                    due_date,
                    id
                
                });
            });
        });


    } else {
        res.status(401).json({ message: 'ERROR: No estas autorizado o ha finalizado la sesion!!' });
    }



}

// endpoint para obtener las tareas de un proyecto especifico
const getTasks = (req: Request, res: Response) => {

  
     // Verificar si el token es válido
     const token = globalToken;

     //con la funcion verificarTk verificamos si el token es valido
     const decoded = verificarTk(token);
     
     if (decoded ) {
         //como si esta autorizado entonces obtenemos el id del usuario
         const { id } = req.params; //obtengo el id de los parametros
 
         //verificamos si el id de los parametros  es igual al id del usuario autenticado
 
        
        mysqlconnection.query('SELECT * FROM tasks WHERE id_project = ?', [id], (error, results) => {
                if (error) {
                     return res.status(500).json({ message: 'Error al consultar la base de datos' });
                } res.json(results);
                
            });
 
         
     } else if (token === 'admin') { 
         //como es admin entonces puede ver todos las tareas
         mysqlconnection.query('SELECT * FROM tasks', (error, results) => {
             if (error) {
                 return res.status(500).json({ message: 'Error al consultar la base de datos' });
             }
     
     
             res.json(results);
         });
     } else {
         res.status(401).json({ message: 'No estas autorizado o ha finalizado la sesion!!' });
         
     }


}

// se crea un endpoint para obtener todos los logs de la base de datos mongodb

const getLogs = async (req: Request, res: Response) => {
    try {
        // Conectar a la base de datos
        const client = new MongoClient(urlMDB);
        client.connect();
        const db = client.db();
        
        // Obtener la colección de logs
        const collection = db.collection("logs");


        // Obtener los logs
        const logs = await collection.find().toArray();
        res.json(logs);
    } catch (error) {
        console.error("Error obteniendo logs:", error);
        res.status(500).send("Error al obtener los logs.");
    } 
}

setupConnection();



// exportamos mis rutas de la aplicacion

export {
    index,
    createUser,
    login,
    getUserInfo,
    updateUserInfo,
    deleteUser,
    createProject,
    getProjects,
    assignTask,
    getTasks,
    getLogs

};
