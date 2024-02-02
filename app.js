var ourPort = "9022";
var ourUrl = "wss://ecv-etic.upf.edu/node/"+ourPort+"/ws/";
// ourUrl = "wss://"+location.host;

var express = require ('express');
var expressWs = require('express-ws');
var app = expressWs(express()).app;
var url = require('url')

var MyApp = require('./app');


var App = {
  init: function()
  {

  },
  onUserConnected:function(ws)
  {

  },
  onUserMessage:function(ws,msg)
  {
    console.log(msg);
    
  },
  onUserDisconnected:function(ws)
  {
    
  }
}