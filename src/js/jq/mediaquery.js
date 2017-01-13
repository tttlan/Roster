
// Media Queries
// ------------------------------------------------

/*
 * How to use:
 *
 * if (SHRP.Utils.getMediaSize() === SHRP.Utils.phoneSize) {
 *     // load low res image
 * }
 *
 */

// might look at integrating this
// https://github.com/14islands/js-breakpoints/blob/master/breakpoints.js

(function( $ ) {

    SHRP.Utils = SHRP.Utils || {};

    // These must match the names in src/css/core/global.styl
    SHRP.Utils.phoneSize = 'mobile';
    SHRP.Utils.phabletSize = 'phablet';
    SHRP.Utils.tabletSize = 'tablet';
    SHRP.Utils.desktopSize = 'desktop';
    SHRP.Utils.widescreenSize = 'widescreen';

    // this checks the body for a CSS media query generated size

    SHRP.Utils.getMediaSize = function() {
        var tag = window.getComputedStyle(document.body,':after').getPropertyValue('content');
        tag = tag.replace( /"/g,'');   // Firefox bugfix
        return tag;
    };

})( jQuery );