var vis = d3.select("#graph")
    .classed("svg-container", true)
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 1200 1200")

    //class to make it responsive
    .classed("svg-content-responsive", true);

var gender = false;
var analytics = false;
var tableCounter = 0;
var openedTabels = [];
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
           changeView(true, analytics, [rootBubble], null);
        } else {
           changeView(false, analytics, [rootBubble], null);
        }
        for(var i in openedTabels) {
            openedTabels[i].parent.moveToFront();
        }

    });
    var _selectorTable = document.querySelector('input[id=analytics-toggle]');
    if (_selectorTable.checked) {
        analytics = true;
    } else {
        analytics = false;
    }
    _selectorTable.addEventListener('change', function (event) {
        if (_selectorTable.checked) {
           changeView(gender, true, [rootBubble], null);
        } else {
           changeView(gender, false, [rootBubble], null);
        }
        openedTabels = [];
    });
});

var createMainPage = function() {

    scaleFactor = 1;        
    var rootGroup1 = vis.selectAll("g.root").data([0]).enter().append("g");
    var rootGroup2 = vis.selectAll("g.root").data([0]).enter().append("g");
    var rootGroup3 = vis.selectAll("g.root").data([0]).enter().append("g");
    var rootGroup4 = vis.selectAll("g.root").data([0]).enter().append("g");
    var rootMargin = 0;
    var rootLabelSpace = 0;;
    var studentPlanet = new SizeCircle({}, null, rootGroup1, 360, 100, "students", 6000, 0, "", "students", rootLabelSpace, rootMargin, "rgb(63, 127, 205)", "mainpage", 1, 360, 1);
    var employePlanet = new SizeCircle({}, null, rootGroup2, 700, 100, "employes", 6000, 0, "", "employes", rootLabelSpace, rootMargin, "rgb(63, 127, 205)", "mainpage", 1, 360, 1);
    var researchPlanet = new SizeCircle({}, null, rootGroup3, 420, 400, "research", 6000, 0, "", "research", rootLabelSpace, rootMargin, "rgb(63, 127, 205)", "mainpage", 1, 360, 1);
    var moneyPlanet = new SizeCircle({}, null, rootGroup4, 780, 400, "money", 6000, 0, "", "money", rootLabelSpace, rootMargin, "rgb(63, 127, 205)", "mainpage", 1, 360, 1);
    studentPlanet.draw();
    employePlanet.draw();
    researchPlanet.draw();
    moneyPlanet.draw();

} 

//read data and create root bubble
var readData = function(directory) {
    d3.csv("./data/"+directory+"/nodes_info.csv", function(data1) {
        d3.csv("./data/"+directory+"/nodes_figures.csv", function(data2) {
            d3.csv("./data/"+directory+"/links.csv", function(allLinks) {
           
                //execute this after data has loaded
                data = mergeData(data1, data2);
                links = allLinks;
                sizeStandard = data[0].size;
                createMainBubble("root");
            });
        });
    });
}

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
        rootBubble = new SizeCircle(data[0].year, null, rootGroup, rootX, rootY, rootId, rootSize, maleProportion, rootFullName, rootLabelSpanish, rootLabelSpace, rootMargin, rootColor, classes, 1, 360, 1);
        rootBubble.draw();
    } else {
        rootBubble = new RadialProgress(data[0].year, null, rootGroup, rootX, rootY, rootId, rootSize, maleProportion, rootFullName, rootLabelSpanish, rootLabelSpace, rootMargin, rootColor, classes, 1, 360, 1);
        rootBubble.draw();
    }
}

var goBack = function() {
    document.getElementById("back-button").style.visibility="hidden";
    document.querySelector("input.analytics-toggle + label").style.visibility="hidden";
    vis.selectAll("g"). remove();
    vis.selectAll("line").remove();
    createMainBubble("root open");
    tableCounter = 0;

    drawBubbles(rootBubble);
}

//change from size to maleproportion view
var changeView = function(gen, stats, bubbleList, root) {
    gender = gen;
    analytics = stats;
    if(bubbleList.length === 0) {
        return;
    }
    for(var i in bubbleList) {
        var bubble = bubbleList[i];
        if(bubble.big && !analytics) {
            bubble.erase(true, true);
            var x = bubble.oldX;
            var y = bubble.oldY;    
        }
        else {
            bubble.erase(true, false);
            var x = bubble.x;
            var y = bubble.y;
        }
        var classes = bubble.classes;
        var r = bubble.r;
        var margin = bubble.margin;
        var labelSpace = bubble.labelSpace;
        var id = bubble.id;
        var size = bubble.size;
        var fullName = bubble.fullName;
        var labelSpanish = bubble.labelSpanish;
        var color = bubble.color;
        var value = bubble.value;
        var width = bubble.width;
        var position = bubble.position;
        var slice = bubble.slice;
        var len = bubble.len;
        var rootGroup = vis.selectAll("[id='" + id +"']").data([1]).enter().append("g");
        var analyticsExists = false;

        for(var prop in bubble.tableData) {
            if(bubble.tableData[prop].length != 0) {
                analyticsExists = true;
                break;
            } 
        }

        function showOpenedTables() {
            newBubble.fixed = bubble.fixed;
            newBubble.mouseIn = bubble.mouseIn;
            newBubble.dragging = bubble.dragging;
            newBubble.transitionInprogress = bubble.transitionInprogress;
            newBubble.oldWidth = bubble.oldWidth;
            newBubble.oldX = bubble.oldX;
            newBubble.oldY = bubble.oldY;
            newBubble.big = bubble.big;
            newBubble.width = bubble.width;
            newBubble.height = bubble.height;
            if(newBubble.big) {
                var index = openedTabels.indexOf(bubble);
                if (index !== -1) {
                    openedTabels[index] = newBubble;
                }
            }
        }   
   
        
        if(!gender) {
            if(analytics && analyticsExists) {
                var newBubble = new Table(bubble.tableData, root, rootGroup, x, y, id, size, value, fullName, labelSpanish, labelSpace, margin, color, classes, position, slice, len);
                showOpenedTables()
            }
            else {
                var newBubble = new SizeCircle(bubble.tableData, root, rootGroup, x, y, id, size, value, fullName, labelSpanish, labelSpace, margin, color, classes, position, slice, len);
            }
        }
        else {
            if(analytics && analyticsExists) {
                var newBubble = new Table(bubble.tableData, root, rootGroup, x, y, id, size, value, fullName, labelSpanish, labelSpace, margin, color, classes, position, slice, len);
                showOpenedTables();
            }
            else {
                var newBubble = new RadialProgress(bubble.tableData, root, rootGroup, x, y, id, size, value, fullName, labelSpanish, labelSpace, margin, color, classes, position, slice, len);
            }
        }
        newBubble.startAngle = bubble.startAngle;    
        newBubble.draw();
        if(bubble.root === null) {
            rootBubble = newBubble;   
        }
        else {
            for(var j in bubble.root.connectionList) {
                bubble.root.connectionList[j].changeColor();
            }
            root.connectionList = bubble.root.connectionList;
            root.nodeList.push(newBubble);
            newBubble.addMouseEvents();
            
        }
        changeView(gen, stats, bubble.nodeList, newBubble);   
   
    }   
}

//function for drawing the bubbles for faculties
var drawBubbles = function(root) {

    //find the faculties
    var dataAndLinks = findNodesAndLinks(root.id, links, data);
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
       
        var r = Math.sqrt(+d.size) * scaleFactor;

        if(root !== null) {
            if(root.classes.indexOf("levelone") >= 0) {
                if(r < 20) {
                    r = 20;
                }
            }
            else if (root.classes.indexOf("leveltwo") >= 0) {
                if(r < 10) {
                    r = 10;
                }
            }
        }
        var x = root.x + root.width/2 - r - margin - labelSpace;
        var y = root.y + root.width/2 - r - margin - labelSpace;
        var id = d.id;
        var fullName = d.fullNameSpanish;
        var maleProportion = d.maleproportion;
        var labelSpanish = d.labelSpanish;
        var size = d.size;
        var length = bubbleData.length;
        var color = d.color;
        var analyticsExists = false;
        
        for(var prop in bubbleData[i].year) {
            if(bubbleData[i].year[prop].length != 0) {
                analyticsExists = true;
                tableCounter++;
                document.querySelector("input.analytics-toggle + label").style.visibility="visible";
                break;
            } 
        }

        //draw nodes sizeCircles or radialProgreses, depends on the chosen view
        if(!gender) {
            if(analytics && analyticsExists) {
                
                var nodeCircle = new Table(bubbleData[i].year, root, bubble, x, y, id, size, maleProportion, fullName, labelSpanish, labelSpace, margin, color, "node", i, slice, length);
            }
            else { 
                var nodeCircle = new SizeCircle(bubbleData[i].year, root, bubble, x, y, id, size, maleProportion, fullName, labelSpanish, labelSpace, margin, color, "node", i, slice, length);
            }
            root.nodeList.push(nodeCircle);
            nodeCircle.draw();
        
        } else {
            if(analytics && analyticsExists) {
                
                var radialProgress = new Table(bubbleData[i].year, root, bubble, x, y, id, size, maleProportion, fullName, labelSpanish, labelSpace, margin, color, "node", i, slice, length);
            }
            else {
                var radialProgress = new RadialProgress(bubbleData[i].year, root, bubble, x, y, id, size, maleProportion, fullName, labelSpanish, labelSpace, margin, color, "node", i, slice, length);
            }
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
    
    //create transitions for the bubbles and lines (move them from the center to their final position
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
    if(!root.parent.classed("open")) {
        root.parent.classed("open", true);
        root.classes = root.parent.attr("class");
        drawBubbles(root);
    }

    //if bubbles for the faculties are shown, remove them
    else {
        root.parent.classed("open", false);
        root.classes = root.parent.attr("class");
        for(var i in root.nodeList) {
            if(root.nodeList[i].parent.classed("open")) {
                onRootClick(root.nodeList[i]);
            }
            root.nodeList[i].erase(false, false);
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
                if(!info.hasOwnProperty("year")) {
                    info.year = {};
                }
                if(!info.year.hasOwnProperty(figures.year)) {
                    info.year[figures.year] = [];
                }
                if(figures.indicator === "maleproportion") {
                    info.maleproportion = +figures.value;
                }
                else if (figures.indicator === "students") {
                    info.size = +figures.value;
                }
                else if (figures.indicator === "newstudents") {
                    info.year[figures.year].push(figures.value);
                }
                else if (figures.indicator === "graduationrate") {
                    info.year[figures.year].push(figures.value);
                }
                else if (figures.indicator === "efficiencyrate") {
                    info.year[figures.year].push(figures.value);
                }
                 else if (figures.indicator === "performancerate") {
                     info.year[figures.year].push(figures.value);
                }
            }
        }
    }
    return data;
}

//object that draws lines between source and target bubbles
function Connection(connection, source, target, stroke, slice, position, len) {
    var sourceR = source.r;
    var sourceX = source.x + source.width/2;
    var sourceY = source.y + source.width/2;
    var targetR = target.r;
    var targetX = target.x + target.width/2;
    var targetY = target.y + target.width/2;
    
    var startAngle = -10;
    if(source.root !== null) {
        slice = 360 / (len+1);
        startAngle =(((+source.position + 1) * + source.slice + 180) % 360) + 10;
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

    target.parent.moveToFront();

    //move the target x and y
    this.move = function() {
        var newX = (target.x + target.width/2) - Math.cos((+position + 1) * toRadians(+slice) + toRadians(startAngle)) * targetR;
        var newY = (target.y + target.width/2) - Math.sin((+position + 1) * toRadians(+slice) + toRadians(startAngle)) * targetR;
        var transition = connection.transition()
            .duration(5 * (target.chosenLength + targetR))
            .ease("linear")
            .delay(0)
            .attr("x2", newX)
            .attr("y2", newY);
        x2 = newX;
        y2 = newY;
    }

    //erase lines after a transition efect
    this.erase = function() {
        connection.transition()
            .duration(300)
            .ease("linear")
            .delay(0)
            .attr("x2", x1)
            .attr("y2", y1)
            .each("end", function() {connection.remove()});
    }

    this.changeColor = function() {
        if(gender) {
            connection.style("stroke", "rgb(63, 127, 205)");
        }
        else {
            connection.style("stroke", "#000066");
        }
    }

    this.followDrag = function(x2,y2) {
        connection.attr("x2", x2)
                  .attr("y2", y2)
    }

    this.stopDrag = function() {
        connection.transition().duration(500).ease("linear")
            .attr("x2", x2)
            .attr("y2", y2)
    }
}

//create circles which size depends on the size of the faculties
function SizeCircle(tableData, root, parent, x, y, id, size, value, fullName, labelSpanish, labelSpace, margin, color, classes, position, slice, len) {
    
    this.tableData = tableData;
    this.parent = parent;
    this.x = x;
    this.y = y;
    this.id = id;
    this.size = size;
    this.fullName = fullName;
    this.labelSpanish = labelSpanish;
    this.labelSpace = labelSpace;
    this.margin = margin;
    this.color = color;
    this.classes = classes;
    this.position = position;
    this.slice = slice;
    this.len = len;
    this.value = value;
    this.root = root;
    
    this.r;
    this.lengths;
    this.chosenLength;
    this.width;
    this.height;
    this.fontSize;
    this.startAngle;
    this.svg;

    var circle;
    var text;
    this.label;

    this.nodeList = [];
    this.connectionList = [];
    
    var me = this;

    this.zoomTransition = function() {
        
        circle
            .transition()
            .duration(700)
            .attr("cx", this.width/2)
            .attr("cy", this.width/2)
            .attr("r", this.r);

        text
            .transition().duration(700)
            .style("font-size", "30px")
            .attr('x', this.width/2)
            .attr('y', this.width/2 + 30);

        this.label
            .transition().duration(700)
            .style("font-size", "30px")
            .style('fill', 'white')
            .attr('x', this.width/2)
            .attr('y', this.width/2);
    }

    //draw a bubble 
    this.draw = function() {
        this.calculateAttributes();
        this.svg.attr("x", this.x)
            .attr("y", this.y)
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("text", this.fullName)

        this.svg.on("click", function(d){ 
            me.handleClick();
        });

        var group = this.svg.append("g")
            .attr("cursor","pointer");
        
        circle = group.append("circle")
            .attr("cx", this.width/2)
            .attr("cy", this.width/2)
            .attr("r", this.r)
            .attr("fill", this.color)
            .classed(this.classes, true);

        //append text for size
        text = group.append('text')
            .classed("size", true)
            .style('fill', 'white')
            .style("text-anchor", "middle")
            .text(this.size);
      
        if (this.parent.classed("root") && !this.parent.classed("leveltwo")) { 
            text.style("font-size", "30px")
                .attr('x', this.width/2)
                .attr('y', this.width/2 + 30);
            
        } else {
            text.style("font-size", this.fontSize + "px")
                .classed("node", true)
                .attr('x', this.width/2)
                .attr('y', this.width/2 + this.fontSize/3);
        }

        if (this.parent.classed("mainpage")) {
            text.text(this.labelSpanish)
                .style("font-size", "35px")
                .attr('y', this.width/2 + 35/3);
        }

        //append labels
        this.label = group.append("text")
            .classed(this.classes, true)
            .classed("label", true)
            .text(this.labelSpanish)
            .style("text-anchor", "middle")

        if (this.parent.classed("root") && !this.parent.classed("leveltwo")) {    
            this.label.style("font-size", "30px")
                .style('fill', 'white')
                .attr('x', this.width/2)
                .attr('y', this.width/2);    
        }
        else {
            this.label.style("font-size", "14px")
                .style('fill', this.color)
                .attr("x", textPosition(+this.position, +this.slice, +this.startAngle, this.width, this.labelSpace)[0])
                .attr("y", textPosition(+this.position, +this.slice, +this.startAngle, this.width, this.labelSpace)[1]);
        }

         //asign click and hover events to root bubble    
        if(this.parent.classed("root")) {
            this.svg.on("mousemove", function(){return tooltip.style("top", (d3.event.pageY) + 3 + "px").style("left",(d3.event.pageX) - 15 + "px");})
            this.svg.on("mouseover", function(){
                tooltip.attr("text", me.svg.attr("text"));
                return tooltip.style("visibility", "visible");
            })
            this.svg.on("mouseout", function(){return tooltip.style("visibility", "hidden"); })
        }

    }

    this.addMouseEvents = function() {
        this.svg.on("mouseover", function(){ 
            //make small bubbles bigger on hover
            if(me.r < 20) {
                
                var newX = me.width/2 + Math.cos((+me.position + 1) * toRadians(+me.slice) + toRadians(+me.startAngle)) * (me.r);
                var newY = me.width/2 + Math.sin((+me.position + 1) * toRadians(+me.slice) + toRadians(+me.startAngle)) * (me.r);
                var newWidth = me.width + 4 * me.r;
                var newHeight = newWidth;
                var newFontSize = me.r * 1.6;
                me.svg
                    .transition().duration(300).ease("linear").delay(0)
                    .attr("width", newWidth)
                    .attr("height", newHeight)
                    .attr("x", me.x - 2 * me.r)
                    .attr("y", me.y - 2 * me.r)
                    
                circle
                    .transition().duration(300).ease("linear").delay(0)
                    .attr("r", 2 * me.r)
                    .attr("cx", newX + 2 * me.r)
                    .attr("cy", newY + 2 * me.r)

                text
                    .transition().duration(300).ease("linear").delay(0)
                    .attr("x", newX + 2 * me.r)
                    .attr("y", (newY + 2 * me.r) + newFontSize/3)
                    .style("font-size", newFontSize+"px");

                me.label
                    .transition().duration(300).ease("linear").delay(0)
                    .attr("x", newX + 2 * me.r) 
                    .attr("y", textPosition(+me.position, +me.slice, +me.startAngle, newWidth, me.labelSpace)[1])   
            }

            tooltip.attr("text", me.svg.attr("text"));
            return tooltip.style("visibility", "visible"); 
        });

        this.svg.on("mouseout", function(){
            
            //change bubbles back to original size on mouse out
            if(me.r < 20) {
                me.svg
                    .transition().duration(300).ease("linear").delay(0)
                    .attr("width", me.width)
                    .attr("height", me.width)
                    .attr("x", me.x)
                    .attr("y", me.y)  
                circle
                    .transition().duration(300).ease("linear").delay(0)
                    .attr("r", me.r)
                    .attr("cx", me.width/2)
                    .attr("cy", me.width/2)

                text
                    .transition().duration(300).ease("linear").delay(0)
                    .attr("x", me.width/2)
                    .attr("y", me.width/2 + me.fontSize/3)
                    .style("font-size", me.fontSize+"px");

                me.label
                    .transition().duration(300).ease("linear").delay(0)
                    .attr("x", textPosition(+me.position, +me.slice, +me.startAngle, me.width, me.labelSpace)[0])
                    .attr("y", textPosition(+me.position, +me.slice, +me.startAngle, me.width, me.labelSpace)[1])
            }
            return tooltip.style("visibility", "hidden");           
        }); 

        this.svg.on("mousemove", function(){return tooltip.style("top", (d3.event.pageY) + 3 + "px").style("left",(d3.event.pageX) - 15 + "px");})
    }
}

SizeCircle.prototype.erase = function(changeView, big) {
    if(!changeView) {
        for(var year in this.tableData) {
            if(this.tableData[year].length != 0) {
                tableCounter--;
                if(tableCounter == 0) {
                    document.querySelector("input.analytics-toggle + label").style.visibility="hidden";
                }
                break;
            } 
        }
    }
    else {
        if(this.root !== null && big) {
            var connection = this.root.connectionList[this.position]
            connection.stopDrag();  
        }
    }

    d3.selectAll("[id='" + this.id +"']").remove();
}

SizeCircle.prototype.calculateAttributes = function() {
    this.r = Math.sqrt(this.size) * scaleFactor;

    //list of different length lines, a length is chosen randomly from the list
    this.lengths = [220, 210, 200, 190, 180, 170, 160]; 
    this.chosenLength = 160;
    if(this.root != null) {
        if(this.root.classes.indexOf("levelone") >= 0) {
            this.lengths = [210, 200, 190, 180, 170, 160];
            if (this.r < 20) {
                this.r = 20;
            }
        }
        else if (this.root.classes.indexOf("leveltwo") >= 0) {
            this.lengths = [160, 150, 140, 130, 120, 110, 100];
            if (this.r < 10) {
                this.r = 10;
            }         
        }
    }
    this.width =  2 * this.r + 2 * this.margin + 2 * this.labelSpace;
    this.height = this.width;
    this.fontSize = this.r *.7;
    if (typeof this.startAngle == 'undefined') {
        this.startAngle = -10;
    }
    
    this.parent.classed(this.classes, true).attr("id", this.id);

    this.svg =this.parent.append("svg");
}

SizeCircle.prototype.handleClick = function() {
    if(this.parent.classed("node")) {
        this.parent.classed("node", false);    
        if(!this.root.parent.classed("levelone") && !this.root.parent.classed("leveltwo")) {
            this.parent.classed("root levelone open", true);
            scaleFactor = Math.sqrt(sizeStandard) / Math.sqrt(this.size);
            this.x = this.root.x;
            this.y = this.root.y;
            this.r = this.r * scaleFactor;
            this.width =  2 * this.r + 2 * this.margin + 2 * this.labelSpace;
            this.height = this.width;
            this.fontSize = this.r *.8;
            this.root.nodeList.splice(this.position, 1);
            if (typeof this.radialWidth != 'undefined') {
                this.radialWidth = 2 * this.r;
            }

            for(var i in this.root.nodeList) {
                this.root.nodeList[i].erase(false, false);
            }
            for(var i in this.root.connectionList) {
                this.root.connectionList[i].erase();
            }
            this.root.erase(false, false);
            rootBubble = this;
            this.root = null; 

            this.svg.transition()
               .duration(750)
               .attr("x",this.x)
               .attr("y",this.y) 
               .attr("width", this.width)
               .attr("height", this.height)
            
            this.zoomTransition();
           
        }
        else {
            this.parent.classed("root leveltwo", true);
        }
        this.classes = this.parent.attr("class");
    }
    if(this.parent.classed("mainpage")) {
        document.getElementById("back-button").style.visibility="visible";
        this.x = 600 - this.r;
        this.y = 400 - this.r;
        this.svg.transition()
            .duration(750)
            .attr("x",this.x)
            .attr("y",this.y) 
            .attr("width", this.width)
            .attr("height", this.height)
            .each("end", function() {
                vis.selectAll(".mainpage").remove();
                if(this.id == "students") {
                    readData("students");
                }
                else if(this.id == "employes") {
                    readData("employes");
                }
                else if(this.id == "research") {
                    readData("research");
                }
                else {
                    readData("money");
                }

            })
        

    }
    onRootClick(this);
}


//move the bubbles outside the center of the page on click
SizeCircle.prototype.move = function() {
    var me = this;
    //randomly choose line length from a list of possible lengths
    this.chosenLength = this.lengths[Math.floor(Math.random() * this.lengths.length)];
    if (this.root.classes.indexOf("leveltwo") >= 0) {
        if(this.position != 0 && this.len > 3) {
            var previousChosenLength = this.root.nodeList[this.position - 1].chosenLength;
            if(this.chosenLength === previousChosenLength + 20 || this.chosenLength === previousChosenLength + 30 || this.chosenLength === previousChosenLength + 40) {
                this.chosenLength = previousChosenLength;
            }
        }
    }

    if(this.root.root !== null) {
        this.slice = 360 / (this.len+1);
        this.startAngle =(((+this.root.position + 1) * +this.root.slice + 180) % 360) + 10;
    }

    //calculate new x and y
    var newX = (+this.x + Math.cos(((+this.position + 1) * toRadians(+this.slice)) + toRadians(this.startAngle)) * (this.chosenLength + this.r));
    var newY = (+this.y + Math.sin(((+this.position + 1) * toRadians(+this.slice)) + toRadians(this.startAngle)) * (this.chosenLength + this.r));
    this.x = newX;
    this.y = newY;

    this.label
        .attr("x", textPosition(+this.position, +this.slice, +this.startAngle, this.width, this.labelSpace)[0]) 
        .attr("y", textPosition(+this.position, +this.slice, +this.startAngle, this.width, this.labelSpace)[1])

    //create transition for svg
    var transition = this.svg.transition()
        .duration(5 * (this.chosenLength + this.r))
        .ease("linear")
        .delay(0)
        .attr("x", this.x)
        .attr("y", this.y)

        //assign mouse events for non root bubbles
        .each("end", function(d) {
            me.addMouseEvents();
        });             
}

//creating radial progress that shows gender distribution of faculties
function RadialProgress(tableData, root, parent, x, y, id, size, value, fullName, labelSpanish, labelSpace, margin, color, classes, position, slice, len) { 
    this.parent = parent;
    this.x = x;
    this.y = y;
    this.id = id;
    this.size = size;
    this.fullName = fullName;
    this.labelSpanish = labelSpanish;
    this.labelSpace = labelSpace;
    this.margin = margin;
    this.color = color;
    this.classes = classes;
    this.position = position;
    this.slice = slice;
    this.len = len;
    this.value = value;
    this.root = root;
    this.tableData = tableData;

    var me = this;
    
    var duration = 1000;   
    var minValue = 0,
        maxValue = 100;
    var currentArc = 0, currentValue = 0;
    var arc = d3.svg.arc()
        .startAngle(0 * (Math.PI/180)); //just radians


    this.calculateAttributes();  
    this.radialWidth = 2 * this.r;
    
    arc.outerRadius(this.radialWidth/2);
    arc.innerRadius(this.radialWidth/2 * .85);

    var rect;
    var wholePath;
    var path;
    var proportion;
    this.label;

    this.nodeList = [];
    this.connectionList = [];

    this.zoomTransition = function() {
        arc.outerRadius(this.radialWidth/2);
        arc.innerRadius(this.radialWidth/2 * .85);
        arc.endAngle(360 * (Math.PI/180))

        rect
            .transition().duration(700)
            .attr("width", this.radialWidth)
            .attr("height", this.radialWidth)
            .attr("x", this.labelSpace + this.margin)
            .attr("y", this.labelSpace + this.margin);

        wholePath
            .transition().duration(700)
            .attr("transform", "translate(" + (this.width/2) + "," + (this.width/2) + ")")
            .attr("d", arc);

        arc.endAngle(currentArc);

        path
            .transition().duration(700)
            .attr("transform", "translate(" + (this.width/2) + "," + (this.width/2) + ")")
            .attr("d", arc);

        this.label
            .transition().duration(700)
            .style("font-size", "27px")
            .attr('x', this.width/2)
            .attr('y', this.width/2);

        proportion
            .transition().duration(700)
            .attr("y", this.width/2 + 27)
            .attr("x", this.width/2)
            .style("font-size", "27px")
    }

    //draw radial progress
    this.draw = function() {

        this.svg.attr("x", this.x)
            .attr("y", this.y)
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("text", this.fullName)
      
        //asign click and hover events to root radial progress
        this.svg.on("click", function(d){ 
            me.handleClick();
        });
    
        this.svg.on("mousemove", function(){return tooltip.style("top", (d3.event.pageY) + 3 + "px").style("left",(d3.event.pageX) - 15 + "px");})
        this.svg.on("mouseover", function(){
            tooltip.attr("text", me.svg.attr("text"));
            return tooltip.style("visibility", "visible");
        })
        this.svg.on("mouseout", function(){return tooltip.style("visibility", "hidden"); })

        var background = this.svg.append("g").attr("class","component")
            .attr("cursor","pointer")

        arc.endAngle(360 * (Math.PI/180))

        //draw background 
        rect = background.append("rect")
            .attr("class","background")
            .attr("width", this.radialWidth)
            .attr("height", this.radialWidth)
            .attr("x", this.labelSpace + this.margin)
            .attr("y", this.labelSpace + this.margin)

        //draw whole circular path
        wholePath = background.append("path")
            .attr("transform", "translate(" + (this.width/2) + "," + (this.width/2) + ")")
            .attr("d", arc)

        //append labels
       this.label = background.append("text")
            .attr("class", "label")
            .text(this.labelSpanish)

        if (this.parent.classed("root") && !this.parent.classed("leveltwo")) { 
            this.label.style("font-size", "27px")
                .style('fill', this.color)
                .attr('x', this.width/2)
                .attr('y', this.width/2);
        }

        else {
            this.label.style("font-size", "14px")
                .style('fill', this.color)
                .attr("x", textPosition(+this.position, +this.slice, +this.startAngle, this.width, this.labelSpace)[0])
                .attr("y", textPosition(+this.position, +this.slice, +this.startAngle, this.width, this.labelSpace)[1]);   
        }
    
        arc.endAngle(currentArc);
        this.svg.append("g").attr("class", "arcs");

        //draw path for male proportion
        path = this.svg.select(".arcs").selectAll(".arc").data([1]);
        path.enter().append("path")
            .attr("class","arc")
            .attr("transform", "translate(" + (this.width/2) + "," + (this.width/2) + ")")
            .attr("d", arc);


        this.svg.append("g").attr("class", "labels");

        //add male proportion number in the middle of the bubble
        proportion = this.svg.select(".labels").selectAll(".label").data([1]);
        proportion.enter().append("text")
            .attr("class","label")
            .attr("y", this.width/2 + this.fontSize/3)
            .attr("x", this.width/2)
            .attr("cursor","pointer")
            .attr("width", this.radialWidth)
            .text(function(d) { return Math.round((this.value - minValue)/(maxValue - minValue)*100) + "%" })
            .style("font-size", this.fontSize+"px")
            .style('fill', this.color);

        if(this.parent.classed("root") && !this.parent.classed("leveltwo")) {
            this.fontSize = 30;
            proportion.attr("y", this.width/2 + this.fontSize)
                 .attr("x", this.width/2)
                 .style("font-size", this.fontSize+"px")
        }

        layout(this.svg);

        function layout(svg) {

            //animate path and proportion
            var ratio=(me.value - minValue)/(maxValue - minValue);
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

    this.addMouseEvents = function() {

        //assign hover events to non root bubbles
        this.svg.on("mouseover", function(){

            //make small bubbles bigger on hover
            if(me.r < 20) {
                
                var newX = me.width/2 + Math.cos((+me.position + 1) * toRadians(+me.slice) + toRadians(me.startAngle)) * (me.r);
                var newY = me.width/2 + Math.sin((+me.position + 1) * toRadians(+me.slice) + toRadians(me.startAngle)) * (me.r);
                var newWidth = me.width + 4 * me.r;
                var newHeight = newWidth;
                me.svg
                    .transition().duration(300).ease("linear").delay(0)
                    .attr("width", newWidth)
                    .attr("height", newHeight)
                    .attr("x", me.x - 2 * me.r)
                    .attr("y", me.y - 2 * me.r)
                    
                rect
                    .transition().duration(300).ease("linear").delay(0)
                    .attr("width", 2 * me.radialWidth)
                    .attr("height", 2 * me.radialWidth)
                    .attr("x", newX)
                    .attr("y", newY)

                arc
                    .outerRadius(me.radialWidth)
                    .innerRadius(me.radialWidth * .85);
                
                arc.endAngle(360 * (Math.PI/180))

                wholePath 
                    .transition().duration(300).ease("linear").delay(0)
                    .attr("transform", "translate(" + (newX + 2 * me.r) + "," + (newY + 2 * me.r) + ")")
                    .attr("d", arc)

                arc.endAngle(currentArc);

                path
                    .transition().duration(300).ease("linear").delay(0) 
                    .attr("transform", "translate(" + (newX + 2 * me.r) + "," + (newY + 2 * me.r) + ")")
                    .attr("d", arc)
                   
                proportion
                    .transition().duration(300).ease("linear").delay(0)
                    .attr("x", newX + 2 * me.r)
                    .attr("y", (newY + 2 * me.r) + (2 * me.fontSize/3))
                    .style("font-size", 2 * me.fontSize +"px");

                me.label
                    .transition().duration(300).ease("linear").delay(0)
                    .attr("x", newX + 2 * me.r) 
                    .attr("y", textPosition(+me.position, +me.slice, +me.startAngle, newWidth, me.labelSpace)[1])   
            }

            tooltip.attr("text", me.svg.attr("text"));
            return tooltip.style("visibility", "visible"); 
        });

        //on mouse out change small bubbles back to original size
        this.svg.on("mouseout", function(){
            if(me.r < 20) {
                me.svg
                    .transition().duration(300).ease("linear").delay(0)
                    .attr("width", me.width)
                    .attr("height", me.width)
                    .attr("x", me.x)
                    .attr("y", me.y)  
                rect
                    .transition().duration(300).ease("linear").delay(0)
                    .attr("x", me.labelSpace + me.margin)
                    .attr("y", me.labelSpace + me.margin)

                arc
                    .outerRadius(me.radialWidth/2)
                    .innerRadius(me.radialWidth/2 * .85);
                
                arc.endAngle(360 * (Math.PI/180))

                wholePath 
                    .transition().duration(300).ease("linear").delay(0)
                    .attr("transform", "translate(" + me.width/2 + "," + me.width/2 + ")")
                    .attr("d", arc)

                arc.endAngle(currentArc);

                path
                    .transition().duration(300).ease("linear").delay(0) 
                    .attr("transform", "translate(" + me.width/2 + "," + me.width/2 + ")")
                    .attr("d", arc)
                   
                proportion
                    .transition().duration(300).ease("linear").delay(0)
                    .attr("x", me.width/2)
                    .attr("y", me.width/2 + me.fontSize/3)
                    .style("font-size", me.fontSize +"px");

                me.label
                    .transition().duration(300).ease("linear").delay(0)
                    .attr("x", textPosition(+me.position, +me.slice, +me.startAngle, me.width, me.labelSpace)[0]) 
                    .attr("y", textPosition(+me.position, +me.slice, +me.startAngle, me.width, me.labelSpace)[1])   
            }
            return tooltip.style("visibility", "hidden");           
        }); 
        this.svg.on("mousemove", function(){return tooltip.style("top", (d3.event.pageY) + 3 + "px").style("left",(d3.event.pageX) - 15 + "px");})
 
    }
}

function Table(tableData, root, parent, x, y, id, size, value, fullName, labelSpanish, labelSpace, margin, color, classes, position, slice, len) { 
    this.tableData = tableData;
    this.parent = parent;
    this.x = x;
    this.y = y;
    this.id = id;
    this.size = size;
    this.fullName = fullName;
    this.labelSpanish = labelSpanish;
    this.labelSpace = labelSpace;
    this.margin = margin;
    this.color = color;
    this.classes = classes;
    this.position = position;
    this.slice = slice;
    this.len = len;
    this.value = value;
    this.root = root;
    var me = this;
    var background;
    var stretch = false;
    var oldEventX = 0;
    var oldEventY = 0;
   
    this.newWidth = 60 * Object.keys(tableData).length + 270;
    this.newHeight = 500 - (2 * (this.labelSpace - this.margin));
    this.fixed = false;
    this.mouseIn = false;
    this.dragging = false;
    this.transitionInprogress = false;
    this.oldWidth;
    this.oldX;
    this.oldY;
    this.big = false;

    this.nodeList = [];
    this.connectionList = [];

    this.calculateAttributes();
    this.radialWidth = 2 * this.r;

    this.label;

    function dropHandler(d) {
        me.dragging = false;
        background.attr("cursor","pointer");
    }

    function dragmove(d) {
        if(stretch) {
            if(oldEventX == 0) {
                oldEventX = d3.event.x - 1;
                oldEventY = d3.event.y - 1;
            }
            me.width = me.width + (d3.event.x - oldEventX);
            me.height = me.height + (d3.event.y - oldEventY);

            oldEventX = d3.event.x;
            oldEventY = d3.event.y;
            me.svg.selectAll(".tableBox").remove();
            d3.select(this).attr("width", me.width).attr("height", me.height);

            me.generateTable(me.width - 2 * (me.labelSpace + me.margin), me.height - 2 * (me.labelSpace + me.margin), me.big);
        }
        else {
            me.x = d3.event.x;
            me.y = d3.event.y;
            d3.select(this).attr("x", me.x).attr("y", me.y);   
        }
        var connection = me.root.connectionList[me.position]
        connection.followDrag(me.x + me.newWidth/2, me.y + me.newHeight/2);
    }

    function dragstart(d) {
        if(stretch) {
            oldEventX = 0;
            oldEventY = 0;
        }
        me.dragging = true;
        d3.event.sourceEvent.preventDefault();
    }

    function setOrigin() {
        var x = d3.select(this).attr("x");
        var y = d3.select(this).attr("y");
        return {"x": x, "y": y}
    }

    var drag = d3.behavior.drag() 
        .origin(setOrigin)
        .on("dragstart", dragstart)
        .on("drag", dragmove)
        .on("dragend", dropHandler);  

    //draw table
    this.draw = function() {
       
        this.svg.attr("x", this.x)
            .attr("y", this.y)
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("text", this.fullName)
      

        background = this.svg.append("g").attr("class","component")
            .attr("cursor","pointer")

        
        //append labels
        this.label = background.append("text")
            .attr("class", "label")
            .text(this.labelSpanish)
            .attr('pointer-events', 'none')

        if (this.parent.classed("root") && !this.parent.classed("leveltwo")) { 
            this.label.style("font-size", "27px")
                .style('fill', this.color)
                .attr('x', this.width/2)
                .attr('y', this.width/2);
        }

        else {
            this.label.style("font-size", "14px")
                .style('fill', this.color)
                .attr("x", textPosition(+this.position, +this.slice, +this.startAngle, this.width, this.labelSpace)[0])
                .attr("y", textPosition(+this.position, +this.slice, +this.startAngle, this.width, this.labelSpace)[1]);   
        }

        this.generateTable(this.width - 2 * (this.labelSpace + this.margin), this.height - 2 * (this.labelSpace + this.margin), this.big);
        if(this.big) {
            this.svg.call(drag); 
        }

        //asign click, drag and hover events to tables
        this.svg.on("mousemove", function(){return tooltip.style("top", (d3.event.pageY) + 3 + "px").style("left",(d3.event.pageX) - 15 + "px");})
        this.svg.on("mouseover", function(){
            tooltip.attr("text", me.svg.attr("text"));
            return tooltip.style("visibility", "visible");
        })
        this.svg.on("mouseout", function(){return tooltip.style("visibility", "hidden"); }) 

        this.svg.on("click", function(d){ 
            if (d3.event.defaultPrevented) return; // click suppressed
            if(!me.transitionInprogress) {
                if(me.fixed) {

                    for(var i in openedTabels) {
                        if(openedTabels[i].id == me.id) {
                            var index = i;
                            break;
                        }
                    }
                    openedTabels.splice(index, 1); 
                    me.fixed = false;
                    
                    me.svg.selectAll(".tableBox").remove();

                    me.svg
                        .transition().duration(500).ease("linear").delay(0)
                        .attr("width", me.oldWidth)
                        .attr("height", me.oldWidth)
                        .attr("x", me.oldX)
                        .attr("y", me.oldY) 
                        .each("end", function() {
                            me.transitionInprogress = false;
                            me.mouseIn = false;     
                        });

                    me.x = me.oldX;
                    me.y = me.oldY;
                    me.width = me.oldWidth;
                    me.height = me.oldWidth;
                    me.big = false; 

                    me.generateTable(me.oldWidth - 2 * (me.labelSpace + me.margin), me.oldWidth - 2 * (me.labelSpace + me.margin), false);

                    me.label
                        .transition().duration(300).ease("linear").delay(0)
                        .attr("x", textPosition(+me.position, +me.slice, +me.startAngle, me.oldWidth, me.labelSpace)[0]) 
                        .attr("y", textPosition(+me.position, +me.slice, +me.startAngle, me.oldWidth, me.labelSpace)[1]) 

                    var connection = me.root.connectionList[me.position]
                    connection.stopDrag();

                    
                }

                else {
                    me.fixed = true;
                    openedTabels.push(me);     
                }
            }
            

        });    
    }

    this.addMouseEvents = function() {

        //assign hover events to non root bubbles
        this.svg.on("mouseover", function(){
            
            if(!me.mouseIn && !me.transitionInprogress && !me.fixed) { 
                me.transitionInprogress = true;  
                me.mouseIn = true;
                me.svg.selectAll(".tableBox").remove();
                var halfX = me.newWidth/2;
                var halfY = me.newHeight/2;
                var tableMargin = me.labelSpace + me.margin;
                me.oldWidth = me.width;
                me.oldX = me.x;
                me.oldY = me.y;
                me.width = me.newWidth + 2 * tableMargin;
                me.height = me.newHeight + 2 * tableMargin;
                me.big = true;
                 
                me.svg
                    .transition().duration(500).ease("linear").delay(0)
                    .attr("width", me.newWidth + 2 * tableMargin)
                    .attr("height", me.newHeight + 2 * tableMargin)
                    .each("end", function() {
                        me.transitionInprogress = false;
                    });

                if(me.x + halfX + 2 * tableMargin > 1200) {
                    var newX =  1200 - me.newWidth - tableMargin;
                    me.svg.attr("x", newX)
                    me.x = newX;
                }
                else if (me.x - halfX + tableMargin < 0) {
                    var newX = 0 - tableMargin;
                    me.svg.attr("x", newX)
                    me.x = newX;
                }
                else {
                    me.svg.attr("x", me.x - halfX)
                    me.x = me.x - halfX;
                }
                if (me.y - halfY + tableMargin < 0) {
                    var newY = 0 - tableMargin;
                    me.svg.attr("y", newY)
                    me.y - newY;
                }
                else {
                    me.svg.attr("y", me.y - halfY)
                    me.y = me.y -halfY;
                }

                me.generateTable(me.newWidth, me.newHeight, true);
                me.parent.moveToFront();
                me.svg.call(drag);    
            }

            tooltip.attr("text", me.svg.attr("text"));
            return tooltip.style("visibility", "visible"); 
        });

        //on mouse out change small bubbles back to original size
        this.svg.on("mouseleave", function(){
            if(me.fixed || me.dragging || me.transitionInprogress) return;
            me.mouseIn = false;
            me.svg.selectAll(".tableBox").remove();
        
            me.svg
                .transition().duration(300).ease("linear").delay(0)
                .attr("width", me.oldWidth)
                .attr("height", me.oldWidth)
                .attr("x", me.oldX)
                .attr("y", me.oldY)  
          
            me.generateTable(me.oldWidth - 2 * (me.labelSpace + me.margin), me.oldWidth - 2 * (me.labelSpace + me.margin), false);

            me.label
                .transition().duration(300).ease("linear").delay(0)
                .attr("x", textPosition(+me.position, +me.slice, +me.startAngle, me.oldWidth, me.labelSpace)[0]) 
                .attr("y", textPosition(+me.position, +me.slice, +me.startAngle, me.oldWidth, me.labelSpace)[1])

            me.x = me.oldX;
            me.y = me.oldY;
            me.width = me.oldWidth;
            me.height = me.oldWidth;
            me.big = false; 

            var connection = me.root.connectionList[me.position]
            connection.stopDrag();  
            
            return tooltip.style("visibility", "hidden");           
        }); 
        this.svg.on("mousemove", function(){
            var edgeX = me.width - me.labelSpace - me.margin;
            var edgeY = me.height - me.labelSpace - me.margin;
            var coordinates = [0, 0];
            coordinates = d3.mouse(me.svg.node());
            var mouseX = coordinates[0];
            var mouseY = coordinates[1];
            if(mouseX > edgeX - 40 && mouseX < edgeX && mouseY > edgeY - 40 && mouseY < edgeY) {
                stretch = true;
                background.attr("cursor","se-resize");
            }
            else {
                
                if(!me.dragging) {
                    background.attr("cursor","pointer");
                    stretch = false;
                }
            }
            return tooltip.style("top", (d3.event.pageY) + 3 + "px").style("left",(d3.event.pageX) - 15 + "px");
        })
  
    }

    this.generateTable = function(tableWidth, tableHeight, big) {
        var numberOfBoxes = Object.keys(tableData).length;
        var leftColumnWidth = (tableWidth/(numberOfBoxes + 1)) * 2.4;
        var boxWidth = (tableWidth - leftColumnWidth)/numberOfBoxes;
        var boxHeight = tableHeight/10;
        var leftTableMargin = this.labelSpace + this.margin + leftColumnWidth;
        var tableMargin = this.labelSpace + this.margin;
        var sortedYears = arrangeYears();
        var dataCount = 0;
        for(var i = 0; i < 10; i++) {
            if(i!=0 && i!=4 && i!=7) {
                var counter = 0;
                for(var y in sortedYears) {    
                    if(i == 9 && counter == Object.keys(tableData).length - 1) {
                        var box = background.append("path")
                            .classed("tableBox", true)
                            .attr("fill", "white")
                            .attr("d", function(d) {
                                return lowerRightRoundedRect(leftTableMargin + counter * boxWidth, tableMargin + i * boxHeight, boxWidth, boxHeight, tableWidth/25);
                            })
                            .style("stroke", this.color)
                            .style("stroke-width", 1);
                    }
                    else {
                        var box = background.append("rect")
                            .classed("tableBox", true)
                            .attr("width", boxWidth)
                            .attr("height", boxHeight)
                            .attr("x", leftTableMargin + counter * boxWidth)
                            .attr("y", tableMargin + i * boxHeight)
                            .attr("fill", "white")
                            .style("stroke", this.color)
                            .style("stroke-width", 1);
                    }

                    var boxText = background.append("text")
                        .attr("class", "tableBox")
                        .style('fill', this.color)
                        .style('font-size', boxWidth/5)
                        .style("text-anchor", "middle")
                        .attr('x', leftTableMargin + counter * boxWidth + boxWidth/2)
                        .attr('y', tableMargin + (i+1) * boxHeight - boxHeight/3)
                    
                    if(i == 1 || i == 5 || i == 8) { 
                        boxText.text(sortedYears[y])
                    }
                    
                    else { 
                        boxText.text(this.tableData[sortedYears[y]][dataCount])
                        if(y == sortedYears.length -1 ) {
                            dataCount++;
                        }
                    }
                    counter++;
                }
                if(i!=9) {
                    var box = background.append("rect")
                        .classed("tableBox", true)
                        .attr("width", leftColumnWidth)
                        .attr("height", boxHeight)
                        .attr("x", tableMargin)
                        .attr("y", tableMargin + i * boxHeight)
                        .attr("fill", "white")
                        .style("stroke", this.color)
                        .style("stroke-width", 1);
                }
                else {
                     var box = background.append("path")
                        .classed("tableBox", true)
                        .attr("fill", "white")
                        .attr("d", function(d) {
                            return lowerLeftRoundedRect(tableMargin, tableMargin + i * boxHeight, leftColumnWidth, boxHeight, tableWidth/25);
                        })
                        .style("stroke", this.color)
                        .style("stroke-width", 1);
                }

                if (i == 2 || i == 3 || i == 6 || i == 9) {
                    var boxText = background.append("text")
                        .attr("class", "tableBox")
                        .style('fill', this.color)
                        .style('font-size', boxWidth/5)
                        .style("text-anchor", "middle")
                        .attr('x', this.margin + this.labelSpace + leftColumnWidth/2)
                        .attr('y', tableMargin + (i+1) * boxHeight - boxHeight/3)
                    if(i == 2) boxText.text("Estudiantes de nuevo ingreso")
                    else if(i == 3) boxText.text("Tasa de graduación")
                    else if(i == 6) boxText.text("Tasa de eficiencia")
                    else boxText.text("Tasa de rendimiento")
                } 

            }
            else {
               
                if (i==0) {
                    var title = background.append("path")
                        .classed("tableBox", true)
                        .attr("fill", "white")
                        .attr("d", function(d) {
                            return upperRoundedRect(tableMargin, tableMargin, tableWidth, boxHeight, tableWidth/25);
                        })
                        .style("stroke", this.color)
                        .style("stroke-width", 1);
                }

                else {
                    var title = background.append("rect")
                        .classed("tableBox", true)
                        .attr("width", tableWidth)
                        .attr("height", boxHeight)
                        .attr("x", tableMargin)
                        .attr("y", tableMargin + i * boxHeight)
                        .attr("fill", "white")
                        .style("stroke", this.color)
                        .style("stroke-width", 1);
                }

                var boxText = background.append("text")
                    .attr("class", "tableBox")
                    .style('fill', this.color)
                    .style('font-size', boxWidth/5)
                    .style("text-anchor", "middle")
                    .attr('x', tableMargin + tableWidth/2)
                    .attr('y', tableMargin + (i+1) * boxHeight - boxHeight/3)
                if(i == 0) boxText.text("Año de inicio")
                else if(i == 4) boxText.text("Año de egreso")
                else (boxText.text("Año académico"))

               
            }
        } 

        if(big) {
            var boxText = background.append("text")
                .attr("class", "tableBox")
                .style('fill', this.color)
                .style('font-size', boxWidth/5)
                .style("text-anchor", "middle")
                .attr('x', tableMargin + tableWidth/2)
                .attr('y', tableHeight + tableMargin + boxWidth/4)
                .text("*El guión “-” indica que no procede el cálculo del indicador para ese año.");

            this.label
                .transition().duration(300).ease("linear").delay(0)
                .attr("x", textPosition(+me.position, +me.slice, +me.startAngle, me.newWidth + 2* (this.labelSpace + this.margin), me.labelSpace)[0]) 
                .attr("y", me.labelSpace - 10) 
        }

        function upperRoundedRect(x, y, width, height, radius) {
            return "M" + (x + radius) + "," + y
                + "h" + (width - 2 * radius)
                + "a" + radius + "," + radius + " 0 0 1 " + radius + "," + radius
                + "v" + (height - radius)
                + "h" + -width
                + "v" + (-height + radius)
                + "a" + radius + "," + radius + " 0 0 1 " + radius + "," + -radius;       
        }

        function lowerLeftRoundedRect(x, y, width, height, radius) {
            return "M" + x + "," + y
                + "h" + width
                + "v" + height
                + "h" + (-width + radius)
                + "a" + radius + "," + radius + " 0 0 1 " + -radius + "," + -radius
                + "z";       
        }

        function lowerRightRoundedRect(x, y, width, height, radius) {
            return "M" + x + "," + y
                + "h" + width
                + "v" + (height - radius)
                + "a" + radius + "," + radius + " 0 0 1 " + -radius + "," + radius
                + "h" + (-width + radius)
                + "z";       
        }

        function arrangeYears() {
            var l = []
            for(var year in tableData) {
                l.push(year)
            }
            return l.sort()
        }
    }
}

Table.prototype = new SizeCircle();
RadialProgress.prototype = new SizeCircle();

d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};

createMainPage();






