const e = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const index = (req, res) => {
    res.status(200).json({message: "Funcionando"})
}

const createUser = (req, res) => {
    //creamos el cuerpo de la peticion
    let body = req.body;
    
    let {name,email,password,role} = body;
    //creamos un objeto de usuario
    let user = {
        name,
        email,
        password: bcrypt.hashSync(password,10),
        role
    }
    //

    res.json(user);
    
}



module.exports = {
    index,
    createUser
}