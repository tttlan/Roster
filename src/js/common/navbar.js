// SubNav directive 
// ------------------------------------------------

angular.module('ui.common')

 .directive('subNavLinks',['activePage', 'Permissions', '$timeout', '$rootScope', function(activePage, Permissions, $timeout, $rootScope) {

   function convertToSlug(Text) {
      return Text
            .toLowerCase()
            .replace(/[^\w ]+/g,'')
            .replace(/ +/g,'-')
            ;
    }

   return {
      restrict:'E',
      priority:100,
      replace: true,
      templateUrl: '/interface/views/common/partials/navbar.html',
      link: function(scope, element, attrs) {

          scope.type = attrs.type;
          scope.ready = false;
          scope.links = [];
            
          if(SHRP.data[attrs.obj]) {
              scope.links = SHRP.data[attrs.obj].map(function(navItem) {

                  navItem.activePath = navItem.url.split('/').splice(1) || '';
                  navItem.visible = navItem.visible || false;
                  navItem.external = navItem.external || false;
                  navItem.iconclass = convertToSlug(navItem.name);

                  if(navItem.children) {
                    
                      navItem.children.map(function(navChildItem) {
                          navChildItem.activePath = navChildItem.url.split('/').splice(1) || '';
                          navChildItem.visible = navChildItem.visible || false;
                          navItem.external = navItem.external || false;
                          navItem.iconclass = convertToSlug(navItem.name);
                          return navChildItem;
                        });
                    
                    }

                  return navItem;

                });
            }

          $rootScope.subNavLinksCount = scope.links.length;            

            // Validate navigation and set to visible
          function checkLinkPermission(links) {
                    
              angular.forEach(links, function(link) {
                    
                  if ((link.visible && link.visible !== true) || !link.visible) {
                      Permissions.canIHas(link.url, true).then(function (isAllowed) {
                          link.visible = isAllowed;
                      });
                  }

                  if(link.children) {

                      checkLinkPermission(link.children);
                        
                        //A timeout is needed to update the scope.links
                      $timeout(function() {
                            
                          link.hasVisibleChildren = link.children.filter(function(child) {
                              return child.visible;
                            }).length > 0;

                        });
                    }

                });

            }
            
          Permissions.isReady().then(function() {

              checkLinkPermission(scope.links);
              scope.ready = true;
            
            });

          scope.isActive = activePage.isActive;
            
        }
    };

 }]);