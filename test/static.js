/* global it */
/* global describe */

var assert = require("assert");
var parser = require("../index");

describe('parser.fetcher', function() {
  this.timeout(15000);

  it('should fetch static html version', function(done) {
    var url = 'https://www.google.com/search?q=intercontinental+hotel&btnG=Search&' +
      'aqs=chrome..69i57.4131j0j9&gbv=1&hl=en&nfpr=&spell=1';
    parser.getStatic(url, function(data) {
      assert.equal(!!data.match(/<html/), true);
      done();
    })
  });

  it('should fetch by words', function(done) {
    parser.getStaticWords('intercontinental hotel', function(data) {
      assert.equal(!!data.match(/<html/), true);
      done();
    });
  });
});