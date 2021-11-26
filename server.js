var fs = require('fs');
var http = require('http');
var https = require('https');
const app = require('./app')

var privateKey  = fs.readFileSync('/var/lib/jelastic/keys/projeto-pedidos-api.jelastic.saveincloud.net.key', 'utf8');
var certificate = fs.readFileSync('/var/lib/jelastic/keys/projeto-pedidos-api.jelastic.saveincloud.net.cer', 'utf8');

var credentials = {key: privateKey, cert: certificate};
var express = require('express');
var app = express();

// your express configuration here

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(3000);
httpsServer.listen(8443);