var querystring = require('querystring');
var needle = require('needle');
var childProcess = require('child_process');
var phantomjs = require('phantomjs');
var path = require('path');
var freeport = require('freeport');
var net = require('net');

var Fetcher = {
  defaultHeaders: {
    'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1677.0 Safari/537.36"
  },

  getStatic: function (url, callback) {
    needle.get(url, this.defaultHeaders, function (error, response, body) {
      //var result = Parser.parseString(body);
      if (callback) callback(body);
    });
  },

  getStaticWords: function (searchable, callback) {
    var query = {output: "search", sclient: "psy-ab", q: searchable, gbv: "1" }; //, sei: "CpyWUqHYO8ParAezgoDgDw" };
    var url = "https://www.google.com/search?" + querystring.stringify(query);
    this.getStatic(url, callback);
  }
};

var sessionMethods = {
  initialize: function (options, callback) {
    this.options = options;

    this.startPhantomServer(function(r) {
      console.log('Server running on port: ', this.port, ' PID:', this.phantomProcess.pid);
      callback.call(this);
    }.bind(this));
  },

  startPhantomServer: function (callback) {
    var fetcherScript = path.join(__dirname, '../helpers/phantomjs_fetcher.js');

    freeport(function(er, port) {
      this.port = port;
      this.server = 'http://localhost:' + this.port;

      var childArgs = [fetcherScript, port, ' > /Users/pavel/Sites/google-search-fetcher/phantomjs.log'];
      //console.log(phantomjs.path + ' ' + fetcherScript + ' ' + '"' + url + '"');
      this.phantomProcess = childProcess.execFile(phantomjs.path, childArgs, function(err, stdout, stderr) {
        console.log('Process ' + this.phantomProcess.pid + ' finished');
        /*
        console.log(err, stdout, stderr);
        stdout.split("\n").forEach(function(l) {
          console.log(l);
        });

        stderr.split("\n").forEach(function(l) {
          console.log(l);
        });
        */
      }.bind(this));

      this.waitForServerStarted(function() {
        callback && callback();
      });
    }.bind(this));
  },

  fetchUrlFromApi: function (url, callback) {
    needle.get(url, {timeout: 40000}, function(error, response, body) {
      var data = JSON.parse(body);
      callback && callback(data.headers, data.content, {pageUrl: data.pageUrl, sessionCookies: data.sessionCookies});
    });
  },

  fetchUrl: function (url, callback) {
    this.fetchUrlFromApi(this.server + '/getUrl?url=' + encodeURIComponent(url), callback);
  },

  fetchWords: function (words, callback) {
    this.fetchUrlFromApi(this.server + '/getByWords?q=' + encodeURIComponent(words), callback);
  },

  close: function (callback) {
    this.phantomProcess.on('exit', function() {
      callback && callback();
    });

    this.phantomProcess.kill('SIGHUP');
  },

  waitForServerStarted: function (callback) {
    var interval = setInterval(function() {
      var socket = net.createConnection(this.port);
      socket.on('connect', function() {
        clearInterval(interval);
        //console.log('connected');
        socket.end();
        callback();
      }).on('error', function() {
        //console.log('connection error');
      });
    }.bind(this), 500);
  }
};

Fetcher.session = function (options, callback) {
  sessionMethods.initialize.call(this, options, callback);
};

for (var i in sessionMethods) Fetcher.session.prototype[i] = sessionMethods[i];

for (var ii in Fetcher) exports[ii] = Fetcher[ii];