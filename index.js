var fs = require('fs');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');
var pg = require('pg');

var jsonParser = bodyParser.json();

app.set('port', process.env.PORT || 3000);

app.use(cors());

app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM test_table', function(err, result) {
      done();
      if (err)
      { console.error(err); response.send("Error " + err); }
      else
      { response.render('pages/db', {results: result.rows} ); }
    });
  });
});

app.get('/heroes', function(req, res) {
  res.send(JSON.parse(fs.readFileSync('./heroes.json', 'utf8')));
});

app.get('/heroes/:id', function(req, res) {
  var heroes = JSON.parse(fs.readFileSync('./heroes.json', 'utf8'));
  for(var i = 0; i < heroes.length; i++) {
    if(heroes[i].id === Number(req.params.id)) {
      res.send(JSON.stringify(heroes[i]));
      return;
    }
  }
  res.status(404).send('Not found');
});

app.post('/heroes', jsonParser, function (req, res) {
  if (!req.body) return res.sendStatus(400);
  var heroes = JSON.parse(fs.readFileSync('./heroes.json', 'utf8'));
  var newHero = req.body;
  newHero.id = heroes[heroes.length-1].id + 1;
  newHero.likes = 0;
  newHero.default = false;
  heroes.push(req.body);
  fs.writeFileSync('./heroes.json', JSON.stringify(heroes));
  res.send(heroes);
});

app.post('/heroes/:id/like', jsonParser, function (req, res) {
  var heroes = JSON.parse(fs.readFileSync('./heroes.json', 'utf8'));
  for(var i = 0; i < heroes.length; i++) {
    if(heroes[i].id === Number(req.params.id)) {
      heroes[i].likes += 1;
    }
  }
  fs.writeFileSync('./heroes.json', JSON.stringify(heroes));
  res.send();
});

app.delete('/heroes/:id', jsonParser, function (req, res) {
  const idToRemove = Number(req.params.id);

  var heroes = JSON.parse(fs.readFileSync('./heroes.json', 'utf8'));
  for(var i = 0; i < heroes.length; i++) {
    if(heroes[i].id === idToRemove && heroes[i].default) {
      res.status(500).send('Default hero');
      return;
    } else if (heroes[i].id === idToRemove) {
      heroes.splice(i, 1);
    }
  }
  fs.writeFileSync('./heroes.json', JSON.stringify(heroes));
  res.send(heroes);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
