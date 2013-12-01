google-search-fetcher
============
Usage
--
google-search -f <filename> [-p prefix] [-t 10] [-r] [..headers]

Synopsis
--
command line facility that uses google to execute searches and fetch the results

Parameters
--
```
 -f filename
     a text file in UTF-8 encoding with searches
     every line is something that can be entered in a google omnibus )
    if filename - the standard input will be used instead

 -p prefix
     prefix all HTML files created with the string. By default no prefix

 -t max_delay_in_secs
     how much to wait in seconds between each consecutive searches. By default wait 100secs.

 -r randomize Throw a prob : [0..1] dice and wait prob * max_delay_in_secs. (default 1)
 (optional overriding of http headers)
 -accept string
 -accept-enconding string
 -accept-language string
 -user-agent string
```

Description
--

The command does the following
```
 - creates a file `$(prefix)map.csv`  that includes two columns (query, file)
 - goes to `http://google.com` page, obtains the necessary cookies
 - repeat for each query  string in the input file
    go to  https://www.google.com/#q=rayban+glasses  (where "rayban glasses" is the query string
    saves the HTML file as "$prefix$filename_safe_encoded_query_string".html
    adds/flushes the corresponding line to the map.csv file.
    wait prob*max_delay_in_secs
```
The program emulates the headers provided by an uptodate google-chrome (use the headers below)
(unless overridden by the command line parameters)
The program also keeps track and sends back all the cookies set by google during the session.


Configuration
--
[Headers send on initial google.com fetch](https://www.evernote.com/shard/s128/sh/1d27c9b0-455e-4f78-8df7-08dde6a5f2ee/2107af1408c6b9cdfbc4f22e7a48189d/deep/0/Google.png)
```
Headers that should be used:
Request URL:https://www.google.com/
Request Method:GET
Status Code:200 OK
Request Headers
:host:www.google.com
:method:GET
:path:/
:scheme:https
:version:HTTP/1.1
accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
accept-encoding:gzip,deflate,such
accept-language:en-US,en;q=0.8
user-agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.57 Safari/537.36
```
[cookies sent/received in initial request](https://www.evernote.com/shard/s128/sh/ef89dead-3ff5-4b58-9a60-02d7745c3b1c/2346e3ab9e3672d6198c5fe2368c2fe3/deep/0/Google.png)

