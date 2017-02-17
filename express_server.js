/* express_server.js */

//====== Constant Variables

// Resolve libraries and modules in the Node search path
const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const toolbox = require('./lib/toolbox');

const PORT = 8080;
const TinyApp = express();
const generateRandStr = toolbox.generateRandStr;
const urlDatabase = {
  'initTemp': {
    longURL: ' ',
    uid: 'temp'
  }
};
const users = {};

//====== Setup

// Set up middleware
TinyApp.set('view engine', 'ejs');
TinyApp.use(bodyParser.urlencoded({extended: true}));
TinyApp.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

//====== Helper Functions
function urlsForUser(id) {
  let listOfURLs = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[`${shortURL}`].uid === id) {
      listOfURLs[`${shortURL}`] = urlDatabase[`${shortURL}`].longURL;
    }
  }
  return listOfURLs;
}

function emailExist(email) {
  for (let user in users) {
    if (users[`${user}`].email === email) {
      return true;
    }
  }
  return false;
}

//====== Get Method Routes

TinyApp.get('/', (req, res) => {
  // used to let non registered users to try the app. See POST '/' endpoint.
  let tempURL = urlsForUser('temp');
  const templateVars = {
    user: users[`${req.session.user_id}`],
    tempURL: tempURL
  };
  if (users[`${req.session.user_id}`]) {
    res.redirect('/urls');
  } else {
    res.render('index', templateVars);
  }
});

TinyApp.get('/urls', (req, res) => {
  const templateVars = {
    listOfURLs: urlsForUser(req.session.user_id),
    user: users[`${req.session.user_id}`]
  };
  if (users[`${req.session.user_id}`]) {
    res.render('urls_index', templateVars);
  } else {
    res.status(401);
    res.render('error');
  }
});

TinyApp.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[`${req.session.user_id}`]
  };
  if (users[`${req.session.user_id}`]) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

TinyApp.get('/urls/:id', (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    user: users[`${req.session.user_id}`]
  };

  if (users[`${req.session.user_id}`]) {
    if (!urlDatabase[`${req.params.id}`]) {
      res.status(404).send('Not Found. Tiny URL does not exist.');
    } else if (urlDatabase[`${req.params.id}`].uid !== `${req.session.user_id}`) {
      res.status(403).send('Forbidden! Your not allowed to access that URL');
    } else {
      res.render('urls_show', templateVars);
    }
  } else {
    res.status(401).render('error');
  }
});

TinyApp.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[`${req.params.shortURL}`].longURL;
  if (longURL) {
    res.redirect(`${longURL}`);
  } else {
    res.status(404).send('Not Found. Tiny URL does not exist.');
  }
});

TinyApp.get('/login', (req, res) => {
  if (users[`${req.session.user_id}`]) {
    res.redirect('/');
  } else {
    const templateVars = {
      user: users[`${req.session.user_id}`]
    };
    res.render('login', templateVars);
  }
});

TinyApp.get('/register', (req, res) => {
  if (users[`${req.session.user_id}`]) {
    res.redirect('/');
  } else {
    const templateVars = {
      user: users[`${req.session.user_id}`]
    };
    res.render('register.ejs', templateVars);
  }
});

TinyApp.get('/:gibberish', (req, res) => {
  res.redirect('/');
});


//====== Post Method Routes

TinyApp.post('/', (req, res) => {
  let shortURL;
  // make sure the generated ID isn't in use
  do {
    shortURL = generateRandStr();
  } while(urlDatabase.newShortURL);
  //if (!urlDatabase[`${shortURL}`]) {
  if (urlsForUser('temp')) {
    delete urlDatabase[`${Object.keys(urlsForUser('temp'))}`];
    urlDatabase[`${shortURL}`] = {};
    urlDatabase[`${shortURL}`].longURL = `${req.body.longURL}`;
    urlDatabase[`${shortURL}`].uid = 'temp';
  }
  res.redirect('/');
});

TinyApp.post('/urls/:id/delete', (req, res) => {
  if (urlDatabase[req.params.id]) {
    delete urlDatabase[req.params.id];
  }
  res.redirect('/urls');
});

TinyApp.post('/urls/new', (req, res) => {
  let newShortURL;
  // make sure the generated ID isn't in use
  do {
    newShortURL = generateRandStr();
  } while(urlDatabase.newShortURL);

  urlDatabase[`${newShortURL}`] = {};
  urlDatabase[`${newShortURL}`].longURL = `${req.body.longURL}`;
  urlDatabase[`${newShortURL}`].uid = `${req.session.user_id}`;
  res.redirect('/urls');
});

TinyApp.post('/urls/:id', (req, res) => {
  if (users[`${req.session.user_id}`]) {
    if (!urlDatabase[`${req.params.id}`]) {
      res.status(404).send('Not Found. Tiny URL does not exist.');
    } else if (urlDatabase[`${req.params.id}`].uid !== `${req.session.user_id}`) {
      res.status(403).send('Forbidden! Your not allowed to access that URL');
    } else {
      urlDatabase[req.params.id].longURL = `http://${req.body.newlongURL}`;
      res.redirect('/urls');
    }
  } else {
    res.status(401).render('error');
  }
});

TinyApp.post('/login', (req, res) => {
  for (let user in users) {
    if (users[`${user}`].email === req.body.email) {
      if (bcrypt.compareSync(req.body.password, users[`${user}`].password)) {
        req.session.user_id = `${user}`;
        res.redirect('/');
        break;
      } else {
        break;
      }
    }
  }
  res.status(401).send('Unauthorized. Your login information is incorrect.');
});

TinyApp.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});

TinyApp.post('/register', (req, res) => {
  let newUserID;

  if (!req.body.email || !req.body.password) {
    res.status(400).send('Both fields must be filled out.');
  } else {
    if (emailExist(req.body.email)) {
      res.status(400).send('You are already registered with that email.');
    } else {
      // make sure the generated ID isn't in use
      do {
        newUserID = generateRandStr();
      } while(users.newUserID);

      users[`${newUserID}`] = {};
      users[`${newUserID}`].id = newUserID;
      users[`${newUserID}`].email = req.body.email;
      const hashed_password = bcrypt.hashSync(req.body.password, 10);
      users[`${newUserID}`].password = hashed_password;

      req.session.user_id = `${newUserID}`;
      res.redirect('/urls');
    }
  }
});

//====== Listener
TinyApp.listen(PORT);
console.log(`TinyApp server running using port: ${PORT}`);
