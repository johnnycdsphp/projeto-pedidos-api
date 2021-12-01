const mysql = require('../mysql').pool
const bcrypt = require("bcryptjs")

exports.salvaItemPedido = (req, res, next) => {
    mysql.getConnection((error, conn) => {

        if (req.body.quantidade <= 0 ) {
            return res.status('200').send({
                resposta: {
                    codigoMensagem: '002',
                    mensagem: 'A quantidade deve ser maior que 0'
                }
            })
        }

        if (req.body.precoUnitario <= 0 ) {
            return res.status('200').send({
                resposta: {
                    codigoMensagem: '002',
                    mensagem: 'O preço deve ser maior que 0'
                }
            })
        }

        if (error) {
            return res.status('400').send({
                resposta: {
                    mensagem: 'Houve um erro ao processar sua requisição'
                }
            })
        }

        const token = req.headers.authorization.split(' ')[1]
        const query = `SELECT * FROM Produtos WHERE id = ?`
        conn.query(query, [ parseInt( req.body.idProduto )], (error, resultProduto) => {

            //console.log( resultProduto )
            if (error) {
                return res.status('500').send({
                    resposta: {
                        mensagem: 'Houve um erro ao processar sua requisição, provavelmente o documento já tenha sido cadastrado',
                        erro: error.sqlMessage //erro: error
                    }
                })
            }

            //Caso o preço seja fixo por produto e não aceita alteração
            if( resultProduto[0].permiteEdicaoPreco == 's' )
                precoUnitario = parseFloat( req.body.precoUnitario )
            else
                precoUnitario = parseFloat( resultProduto[0].precoUnitario )

            //Valida a quantidade caso tenha multiplo
            if (resultProduto[0].somenteMultiploDe != null) {

                if ((req.body.quantidade % resultProduto[0].somenteMultiploDe) != 0) {
                    return res.status('200').send({
                        resposta: {
                            idUsuario: resultProduto.insertId,
                            codigoMensagem: '002',
                            mensagem: 'O produto ' + resultProduto[0].nome + ' deve ser multiplo de ' + resultProduto[0].somenteMultiploDe + ', quantidade informada ' + req.body.quantidade
                        }
                    })
                }
            }
            const query = `INSERT INTO PedidoItens ( idPedido, idProduto, quantidade, regraMultiplo, precoUnitario, regraPermiteEdicaoPreco  ) VALUES ( ?, ?, ?, ?, ?, 's' )`
            conn.query(query, [req.body.idPedido, req.body.idProduto, parseInt( req.body.quantidade ), resultProduto[0].somenteMultiploDe, precoUnitario, resultProduto[0].permiteEdicaoPreco], (error, resultInsert) => {
                conn.release()
                if (error) {
                    return res.status('500').send({
                        resposta: {
                            codigoMensagem: '002',
                            mensagem: 'Houve um erro ao processar sua requisição, provavelmente o documento já tenha sido cadastrado',
                            erro: error.sqlMessage //erro: error
                        }
                    })
                }

                return res.status('200').send({
                    resposta: {
                        idUsuario: resultInsert.insertId,
                        codigoMensagem: '001',
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
                codigoMensagem: '002',
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
                            codigoMensagem: '002',
                            mensagem: 'Não foi possível excluir o item do pedido, provavél que o pedido já esteja fechado para edição',
                            erro: error.sqlMessage //erro: error
                        }
                    })
                }

                return res.status(200).send({
                    resposta: {
                        codigoMensagem: '001',
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
                            Produtos.nome,
                            Produtos.precoUnitario AS precoUnitarioProduto,
                            IF( PedidoItens.precoUnitario > Produtos.precoUnitario, 1, (
                                IF( ( Produtos.precoUnitario - ( ( Produtos.precoUnitario / 100 ) * PedidoItens.precoUnitario ) ) >= 10, 2, 3 )
                            ) ) AS rentabilidade 
                        
                                                    FROM PedidoItens
                                                    INNER JOIN Produtos ON Produtos.id = PedidoItens.idProduto
                                                    WHERE PedidoItens.idPedido = ? ORDER BY Produtos.nome;`
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

            if (results.length >= 0 ) {

                return res.status(200).send({
                    resposta: {
                        codigoMensagem: '001',
                        mensagem: 'Itens do pedido listados com sucesso',
                        quantidadeRegistros: results.length,
                        itensPedido: results
                    }
                })

            }else {
                return res.status(401).send({
                    resposta: {
                        codigoMensagem: '002',
                        mensagem: 'Os dados informados estão incorretos',
                        codigoErroTecnico: '001'
                    }
                })
            }

        })

    })

}