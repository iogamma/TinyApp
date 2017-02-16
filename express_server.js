/* express_server.js */

//====== Constant Variables

// Resolve libraries and modules in the Node search path
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const toolbox = require('./lib/toolbox')

const TinyApp= express();
const generateRandStr = toolbox.generateRandStr;
const urlDatabase = {};
const userRecords = {};
const PORT = 8080;
//====== Setup

// Set up middleware
TinyApp.set('view engine', 'ejs');
TinyApp.use(bodyParser.urlencoded({extended: true}));
TinyApp.use(cookieParser());

//====== Helper Functions

// function generateRandStr() {
//   const max = 109;
//   const min = 48;
//   const offset1 = 7;  // number of unicode characters from : to @ inclusive
//   const offset2 = 6; // number of unicode characters from [ to ` inclusive
//   let randNum;
//   let randString = '';

//   for (let i = 0; i < 6; i++) {
//     // generate a random number from 48 to 100 (ie starting at unicode character 0)
//     randNum = Math.floor(Math.random() * (max - min + 1) + min);
//     if (randNum <= 57) {

//     } else if (randNum > 57 && randNum < 84) {
//       randNum += offset1;
//     } else {
//       randNum += offset1 + offset2;
//     }
//     console.log(randNum);
//     randString += String.fromCharCode(randNum);
//   }
//   return randString;
// }

//====== Get Routes

TinyApp.get('/', (req, res) => {
  const templateVars = { username: req.cookies.name };
  res.render('index', templateVars);
});

TinyApp.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies.name };
  res.render('urls_index', templateVars);
});
//put the "new" route here

TinyApp.get('/urls/:id', (req, res) => {
  const theID = req.params.id;
  const templateVars = {
    urls: urlDatabase,  // does not need whole database
    id: theID,
    username: req.cookies.name };
  switch(theID) {
  case 'new':
    res.render('urls_new', templateVars);
    break;
  default:
    res.render('urls_show', templateVars);
  }
});

TinyApp.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(longURL);
  } else {
    console.log("The short URL does not exist in the database.");
  }
});

TinyApp.get('/register', (req, res) => {
  res.render('registeration.ejs');
});

//====== Post Routes

TinyApp.post('/urls/:shortURLToDel/delete', (req, res) => {
  if (urlDatabase[req.params.shortURLToDel]) {
    delete urlDatabase[req.params.shortURLToDel];
  }
  res.redirect('/urls');
});

TinyApp.post('/urls/:id', (req, res) => {
  const theID = req.params.id;
  switch(theID) {
  case 'new':
    urlDatabase[`${generateRandStr()}`] = `http://${req.body.longURL}`;
    res.redirect('/urls');
    break;
  default:
    urlDatabase[theID] = `http://${req.body.newlongURL}`;
    res.redirect(`/urls`);
  }
});

TinyApp.post('/login', (req, res) => {
  res.cookie('name', req.body.username);
  res.redirect('/urls');
});

TinyApp.post('/logout', (req, res) => {
  res.clearCookie('name');
  res.redirect('/');
});

//====== Listener

TinyApp.listen(PORT);
console.log(`TinyApp server running using port: ${PORT}`);
