var args = require('system').args;
var querystring = require('./querystring');
var fs = require('fs')

log_line = function (data) {
  var logfile = '/Users/pavel/Sites/google-search-fetcher/phantomjs.log';
  fs.write(logfile, JSON.stringify(data, null, 2) + "\n", 'a');
};

function log(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

phantom.onError = function(msg, trace) {
  var msgStack = ['PHANTOM ERROR: ' + msg];
  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      //msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + 
      //  t.line + (t.function ? ' (in function ' + t.function + ')' : ''));
    });
  }
  log(msgStack.join('\n'));
  phantom.exit(1);
};


preparePage = function(attribute){
  var page = require('webpage').create();

  page.settings.userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) " +
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1677.0 Safari/537.36";
  page.settings.loadImages = false;

  if (phantom.args.indexOf('mobile') != -1) {
    page.settings.userAgent = "Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3_2 like " +
      "Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8H7 Safari/6533.18.5";
    page.settings.userAgent = "Mozilla/5.0 (Linux; U; Android 2.2; en-us; Nexus " +
      "One Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1"
    page.viewportSize = {width: 640, height: 960};
    page.zoomFactor = 1.5;
  }

  page.onError = function(msg, trace) {
    console.log(msg);
    log(trace);
  };

  page.onUrlChanged = function (newUrl) {
    console.log('page.onUrlChanged', newUrl);
    page.requestingUrl = newUrl;
  };

  page.onResourceReceived = function(response) {
    if (response.stage != 'end') return;

    //console.log(page.requestingUrl);
    if (response.url === page.requestingUrl) {
      if (response.status == 301 || response.status == 302) {
        response.headers.forEach(function(el, k) {
          if (el.name == 'Location') page.requestingUrl = el.value;
        });
        //console.log('Redirected to ', page.requestingUrl);
      }

      if (response.status >= 200) {
        page.catchedHeaders = JSON.parse(JSON.stringify(response.headers));
      }
    }

    var host = page.requestingUrl.match(/^(https?:\/\/[^\/]+)/)[1];
    if (response.url.indexOf(host) == 0) {
      page.supposedlyCatchedUrl = response.url;
      page.supposedlyCatchedHeaders = JSON.parse(JSON.stringify(response.headers));
    }
  };

  return page;
},


getPageContent = function (page) {
  page.evaluate(function () {
    $('script').remove();
    $(document.head).append($('<meta>').attr('charset', 'utf-8'));
  });

  var content = page.content;
  content = content.replace(/url\('\/([^\/])/g, "url('https://www.google.com/$1");
  content = content.replace(/url\(\/([^\/])/g, "url(https://www.google.com/$1");
  content = content.replace(/url\("\/([^\/])/g, "url(\"https://www.google.com/$1");
  content = content.replace(/url\(\/\//g, "url(http://");

  return content;
}

sendPageContent = function (page, response) {
  var content = getPageContent(page);

  var data = {
    status: 'ok',
    pageUrl: page.requestingUrl,
    headers: page.catchedHeaders || page.supposedlyCatchedHeaders,
    content: content,
    sessionCookies: phantom.cookies
  };
  response.setHeader('Content-Type', 'application/json');
  response.write(JSON.stringify(data, null, 2));
  response.statusCode = 200;
  response.close();
}

//log_line('loaded');

var server = require('webserver').create();
var service = server.listen(phantom.args[0], function(request, response) {
  log_line('got request');
  log_line(request);

  if (request.url == '/favicon.ico') { response.close(); return; }

  try {
    var path = request.url.replace(/(\?.*)?$/, '').replace(/^\//, '');
    var params = querystring.parse(request.url.replace(/^[^\?]+\?/, ''));

    if (path == 'getUrl') {
      var page = preparePage();

      var url = params.url
      page.requestingUrl = params.url;
      page.open(params.url, function(status) {
        page.injectJs('./helpers/zepto.js');

        sendPageContent(page, response);
        page.close();
      });

    } else if (path == 'getByWords') {
      var words = params.q;

      var page = preparePage();
      page.requestingUrl = 'https://www.google.com/';

      var typeAndSubmit = function() {
        page.evaluate(function(words) {
          Zepto('input[name=q]').val(words);
          Zepto('input[name=q]').closest('form').submit();
        }, words);
      };

      page.onCallback = function(data) {
        page.injectJs('./helpers/zepto.js');

        // first time - fill form
        if (page.url == 'https://www.google.com/') {
          typeAndSubmit();
        } else {
          // second time - respond to API request
          //page.render('googleScreenShot' + '.png');
          sendPageContent(page, response);
          page.close();
        }
      };

      page.onInitialized = function() {
        page.evaluate(function(domContentLoadedMsg) {
          document.addEventListener('DOMContentLoaded', function() {
            window.callPhantom('DOMContentLoaded');
          }, false);
        });
      };

      page.open(page.requestingUrl, function(status) {
        //page.injectJs('./helpers/zepto.js');
      });

    } else {
      response.statusCode = 404;
      response.close();
    }
  } catch (e) {
    log_line(e);
    log(e);

    response.setHeader('Content-Type', 'application/json');
    response.write(JSON.stringify({status: 'error'}, null, 2));
    response.statusCode = 500;
    response.close();
  }
});

//log_line('server started');