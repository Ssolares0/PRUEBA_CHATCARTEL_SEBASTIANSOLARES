import mysql, { RowDataPacket } from 'mysql2';
import mongoose from 'mongoose';

//url de mi base de datos mongoDB
const urlMDB = "mongodb+srv://solares:Pennywise2@cluster0.v1qki.mongodb.net/logs_db?retryWrites=true&w=majority&appName=Cluster0";

// Configuración de la conexión a la base de datos mysql
const mysqlconnection = mysql.createConnection({
    host: '34.41.84.53',
    user: 'root',
    password: 'solares123',
    database: 'chatcartel_db'
}); 

// Función para conectar a la base de datos MySQL

const connectToMySQL = () => {
    return new Promise<void>((resolve, reject) => {
        mysqlconnection.connect((error) => {
            if (error) {
                reject("Error en la conexión a la base de datos MySQL: " + error);
            } else {
                console.log("Conexión a MySQL exitosa");
                resolve();
            }
        });
    });
};

//funcion para conectar a mongodb

const connectToMongoDB = async () =>  {

    try{
        await mongoose.connect(urlMDB);
        console.log("Conectado a la base de datos mongoDB");
    }catch (error){
        console.error("Error al conectar a la base de datos:", error);
    }

}




export {mysqlconnection, connectToMySQL, connectToMongoDB};