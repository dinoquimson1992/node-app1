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
        initToken(authCode, function () {
          res.writeHead(301, { 'Location': global.FE_URL + '?accessCode=' + authCode });
          res.end();
        });
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
        var query = urlParam.query;
        var authCode = query.accessCode;

        initToken(authCode, function () {
          res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials' : true });
          res.write(JSON.stringify(data));
          res.end();
        });
      });
    }

    if (pathName == "/messages") {
      loadMessages(global.oauth2Client, function (data) {
        var query = urlParam.query;
        var authCode = query.accessCode;

        initToken(authCode, function () {
          res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials' : true });
          res.write(JSON.stringify(data));
          res.end();
        });
      });
    }
  } catch (err) {
    console.log(err);
  }
});
server.listen(8080);

console.log("Server is now running at port 8080!");

async function initToken(code, callback) {
  try {
    //console.log("credentials: " + JSON.stringify(global.oauth2Client.credentials));
    let credentials = JSON.stringify(global.oauth2Client.credentials);
    if (credentials == "{}") {
      const { tokens } = await global.oauth2Client.getToken(code)
      global.oauth2Client.setCredentials(tokens);
    }
    callback();
  } catch (err) {
    console.log(err);
  }
}

async function loadLabels(auth, callback) {
  try {
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.labels.list({
      userId: 'me',
    });
    var labels = res.data.labels;
    callback(labels);
  } catch (err) {
    console.log(err);
  }
}

async function loadThreads(auth, callback) {
  try {
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.threads.list({
      userId: 'me',
    });
    var threads = res.data.threads;
    callback(threads);
  } catch (err) {
    console.log(err);
  }

}

async function loadMessages(auth, callback) {
  try {
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.messages.list({
      userId: 'me',
    });
    var messages = res.data.messages;
    callback(messages);
  } catch (err) {
    console.log(err);
  }
}

async function loadHistories(auth) {
  try {
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.history.list({
      userId: 'me',
    });
    var histories = res.data.histories;
  } catch (err) {
    console.log(err);
  }
}