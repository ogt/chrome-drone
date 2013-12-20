/* global it */
/* global describe */

var assert = require("assert");
var fetcher = require("../index");

var running = require('is-running');

describe('fetcher.fetcher', function() {
  this.timeout(50000);

/*
  it('should fetch extended', function(done) {
    var url = 'https://www.google.com/search?q=intercontinental+hotel&' +
      'oq=intercontinental+hotel&aqs=chrome..69i57.226j0j1&sourceid=chrome&ie=UTF-8';
    fetcher.getExtended(url, function(data) {
      assert.equal(!!data.match(/<html/), true);
      done();
    });
  });

  it('should fetch extended by words', function(done) {
    fetcher.getExtendedWords('intercontinental hotel', function(data) {
      assert.equal(!!data.match(/<html/), true);
      done();
    });
  });
*/

  it('should open and close sessions (child process)', function(done) {
    var session = new fetcher.session({}, function() {
      session.close(function() {
        assert.equal(running(session.phantomProcess.pid), false);
        done();
      });
    });
  });

  it('should get html content', function(done) {
    var session = new fetcher.session({}, function() {
      this.fetchUrl('http://google.com/', function(headers, html, extraData) {
        console.log(headers);
        this.close(done);
      }.bind(this));
    });
  });

});