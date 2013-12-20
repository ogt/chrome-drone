var fetcher = require("../index");
var fs = require('fs');
var open = require('open')

var log = function (a) { console.log(JSON.stringify(a, null, 2)); }

fetcher.getStatic('https://www.google.com/search?q=veritrans', function(data) {
  fs.writeFileSync(__dirname + '/static.html', data);
  open('file://' + __dirname + '/static.html');
});
