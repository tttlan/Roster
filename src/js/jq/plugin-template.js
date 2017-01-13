
// Plugin Template
// ------------------------------------------------

(function( $ ) {

    SHRP.Name = function(el, myFunctionParam, options) {

        // set vars
        this.$element = $(el);
        this.element = el;

        this.options = $.extend({}, SHRP.Name.defaultOptions, options);

        // run functions
        this._events();
    };



    // Plugin Config
    // ------------------------------------------------

    SHRP.Name.defaultOptions = {
        myDefaultValue: ''
    };

    $.fn.SHRP_name = function( myFunctionParam, options ) {
        return this.each(function() {
            (new SHRP.Name(this, myFunctionParam, options));
        });
    };


})( jQuery );