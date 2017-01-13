// File Icon directive
// ------------------------------------------------

angular.module('ui.common')

  /**
   * Example:
   *
   * Input: <i file-icon="somefile.pdf"></i>
   *
   * Result: <i file-icon="somefile.pdf" class="svg-icon--pdf"></i>
   */

  .constant('svgIconExtensionMapping', {
    doc: 'doc',
    docx: 'docx',
    jpg: 'jpg',
    jpeg: 'jpeg',
    gif: 'gif',
    png: 'png',
    pdf: 'pdf',
    ppsx: 'ppsx',
    pptx: 'pptx',
    ppt: 'ppt',
    txt: 'txt',
    mp4: 'video',
    ogg: 'video',
    webm: 'video',
    xml: 'xml',
    xls: 'xls',
    xlsx: 'xlsx',
    csv: 'csv',
    zip: 'zip'
  })
  .directive('fileIcon', ['svgIconExtensionMapping', (svgIconExtensionMapping) => {
    return {
      replace: false,
      restrict: 'A',
      scope: {
        fileIcon: '@'
      },
      link(scope, elem, attrs) {
        //Make sure changes to the value are reflected in the class
        attrs.$observe('fileIcon', (newVal, oldVal) => {
          if (newVal === oldVal) {return;}
          // Figure out the extension using VisionN's super quick solution
          // http://stackoverflow.com/a/12900504/23746
          let ext = scope.fileIcon ? svgIconExtensionMapping[scope.fileIcon.slice((scope.fileIcon.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase()] : "";

          // Remove all css classes matching "svg-icon--*"
          elem.removeClass(function(index, css) { return (css.match (/(^|\s)svg-icon--\S+/g) || []).join(' '); });

          // Add the new class, if ext is "" we just get the default icon which currently looks like the txt icon i.e 'svg-icon--'
          elem.addClass(`svg-icon--${ext}`);
        });
      }
    };
  }]);