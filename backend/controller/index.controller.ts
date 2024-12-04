import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { mysqlconnection, connectToMySQL, connectToMongoDB } from '../basefunctions/conections';
import { generateToken, comparePassword, hashPassword, verificarTk } from '../autenticacion/auth';
import { UserRequestBody, User, LoginRequestBody } from '../interfaces/interfaces';

import {
    validateUserData, userExists, insertUser,
    getUserId, getAlldata, getUserById, updateUserInfos,
    deleteUserById, createProjects, getProjectbyId,getAllProjects,setTask,getLogsMongo } from '../basefunctions/userUtilities';

import registerLog from '../models/registerLog';

//almacenar el token
let globalToken: string = '';
let isAdmin: boolean = false;


// Función para la ruta index
const index = (req: Request, res: Response): void => {
    res.status(200).json({ message: "Funcionando" });
}

// Función para establecer las conexiones a las bases de datos
const setupConnection = async () => {

    try {
        //tratemos de conectar a la base de datos mysql
        await connectToMySQL();

        //tratamos de conectar a la base de datos mongoDB
        await connectToMongoDB();


    } catch (error) {
        console.error("No se pueden establecer las conexiones de las BD", error);
    }

}



// endpoint para crear un nuevo usuario
const createUser = async (req: Request, res: Response) => {
    const body: UserRequestBody = req.body;

    // Validamos los campos
    console.log(body.username);

    const validamos = validateUserData(body);

    if (!validamos.valid) {
        res.status(401).json({ message: validamos.message });
    }
    try {
        // Verificar si el usuario ya existe
        const existe = await userExists(body.username);
        if (existe) {
            return res.status(401).json({ message: 'El usuario ya existe, prueba con otro username' });
        }

        //encriptamos la contraseña
        const hashedPassword = await hashPassword(body.password);

        const user: User = {
            id_user: null,
            name: body.name,
            username: body.username,
            password: hashedPassword,
            id_role: 2
        };

        await insertUser(user);

        // Obtener el id del usuario recién creado
        const userId = await getUserId(body.username);
        if (userId) {
            // Registrar el log
            registerLog(userId.toString(), "CREATE", "USER")
                .then(() => console.log("Log registrado"))
                .catch((err) => console.error("Error al registrar log:", err));
        }

    } catch (error) {
        console.error("Error al crear el usuario:", error);
        res.status(500).json({ message: 'Error al crear el usuario' });
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

        try {
            // Verificar si el usuario ya existe
            const existe = await userExists(username);

            if (!existe) {
                return res.status(401).json({ message: 'Usuario no encontrado' });
            }
            //como si existe entonces obtenemos los datos del usuario
            const user = await getUserId(username);
            if (user === 1 && username === 'admin' && password === 'admin') {
                globalToken = "admin";
                // Responder con el token
                res.json({
                    message: 'Autenticación exitosa Como Administrador!!',

                });

            } else {
                //como no es administrador verificamos el password con bcrypt
                isAdmin = false;

                const user = await getAlldata(username);


                // Comparamos la contraseña ingresada con el hash almacenado en la base de datos
                const ismatch = await bcrypt.compare(password, user?.password || '');

                if (!ismatch) {
                    return res.status(401).json({ message: ' Usuario o Contraseña incorrecta' });
                }

                // como las credenciales son correctas generamos el token
                const payload = {
                    id_user: user?.id_user,
                    name: user?.name,
                    username: user?.username,
                    id_role: user?.id_role
                };

                const token = generateToken(payload);

                //guardamos el token en una variable global
                globalToken = token;
                // Responder con el token
                res.json({
                    message: `Bienvenido ${username}!!`,

                });

            }

        } catch (error) {
            console.error("Error al verificar si el usuario existe:", error);
            res.status(500).json({ message: 'Error al verificar si el usuario existe' });


        }


    }

}

// endpoint para obtener informacion del usuario autenticado
const getUserInfo = async (req: Request, res: Response) => {
    // Verificar si el token es válido
    const token = globalToken;

    //con la funcion verificarTk verificamos si el token es valido
    const decoded = verificarTk(token);

    if (decoded) {
        //como si esta autorizado entonces obtenemos el id del usuario
        const { id } = req.params; //obtengo el id de los parametros

        //verificamos si el id de los parametros  es igual al id del usuario autenticado

        if (id.toString() !== decoded.id_user.toString()) {
            res.status(401).json({ message: 'El id no coincide con el usuario logeado' });
            return;
        }

        const user = await getUserById(id);

        console.log(user);

        res.json(user);

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
    const { name, username } = req.body;

    if (!name || !username) {
        return res.status(401).json({ message: 'Los campos name y username son obligatorios' });
    }

    // Verificar si el token es válido
    const token = globalToken;

    //con la funcion verificarTk verificamos si el token es valido
    const decoded = verificarTk(token);

    if (decoded) {

        //verificamos si el id de los parametros  es igual al id del usuario autenticado

        if (id.toString() === decoded.id_user.toString()) {

            updateUserInfos(id.toString(), name, username)


            registerLog(id.toString(), "UPDATE", "USER")
                .then(() => console.log("Log registrado"))
                .catch((err) => console.error("Error al registrar log:", err));


            res.json({ message: 'Datos actualizados correctamente' });

        } else {
            res.status(400).json({ message: 'El id no coincide con el usuario logeado' });
        }

    } else if (token === 'admin') {
        //como es admin entonces puede modificar todos los usuarios
        updateUserInfos(id.toString(), name, username)
        // Registrar el log 
        registerLog("1", "UPDATE", "USER")
            .then(() => console.log("Log registrado"))
            .catch((err) => console.error("Error al registrar log:", err));




        res.json({ message: 'Datos actualizados correctamente' });

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

        if (!id) {
            return res.status(401).json({ message: 'ERROR: El id es obligatorio' });
        } else if (id === '1') {
            return res.status(401).json({ message: 'ERROR: No puedes eliminar al administrador' });
        }
        //funcion para eliminar el usuario solo si eres administrador
        deleteUserById(id);

        registerLog("1", "DELETE", "USER")
            .then(() => console.log("Log registrado"))
            .catch((err) => console.error("Error al registrar log:", err));


        res.status(200).json({ message: 'Usuario eliminado correctamente' });


    } else {
        res.status(401).json({ message: 'ERROR: No estas autorizado o ha finalizado la sesion!!' });
    }
}

// endpoint para crar un proyecto
const createProject = async (req: Request, res: Response) => {

    //obtenemos los datos del body
    const { name_project, id_user } = req.body;
    // Verificar si el token es válido
    const token = globalToken;

    //con la funcion verificarTk verificamos si el token es valido
    const decoded = verificarTk(token);

    // Obtengo la fecha actual  y la formateo
    const now = new Date();
    const created_time = now.toISOString().slice(0, 19).replace('T', ' ');


    //solo el administrador puede crearle projectos a los usuarios y tareas

    if (token === 'admin') {


        if (!name_project || !id_user) {
            return res.status(401).json({ message: 'Los campos name y id_user son obligatorios' });
        }

        //verificamos que el usuario exista

        const verifyUser = await getUserById(id_user);
        

       
        if (verifyUser!==null) {
            // como si existe insertamos los datos en la tabla projects
            const results = createProjects(name_project, created_time, id_user);

            // Registrar el log
            registerLog("1", "CREATE", "PROJECT")
            .then(() => console.log("Log registrado"))
            .catch((err) => console.error("Error al registrar log:", err));


            res.json({ message: 'Proyecto creado exitosamente al usuario ',results });


        }else{
            res.status(401).json({ message: 'El usuario al que se desea agregar el proyecto no existe' });
        }


    } else if (decoded) {

        if (id_user.toString() === decoded.id_user.toString()) {

            //verificamos que el usuario exista
            const verifyUser = await getUserById(id_user);
            if (verifyUser !== null) {
                // como si existe insertamos los datos en la tabla projects
                const results = createProjects(name_project, created_time, id_user);

                // Registrar el log
                registerLog(decoded.id_user.toString(), "CREATE", "PROJECT")
                    .then(() => console.log("Log registrado"))
                    .catch((err) => console.error("Error al registrar log:", err));


                res.json({ message: 'Proyecto creado exitosamente al usuario ', results });


            }


        }else{
            res.status(401).json({ message: 'El id no coincide con el usuario logeado' });
        }

    } else {
        res.status(401).json({ message: 'ERROR: No estas autorizado o ha finalizado la sesion!!' });
    }
}


//endpoint para obtener los projectos

const getProjects = async (req: Request, res: Response) => {
    // Verificar si el token es válido
    const token = globalToken;

    //con la funcion verificarTk verificamos si el token es valido
    const decoded = verificarTk(token);

    if (decoded) {

        let id = decoded.id_user.toString();
        if (decoded.id_user.toString() ) {

            const project = await getProjectbyId(id);

            res.json(project);
           
        } else {
            res.status(400).json({ message: 'El id no coincide con el id del usuario logeado' });
        }
    } else if (token === 'admin') {
        //como es admin entonces puede ver todos los proyectos
        const projects = await getAllProjects();
        res.json(projects);
    } else {
        res.status(401).json({ message: 'No estas autorizado o ha finalizado la sesion!!' });
    }
}


// endpoint para asignrar tareas a un proyecto especifico

const assignTask = async (req: Request, res: Response) => {

    const { id } = req.params;


    const { task_name, status, id_user, due_date } = req.body;

    // valido de  que los datos datos requeridos esten completos
    if (!task_name || !status || !id_user || !due_date) {
        return res.status(400).json({ message: 'ERROR: Todos los campos (task_name, status, id_user, due_date) son obligatorios!!.' });
    }
    // obtengo el token
    const token = globalToken;

    //solo el administrador puede asignar tareas a los usuarios

    if (token === 'admin') {
        //verificamos que el proyecto exista
        const verifyProject = await getProjectbyId(id_user);
        const id_project = id;
        if (verifyProject !== null) {
            //como si existe insertamos en la bd
            const insertTask = setTask(task_name, status, id_user, due_date, id_project);


            registerLog("1", "CREATE", "TASK")
            .then(() => console.log("Log registrado"))
            .catch((err) => console.error("Error al registrar log:", err));

            res.json({ message: 'Tarea Agregada Correctamente al proyecto del usuario ', insertTask });
        }else{
            res.status(401).json({ message: 'El proyecto al que se desea agregar la tarea no existe' });
        }

    } else {
        res.status(401).json({ message: 'ERROR: solo el admin puede agregar tareas a un proyecto o ha finalizado la sesion!!' });
    }



}

// endpoint para obtener las tareas de un proyecto especifico
const getTasks = (req: Request, res: Response) => {


    // Verificar si el token es válido
    const token = globalToken;

    //con la funcion verificarTk verificamos si el token es valido
    const decoded = verificarTk(token);

    if (decoded) {
        //como si esta autorizado entonces obtenemos el id del usuario
        const { id } = req.params; //obtengo el id de los parametros

        //verificamos si el id de los parametros  es igual al id del usuario autenticado

        
        mysqlconnection.query('SELECT * FROM Tasks WHERE id_project = ?', [id], (error, results) => {
            if (error) {
                return res.status(500).json({ message: 'Error al consultar la base de datos' });
            } res.json(results);

        });


    } else if (token === 'admin') {
        //como es admin entonces puede ver todos las tareas
        mysqlconnection.query('SELECT * FROM Tasks', (error, results) => {
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
        const logs = await getLogsMongo(); // llamamos a la función para obtener los logs
        res.json(logs); // Enviar los logs como respuesta
    } catch (error) {
        console.error("Error obteniendo logs:", error);
        res.status(500).send("Error al obtener los logs."); // Respuesta en caso de error
    }
}


//exportamos la funcion setupConnection
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
