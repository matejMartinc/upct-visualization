var vis = d3.select("#graph")
    .classed("svg-container", true)
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 1200 1200")
    //class to make it responsive
    .classed("svg-content-responsive", true);

var gender = false;
var nodeList = [];
var connectionList = [];
var rootBubble;
var data;
var links;
var bubble;
var r;
var margin;
var labelSpace;
var x;
var y;
var id;
var size;
var fullName;
var labelSpanish;
var color;
var width;
var value;

//shown on hover
var tooltip = d3.select("body")
    .append("div")
    .classed("tooltip", true)
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")

document.addEventListener("DOMContentLoaded", function (event) {
    var _selector = document.querySelector('input[id=cmn-toggle]');
    if (_selector.checked) {
        gender = true;
    } else {
        gender = false;
    }
    _selector.addEventListener('change', function (event) {
        if (_selector.checked) {
           changeView(true);
        } else {
           changeView(false);
        }
    });
});

//read data and create root bubble
d3.csv("./data/nodes_info.csv", function(data1) {
    d3.csv("./data/nodes_figures.csv", function(data2) {
        d3.csv("./data/links.csv", function(allLinks) {
       
            //execute this after data has loaded
            data = mergeData(data1, data2);
            links = allLinks;
            bubble = vis.selectAll("g.root").data([data[0]]).enter().append("g");
            r = Math.sqrt(data[0].size);
            margin = 10;
            labelSpace = 0;
            x = 700 - r - margin;
            y = 300 - r - margin;
            id = data[0].id;
            size = data[0].size;
            fullName = data[0].fullNameSpanish;
            labelSpanish = data[0].labelSpanish;
            color = data[0].color;
            width = 2 * r + 2 * margin;
            value = +data[0].maleproportion;

            //draw root sizeCircle or radialProgres, depends on the chosen view
            if(!gender) {   
                
                rootBubble = new SizeCircle(links, data, bubble, x, y, id, size, fullName, labelSpanish, labelSpace, margin, color, "root", 1, 360, 1);
                rootBubble.draw();

            } else {

                rootBubble = new RadialProgress(links, data, bubble, x, y, id, size, value, width, fullName, labelSpanish, labelSpace, margin, color, "root", 1, 360, 1);
                rootBubble.draw();
            }
        });
    });
});

//change from size to maleproportion view
var changeView = function(gen) {
    gender = gen;
    var svg = vis.selectAll("svg.root");
    var open = svg.classed("open");
    vis.selectAll("g.root").remove();
    console.log(open);
    bubble = vis.selectAll("g.root").data([data[0]]).enter().append("g");
   
    if(!gender) {
        rootBubble = new SizeCircle(links, data, bubble, x, y, id, size, fullName, labelSpanish, labelSpace, margin, color, "root", 1, 360, 1);
        rootBubble.draw();
    }

    else {
        rootBubble = new RadialProgress(links, data, bubble, x, y, id, size, value, width, fullName, labelSpanish, labelSpace, margin, color, "root", 1, 360, 1);
        rootBubble.draw();
    }

    if(open) {
        vis.selectAll("g.node").remove();
        nodeList = [];
        vis.selectAll("line").remove();
        connectionList = [];
        drawBubbles(links, data, id);
        var svg = vis.selectAll("svg.root");
        svg.classed("open", true);
    }
}

//function for drawing the bubbles for faculties
var drawBubbles = function(links, uniData, rootId) {

    //find the faculties
    var dataAndLinks = findNodesAndLinks(rootId, links, uniData);
    var data = dataAndLinks[0];
    var links = dataAndLinks[1];
    
    //divide the circle into parts
    var slice = 360 / data.length;
    
    var margin = 3;
    var labelSpace = 20;

    //create bubbles of different sizes for faculties
    var bubbles = vis.selectAll("g.node").data(data).enter().append("g");
    bubbles.each(function(d,i) {
        var r = Math.sqrt(d.size) * 1.1;
        var x = 700 - r - margin - labelSpace;
        var y = 300 - r - margin - labelSpace;
        var id = d.id;
        var fullName = d.fullNameSpanish;
        var maleproportion = d.maleproportion;
        var labelSpanish = d.labelSpanish;
        var size = d.size;
        var length = data.length;
        var width = 2 * r + 2 * margin + 2 * labelSpace;
        var height = width;
        var color = d.color;

        //draw nodes sizeCircles or radialProgreses, depends on the chosen view
        if(!gender) {

            var nodeCircle = new SizeCircle(links, d, d3.select(this), x, y, id, size, fullName, labelSpanish, labelSpace, margin, color, "node", i, slice, length);
            nodeList.push(nodeCircle);
            nodeCircle.draw();
        
        } else {

            var radialProgress = new RadialProgress(links, d, d3.select(this), x, y, id, size, maleproportion, width, fullName, labelSpanish, labelSpace, margin, color, "node", i, slice, length);
            nodeList.push(radialProgress);
            radialProgress.draw();
        }
    });

    //create lines that connect the bubbles with the root bubble
    var lines = vis.selectAll("line").data(links).enter().append("line");
    if(gender) {
        var color = "rgb(63, 127, 205)";
    }
    else {
        var color = "#000066";
    }
    lines.each(function(d, i){
        var connection = new Connection(d3.select(this), rootBubble, nodeList[i], color, slice, i);
        connectionList.push(connection);
    });
    
    //create transitions for the bubbles and lines (move them from the center to their final position)
    for(i in nodeList) {
        nodeList[i].move();
        connectionList[i].move();
    }           
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
var onRootClick = function(links, data, svg, rootId) {
    
    //if bubbles for the faculties are not opened, show them
    if(!svg.classed("open")) {
        drawBubbles(links, data, rootId);
        svg.classed("open", true);
    }

    //if bubbles for the faculties are shown, remove them
    else {
        vis.selectAll("g.node").remove();
        //var slice = 360 / data.slice(1).length;
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

//merging data from nodes_figures.csv and nodes_info.csv into one array of object
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

//object tha draws lines between source and target bubbles
function Connection(connection, source, target, stroke, slice, position) {

    var sourceR = source.getR();
    var sourceX = source.getX() + source.getWidth()/2;
    var sourceY = source.getY() + source.getWidth()/2;
    var targetR = target.getR();
    var targetX = target.getX() + target.getWidth()/2;
    var targetY = target.getY() + target.getWidth()/2;
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

    //move the target x and y
    this.move = function() {
        var newX = (target.getX() + target.getWidth()/2) - Math.cos((position + 1) * toRadians(slice)) * targetR;
        var newY = (target.getY() + target.getWidth()/2) - Math.sin((position + 1) * toRadians(slice)) * targetR;
        var transition = connection.transition()
            .duration(1500)
            .ease("elastic")
            .delay(0)
            .attr("x2", newX)
            .attr("y2", newY);
    }

    //erase lines after a transition efect
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
function SizeCircle(links, data, parent, x, y, id, size, fullName, labelSpanish, labelSpace, margin, color, classes, position, slice, len) {
    var links = links;
    var data = data;
    var parent = parent;
    var x = x;
    var y = y;
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

    if (classes.split(" ").indexOf("root") != -1) { 
        var r = Math.sqrt(size);
        parent.classed("root", true);
    }

    //make non root bubbles a bit bigger
    else {
        var r = Math.sqrt(size) * 1.1;
        parent.classed("node", true);
    }
    var width =  2 * r + 2 * margin + 2 * labelSpace;
    var height = width;
    var fontSize = r *.8;

    //list of different length lines, a length is chosen randomly from the list
    var lengths = [220, 210, 200, 190, 180, 170, 160]; 
    var chosenLength = 200;

    var svg = parent.append("svg");
    var circle;
    var text;
    var label;

    //getters for attributes that are needed outside the class
    this.getX = function() {
        return x;
    }

    this.getY = function() {
        return y;
    }

    this.getWidth = function() {
        return width;
    }

    this.getR = function() {
        return r;
    }

    //draw a bubble 
    this.draw = function() {
      
        svg.attr("x", x)
            .attr("y", y)
            .attr("width", width)
            .attr("height", height)
            .attr("id", id)
            .attr("text", fullName)
            .classed(classes, true);

        if(svg.classed("root")) {
            svg.on("click", function(d){ onRootClick(links, data, svg, id);});
        }

        var group = svg.append("g")
            .attr("cursor","pointer");
        circle = group.append("circle")
            .attr("cx", width/2)
            .attr("cy", width/2)
            .attr("r", r)
            .attr("fill", color)
            .classed(classes, true);

        //append text for size
        text = group.append('text')
            .classed("size", true)
            .style('fill', 'white')
            .style("text-anchor", "middle")
            .text(size);

        if (!svg.classed("root")) { 
            text.style("font-size", fontSize + "px")
                .classed("node", true)
                .attr('x', width/2)
                .attr('y', width/2 + fontSize/3);
        } else {
            text.style("font-size", "30px")
                .attr('x', width/2)
                .attr('y', width/2 + 30);
        }
        //append labels
        label = group.append("text")
            .classed(classes, true)
            .classed("label", true)
            .text(labelSpanish)
            .style("text-anchor", "middle")

        if (!svg.classed("root")) { 
            label.style("font-size", "14px")
                .style('fill', color)
                .attr("x", textPosition(position, len, width)[0])
                .attr("y", textPosition(position, len, width)[1]);
        }

        else {
            label.style("font-size", "30px")
                .style('fill', 'white')
                .attr('x', width/2)
                .attr('y', width/2);
        }

         //asign click and hover events to root bubble    
        if(parent.classed("root")) {
            svg.on("mousemove", function(){return tooltip.style("top", (d3.event.pageY) + 3 + "px").style("left",(d3.event.pageX) - 15 + "px");})
            svg.on("mouseover", function(){
                tooltip.attr("text", svg.attr("text"));
                return tooltip.style("visibility", "visible");
            })
            svg.on("mouseout", function(){return tooltip.style("visibility", "hidden"); })
        }

    }

    //move the bubbles outside the center of the page on root click
    this.move = function() {

        //randomly choose line length from a list of possible lengths
        chosenLength = lengths[Math.floor(Math.random() * lengths.length)];

        //calculate new x and y
        var newX = (x + width/2) + Math.cos((position + 1) * toRadians(slice)) * chosenLength;
        newX > x ? newX = newX - r : newX = newX - 2 * r;
        var newY = (y + width/2) + Math.sin((position + 1) * toRadians(slice)) * chosenLength;
        newY > y ? newY = newY - r : newY = newY - 2 * r;
        x = newX;
        y = newY;

        //create transition for svg
        var transition = svg.transition()
            .duration(1500)
            .ease("elastic")
            .delay(0)
            .attr("x", x)
            .attr("y", y)

            //assign mouse events for non root bubbles
            .each("end", function(d) {
                svg.on("mouseover", function(){
                    
                    //make small bubbles bigger on hover
                    if(width < 90) {
                        
                        var newX = width/2 + Math.cos((position + 1) * toRadians(slice)) * (r);
                        var newY = width/2 + Math.sin((position + 1) * toRadians(slice)) * (r);
                        var newWidth = width + 4 * r;
                        var newHeight = newWidth;
                        var newFontSize = r * 1.6;
                        svg
                            .transition().duration(300).ease("linear").delay(0)
                            .attr("width", newWidth)
                            .attr("height", newHeight)
                            .attr("x", x - 2 * r)
                            .attr("y", y - 2 * r)
                            
                        circle
                            .transition().duration(300).ease("linear").delay(0)
                            .attr("r", 2 * r)
                            .attr("cx", newX + 2 * r)
                            .attr("cy", newY + 2 * r)

                        text
                            .transition().duration(300).ease("linear").delay(0)
                            .attr("x", newX + 2 * r)
                            .attr("y", (newY + 2 * r) + newFontSize/3)
                            .style("font-size", newFontSize+"px");

                        label
                            .transition().duration(300).ease("linear").delay(0)
                            .attr("x", newX + 2 * r) 
                            .attr("y", textPosition(position, len, newWidth)[1])   
                    }

                    tooltip.attr("text", svg.attr("text"));
                    return tooltip.style("visibility", "visible"); 
                });
                svg.on("mouseout", function(){
                    
                    //change bubbles back to original size on mouse out
                    if(width < 90) {
                        svg
                            .transition().duration(300).ease("linear").delay(0)
                            .attr("width", width)
                            .attr("height", width)
                            .attr("x", x)
                            .attr("y", y)  
                        circle
                            .transition().duration(300).ease("linear").delay(0)
                            .attr("r", r)
                            .attr("cx", width/2)
                            .attr("cy", width/2)

                        text
                            .transition().duration(300).ease("linear").delay(0)
                            .attr("x", width/2)
                            .attr("y", width/2 + fontSize/3)
                            .style("font-size", fontSize+"px");

                        label
                            .transition().duration(300).ease("linear").delay(0)
                            .attr("x", textPosition(position, len, width)[0])
                            .attr("y", textPosition(position, len, width)[1])
                    }
                    return tooltip.style("visibility", "hidden");           
                }); 
                svg.on("mousemove", function(){return tooltip.style("top", (d3.event.pageY) + 3 + "px").style("left",(d3.event.pageX) - 15 + "px");})
            });
                  
    }

}

//creating radial progress that shows gender distribution of faculties
function RadialProgress(links, data, parent, x, y, id, size, value, width, fullName, labelSpanish, labelSpace, margin, color, classes, position, slice, len) { 
    var links = links;
    var data = data;
    var parent = parent;
    var x = x;
    var y = y;
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

    var width = width;
    var height = width;
    var radialWidth = width - 2 * margin - 2 * labelSpace;
    var r = radialWidth/2;
    var fontSize = radialWidth*.35;
    arc.outerRadius(radialWidth/2);
    arc.innerRadius(radialWidth/2 * .85);

    //list of possible line lengths
    var lengths = [220, 210, 200, 190, 180, 170, 160]; ; 
    var chosenLength = 200;

    var svg = parent.append("svg");
    var rect;
    var wholePath;
    var path;
    var proportion;
    var label;

    //getters for attributes needed outside the class
    this.getX = function() {
        return x;
    }

    this.getY = function() {
        return y;
    }

    this.getWidth = function() {
        return width;
    }

    this.getR = function() {
        return r;
    }

    //draw radial progress
    this.draw = function() {

        svg.attr("x", x)
            .attr("y", y)
            .attr("width", width)
            .attr("height", height)
            .attr("id", id)
            .attr("text", fullName)
            .classed(classes, true);
      
        //asign click and hover events to root radial progress
        if(svg.classed("root")) {  
            parent.classed("root", true); 
            svg.on("click", function(d){ 
                onRootClick(links, data, svg, id);
            });
    
            svg.on("mousemove", function(){return tooltip.style("top", (d3.event.pageY) + 3 + "px").style("left",(d3.event.pageX) - 15 + "px");})
            svg.on("mouseover", function(){
                tooltip.attr("text", svg.attr("text"));
                return tooltip.style("visibility", "visible");
            })
            svg.on("mouseout", function(){return tooltip.style("visibility", "hidden"); })
        }
        else {
            parent.classed("node", true); 
        }

        var background = svg.append("g").attr("class","component")
            .attr("cursor","pointer")

        arc.endAngle(360 * (Math.PI/180))

        //draw background 
        rect = background.append("rect")
            .attr("class","background")
            .attr("width", radialWidth)
            .attr("height", radialWidth)
            .attr("x", labelSpace  + margin)
            .attr("y", labelSpace  + margin)

        //draw whole circular path
        wholePath = background.append("path")
            .attr("transform", "translate(" + (width/2) + "," + (width/2) + ")")
            .attr("d", arc)

        //append labels
        label = background.append("text")
            .attr("class", "label")
            .text(labelSpanish)

        if (!svg.classed("root")) { 
            label.style("font-size", "14px")
                .style('fill', color)
                .attr("x", textPosition(position, len, width)[0])
                .attr("y", textPosition(position, len, width)[1]);
        }

        else {
            label.style("font-size", "30px")
                .style('fill', color)
                .attr('x', width/2)
                .attr('y', width/2);
        }
    
        arc.endAngle(currentArc);
        svg.append("g").attr("class", "arcs");

        //draw path for male proportion
        path = svg.select(".arcs").selectAll(".arc").data([1]);
        path.enter().append("path")
            .attr("class","arc")
            .attr("transform", "translate(" + (width/2) + "," + (width/2) + ")")
            .attr("d", arc);


        svg.append("g").attr("class", "labels");

        //add male proportion number in the middle of the bubble
        proportion = svg.select(".labels").selectAll(".label").data([1]);
        proportion.enter().append("text")
            .attr("class","label")
            .attr("y", width/2 + fontSize/3)
            .attr("x", width/2)
            .attr("cursor","pointer")
            .attr("width", radialWidth)
            .text(function (d) { return Math.round((value - minValue)/(maxValue - minValue)*100) + "%" })
            .style("font-size", fontSize+"px")
            .style('fill', color);

        if(svg.classed("root")) {
            fontSize = 30;
            proportion.attr("y", width/2 + fontSize)
                 .attr("x", width/2)
                 .style("font-size", fontSize+"px")
        }

        layout(svg);

        function layout(svg) {

            //animate path and proportion
            var ratio=(value - minValue)/(maxValue - minValue);
            var endAngle=Math.min(360*ratio,360);
            endAngle=endAngle * Math.PI/180;

            path.datum(endAngle);
            path.transition().duration(duration)
                .attrTween("d", arcTween);

            proportion.datum(Math.round(ratio*100));
            proportion.transition().duration(duration)
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

    //move the bubble from the center
    this.move = function() {
        
        //choose line length randomly from the list of possible lengths
        chosenLength = lengths[Math.floor(Math.random() * lengths.length)];

        //calculate new x and y
        var newX = (x + width/2) + Math.cos((position + 1) * toRadians(slice)) * chosenLength;
        newX > x ? newX = newX - r : newX = newX - 2 * r;
        var newY = (y + width/2) + Math.sin((position + 1) * toRadians(slice)) * chosenLength;
        newY > y ? newY = newY - r : newY = newY - 2 * r;
        x = newX;
        y = newY;
        var transition = svg.transition()
            .duration(1500)
            .ease("elastic")
            .delay(0)
            .attr("x", newX)
            .attr("y", newY) 
            .each("end", function(d) {

                //assign hover events to non root bubbles
                svg.on("mouseover", function(){

                    //make small bubbles bigger on hover
                    if(width < 90) {
                        
                        var newX = width/2 + Math.cos((position + 1) * toRadians(slice)) * (r);
                        var newY = width/2 + Math.sin((position + 1) * toRadians(slice)) * (r);
                        var newWidth = width + 4 * r;
                        var newHeight = newWidth;
                        svg
                            .transition().duration(300).ease("linear").delay(0)
                            .attr("width", newWidth)
                            .attr("height", newHeight)
                            .attr("x", x - 2 * r)
                            .attr("y", y - 2 * r)
                            
                        rect
                            .transition().duration(300).ease("linear").delay(0)
                            .attr("width", 2 * radialWidth)
                            .attr("height", 2 * radialWidth)
                            .attr("x", newX)
                            .attr("y", newY)

                        arc
                            .outerRadius(radialWidth)
                            .innerRadius(radialWidth * .85);
                        
                        arc.endAngle(360 * (Math.PI/180))

                        wholePath 
                            .transition().duration(300).ease("linear").delay(0)
                            .attr("transform", "translate(" + (newX + 2 * r) + "," + (newY + 2 * r) + ")")
                            .attr("d", arc)

                        arc.endAngle(currentArc);

                        path
                            .transition().duration(300).ease("linear").delay(0) 
                            .attr("transform", "translate(" + (newX + 2 * r) + "," + (newY + 2 * r) + ")")
                            .attr("d", arc)
                           
                        proportion
                            .transition().duration(300).ease("linear").delay(0)
                            .attr("x", newX + 2 * r)
                            .attr("y", (newY + 2 * r) + (2 * fontSize/3))
                            .style("font-size", 2 * fontSize +"px");

                        label
                            .transition().duration(300).ease("linear").delay(0)
                            .attr("x", newX + 2 * r) 
                            .attr("y", textPosition(position, len, newWidth)[1])   
                    }

                    tooltip.attr("text", svg.attr("text"));
                    return tooltip.style("visibility", "visible"); 
                });

                //on mouse out change small bubbles back to original size
                svg.on("mouseout", function(){
                    if(width < 90) {
                        svg
                            .transition().duration(300).ease("linear").delay(0)
                            .attr("width", width)
                            .attr("height", width)
                            .attr("x", x)
                            .attr("y", y)  
                        rect
                            .transition().duration(300).ease("linear").delay(0)
                            .attr("x", labelSpace + margin)
                            .attr("y", labelSpace + margin)

                        arc
                            .outerRadius(radialWidth/2)
                            .innerRadius(radialWidth/2 * .85);
                        
                        arc.endAngle(360 * (Math.PI/180))

                        wholePath 
                            .transition().duration(300).ease("linear").delay(0)
                            .attr("transform", "translate(" + width/2 + "," + width/2 + ")")
                            .attr("d", arc)

                        arc.endAngle(currentArc);

                        path
                            .transition().duration(300).ease("linear").delay(0) 
                            .attr("transform", "translate(" + width/2 + "," + width/2 + ")")
                            .attr("d", arc)
                           
                        proportion
                            .transition().duration(300).ease("linear").delay(0)
                            .attr("x", width/2)
                            .attr("y", width/2 + fontSize/3)
                            .style("font-size", fontSize +"px");

                        label
                            .transition().duration(300).ease("linear").delay(0)
                            .attr("x", textPosition(position, len, width)[0]) 
                            .attr("y", textPosition(position, len, width)[1])   
                    }
                    return tooltip.style("visibility", "hidden");           
                }); 
                svg.on("mousemove", function(){return tooltip.style("top", (d3.event.pageY) + 3 + "px").style("left",(d3.event.pageX) - 15 + "px");})
            });    
    }
}






