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

//====== Get Method Routes

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

TinyApp.get('/urls/new', (req, res) => {
    const templateVars = { username: req.cookies.name };
    res.render('urls_new', templateVars);
});

TinyApp.get('/urls/:id', (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    username: req.cookies.name };
  res.render('urls_show', templateVars);
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

//====== Post Method Routes

TinyApp.post('/urls/:shortURLToDel/delete', (req, res) => {
  if (urlDatabase[req.params.shortURLToDel]) {
    delete urlDatabase[req.params.shortURLToDel];
  }
  res.redirect('/urls');
});

TinyApp.post('/urls/new', (req, res) => {
  urlDatabase[`${generateRandStr()}`] = `http://${req.body.longURL}`;
  res.redirect('/urls');
});

TinyApp.post('/urls/:id', (req, res) => {
    urlDatabase[req.params.id] = `http://${req.body.newlongURL}`;
    res.redirect(`/urls`);
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
