var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var hbs = require('express-hbs');
var path = require('path');

// Initialize Express app
var app = express();

// Configure handlebars with express-hbs
app.engine('hbs', hbs.express4({
  extname: '.hbs',
  defaultLayout: false,
  helpers: {
    eq: function (a, b) {
      return a === b;
    }
  }
}));
app.set('view engine', 'hbs');

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Database connection
var db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'event_management',
});

// Connect to database
db.connect(function(err) {
  if (err) {
    console.error('Error connecting to database: ' + err.stack);
    return;
  }
  console.log('Connected to database with ID ' + db.threadId);
  
  // Create database and tables if they don't exist
  db.query('CREATE DATABASE IF NOT EXISTS event_management', function(err) {
    if (err) throw err;
    
    db.query('USE event_management', function(err) {
      if (err) throw err;
      
      var createEventsTable = `
        CREATE TABLE IF NOT EXISTS events (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          date DATE NOT NULL,
          time TIME NOT NULL,
          location VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      var createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          cin VARCHAR(50) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      db.query(createEventsTable, function(err) {
        if (err) throw err;
        console.log('Events table created or already exists');
      });
      
      db.query(createUsersTable, function(err) {
        if (err) throw err;
        console.log('Users table created or already exists');
        
        // Insert a default admin user if not exists
        db.query('SELECT * FROM users WHERE cin = ?', ['admin'], function(err, results) {
          if (err) throw err;
          
          if (results.length === 0) {
            db.query('INSERT INTO users (cin, password, name) VALUES (?, ?, ?)', 
              ['admin', 'admin123', 'Administrator'], 
              function(err) {
                if (err) throw err;
                console.log('Default admin user created');
              });
          }
        });
      });
    });
  });
});

// Make db accessible to routes
app.use(function(req, res, next) {
  req.db = db;
  next();
});

// Global user variable for login status
app.locals.user = null;

// Load routes
var userEventsRoutes = require('./routes/userevents');
var adminEventsRoutes = require('./routes/adminevents');

// Use routes
app.use('/', userEventsRoutes);
app.use('/admin', adminEventsRoutes);

// Start server
var PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log('Server started on port ' + PORT);
});
