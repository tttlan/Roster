angular.module('ui.services')


// Url Helper Functions
// ----------------------------------------

.factory('Url', ['$sanitize', function($sanitize) {
    
  var that = this;

    //regex to get all absolute URLs
  var getUrl = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/gi;


  var parseText = function(text) {
        
      if(!text) { return {}; }

      text = $sanitize(text);

        //Parses text, and returns html for clickable links
        // as well as an array of all media link urls to do with what we please

      var mediaArr = [];
        
      var linkedText = text.replace(getUrl, function($1) {
            
          var url = $1;

            // add mailto: the pattern matechs an email address and leave function, no more processing required
          if (/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/.test(url)) {

              url = 'mailto:' + url;
              return '<a href="' + url + '">' + $1 + '</a>';
            }

            // add protocol if its missing
          if (!/^https?:\/\//i.test(url)) {

              url = '//' + url;
            }

            //If this is embeddable lets add it to the media array
          var media = checkEmbeddability(url);
          if(media) {
              mediaArr.push(url);
            }

          return '<a href="' + url + '" target="_blank">' + $1 + '</a>';
        });

      return {
          'text': linkedText,
          'media': mediaArr
        };
    };
  var stripHtml = function(text) {
      return text ? String(text).replace(/(<([^>]+)>)/ig,'') : '';
    };
  var checkEmbeddability = function(url) {

      var retVal = false;
      var matches;
      var videoId;
        
      if(!url) { return false; }

        // Lazy Youtube match
      if ( url.match('youtube|youtu.be') ) {

          if( url.match('embed') ) {

              videoId = url.split(/embed\//)[1].split('"')[0];

            } else {
                
              var youtubeSplit = url.split(/v\/|v=|youtu.be\//);                
                // if they are just pointing to youtube.com with no path, then let's not set a videoId
              if(youtubeSplit.length > 1) {
                  videoId = youtubeSplit[1].split(/[?&]/)[0];
                }
                
            }

          var obj = {
              provider: 'youtube',
              url: '//www.youtube.com/embed/' + videoId + '?rel=0'
            };
          retVal = videoId ? obj : false;

        //Matching Vimeo
        } else if ( url.match(/vimeo.com\/(\d+)/) ) {

          matches = url.match(/vimeo.com\/(\d+)/);
            
          retVal = {
              provider: 'vimeo',
              url: '//player.vimeo.com/video/' + matches[1]
            };

        // Matches ImgUr
        } else if ( url.match(/imgur.com\/[a-zA-Z0-9(]+/) ) {

          retVal = {
              'provider': 'img',
              'url': url
            };
        }
        
      return retVal;
    };

  return {
      'parseText': parseText,
      'checkEmbeddability': checkEmbeddability,
      'stripHtml': stripHtml
    };
}]);