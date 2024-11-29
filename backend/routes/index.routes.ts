const express = require('express');
const router = express.Router();

// Importamos  index controller
const indexController = require('../controller/index.controller');

//estas son mis rutas de la aplicacion
router.get('/', indexController.index);

router.post('/users',indexController.createUser);

router.post('/auth/login',indexController.login);

router.get('/users/:id',indexController.getUserInfo);



export default router;