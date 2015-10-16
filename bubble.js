var vis = d3.select("#graph")
    .classed("svg-container", true)
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 1200 1200")
    //class to make it responsive
    .classed("svg-content-responsive", true);

var gender = true;
var nodeList = [];
var connectionList = [];
var rootBubble;

//shown on hover
var tooltip = d3.select("body")
    .append("div")
    .classed("tooltip", true)
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")

//read data and create root bubble
d3.csv("./data/nodes_info.csv", function(data1) {
    d3.csv("./data/nodes_figures.csv", function(data2) {
       
        //execute this after data has loaded
        var data = mergeData(data1, data2)
        var bubble = vis.selectAll("g.root").data([data[0]]).enter().append("g");
        var r = Math.sqrt(data[0].size);
        var margin = 10;
        var labelSpace = 0;
        var x = 600 - r - margin;
        var y = 400 - r - margin;
        var id = data[0].id;
        var size = data[0].size;
        var fullName = data[0].fullNameSpanish;
        var labelSpanish = data[0].labelSpanish;
        var color = data[0].color;
        var width = 2 * r + 2 * margin;
        var value = +data[0].maleproportion;
        
        if(!gender) {   
            
            rootBubble = new SizeCircle(data, bubble, x, y, id, size, fullName, labelSpanish, labelSpace, margin, color, "root", 1, 360, 1);
            rootBubble.draw();

        } else {

            rootBubble = new RadialProgress(data, bubble, x, y, id, size, value, width, fullName, labelSpanish, labelSpace, margin, color, "root", 1, 360, 1);
            rootBubble.draw();
        }
    });
});

//function for drawing the bubbles for faculties
var drawBubbles = function(uniData, rootId) {

    //load links data
    d3.csv("./data/links.csv", function(d) {
        return {
            source: d.source,
            target: d.target
        };
        }, function(links) {

            //find the faculties
            var dataAndLinks = findNodesAndLinks(rootId, links, uniData);
            var data = dataAndLinks[0];
            var links = dataAndLinks[1];
            
            //divide the circle into parts
            var slice = 360 / data.length;
            var rootMargin = 10;
            var margin = 3;
            var labelSpace = 20;
    
            //create bubbles of different sizes for faculties
            var bubbles = vis.selectAll("g.node").data(data).enter().append("g");
            bubbles.each(function(d,i) {
                var r = Math.sqrt(d.size) * 1.3;
                var rootX = +d3.select("[id='" + rootId + "']").attr("x");
                var rootY = +d3.select("[id='" + rootId + "']").attr("y");
                var id = d.id;
                var fullName = d.fullNameSpanish;
                var maleproportion = d.maleproportion;
                var labelSpanish = d.labelSpanish;
                var size = d.size;
                var length = data.length;
                var width = 2 * r + 2 * margin + 2 * labelSpace;
                var height = width;
                var color = d.color;
                
                if(!gender) {

                    var nodeCircle = new SizeCircle(d, d3.select(this), rootX, rootY, id, size, fullName, labelSpanish, labelSpace, margin, color, "node", i, slice, length);
                    nodeList.push(nodeCircle);
                    nodeCircle.draw();
                
                } else {

                    var radialProgress = new RadialProgress(d, d3.select(this), rootX, rootY, id, size, maleproportion, width, fullName, labelSpanish, labelSpace, margin, color, "node", i, slice, length);
                    nodeList.push(radialProgress);
                    radialProgress.draw();
                }
            });

            //create lines that connect the bubbles with the root bubble
            var lines = vis.selectAll("line").data(links).enter().append("line").each(function(d, i){
                
                var connection = new Connection(d3.select(this), rootBubble, nodeList[i], "#006600", slice, i);
                connectionList.push(connection);
   
            });
            
            //create transitions for the bubbles and lines (move them from the center to their final position)
            for(i in nodeList) {
                nodeList[i].move();
                connectionList[i].move();
            }   
        }
    )        
};

//calculate radians from degrees
var toRadians = function(angle) {
  return angle * (Math.PI / 180);
}

//calculate text position for the faculties
var textPosition = function(i, length, width) {
    if(i < length/2) {
        return [width/2, width];
    }
    else if(i >= length/2) {
        return [width/2, 14];
    }
};

//called on click on the root bubble
var onRootClick = function(data, svg, rootId) {
    
    //if bubbles for the faculties are not opened, show them
    if(!svg.classed("open")) {
        drawBubbles(data, rootId);
        svg.classed("open", true);
    }

    //if bubbles for the faculties are shown, remove them
    else {
        vis.selectAll("g.node").remove();
        var slice = 360 / data.slice(1).length;
        nodeList = [];
        for(i in connectionList) {
            connectionList[i].erase();
        }
        connectionList = [];
        svg.classed("open", false);
    }
};

//find the faculties that are connected to the upct university and create filtered link list
var findNodesAndLinks = function(rootId, links, data) {
    targetArray = [];
    var filteredData = [];
    var filteredLinks = [];
    for (var i in links) {
        if(links[i].source === rootId) {
            targetArray.push(links[i].target);
            filteredLinks.push(links[i]);
        }
    }
    for (var i in data) {
        if(targetArray.indexOf(data[i].id) > -1) {
            
            filteredData.push(data[i]);
        }
    }
    return [filteredData, filteredLinks];
};

//mergind data from nodes_figures.csv and nodes_info.csv into one array of object
var mergeData = function(data1, data2) {
    var data = data1;
    for(var i in data) {
        var info = data[i];
        for(var j in data2) {
            var figures = data2[j];
            if(info.id === figures.node_id) {
                if(figures.indicator === "maleproportion") {
                    info.maleproportion = +figures.value;
                }
                else {
                    info.size = +figures.value;
                }
            }
        }
    }
    return data;
}

function Connection(connection, source, target, stroke, slice, position) {

    var sourceR = source.r;
    var sourceX = source.x + source.width/2;
    var sourceY = source.y + source.width/2;
    var targetR = target.r;
    var targetX = target.x + target.width/2;
    var targetY = target.y + target.width/2;
    var x1 = sourceX + Math.cos((position+1) * toRadians(slice)) * sourceR;
    var y1 = sourceY + Math.sin((position+1) * toRadians(slice)) * sourceR;
    var x2 = targetX + Math.cos((position+1) * toRadians(slice)) * targetR;
    var y2 = targetY + Math.sin((position+1) * toRadians(slice)) * targetR;

    connection
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .style("stroke", stroke)
        .style("stroke-width", "3px");

    this.move = function() {
        
        var newX = (target.x + target.width/2) - Math.cos((position+1) * toRadians(slice)) * targetR;
        var newY = (target.y + target.width/2) - Math.sin((position+1) * toRadians(slice)) * targetR;
        var transition = connection.transition()
            .duration(1500)
            .ease("elastic")
            .delay(0)
            .attr("x2", newX)
            .attr("y2", newY);
    }

    this.erase = function() {
        connection.transition()
            .duration(200)
            .ease("linear")
            .delay(0)
            .attr("x2", x1)
            .attr("y2", y1)
            .each("end", function() {d3.selectAll("line").remove()});
    }
}


//create circles which size depends on the size of the faculties
function SizeCircle(data, parent, x, y, id, size, fullName, labelSpanish, labelSpace, margin, color, classes, position, slice, len) {
    var data = data;
    var parent = parent;
    this.x = x;
    this.y = y;
    var id = id;
    var size = size;
    var fullName = fullName;
    var labelSpanish = labelSpanish;
    var labelSpace = labelSpace;
    var margin = margin;
    var color = color;
    var classes = classes;
    var position = position;
    var slice = slice;
    var len = len;


    if (classes === "root") { 
        this.r = Math.sqrt(size);
        parent.classed("root", true);
    }
    else {
        this.r = Math.sqrt(size) * 1.3;
        parent.classed("node", true);
    }
    this.width =  2 * this.r + 2 * margin + 2 * labelSpace;
    var height = this.width;
    
    var lengths = [220, 240, 260, 200, 180]; 
    this.chosenLength = 200;

    var svg = parent.append("svg");

    this.draw = function() {
      
        svg.attr("x", this.x)
            .attr("y", this.y)
            .attr("width", this.width)
            .attr("height", height)
            .attr("id", id)
            .attr("text", fullName)
            .classed(classes, true);

        //asign click and hover events    
        svg
            .on("mouseover", function(){
                tooltip.attr("text", svg.attr("text"));
                return tooltip.style("visibility", "visible");
            })
            .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY) + 3 + "px").style("left",(d3.event.pageX) - 15 + "px");})
            .on("mouseout", function(){return tooltip.style("visibility", "hidden");})
        if(svg.classed("root")) {
            svg.on("click", function(d){ onRootClick(data, svg, id);});
        }

        var group = svg.append("g");
        var circle = group.append("circle")
            .attr("cx", this.width/2)
            .attr("cy", this.width/2)
            .attr("r", this.r)
            .attr("fill", color)
            .classed(classes, true);

        //append text for size
        var text = group.append('text')
            .classed("size", true)
            .style('fill', 'white')
            .style("text-anchor", "middle")
            .text(size);

        if (!svg.classed("root")) { 
            text.style("font-size", this.r/1.1+"px")
                .classed("node", true)
                .attr('x', this.width/2)
                .attr('y', this.width/2 * 1.13);
        } else {
            text.style("font-size", "30px")
                .attr('x', this.width/2)
                .attr('y', this.width/2 + 30);
        }
        //append labels
        var label = group.append("text")
            .classed(classes, true)
            .classed("label", true)
            .text(labelSpanish)
            .style("text-anchor", "middle")

        if (!svg.classed("root")) { 
            label.style("font-size", "14px")
                .style('fill', '#006600')
                .attr("x", textPosition(position, len, this.width)[0])
                .attr("y", textPosition(position, len, this.width)[1]);
        }

        else {
            label.style("font-size", "30px")
                .style('fill', 'white')
                .attr('x', this.width/2)
                .attr('y', this.width/2);
        }
            /*svg.on("mouseover", function(){
                if(width < 90) {
                    _svgX = +svg.attr("x");
                    _svgY = +svg.attr("y");
                     console.log(_svgX + "prej");
                    _circleX = + circle.attr("cx");
                    _circleY = + circle.attr("cy");
                    var newX = +_width/2 + Math.cos((_i+1) * toRadians(_slice)) * (_r);
                    var newY = +_width/2 + Math.sin((_i+1) * toRadians(_slice)) * (_r);
                    var newWidth = _width + 2 * _r;
                    var newHeight = newWidth;
                    svg
                        .transition().duration(300).ease("linear").delay(0)
                        .attr("width", newWidth)
                        .attr("height", newHeight)
                        .attr("x", _svgX - _r)
                        .attr("y", _svgY - _r)
                    console.log(svg.attr("x") + "kasnej")
                        
                    circle
                        .transition().duration(300).ease("linear").delay(0)
                        .attr("r", 2 * _r)
                        .attr("cx", newX + _r)
                        .attr("cy", newY + _r)

                    text
                        .transition().duration(300).ease("linear").delay(0)
                        .attr("x", newX + _r)
                        .attr("y", (newY + _r) * 1.13)
                        .style("font-size", 2 *_r/1.1+"px");

                    label
                        .transition().duration(300).ease("linear").delay(0)
                        .attr("x", textPosition(_i, _length, newWidth)[0])  
                }
            });
            svg.on("mouseout", function(){
                if(_width < 90) {
                    console.log("mouseout");
                    var newX = +_width/2 + Math.cos((_i+1) * toRadians(_slice)) * (_r);
                    var newY = +_width/2 + Math.sin((_i+1) * toRadians(_slice)) * (_r);
                    svg
                        .transition().duration(300).ease("linear").delay(0)
                        .attr("width",  _width)
                        .attr("height", _width)
                        .attr("x", _svgX)
                        .attr("y", _svgY)
                    console.log(_svgX + "po mouseout");  
                       
                        
                    circle
                        .transition().duration(300).ease("linear").delay(0)
                        .attr("r", _r)
                        .attr("cx", _circleX)
                        .attr("cy", _circleY)

                    text
                        .transition().duration(300).ease("linear").delay(0)
                        .attr("x", _circleX)
                        .attr("y", (_circleY) * 1.13)
                        .style("font-size", _r/1.1+"px");

                    label
                        .transition().duration(300).ease("linear").delay(0)
                        .attr("x", textPosition(_i, _length, _width)[0])
                }           
            });*/   

    }

    this.move = function() {
         chosenLength = lengths[Math.floor(Math.random() * lengths.length)];
         var newX = 600 + Math.cos((position+1) * toRadians(slice)) * chosenLength;
         newX > this.x ? newX = newX - this.r : newX = newX - 2 * this.r;
         var newY = 400 + Math.sin((position+1) * toRadians(slice)) * chosenLength;
         newY > this.y ? newY = newY - this.r : newY = newY - 2 * this.r;
         this.x = newX;
         this.y = newY;
         var transition = svg.transition()
            .duration(1500)
            .ease("elastic")
            .delay(0)
            .attr("x", this.x)
            .attr("y", this.y);
          
    }

}

//creating radial progress that shows gender distribution of faculties
function RadialProgress(data, parent, x, y, id, size, value, width, fullName, labelSpanish, labelSpace, margin, color, classes, position, slice, len) { 
    var data = data;
    var parent = parent;
    this.x = x;
    this.y = y;
    var id = id;
    var size = size;
    var fullName = fullName;
    var labelSpanish = labelSpanish;
    var labelSpace = labelSpace;
    var margin = margin;
    var color = color;
    var classes = classes;
    var position = position;
    var slice = slice;
    var len = len;
    var value = value;
    
    var duration = 1000;   
       
    var minValue = 0,
        maxValue = 100;

    var  currentArc= 0, currentValue=0;

    var arc = d3.svg.arc()
        .startAngle(0 * (Math.PI/180)); //just radians

    this.width = width;
    var height = this.width;
     var radialWidth = width - 2 * margin - 2 * labelSpace;
    this.r = radialWidth/2;
    var fontSize = radialWidth*.3;
    arc.outerRadius(radialWidth/2);
    arc.innerRadius(radialWidth/2 * .85);

    var lengths = [220, 240, 260, 200, 180]; 
    this.chosenLength = 200;

    var svg = parent.append("svg");


    this.draw = function() {

        svg.attr("x", this.x)
            .attr("y", this.y)
            .attr("width", width)
            .attr("height", width)
            .attr("id", id)
            .attr("text", fullName)
            .classed(classes, true);

        //asign click and hover events    
        svg
            .on("mouseover", function(){
                tooltip.attr("text", svg.attr("text"));
                return tooltip.style("visibility", "visible");
            })
            .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY) + 3 + "px").style("left",(d3.event.pageX) - 15 + "px");})
            .on("mouseout", function(){return tooltip.style("visibility", "hidden");})
        if(svg.classed("root")) {  
            parent.classed("root", true); 
            svg.on("click", function(d){ onRootClick(data, svg, id);});
        }

        else {
            parent.classed("node", true); 
        }

        var background = svg.append("g").attr("class","component")
            .attr("cursor","pointer")

        arc.endAngle(360 * (Math.PI/180))

        background.append("rect")
            .attr("class","background")
            .attr("width", radialWidth)
            .attr("height", height)
            .attr("x", labelSpace  + margin)
            .attr("y", labelSpace  + margin)

        background.append("path")
            .attr("transform", "translate(" + (width/2) + "," + (width/2) + ")")
            .attr("d", arc)
            .attr("x", labelSpace + margin)
            .attr("y", labelSpace + margin)

        var label = background.append("text")
            .attr("class", "label")
            .text(labelSpanish)

        if (!svg.classed("root")) { 
            label.style("font-size", "14px")
                .style('fill', '#006600')
                .attr("x", textPosition(position, len, width)[0])
                .attr("y", textPosition(position, len, width)[1]);
        }

        else {
            label.style("font-size", "30px")
                .style('fill', 'white')
                .attr('x', width/2)
                .attr('y', width/2);
        }
        
        var g = svg.attr("transform", "translate(" + margin + "," + margin + ")");

        arc.endAngle(currentArc);
        svg.append("g").attr("class", "arcs");
        var path = svg.select(".arcs").selectAll(".arc").data([1,1]);
        path.enter().append("path")
            .attr("class","arc")
            .attr("transform", "translate(" + (width/2) + "," + (width/2) + ")")
            .attr("d", arc);


        svg.append("g").attr("class", "labels");
        var label = svg.select(".labels").selectAll(".label").data([1,1]);
        label.enter().append("text")
            .attr("class","label")
            .attr("y", width/2 + fontSize/3)
            .attr("x", width/2)
            .attr("cursor","pointer")
            .attr("width", radialWidth)
            .text(function (d) { return Math.round((value - minValue)/(maxValue - minValue)*100) + "%" })
            .style("font-size", fontSize+"px")

        path.exit().transition().duration(500).attr("x",1000).remove();

        layout(svg);

        function layout(svg) {

            var ratio=(value - minValue)/(maxValue - minValue);
            var endAngle=Math.min(360*ratio,360);
            endAngle=endAngle * Math.PI/180;

            path.datum(endAngle);
            path.transition().duration(duration)
                .attrTween("d", arcTween);

            label.datum(Math.round(ratio*100));
            label.transition().duration(duration)
                .tween("text",labelTween);

        }
    }

    var labelTween = function(a) {
        var i = d3.interpolate(currentValue, a);
        currentValue = i(0);

        return function(t) {
            currentValue = i(t);
            this.textContent = Math.round(i(t)) + "%";
        }
    }

    var arcTween = function(a) {
        var i = d3.interpolate(currentArc, a);

        return function(t) {
            currentArc=i(t);
            return arc.endAngle(i(t))();
        };
    }

    this.move = function() {
         chosenLength = lengths[Math.floor(Math.random() * lengths.length)];
         var newX = 600 + Math.cos((position+1) * toRadians(slice)) * chosenLength;
         newX > this.x ? newX = newX - this.r : newX = newX - 2 * this.r;
         var newY = 400 + Math.sin((position+1) * toRadians(slice)) * chosenLength;
         newY > this.y ? newY = newY - this.r : newY = newY - 2 * this.r;
         this.x = newX;
         this.y = newY;
         var transition = svg.transition()
            .duration(1500)
            .ease("elastic")
            .delay(0)
            .attr("x", newX)
            .attr("y", newY);     
    }
}






