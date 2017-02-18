/* express_server.js */

//====================== Constant Variables

// Resolve libraries and modules in the Node search path
const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const toolbox = require('./lib/toolbox');
const methodOverride = require('method-override');

const PORT = 8080;
const TinyApp = express();
const generateRandStr = toolbox.generateRandStr;
const urlDatabase = {
  'initTemp': {
    longURL: ' ',
    uid: 'tryMe'
  }
};
const usersDatabase = {};

//====================== Setup

// Set up middleware
TinyApp.set('view engine', 'ejs');
TinyApp.use(bodyParser.urlencoded({extended: true}));
TinyApp.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
TinyApp.use(methodOverride('_method'));

//====================== Helper Functions

// Finds the URLs that belong to a certain user given their ID
function urlsForUser(id) {
  let listOfURLs = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[`${shortURL}`].uid === id) {
      listOfURLs[`${shortURL}`] = {
        longURL: urlDatabase[`${shortURL}`].longURL,
        date: urlDatabase[`${shortURL}`].date
      };
    }
  }
  return listOfURLs;
}
// Searches userDatabase to see if a given email exists
function emailExist(email) {
  for (let user in usersDatabase) {
    if (usersDatabase[`${user}`].email === email) {
      return true;
    }
  }
  return false;
}

//====================== Get Method Routes

//====== GET /
TinyApp.get('/', (req, res) => {
  const userInDatabase = usersDatabase[`${req.session.user_id}`];
  const urlInDatabase = urlDatabase[`${req.params.id}`];
  // used to let non registered users to try the app. See POST '/' endpoint.
  let tryMeURL = urlsForUser('tryMe');
  const templateVars = {
    user: userInDatabase,
    tryMeURL: tryMeURL
  };
  if (usersDatabase[`${req.session.user_id}`]) {
    res.redirect('/urls');
  } else {
    res.render('index', templateVars);
  }
});

//====== GET /urls
TinyApp.get('/urls', (req, res) => {
  const templateVars = {
    listOfURLs: urlsForUser(req.session.user_id),
    user: usersDatabase[`${req.session.user_id}`]
  };
  if (usersDatabase[`${req.session.user_id}`]) {
    res.render('urls_index', templateVars);
  } else {
    res.status(401).send('Unauthorized! You are not logged in. Please login <a href="/login"> here</a>');
  }
});

//====== GET /urls/new
TinyApp.get('/urls/new', (req, res) => {
  const templateVars = {
    user: usersDatabase[`${req.session.user_id}`]
  };
  if (usersDatabase[`${req.session.user_id}`]) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

//====== GET /urls/:id
TinyApp.get('/urls/:id', (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    user: usersDatabase[`${req.session.user_id}`]
  };

  if (usersDatabase[`${req.session.user_id}`]) {
    if (!urlDatabase[`${req.params.id}`]) {
      res.status(404).send('Not Found. Tiny URL does not exist.');
    } else if (urlDatabase[`${req.params.id}`].uid !== `${req.session.user_id}`) {
      res.status(403).send('Forbidden! Your not registered to access that URL.');
    } else {
      res.render('urls_show', templateVars);
    }
  } else {
    res.status(401).send('Unauthorized! You are not logged in. Please login <a href="/login"> here</a>');
  }
});

//====== GET /u/:shortURL
TinyApp.get('/u/:shortURL', (req, res) => {
  if(urlDatabase[`${req.params.shortURL}`]) {
    const longURL = urlDatabase[`${req.params.shortURL}`].longURL;
    if (longURL) {
      res.redirect(`${longURL}`);
    }
  } else {
    res.status(404).send('Not Found. Tiny URL does not exist.');
  }
});

//====== GET /login
TinyApp.get('/login', (req, res) => {
  if (usersDatabase[`${req.session.user_id}`]) {
    res.redirect('/');
  } else {
    const templateVars = {
      user: usersDatabase[`${req.session.user_id}`]
    };
    res.render('login', templateVars);
  }
});

//====== GET /register
TinyApp.get('/register', (req, res) => {
  if (usersDatabase[`${req.session.user_id}`]) {
    res.redirect('/');
  } else {
    const templateVars = {
      user: usersDatabase[`${req.session.user_id}`]
    };
    res.render('register.ejs', templateVars);
  }
});

//====== GET /gibberish
TinyApp.get('/:gibberish', (req, res) => {
  res.redirect('/');
});

//==================== Post Method Routes

//======POST /
TinyApp.post('/', (req, res) => {
  let shortURL;
  // make sure the generated ID isn't in use
  do {
    shortURL = generateRandStr();
  } while(urlDatabase.newShortURL);
  //if (!urlDatabase[`${shortURL}`]) {
  if (urlsForUser('tryMe')) {
    delete urlDatabase[`${Object.keys(urlsForUser('tryMe'))}`];

    urlDatabase[`${shortURL}`] = {
      longURL: `${req.body.longURL}`,
      uid: 'tryMe'
    };
  }
  res.redirect('/');
});

//====== POST /urls/new
TinyApp.post('/urls/new', (req, res) => {
  const httpRegex = /^http?:\/\//;
  let newShortURL;
  let longURL = `${req.body.longURL}`
  // make sure the generated ID isn't in use
  do {
    newShortURL = generateRandStr();
  } while(urlDatabase[`${newShortURL}`]);

  if (!httpRegex.test(longURL)) {
    longURL = 'http://' + longURL;
  }
  // URL database entry
  urlDatabase[`${newShortURL}`] = {
    longURL : longURL,
    uid: `${req.session.user_id}`,
    date: toolbox.getDate()
  };
  res.redirect('/urls');
});

//====== POST /urls/:id
TinyApp.post('/urls/:id', (req, res) => {
  const httpRegex = /^http?:\/\//;
  const userInDatabase = usersDatabase[`${req.session.user_id}`];
  const urlInDatabase = urlDatabase[`${req.params.id}`];
  let newLongURL = `${req.body.newlongURL}`;

  if(!httpRegex.test(newLongURL)) {
    newLongURL = 'http://' + newLongURL;
  }

  if (userInDatabase) {
    if (!urlInDatabase) {
      res.status(404).send('Not Found. Tiny URL does not exist.');
    } else if (urlInDatabase.uid !== `${req.session.user_id}`) {
      res.status(403).send('Forbidden! Your not allowed to access that URL.');
    } else {
      urlInDatabase.longURL = newLongURL;
      urlInDatabase.date = toolbox.getDate();
      res.redirect('/urls');
      return
    }
  } else {
      res.status(401).send('Unauthorized! You are not logged in. Please login <a href="/login"> here</a>');
  }
});

//====== POST /login
TinyApp.post('/login', (req, res) => {
  for (let user in usersDatabase) {
    if (usersDatabase[`${user}`].email === req.body.email) {
      if (bcrypt.compareSync(req.body.password, usersDatabase[`${user}`].password)) {
        req.session.user_id = `${user}`;
        res.redirect('/');
        return;
      }
    }
  }
    res.status(401).send('Unauthorized! Your login information is incorrect. <a href="#" onClick="history.go(-1)">Go Back.</a>');
})

TinyApp.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});

//====== POST /register
TinyApp.post('/register', (req, res) => {
  let newUserID;

  if (!req.body.email || !req.body.password) {
    res.status(400).send('Both fields must be filled out.');
  } else {
    if (emailExist(req.body.email)) {
      res.status(400).send('You are already registered with that email. <a href="#" onClick="history.go(-1)">Go Back.</a>');
    } else {
      const hashed_password = bcrypt.hashSync(req.body.password, 10);
      // make sure the generated ID isn't in use
      do {
        newUserID = generateRandStr();
      } while(usersDatabase[`${newUserID}`]);

      usersDatabase[`${newUserID}`] = {
        id: newUserID,
        email: req.body.email,
        password: hashed_password
      };

      req.session.user_id = `${newUserID}`;
      res.redirect('/urls');
    }
  }
});

//==================== Put Method Routes


//==================== Delete Method Routes

//====== DELETE /urls/:id
TinyApp.delete('/urls/:id', (req, res) => {
  if (urlDatabase[req.params.id]) {
    delete urlDatabase[req.params.id];
  }
  res.redirect('/urls');
});

//==================== Chained Routes



//============ Listener

TinyApp.listen(PORT);
console.log(`TinyApp server running using port: ${PORT}`);
