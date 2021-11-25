const express = require('express')
const mysql = require('../mysql').pool
const router = express.Router()

router.get('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {

        if( error ){ return res.status('400').send({ mensagem:'Erro ao transferir os dados' }) }
        conn.query(
            'SELECT * FROM Produtos ORDER BY nome LIMIT 50',
            ( error, result, fields ) => {
                return res.status(200).send({
                    quantidadeRegistros: result.length,
                    resposta: result
                })
            }
        )
    })
})  
module.exports = router