'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const xhub = require('express-x-hub');
const app = express();

const PORT = process.env.PORT || 8080;

app.use(xhub({algorithm: 'sha1', secret: process.env.APP_SECRET }));
app.use(bodyParser.json());

var received_updates = [];

app.get('/', function(req, res) {
  res.send('<pre>' + JSON.stringify(received_updates, null, 2) + '</pre>');
});

app.get('/webhooks', function(req, res) {
  if (req.param('hub.mode') != 'subscribe'
      || req.param('hub.verify_token') != process.env.VERIFY_TOKEN) {
    res.sendStatus(401);
    return;
  }

  res.send(req.param('hub.challenge'));
});

app.post('/webhooks', function(req, res) {
  if (!req.isXHubValid()) {
    console.log('Received webhooks update with invalid X-Hub-Signature');
    res.sendStatus(401);
    return;
  }
  console.log(JSON.stringify(req.body, null, 2));
  received_updates.unshift(req.body);
  res.sendStatus(200);
});

app.listen(PORT, function() {
  console.log('Starting webhooks server listening on port:' + PORT);
});