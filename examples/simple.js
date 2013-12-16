var fetcher = require("../index");
var fs = require('fs');
var open = require('open')

var log = function (a) { console.log(JSON.stringify(a, null, 2)); }

var session = new fetcher.session({}, function() {
  this.fetchUrl('https://www.google.com/search?q=veritrans', function(headers, html, extraData) {
    log(headers);
    log(extraData);

    fs.writeFileSync(__dirname + '/simple.html', html);
    open('file://' + __dirname + '/simple.html');
    session.close();
  });
});
