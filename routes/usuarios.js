const express = require('express')
const bcrypt = require('bcrypt')
const mysql = require('../mysql').pool
const router = express.Router()
const usuarios = require('../controllers/usuarios')

router.post('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {

        if (error) {
            return res.status('400').send({
                resposta: {
                    mensagem: 'Houve um erro ao processar sua requisição'
                }
            })
        }

        bcrypt.hash(req.body.senha, 10, (error, hash) => {

            if (error) {
                return res.status('400').send({
                    resposta: {
                        mensagem: 'Houve um erro ao processar sua requisição'
                    }
                })
            }

            const query = `INSERT INTO Usuarios ( idConta, nome, email, senha ) VALUES ( ?, ?, ?, ? )`
            conn.query(query, [req.body.idConta, req.body.nome, req.body.email, hash], (error, result) => {
                conn.release() //Fecha a conexão
                if (error) {
                    return res.status('500').send({
                        resposta: {
                            mensagem: 'Houve um erro ao processar sua requisição',
                            erro: error
                        }
                    })
                }

                return res.status('200').send({
                    resposta: {
                        idUsuario: result.insertId,
                        mensagem: 'Usuário cadastrado com sucesso'
                    }
                })

            })

        })

    })
});

router.post('/autenticaUsuario', usuarios.autenticaUsuario);

module.exports = router