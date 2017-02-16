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
const users = {
  abcdef: {
    id: generateRandStr(),
    email: 'hal.wh.tang@gmail.com',
    password: 'happy'
  },
  qwerty: {
    id: generateRandStr(),
    email: 'sandy.h@gmail.com',
    password: 'joyful'
  }
};
const PORT = 8080;

//====== Setup

// Set up middleware
TinyApp.set('view engine', 'ejs');
TinyApp.use(bodyParser.urlencoded({extended: true}));
TinyApp.use(cookieParser());

//====== Get Method Routes

TinyApp.get('/', (req, res) => {
  const templateVars = {
    user : users[`${req.cookies.uid}`]
  };
    res.render('index', templateVars);
});

TinyApp.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user : users[`${req.cookies.uid}`]
  }
  res.render('urls_index', templateVars);
});

TinyApp.get('/urls/new', (req, res) => {
  const templateVars = {
    user : users[`${req.cookies.uid}`]
  };
  res.render('urls_new', templateVars);
});

TinyApp.get('/urls/:id', (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    user : users[`${req.cookies.uid}`]
  };
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

TinyApp.get('/login', (req, res) => {
  const templateVars = {
    user : users[`${req.cookies.uid}`]
  };
  res.render('login', templateVars);
});

TinyApp.get('/register', (req, res) => {
  const templateVars = {
    user : users[`${req.cookies.uid}`]
  };
  res.render('register.ejs', templateVars);
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
    res.redirect('/urls');
});

TinyApp.post('/login', (req, res) => {
  for (let user in users) {
    if (users[`${user}`].email === req.body.email) {
      res.cookie('uid', user);
      res.redirect('/urls');
      break;
    }
  }
  res.redirect(401, '/');
});

TinyApp.post('/logout', (req, res) => {
  res.clearCookie('uid');
  res.redirect('/');
});

TinyApp.post('/register', (req, res) => {
  let newUserID;

  if (!req.body.email || !req.body.password) {
    res.redirect(400, '/');
    return ;
  } else {
    // make sure the generated ID isn't in use
    do {
      newUserID = generateRandStr();
    } while(users.newUserID)

    // initiate new object for a new user
    users[`${newUserID}`] = {};
    users[`${newUserID}`].id = newUserID;
    users[`${newUserID}`].email = req.body.email;
    users[`${newUserID}`].password = req.body.password;

    res.cookie('uid', newUserID);
    res.redirect('/urls')
  }
});

//====== Listener

TinyApp.listen(PORT);
console.log(`TinyApp server running using port: ${PORT}`);
