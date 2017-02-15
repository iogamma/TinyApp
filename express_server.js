/* express_server.js */

// load the things we need
const express = require('express');
const bodyParser = require('body-parser');
const fs = ('fs');

const app = express();
const urlDatabase = {};

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

// Routes

app.get('/', (req, res) => {
  res.render('urls_index');
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render('urls_new');
});

app.get("/u/:shortURL", (req, res) => {
  longURL = urlDatabase[req.params.shortURL];
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(longURL);
  } else {
    console.log("The short URL does not exist in the database.");
  }
});

app.post("/urls/:shortURLToDel/delete", (req, res) => {
  let templateVars = { urls: urlDatabase };
  delete urlDatabase[req.params.shortURLToDel];
  res.render('urls_index', templateVars);
});
app.post("/urls", (req, res) => {
  urlDatabase[`${generateRandStr()}`] = `http://${req.body.longURL}`;
  res.redirect('/urls');
});



function generateRandStr() {
  let randNum;
  let randString = "";

  for (let i = 0; i < 6; i++) {
    // generate a random number from 36 to 83 (ie starting at unicode character 0)
    randNum = Math.floor(Math.random() * 36) + 48;
    // convert anything greather than 57 to unicode a-z
    randNum > 57 ? randNum += 39 : null ;
    randString += String.fromCharCode(randNum);
  }

  return randString;
}

app.listen(8080);
console.log('TinyApp server running.');