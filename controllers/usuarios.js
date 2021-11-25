const mysql = require('../mysql').pool
const bcrypt = require('bcrypt')

exports.salvaUsuario = (req, res, next) => {
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
                            mensagem: 'Houve um erro ao processar sua requisição, provavelmente o email já tenha sido cadastrado',
                            //erro: error
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
}

exports.autenticaUsuario = (req, res, next) => {

    mysql.getConnection((error, conn) => {

        if (error) {
            return res.status('400').send({
                resposta: {
                    mensagem: 'Houve um erro ao processar sua requisição'
                }
            })
        }

        const query = 'SELECT * FROM Usuarios WHERE email = ?'
        conn.query(query, [req.body.email], (error, results, fields) => {

            if (error) {
                return res.status('500').send({
                    resposta: {
                        mensagem: 'Houve um erro ao processar sua requisição',
                        erro: error
                    }
                })
            }

            if (results.length < 1) {
                return res.status('401').send({
                    resposta: {
                        mensagem: 'Os dados informados estão incorretos',
                        codigoErroTecnico: '001'
                    }
                })
            }

            bcrypt.compare(req.body.senha, results[0].senha, (errorBcrypt, result) => {

                if (result) {
                    var today = new Date()
                    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate() + ' ' + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()

                    bcrypt.hash(req.body.email + date, 10, (error, hash) => {

                        const queryUpdate = `UPDATE Sessoes SET dataHoraFim=? WHERE idUsuario = ? AND dataHoraFim IS NULL`
                        conn.query(queryUpdate, [date, results[0].id], (errorUpdate, resultsUpdateSessoes) => {

                            if (errorUpdate) {
                                return res.status('500').send({
                                    resposta: {
                                        mensagem: 'Os dados informados estão incorretos',
                                        codigoErroTecnico: '003',
                                        erro: errorUpdate
                                    }
                                })
                            }

                            date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate() + ' ' + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
                            const queryInsert = `INSERT INTO Sessoes ( idConta, idUsuario, token, dataHoraInicio ) VALUES ( ?, ?, ?, ? )`

                            conn.query(queryInsert, [results[0].idConta, results[0].id, hash, date, 'NULL'], (errorInsert, resultsInsertSessoes) => {
                                conn.release() //Fecha a conexão
                                if (errorInsert) {
                                    return res.status('401').send({
                                        resposta: {
                                            mensagem: 'Erro interno',
                                            codigoErro: '002'
                                        }
                                    })
                                }

                                return res.status('200').send({
                                    resposta: {
                                        mensagem: 'Usuário autenticado com sucesso',
                                        token: hash
                                    }
                                })

                            })

                        })
                    })
                } else {
                    return res.status('401').send({
                        resposta: {
                            mensagem: 'Os dados informados estão incorretos',
                            codigoErroTecnico: '005'
                        }
                    })
                }

            })

        })

    })
}