var vis = d3.select("#graph")
    .classed("svg-container", true)
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 1200 1200")
    //class to make it responsive
    .classed("svg-content-responsive", true);

var rList = []

var gender = false;

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
        var data = mergeData(data1, data2)
        
        //execute this after data has loaded
        var bubble = vis.selectAll("circle").data([data[0]]).enter()
       
        //create root bubble
        var r = Math.sqrt(data[0].size);
        var margin = 10;
        var labelSpace = 0;
        var x = 600 - r - margin;
        var y = 400 - r - margin;
        var svg = bubble.append("svg") 
            .attr("x", x)
            .attr("y", y)
            .attr("width", 2 * r + 2 * margin)
            .attr("height", 2 * r + 2 * margin)
            .attr("id", function(d) {return d.id})
            .attr("text", function(d) {return d.fullNameSpanish})
            .classed("root", true);

         //asign click and hover events    
        svg
            .on("mouseover", function(){
                tooltip.attr("text", svg.attr("text"));
                return tooltip.style("visibility", "visible");
            })
            .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY) + 3 + "px").style("left",(d3.event.pageX) - 15 + "px");})
            .on("mouseout", function(){return tooltip.style("visibility", "hidden");})
            .on("click", function(d){ onRootClick(data, svg, d.id);});

        if(!gender) {   

            sizeCircle(svg)
                .r(r)
                .labelSpanish(function(d){ return d.labelSpanish})
                .size(function(d) {return d.size})
                .x(x)
                .y(y)
                .color(function(d){return d.color})
                .labelSpace(labelSpace)
                .margin(margin)
                .render();

        } else {
            
            radialProgress(svg)
                .label(data[0].labelSpanish)
                .diameter(2 * r + 2 * margin)
                .value(+data[0].maleproportion)
                .x(x)
                .y(y)
                .id(data[0].id)
                .labelSpace(labelSpace)
                .margin(margin)
                .onClick(function() {onRootClick(data, svg, data[0].id)})
                .render();
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
            var bubbles = vis.selectAll("circle.node").data(data).enter();

            var svg = bubbles.append("svg").each(function(d,i) {
            
                var r = Math.sqrt(d.size) * 1.3;
                var rootX = +d3.select("[id='" + rootId + "']").attr("x");
                var rootY = +d3.select("[id='" + rootId + "']").attr("y");
                var id = d.id;
                var text = d.fullNameSpanish;
                var maleproportion = d.maleproportion;
                var labelSpanish = d.labelSpanish;
                console.log(labelSpanish);
                var size = d.size;
                var length = data.length;
                var width = 2 * r + 2 * margin + 2 * labelSpace;
                var height = width;
                var color = d.color;

                d3.select(this).attr("x", rootX)
                    .attr("y", rootY)
                    .attr("width", width)
                    .attr("height", height)
                    .attr("id", id)
                    .attr("text", text)
                    .classed("node", true);
                
                if(!gender) {
                    sizeCircle(d3.select(this))
                        .r(r)
                        .labelSpanish(labelSpanish)
                        .size(size)
                        .x(rootX)
                        .y(rootY)
                        .id(id)
                        .len(length)
                        .color(color)
                        .i(i)
                        .labelSpace(labelSpace)
                        .margin(margin)
                        .width(width)
                        .render();

                
                    //asign click and hover events to the bubbles

                    /*    var svg = d3.select(this);      
                        var width = svg.attr("width");
                        var fullName = svg.attr("text");
                        var r = svg.select("circle").attr("r");
                        var cx = svg.select("circle").attr("cx");
                        var cy = svg.select("circle").attr("cy");
                        var x = svg.attr("x");
                        var y = svg.attr("y");
                        svg
                            .on("click", function(){console.log("do something");})
                            /*.on("mouseover", function(){
                                if(width < 90) {
                                    var newX = +x + Math.cos((i+1) * toRadians(slice)) * (r - 20);
                                    var newY = +y + Math.sin((i+1) * toRadians(slice)) * (r - 20);
                                    d3.select(this)
                                        .transition()
                                        .duration(300)
                                        .ease("linear")
                                        .delay(0)
                                        .attr("width", 90)
                                        .attr("height", 90)
                                        .attr("x", newX)
                                        .attr("y", newY)
                                        
                                    d3.select(this).select("circle")
                                        .transition()
                                        .duration(300)
                                        .ease("linear")
                                        .delay(0)
                                        .attr("r", 20)
                                        .attr("cx", 45)
                                        .attr("cy", 45);
                                    d3.select(this).select(".size")
                                        .transition()
                                        .duration(300)
                                        .ease("linear")
                                        .delay(0)
                                        .attr("x", 45)
                                        .attr("y", 45)
                                        .style("font-size", "20px");
                                    
                                }
                                tooltip.attr("text", fullName);
                                return tooltip.style("visibility", "visible");
                            })
                            .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY) + 3 + "px").style("left",(d3.event.pageX) - 15 + "px");})
                            .on("mouseout", function(){
                                if(width < 70) {
                                    d3.select(this)
                                        .transition()
                                        .duration(300)
                                        .ease("linear")
                                        .delay(0)
                                        .attr("transform","scale(1)");
                                }
                                return tooltip.style("visibility", "hidden");
                            });*/
                } else {
                    radialProgress(d3.select(this))
                        .label(labelSpanish)
                        .diameter(2 * r + 2 * margin + 2 * labelSpace)
                        .value(maleproportion)
                        .x(rootX)
                        .y(rootY)
                        .id(id)
                        .len(length)
                        .i(i)
                        .render();
                }
            });

            //create lines that connect the bubbles with the root bubble
            var lines = vis.selectAll("line").data(links).enter().append("line").each(function(d, i){

                var rootR = +(d3.select("[id='" + d.source + "']").attr("width") - 2 * rootMargin) / 2;
                var rootX = +d3.select("[id='" + rootId + "']").attr("x") + rootR + rootMargin;
                var rootY = +d3.select("[id='" + rootId + "']").attr("y") + rootR + rootMargin;
                d3.select(this)
                    .classed("node", true)
                    .attr("x1", function(d) {return rootX + Math.cos((i+1) * toRadians(slice)) * rootR})
                    .attr("y1", function(d) {return rootY + Math.sin((i+1) * toRadians(slice)) * rootR})
                    .attr("x2", function(d) {return rootX + Math.cos((i+1) * toRadians(slice)) * rootR})
                    .attr("y2", function(d) {return rootY + Math.sin((i+1) * toRadians(slice)) * rootR})
                    .style("stroke", "#006600")
                    .style("stroke-width", "3px");
            });
            
            //create transitions for the bubbles and lines (move them from the center to their final position)
            d3.transition()
                .duration(1500)
                .ease("elastic")
                .delay(0)
                .each(function() {
                    var rootR = +(d3.select("[id='" + rootId + "']").attr("width") - 2 * rootMargin) / 2;
                    var rootX = +d3.select("[id='" + rootId + "']").attr("x") + rootR + rootMargin;
                    var rootY = +d3.select("[id='" + rootId + "']").attr("y") + rootR + rootMargin;
                    var lengths = [220, 240, 260, 200, 180]; 
                    var selectLength = function(){return lengths[Math.floor(Math.random() * lengths.length)];};
                    var newX = {};
                    var newY = {};
                    d3.selectAll("svg.node").each(function(d, i){
                        var r = (d3.select(this).attr("width") - 2 * labelSpace) / 2;
                        d3.select(this).transition()

                        //calculate new positions for the bubbles
                        .attr("x",function(d) {
                            var x = rootX + Math.cos((i+1) * toRadians(slice)) * selectLength();
                            x > rootX ? x = x - r : x = x - 2 * r;
                            newX[d.id] = x;
                            return x })
                        .attr("y", function(d) {
                            var y = rootY + Math.sin((i+1) * toRadians(slice)) * selectLength();
                            y > rootY ? y = y - r : y = y - 2 * r;
                            newY[d.id] = y;
                            return y });
                    });
                    d3.selectAll("line").each(function(d, i){
                        console.log(d.target);
                        var r = (d3.select("[id='" + d.target + "']").attr("width")) / 2;
                        d3.select(this).transition()

                        //calculate end points for the lines
                        .attr("x2", function(d) {
                            var targetCenter = newX[d.target] + r;
                            var targetRadius = Math.cos((i + 1) * toRadians(slice)) * (r - labelSpace - margin);
                            return targetCenter - targetRadius;
                        })
                        .attr("y2", function(d) {
                            var targetCenter = newY[d.target] + r;
                            var targetRadius = Math.sin((i + 1) * toRadians(slice)) * (r - labelSpace - margin);
                            return targetCenter - targetRadius;
                        });
                    });
                })

                //at the end of the transition append text to the bubbles
                .each("end", function(){
                    var groups = d3.selectAll("g.node").each( function(d, i){

                        

                            
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
var textPosition = function(i, length, width, margin) {
    if(i < length/2) {
        return [width/2 + margin, width];
    }
    else if(i >= length/2) {
        return [width/2 + margin, 14];
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
        vis.selectAll("svg.node").remove();
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
                    svg.classed("open", false);
                });
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

//create circles which size depends on the size of the faculties
function sizeCircle(parent) {
    var _r = 0,
        _margin = 10,
        _x = 600 - _r - _margin,
        _y = 400 - _r - _margin,
        _labelSpace = 0,
        _id = "",
        _labelSpanish = "",
        _size = 0,
        _length = 0,
        _width = 2 * _r + 2 * _margin + 2 * _labelSpace,
        _height = _width,
        _color = "#ffffff";

    var _selection = d3.select(parent);

    function draw() {
        _selection.each(function (data) {
            var circle = this.append("circle")
                .attr("cx", _r + _margin + _labelSpace)
                .attr("cy", _r + _margin + _labelSpace)
                .attr("r", _r)
                .attr("fill", _color)

            if (!this.classed("root")) {  
                circle.classed("node", true);
            }
            else {
                circle.classed("root", true);
            }

            //append text for size
            var text = this.append('text')
                .classed("size", true)
                .style('fill', 'white')
                .style("text-anchor", "middle")
                .text(_size);

            if (!this.classed("root")) { 
                text.style("font-size", _r/1.1+"px")
                    .classed("node", true)
                    .attr('x', _r + _margin + _labelSpace)
                    .attr('y', (_r + _margin + _labelSpace) * 1.13);
            } else {
                text.style("font-size", "30px")
                    .attr('x', _r + _margin + _labelSpace)
                    .attr('y', (_r + _margin + _labelSpace + 30));
            }
            //append labels
            var label = this.append("text")
                .classed("node", true)
                .classed("label", true)
                .text(_labelSpanish)
                .style("text-anchor", "middle")

            if (!this.classed("root")) { 
                label.style("font-size", "14px")
                    .style('fill', '#006600')
                    .attr("x", textPosition(_i, _length, _width, _margin)[0])
                    .attr("y", textPosition(_i, _length, _width, _margin)[1]);
            }

            else {
                label.style("font-size", "30px")
                    .style('fill', 'white')
                    .attr('x', _r + _margin + _labelSpace)
                    .attr('y', (_r + _margin + _labelSpace));
            }
        });

    }

    draw.render = function() {
        draw();
        return draw;
    }

    draw.margin = function(_) {
        if (!arguments.length) return _margin;
        _margin = _;
        return draw;
    };

    draw.labelSpanish = function(_) {
        if (!arguments.length) return _labelSpanish;
        _labelSpanish = _;
        return draw;
    };

    draw.x = function(_) {
        if (!arguments.length) return _x
        _x =  _;
        return draw;
    };

    draw.y = function(_) {
        if (!arguments.length) return _y
        _y =  _;
        return draw;
    };

    draw.id = function(_) {
        if (!arguments.length) return _id
        _id =  _;
        return draw;
    };

    draw.labelSpace = function(_) {
        if (!arguments.length) return _labelSpace
        _labelSpace =  _;
        return draw;
    };

    draw.size = function(_) {
        if (!arguments.length) return _size
        _size =  _;
        return draw;
    };

    draw.len = function(_) {
        if (!arguments.length) return _length
        _length =  _;
        return draw;
    };

    draw.color = function(_) {
        if (!arguments.length) return _color
        _color =  _;
        return draw;
    };

    draw.i = function(_) {
        if (!arguments.length) return _i
        _i =  _;
        return draw;
    };

    draw.r = function(_) {
        if (!arguments.length) return _r
        _r =  _;
        return draw;
    };

    draw.width = function(_) {
        if (!arguments.length) return _width
        _width =  _;
        return draw;
    };

    return draw;
}

//creating radial progress that shows gender distribution of faculties
function radialProgress(parent) {
    var _data = null,
        _duration = 1000,
        _margin = 3,
        _diameter = 150,
        _label ="",
        _fontSize = 10,
        _x = 0,
        _y = 0,
        _labelSpace = 20,
        _id = "",
        _len = 0,
        _i = 0;


    var _mouseClick;

    var _value= 0,
        _minValue = 0,
        _maxValue = 100;

    var  _currentArc= 0, _currentValue=0;

    var _arc = d3.svg.arc()
        .startAngle(0 * (Math.PI/180)); //just radians


    var _selection=d3.select(parent);


    function component() {
        _selection.each(function (data) {
            measure();
            this.attr("x", _x).attr("y", _y).attr("id", _id);
            var background = this.append("g").attr("class","component")
                .attr("cursor","pointer")
                .on("click",onMouseClick);


            _arc.endAngle(360 * (Math.PI/180))

            background.append("rect")
                .attr("class","background")
                .attr("width", _width)
                .attr("height", _height)
                .attr("x", _labelSpace  + _margin)
                .attr("y", _labelSpace  + _margin)

            background.append("path")
                .attr("transform", "translate(" + (_width/2 + _labelSpace + _margin) + "," + (_width/2 + _labelSpace + _margin) + ")")
                .attr("d", _arc)
                .attr("x", _labelSpace + _margin)
                .attr("y", _labelSpace + _margin)

            var label = background.append("text")
                .attr("class", "label")
                .text(_label)

            if (!this.classed("root")) { 
                 console.log(_width);
                label.style("font-size", "14px")
                    .style('fill', '#006600')
                    .attr("x", textPosition(_i, _len, _width + 2 * _labelSpace, _margin)[0])
                    .attr("y", textPosition(_i, _len, _width + 2 * _labelSpace, _margin)[1]);
            }

            else {
                label.style("font-size", "30px")
                    .style('fill', 'white')
                    .attr('x', _width/2 + _margin + _labelSpace)
                    .attr('y', ( _width/2 + _margin + _labelSpace));
            }
            
            var g = this.attr("transform", "translate(" + _margin + "," + _margin + ")");

            _arc.endAngle(_currentArc);
            this.append("g").attr("class", "arcs");
            var path = this.select(".arcs").selectAll(".arc").data(data);
            path.enter().append("path")
                .attr("class","arc")
                .attr("transform", "translate(" + (_width/2 + _labelSpace  + _margin) + "," + (_width/2 + _labelSpace  + _margin) + ")")
                .attr("d", _arc);


            this.append("g").attr("class", "labels");
            var label = this.select(".labels").selectAll(".label").data(data);
            label.enter().append("text")
                .attr("class","label")
                .attr("y",_width/2 + _labelSpace  + _margin +_fontSize/3)
                .attr("x",_width/2 + _labelSpace  + _margin)
                .attr("cursor","pointer")
                .attr("width",_width)
                .text(function (d) { return Math.round((_value-_minValue)/(_maxValue-_minValue)*100) + "%" })
                .style("font-size",_fontSize+"px")
                .on("click",onMouseClick);

            path.exit().transition().duration(500).attr("x",1000).remove();

            layout(this);

            function layout(svg) {

                var ratio=(_value-_minValue)/(_maxValue-_minValue);
                var endAngle=Math.min(360*ratio,360);
                endAngle=endAngle * Math.PI/180;

                path.datum(endAngle);
                path.transition().duration(_duration)
                    .attrTween("d", arcTween);

                label.datum(Math.round(ratio*100));
                label.transition().duration(_duration)
                    .tween("text",labelTween);

            }

        });

        function onMouseClick(d) {
            if (typeof _mouseClick == "function") {
                _mouseClick.call();
            }
        }
    }

    function labelTween(a) {
        var i = d3.interpolate(_currentValue, a);
        _currentValue = i(0);

        return function(t) {
            _currentValue = i(t);
            this.textContent = Math.round(i(t)) + "%";
        }
    }

    function arcTween(a) {
        var i = d3.interpolate(_currentArc, a);

        return function(t) {
            _currentArc=i(t);
            return _arc.endAngle(i(t))();
        };
    }

    function measure() {
        _width= _diameter - 2 * _margin - 2 * _labelSpace;
        _height=_width;
        _fontSize=_width*.3;
        _arc.outerRadius(_width/2);
        _arc.innerRadius(_width/2 * .85);
    }

    component.render = function() {
        measure();
        component();
        return component;
    }

    component.value = function (_) {
        if (!arguments.length) return _value;
        _value = [_];
        _selection.datum([_value]);
        return component;
    }


    component.margin = function(_) {
        if (!arguments.length) return _margin;
        _margin = _;
        return component;
    };

    component.diameter = function(_) {
        if (!arguments.length) return _diameter
        _diameter =  _;
        return component;
    };

    component.label = function(_) {
        if (!arguments.length) return _label;
        _label = _;
        return component;
    };

    component.x = function(_) {
        if (!arguments.length) return _x
        _x =  _;
        return component;
    };

    component.y = function(_) {
        if (!arguments.length) return _y
        _y =  _;
        return component;
    };

    component.id = function(_) {
        if (!arguments.length) return _id
        _id =  _;
        return component;
    };

    component.labelSpace = function(_) {
        if (!arguments.length) return _labelSpace
        _labelSpace =  _;
        return component;
    };

    component.len = function(_) {
        if (!arguments.length) return _len
        _len =  _;
        return component;
    };

    component.i = function(_) {
        if (!arguments.length) return _i
        _i =  _;
        return component;
    };

    component.onClick = function (_) {
        if (!arguments.length) return _mouseClick;
        _mouseClick=_;
        return component;
    }

    return component;

}






