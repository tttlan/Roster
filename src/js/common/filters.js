
// Fitlers
// ----------------------------------------


angular.module('ui.common.filters')


/*
 * Reverse the given string
 * 
 * <div>{{string | reverse}}</div>
 * 
 */ 
.filter('reverseString', function() {
  return function(s) {
      return s.split('').reverse().join('');
    };
})


/*
 * Reverse the data
 * Disables the button on click
 * 
 * <div ng-repeat="post in posts | reverse"></div>
 * 
 */   
.filter('reverse', function() {
  return function(items) {
      return items.slice().reverse();
    };
})


/*
 * Convert unsafe html to rendered html
 * 
 * <ANY ng-bind-html="value | unsafe"></ANY>
 * 
 */
.filter('unsafe', function($sce) {
  return function(val) {
      return $sce.trustAsHtml(val);
    };
})


/*
 * Convert unsafe resource to safe
 * 
 * <ANY ng-src="{{ object.src | trusted }}></ANY>
 * 
 */

.filter('trusted', ['$sce', function($sce) {
  return function(url) {
      return $sce.trustAsResourceUrl(url);
    };
}])



// Date Fitlers
// ----------------------------------------


/*
 * Convert date to time from now (mins ago)
 * 
 * {{post.date | fromNow:isShort}}
 * 
 */
.filter('fromNow', ['$window', function($window) {

  var moment = $window.moment;
  moment.locale('enShort', {
      relativeTime : {
          future: 'in %s',
          past:   '%s',
          s:  '%ds',
          m:  '%dm',
          mm: '%dm',
          h:  '%dh',
          hh: '%dh',
          d:  '%dd',
          dd: '%dd',
          M:  '%dmth',
          MM: '%dmth',
          y:  '%dy',
          yy: '%dy'
        }
    });
  moment.locale('en');

  return function(date, isShort) {
      var parsedDate = moment(date);
      if(isShort) {
          parsedDate.locale('enShort');
        }

      return parsedDate.fromNow();

    };
}])

/*
 * Generic date/time filter generator from which to derive specific filters based on different momentjs format strings
 *
 */
.factory('dateTimeFilterFactory', ['TIME_ZONE_ID', 'USE_PROFILE_TZ', function(TIME_ZONE_ID, USE_PROFILE_TZ) {
  return {
      getFilter: function(formatString) {
          if (USE_PROFILE_TZ) {
              return function(date, tzid) {
                    //Default to the hardcoded TZ constant
                  return moment(date).tz((tzid || TIME_ZONE_ID)).format(formatString);
                };
            }
            else {
              return function(date, tzid) {
                  return tzid ? moment.tz(date, tzid).format(formatString) : moment(date).format(formatString);
                };
            }
        }
    };

}])

/*
 * Convert date to 12th Mar 2014, 5:55 pm
 *
 * {{post.date | dateTime}}
 * 
 */
.filter('dateTime', ['dateTimeFilterFactory', function(dateTimeFilterFactory) {
  return dateTimeFilterFactory.getFilter('Do MMM YYYY, h:mm a');
}])

/*
 * Convert date to 12th Mar 2014
 *
 * {{post.date | dateOnly}}
 */
.filter('dateOnly', ['dateTimeFilterFactory', function(dateTimeFilterFactory) {
  return dateTimeFilterFactory.getFilter('Do MMM YYYY');
}])

/*
 * Convert date to 12/04/2014, 5:55 PM
 * 
 * {{post.date | dateTimeShort}}
 * 
 */
.filter('dateTimeShort', ['dateTimeFilterFactory', function(dateTimeFilterFactory) {
  return dateTimeFilterFactory.getFilter('D/MM/YYYY, h:mm a');
}])

/*
 * Convert date to 12/04/2014, 5:55 PM
 *
 * {{post.date | dateTimeShort}}
 *
 */
    .filter('dateShort', ['dateTimeFilterFactory', function(dateTimeFilterFactory) {
      return dateTimeFilterFactory.getFilter('D/MM/YYYY');
    }])

/*
 * Convert date to day only eg: 12th Mar 2014, 5:55 PM becomes 12
 * 
 * {{post.date | day}}
 * 
 */
.filter('day', ['dateTimeFilterFactory', function(dateTimeFilterFactory) {
  return dateTimeFilterFactory.getFilter('D');
}])

/*
 * Convert date to month only eg: 12th Mar 2014, 5:55 PM becomes March
 * 
 * {{post.date | month}}
 * 
 */
.filter('month', ['dateTimeFilterFactory', function(dateTimeFilterFactory) {
  return dateTimeFilterFactory.getFilter('MMMM');
}])

/*
 * Convert date to month only eg: 12th Mar 2014, 5:55 PM becomes March
 * 
 * {{post.date | monthAbbrv}}
 * 
 */
.filter('monthAbbrv', ['dateTimeFilterFactory', function(dateTimeFilterFactory) {
  return dateTimeFilterFactory.getFilter('MMM');
}])

/*
 * Convert date to time only only eg: 12th Mar 2014, 5:55 PM becomes 5:55 PM
 * 
 * {{post.date | time}}
 *
 */
.filter('time', ['dateTimeFilterFactory', function(dateTimeFilterFactory) {
  return dateTimeFilterFactory.getFilter('h:mm A');
}])

/*
 * Convert date to be the date stamp only eg: 12th Mar 2014, 5:55 PM becomes 2014-03-12
 *
 * {{post.date | dateTime}}
 * 
 */
.filter('dateStamp', ['dateTimeFilterFactory', function(dateTimeFilterFactory) {
  return dateTimeFilterFactory.getFilter('YYYY-MM-DD');
}])

/*
 * Convert a date to be the end of that day
 */

.filter('endOfDay', ['TIME_ZONE_ID', 'USE_PROFILE_TZ', function(TIME_ZONE_ID, USE_PROFILE_TZ) {
  if (USE_PROFILE_TZ) {
      return function(date, tzid) {
            //Default to the hardcoded TZ constant
          return moment(date).tz((tzid || TIME_ZONE_ID)).endOf('day').toDate();
        };
    }
    else {
      return function(date) {
          return moment(date).endOf('day').toDate();
        };
    }
}])

/*
 * Convert a date to be the beginning end of that day
 */

.filter('startOfDay', ['TIME_ZONE_ID', 'USE_PROFILE_TZ', function(TIME_ZONE_ID, USE_PROFILE_TZ) {
  if (USE_PROFILE_TZ) {
      return function(date, tzid) {
            //Default to the hardcoded TZ constant
          return moment(date).tz((tzid || TIME_ZONE_ID)).startOf('day').toDate();
        };
    }
    else {
      return function(date) {
          return moment(date).startOf('day').toDate();
        };
    }
}])

/*
 * Convert UTC datetime to Local datetime
 *
 * {{ post.date | utcToLocal }}
 *
 */
.filter('utcToLocal', function() {
    return function(date) {
        return moment.utc(date).local();
    };
})

/*
 * Determine format type for datetime
 * All format patterns here : http://momentjs.com/docs/#/parsing/string-format/
 * {{post.date | dateTimeFormat: 'formatPatten'}
 *
 */
.filter('dateTimeFormat', ['dateTimeFilterFactory', function(dateTimeFilterFactory) {
    return function(date, formatString) {
        return dateTimeFilterFactory.getFilter(formatString)(date);
    };
}])


/*
 * Convert date to the day of the week e.g 12th Dec 2015, 5:55 PM becomes Saturday
 *
 */
.filter('dayOfWeek', ['dateTimeFilterFactory', function(dateTimeFilterFactory) {
  return dateTimeFilterFactory.getFilter('dddd');
}])

.filter('utcToLocaleDateTime', ['$filter', function($filter) {
    // create utc for any object and convert it to local timezone
    return function(date, withTime) {
        return $filter('dateTime')(moment.utc(date).toDate(), withTime);
    };
}])
.filter('localeToUtcDateTime', ['$filter', function($filter) {
    // get any timezone object and convert it into timezone
    return function(date, withTime) {
        return $filter('dateTime')(moment.utc(date), withTime);
    };
}])

.filter('localise', function() {
    return function(date) {
        //Set date as the server's timezone  ?? reason for this localise, the server will serve date as UTC
                                               // date should be used as UTC standard
        return moment.tz(date, 'Australia/Sydney').format();
    };
})

/*
 * Convert to Delocalised DateTime ( currently AEST )
 * 
 * $filter('dateTime')(SQLDateTimeObj)
 * 
 */
.filter('delocalise', ['TIME_ZONE_ID', function(TIME_ZONE_ID) {
  return function(date) {

        //Get the server's timezone
      var AEDTOffset = moment.tz(new Date(), TIME_ZONE_ID).zone();

        //Offset the dateTime to that of the server, and format it.
      return moment(date).zone(AEDTOffset).format('YYYY-MM-DD[T]HH:mm:ss');

    };
}])

/*
 * Convert to utc timestamp safe for .Net (no milliseconds!)
 */
.filter('utcTimestamp', function() {
  return function(date) {
        //Offset the dateTime to that of the server, and format it.
      return moment(date).utc().format('YYYY-MM-DD[T]HH:mm:ss[Z]');

    };
})

/*
 * Convert to timestamp safe for .Net (no milliseconds!)
 */
.filter('localTimestamp', ['dateTimeFilterFactory', function(dateTimeFilterFactory) {
  return dateTimeFilterFactory.getFilter('YYYY-MM-DD[T]HH:mm:ss');
}])

/*
 * Convert number into a percentage
 * 
 * {{course.completedModules / course.totalModules | percentage}}
 * 
 */
.filter('percentage', ['$filter', function($filter) {
  return function(input, decimals) {
        
      var percentage;
        
      input = isNaN(input) ? 0 : input;

      decimals = decimals || 0;

      if(input < 0.01 && input !== 0 && decimals === 0) {

          percentage = '< 1';

        } else {

          percentage = $filter('number')(input*100, decimals);

        }

      return percentage + '%';
    };
}])

/*
 * Convert link into an absolute URL
 * 
 * {{ link | absoluteUrl}}
 * 
 */
.filter('absoluteUrl', [function() {

  return function(url) {

      if(url.length) {
            // If the URL doesn't contain // we are going to add '//' to it.     
          if( url.indexOf('//') === -1 ) {
              url = '//' + url;
            }
        }
        
      return url;

    };

}])

/*
 * Convert link into an absolute URL
 *
 * {{ sample!!!string | replace:!!!:@@@ }}
 *
 */

.filter('replace', [function() {

    return function(string, search, replace) {

        if (string.length) {
            string = string.replace(search, replace);
        }

        return string;
    };
}])

/*
 * Convert link into an absolute URL.  Spaces are added after the index so in the below example a space is added after chars 3 and 6
 *
 * {{ 111222333 | space:[3,6] }}
 *
 * Result: 111 222 333
 *
 */

.filter('space', [function() {

    return function(string, spaces) {

        if (string && string.length) {
            for (let i = spaces.length; i > 0; i--) {
                string = string.substring(0, spaces[i-1]) + ' ' + string.substring(spaces[i-1], string.length);
            }
        }

        return string;
    };
}])

/*
 * Convert camel case text so that there are spaces between caps letters.  Also make all chars lowercase expect the first
 *
 * {{ CamelCaseStringOfText | splitUpper }}
 *
 * Result: Camel case string of text
 *
 */

.filter('camelToRegular', function() {

    return function(string) {

        if(!string) { return string; }

        var result = '',
            strArray = string.split(/(?=[A-Z])/);

        for (var i = 0; i < strArray.length; i++) {
            result += (i > 0) ? ' ' + strArray[i].toLowerCase() : strArray[i];
        }

        return result;
    };
})


/*
 * Limit string
 * 
 * {{ longText | textLimit:100 }}
 * 
 */
.filter('textLimit', [function() {

  return function(text, limit) {
        
      if(!text) { return; }

      if( text.length > limit ) {
            
          text = text.substring(0, limit).replace(/\w+$/,'').trim() + '...';

        }

      return text;
    };
}])

/*
 * HTML to Plain text
 * 
 * {{ HTMLSTRING | htmlToPlainText }}
 * 
 */
.filter('htmlToPlainText', function() {
  return function(text) {
      return String(text).replace(/<[^><]+>/gm, '').replace('&nbsp;',' ');
    };
})

/*
 * Remove trailing space
 *
 * {{ String | removeTrailingSpace }}
 *
 */
.filter('removeTrailingSpace', function() {
  return function(text) {
      return text.replace(/^\s+|\s+$/g,'');
    };
})

/*
 * Convert file size to bytes
 * 
 * {{ num | toBytes }}
 * 
 */
.filter('toBytes', function() {
  return function(bits) {
      var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      if (bits === 0) { return 'n/a'; }
      var i = parseInt(Math.floor(Math.log(bits) / Math.log(1024)));
      return Math.round(bits / Math.pow(1024, i), 2) + ' ' + sizes[i];
    };
})

/*
 * Return the file extension of a filename
 *
 * {{ 'something.pdf' | fileExtension }}
 *
 * The above example would return the string pdf
 *
 */

.filter('fileExtension', function() {
    return function(string) {
        var dotArray = string.split('.');
        return dotArray[dotArray.length - 1];
    };
})

/*
 * Cut string to shorter length
 * 
 * {{ some_text | cut:true:100:' ...' }}
 * 
 * wordwise (boolean) - if true, cut only by words bounds,
 * max (integer) - max length of the text, cut to this number of chars,
 * tail (string, default: ' …') - add this string to the input string if the string was cut.
 * 
 */
.filter('cut', function() {

  return function(value, wordwise, max, tail) {
        
      if (!value) {
          return '';
        }

      max = parseInt(max, 10);
        
        // If there is no max we can exiting the function here
      if (!max) {
          return value;
        }
        
        // If string is less than the max we can exit the function here
      if (value.length <= max) {
          return value;
        }

        // A tail that is an empty string is valid 
      if (tail === undefined) {
          tail = ' ...';
        }

        // Cut the string, even if it is mid word
      value = value.substr(0, max);

        // If we are preserving words, cut any half words or even a whole word at the end of the sentence.  This is not smart enough to figure out if the last word is whole or half
      if (wordwise) {
          var lastspace = value.lastIndexOf(' ');
          if (lastspace !== -1) {
                // Cut the string after the last word
              value = value.substr(0, lastspace);
            }
        }

      return value + tail;
    };
})

/*
 * Format phone numbers
 *
 * {{ a_phone_number | tel }}
 *
 * Note this only formats Australian phone numbers
 *
 */

.filter('tel', function() {

    return function(tel) {

        if (!tel) { return ''; }

        var value = tel.toString().replace(/\s+/g, '').replace(/^\+/, '');

        if (value.match(/[^0-9]/)) { // If it starts with a letter, bail
            return tel;
        }

        // Function that inserts a substring into a string
        function insertIntoString(str, index, addedStr) {
            return str.substring(0, index) + addedStr + str.substring(index, str.length);
        }

        if ((value.length > 10) && (value.substring(0, 2) === '61')) { // Sort out international numbers

            // Add in + and space around international code
            value = insertIntoString(value, 0, '+');
            value = insertIntoString(value, 3, ' ');

            if (value.length === 13) {
                if (value.indexOf(4) === 4) { // eg +61 404 404 040
                    value = insertIntoString(value, 7, ' ');
                    value = insertIntoString(value, 11, ' ');
                } else { // eg. +61 3 8611 4900
                    value = insertIntoString(value, 5, ' ');
                    value = insertIntoString(value, 10, ' ');
                }
            } else if (value.length === 14) { // eg. +61 0404 404 040
                value = insertIntoString(value, 8, ' ');
                value = insertIntoString(value, 12, ' ');
            }

        } else if ((value.length === 10) && // Has a length of 10 and the first two digits are 04, 13 or 18
            ((value.substring(0, 2) === '04') ||
             (value.substring(0, 2) === '13') ||
             (value.substring(0, 2) === '18'))) { // Mobile number or 1300 or 1800 number

            value = insertIntoString(value, 4, ' ');
            value = insertIntoString(value, 8, ' ');

        } else if (value.length === 10) { // If the number isn't a mobile but is 10 digits it has an area code

            value = insertIntoString(value, 0, '(');
            value = insertIntoString(value, 3, ') ');
            value = insertIntoString(value, 9, ' ');

        } else if (value.length === 8) { // If the number isn't a mobile but has 10 digits (ie no area code)

            value = insertIntoString(value, 4, ' ');

        } else if (value.length === 6) { // If the number isn't a mobile but has 6 digits (ie 13 number)

            value = insertIntoString(value, 3, ' ');
        }

        return value;
    };
});
