angular.module('ui.common.directives')

// Line Chart directive
// http://codepen.io/stefanjudis/pen/gkHwJ
// ----------------------------------------
.directive('lineGraph', ['onResize', 'angularLoad', function(onResize, angularLoad) {
  return {
      restrict: 'E', // the directive can be invoked only by using <my-directive> tag in the template
        //replace: true,
      scope: {
          data: '='
        },
      template: '<div></div>',        
      link: function(scope, element, attrs) {
          scope.$watch('data', function(newData, oldData) {
              if(newData.length > 0) {
                  drawChart(scope.data, true);
                }

            }, true);
          onResize.register(function() { 
              if(scope.data.length > 0) {
                drawChart(scope.data, false);
              }
            });

            
          var DURATION = 250;
          var DELAY    = 0;
              /**
               * Draw the Line Graph
               *
               * @param {Array} data : The graph data array of {Date()} date, {int} value} 
               * @param {Boolean}  animate : Animate the drawing of the graph?
               */
          function drawChart( data, animate ) {

              // Load D3 and initialise the graph
              angularLoad.loadScript('/interface/js/lib/d3.js').then(function() {                    

                animate = (typeof animate !== 'undefined') ? animate : true;
                // turn animations off if animate is false
                if(!animate) {
                  DURATION = 0;
                }
                var containerEl = element[0].firstElementChild,
                  width       = containerEl.clientWidth,
                  height      = width * 0.15,
                  margin      = {
                      top    : 30,
                      right  : 10,
                      left   : 10 
                    },
                  detailWidth  = 27,
                  detailHeight = 25,
                  detailMargin = 12,

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
                                            .attr( 'height', height + margin.top ),

                      x          = d3.time.scale().range( [ 0, width - detailWidth ] ),
                      xAxis      = d3.svg.axis().scale( x )
                                              .ticks ( 8 )
                                              .tickSize( -height ),
                      xAxisTicks = d3.svg.axis().scale( x )
                                              .ticks( 16 )
                                              .tickSize( -height )
                                              .tickFormat( '' ),
                      y          = d3.scale.linear().range( [ height, 0 ] ),
                      yAxis      = d3.svg.axis().scale( y )
                                              .ticks ( 4 )
                                              .tickSize( -width )
                                              .orient( 'right' ),                   
                      yAxisTicks = d3.svg.axis().scale( y )
                                              .ticks( 12 )
                                              .tickSize( width )
                                              .tickFormat( '' )
                                              .orient( 'right' ),
                      area = d3.svg.area()
                                  .interpolate( 'linear' )
                                  .x( function( d )  { return x( d.date ) + detailWidth / 2; } )
                                  .y0( height )
                                  .y1( function( d ) { return y( d.value ); } ),

                      line = d3.svg.line()
                              .interpolate( 'linear' )
                              .x( function( d ) { return x( d.date ) + detailWidth / 2; } )
                              .y( function( d ) { return y( d.value ); } ),
                    
                      startData = data.map( function( datum ) {
                      return {
                                    date  : datum.date,
                                    value : 0
                                  };
                    } ),
                      circleContainer;
                // Compute the minimum and maximum date, and the maximum values.
                x.domain( [ data[ 0 ].date, data[ data.length - 1 ].date ] );
                y.domain( [ 0, d3.max( data, function( d ) { return d.value; } ) * 1.3 ] );

                svg.append( 'g' )
                    .attr( 'class', 'lineChart--xAxisTicks' )
                    .attr( 'transform', 'translate(' + detailWidth / 2 + ',' + height + ')' )
                    .call( xAxisTicks );

                svg.append( 'g' )
                    .attr( 'class', 'lineChart--xAxis' )
                    .attr( 'transform', 'translate(' + detailWidth / 2 + ',' + ( height + 7 ) + ')' )
                    .call( xAxis );
                
                svg.append( 'g' )
                  .attr( 'class', 'lineChart--yAxisTicks' )
                  .call( yAxisTicks );

                svg.append( 'g' )
                    .attr( 'class', 'lineChart--yAxis' )
                    //.attr( 'transform', 'translate(' + detailWidth / 2 + ',' + ( height + 7 ) + ')' )
                    .call( yAxis );

                // Add the line path.
                svg.append( 'path' )
                    .datum( startData )
                    .attr( 'class', 'lineChart--areaLine' )
                    .attr( 'd', line )
                    .transition()
                    .duration( DURATION )
                    .delay( DURATION / 2 )
                    .attrTween( 'd', tween( data, line ) );
               
                
                // Add the area path.
                svg.append( 'path' )
                    .datum( startData )
                    .attr( 'class', 'lineChart--area' )
                    .attr( 'd', area )
                    .transition()
                    .duration( DURATION )
                    .attrTween( 'd', tween( data, area ) );
                
                
                function tween( b, callback ) {
                  return function( a ) {
                    var i = d3.interpolateArray( a, b );

                    return function( t ) {
                      return callback( i ( t ) );
                    };
                  };
                }
              });
            }
        }
    };
}]);