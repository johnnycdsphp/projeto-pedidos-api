const express = require('express')
const bcrypt = require("bcryptjs")
const mysql = require('../mysql').pool
const router = express.Router()
const itensPedido = require('../controllers/itensPedido')
const validaSessao = require('../middleware/validaSessao')

router.post('/', validaSessao, itensPedido.salvaItemPedido )
router.delete('/', validaSessao, itensPedido.excluiItemPedido )
router.get('/', validaSessao, itensPedido.listaItensPedido )

module.exports = router