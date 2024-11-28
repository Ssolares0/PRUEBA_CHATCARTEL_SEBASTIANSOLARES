const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mysql = require('mysql2');

const app = express();

var corsOptions = {
    origin : "*"

}

app.use(morgan('dev'));
app.use(express.json());
app.use(cors(corsOptions));

// s
//conexion a la base de datos
const connection = mysql.createConnection({
    host: '127.0.0.1',  // Cambia esto por tu host de MySQL
    user: 'root',       // Tu usuario de MySQL
    password: 'solares',       // Tu contraseña de MySQL
    database: 'mysql-container'  // Nombre de tu base de datos
  });

// probamos la conexion
connection.connect(error => {
    if (error){
        console.log("Error en la conexion a la base de datos",error);
    } else {
        console.log("Conexion a la base de datos exitosa");
    }
  });
//rutas
const indexRoutes = require('./routes/index.routes.js');

// esta ruta es para una prueba de la base de datos


app.use('/', indexRoutes);



//default
app.use((req,res,next) => {
    res.status(404).json("No se encontro la ruta");

});
module.exports = app;