'use strict';

var DAY = 24 * 60 * 60 * 1000;
var MIN = 60 * 1000;
var START_DAY = new Date(2015, 0, 1, 17, 30, 0, 0).valueOf();
var NOT_BEFORE = 10 * DAY;
var NOT_AFTER = 5 * DAY;
var EXPIRES_AT = START_DAY + NOT_BEFORE + (15 * MIN);
var RENEWABLE_DAY = EXPIRES_AT - (60 * MIN);
var CERT_1 = {
  expiresAt: EXPIRES_AT
, subject: 'example.com'
, altnames: ['example.com', 'www.example.com']
};
var CERT_2 = {
  expiresAt: EXPIRES_AT + NOT_BEFORE + (60 * MIN)
, subject: 'example.com'
, altnames: ['example.com', 'www.example.com']
};

var count = 0;
var expectedCount = 3;
var tests = [
  function (domain, certs, cb) {
    count += 1;
    console.log('#1 is 1 of 3');
    if (!domain) {
      throw new Error("should have a domain");
    }

    if (certs) {
      console.log('certs');
      console.log(certs);
      throw new Error("shouldn't have certs that don't even exist yet");
    }

    cb(null, CERT_1);
  }
, function (/*domain, certs, cb*/) {
    console.log('#2 should NOT be called');
    throw new Error("Should not call register renew a certificate with more than 10 days left");
  }
, function (domain, certs, cb) {
    count += 1;
    console.log('#3 is 2 of 3');
    // NOTE: there's a very very small chance this will fail occasionally (if Math.random() < 0.01)
    if (!certs) {
      throw new Error("should have certs to renew (renewAt)");
    }

    cb(null, CERT_1);
  }
, function (domain, certs, cb) {
    count += 1;
    console.log('#4 is 3 of 3');
    if (!certs) {
      throw new Error("should have certs to renew (expiresNear)");
    }

    cb(null, CERT_2);
  }
, function (/*domain, certs, cb*/) {
    console.log('#5 should NOT be called');
    throw new Error("Should not call register renew a certificate with more than 10 days left");
  }
].map(function (fn) {
  return require('bluebird').promisify(fn);
});

// opts = { notBefore, notAfter, letsencrypt.renew, letsencrypt.register, httpsOptions }
var leSni = require('./').create({
  notBefore: NOT_BEFORE
, notAfter: NOT_AFTER
, getCertificatesAsync: tests.shift()
, _dbg_now: START_DAY
});

leSni.sniCallback('example.com', function (err, tlsContext) {
  if (err) { throw err; }
  if (!tlsContext._fake_tls_context_) {
    throw new Error("Did not return tlsContext 0");
  }
  leSni.getCertificatesAsync = tests.shift();




  leSni.sniCallback('example.com', function (err, tlsContext) {
    if (err) { throw err; }
    if (!tlsContext._fake_tls_context_) {
      throw new Error("Did not return tlsContext 1");
    }
    leSni.getCertificatesAsync = tests.shift();

    leSni._dbg_now = RENEWABLE_DAY;




    leSni.sniCallback('example.com', function (err, tlsContext) {
      if (err) { throw err; }
      if (!tlsContext._fake_tls_context_) {
        throw new Error("Did not return tlsContext 2");
      }
      leSni.getCertificatesAsync = tests.shift();

      leSni._dbg_now = EXPIRES_AT;




      leSni.sniCallback('example.com', function (err, tlsContext) {
        if (err) { throw err; }
        if (!tlsContext._fake_tls_context_) {
          throw new Error("Did not return tlsContext 2");
        }
        leSni.getCertificatesAsync = tests.shift();




        leSni.sniCallback('example.com', function (err, tlsContext) {
          if (err) { throw err; }
          if (!tlsContext._fake_tls_context_) {
            throw new Error("Did not return tlsContext 2");
          }

          if (expectedCount === count && !tests.length) {
            console.log('PASS');
            return;
          }

          throw new Error("only " + count + " of the register getCertificate were called");
        });




      });
    });
  });
});
