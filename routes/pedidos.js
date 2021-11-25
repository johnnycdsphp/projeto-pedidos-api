const express = require('express')
const bcrypt = require("bcryptjs")
const mysql = require('../mysql').pool
const router = express.Router()
const pedidos = require('../controllers/pedidos')
const validaSessao = require('../middleware/validaSessao')

router.post('/', validaSessao, pedidos.salvaPedido )
router.put('/', validaSessao, pedidos.atualizaPedido )
router.get('/', validaSessao, pedidos.listaPedidos )

module.exports = router