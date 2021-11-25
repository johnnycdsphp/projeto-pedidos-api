const mysql = require('../mysql').pool
const bcrypt = require('bcrypt')

exports.salvaProduto = (req, res, next) => {
    mysql.getConnection((error, conn) => {

        if (error) {
            return res.status('400').send({
                resposta: {
                    mensagem: 'Houve um erro ao processar sua requisição'
                }
            })
        }

        const token = req.headers.authorization.split(' ')[1]
        const query = `INSERT INTO Produtos ( idConta, nome, precoUnitario, permiteEdicaoPreco, somenteMultiploDe ) VALUES ( ( SELECT idConta FROM Sessoes WHERE token = ? ), ?, ?, ?, ? )`
        conn.query(query, [ token, req.body.nome, req.body.precoUnitario, req.body.permiteEdicaoPreco, req.body.somenteMultiploDe ], (error, result) => {
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
                    idUsuario: result.insertId,
                    mensagem: 'Produto cadastrado com sucesso'
                }
            })

        })
    
    })
}

exports.listaProdutos = (req, res, next) => {

    mysql.getConnection((error, conn) => {

        if (error) {
            return res.status('400').send({
                resposta: {
                    mensagem: 'Houve um erro ao processar sua requisição'
                }
            })
        }

        const token = req.headers.authorization.split(' ')[1]
        const query = `SELECT * FROM Produtos WHERE idConta = ( SELECT idConta FROM Sessoes WHERE token = ? ) AND nome LIKE ? ORDER BY nome`
        conn.query(query, [token, '%'+req.body.textoPesquisa+'%' ], (error, results, fields) => {

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
                        mensagem: 'Produtos listados com sucesso',
                        quantidadeRegistros: results.length,
                        produtos: results
                    }
                })
            }

        })

    })
}