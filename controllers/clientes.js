const mysql = require('../mysql').pool
const bcrypt = require("bcryptjs")

exports.salvaCliente = (req, res, next) => {
    mysql.getConnection((error, conn) => {

        if (error) {
            return res.status('400').send({
                resposta: {
                    mensagem: 'Houve um erro ao processar sua requisição'
                }
            })
        }

        const token = req.headers.authorization.split(' ')[1]
        const query = `INSERT INTO Clientes ( idConta, nome, documento ) VALUES ( ( SELECT idConta FROM Sessoes WHERE token = ? ), ?, ? )`
        conn.query(query, [ token, req.body.nome, req.body.documento ], (error, result) => {
            conn.release()
            if (error) {
                return res.status('500').send({
                    resposta: {
                        mensagem: 'Houve um erro ao processar sua requisição, provavelmente o documento já tenha sido cadastrado',
                        erro: error.sqlMessage //erro: error
                    }
                })
            }

            return res.status('200').send({
                resposta: {
                    idCliente: result.insertId,
                    mensagem: 'Cliente cadastrado com sucesso'
                }
            })

        })
    
    })
}

exports.listaClientes = (req, res, next) => {

    mysql.getConnection((error, conn) => {

        if (error) {
            return res.status('400').send({
                resposta: {
                    mensagem: 'Houve um erro ao processar sua requisição'
                }
            })
        }

        const token = req.headers.authorization.split(' ')[1]
        const query = 'SELECT * FROM Clientes WHERE idConta = ( SELECT idConta FROM Sessoes WHERE token = ? ) AND nome LIKE ? ORDER BY nome'
        conn.query(query, [token, '%'+req.body.textoPesquisa+'%'], (error, results, fields) => {
            conn.release()
            if (error) {
                return res.status(500).send({
                    resposta: {
                        mensagem: 'Houve um erro ao processar sua requisição',
                        erro: error
                    }
                })
            }

            if (results.length < 1) {
                return res.status(401).send({
                    resposta: {
                        mensagem: 'Os dados informados estão incorretos',
                        codigoErroTecnico: '001'
                    }
                })
            }else{
                return res.status(200).send({
                    resposta: {
                        mensagem: 'Clientes listados com sucesso',
                        quantidadeRegistros: results.length,
                        clientes: results
                    }
                })
            }

        })

    })
}