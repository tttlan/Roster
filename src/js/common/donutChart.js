angular.module('ui.common.directives')

// Donut Chart directive
// http://codepen.io/stefanjudis/pen/gkHwJ
// ----------------------------------------
.directive('donutChart', ['onResize', 'angularLoad', function(onResize, angularLoad) {
  return {
      restrict: 'E', // the directive can be invoked only by using <my-directive> tag in the template
        //replace: true,
      scope: {
          title: '=',
          data: '='
        },
      template: '<div></div>',        
      link: function(scope, element, attrs) {
          scope.$watch('data', function(newData, oldData) {
              // redraw the chart if we have new data
              if(newData.length > 0) {
                drawChart(scope.data, true);
              }
            }, true);
          onResize.register(function() { 
              if(scope.data.length > 0) {
                drawChart(scope.data, false);
              }
            });

          var DURATION = 1000;
          var DELAY    = 0;
              /**
               * Draw the Line Graph
               *
               * @param {Array} data : The graph data array of object {{int} value, {String} description, {String} color} 
               * @param {Boolean}  animate : Animate the drawing of the graph?
               */
          function drawChart(data, animate) {

                // Load D3 and initialise the graph
              angularLoad.loadScript('/interface/js/lib/d3.js').then(function() {                    
                    // Start loading the graph now that we have loaded D3

                  animate = (typeof animate !== 'undefined') ? animate : true;
                  // turn animations off if animate is false
                  if(!animate) {
                    DURATION = 0;
                  }
                  if(!data.length) {
                    return;
                  }              

                  var containerEl = element[0].firstElementChild,
                    width       = containerEl.clientWidth,
                    height      = width * 0.37,
                    radius      = Math.min( width, height ) / 2,
                    container   = d3.select( containerEl );
                  if(width<=0) {
                        return;
                      }
                      // if there is an existing chart, clear it and redraw it.
                  var s = container.select('svg');
                  if(s) {
                        container.html('');
                      }

                  var svg         = container.append( 'svg' )
                                            .attr( 'width', width )
                                            .attr( 'height', height ),
                        valuesTotal = 0;

                  for(var i = 0; i < data.length; i++) {
                    valuesTotal+=data[i].value;
                  }

                  var pie = svg.append( 'g' )
                              .attr(
                                'transform',
                                'translate(' + radius + ',' + radius + ')'
                              );
                  
                  var detailedInfo = svg.append( 'g' )
                              .attr(
                                'transform',
                                'translate(' + radius * 2 + ',' + radius + ')'
                              )
                              .attr( 'class', 'pieChart--detailedInformation' );

                  var twoPi   = 2 * Math.PI;
                  var pieData = d3.layout.pie()
                                  .value( function( d ) { return d.value; } )
                                  .sort(null);

                  var arc = d3.svg.arc()
                                  .outerRadius( radius - 20)
                                  .innerRadius( 0 );
                  
                  var pieChartPieces = pie.datum( data )
                                          .selectAll( 'path' )
                                          .data( pieData )
                                          .enter()
                                          .append( 'path' )
                                          .attr( 'class', function( d ) {
                                            return 'pieChart__' + d.data.color;
                                          } )
                                          .attr( 'd', arc )
                                          .each( function() {
                                            this._current = { startAngle: 0, endAngle: 0 }; 
                                          } )
                                          .transition()
                                          .duration( DURATION )
                                          .attrTween( 'd', function( d ) {
                                            var interpolate = d3.interpolate( this._current, d );
                                            this._current = interpolate( 0 );
                                  
                                            return function( t ) {
                                              return arc( interpolate( t ) );
                                            };
                                          } );


                  drawChartCenter(data[0].value); 
                  drawDetailedInformation( data ); 

                  function drawChartCenter(data) {
                    var centerContainer = pie.append( 'g' )
                                              .attr( 'class', 'pieChart--center' );
                    
                    centerContainer.append( 'circle' )
                                    .attr( 'class', 'pieChart--center--outerCircle' )
                                    .attr( 'r', 0 )
                                    .attr( 'filter', 'url(#pieChartDropShadow)' )
                                    .transition()
                                    .duration( DURATION )
                                    .delay( DELAY )
                                    .attr( 'r', radius - 35 );
                    
                    centerContainer.append( 'circle' )
                                    .attr( 'id', 'pieChart-clippy' )
                                    .attr( 'class', 'pieChart--center--innerCircle' )
                                    .attr( 'r', radius - 30 );
                  
                    var centerText = centerContainer.data( [ Math.round(data / valuesTotal * 100) ] )
                                  .append( 'text' );

                    centerText.text ( '0' )
                                  .attr( 'class', 'pieChart--detail--percentage' )
                                  .attr( 'font-size', radius * 0.6 )
                                  .attr( 'text-anchor', 'middle' )
                                  .attr('y', '.35em') // fix to vertically center text
                                  .attr('x', '5.5px') // offset the % symbol
                                  .transition()
                                  .duration( DURATION )
                                  .tween( 'text', function( d ) {
                                    var i = d3.interpolateRound(
                                      +this.textContent.replace( '%', '' ),
                                      d
                                    );

                                    return function( t ) {
                                      this.innerHTML = i( t ) + '<tspan class=\'pieChart--detail--percentageSymbol\'>%</tspan>';
                                    };
                                  } );
                  }
                  

                  // Draw the Information panel
                  function drawDetailedInformation( data ) {

                    var infoWidth = width - (radius*2),
                        infoTitleHeight = 25,
                        infoItemHeight = 20,
                        infoHeight = infoTitleHeight + Math.round(data.length/2)*infoItemHeight,
                        r = 3,
                        x = 110,
                        y = infoHeight / -2 + (infoTitleHeight/2),
                        anchor,
                        infoContainer,
                        position;

                    detailedInfo.append('text')
                                              .text(scope.title)
                                              .attr(
                                                  'transform',
                                                  'translate(0,'+y+')'
                                              );
                    y+=infoTitleHeight;

                    for(var i = 0; i < data.length; i++)
                      {

                        var x_this = i%2 > 0 ? x : 0; 
                        var e = data[i];

                        var textValue = e.value / valuesTotal * 100;

                        var text = (textValue > 0 && textValue <1 ? '<1' : Math.round(textValue)) + '% ' + e.description;

                        let infoItemContainer = detailedInfo.append( 'g' )
                                                   .attr(
                                                     'transform',
                                                     'translate(' + x_this + ',' + y + ')'
                                                   );

                        infoItemContainer.append('circle')
                                              .attr('r',r)
                                              .style( 'fill', '#fff' )
                                              //.style('stroke','red')
                                              .attr('class','pieChart--detail--label__' + e.color)
                                              .attr(
                                                     'transform',
                                                     'translate(' + r + ',0)'
                                                   );

                        infoItemContainer.append('text')
                                              .text(text)
                                              .attr('class','pieChart--detail--label')
                                              .attr('y', '.3em')
                                              .attr(
                                                     'transform',
                                                     'translate(' + r*5 + ',0)'
                                                   );

                        if(i%2 > 0) {
                            y+=infoItemHeight;  
                          } 
                      }

                  }
                });
            }
            
        }
    };
}]);