const express = require('express')
const bodyParser = require('body-parser')
var cors = require('cors')

const app = express()

//CORS
// app.use((req, res, next) => {

//     res.header('Access-Control-Allow-Origin', '*')
//     res.header('Access-Control-Allow-Header', '*')

//     if (req.method === 'OPTIONS') {
//         res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH')
//         return res.status(200).send({})
//     }

//     next()
// })

app.use(cors())

const routerUsuarios = require('./routes/usuarios')
const routerClientes = require('./routes/clientes')
const routerProdutos = require('./routes/produtos')
const routerPedidos = require('./routes/pedidos')
const routerItensPedido = require('./routes/itensPedido')

app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())

app.use('/usuarios', routerUsuarios)
app.use('/clientes', routerClientes)
app.use('/produtos', routerProdutos)
app.use('/pedidos', routerPedidos)
app.use('/itensPedido', routerItensPedido)

app.use((req, res, next) => {
    const erro = new Error('Rota não encontrada')
    erro.status = 404
    next(erro)
})

app.use((error, req, res, next) => {
    res.status(error.status || 500)
    return res.send({
        mensagem: error.message,
        status: error.status
    })
})

module.exports = app