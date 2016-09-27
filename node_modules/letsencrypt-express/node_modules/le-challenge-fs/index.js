'use strict';

var fs = require('fs');
var path = require('path');

var defaults = {
  //webrootPath: [ '~', 'letsencrypt', 'var', 'lib' ].join(path.sep)
  webrootPath: require('os').tmpdir() + path.sep + 'acme-challenge'
, debug: false
};

var Challenge = module.exports;

Challenge.create = function (options) {
  var results = {};

  Object.keys(Challenge).forEach(function (key) {
    results[key] = Challenge[key];
  });
  results.create = undefined;

  Object.keys(defaults).forEach(function (key) {
    if ('undefined' === typeof options[key]) {
      options[key] = defaults[key];
    }
  });
  results._options = options;

  results.getOptions = function () {
    return results._options;
  };

  return results;
};

//
// NOTE: the "args" here in `set()` are NOT accessible to `get()` and `remove()`
// They are provided so that you can store them in an implementation-specific way
// if you need access to them.
//
Challenge.set = function (args, domain, challengePath, keyAuthorization, done) {
  var mkdirp = require('mkdirp');

  mkdirp(args.webrootPath, function (err) {
    if (err) {
      done(err);
      return;
    }

    fs.writeFile(path.join(args.webrootPath, challengePath), keyAuthorization, 'utf8', function (err) {
      done(err);
    });
  });
};


//
// NOTE: the "defaults" here are still merged and templated, just like "args" would be,
// but if you specifically need "args" you must retrieve them from some storage mechanism
// based on domain and key
//
Challenge.get = function (defaults, domain, key, done) {
  fs.readFile(path.join(defaults.webrootPath, key), 'utf8', done);
};

Challenge.remove = function (defaults, domain, key, done) {
  fs.unlink(path.join(defaults.webrootPath, key), done);
};
