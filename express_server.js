/* express_server.js */

// load the things we need
const express = require('express');
const bodyParser = require('body-parser');
const fs = ('fs');

const app = express();
const urlDatabase = {};

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

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

// Get Routes

app.get('/', (req, res) => {
  res.render('urls_index');
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/:id', (req, res) => {
  let theID = req.params.id;
  let templateVars = { urls: urlDatabase,
                       id: theID };
  switch(theID) {
    case 'new':
      res.render('urls_new');
      break;
    default:
      res.render('urls_show', templateVars);
  };
})

app.get("/u/:shortURL", (req, res) => {
  longURL = urlDatabase[req.params.shortURL];
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(longURL);
  } else {
    console.log("The short URL does not exist in the database.");
  }
});

// Post Routes

app.post("/urls/:shortURLToDel/delete", (req, res) => {
  delete urlDatabase[req.params.shortURLToDel];
  res.redirect('/urls');
});

app.post("/urls/:id", (req, res) => {
  let theID = req.params.id;
  switch(theID) {
    case 'new':
      urlDatabase[`${generateRandStr()}`] = `http://${req.body.longURL}`;
      res.redirect('/urls');
      break;
    default:
      urlDatabase[theID] = `http://${req.body.newlongURL}`;
      res.redirect(`/urls`);
  };
});

app.listen(8080);
console.log('TinyApp server running.');