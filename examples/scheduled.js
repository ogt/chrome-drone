// npm install https://github.com/ogt/google-search-results-parser/tarball/master
// npm install https://github.com/ogt/google-search-ads-parser/tarball/master

var fetcher = require("../index");
var fs = require('fs');
var open = require('open');
var adsParser = require('google-search-ads-parser');
var resultParser = require('google-search-results-parser');

var log = function (a) { console.log(JSON.stringify(a, null, 2)); };

var keywords = [
  'buy car online',
  'hotel jakarta',
  'place to go out in jakarta',
  'green rooth',
  'earth bag'
];
var currentKv = 0;
var results = {};

var formatData = function (data) {
  var html = "<table border=1><tr><th>Keyword</th><th>ads</th><th>results</th></tr>";
  var resHtml;
  for (var k in data) { resHtml = data[k];
    var ads = adsParser.extended.parseString(resHtml).ads;
    var results = resultParser.extended.parseString(resHtml).results;

    console.log(ads);

    var adsNames = ads.map(function (ad) {
      return "<li>" + ad.Title + "<br><i>" + ad.Domain + "</i></li>";
    }).join("");

    html += "<tr><td>" + k + "</td>" +
      "<td><ul>" + adsNames + "</td>" +
      "<td>" + results.map(function(el) { return el.Title; }).join("<br>") + "</td></tr>";
  }
  html += "<table>";

  fs.writeFileSync(__dirname + '/results.html', html);
  open('file://' + __dirname + '/results.html');
};

var session = new fetcher.session({}, function() {
  var interval = setInterval(function() {
    var kv = keywords[currentKv];
    if (!kv) return;

    console.log('searching for: ', kv);

    session.fetchWords(kv, function(headers, html, extraData) {
      
      results[kv] = html;

      if (Object.keys(results).length == keywords.length) {
        session.close();
        clearInterval(interval);
        formatData(results);
      }
    });
    currentKv += 1;
  }, 1000);
});
