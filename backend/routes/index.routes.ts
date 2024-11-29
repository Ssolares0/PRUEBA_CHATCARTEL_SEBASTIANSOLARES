const express = require('express');
const router = express.Router();

// Importamos  index controller
const indexController = require('../controller/index.controller');
import { autenticarUsuario } from '../autenticacion/middleware';

//estas son mis rutas de la aplicacion
router.get('/', indexController.index);

router.post('/users',indexController.createUser);

router.post('/auth/login',indexController.login);

router.get('/users/:id',autenticarUsuario,indexController.getUserInfo);



export default router;