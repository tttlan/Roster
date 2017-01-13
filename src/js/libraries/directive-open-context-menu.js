angular.module('ui.libraries')

.directive('openContextMenu', function() {
    return function(scope, el, attrs) {
        scope.oldIndex = -1;
        el.bind('contextmenu', function(e) {
            scope.newIndex = attrs.context;
            //If IE isIE = true else isIE = false
            var isIE = /*@cc_on!@*/false || !!document.documentMode;
            var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+

            //Prevent default behavior of browser
            e.preventDefault();

            function getPosition(element) {
                var xPosition = 0;
                var yPosition = 0;
                while (element) {
                    
                    xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
                    yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
                    element = element.offsetParent;
                }
                return { x: xPosition, y: yPosition };
            }

            function getPageTopLeft(element) {
                var rect = element.getBoundingClientRect();
                var docEl = document.documentElement;
                return {
                    left: rect.left + (window.pageXOffset || docEl.scrollLeft || 0),
                    top: rect.top + (window.pageYOffset || docEl.scrollTop || 0)
                };
            }

            //Get parent position
            var parentPosition = getPosition(e.currentTarget);

            var containerDiv = document.getElementById('itemsContainer');
            var containerDivPosition = getPageTopLeft(containerDiv);

            var xPosition = e.clientX - containerDivPosition.left;
            var yPosition = e.clientY - containerDivPosition.top;

            var target = document.getElementById('link-' + attrs.context);
            var contextMenu = document.getElementById('context-menu-' + attrs.context);

            var windowHeight = window.innerHeight;
            var windowWidth = window.innerWidth;

            var contextMenuList = document.getElementById('context-menu-content-' + attrs.context);
            var contextMenuListOpacity = window.getComputedStyle(contextMenuList).opacity;
            
            var activeItem = document.getElementById('iconItem' + attrs.context);
            var gallery = document.getElementById('gallery');
            var galleryStyle = window.getComputedStyle(gallery);
            
            //Set position of context menu
            contextMenu.style.left = xPosition + (window.scrollX || window.pageXOffset) + parseInt(galleryStyle['padding-left']) + 'px';
            contextMenu.style.top = yPosition + (window.scrollY || window.pageYOffset) + 'px';
            contextMenu.style.position = 'absolute';
            contextMenu.style.zIndex = '3';
            contextMenu.style.display = 'block';

            var contextMenuListHeight = contextMenuList.offsetHeight;
            var contextMenuListWidth = contextMenuList.offsetWidth;
            var contextMenuListPosition = getPageTopLeft(contextMenuList);
            var contextMenuListBottom = windowHeight - contextMenuListPosition.top - contextMenuListHeight;
            var contextMenuListRight = windowWidth - contextMenuListPosition.left - contextMenuListWidth;

            if (contextMenuListHeight <= 2) {
                contextMenuList.style.opacity = 0.0;
            }

            //Reset position of context menu
            contextMenu.style.left = (contextMenuListRight < 0) ? (xPosition - contextMenuListWidth + (window.scrollX || window.pageXOffset)) + parseInt(galleryStyle['padding-left']) + 'px' : xPosition + (window.scrollX || window.pageXOffset) + parseInt(galleryStyle['padding-left']) + 'px';
            contextMenu.style.top = (contextMenuListBottom < 0) ? (yPosition - contextMenuListHeight + (window.scrollY || window.pageYOffset)) + 'px' : yPosition + (window.scrollY || window.pageYOffset) + 'px';

            if (isIE) {
                contextMenuList.style.position = 'static';
            }


            //Trigger click and rightclick
            angular.element(activeItem).triggerHandler('click');
            if (contextMenuListOpacity !== '1' || isFirefox) {
                angular.element(target).triggerHandler('click');
            }
        });
    };
});