// Datepicker Directive
// ------------------------------------------------

sherpa

.config(function(datepickerConfig, datepickerPopupConfig) {
    
  var START_OF_DAY = moment().startOf('day').utc().format();
    
  datepickerPopupConfig.datepickerPopup = 'd MMM yyyy';
  datepickerPopupConfig.showButtonBar = 'false';
  datepickerPopupConfig.AppendToBody =  true;

  datepickerConfig.showWeeks = false;
  datepickerConfig.dayFormat = 'd';
  datepickerConfig.monthFormat = 'MMM';
  datepickerConfig.yearFormat ='yyyy';
  datepickerConfig.dayHeaderFormat = 'EEE';
  datepickerConfig.dayTitleFormat = 'MMMM';
  datepickerConfig.monthTitleFormat = 'yyyy';
  datepickerConfig.initDate = START_OF_DAY; 
  
   var monthArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    datepickerConfig.months = [];
    for (var i = 0; i < monthArray.length; i++) {
        datepickerConfig.months.push({id: i, label: monthArray[i]});
    }

    datepickerConfig.years = [];
    var currentYear = new Date().getFullYear();
    for (var x = currentYear + 10; x > (currentYear - 130); x--) {
        datepickerConfig.years.push({id: x, label: x});
    }
  
})


.run(function($templateCache) {
  $templateCache.put('template/datepicker/popup.html',
        '<ul class="datepicker popout" ng-style="{display: (isOpen && \'block\') || \'none\', top: position.top+\'px\', left: position.left+\'px\'}">' +
            '<li class="datepicker__calendar" ng-transclude></li>' +
        '</ul>');
  $templateCache.put('template/datepicker/datepicker.html',
        '<div class="datepicker__calendar-inner">' +
            '<div class="datepick__month-selection">' +
                '<button type="button" class="datepicker__prev-month icon--left" ng-click="move(-1)"></button>' +
                //'<button type="button" class="datepicker__curr-month">{{title}}</button>' +
                '<select-box ng-model="months.selected" type="compact">' +
                    '<select ng-model="months.selected" ng-options="month as month.label for month in months" ng-change="setMonth()"></select>' +
                '</select-box>' + 
                '<select-box ng-model="years.selected" type="compact">' +
                    '<select ng-model="years.selected" ng-options="year as year.label for year in years" ng-change="setYear()"></select>' +
                '</select-box>' + 
                '<button type="button" class="datepicker__next-month icon--right" ng-click="move(1)"></button></th>' +
            '</div>' +
            '<div class="datepicker__table">' +
              '<table cellpadding="0" cellspacing="0">' +
                '<thead>' +
                  '<tr ng-show="labels.length > 0">' +
                    '<th ng-repeat="label in labels">{{label[0]}}</th>' +
                  '</tr>' +
                '</thead>' +
                '<tbody>' +
                  '<tr ng-repeat="row in rows">' +
                    '<td ng-repeat="dt in row">' +
                      '<button type="button" style="width:100%;" ng-class="{\'is--active\': dt.selected}" ng-click="select(dt.date)" ng-disabled="dt.disabled">' +
                          '<span ng-class="{\'text-muted\': dt.secondary}">{{dt.label}}</span>' +
                      '</button>' +
                    '</td>' +
                  '</tr>' +
                '</tbody>' +
            '</table>' +
          '</div>' +
        '</div>');
});