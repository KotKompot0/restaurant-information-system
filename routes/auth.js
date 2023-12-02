var express = require('express');
var router = express.Router();
var connection = require("../models/createCon");

router.get('/', function(req, res, next) {
  const user = req.session.user;
    if (!user) {
        res.redirect('/sign-in');
    } else {
      if (user.Role == "Администратор"){
          res.redirect('/admin');
      } else if (user.Role == "Официант"){
          res.redirect('/waiter');
      } else if (user.Role == "Повар"){
          res.redirect('/cook');
      }
  }
});

router.get('/sign-in', function(req, res, next) {
  res.render('sign-in');
});

router.post('/sign-in', async function (req, res) {
  const { login, password } = req.body;
  console.log(login, password)
  let results = await connection.query(`SELECT * FROM Employees WHERE Login='${login}' AND Password='${password}'`)
  if (results.length > 0) {
      const user = results[0];
      req.session.user = user;
      if (user.Role == "Администратор"){
          res.redirect('/admin');
      } else if (user.Role == "Официант"){
          res.redirect('/waiter');
      } else if (user.Role == "Повар"){
          res.redirect('/cook');
      } else {
        res.redirect('/sign-in');
      }
    } else {
        res.redirect('/sign-in');
    }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/sign-in');
});

module.exports = router;
