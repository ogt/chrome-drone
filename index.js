var fetcher = require('./lib/fetcher');

exports.getStatic = function () {
  return fetcher.getStatic.apply(fetcher, arguments);
};

exports.getStaticWords = function () {
  return fetcher.getStaticWords.apply(fetcher, arguments);
};

exports.getExtended = function () {
  return fetcher.getExtended.apply(fetcher, arguments);
};

exports.getExtendedWords = function () {
  return fetcher.getExtendedWords.apply(fetcher, arguments);
};

exports.session = fetcher.session;