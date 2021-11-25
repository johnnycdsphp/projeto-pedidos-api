const mysql = require('../mysql').pool
const bcrypt = require('bcrypt')

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
                        mensagem: 'Os dados informados estão incorretos'
                    }
                })
            }

            bcrypt.compare(req.body.senha, results[0].senha, (errorBcrypt, result) => {

                if (errorBcrypt) {
                    return res.status('401').send({
                        resposta: {
                            mensagem: 'Os dados informados estão incorretos',
                            codigoErro: '002'
                        }
                    })
                }

                if (result) {

                    var today = new Date();
                    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()+' '+today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                    
                    bcrypt.hash(req.body.email + date, 10, (error, hash) => {

                        const query = `UPDATE Sessoes SET dataHoraFim=? WHERE idUsuario = ? AND dataHoraFim IS NULL`
                        conn.query(query, [date, results[0].id], (error, results, fields) => {

                            if (error) {
                                return res.status('500').send({
                                    erro: error
                                })
                            }

                            const query = `INSERT INTO Sessoes ( idConta, idUsuario, token, dataHoraInicio ) VALUES ( ?, ?, ?, ? )`
                            conn.query(query, [1, 2, hash, '2021-11-24 19:13:15.000000'], (error, results, fields) => {

                                if (error) {
                                    return res.status('500').send({
                                        erro: error
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

                }



            })
        })

    })
}