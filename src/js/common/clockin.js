// Define Global Sherpa
var SHRP = SHRP || {};
SHRP.data = SHRP.data || {};

// Clockin Application
// ------------------------------------------------

SHRP.clockin = (function() {

  var options = {
        hideNumber: true,
        redirect: true
      },
      pin = [],
      region = $('.clockin'),
      timer,
      $inputs = null,
      $nums,
      init = function(opts) {
      $('.no-js').removeClass('no-js');
      $.extend( true, options, opts );
      $inputs = region.find('.clockin__pin-display .field input');
      $nums = region.find('.clockin__pin-pad');

      focusForm();
      initTime();
      layout();
      events();
      redirect();
        // resize functions
      resize(function() {
          layout();
        });
    },

    // Timer

      initTime = function() {
      var $time = region.find('.js-time');
      $time.html(getTime());
        
      var s = setInterval(function() {
          $time.html(getTime());
        }, 10000);
    },

      getTime = function() {
      var ampm = 'PM',
          time,
          d = new Date(),
          h = d.getHours(),
          m = d.getMinutes(),
          s = d.getSeconds();

      if (h < 12) { ampm = 'AM'; }
      if (h > 12) { h -= 12; }    

      if (s<=9) { s='0'+s; }
      if (m<=9) { m='0'+m; }
        //if (h<=9) { h='0'+h; }

      time = h+':'+m+'<span>:'+ampm+'</span>';

      return time;
    },

      focusForm = function() {
      var $ci =  $('.clockin__dummy-input');
      $ci.focus();
      setInterval(function() {
          $ci.focus();
        },2000);
    },

      redirect = function() {

      var r = $('.js-redirect-this'), t;
      if (r.length && options.redirect) {
          t = r.data('time');

          timer = setTimeout(function() {
              document.location.href = r.attr('href');
            }, t);
        }
    },

    // Key events

      events = function() {

        // number pad
      region.on('click', '.js-num', function(e) {
          handleNumInput($(this).text());
          e.preventDefault();
        });

        // backspace button
      region.on('click', '.js-backspace', function(e) {
          pin.pop();
          updateInputs(pin);
          e.preventDefault();
        });

        // go button
      region.on('click', '.js-go', function(e) {
          var $this = $(this);
            // dont allow if too short
          if (pin.length < 4) {
              return false;
            }
            // disable on first click
          if ($this.is('.num--disabled')) {
              e.preventDefault();
            } else {
              $this.addClass('num--disabled');
            }
        });

        // key event
      $(document).on('keypress', function(e) {
            
          var charCode = e.which || e.keyCode,
              charStr = String.fromCharCode(charCode);
            // Is Num    
          if (!isNaN(charStr)) {
              handleNumInput(charStr);
              highlightPad(charStr);
            }

          clearTimeout(timer);
          redirect();

        });

        // key down event
      $(document).on('keydown', function(e) {
            
          var charCode = e.which || e.keyCode,
              charStr = String.fromCharCode(charCode),
              pinpage = region.find('.field--digit');

            // is backspace || delete
          if (e.keyCode === 46 || e.keyCode === 8) {
              if (pinpage.length) {
                  if (pin.length) {
                      pin.pop();
                      updateInputs(pin);
                    }
                  highlightPad('back');
                  return false;
                }
            }

        });

    },

      handleNumInput = function(val) {
      if (pin.length < 4) {
          pin.push(val);
          updateInputs(pin);
        }
    },

      updateInputs = function(arr) {
      $inputs.each(function(i, v) {
          var val = arr[i],
              input = $(v);
            
            // update value
          input.val(val);

            // toggle field cover
          if (options.hideNumber) {
              if (typeof val === 'undefined') {
                  input.parent().removeClass('field--password');
                } else {
                  input.parent().addClass('field--password'); 
                }
            }
        });
    },

      highlightPad = function(val) {
      var num = $nums.find('.num[data-num="' + val + '"]');
      num.addClass('num--active');
      setTimeout(function() {
          num.removeClass('num--active');
        }, 100);
    },

    // Layout

      layout = function() {
      region.css({
          'minHeight' : $(window).height()
        });
        // choose page
      region.find('.clockin__choose').css({
          height : $(window).height()/2
        });
    },

      resize = function( c, t ) {
      var resizeEvent='onorientationchange' in window ? 'orientationchange' : 'resize';
      $(window).on(resizeEvent, function() {
          clearTimeout(t);
          if(resizeEvent==='resize') { 
              t=setTimeout(c,50);
            } else { c(); }
        });
    };

  return {
      init: init
    };

})();