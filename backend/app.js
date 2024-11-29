const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

var corsOptions = {
    origin : "*"

}

app.use(morgan('dev'));
app.use(express.json());
app.use(cors(corsOptions));




//rutas
const indexRoutes = require('./routes/index.routes.js');

// esta ruta es para una prueba de la base de datos


app.use('/', indexRoutes);



//default
app.use((req,res,next) => {
    res.status(404).json("No se encontro la ruta");

});
module.exports = app;