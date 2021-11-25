const mysql = require('../mysql').pool
const bcrypt = require('bcrypt')

exports.salvaItemPedido = (req, res, next) => {
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

        const query = `SELECT * FROM Produtos WHERE id = ?`
        conn.query(query, [req.body.idProduto], (error, result) => {

            if (error) {
                return res.status('500').send({
                    resposta: {
                        mensagem: 'Houve um erro ao processar sua requisição, provavelmente o documento já tenha sido cadastrado',
                        erro: error.sqlMessage //erro: error
                    }
                })
            }

            //Caso o preço seja fixo por produto e não aceita alteração
            result[0].permiteEdicaoPreco == 's' ? precoUnitario = req.body.precoUnitario : precoUnitario = result[0].precoUnitario

            //Valida a quantidade caso tenha multiplo
            if (result[0].somenteMultiploDe != null) {

                if ((req.body.quantidade % result[0].somenteMultiploDe) != 0) {
                    return res.status('200').send({
                        resposta: {
                            idUsuario: result.insertId,
                            mensagem: 'O produto ' + result[0].nome + ' deve ser multiplo de ' + result[0].somenteMultiploDe + ', quantidade informada ' + req.body.quantidade
                        }
                    })

                }
            }
            const query = `INSERT INTO PedidoItens ( idPedido, idProduto, quantidade, regraMultiplo, precoUnitario, regraPermiteEdicaoPreco  ) VALUES ( ?, ?, ?, ?, ?, 's' )`
            conn.query(query, [req.body.idPedido, req.body.idProduto, req.body.quantidade, result[0].somenteMultiploDe, precoUnitario, result[0].permiteEdicaoPreco], (error, resultInsert) => {
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
                        idUsuario: resultInsert.insertId,
                        mensagem: 'Item do pedido cadastrado com sucesso'
                    }
                })

            })

        })

    })
}

exports.excluiItemPedido = (req, res, next) => {
    mysql.getConnection((error, conn) => {

        if (error) {
            return res.status('400').send({
                mensagem: 'Erro ao transferir os dados'
            })
        }
        conn.query(
            `DELETE T FROM PedidoItens T INNER JOIN Pedidos P ON P.id = T.idPedido WHERE T.id = ? AND P.permiteEdicao = 's'`,
            [req.body.id],
            (error, result) => {

                conn.release()
                if (error) {
                    return res.status('500').send({
                        resposta: {
                            mensagem: 'Não foi possível excluir o item do pedido, provavél que o pedido já esteja fechado para edição',
                            erro: error.sqlMessage //erro: error
                        }
                    })
                }

                return res.status(200).send({
                    resposta: {
                        mensagem: 'Item do pedido excluído com sucesso'
                    }
                })
            }
        )
    })
}

exports.listaItensPedido = (req, res, next) => {


    mysql.getConnection((error, conn) => {

        if (error) {
            return res.status('400').send({
                resposta: {
                    mensagem: 'Houve um erro ao processar sua requisição'
                }
            })
        }

        const token = req.headers.authorization.split(' ')[1]
        const query = `SELECT
                                PedidoItens.*,
                                Produtos.nome
                            FROM PedidoItens
                            INNER JOIN Produtos ON Produtos.id = PedidoItens.idProduto
                            WHERE PedidoItens.idPedido = ? ORDER BY Produtos.nome`
        conn.query(query, [req.body.idPedido], (error, results, fields) => {
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
                        mensagem: 'Itens do pedido listados com sucesso',
                        quantidadeRegistros: results.length,
                        itensPedido: results
                    }
                })
            }

        })

    })

}