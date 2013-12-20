var fetcher = require("../index");
var fs = require('fs');
var open = require('open');

var log = function (a) { console.log(JSON.stringify(a, null, 2)); };

var keywords = [
  'buy car online',
  'place to go out in jakarta',
  'green rooth',
  'earth bag'
];
var currentKv = 0;
var results = {};

var session = new fetcher.session({}, function() {
  var interval = setInterval(function() {
    var kv = keywords[currentKv];
    if (!kv) return;

    console.log('searching for: ', kv);

    session.fetchWords(kv, function(headers, html, extraData) {
      
      results[kv] = [headers, html, extraData];

      if (Object.keys(results).length == keywords.length) {
        fs.writeFileSync(__dirname + '/results.json', JSON.stringify(results, null, 2));
        open('file://' + __dirname + '/results.json');
        session.close();
        clearInterval(interval);
      }
    });
    currentKv += 1;
  }, 8000);
});
