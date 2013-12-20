/**
 * querystring
 *
 * This module provides utilities for dealing with query strings.
 */

var querystring = (function() {

  function stringifyPrimitive(v) {
    switch (typeof v) {
      case 'string':
        return v;
  
      case 'boolean':
        return v ? 'true' : 'false';
  
      case 'number':
        return isFinite(v) ? v : '';
  
      default:
        return '';
    }
  }

  return {
    /**
     * Serialize an object to a query string.
     *
     * Optionally override the default separator ('&') and assignment ('=')
     * characters.
     *
     * Examples:
     *
     *     querystring.stringify({ foo: 'bar', baz: ['qux', 'quux'], corge: '' })
     *     // returns
     *     'foo=bar&baz=qux&baz=quux&corge='
     *
     *     querystring.stringify({foo: 'bar', baz: 'qux'}, ';', ':')
     *     // returns
     *     'foo:bar;baz:qux'
     *
     * @param {Object} obj
     * @param {String} sep
     * @param {String} eq
     * @api public
     */
    stringify: function(obj, sep, eq, name) {
      sep = sep || '&';
      eq = eq || '=';
      if (obj === null) {
        obj = undefined;
      }
    
      if (typeof obj === 'object') {
        return Object.keys(obj).map(function(k) {
          var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
          if (Array.isArray(obj[k])) {
            return obj[k].map(function(v) {
              return ks + encodeURIComponent(stringifyPrimitive(v));
            }).join(sep);
          } else {
            return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
          }
        }).join(sep);
    
      }
    
      if (!name) return '';
      return encodeURIComponent(stringifyPrimitive(name)) + eq +
             encodeURIComponent(stringifyPrimitive(obj));
    },
  
    /**
     * Deserialize a query string to an object.
     *
     * Optionally override the default separator ('&') and assignment ('=')
     * characters.
     *
     * Options object may contain maxKeys property (equal to 1000 by default),
     * it'll be used to limit processed keys. Set it to 0 to remove key count
     * limitation.
     *
     * Examples:
     *
     *     querystring.parse('foo=bar&baz=qux&baz=quux&corge')
     *     // returns
     *     { foo: 'bar', baz: ['qux', 'quux'], corge: '' }
     *
     * @param {String} qs
     * @param {String} sep
     * @param {String} eq
     * @param {Object} options
     * @api public
     */
    parse: function(qs, sep, eq, options) {
      sep = sep || '&';
      eq = eq || '=';
      var obj = {};
    
      if (typeof qs !== 'string' || qs.length === 0) {
        return obj;
      }
    
      var regexp = /\+/g;
      qs = qs.split(sep);
    
      var maxKeys = 1000;
      if (options && typeof options.maxKeys === 'number') {
        maxKeys = options.maxKeys;
      }
    
      var len = qs.length;
      // maxKeys <= 0 means that we should not limit keys count
      if (maxKeys > 0 && len > maxKeys) {
        len = maxKeys;
      }
    
      for (var i = 0; i < len; ++i) {
        var x = qs[i].replace(regexp, '%20'),
            idx = x.indexOf(eq),
            kstr, vstr, k, v;
    
        if (idx >= 0) {
          kstr = x.substr(0, idx);
          vstr = x.substr(idx + 1);
        } else {
          kstr = x;
          vstr = '';
        }
    
        k = decodeURIComponent(kstr);
        v = decodeURIComponent(vstr);
    
        if (!obj.hasOwnProperty(k)) {
          obj[k] = v;
        } else if (Array.isArray(obj[k])) {
          obj[k].push(v);
        } else {
          obj[k] = [obj[k], v];
        }
      }
    
      return obj;
    }
  };

})();

exports.parse = querystring.parse;
exports.stringify = querystring.stringify;