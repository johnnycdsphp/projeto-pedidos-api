const mysql = require('../mysql').pool

module.exports = (req, res, next) => {

    mysql.getConnection((error, conn) => {

        if (error) {
            return res.status(400).send({
                resposta: {
                    mensagem: 'Houve um erro ao validar a sessão',
                    codigoErroTecnico: '008'
                }
            })
        }

        const token = req.headers.authorization.split(' ')[1]
        try {
            conn.query(
                'SELECT * FROM Sessoes WHERE token = ? AND dataHoraFim IS NULL',
                [token],
                (errorSelect, result) => {
                    conn.release()
                    if (errorSelect) {
                        return res.status(400).send({
                            resposta: {
                                mensagem: 'Houve um erro ao validar a sessão',
                                codigoErroTecnico: '008'
                            }
                        })
                    }

                    if (result.length > 0) {
                        next()
                    } else {
                        return res.status(500).send({
                            resposta: {
                                mensagem: 'Sessão não autorizada ou encerrada',
                                codigoErroTecnico: '007'
                            }
                        })
                    }

                }
            )

        } catch (error) {
            return res.status(500).send({
                resposta: {
                    mensagem: 'Sessão não autorizada ou encerrada',
                    codigoErroTecnico: '007',
                    erro: error
                }
            })
        }
    })

}