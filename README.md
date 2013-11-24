chrome-drone
============

Chrome extension that allows a remote service to tell your browser where to go
--
This chrome-extension, when enabled forced the browser to go to the following loop
```
repeat for ever
    ask web service for url to go to
    go to url
    post to web service the HTML that was fetched from that URL
    wait 100 secomds
```

The chrome extension can be locally tested: a configurable filename is expected to contain a list of URLs, then the 
extension will loop through these URLs just as if they were returned sequentially from the web service above.
The HTMLs should be stored in a /tmp/chrome-drone folder, use the slugify-url npm module to map urls to filenames.
