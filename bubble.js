var vis = d3.select("#graph")
    .classed("svg-container", true)
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 1200 1200")
    //class to make it responsive
    .classed("svg-content-responsive", true);

var rList = []

//shown on hover
var tooltip = d3.select("body")
    .append("div")
    .classed("tooltip", true)
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")

//read data and create root bubble
d3.csv("./data/data.csv", function(d) {
    return {
        id: d.id,
        labelSpanish: d.labelSpanish,
        labelEnglish : d.labelEnglish,
        color : d.color,
        size: +d.size,
        fullName: d.fullName
    };
    }, function(data) {

        //execute this after data has loaded
        var bubble = vis.selectAll("circle").data([data[0]])
            .enter()

            //create root bubble
            var group = bubble.append("g")
            var circle = group.append("circle");

            circle.attr("id", function(d) {return d.id})
                .attr("cx", 600)
                .attr("cy", 400)
                .attr("r", function(d) {
                    var r = Math.sqrt(d.size);
                    rList.push(r);
                    return r;
                })
                .attr("fill", function(d) {return d.color}) 
                .attr("text", function(d) {return d.fullName})
                .classed("root", true);
            
            //append spanish label
            group.append("text")
                .text(function(d){return d.labelSpanish})
                .attr("dx", function() {return group.select("circle").attr("cx")})
                .attr("dy", function() {return group.select("circle").attr("cy")})
                .style('fill', 'white')
                .style("text-anchor", "middle")
                .style("font-size", "30px")

            //append size of the university      
            group.append("text")
                .text(function(d){return d.size})
                .attr("dx", function() {return group.select("circle").attr("cx")})
                .attr("dy", function() {return +group.select("circle").attr("cy") + 30})
                .style('fill', 'white')
                .style("text-anchor", "middle")
                .style("font-size", "30px")

            //asign click and hover events    
            group
                .on("mouseover", function(){
                    tooltip.attr("text", circle.attr("text"));
                    return tooltip.style("visibility", "visible");})
                .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY) + 3 + "px").style("left",(d3.event.pageX) - 15 + "px");})
                .on("mouseout", function(){return tooltip.style("visibility", "hidden");})
                .on("click", function(d,i){ onRootClick(data, circle, d.id);});
    }
);

//function for drawing the bubbles for faculties
var drawBubbles = function(svg, uniData, rootId) {

    //load links data
    d3.csv("./data/links.csv", function(d) {
        return {
            source: d.source,
            target: d.target
        };
        }, function(links) {

            //find the faculties
            var data = findNodes(rootId, links, uniData);
            
            //divide the circle into parts
            var slice = 360 / data.length;

            //create bubbles of different sizes for faculties
            var bubbles = svg.selectAll("circle.node").data(data)
                .enter()
                var group = bubbles.append("g");
                group.classed("node", true)
                var circle = group.append("circle");
                circle.classed("node", true);
                circle.classed("circle", true)
                circle.attr("id", function(d) {return d.id;})
                    .attr("cx", function(d) {return d3.select("[id='" + rootId + "']").attr("cx")})
                    .attr("cy", function(d) {return d3.select("[id='" + rootId + "']").attr("cy")})
                    .attr("r", function(d) {

                        //size depends on the number of students
                        var r = Math.sqrt(d.size)*1.3;
                        //rList.push(r);
                        return r;
                    })
                    .attr("fill", function(d) {return d.color;}) 
                    .attr("text", function(d) {
                        fullName = d.fullName;
                        return d.fullName;
                    });

            //asign click and hover events to the bubbles
            svg.selectAll("g.node").each(function(d,i){
                var fullName = d3.select(this).select("circle").attr("text");
                d3.select(this)
                    .on("click", function(d,i){console.log("do something");})
                    .on("mouseover", function(){
                        tooltip.attr("text", fullName);
                        return tooltip.style("visibility", "visible");
                    })
                    .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY) + 3 + "px").style("left",(d3.event.pageX) - 15 + "px");})
                    .on("mouseout", function(){return tooltip.style("visibility", "hidden");});
            })

            //create lines that connect the bubbles with the root bubble
            var lines = svg.selectAll("line").data(links).enter().append("line").each(function(d, i){
                console.log(i);
                d3.select(this)
                    .classed("node", true)
                    .attr("x1", function(d) {return +d3.select("[id='" + rootId + "']").attr("cx") + Math.cos((i+1) * toRadians(slice)) * d3.select("[id='" + d.source + "']").attr("r")})
                    .attr("y1", function(d) {return +d3.select("[id='" + rootId + "']").attr("cy") + Math.sin((i+1) * toRadians(slice)) * d3.select("[id='" + d.source + "']").attr("r")})
                    .attr("x2", function(d) {return +d3.select("[id='" + rootId + "']").attr("cx") + Math.cos((i+1) * toRadians(slice)) * d3.select("[id='" + d.target + "']").attr("r")})
                    .attr("y2", function(d) {return +d3.select("[id='" + rootId + "']").attr("cy") + Math.sin((i+1) * toRadians(slice)) * d3.select("[id='" + d.target + "']").attr("r")})
                    .style("stroke", "#006600")
                    .style("stroke-width", "3px");
            });

            //create transitions for the bubbles and lines (move them from the center to their final position)
            d3.transition()
                .duration(1500)
                .ease("elastic")
                .delay(0)
                .each(function() {
                    var lengths = [220, 240, 260, 200, 180]; 
                    var selectLength = function(){return lengths[Math.floor(Math.random() * lengths.length)];};
                    var newX = {};
                    var newY = {};
                    d3.selectAll("circle.node").each(function(d, i){
                        d3.select(this).transition()

                        //calculate new positions for the bubbles
                        .attr("cx",function(d) {
                            var x = 600 + Math.cos((i+1) * toRadians(slice)) * selectLength();
                            newX[d.id] = x;
                            return x })
                        .attr("cy", function(d) {
                            var y = 400 + Math.sin((i+1) * toRadians(slice)) * selectLength();
                            newY[d.id] = y;
                            return y });
                    });
                    console.log(newX);
                    d3.selectAll("line").each(function(d, i){
                        d3.select(this).transition()

                        //calculate end points for the lines
                        .attr("x2", function(d) {
                            var targetCenter = newX[d.target];
                            var targetRadius = Math.cos((i+1) * toRadians(slice)) * d3.select("[id='" + d.target + "']").attr("r");
                            return targetCenter - targetRadius;
                        })
                        .attr("y2", function(d) {
                            var targetCenter = newY[d.target];
                            var targetRadius = Math.sin((i+1) * toRadians(slice)) * d3.select("[id='" + d.target + "']").attr("r");
                            return targetCenter - targetRadius;
                        });
                    });
                })

                //at the end of the transition append text to the bubbles
                .each("end", function(){
                    var groups = d3.selectAll("g.node").each( function(d, i){

                        //append text for size
                        d3.select(this).append('text')
                            .classed("node", true)
                            .attr('x', d3.select(this).select("circle").attr("cx"))
                            .attr('y', +d3.select(this).select("circle").attr("cy") + +d3.select(this).select("circle").attr("r")/4)
                            .style('fill', 'white')
                            .style("font-size", d3.select(this).select("circle").attr("r")/1.1+"px")
                            .style("text-anchor", "middle")
                            .text(function(d){return d.size})

                        //append labels
                        d3.select(this).append("text")
                            .classed("node", true)
                            .text(function(d){return d.labelSpanish})
                            .attr("dx", textPosition(i, data, d3.select(this).select("circle").attr("cx"), d3.select(this).select("circle").attr("cy"), d3.select(this).select("circle").attr("r"))[0])
                            .attr("dy", textPosition(i, data, d3.select(this).select("circle").attr("cx"), d3.select(this).select("circle").attr("cy"), d3.select(this).select("circle").attr("r"))[1])
                            .style('fill', '#006600')
                            .style("text-anchor", "middle")
                            .style("font-size", "14px");

                        
                    });
                });
        }
    )        
};

//calculate radians from degrees
var toRadians = function(angle) {
  return angle * (Math.PI / 180);
}

//calculate text position for the faculties
var textPosition = function(i, data, x, y, r) {
    if(i < data.length/2) {
        return [x, +y + +r + 20];
    }
    else if(i >= data.length/2) {
        return [x, y - r -15];
    }
};

//called on click on the root bubble
var onRootClick = function(data, circle, rootId) {
    
    //if bubbles for the faculties are not opened, show them
    if(!circle.classed("open")) {
        drawBubbles(vis, data, rootId);
        circle.classed("open", true);
    }

    //if bubbles for the faculties are shown, remove them
    else {
        vis.selectAll("text.node").remove();
        vis.selectAll("foreignObject.node").remove();
        vis.selectAll("g.node").remove();
        vis.selectAll("circle.node").remove();
        var slice = 360 / data.slice(1).length;
        d3.transition()
            .duration(200)
            .ease("linear")
            .delay(0)
            .each(function() {
                d3.selectAll("line").each(function(d, i){
                    d3.select(this).transition()
                        .attr("x2", d3.select(this).attr("x1"))
                        .attr("y2", d3.select(this).attr("y1"))
                    });
                        
                })
                .each("end", function(){
                    vis.selectAll("line.node").remove();
                    circle.classed("open", false);
                });
    }
};

//find the faculties that are connected to the upct universitiy
var findNodes = function(rootId, links, data) {
    targetArray = [];
    var filteredData = [];
    for (var i in links) {
        if(links[i].source === rootId) {
            targetArray.push(links[i].target);
        }
    }
    for (var i in data) {
        if(targetArray.indexOf(data[i].id) > -1) {
            
            filteredData.push(data[i]);
        }
    }
    return filteredData;
};




