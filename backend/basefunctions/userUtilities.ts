import { RowDataPacket } from 'mysql2';
import { mysqlconnection } from '../basefunctions/conections';
import { User ,Project} from '../interfaces/interfaces';
import { OkPacket } from 'mysql2';
import { MongoClient } from 'mongodb';

const urlMDB = "mongodb+srv://solares:Pennywise2@cluster0.v1qki.mongodb.net/logs_db?retryWrites=true&w=majority&appName=Cluster0";


const validateUserData = (body: any) => {
    if (!body.username || !body.password || !body.name) {
        return { valid: false, message: 'Faltan campos obligatorios: username, password o name' };
    }
    return { valid: true };
};

const userExists = async (username: string): Promise<boolean> => {
    const [results] = await mysqlconnection.promise().query<RowDataPacket[]>('SELECT * FROM Users WHERE username = ?', [username]);
    return results.length > 0;
};
const insertUser = async (user: User) => {
    const [result] = await mysqlconnection.promise().query('INSERT INTO Users SET ?', user);
    return result;
};

const updateUserInfos = async (id: string, name: string, username: string): Promise<any> => {
    try {
        const [results] = await mysqlconnection.promise().query<OkPacket>(
            'UPDATE Users SET name = ?, username = ? WHERE id_user = ?',
            [name, username, id]
        );

        // Verificar si se realizó alguna actualización
        if ((results as OkPacket).affectedRows === 0) {
            throw new Error('No se pudo actualizar el usuario');
        }


        return results; // Retornar los resultados de la actualización
    } catch (error) {
        throw new Error(`Error al actualizar los datos: ${error}`);
    }
};


const getUserId = async (username: string): Promise<number | null> => {
    const [results] = await mysqlconnection.promise().query<RowDataPacket[]>('SELECT id_user FROM Users WHERE username = ?', [username]);
    return results.length > 0 ? results[0].id_user : null;
};

const getAlldata = async (username: string): Promise<User | null> => {
    const [results] = await mysqlconnection.promise().query<RowDataPacket[]>('SELECT * FROM Users WHERE username = ?', [username]);

    // Verificamos si no hay resultados
    if (results.length === 0) {
        return null;  // Si no hay resultados, retornamos null
    }


    const user = results[0];

    //retornamos como un objeto de tipo User
    if (user && user.id_user && user.name && user.username && user.password && user.id_role) {
        return user as User;
    }

    return null;  // Si alguna propiedad falta, retornamos null
};

const getUserById = async (id: string): Promise<User | null> => {


    const [results] = await mysqlconnection.promise().query<RowDataPacket[]>('SELECT * FROM Users WHERE id_user = ?', [id]);

    // Si no se encuentra el usuario
    if (results.length === 0) {
        return null;  // Si no hay resultados, retornamos null
    }

    const datos = results[0];
    // Retornar el primer resultado, que es el usuario encontrado
    return datos as User;

};

const deleteUserById = async (id: string): Promise<any> => {

    const [results] = await mysqlconnection.promise().query<OkPacket>('DELETE FROM Users WHERE id_user = ?', [id]);
    return results;

}

const createProjects = async (name_project: string, created_time: string, id_user: number): Promise<boolean> => {

    const [results] = await mysqlconnection.promise().query<OkPacket>(
        'INSERT INTO Projects SET ?',
        { name_project, created_time, id_user }
    );

    if ((results as OkPacket).affectedRows === 0) {
        return false;
    }

    return true; // Devuelve el resultado de la inserción

};

const getProjectbyId = async (id: string): Promise<Project | null> => {


    const [results] = await mysqlconnection.promise().query<RowDataPacket[]>('SELECT * FROM Projects WHERE id_user = ?', [id]);

    // Si no se encuentra el usuario
    if (results.length === 0) {
        return null;  // Si no hay resultados, retornamos null
    }

    const project = results[0];
    // Retornar el primer resultado, que es el usuario encontrado
    return project as Project;

};

const getAllProjects = async (): Promise<Project[]> => {
    const [results] = await mysqlconnection
        .promise()
        .query<RowDataPacket[]>('SELECT * FROM Projects');

    return results as Project[]; // Asegúrate de que la interfaz Project coincida con la estructura de los datos
};

const projectExists = async (id: string): Promise<boolean> => {
    const [results] = await mysqlconnection.promise().query<RowDataPacket[]>('SELECT * FROM Projects WHERE id_project = ?', [id]);
    // Verificar si 
    return results.length > 0;

}



const setTask = async (task_name: string, status: string,id_user:string,due_date:string,id_project:string): Promise<boolean> => {
    const [results] = await mysqlconnection.promise().query<OkPacket>(
        'INSERT INTO Tasks SET ?',
        { task_name, status, id_user, due_date, id_project }
    );

    if ((results as OkPacket).affectedRows === 0) {
        return false;
    }

    return true; // Devuelve el resultado de la inserción
}

const getLogsMongo = async (): Promise<any[]> => {
    const client = new MongoClient(urlMDB);
    try {
        await client.connect(); // Conectar a MongoDB
        const db = client.db(); // Base de datos predeterminada
        const collection = db.collection("logs"); // Nombre de la colección
        return await collection.find().toArray(); // Obtener todos los logs como un arreglo
    } catch (error) {
        console.error("Error obteniendo logs desde la base de datos:", error);
        throw new Error("No se pudieron obtener los logs.");
    } finally {
        await client.close(); // Asegura cerrar la conexión
    }
};


export {
    validateUserData,
    userExists,
    insertUser,
    getUserId,
    getAlldata,
    getUserById,
    updateUserInfos,
    deleteUserById,
    createProjects,
    getProjectbyId,
    getAllProjects,
    setTask,
    projectExists,
    getLogsMongo
};