angular.module('ui.recruit.candidateonboard').config(function($provide) {
    $provide.decorator('formBuilderDirective', function($delegate) {
        var directive = $delegate[0];
        var cycleModule = directive.$cycleModule;
        var originCycleLoop = cycleModule.$cycleLoop;
        var originFunctionCall = cycleModule.$functionCall;
        /*cycleModule.$cycleLoop = function () {
            // custom loop here
        }*/
        cycleModule.$functionCall = function(f, context) {
            // custom function call here
            var src = context.source;
            var formContext = context.formContext;
            var formData = formContext.$formData;

            var relatedElements = [];
            if (src.$element.relatedFields && src.$element.relatedFields.length) {
                relatedElements = formData.elements.filter(function(item) {
                    return src.$element.relatedFields.indexOf(item.name) >= 0;
                });
            }
            if (relatedElements.length <= 0) {
                throw ("Aleast a element in relation to field " + src.$element.name + '.');
            }
            else {
                f(relatedElements, src.$element);
            }
        };
        return $delegate;
    });
});