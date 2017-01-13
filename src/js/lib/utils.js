
/**
 * Add the _#isNatural which returns true if a natural counting number [0,1,...N]
 */
_.mixin({'isNatural': function(number) {
  return isFinite(number) && (number % 1 === 0) && number >= 0;
}});

// requestAnimationFrame() shim by Paul Irish
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function() {
  return  window.requestAnimationFrame       ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame    ||
      window.oRequestAnimationFrame      ||
      window.msRequestAnimationFrame     ||
      function(/* function */ callback, /* DOMElement */ element){
        window.setTimeout(callback, 1000 / 60);
      };
})();

/**
 * Behaves the same as setInterval except uses requestAnimationFrame() where possible for better performance
 * @param {function} fn The callback function
 * @param {int} delay The delay in milliseconds
 */
window.requestInterval = function(fn, delay) {
  if( !window.requestAnimationFrame       &&
    !window.webkitRequestAnimationFrame &&
    !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
    !window.oRequestAnimationFrame      &&
    !window.msRequestAnimationFrame)
      return window.setInterval(fn, delay);

  var start = new Date().getTime(),
    handle = new Object();

  function loop() {
    var current = new Date().getTime(),
      delta = current - start;

    if(delta >= delay) {
      fn.call();
      start = new Date().getTime();
    }

    handle.value = window.requestAnimFrame(loop);
  }

  handle.value = window.requestAnimFrame(loop);
  return handle;
};

/**
 * Behaves the same as clearInterval except uses cancelRequestAnimationFrame() where possible for better performance
 * @param {int|object} fn The callback function
 */
    window.clearRequestInterval = function(handle) {
    window.cancelAnimationFrame ? window.cancelAnimationFrame(handle.value) :
    window.webkitCancelAnimationFrame ? window.webkitCancelAnimationFrame(handle.value) :
    window.webkitCancelRequestAnimationFrame ? window.webkitCancelRequestAnimationFrame(handle.value) : /* Support for legacy API */
    window.mozCancelRequestAnimationFrame ? window.mozCancelRequestAnimationFrame(handle.value) :
    window.oCancelRequestAnimationFrame ? window.oCancelRequestAnimationFrame(handle.value) :
    window.msCancelRequestAnimationFrame ? window.msCancelRequestAnimationFrame(handle.value) :
    clearInterval(handle);
};

// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.com/#x15.4.4.19
if (!Array.prototype.map) {

  Array.prototype.map = function (callback, thisArg) {

    var T, A, k;

    if (this == null) {
      throw new TypeError(" this is null or not defined");
    }

    // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") {
      throw new TypeError(callback + " is not a function");
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let A be a new array created as if by the expression new Array( len) where Array is
    // the standard built-in constructor with that name and len is the value of len.
    A = new Array(len);

    // 7. Let k be 0
    k = 0;

    // 8. Repeat, while k < len
    while (k < len) {

      var kValue, mappedValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
        kValue = O[k];

        // ii. Let mappedValue be the result of calling the Call internal method of callback
        // with T as the this value and argument list containing kValue, k, and O.
        mappedValue = callback.call(T, kValue, k, O);

        // iii. Call the DefineOwnProperty internal method of A with arguments
        // Pk, Property Descriptor {Value: mappedValue, Writable: true, Enumerable: true, Configurable: true},
        // and false.

        // In browsers that support Object.defineProperty, use the following:
        // Object.defineProperty( A, k, { value: mappedValue, writable: true, enumerable: true, configurable: true });

        // For best browser support, use the following:
        A[k] = mappedValue;
      }
      // d. Increase k by 1.
      k++;
    }

    // 9. return A
    return A;
  };
}

// Array Filter Polyfill
// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
if (!Array.prototype.filter)
{
  Array.prototype.filter = function(fun /*, thisArg */)
  {
    "use strict";

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function")
      throw new TypeError();

    var res = [];
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++)
    {
      if (i in t)
      {
        var val = t[i];

        // NOTE: Technically this should Object.defineProperty at
        //       the next index, as push can be affected by
        //       properties on Object.prototype and Array.prototype.
        //       But that method's new, and collisions should be
        //       rare, so use the more-compatible alternative.
        if (fun.call(thisArg, val, i, t))
          res.push(val);
      }
    }

    return res;
  };
}


var CSS = CSS || {};
/**
 * Generates CSS3's translate3d transformation style for Opera, Chrome/Safari, Firefox and IE
 *
 * @method translate3d
 * @param {Number} x The X axis coordinate
 * @param {Number} y The Y axis coordinate
 * @param {Number} z The Z axis coordinate
 * @param {Number} t The transition time / animation duration, defaults to 0
 * @return {String} The css style code
 */
CSS.translate3d= function(x, y, z, t) {

    t = (typeof t === "undefined") ? 0 : t; //defaults to 0
    var tr = '-webkit-transform: translate3d(' + x + ', ' + y + ', ' + z + '); -webkit-transition-duration: ' + t + 'ms;' +
         '-moz-transform: translate3d(' + x + ', ' + y + ', ' + z + '); -moz-transition-duration: ' + t + 'ms;' +
         '-ms-transform: translate3d(' + x + ', ' + y + ', ' + z + '); -ms-transition-duration: ' + t + 'ms;' +
         '-o-transform: translate(' + x + ', ' + y + '); -o-transition-duration: ' + t + 'ms;' +
         'transform: translate3d(' + x + ', ' + y + ', ' + z + '); transition-duration: ' + t + 'ms;';

    return tr;
};

/**
 * Generates CSS3's scale3d transformation style for Opera, Chrome/Safari, Firefox and IE
 * The scaling is symetric, with the same value for width and height
 *
 * @method scale3d
 * @param {Number} s The scale
 * @param {Number} t The transition time / animation duration, defaults to 0
 * @return {String} The css style code
 */
CSS.scale3d= function(s, t) {
    t = (typeof t === "undefined") ? 0 : t; //defaults to 0
    var tr = '-webkit-transform: scale3d(' + s + ', ' + s + ', 1); -webkit-transition: ' + t + 'ms;' +
         '-moz-transform: scale3d(' + s + ', ' + s + ', 1); -moz-transition: ' + t + 'ms;' +
         '-ms-transform: scale3d(' + s + ', ' + s + ', 1); -ms-transition: ' + t + 'ms;' +
         '-o-transform: scale(' + s + '); -o-transition: ' + t + 'ms;' +
         'transform: scale3d(' + s + ', ' + s + ', 1); transition: ' + t + 'ms;';

    return tr
};

var UTIL = UTIL || {};
UTIL.loadScript = function(src, callback){

  var loaded = false,
    script = document.createElement('script');

  if (callback && typeof callback === 'function') {
    script.onload = function() {
      if (!loaded) {
        callback();
      }
      loaded = true;
    };
  }

  script.setAttribute('src', src);

  document.getElementsByTagName('head')[0].appendChild(script);
};
