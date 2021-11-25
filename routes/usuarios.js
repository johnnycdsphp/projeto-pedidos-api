const express = require('express')
const bcrypt = require('bcrypt')
const mysql = require('../mysql').pool
const router = express.Router()
const usuarios = require('../controllers/usuarios')
const validaSessao = require('../middleware/validaSessao')

router.post('/', validaSessao, usuarios.salvaUsuario )
router.post('/autenticaUsuario', usuarios.autenticaUsuario)

module.exports = router