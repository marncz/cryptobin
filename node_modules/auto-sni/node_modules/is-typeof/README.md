# is-typeof
Lightweight library for better type checking in JavaScript.

# Installation

#### Npm
```console
npm install is-typeof
```

# Examples

```javascript
var isType = require('is-typeof');

// String
isType.string("hello"); // true
isType.string(1); // false

// Number
isType.number(1); // true
isType.number("hello"); // false

// Boolean
isType.boolean(true); // true
isType.boolean(1); // false

// Date
isType.date(new Date); // true
isType.date(1); // false

// RegExp
isType.regexp(/a/g); // true
isType.regexp(1); // false

// Error
isType.error(new TypeError("Bad!")); // true
isType.error(1); // false

// Function
isType.function(function () {}); // true
isType.function(1); // false

// Arguments
(function () {
	isType.arguments(arguments); // true
	isType.arguments([]); // false
}());

// Object
isType.object({}); // true
isType.object([]); // false

// Array
isType.array([]); // true
isType.array({}); // false

// Stream
isType.stream(fs.createReadStream(...)); // true
isType.stream({}); // false

// Buffer
isType.buffer(new Buffer("")); // true
isType.buffer(""); // false

// Empty
isType.empty([]); // true
isType.empty([1]); // false
```

### See tests for more examples.

### Contributions

* Use `npm test` to run tests.

Please feel free to create a PR!
