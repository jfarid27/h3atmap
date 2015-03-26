requirejs.config({
    paths: {
        d3: 'node_modules/d3/d3',
        h3atmap: 'h3atmap'
    }
});

requirejs(['h3atmap', 'd3'], function(h3atmap, d3){

    //Data creator
    var rows = d3.range(50).map(function(ind){ return 'gene' + ind })
    var columns = d3.range(50).map(function(ind){ return 'cond' + ind })
    var parsedData = rows.map(function(row){
        var cells = []
        columns.map(function(column){
            cells.push({
                y: row,
                x: column,
                value: Math.random()
            })
        })
        return cells
    }).reduce(function(p,n){ return p.concat(n) })

    var newData = rows.map(function(row){
        var cells = []
        columns.map(function(column){
            cells.push({
                y: row,
                x: column,
                value: Math.random()
            })
        })
        return cells
    }).reduce(function(p,n){ return p.concat(n) })

    var cellSettings = {
        'width': 15,
        'height': 15,
        'padding-percentage': .10
    }

    var visSettingsX = {
        'margin': 10,
        'axis-width': columns.length * cellSettings.height,
        'gutter-width': 90
    }

    var visSettingsY = {
        'margin': 10,
        'axis-width': rows.length * cellSettings.width,
        'gutter-width': 90
    }

    //Make a selection to feed into the heatmap
    var elem = d3.select('div#heatmap')
        .append('svg').classed('heatmap', true)
        .attr('width', 2 * visSettingsX.margin + 
            2 * visSettingsX['gutter-width'] + 
            visSettingsX['axis-width'] 
        )
        .attr('height', 2 * visSettingsY.margin + 
            2 * visSettingsY['gutter-width'] + 
            visSettingsY['axis-width'] 
        )
    

    //Set up the heatmap
    var heatmap = h3atmap()
        .selection(elem)
        .settings.x(visSettingsX)
        .settings.y(visSettingsY)
        .settings.labels(true)
        .settings.expand(true)
        .settings.cell(cellSettings)
    
    //Initialize the heatmap
    heatmap()

    //Set up a brushend listener
    heatmap.on('brushend', function(ranges, selectedCells){
        console.log(ranges)
        console.log(selectedCells)
    })
    
    //Draw the heatmap with specified data
    heatmap.draw({
        points: parsedData,
        rows: rows,
        columns: columns,
        min: d3.min(parsedData, function(d){return d.value}),
        max: d3.max(parsedData, function(d){return d.value}),
        average: d3.mean(parsedData, function(d){return d.value}),
    })

    setTimeout(function(){

        var newColorSet = d3.scale.linear()
            .range(['red', 'white', 'green'])

        heatmap.settings.colors(newColorSet)
        heatmap.update({
            points: newData,
            rows: rows,
            columns: columns,
            min: d3.min(newData, function(d){return d.value}),
            max: d3.max(newData, function(d){return d.value}),
            average: d3.mean(newData, function(d){return d.value}),
        })

    }, 5000)

    setTimeout(function(){
        heatmap.clean()
        heatmap.draw({
            points: parsedData,
            rows: rows,
            columns: columns,
            min: d3.min(parsedData, function(d){return d.value}),
            max: d3.max(parsedData, function(d){return d.value}),
            average: d3.mean(parsedData, function(d){return d.value}),
        })
        
    }, 10000)

})
