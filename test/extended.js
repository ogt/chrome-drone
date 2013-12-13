/* global it */
/* global describe */

var assert = require("assert");
var parser = require("../index");

var running = require('is-running')

describe('parser.fetcher', function() {
  this.timeout(50000);

/*
  it('should fetch extended', function(done) {
    var url = 'https://www.google.com/search?q=intercontinental+hotel&' +
      'oq=intercontinental+hotel&aqs=chrome..69i57.226j0j1&sourceid=chrome&ie=UTF-8';
    parser.getExtended(url, function(data) {
      assert.equal(!!data.match(/<html/), true);
      done();
    });
  });

  it('should fetch extended by words', function(done) {
    parser.getExtendedWords('intercontinental hotel', function(data) {
      assert.equal(!!data.match(/<html/), true);
      done();
    });
  });
*/

  it('should open and close sessions (child process)', function(done) {
    var session = new parser.session({}, function() {
      console.log(session.phantomProcess.killed);
      session.close(function() {
        console.log('is running?', running(session.phantomProcess.pid));
        done();
      });
    });
  });

  it('should get html content', function(done) {
    var session = new parser.session({}, function() {
      this.fetchUrl('http://google.com', function(data) {
        console.log(data);
        this.close(done);
      }.bind(this));
    });
  });

});