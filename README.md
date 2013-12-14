google-search-fetcher
============

Example Usage:
```
var fetcher = require('google-search-fetcher');
var session = new fetcher.session(headers = null); // allow modifcation of all HTTP headers
session.searchWords(query, function(err,result) {
    console.log(result.headers);
    console.log(result.html);
});
session.close();
```

A more realistic use case follows:

```
var keywords = []; // list of 2k keywords
var results = []; // will contain the list of json files
var Hour = 3600;
var AvgHumanSearchesPerDay = 20;

for (var i=0;i<100;i++) {
  launch_human();
}

function search(cb) {
  fetcher.searchWords(keywords.pop(), function (err, result) {
    if (err) 
      cb(err);
    else
      parser.extended.parseString(result.html, cb);
  });
}

function generate_daily_search_timestamps() {
  var series = [];
  for (var i=0; i< Math.random() * 2*AvgHumanSearchesPerDay; i++ ) {
    series.append(Math.random(24*Hour));
  }
  return series.sort();
}

function launch_human() {
  var fetcher = new fetcher.session(headers = null);  // if null use some default http-headers
                                // ideally it should randomize the headers too
  var parser = require('google-search-ads-parser');
  var series = generate_daily_search_timestamps();
  for (var i=0; i<series.length;i++) {
    setTimeout(search, series[i]);
  }
  setTimeout(function() { fetcher.close(); }, series[series.length-1]+1);
}

```
