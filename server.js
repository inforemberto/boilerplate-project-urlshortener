require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();
const db = require('./models');
const { create, find } = require('./controllers/shorturl.controller.js');

const urlValidator = /^(?:(?:https?):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/

// Basic Configuration
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.urlencoded({extended: false}));

app.post('*', (req, res, next) => {
  try {
    if(!urlValidator.test(req.body.url)){
      throw new Error('invalid url');
    }
    let domain = (new URL(req.body.url));
    dns.lookup(domain.hostname, (err, address, family) => {
    if (err) {
      return res.send({error: 'invalid url'});
    } else {
      next();
    }
  });
  } catch(err) {
    return res.send({error: 'invalid url'});
  };
});

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  create(req, res);
});

app.get('/api/shorturl/:code', (req, res) => {
  find(req, res);
})

db.mongoose.connect(db.uri, db.options).then(() => {

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}).catch(err => {

});



