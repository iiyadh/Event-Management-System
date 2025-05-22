var express = require('express');
var router = express.Router();

// GET /events route - Display login form or events
router.get('/events', function(req, res) {
  // If user is logged in, show events
  if (req.app.locals.user) {
    var db = req.db;
    
    db.query('SELECT * FROM events ORDER BY date ASC', function(err, events) {
      if (err) {
        console.error('Error fetching events: ' + err);
        return res.status(500).send('Error fetching events');
      }
      
      res.render('events', {
        user: req.app.locals.user,
        events: events
      });
    });
  } else {
    // If not logged in, show login form
    res.render('events', {
      user: null
    });
  }
});

// POST /login route - Handle user login
router.post('/login', function(req, res) {
  var cin = req.body.cin;
  var password = req.body.password;
  var db = req.db;
  
  if (!cin || !password) {
    return res.render('events', {
      error: 'CIN and password are required',
      user: null
    });
  }
  
  db.query('SELECT * FROM users WHERE cin = ? AND password = ?', [cin, password], function(err, results) {
    if (err) {
      console.error('Error during login: ' + err);
      return res.status(500).send('Error during login');
    }
    
    if (results.length > 0) {
      // Store user in app.locals (in-memory login)
      req.app.locals.user = results[0];
      
      // Redirect to events page
      return res.redirect('/events');
    } else {
      return res.render('events', {
        error: 'Invalid credentials',
        user: null
      });
    }
  });
});

// GET /logout route - Handle user logout
router.get('/logout', function(req, res) {
  req.app.locals.user = null;
  res.redirect('/events');
});

// GET / route - Redirect to events
router.get('/', function(req, res) {
  res.redirect('/events');
});

// GET /all-events route - Display all events (requires login)
router.get('/all-events', function(req, res) {
  if (!req.app.locals.user) {
    return res.redirect('/events'); // Redirect to login if not logged in
  }

  var db = req.db;
  
  db.query('SELECT * FROM events ORDER BY date ASC', function(err, events) {
    if (err) {
      console.error('Error fetching events: ' + err);
      return res.status(500).send('Error fetching events');
    }
    
    res.render('all-events', {
      user: req.app.locals.user,
      events: events
    });
  });
});

module.exports = router;
