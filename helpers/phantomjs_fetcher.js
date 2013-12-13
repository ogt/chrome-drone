var args = require('system').args;
var querystring = require('./querystring');

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

  page.onResourceReceived = function(response) {
    if (response.stage != 'end') return;

    //console.log(page.requestingUrl);
    console.log(response.url, ' ', response.status);
    if (response.url === page.requestingUrl) {
      if (response.status == 301 || response.status == 302) {
        response.headers.forEach(function(el, k) {
          if (el.name == 'Location') page.requestingUrl = el.value;
        });
        console.log('Redirected to ', page.requestingUrl);
      }

      if (response.status >= 200) {
        page.catchedHeaders = JSON.parse(JSON.stringify(response.headers));
      }
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

  //require('fs').write('../7.html', content, 'w');
  return content;
}


/* *\/
if (!url.match(/^https?\/\//)) {
  var relativeScriptPath = require('system').args[0];
  var fs = require('fs');
  var absoluteScriptPath = fs.absolute(relativeScriptPath);
  var absoluteScriptDir = absoluteScriptPath.substring(0, absoluteScriptPath.lastIndexOf('/'));

  url = 'file:///' + absoluteScriptDir + '/../' + url;
}
/* */

var server = require('webserver').create();
var service = server.listen(phantom.args[0], function(request, response) {
  if (request.url == '/favicon.ico') { response.close(); return; }

  try {
    var path = request.url.replace(/(\?.*)?$/, '');
    var params = querystring.parse(request.url.replace(/^[^\?]+\?/, ''));

    if (path == 'getUrl') {
      var page = preparePage();

      var url = params.url
      page.requestingUrl = params.url;
      page.open(params.url, function(status) {
        page.injectJs('./helpers/zepto.js');

        var content = getPageContent(page);

        response.statusCode = 200;
        var data = {
          header: page.catchedHeaders,
          content: content,
          sessionCookies: phantom.cookies
        };
        response.setHeader('Content-Type', 'application/json');
        response.write(JSON.stringify(data, null, 2));
        response.close();

        page.close();
      });
    }
  } catch (e) {
    log(e);
  }
});

/*
var url = phantom.args[0];
url = url.replace(/^('|")?(.+?)('|")?$/, "$2");

page.open(url, function(status) {
  page.injectJs('./helpers/zepto.js');

  page.render("test.png", { format: "png" });

  log(getPageContent(page));
  phantom.exit();
});
*/