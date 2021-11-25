const mysql = require('../mysql').pool
const bcrypt = require("bcryptjs")

exports.salvaPedido = (req, res, next) => {
    mysql.getConnection((error, conn) => {

        if (error) {
            return res.status('400').send({
                resposta: {
                    mensagem: 'Houve um erro ao processar sua requisição'
                }
            })
        }

        const token = req.headers.authorization.split(' ')[1]
        var today = new Date()
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate() + ' ' + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()

        const query = `INSERT INTO Pedidos ( idConta, idUsuario, dataHoraCadastro, dataHoraEdicao, numeroPedidoCliente, idCliente, permiteEdicao ) 
                            VALUES ( 
                                        ( SELECT idConta FROM Sessoes WHERE token = ? ), 
                                        ( SELECT idConta FROM Sessoes WHERE token = ? ), 
                                        ?, 
                                        NULL, 
                                        ?, 
                                        ?, 
                                        's' )`
        conn.query(query, [token, token, date, req.body.numeroPedidoCliente, req.body.idCliente], (error, result) => {
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
                    idPedido: result.insertId,
                    mensagem: 'Pedido cadastrado com sucesso'
                }
            })

        })

    })
}

exports.atualizaPedido = (req, res, next) => {

    mysql.getConnection((error, conn) => {

        if (error) {
            return res.status('400').send({
                resposta: {
                    mensagem: 'Houve um erro ao processar sua requisição'
                }
            })
        }

        const token = req.headers.authorization.split(' ')[1]
        var today = new Date()
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate() + ' ' + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()

        const query = `UPDATE Pedidos 
                            SET 
                                dataHoraEdicao = ?,
                                numeroPedidoCliente = ?,
                                idCliente = ? 
                            WHERE id=?`
        conn.query(query, [date, req.body.numeroPedidoCliente, req.body.idCliente, req.body.idPedido], (error, result) => {
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
                    mensagem: 'Pedido atualizado com sucesso'
                }
            })

        })

    })

}

exports.listaPedidos = (req, res, next) => {

    mysql.getConnection((error, conn) => {

        if (error) {
            return res.status('400').send({
                resposta: {
                    mensagem: 'Houve um erro ao processar sua requisição'
                }
            })
        }

        const token = req.headers.authorization.split(' ')[1]
        const textoPesquisa = '%' + req.body.textoPesquisa + '%'
        const query = `SELECT
                            Pedidos.id,
                            Clientes.nome,
                            Clientes.documento
                            FROM Pedidos
                            INNER JOIN Clientes ON Clientes.id = Pedidos.idCliente
                            WHERE Pedidos.idConta = ( SELECT idConta FROM Sessoes WHERE token = ? ) AND ( Clientes.nome LIKE ? OR numeroPedidoCliente LIKE ? ) ORDER BY dataHoraEdicao DESC`
        conn.query(query, [token, textoPesquisa, textoPesquisa], (error, results, fields) => {
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
            } else {
                return res.status(200).send({
                    resposta: {
                        mensagem: 'Pedidos listados com sucesso',
                        quantidadeRegistros: results.length,
                        pedidos: results
                    }
                })
            }

        })

    })
}