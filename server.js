var express = require('express');
var app = express();

app.use(express.static(__dirname));

app.get('/tello', function (req, res) {
  res.sendfile('index.html');
});

app.listen(8080, function () {
    console.log('---------------------------------------');
    console.log('----------- LOCALHOST:8080 ------------');
    console.log('---------------------------------------');
    console.log('| /tello      | index.html            |');
    console.log('| /           | index.html            |');
    console.log('---------------------------------------');
});