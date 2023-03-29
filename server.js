const http = require('http');
const url = require('url');
const { google } = require('googleapis');

global.oauth2Client = null;
global.FE_URL = "http://localhost:3000";

var server = http.createServer(function (req, res) {
  try {
    var urlParam = url.parse(req.url, true);
    var pathName = urlParam.pathname;
    console.log("Path: " + pathName);

    if (pathName == "/") {
      global.var = global.var + 1;
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Welcome to NodeJS Server!');
    }

    if (pathName == "/auth") {
      global.oauth2Client = new google.auth.OAuth2(
        "977462403956-mdiaujiv1gv0gag60418r4pk9tod3gqk.apps.googleusercontent.com",
        "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",
        "http://localhost:8080/authcallback"
      );

      const url = global.oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: "https://www.googleapis.com/auth/gmail.readonly"
      });

      res.writeHead(301, { "Location": url });
      res.end();
    }

    if (pathName == "/authcallback") {
      var query = urlParam.query;
      var authCode = query.code;

      if (query.error == undefined && authCode != undefined) {
        initToken(authCode);
        res.writeHead(301, { 'Location': global.FE_URL + '?accessCode=' + authCode });
        res.end();
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: "failure", message: query.error }));
      }
    }

    if (pathName == "/messages") {
      loadMessages(global.oauth2Client, function (data) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ data: data }));
      });
    }

    if (pathName == "/labels") {
      loadLabels(global.oauth2Client, function (data) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ data: data }));
      });
    }

    if (pathName == "/threads") {
      loadThreads(global.oauth2Client, function (data) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ data: data }));
      });
    }
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server has encountered an error: ' + err + ". Please try again!");
  }
});
server.listen(8080);

console.log("Server is now running at port 8080!");

async function initToken(code) {
  const { tokens } = await global.oauth2Client.getToken(code)
  global.oauth2Client.setCredentials(tokens);
}

async function loadLabels(auth, callback) {
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.labels.list({
    userId: 'me',
  });
  var labels = res.data.labels;
  console.log("Labels: " + JSON.stringify(labels));
  callback(labels);
}

async function loadThreads(auth, callback) {
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.threads.list({
    userId: 'me',
  });
  var threads = res.data.threads;
  console.log("Threads: " + JSON.stringify(threads));
  callback(threads);
}

async function loadMessages(auth, callback) {
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.messages.list({
    userId: 'me',
  });
  var messages = res.data.messages;
  //console.log("Messages: " + JSON.stringify(messages));
  callback(messages);
}

async function loadHistories(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.history.list({
    userId: 'me',
  });
  var histories = res.data.histories;
  console.log("Histories: " + JSON.stringify(histories));
}