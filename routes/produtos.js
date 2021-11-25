const express = require('express')
const bcrypt = require('bcrypt')
const mysql = require('../mysql').pool
const router = express.Router()
const produtos = require('../controllers/produtos')
const validaSessao = require('../middleware/validaSessao')

router.post('/', validaSessao, produtos.salvaProduto )
router.get('/', validaSessao, produtos.listaProdutos )

module.exports = router