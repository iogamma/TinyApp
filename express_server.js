// server.js
// load the things we need
let express = require('express');
let app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

let urlDatabase = {};

// index page
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id };
  res.render('urls_show', templateVars);
});

app.listen(8080);
console.log('8080 is the magic port');