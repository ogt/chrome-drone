google-search-fetcher
============

Example Usage:
```
var fetcher = require('google-search-fetcher');
var session = new fetcher.session(headers = null); // allow modifcation of all HTTP headers
session.searchWords(query, function(headers,body) {} );
session.close();
```

A more realistic use case follows:

```
var keywords = []; // list of 2k keywords
var results = []; // will contain the list of json files
var Hour = 3600;
var AvgHumanSearchesPerDay = 20;

for (var i=;i<100;i++) {
  launch_human()
}

function search() {
  session.searchWords(keywords.pop(), function (headers, body) {
    parser.extended.parseString(headers+body, function (json_result){
      results.append(json_result);
    });
  }
}

function generate_daily_search_timestamps() {
  var series = ;
  for (var i=0; i< Math.random() * 2*AvgHumanSearchesPerDay; i++ ) {
    series.append(Math.random(24*Hour))
  }
  return series.sort()
}

function launch_human() {
  var fetcher = require('google-search-fetcher');
  var session = new fetcher.session(headers = null)  // if null use some default http-headers
                                // ideally it should randomize the headers too
  var parser = require('google-search-ads-parser');
  var series = generate_daily_search_timestamps();
  for (var i=0; i< series.length;i++) {
    setTimeout(search, series[i]);
  }
  setTimeout(function() { session.close(); }, series[series.length-1]+1);
}
```
