var fetcher = require("../index");
var fs = require('fs');
var open = require('open');
var adsParser = require('google-search-ads-parser');

var log = function (a) { console.log(JSON.stringify(a, null, 2)); }

var session = new fetcher.session({}, function() {
  this.fetchWords('hotel jakarta', function(headers, html, extraData) {
    log(adsParser.extended.parseString(html));
    //log(headers);
    //log(extraData);

    fs.writeFileSync(__dirname + '/simple.html', html);
    open('file://' + __dirname + '/simple.html');
    session.close();
  });
});
