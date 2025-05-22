var express = require('express');
var router = express.Router();

// GET /admin route - Show admin page
router.get('/', function(req, res) {
  var db = req.db;
  
  db.query('SELECT * FROM events ORDER BY date ASC', function(err, events) {
    if (err) {
      console.error('Error fetching events: ' + err);
      return res.status(500).send('Error fetching events');
    }
    
    res.render('admin', {
      events: events
    });
  });
});

// POST /admin/event route - Add a new event
router.post('/event', function(req, res) {
  var title = req.body.title;
  var description = req.body.description;
  var date = req.body.date;
  var time = req.body.time;
  var location = req.body.location;
  var db = req.db;
  
  if (!title || !date || !time) {
    return res.redirect('/admin?error=Title, date, and time are required');
  }
  
  var query = 'INSERT INTO events (title, description, date, time, location) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [title, description, date, time, location], function(err, result) {
    if (err) {
      console.error('Error adding event: ' + err);
      return res.status(500).send('Error adding event');
    }
    
    res.redirect('/admin?success=Event added successfully');
  });
});

// GET /admin/event/delete/:id route - Delete an event
router.get('/event/delete/:id', function(req, res) {
  var eventId = req.params.id;
  var db = req.db;
  
  db.query('DELETE FROM events WHERE id = ?', [eventId], function(err, result) {
    if (err) {
      console.error('Error deleting event: ' + err);
      return res.status(500).send('Error deleting event');
    }
    
    res.redirect('/admin?success=Event deleted successfully');
  });
});

// GET /admin/event/edit/:id route - Show edit form for an event
router.get('/event/edit/:id', function(req, res) {
  var eventId = req.params.id;
  var db = req.db;
  
  db.query('SELECT * FROM events WHERE id = ?', [eventId], function(err, results) {
    if (err || results.length === 0) {
      return res.redirect('/admin?error=Event not found');
    }
    
    var event = results[0];
    
    db.query('SELECT * FROM events ORDER BY date ASC', function(err, events) {
      if (err) {
        console.error('Error fetching events: ' + err);
        return res.status(500).send('Error fetching events');
      }
      
      res.render('admin', {
        events: events,
        editEvent: event
      });
    });
  });
});

// POST /admin/event/update/:id route - Update an event
router.post('/event/update/:id', function(req, res) {
  var eventId = req.params.id;
  var title = req.body.title;
  var description = req.body.description;
  var date = req.body.date;
  var time = req.body.time;
  var location = req.body.location;
  var db = req.db;
  
  if (!title || !date || !time) {
    return res.redirect('/admin?error=Title, date, and time are required');
  }
  
  var query = 'UPDATE events SET title = ?, description = ?, date = ?, time = ?, location = ? WHERE id = ?';
  db.query(query, [title, description, date, time, location, eventId], function(err, result) {
    if (err) {
      console.error('Error updating event: ' + err);
      return res.status(500).send('Error updating event');
    }
    
    res.redirect('/admin?success=Event updated successfully');
  });
});

module.exports = router;
