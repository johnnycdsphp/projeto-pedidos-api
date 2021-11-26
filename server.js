const fs = require("fs")
const http = require('http')
const app = require('./app')

const port = process.env.PORT || 3000

const options = {
    key: fs.readFileSync("server.key"),
    cert: fs.readFileSync("server.cert")
};

const server = http.createServer(options, app)

server.listen(port)