const express = require('express');
const router = express.Router();

// Importamos  index controller
const indexController = require('../controller/index.controller.js');

//estas son mis rutas de la aplicacion
router.get('/', indexController.index);


module.exports = router;