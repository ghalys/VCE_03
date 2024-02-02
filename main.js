
var express = require ('express');
var expressWs = require('express-ws');
var app = expressWs(express()).app;
var url = require('url');

app.use(express.static('public'));

app.ws('/',funciton(ws,req){
  ws.on('message',  (msg)=>{
    
  })
})