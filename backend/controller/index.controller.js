const e = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');



const index = (req, res) => {
    res.status(200).json({message: "Funcionando"})
}

//conexion a la base de datos
const connection = mysql.createConnection({
    host: 'localhost',  
    user: 'root',       // usuario de mysql
    password: 'solares',       // contraseña de MySQL
    database: 'chatcartel_db'  // nombre de la db
  });

// probamos la conexion
connection.connect(error => {
    if (error){
        console.log("Error en la conexion a la base de datos",error);
    } else {
        console.log("Conexion a la base de datos exitosa");
    }
  });

const createUser = (req, res) => {
    //creamos el cuerpo de la peticion
    let body = req.body;
    

    //validamos los campos
    console.log(body.username);

    if(body.username == null || body.password == null || body.name == null){
        res.json("Existe un error en los datos");
    } else {
        // si no existe ningun error seguimos
        var user = {
            id_user : null,
            name : body.name,
            username: body.username ,
            password: body.password,
            id_role: 2
            

        }

        //verificamos si el usuario ya existe en la db
        connection.query('SELECT * FROM users WHERE username = ?',[user.username],(error,results,fields) => {
            if(results.length > 0){
                res.json("El usuario ya existe, Prueba con otro username");
            } else {
                // si no existe el usuario lo insertamos en la db
                connection.query('INSERT INTO users SET ?', user, function(err, result) {
                    //si existe un error lo mostramos
                    if (err) {
                        console.log("Existe un error al insertar los datos en la tabla",err);
                        res.json("Existe un error al insertar los datos en la tabla");
    
                    } else {
                        //si no existe ningun error redirigimos al login
                        res.json("Usuario creado exitosamente");
                        //res.redirect('/login');
                    }
                })
            }
        });
    }

    
}

//creamos nuestra funcion para login


const login = (req,res) => {

    let body = req.body;
    let {email,password} = body;

    //buscamos el usuario en la base de datos
    

    //creamos el token
    let token = jwt.sign({
        user
    },'secret',{expiresIn: 60*60*24});

    res.json({
        user,
        token
    });
}




module.exports = {
    index,
    createUser,
    login
}