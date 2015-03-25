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

    //Make a selection to feed into the heatmap
    var elem = d3.select('div#heatmap')
        .append('svg').classed('heatmap', true)
    
    //Set up the heatmap
    var heatmap = h3atmap()
        .selection(elem)
        .settings.labels(true)
        .settings.expand(true)
    
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
