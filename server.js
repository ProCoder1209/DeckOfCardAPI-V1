const express = require('express');
const app = express();
const redirectToHTTPS = require('express-http-to-https').redirectToHTTPS;

// Redirect HTTP to HTTPS,
app.use(redirectToHTTPS([/localhost:(\d{4})/], [], 301));

// This serves static files from the specified directory
app.use(express.static(__dirname));

const server = app.listen(8081, () => {
  
  const host = server.address().address;
  const port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});
