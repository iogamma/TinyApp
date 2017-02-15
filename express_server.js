/* express_server.js */
// load the things we need
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const urlDatabase = {};

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

// app.get("/urls/:id", (req, res) => {
//   let templateVars = { shortURL: req.params.id };
//   res.render('urls_show', templateVars);
// });

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

function generateRandomString() {
  let randNum;
  let randString = "";

  for (let i = 0; i < 6; i++) {
    randNum = Math.floor(Math.random() * 36) + 48;
    randNum > 57 ? randNum += 39 : null ;
    randString += String.fromCharCode(randNum);
  }

  return randString;
}

app.listen(8080);
console.log('TinyApp server running.');