const express = require('express')
const bcrypt = require("bcryptjs")
const mysql = require('../mysql').pool
const router = express.Router()
const clientes = require('../controllers/clientes')
const validaSessao = require('../middleware/validaSessao')

router.post('/', validaSessao, clientes.salvaCliente )
router.get('/', validaSessao, clientes.listaClientes )

module.exports = router