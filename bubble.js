var vis = d3.select("#graph")
    .classed("svg-container", true)
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 1200 1200")

    //class to make it responsive
    .classed("svg-content-responsive", true);

var gender = false;
var sizeStandard;
var scaleFactor;
var rootBubble;
var data;
var links;

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
           changeView(true, [rootBubble], null);
        } else {
           changeView(false, [rootBubble], null);
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
            sizeStandard = data[0].size;
            createMainBubble("root");
        });
    });
});

var createMainBubble = function(classes) {
    scaleFactor = 1;
            
    var rootGroup = vis.selectAll("g.root").data([data[0]]).enter().append("g");
    var rootR = Math.sqrt(data[0].size);
    var rootMargin = 3;
    var rootLabelSpace = 110;
    var rootX = 600 - rootR - rootMargin - rootLabelSpace;
    var rootY = 430 - rootR - rootMargin - rootLabelSpace;
    var rootId = data[0].id;
    var rootSize = data[0].size;
    var rootFullName = data[0].fullNameSpanish;
    var rootLabelSpanish = data[0].labelSpanish;
    var rootColor = data[0].color;
    var maleProportion = +data[0].maleproportion;

    //draw root sizeCircle or radialProgres, depends on the chosen view
    if(!gender) {   
        rootBubble = new SizeCircle(null, rootGroup, rootX, rootY, rootId, rootSize, maleProportion, rootFullName, rootLabelSpanish, rootLabelSpace, rootMargin, rootColor, classes, 1, 360, 1);
        rootBubble.draw();
    } else {
        rootBubble = new RadialProgress(null, rootGroup, rootX, rootY, rootId, rootSize, maleProportion, rootFullName, rootLabelSpanish, rootLabelSpace, rootMargin, rootColor, classes, 1, 360, 1);
        rootBubble.draw();
    }
}

var goBack = function() {
    document.getElementById("back-button").style.visibility="hidden";
    vis.selectAll("g"). remove();
    vis.selectAll("line").remove();
    createMainBubble("root open");
    drawBubbles(rootBubble);
}

//change from size to maleproportion view
var changeView = function(gen, bubbleList, root) {
    gender = gen;
    if(bubbleList.length === 0) {
        return;
    }
    for(var i in bubbleList) {
        var bubble = bubbleList[i];
        var open = bubble.getParent().classed("open");
        var classes = bubble.getClasses();
        if(bubble.getRoot() === null) {
            bubble.erase();
            var r = bubble.getR();
            var margin = bubble.getMargin();
            var labelSpace = bubble.getLabelSpace();
            var x = bubble.getX();
            var y = bubble.getY();
            var id = bubble.getId();
            var size = bubble.getSize();
            var fullName = bubble.getFullName();
            var labelSpanish = bubble.getLabelSpanish();
            var color = bubble.getColor();
            var value = bubble.getValue();
            var width = bubble.getWidth();
            var position = bubble.getPosition();
            var slice = bubble.getSlice();
            var len = bubble.getLen();
            var rootGroup = vis.selectAll("[id='" + id +"']").data([1]).enter().append("g");
        
            if(!gender) {
                rootBubble = new SizeCircle(null, rootGroup, x, y, id, size, value, fullName, labelSpanish, labelSpace, margin, color, classes, position, slice, len);
                rootBubble.draw();
            }
            else {
                rootBubble = new RadialProgress(null, rootGroup, x, y, id, size, value, fullName, labelSpanish, labelSpace, margin, color, classes, position, slice, len);
                rootBubble.draw();
            }
        }

        if(open) {
            var lines = bubble.connectionList;
            var nodes = bubble.nodeList;
            for(var j in lines) {
                lines[j].fastErase();
                nodes[j].erase();
            }

            if(bubble.getRoot() === null) {
                drawBubbles(rootBubble);
                changeView(gen, bubble.nodeList, rootBubble);
            }
            else {
                root.nodeList[i].getParent().classed("node", false);
                root.nodeList[i].getParent().classed("root", true);
                root.nodeList[i].getParent().classed("leveltwo", true);
                root.nodeList[i].getParent().classed("open", true);
                root.nodeList[i].setClasses(root.nodeList[i].getParent().attr("class"));
                drawBubbles(root.nodeList[i]);
            }
            
        }
    } 
}

//function for drawing the bubbles for faculties
var drawBubbles = function(root) {

    //find the faculties
    var dataAndLinks = findNodesAndLinks(root.getId(), links, data);
    var bubbleData = dataAndLinks[0];
    var bubbleLinks = dataAndLinks[1];
    
    //divide the circle into parts
    var slice = 360 / bubbleData.length;
    
    var margin = 3;
    var labelSpace = 110;

    //create bubbles of different sizes for faculties
    for(var i in bubbleData) {
        var d = bubbleData[i];
        var bubble = vis.selectAll("g.node[id='" + d.id +"']").data([1]).enter().append("g");
        var r = Math.sqrt(d.size) * scaleFactor;
        if(root !== null) {
            if(root.getClasses().indexOf("levelone") >= 0) {
                if(r < 20) {
                    r = 20;
                }
            }
            else if (root.getClasses().indexOf("leveltwo") >= 0) {
                if(r < 10) {
                    r = 10;
                }
            }
        }
        var x = root.getX() + root.getWidth()/2 - r - margin - labelSpace;
        var y = root.getY() + root.getWidth()/2 - r - margin - labelSpace;
        var id = d.id;
        var fullName = d.fullNameSpanish;
        var maleProportion = d.maleproportion;
        var labelSpanish = d.labelSpanish;
        var size = d.size;
        var length = bubbleData.length;
        var color = d.color;

        //draw nodes sizeCircles or radialProgreses, depends on the chosen view
        if(!gender) {

            var nodeCircle = new SizeCircle(root, bubble, x, y, id, size, maleProportion, fullName, labelSpanish, labelSpace, margin, color, "node", i, slice, length);
            root.nodeList.push(nodeCircle);
            nodeCircle.draw();
        
        } else {

            var radialProgress = new RadialProgress(root, bubble, x, y, id, size, maleProportion, fullName, labelSpanish, labelSpace, margin, color, "node", i, slice, length);
            root.nodeList.push(radialProgress);
            radialProgress.draw();
        }
    }

    //create lines that connect the bubbles with the root bubble
    for (var i in bubbleLinks) {
        var line = vis.selectAll("line[id='" + d.id +"']").data([1]).enter().append("line");
        if(gender) {
            var color = "rgb(63, 127, 205)";
        }
        else {
            var color = "#000066";
        }
        var connection = new Connection(line, root, root.nodeList[i], color, slice, i, length);
        root.connectionList.push(connection);
    }
    
    //create transitions for the bubbles and lines (move them from the center to their final position)
    for(var i in root.nodeList) {
        root.nodeList[i].move();
        root.connectionList[i].move();
    }           
};

//calculate radians from degrees
var toRadians = function(angle) {
  return angle * (Math.PI / 180);
}

//calculate text position for the faculties
var textPosition = function(i, slice, startAngle, width, labelSpace) {
    if((((i + 1) * slice + startAngle) % 360) < 180) {
        return [width/2, width - labelSpace + 16];
    }
    else {
        return [width/2, labelSpace - 10];
    }
};

//called on click on the root bubble
var onRootClick = function(root) {

    //if bubbles for the faculties are not opened, show them
    if(!root.getParent().classed("open")) {
        root.getParent().classed("open", true);
        root.setClasses(root.getParent().attr("class"));
        drawBubbles(root);
    }

    //if bubbles for the faculties are shown, remove them
    else {
        root.getParent().classed("open", false);
        root.setClasses(root.getParent().attr("class"));
        for(var i in root.nodeList) {
            if(root.nodeList[i].getParent().classed("open")) {
                onRootClick(root.nodeList[i]);
            }
            root.nodeList[i].erase();
        }
        root.nodeList = [];
        for(var i in root.connectionList) {
            root.connectionList[i].erase();
        }
        root.connectionList = [];
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
function Connection(connection, source, target, stroke, slice, position, len) {
    var sourceR = source.getR();
    var sourceX = source.getX() + source.getWidth()/2;
    var sourceY = source.getY() + source.getWidth()/2;
    var targetR = target.getR();
    var targetX = target.getX() + target.getWidth()/2;
    var targetY = target.getY() + target.getWidth()/2;
    
    var startAngle = -10;
    if(source.getRoot() !== null) {
        slice = 360 / (len+1);
        startAngle =(((+source.getPosition() + 1) * +source.getSlice() + 180) % 360) + 10;
    }

    var x1 = sourceX + Math.cos((+position + 1) * toRadians(+slice) + toRadians(startAngle)) * sourceR;
    var y1 = sourceY + Math.sin((+position + 1) * toRadians(+slice) + toRadians(startAngle)) * sourceR;
    var x2 = targetX + Math.cos((+position + 1) * toRadians(+slice) + toRadians(startAngle)) * targetR;
    var y2 = targetY + Math.sin((+position + 1) * toRadians(+slice) + toRadians(startAngle)) * targetR;

    connection
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .style("stroke", stroke)
        .style("stroke-width", "3px");

    //move the target x and y
    this.move = function() {
        var newX = (target.getX() + target.getWidth()/2) - Math.cos((+position + 1) * toRadians(+slice) + toRadians(startAngle)) * targetR;
        var newY = (target.getY() + target.getWidth()/2) - Math.sin((+position + 1) * toRadians(+slice) + toRadians(startAngle)) * targetR;
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
            .each("end", function() {connection.remove()});
    }

    this.fastErase = function() {
        connection.remove();
    }
}

//create circles which size depends on the size of the faculties
function SizeCircle(root, parent, x, y, id, size, value, fullName, labelSpanish, labelSpace, margin, color, classes, position, slice, len) {
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
    var root = root;
    var me = this;
    
    var r = Math.sqrt(size) * scaleFactor;

    //list of different length lines, a length is chosen randomly from the list
    var lengths = [220, 210, 200, 190, 180, 170, 160]; 
    var chosenLength = 160;
    if(root != null) {
        if(root.getClasses().indexOf("levelone") >= 0) {
            lengths = [210, 200, 190, 180, 170, 160];
            if(r < 20) {
                r = 20;
            }
        }
        else if (root.getClasses().indexOf("leveltwo") >= 0) {
            lengths = [160, 150, 140, 130, 120, 110, 100];
            if(r < 10) {
                r = 10;
            } 
            
        }
    }
    var width =  2 * r + 2 * margin + 2 * labelSpace;
    var height = width;
    var fontSize = r *.8;
    var startAngle = -10;
    
    parent.classed(classes, true).attr("id", id);

    var svg = parent.append("svg");
    
    var circle;
    var text;
    var label;

    //getters for all attributes
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

    this.getMargin = function() {
        return margin;
    }

    this.getLabelSpace = function() {
        return labelSpace;
    }

    this.getId = function() {
        return id;
    }

    this.getSize = function() {
        return size;
    }

    this.getFullName = function() {
        return fullName;
    }

    this.getLabelSpanish = function() {
        return labelSpanish;
    }

    this.getColor = function() {
        return color;
    }

    this.getValue = function() {
        return value;
    }

    this.getParent = function() {
        return parent;
    }

    this.getRoot = function() {
        return root;
    }

    this.getClasses = function() {
        return classes;
    }

    this.getPosition = function() {
        return position;
    }

    this.getSlice = function() {
        return slice;
    }

    this.getLen = function() {
        return len;
    }

    this.getChosenLength = function() {
        return chosenLength;
    }

    this.setClasses = function(classed) {
        classes = classed;
    }

    this.nodeList = [];
    this.connectionList = [];

    //draw a bubble 
    this.draw = function() {
      
        svg.attr("x", x)
            .attr("y", y)
            .attr("width", width)
            .attr("height", height)
            .attr("text", fullName)

        svg.on("click", function(d){ 
            
            if(parent.classed("node")) {
                parent.classed("node", false);
                
                if(!root.getParent().classed("levelone") && !root.getParent().classed("leveltwo")) {
                    document.getElementById("back-button").style.visibility="visible";
                    parent.classed("root levelone open", true);
                    scaleFactor = Math.sqrt(sizeStandard) / Math.sqrt(size);
                    x = root.getX();
                    y = root.getY();
                    r = r * scaleFactor;
                    width =  2 * r + 2 * margin + 2 * labelSpace;
                    height = width;
                    fontSize = r *.8;
                    root.nodeList.splice(position, 1);
                    for(var i in root.nodeList) {
                        root.nodeList[i].erase();
                    }
                    for(var i in root.connectionList) {
                        root.connectionList[i].erase();
                    }
                    root.erase();
                    rootBubble = me;
                    root = null; 

                    svg.transition()
                       .duration(750)
                       .attr("x",x)
                       .attr("y",y) 
                       .attr("width", width)
                       .attr("height", height)

                    circle
                        .transition()
                        .duration(700)
                        .attr("cx", width/2)
                        .attr("cy", width/2)
                        .attr("r", r);

                    text
                        .transition().duration(700)
                        .style("font-size", "30px")
                        .attr('x', width/2)
                        .attr('y', width/2 + 30);

                    label
                        .transition().duration(700)
                        .style("font-size", "30px")
                        .style('fill', 'white')
                        .attr('x', width/2)
                        .attr('y', width/2);
                }
                else {
                    parent.classed("root leveltwo", true);
                }
                classes = parent.attr("class");
            }
            onRootClick(me);
        });

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

        if (!parent.classed("root")) { 
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

        if (!parent.classed("root")) { 
            label.style("font-size", "14px")
                .style('fill', color)
                .attr("x", textPosition(+position, +slice, +startAngle, width, labelSpace)[0])
                .attr("y", textPosition(+position, +slice, +startAngle, width, labelSpace)[1]);
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

    //move the bubbles outside the center of the page on click
    this.move = function() {

        //randomly choose line length from a list of possible lengths
        chosenLength = lengths[Math.floor(Math.random() * lengths.length)];
        if (root.getClasses().indexOf("leveltwo") >= 0) {
            if(position != 0) {
                var previousChosenLength = root.nodeList[position - 1].getChosenLength();
                if(chosenLength === previousChosenLength + 20 || chosenLength === previousChosenLength + 30 || chosenLength === previousChosenLength + 40) {
                    chosenLength = previousChosenLength;
                }
            }
        }

        if(root.getRoot() !== null) {
            slice = 360 / (len+1);
            startAngle =(((+root.getPosition() + 1) * +root.getSlice() + 180) % 360) + 10;
        }

        console.log(labelSpanish);
        console.log(position);
        console.log(chosenLength);

        //calculate new x and y
        var newX = (+x + Math.cos(((+position + 1) * toRadians(+slice)) + toRadians(startAngle)) * (chosenLength + r));
        var newY = (+y + Math.sin(((+position + 1) * toRadians(+slice)) + toRadians(startAngle)) * (chosenLength + r));
        x = newX;
        y = newY;

        label
            .attr("x", textPosition(+position, +slice, +startAngle, width, labelSpace)[0]) 
            .attr("y", textPosition(+position, +slice, +startAngle, width, labelSpace)[1])

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
                    if(r < 20) {
                        
                        var newX = width/2 + Math.cos((+position + 1) * toRadians(+slice) + toRadians(startAngle)) * (r);
                        var newY = width/2 + Math.sin((+position + 1) * toRadians(+slice) + toRadians(startAngle)) * (r);
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
                            .attr("y", textPosition(+position, +slice, +startAngle, newWidth, labelSpace)[1])   
                    }

                    tooltip.attr("text", svg.attr("text"));
                    return tooltip.style("visibility", "visible"); 
                });
                svg.on("mouseout", function(){
                    
                    //change bubbles back to original size on mouse out
                    if(r < 20) {
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
                            .attr("x", textPosition(+position, +slice, +startAngle, width, labelSpace)[0])
                            .attr("y", textPosition(+position, +slice, +startAngle, width, labelSpace)[1])
                    }
                    return tooltip.style("visibility", "hidden");           
                }); 
                svg.on("mousemove", function(){return tooltip.style("top", (d3.event.pageY) + 3 + "px").style("left",(d3.event.pageX) - 15 + "px");})
            });
                  
    }

    this.erase = function() {
        d3.selectAll("[id='" + id +"']").remove();
    }

}

//creating radial progress that shows gender distribution of faculties
function RadialProgress(root, parent, x, y, id, size, value, fullName, labelSpanish, labelSpace, margin, color, classes, position, slice, len) { 
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
    var me = this;
    
    var duration = 1000;   
       
    var minValue = 0,
        maxValue = 100;

    var  currentArc= 0, currentValue=0;

    var arc = d3.svg.arc()
        .startAngle(0 * (Math.PI/180)); //just radians
    var r = Math.sqrt(size) * scaleFactor;

    //list of different length lines, a length is chosen randomly from the list
    var lengths = [220, 210, 200, 190, 180, 170, 160]; 
    var chosenLength = 160;
    if(root != null) {
        if(root.getClasses().indexOf("levelone") >= 0) {
            lengths = [210, 200, 190, 180, 170, 160];
            if(r < 20) {
                r = 20;
            }
        }
        else if (root.getClasses().indexOf("leveltwo") >= 0) {
            lengths = [160, 150, 140, 130, 120, 110, 100];
            if(r < 10) {
                r = 10;
            } 
            
        }
    }

    var width = 2 * r + 2 * margin + 2 * labelSpace;
    var height = width;
    var radialWidth = 2 * r;
    var startAngle = - 10;
    
    var fontSize = radialWidth*.35;
    arc.outerRadius(radialWidth/2);
    arc.innerRadius(radialWidth/2 * .85);

    parent.classed(classes, true).attr("id", id);
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

    this.getMargin = function() {
        return margin;
    }

    this.getLabelSpace = function() {
        return labelSpace;
    }

    this.getId = function() {
        return id;
    }

    this.getSize = function() {
        return size;
    }

    this.getFullName = function() {
        return fullName;
    }

    this.getLabelSpanish = function() {
        return labelSpanish;
    }

    this.getColor = function() {
        return color;
    }

    this.getValue = function() {
        return value;
    }

    this.getParent = function() {
        return parent;
    }

    this.getRoot = function() {
        return root;
    }

    this.getClasses = function() {
        return classes;
    }

    this.getPosition = function() {
        return position;
    }

    this.getSlice = function() {
        return slice;
    }

    this.getLen = function() {
        return len;
    }

    this.getChosenLength = function() {
        return chosenLength;
    }

    this.setClasses = function(classed) {
        classes = classed;
    }

    this.nodeList = [];
    this.connectionList = [];

    //draw radial progress
    this.draw = function() {

        svg.attr("x", x)
            .attr("y", y)
            .attr("width", width)
            .attr("height", height)
            .attr("text", fullName)
      
        //asign click and hover events to root radial progress
        svg.on("click", function(d){ 
            
            if(parent.classed("node")) {
                parent.classed("node", false);
                
                if(!root.getParent().classed("levelone") && !root.getParent().classed("leveltwo")) {
                    document.getElementById("back-button").style.visibility="visible";
                    parent.classed("root levelone open", true);
                    scaleFactor = Math.sqrt(sizeStandard) / Math.sqrt(size);
                    x = root.getX();
                    y = root.getY();
                    r = r * scaleFactor;
                    radialWidth = 2 * r;
                    width =  2 * r + 2 * margin + 2 * labelSpace;
                    height = width;
                    fontSize = r *.8;
                    root.nodeList.splice(position, 1);
                    for(var i in root.nodeList) {
                        root.nodeList[i].erase();
                    }
                    for(var i in root.connectionList) {
                        root.connectionList[i].erase();
                    }
                    root.erase();
                    rootBubble = me;
                    root = null; 

                    fontSize = 27;
                    

                    svg.transition()
                       .duration(750)
                       .attr("x",x)
                       .attr("y",y) 
                       .attr("width", width)
                       .attr("height", height)

                    arc.outerRadius(radialWidth/2);
                    arc.innerRadius(radialWidth/2 * .85);
                    arc.endAngle(360 * (Math.PI/180))

                    rect
                        .transition().duration(700)
                        .attr("width", radialWidth)
                        .attr("height", radialWidth)
                        .attr("x", labelSpace + margin)
                        .attr("y", labelSpace + margin);

                    wholePath
                        .transition().duration(700)
                        .attr("transform", "translate(" + (width/2) + "," + (width/2) + ")")
                        .attr("d", arc);

                    arc.endAngle(currentArc);

                    path
                        .transition().duration(700)
                        .attr("transform", "translate(" + (width/2) + "," + (width/2) + ")")
                        .attr("d", arc);

                    label
                        .transition().duration(700)
                        .style("font-size", fontSize)
                        .attr('x', width/2)
                        .attr('y', width/2);

                    proportion
                        .transition().duration(700)
                        .attr("y", width/2 + fontSize)
                        .attr("x", width/2)
                        .style("font-size", fontSize+"px")
                }
                else {
                    parent.classed("root leveltwo", true);
                }
                classes = parent.attr("class");
            }
            onRootClick(me);
        });
    
        svg.on("mousemove", function(){return tooltip.style("top", (d3.event.pageY) + 3 + "px").style("left",(d3.event.pageX) - 15 + "px");})
        svg.on("mouseover", function(){
            tooltip.attr("text", svg.attr("text"));
            return tooltip.style("visibility", "visible");
        })
        svg.on("mouseout", function(){return tooltip.style("visibility", "hidden"); })

        var background = svg.append("g").attr("class","component")
            .attr("cursor","pointer")

        arc.endAngle(360 * (Math.PI/180))

        //draw background 
        rect = background.append("rect")
            .attr("class","background")
            .attr("width", radialWidth)
            .attr("height", radialWidth)
            .attr("x", labelSpace + margin)
            .attr("y", labelSpace + margin)

        //draw whole circular path
        wholePath = background.append("path")
            .attr("transform", "translate(" + (width/2) + "," + (width/2) + ")")
            .attr("d", arc)

        //append labels
        label = background.append("text")
            .attr("class", "label")
            .text(labelSpanish)

        if (!parent.classed("root")) { 
            label.style("font-size", "14px")
                .style('fill', color)
                .attr("x", textPosition(+position, +slice, +startAngle, width, labelSpace)[0])
                .attr("y", textPosition(+position, +slice, +startAngle, width, labelSpace)[1]);
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

        if(parent.classed("root")) {
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
        if (root.getClasses().indexOf("leveltwo") >= 0) {
            if(position != 0) {
                var previousChosenLength = root.nodeList[position - 1].getChosenLength();
                if(chosenLength === previousChosenLength + 20 || chosenLength === previousChosenLength + 30 || chosenLength === previousChosenLength + 40) {
                    chosenLength = previousChosenLength;
                }
            }
        }

        if(root.getRoot() !== null) {
            slice = 360 / (len+1);
            startAngle = (((+root.getPosition() + 1) * +root.getSlice() + 180) % 360) + 10;
        }

        //calculate new x and y
        var newX = (+x + Math.cos(((+position + 1) * toRadians(+slice)) + toRadians(startAngle)) * (chosenLength + r));
        var newY = (+y + Math.sin(((+position + 1) * toRadians(+slice)) + toRadians(startAngle)) * (chosenLength + r));
        x = newX;
        y = newY;

        label
            .attr("x", textPosition(+position, +slice, +startAngle, width, labelSpace)[0]) 
            .attr("y", textPosition(+position, +slice, +startAngle, width, labelSpace)[1])

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
                    if(r < 20) {
                        
                        var newX = width/2 + Math.cos((+position + 1) * toRadians(+slice) + toRadians(startAngle)) * (r);
                        var newY = width/2 + Math.sin((+position + 1) * toRadians(+slice) + toRadians(startAngle)) * (r);
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
                            .attr("y", textPosition(+position, +slice, +startAngle, newWidth, labelSpace)[1])   
                    }

                    tooltip.attr("text", svg.attr("text"));
                    return tooltip.style("visibility", "visible"); 
                });

                //on mouse out change small bubbles back to original size
                svg.on("mouseout", function(){
                    if(r < 20) {
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
                            .attr("x", textPosition(+position, +slice, +startAngle, width, labelSpace)[0]) 
                            .attr("y", textPosition(+position, +slice, +startAngle, width, labelSpace)[1])   
                    }
                    return tooltip.style("visibility", "hidden");           
                }); 
                svg.on("mousemove", function(){return tooltip.style("top", (d3.event.pageY) + 3 + "px").style("left",(d3.event.pageX) - 15 + "px");})
            });    
    }

    this.erase = function() {
        d3.selectAll("[id='" + id +"']").remove();
    }
}






