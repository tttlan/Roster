/*
textAngular
Author : Austin Anderson
License : 2013 MIT
Version 1.2.1

See README.md or https://github.com/fraywing/textAngular/wiki for requirements and use.
*/
var textAngularSetup = angular.module('textAngularSetup', []);
    
// Here we set up the global display defaults, to set your own use a angular $provider#decorator.
textAngularSetup.value('taOptions',  {
  toolbar: [
        ['h1', 'h2', 'p'],
        ['bold', 'italics', 'underline'],
        ['quote', 'ul', 'ol'],
        ['insertImage', 'insertVideo', 'insertLink', 'colours'],
    ],
  classes: {
      focussed: 'focussed',
      toolbar: '',
      toolbarGroup: 'toolbar__group',
      toolbarButton: 'toolbar__button',
      toolbarButtonActive: 'is--active',
      disabled: 'is--disabled',
      textEditor: 'form-control',
      htmlEditor: 'form-control'
    },
  disableSanitizer: true,
  setup: {
        // wysiwyg mode
      textEditorSetup: function($element) { /* Do some processing here */ },
        // raw html
      htmlEditorSetup: function($element) { /* Do some processing here */ }
    },
  defaultFileDropHandler:
        /* istanbul ignore next: untestable image processing */
        function(file, insertAction) {
          var reader = new FileReader();
          if(file.type.substring(0, 5) === 'image') {
              reader.onload = function() {
                  if(reader.result !== '') { insertAction('insertImage', reader.result, true); }
                };

              reader.readAsDataURL(file);
              return true;
            }
          return false;
        }
});

// This is the element selector string that is used to catch click events within a taBind, prevents the default and $emits a 'ta-element-select' event
// these are individually used in an angular.element().find() call. What can go here depends on whether you have full jQuery loaded or just jQLite with angularjs.
// div is only used as div.ta-insert-video caught in filter.
textAngularSetup.value('taSelectableElements', ['a','img']);

// This is an array of objects with the following options:
//              selector: <string> a jqLite or jQuery selector string
//              customAttribute: <string> an attribute to search for
//              renderLogic: <function(element)>
// Both or one of selector and customAttribute must be defined.
textAngularSetup.value('taCustomRenderers', [
  {
        // Parse back out: '<div class="ta-insert-video" ta-insert-video src="' + urlLink + '" allowfullscreen="true" width="300" frameborder="0" height="250"></div>'
        // To correct video element. For now only support youtube
    selector: 'img',
    customAttribute: 'ta-insert-video',
    renderLogic: function(element) {
          var iframe = angular.element('<iframe></iframe>');
          var attributes = element.prop('attributes');
            // loop through element attributes and apply them on iframe
          angular.forEach(attributes, function(attr) {
              iframe.attr(attr.name, attr.value);
            });
          iframe.attr('src', iframe.attr('ta-insert-video'));
          element.replaceWith(iframe);
        }
  }
]);

textAngularSetup.constant('taTranslations', {
    // moved to sub-elements
    //toggleHTML: "Toggle HTML",
    //insertImage: "Please enter a image URL to insert",
    //insertLink: "Please enter a URL to insert",
    //insertVideo: "Please enter a youtube URL to embed",
  html: {
      buttontext: 'Toggle HTML',
      tooltip: 'Toggle html / Rich Text'
    },
    // tooltip for heading - might be worth splitting
  heading: {
      tooltip: 'Heading '
    },
  p: {
      tooltip: 'Paragraph'
    },
  pre: {
      tooltip: 'Preformatted text'
    },
  ul: {
      tooltip: 'Unordered List'
    },
  ol: {
      tooltip: 'Ordered List'
    },
  quote: {
      tooltip: 'Quote/unqoute selection or paragraph'
    },
  undo: {
      tooltip: 'Undo'
    },
  redo: {
      tooltip: 'Redo'
    },
  bold: {
      tooltip: 'Bold'
    },
  italic: {
      tooltip: 'Italic'
    },
  underline: {
      tooltip: 'Underline'
    },
  justifyLeft: {
      tooltip: 'Align text left'
    },
  justifyRight: {
      tooltip: 'Align text right'
    },
  justifyCenter: {
      tooltip: 'Center'
    },
  indent: {
      tooltip: 'Increase indent'
    },
  outdent: {
      tooltip: 'Decrease indent'
    },
  clear: {
      tooltip: 'Clear formatting'
    },
  insertImage: {
      dialogPrompt: 'Please enter an image URL to insert',
      tooltip: 'Insert image',
      hotkey: 'the - possibly language dependent hotkey ... for some future implementation'
    },
  insertVideo: {
      tooltip: 'Insert video',
      dialogPrompt: 'Please enter a Youtube or Vimeo URL to embed'
    },
  insertLink: {
      tooltip: 'Insert / edit link',
      dialogPrompt: 'Please enter a URL to insert'
    },
  colour: {
      tooltip: 'Colour the text'
    }


});

textAngularSetup.run(['taRegisterTool', '$window', '$modal', 'taTranslations', 'taSelection', 'FileStorage', '$q', '$timeout', 'Url',
    function(taRegisterTool, $window, $modal, taTranslations, taSelection, FileStorage, $q, $timeout, Url) {
    
      taRegisterTool('html', {
      buttontext: taTranslations.html.buttontext,
      tooltiptext: taTranslations.html.tooltip,
      action: function() {
          this.$editor().switchView();
        },
      activeState: function() {
          return this.$editor().showHtml;
        }
    });
    // add the Header tools
    // convenience functions so that the loop works correctly
      var _retActiveStateFunction = function(q) {
      return function() { return this.$editor().queryFormatBlockState(q); };
    };
      var headerAction = function() {
      return this.$editor().wrapSelection('formatBlock', '<' + this.name.toUpperCase() +'>');
    };
      angular.forEach(['h1','h2','h3','h4','h5','h6'], function(h) {
      taRegisterTool(h.toLowerCase(), {
          buttontext: h.toUpperCase(),
          tooltiptext: taTranslations.heading.tooltip + h.charAt(1),
          action: headerAction,
          activeState: _retActiveStateFunction(h.toLowerCase())
        });
    });

    // Colours
      function buildHtml() {
        
      var colours = [
            { name: 'Black', value: '231f20' },
            { name: 'Teal', value: '45acad' },
            { name: 'Blue', value: '0072bc' },
            { name: 'Purple', value: '6460aa' },
            { name: 'Red', value: 'cd2944' },
            { name: 'Orange', value: 'f3642b' },
            { name: 'Crimson', value: 'b16c88' },
            { name: 'Green', value: '7fb16c' },
            { name: 'Lime', value: 'a0bb60' },
            { name: 'Pink', value: 'db5993' }
          ],
          html = '<div class="colours__container dropdown"><button class="toolbar__button colours__toggle dropdown-toggle" ng-class="displayActiveToolClass(active)" ng-disabled="isDisabled()"><i class="icon icon--pencil icon--colour-swatch"></i></button><ul class="dropdown-menu colours__menu submenu--tail submenu--grid submenu">';
      html += colours.map(function(colour) {
          return '<li class="colours__item" ><a class="colours__link" ng-click="action(\'' + colour.value + '\')" alt="' + colour.name + '" style="background: #' + colour.value + ';"></a></li>';
        }).join('');
      html += '</ul></div>';

      return html;
    }


      taRegisterTool('colours', {
      buttontext: 'c',
      action: function(colour) {
          if(typeof colour === 'string') {
              this.$editor().wrapSelection( 'forecolor', colour );
            }
        },
      display: buildHtml(),
      activeState: function() { return this.$editor().queryFormatBlockState('font'); }

    });


      taRegisterTool('p', {
      buttontext: 'P',
      tooltiptext: taTranslations.p.tooltip,
      action: function() {
          return this.$editor().wrapSelection('formatBlock', '<P>');
        },
      activeState: function() { return this.$editor().queryFormatBlockState('p'); }
    });
    // key: pre -> taTranslations[key].tooltip, taTranslations[key].buttontext
      taRegisterTool('pre', {
      buttontext: 'pre',
      tooltiptext: taTranslations.pre.tooltip,
      action: function() {
          return this.$editor().wrapSelection('formatBlock', '<PRE>');
        },
      activeState: function() { return this.$editor().queryFormatBlockState('pre'); }
    });
      taRegisterTool('ul', {
      iconclass: 'icon--list-ul',
      tooltiptext: taTranslations.ul.tooltip,
      action: function() {
          return this.$editor().wrapSelection('insertUnorderedList', null);
        },
      activeState: function() { return document.queryCommandState('insertUnorderedList'); }
    });
      taRegisterTool('ol', {
      iconclass: 'icon--list-ol',
      tooltiptext: taTranslations.ol.tooltip,
      action: function() {
          return this.$editor().wrapSelection('insertOrderedList', null);
        },
      activeState: function() { return document.queryCommandState('insertOrderedList'); }
    });
      taRegisterTool('quote', {
      iconclass: 'icon--quote',
      tooltiptext: taTranslations.quote.tooltip,
      action: function() {
          return this.$editor().wrapSelection('formatBlock', '<BLOCKQUOTE>');
        },
      activeState: function() { return this.$editor().queryFormatBlockState('blockquote'); }
    });
      taRegisterTool('undo', {
      iconclass: 'fa fa-undo',
      tooltiptext: taTranslations.undo.tooltip,
      action: function() {
          return this.$editor().wrapSelection('undo', null);
        }
    });
      taRegisterTool('redo', {
      iconclass: 'fa fa-repeat',
      tooltiptext: taTranslations.redo.tooltip,
      action: function() {
          return this.$editor().wrapSelection('redo', null);
        }
    });
      taRegisterTool('bold', {
      buttontext: '<b>B</b>',
      tooltiptext: taTranslations.bold.tooltip,
      action: function() {
          return this.$editor().wrapSelection('bold', null);
        },
      activeState: function() {
          return document.queryCommandState('bold');
        },
      commandKeyCode: 98
    });
      taRegisterTool('justifyLeft', {
      iconclass: 'fa fa-align-left',
      tooltiptext: taTranslations.justifyLeft.tooltip,
      action: function() {
          return this.$editor().wrapSelection('justifyLeft', null);
        },
      activeState: function(commonElement) {
          var result = false;
          if(commonElement) { result = commonElement.css('text-align') === 'left' || commonElement.attr('align') === 'left' ||
                (commonElement.css('text-align') !== 'right' && commonElement.css('text-align') !== 'center' && !document.queryCommandState('justifyRight') && !document.queryCommandState('justifyCenter')); }
          result = result || document.queryCommandState('justifyLeft');
          return result;
        }
    });
      taRegisterTool('justifyRight', {
      iconclass: 'fa fa-align-right',
      tooltiptext: taTranslations.justifyRight.tooltip,
      action: function() {
          return this.$editor().wrapSelection('justifyRight', null);
        },
      activeState: function(commonElement) {
          var result = false;
          if(commonElement) { result = commonElement.css('text-align') === 'right'; }
          result = result || document.queryCommandState('justifyRight');
          return result;
        }
    });
      taRegisterTool('justifyCenter', {
      iconclass: 'fa fa-align-center',
      tooltiptext: taTranslations.justifyCenter.tooltip,
      action: function() {
          return this.$editor().wrapSelection('justifyCenter', null);
        },
      activeState: function(commonElement) {
          var result = false;
          if(commonElement) { result = commonElement.css('text-align') === 'center'; }
          result = result || document.queryCommandState('justifyCenter');
          return result;
        }
    });
      taRegisterTool('indent', {
      iconclass: 'fa fa-indent',
      tooltiptext: taTranslations.indent.tooltip,
      action: function() {
          return this.$editor().wrapSelection('indent', null);
        },
      activeState: function() {
          return this.$editor().queryFormatBlockState('blockquote'); 
        }
    });
      taRegisterTool('outdent', {
      iconclass: 'fa fa-outdent',
      tooltiptext: taTranslations.outdent.tooltip,
      action: function() {
          return this.$editor().wrapSelection('outdent', null);
        },
      activeState: function() {
          return false;
        }
    });
      taRegisterTool('italics', {
      buttontext: '<em>I</em>',
      tooltiptext: taTranslations.italic.tooltip,
      action: function() {
          return this.$editor().wrapSelection('italic', null);
        },
      activeState: function() {
          return document.queryCommandState('italic');
        },
      commandKeyCode: 105
    });
      taRegisterTool('underline', {
      buttontext: '<u>U</u>',
      tooltiptext: taTranslations.underline.tooltip,
      action: function() {
          return this.$editor().wrapSelection('underline', null);
        },
      activeState: function() {
          return document.queryCommandState('underline');
        },
      commandKeyCode: 117
    });
      taRegisterTool('clear', {
      iconclass: 'fa fa-ban',
      tooltiptext: taTranslations.clear.tooltip,
      action: function(deferred, restoreSelection) {
          this.$editor().wrapSelection('removeFormat', null);
          var possibleNodes = angular.element(taSelection.getSelectionElement());
            // remove lists
          var removeListElements = function(list) {
              list = angular.element(list);
              var prevElement = list;
              angular.forEach(list.children(), function(liElem) {
                  var newElem = angular.element('<p></p>');
                  newElem.html(angular.element(liElem).html());
                  prevElement.after(newElem);
                  prevElement = newElem;
                });
              list.remove();
            };
          angular.forEach(possibleNodes.find('ul'), removeListElements);
          angular.forEach(possibleNodes.find('ol'), removeListElements);
            // clear out all class attributes. These do not seem to be cleared via removeFormat
          var $editor = this.$editor();
          var recursiveRemoveClass = function(node) {
              node = angular.element(node);
              if(node[0] !== $editor.displayElements.text[0]) { node.removeAttr('class'); }
              angular.forEach(node.children(), recursiveRemoveClass);
            };
          angular.forEach(possibleNodes, recursiveRemoveClass);
            // check if in list. If not in list then use formatBlock option
          if(possibleNodes[0].tagName.toLowerCase() !== 'li' &&
                possibleNodes[0].tagName.toLowerCase() !== 'ol' &&
                possibleNodes[0].tagName.toLowerCase() !== 'ul') { 
              this.$editor().wrapSelection('formatBlock', '<p>');
            }
          restoreSelection();
        }
    });
    
      var imgOnSelectAction = function(event, $element, editorScope) {
        // setup the editor toolbar
        // Credit to the work at http://hackerwins.github.io/summernote/ for this editbar logic/display
        
      var oneEvent = function(_element, event, action) {
          $timeout(function() {
                // shim the .one till fixed
              var _func = function() {
                  _element.off(event, _func);
                  action();
                };
              _element.on(event, _func);
            }, 100);
        };

      var finishEdit = function() {
          editorScope.updateTaBindtaTextElement();
          hideContainer();
        };

      var showContainer = function(_el) {
            // add to DOM
          editorScope.displayElements.scrollWindow.append(container);
          container.css({
              'position':'absolute',
              'top': _el[0].offsetTop + 10,
              'left': 30
            });
        };

      var hideContainer = function() {
          if (container) {
              container.remove();
            }
        };

      event.preventDefault();
      hideContainer();
        
        // create editor
      var $body = $('body');
      var isVideo = $element[0].className === 'ta-insert-video';
      var container = angular.element('<div class="container">');
        
      container.on('mousedown', function(e, eventData) {
            /* istanbul ignore else: this is for catching the jqLite testing*/
          if(eventData) { angular.extend(e, eventData); }
            // this prevents focusout from firing on the editor when clicking anything in the popover
          e.preventDefault();
          return false;
        });

        // trigger click off event
      oneEvent($body, 'click keyup', function() {hideContainer();});
        
      if (!isVideo) {
            // create resize buttons
          var buttonGroup = angular.element('<div class="buttons">');
            
          var fullButton = angular.element('<button type="button" class="button button--black button--icon" unselectable="on" tabindex="-1" title="Fullscreen"><i class="icon--maximise"></i></button>');
          fullButton.on('click', function(event) {
              event.preventDefault();
              $element.css({
                  'width': '100%',
                  'height': ''
                });
              finishEdit();
            });

          var halfButton = angular.element('<button type="button" class="button button--black button--icon" unselectable="on" tabindex="-1" title="Smaller"><i class="icon--minimise"></i></button>');
          halfButton.on('click', function(event) {
              event.preventDefault();
              $element.css({
                  'width': '50%',
                  'height': ''
                });
              finishEdit();
            });

          buttonGroup.append(fullButton);
          buttonGroup.append(halfButton);
            // add buttons to container
          container.append(buttonGroup);
        } else {

            // link button   
          var linkout = angular.element('<a href="' + $element.attr('rel') + '" target="_blank" class="button button--black button--icon" unselectable="on" tabindex="-1" title="Link to video"><i class="icon--link"></i></a>');
          linkout.on('click', function(event) {
              finishEdit();
            });

          container.append(linkout);
        }
        
        // delete button   
      var remove = angular.element('<button type="button" class="button button--black button--icon" unselectable="on" tabindex="-1" title="Delete"><i class="icon--bin"></i></button>');
      remove.on('click', function(event) {
          event.preventDefault();
          $element.remove();
          finishEdit();
        });

      container.append(remove);
        // show container
      showContainer($element);
    };
    
      taRegisterTool('insertImage', {
      iconclass: 'icon--picture',
      tooltiptext: taTranslations.insertImage.tooltip,
      action: function(deferred) {
            
          function endImageAction() {
              $editor.updateTaBindtaTextElement();
              $editor.endAction();
            }

          var $editor = this.$editor(),
              element, imageLink, placeholder = 'image-placeholder', 
              files = [];

          var modal = $modal.open({
              templateUrl: '/interface/views/common/partials/modal-upload.html',
              controller: SHRP.ctrl.ModalCTRL,
              resolve: {
                  items: function() {
                        return files;
                    },
                    dataUpload: function() {
                        return {
                            moduleUpload: 'insert-image-from-text-angular'
                        };
                    }
                }
            });

          modal.result.then(function(files) {

              imageLink = FileStorage.getDownloadUrl( files[0] ) + '?inline=true';
                
              if(imageLink && imageLink !== '' && imageLink !== 'http://') {
                  var img = $('<img contenteditable="false" src="' + imageLink + '" file-link="' + files[0] + '"/>');
                  $('#' + placeholder).replaceWith(img);
                    // apply scope
                    //$editor.endAction();
                  endImageAction();
                }

            }, function() {
              $('#' + placeholder).remove();
              endImageAction();
            });

          element = '<span id="' + placeholder + '"></span>';    
          return this.$editor().wrapSelection('insertHTML', element, true);

        },
      onElementSelect: {
          element: 'img',
          action: imgOnSelectAction
        }
    });
      taRegisterTool('insertVideo', {
      iconclass: 'icon--video',
      tooltiptext: taTranslations.insertVideo.tooltip,
      action: function() {
          var urlPrompt;
          urlPrompt = $window.prompt(taTranslations.insertVideo.dialogPrompt, 'http://');
          if (urlPrompt && urlPrompt !== '' && urlPrompt !== 'http://') {

              var vid = Url.checkEmbeddability(urlPrompt);

              if (vid && vid.url) {

                  var embed = '<img ta-insert-video="' + vid.url + '" class="ta-insert-video" rel="' + urlPrompt + '" src="" />';
                    // insert
                  return this.$editor().wrapSelection('insertHTML', embed, true);
                }
            }
        },
      onElementSelect: {
          element: 'img',
          onlyWithAttrs: ['ta-insert-video'],
          action: imgOnSelectAction
        }
    }); 
      taRegisterTool('insertLink', {
      tooltiptext: taTranslations.insertLink.tooltip,
      iconclass: 'icon--link',
      action: function() {
          var urlLink;
          urlLink = $window.prompt(taTranslations.insertLink.dialogPrompt, 'http://');
          if(urlLink && urlLink !== '' && urlLink !== 'http://') {
              return this.$editor().wrapSelection('createLink', urlLink, true);
            }
        },
      activeState: function(commonElement) {
          if(commonElement) { return commonElement[0].tagName === 'A'; }
          return false;
        },
      onElementSelect: {
          element: 'a',
          action: function(event, $element, editorScope) {
                // setup the editor toolbar
                // Credit to the work at http://hackerwins.github.io/summernote/ for this editbar logic
              event.preventDefault();
              editorScope.displayElements.popover.css('width', '280px');
              var container = editorScope.displayElements.popoverContainer;
              container.empty();
              container.css('line-height', '34px');
              var link = angular.element('<a href="' + $element.attr('href') + '" target="_blank">' + $element.attr('href') + '</a>');
              link.css({
                  'display': 'inline-block',
                  'max-width': '180px',
                  'overflow': 'hidden',
                  'text-overflow': 'ellipsis',
                  'white-space': 'nowrap',
                  'vertical-align': 'middle'
                });
              container.append(link);
              var buttonGroup = angular.element('<div class="buttons align-right">');
              var reLinkButton = angular.element('<button type="button" class="button button--black button--icon" tabindex="-1" unselectable="on" title="Edit link"><i class="icon--pencil"></i></button>');
              reLinkButton.on('click', function(event) {
                  event.preventDefault();
                  var urlLink = $window.prompt(taTranslations.insertLink.dialogPrompt, $element.attr('href'));
                  if(urlLink && urlLink !== '' && urlLink !== 'http://') {
                      $element.attr('href', urlLink);
                      editorScope.updateTaBindtaTextElement();
                    }
                  editorScope.hidePopover();
                });
              buttonGroup.append(reLinkButton);
              var unLinkButton = angular.element('<button type="button" class="button button--black button--icon" tabindex="-1" unselectable="on" title="Remove link"><i class="icon--bin"></i></button>');
                // directly before ths click event is fired a digest is fired off whereby the reference to $element is orphaned off
              unLinkButton.on('click', function(event) {
                  event.preventDefault();
                  $element.replaceWith($element.contents());
                  editorScope.updateTaBindtaTextElement();
                  editorScope.hidePopover();
                });
              buttonGroup.append(unLinkButton);
              container.append(buttonGroup);
              editorScope.showPopover($element);
            }
        }
    });
    }]);