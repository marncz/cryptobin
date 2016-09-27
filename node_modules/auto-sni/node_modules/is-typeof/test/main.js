var test = require('tape')
var fs = require('fs')
var path = require('path')
var Stream = require('stream')
var isType = require('../')

/* eslint-disable */
var examples = {
  string: ['', 'a', new String(), new String('a'), new String(1)],
  number: [1, 0, Infinity, new Number(), new Number('a'), new Number(1)],
  boolean: [true, false, new Boolean(), new Boolean('a'), new Boolean(1)],
  date: [new Date(), new Date('a'), new Date(1)],
  regexp: [/.*/, new RegExp(), new RegExp('.*')],
  error: [new Error()],
  function: [function () {}, new Function()],
  arguments: [arguments],
  object: [{}, new Object()],
  array: [[], new Array()],
  stream: [new Stream(), fs.createReadStream(path.join(__dirname, '/../package.json'))],
  buffer: [new Buffer('')]
}
/* eslint-enable */
var totalExamples = Object
  .keys(examples)
  .map(function (key) { return examples[key].length })
  .reduce(function (a, b) { return a + b })

var similar = {
  string: ['string'],
  number: ['number'],
  boolean: ['boolean'],
  date: ['date'],
  regexp: ['regexp'],
  error: ['error'],
  function: ['function'],
  arguments: ['arguments'],
  object: ['object', 'stream'],
  array: ['array'],
  stream: ['stream'],
  buffer: ['buffer']
}

// Test each function against eachothers types.
Object.keys(examples).forEach(function (testType) {
  test('should validate ' + testType + ' types', function (t) {
    t.plan(totalExamples)
    Object.keys(examples).forEach(function (type) {
      var isValid = Boolean(~similar[testType].indexOf(type))
      examples[type].forEach(function (value) {
        t.equal(isType[testType](value), isValid,
          testType + ' ' + (isValid ? 'is' : 'isnt') + ' ' + type +
          ' (' + toString(value) + ')'
        )
      })
    })
  })
})

test('should validate Empty types', function (t) {
  var emptyExamples = [[], {}, 0, null, undefined, '']
  var notEmptyExamples = [[1], { a: 1 }, 'hello']

  t.plan(emptyExamples.length + notEmptyExamples.length)

  emptyExamples.forEach(function (value) {
    t.equal(isType.empty(value), true, '(' + toString(value) + ') ' + 'should be empty')
  })

  notEmptyExamples.forEach(function (value) {
    t.equal(isType.empty(value), false, '(' + toString(value) + ') ' + 'should not be empty')
  })
})

function toString (val) {
  try {
    return JSON.stringify(val).slice(0, 30)
  } catch (_) {
    return String(val)
  }
}
