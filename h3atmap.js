(function(){


    define(['d3'], function(d3){

        h3atmap = function(){

            var svg, selection, showncells;

            var settings = {
                'x':{
                    'margin':10,
                    'axis-width':500,
                    'gutter-width':90,
                },
                'y':{
                    'margin':10,
                    'axis-width':500,
                    'gutter-width':90,
                },
                'extent': {},
                'expand': false,
                'labels': false,
                'cell': {
                    'width': 15,
                    'height':15,
                    'padding-percentage': .10 
                },
                'colors': d3.scale.linear().range(['#ffeda0', '#feb24c', '#f03b20'])
            }

            var brush = {
                'group':undefined,
                'instance': d3.svg.brush()
            }

            var axis = {
                'x':{
                    'group': undefined,
                    'scale': d3.scale.ordinal(),
                    'instance': d3.svg.axis().orient('top')
                },
                'y':{
                    'group': undefined,
                    'scale': d3.scale.ordinal(),
                    'instance': d3.svg.axis().orient('right')
                },
            }
            
            var cells = {
                'group': undefined
            }

            var dispatch = d3
                .dispatch('brushend', 'draw', 'update', 'clean')

            var exports = function(){

                svg = selection.append('g').classed('h3atmap', true)

                axis.x.group = svg.append('g').classed('h3atmap-x-axis', true)
                axis.y.group = svg.append('g').classed('h3atmap-y-axis', true)
                cells.group = svg.append('g').classed('h3atmap-cells', true)
                brush.group = svg.append('g').classed('h3atmap-brush', true)

                brush.instance.on('brush', function(){
                    brush.group.selectAll("rect")
                        .attr('fill', 'green')
                        .attr('fill-opacity', '30%');
                })

                brush.instance.on("brushend", function(){
                    
                    var self = this
                    
                    xRange = [ brush.instance.extent()[0][0], brush.instance.extent()[1][0] ]
                    yRange = [ brush.instance.extent()[0][1], brush.instance.extent()[1][1] ]
                    
                    var selected = showncells.filter(function(point){
                        var captured = xRange[0] <= (axis.x.scale(point.x) + (axis.x.scale.rangeBand()/2) ) && 
                            (axis.x.scale(point.x) + (axis.x.scale.rangeBand()/2) ) <= xRange[1] &&
                            yRange[0] <= (axis.y.scale(point.y) + (axis.x.scale.rangeBand()/2) ) && 
                            (axis.y.scale(point.y) + (axis.x.scale.rangeBand()/2) ) <= yRange[1]
                        return captured
                    })
                    
                    dispatch.brushend([xRange, yRange], selected)
                    
                    brush.group.selectAll("rect.extent")
                    .attr('fill', 'green')
                    .attr('fill-opacity', '30%');

                })
                
                dispatch.on('clean', function(){
                    axis.x.group.selectAll('*').remove()
                    axis.y.group.selectAll('*').remove()
                    cells.group.selectAll('*').remove()
                    brush.group.selectAll('*').remove()                
                })

                dispatch.on('draw', function(data){
                    
                    showncells = data.points

                    updateScales(data)
                    updateBrush()

                    if (settings.expand){
                        selection
                        .attr('width', 2 * settings.x['margin'] + 
                            2 * settings.x['gutter-width'] + 
                            (data.columns.length * 
                                (settings.cell['width']) )
                        )
                        .attr('height', 2 * settings.y['margin'] + 
                            2 * settings.y['gutter-width'] + 
                            (data.rows.length * 
                                ( settings.cell['height'] ) ) ) 
                    } else {
                        selection
                        .attr('width', 2 * settings.x['margin'] + 
                            settings.x['axis-width'] + 
                            2 * settings.x['gutter-width'])
                        .attr('height', settings.y['margin'] + 
                            settings.y['axis-width'] + 
                            settings.y['gutter-width'])
                    }

                    var elements = cells.group.selectAll('rect')
                    .data(data.points, function(point){ 
                        return [point.x, point.y] 
                    }) 

                    elements.enter().append('rect')
                        .attr('x', function(cell){
                            return axis.x.scale(cell.x) 
                        })
                        .attr('y', function(cell){
                            return axis.y.scale(cell.y) 
                        })
                        .attr('width', axis.x.scale.rangeBand()) 
                        .attr('height', axis.x.scale.rangeBand()) 
                        .attr('fill', function(cell){
                            return settings.colors(cell.value)
                        })
                    if (settings.labels){ 
                        updateAxisLabels(data)
                    }

                })

                dispatch.on('update', function(data){
                    //Function to update heatmap cells and axis
                    
                    showncells = data.points

                    updateScales(data)
                    updateBrush()
                    
                    if (settings.labels){
                        updateAxisLabels(data)
                    }
                    var elements = cells.group.selectAll('rect')
                    .data(data.points, function(point){ 
                        return [point.x, point.y] 
                    }) 

                    elements.enter().append('rect')
                        .attr('x', function(cell){return axis.x.scale(cell.x) })
                        .attr('y', function(cell){return axis.y.scale(cell.y) })
                        .attr('width', axis.x.scale.rangeBand()) 
                        .attr('height', axis.x.scale.rangeBand())
                        .attr('fill', function(cell){
                            return settings.colors(cell.value)
                        })

                    elements
                        .transition().duration(2000)
                        .attr('x', function(cell){return axis.x.scale(cell.x) })
                        .attr('y', function(cell){return axis.y.scale(cell.y) })
                        .attr('width', axis.x.scale.rangeBand()) 
                        .attr('height', axis.y.scale.rangeBand())
                        .attr('fill', function(cell){
                            return settings.colors(cell.value)
                        })

                    elements.exit().transition()
                    .duration(2000)
                        .attr('width', 0) 
                        .attr('height', 0)
                    .remove()

                })


            }

            exports.dispatch = function(){
                if (arguments.length > 0){
                    dispatch = arguments[0]
                    return exports
                }
                return dispatch
            }

            exports.selection = function(){
                if (arguments.length > 0){
                    selection = arguments[0]
                    return exports
                }
                return selection
            }

            exports.settings = function(){
                if (arguments.length > 0){
                    settings = arguments[0]
                    return exports
                }
                return settings
            }

            exports.settings.colors = function(){
                if (arguments.length > 0){
                    settings.colors = arguments[0]
                    return exports
                }
                return settings.colors
            }

            exports.settings.x = function(){
                if (arguments.length > 0){
                    settings.x = arguments[0]
                    return exports
                }
                return settings.x
            }

            exports.settings.y = function(){
                if (arguments.length > 0){
                    settings.y = arguments[0]
                    return exports
                }
                return settings.y
            }

            exports.settings.cell = function(){
                if (arguments.length > 0){
                    settings.cell = arguments[0]
                    return exports
                }
                return settings.cell
            }

            exports.settings.expand = function(){
                if (arguments.length > 0){
                    settings.expand = arguments[0]
                    return exports
                }
                return settings.expand 
            }
            
            exports.settings.labels = function(){
                if (arguments.length > 0){
                    settings.labels = arguments[0]
                    return exports
                }
                return settings.labels
            }

            //Helper functions
            function updateBrush(){
                brush.instance.x(axis.x.scale)
                brush.instance.y(axis.y.scale)
                brush.group.call(brush.instance) 
            }

            function updateScales(data){

                if (settings.expand) {
                    settings.extent.x = [
                        settings.x['margin'] + settings.x['gutter-width'],
                        settings.x['margin'] + settings.x['gutter-width'] +
                            (data.columns.length * 
                                ( settings.cell['width'] ) )
                        
                    ]
                    settings.extent.y = [
                        settings.y['margin'] + settings.y['gutter-width'],
                        settings.y['margin'] + settings.y['gutter-width'] +
                            (data.rows.length * 
                                ( settings.cell['height'] ) )
                    ]
                    axis.x.scale.rangeRoundBands(settings.extent.x, settings.cell['padding-percentage'])
                    axis.y.scale.rangeRoundBands(settings.extent.y, settings.cell['padding-percentage'])
                } else {
                    settings.extent.x = [
                        settings.x['margin'] + settings.x['gutter-width'],
                        settings.x['margin'] + settings.x['gutter-width'] +
                            settings.x['axis-width']
                    ]
                    settings.extent.y = [
                        settings.y['margin'] + settings.y['gutter-width'],
                        settings.y['margin'] + settings.y['gutter-width'] +
                            settings.y['axis-width']
                    ]
                    axis.x.scale.rangeRoundBands(settings.extent.x, settings.cell['padding-percentage'])
                    axis.y.scale.rangeRoundBands(settings.extent.y, settings.cell['padding-percentage'])
                }

                axis.x.scale.domain(data.columns)
                axis.y.scale.domain(data.rows)
                
                axis.x.instance.scale(axis.x.scale)
                axis.y.instance.scale(axis.y.scale)
                
                settings.colors.domain([data.min, data.average, data.max])
                
            }
            
            function updateAxisLabels(data){
                
                axis.x.group.selectAll('*').remove()
                axis.y.group.selectAll('*').remove()
                
                axis.x.group
                    .attr("transform", "translate(0," + (settings.y['margin'] + settings.y['gutter-width']) + ")")
                    .call(axis.x.instance)
                    .selectAll("text")  
                        .style("text-anchor", "start")
                        .attr("transform", function(d) {
                            return "rotate(-90)" 
                        })
                        .attr("dy", (axis.x.scale.rangeBand()) +  "px")
                        .attr("dx", ".15em")

                axis.x.group.selectAll('path').style('display', 'none')

                axis.y.group.call(axis.y.instance)
                .attr("transform", function(){

                    var offset
                    if (settings.expand){
                        offset = (settings.x['margin'] + settings.x['gutter-width'] + 
                            (data.columns.length * settings.cell['height'])  ) 
                    } else {
                        offset = (settings.x['margin'] + 40 + settings.x['gutter-width'] + settings.x['axis-width'] ) 
                    }

                    return "translate(" + (offset) + ",0)"

                })

                axis.y.group.selectAll('path').style('display', 'none')
            }

            d3.rebind(exports, dispatch, 'on', 'draw', 'update', 'clean', 'brushend')

            return exports

        }

        return h3atmap

    })


})()
