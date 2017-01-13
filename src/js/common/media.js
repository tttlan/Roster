angular.module('ui.common')

/*
 * <media id=""></media>
 *
 */

// Directive to handle all media content that has been uploaded to our servers
// It makes the download call, sorts out the filetype and displays what is needed
// ------------------------------------------------

.directive('media', ['FileStorage', '$server', '$sce', '$timeout', 
    function(FileStorage, $server, $sce, $timeout) {
      return {
      restrict: 'E',
      replace: true,
      templateUrl: '/interface/views/common/partials/media.html',
      scope: {
          file: '=',
          hideLoader: '@'
        },
      link: function($scope, $element, $attrs) {
            
          if(!$scope.file) { return false; }


          var MEDIA_TYPES = {
              'pdf': ['.pdf'],
              'image': ['.jpg', '.jpeg', '.gif', '.png'],
              'video': ['.mp4', '.avi']
            };

          function getMedia(ext) {
                
              var selectedType = 'other';

              ext = ext.toLowerCase();
                
              angular.forEach(MEDIA_TYPES, function(type, name) {
                    
                  if( type.indexOf(ext) !== -1 ) {
                      selectedType = name;
                      return;
                    }
                });

              return selectedType;            
            }

          function loadVideoPlayer() {
                                
              $timeout(function() {
                  var video = $element.find('video')[0];

                  $scope.videoPlayer = {
                      play: function() {
                          video.play();
                          this.isPlaying = true;
                        },
                      isPlaying: false
                    };
                  video.addEventListener('ended', function(e) {
                      $timeout(function() {
                          $scope.file.finished = true;
                          $scope.videoPlayer.isPlaying = false;
                        });
                    });

                }, 1000);
            }

          FileStorage.getUrl( $scope.file.FileStoreId ).then(function(res) {

              $scope.file.url = res;
              $scope.file.loaded = true;
              $scope.file.type = getMedia( $scope.file.FileExtension);
              $scope.file.name = $scope.file.FileName.split('.')[0];

              if($scope.file.type === 'video') {
                  loadVideoPlayer();
                }

            }, function(res) {
              $scope.error = true;
            });

            
        }
    };

    }])

.directive('externalEmbed', ['$sce', 'Url', function($sce, Url) {

  return {
      replace: true,
      restrict: 'E',
      templateUrl: '/interface/views/common/partials/externalEmbed.html',
      scope: {
          src: '='
        },
      link:function(scope, ele, attrs) {
            
          var media = Url.checkEmbeddability( scope.src );
          scope.provider = media.provider;
          scope.src = $sce.trustAsResourceUrl(media.url);
        }
    };
}])

.directive('external', ['$sce', '$filter', 'Url', function($sce, $filter, Url) {

  return {
    replace: true,
    restrict: 'E',
    scope: {
      title: '@',
      clickFunc: '&'
    },
    link: function(scope, ele, attrs) {
        
      scope.url = $filter('absoluteUrl')( attrs.url );
      scope.isEmbeddable = !!Url.checkEmbeddability(attrs.url);

      scope.callback = function() {

          console.log('callback!');
            
          if(typeof scope.clickFunc === 'function') {
              scope.clickFunc();
            }
        };

    },
    template: '<div>' +
                '<a ng-if="!isEmbeddable" class="button-hitarea" href="{{ url }}" target="_blank" ng-click="callback()">' +
                    '<i class="icon--mnuTraining icon-is-huge"></i>' +
                    '<h2>{{ title }}</h2>' +
                    '<p>(this will take you to an external site)</p>' +
                '</a>' +
                '<external-embed ng-if="isEmbeddable" src="url"></external-embed>' +
            '</div>'
  };
}]);
