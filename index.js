require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Store URLs in memory (you might want to use a database in production)
const urlDatabase = new Map();
let shortUrlCounter = 1;

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// POST endpoint to create short URL
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;
  
  try {
    const urlObject = new URL(originalUrl);
    
    dns.lookup(urlObject.hostname, (err) => {
      if (err) {
        res.json({ error: 'invalid url' });
      } else {
        const shortUrl = shortUrlCounter++;
        urlDatabase.set(shortUrl, originalUrl);
        res.json({ original_url: originalUrl, short_url: shortUrl });
      }
    });
  } catch (err) {
    res.json({ error: 'invalid url' });
  }
});

// GET endpoint to redirect short URLs
app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = parseInt(req.params.short_url);
  const originalUrl = urlDatabase.get(shortUrl);
  
  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
