(function(){
    //pseudo-global variables
    var attrArray = ["ID","P_Art","P_Business","P_HE","P_Science","P_related", "P_total","NAME"]; //list of attributes
    var expressed = attrArray[0]; //initial attribute
//chart frame dimensions
var chartWidth = window.innerWidth * 0.425,
    chartHeight = 473,
    leftPadding = 25,
    rightPadding = 2,
    topBottomPadding = 5,
    chartInnerWidth = chartWidth - leftPadding - rightPadding,
    chartInnerHeight = chartHeight - topBottomPadding * 2,
    translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

//create a scale to size bars proportionally to frame and for axis
var yScale = d3.scaleLinear()
    .range([463, 0])
    .domain([0, 110]);

window.onload = setMap();
//set up choropleth map


function setMap() {
    //use Promise.all to parallelize asynchronous data loading
    //map frame dimensions
    var width = 1000, //map frame width
        height = 460; //map frame height

    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    //create Albers equal area conic projection centered on France
    var projection = d3.geoAlbers()
        .scale(500)
        .translate([width / 2, height / 2]);

    //create path generator
    var path = d3.geoPath().projection(projection);

    //use Promise.all to parallelize asynchronous data loading
    var promises = [];
    promises.push(d3.csv("data/States1.csv")); //load attributes from csv
    promises.push(d3.json("data/Provinces.topojson")); //load background spatial data
    promises.push(d3.json("data/States.topojson")); //load choropleth spatial data
    Promise.all(promises).then(callback);

    function callback(data){
        var csvStates = data[0],
            Provinces = data[1],
            States = data[2];

            console.log('check this one')
            console.log(Provinces);  //check data loaded in
            console.log(States);    //check data loaded in
            console.log(csvStates);

    //place graticule on the map
    setGraticule(map, path);

   //translate europe TopoJSON
   var provinceLines = topojson.feature(Provinces, Provinces.objects.Provinces)
   var stateLines = topojson.feature(States, States.objects.States);
   console.log(Provinces)
   console.log(States)
   console.log(provinceLines)
   console.log(stateLines)


 //join csv data to GeoJSON enumeration units
 stateLines = joinData(stateLines, csvStates);
//create the color scale
var colorScale = makeColorScale(csvStates);


//add coordinated visualization to the map
setChart(csvStates, colorScale);
createDropdown(provinceLines, stateLines, map, path,csvStates);
 //add enumeration units to the map
 setEnumerationUnits(provinceLines, stateLines, map, path, colorScale);
 changeAttribute(provinceLines, stateLines, map, path, selectedValue, csvStates);
 // Call createDropdown(csvStates); within your setMap function’s callback, right after you set up the chart and enumeration units.
   set_class_buttons(csvStates, colorScale);
};
// Setup event listeners for the class buttons
set_class_buttons(csvStates, colorScale);

        let lyrStates = map.selectAll('.states')
            .data(stateLines)
            .enter()
            .append('path')
            .attr('class', function (d) {
                return 'states ' + d.properties.name;
            })
            .attr('d', path)
            .style('fill', function (d) {
                return colorScale(d.properties[expressed])
            })
            .on('mouseover', function (d) {
                highlight(d.properties);
            })
            .on('mouseout', function (d) {
                dehighlight(d.properties);
            })
            .on('mousemove', function () {
                moveLabel();
            });

        var desc = lyrStates.append("desc")
            .text('{"stroke": "black", "stroke-width": "0.75px"}');



}; //end of setMap()
//function to create coordinated bar chart
function setChart(csvStates, colorScale){
    // Remove any existing chart
    d3.select(".chart").remove();

    var expressed="P_Art";
    //chart frame dimensions
    var chartWidth = window.innerWidth * 0.4,
        chartHeight = 460;
        leftPadding = 25,
        rightPadding = 2,
        topBottomPadding = 5,
        chartInnerWidth = chartWidth - leftPadding - rightPadding,
        chartInnerHeight = chartHeight - topBottomPadding * 2,
        translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

    //create a second svg element to hold the bar chart
    var chart = d3.select("body")
        .append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("class", "chart");

    //create a rectangle for chart background fill
    var chartBackground = chart.append("rect")
        .attr("class", "chartBackground")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);

    //create a scale to size bars proportionally to frame
    var yScale = d3.scaleLinear()
        .range([463,0])
        .domain([0, 105]);

        //set bars for each province
    var bars = chart.selectAll(".bar")
    .data(csvStates)
    .enter()
    .append("rect")
    .sort(function(a, b){
        return b[expressed]-a[expressed]
    })
    .attr("class", function(d){
        return "bar " + d.NAME;
    })
    .attr("width", chartInnerWidth / csvStates.length - 1)
    .attr("x", function(d, i){
        return i * (chartInnerWidth / csvStates.length) + leftPadding;
    })
    //resize bars
    .attr("height", function(d, i){
        return 463 - yScale(parseFloat(d[expressed]));
    })
    .attr("y", function(d){
        console.log('expressed variable:', expressed);
        console.log('expressed:', d[expressed], 'parsed:', parseFloat(d[expressed]));
        console.log('data object:', d);

         var height = yScale(parseFloat(d[expressed]));
         console.log('height:', height);
        return height;
    })
    .attr("height", function(d){
        return chartHeight - yScale(parseFloat(d[expressed]));
    })
        .style("fill", function(d){
            var value = d[expressed];            
            if(value) {                
                return colorScale(value);            
            } else {                
                return "#ccc";            
            }    
            
        });

        var chartTitle = chart.append("text")
        .attr("x", 20)
        .attr("y", 40)
        .attr("class", "chartTitle")
        .text("Percentage of people age 25 and older with a bachelor degree in" + expressed[1] + " in each state")
        // .text("Percentage of adults age 25 and older with a Bachelor in Art in each state");
        //create vertical axis generator
    var yAxis = d3.axisLeft()
    .scale(yScale);

//place axis
var axis = chart.append("g")
    .attr("class", "axis")
    .attr("transform", translate)
    .call(yAxis);

//create frame for chart border
var chartFrame = chart.append("rect")
    .attr("class", "chartFrame")
    .attr("width", chartInnerWidth)
    .attr("height", chartInnerHeight)
    .attr("transform", translate);
 };
// Function to highlight states and bars
function highlight(props) {
    // Change stroke
    var selected = d3.selectAll('.' + props.NAME)
        .style('stroke', '#c8c8c8')
        .style('stroke-width', '2');

    setLabel(props);
}

//function to reset the element style on mouseout
function dehighlight(props) {
    var selected = d3.selectAll("." + props.NAME)
        .style("stroke", "black")
        .style("stroke-width", "0.5px");

    d3.select(".infolabel")
        .remove();
};   
function setGraticule(map, path){
    //create graticule generator
var graticule = d3.geoGraticule()
.step([5, 5]); //place graticule lines every 5 degrees of longitude and latitude
//create graticule background
var gratBackground = map.append("path")
.datum(graticule.outline()) //bind graticule background
.attr("class", "gratBackground") //assign class for styling
.attr("d", path) //project graticule
//create graticule lines
var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
.data(graticule.lines()) //bind graticule lines to each element to be created
.enter() //create an element for each datum
.append("path") //append each element to the svg as a path element
.attr("class", "gratLines") //assign class for styling
.attr("d", path); //project graticule lines

};

//function to create color scale generator
function makeColorScale(data){
    var colorClasses = [
        "#D4B9DA",
        "#C994C7",
        "#DF65B0",
        "#DD1C77",
        "#980043"
    ];

    //create color scale generator
    var colorScale = d3.scaleQuantile()
        .range(colorClasses);

   //build array of all values of the expressed attribute
   var domainArray = [];
   for (var i=0; i<data.length; i++){
       var val = parseFloat(data[i][expressed]);
       domainArray.push(val);
   };

   //cluster data using ckmeans clustering algorithm to create natural breaks
   var clusters = ss.ckmeans(domainArray, 5);
   //reset domain array to cluster minimums
   domainArray = clusters.map(function(d){
       return d3.min(d);
   });
   //remove first value from domain array to create class breakpoints
   domainArray.shift();

   //assign array of last 4 cluster minimums as domain
   colorScale.domain(domainArray);


    return colorScale;
};


function joinData(stateLines, csvStates){
    // Variables for data join
    var attrArray = ["ID","P_Art","P_Business","P_HE","P_Sience","P_related", "P_total","name"]; // replace with your actual attributes
    // Loop through CSV data to assign each set of CSV attribute values to GeoJSON state
    for (var i = 0; i < csvStates.length; i++) {
        var csvState = csvStates[i]; // The current state
        var csvKey = csvState.name; // The CSV primary key
        // Loop through GeoJSON states to find correct state
        for (var a = 0; a < stateLines.length; a++) {
            var geojsonProps = stateLines[a].properties; // The current state GeoJSON properties
            var geojsonKey = geojsonProps.name; // The GeoJSON primary key
            // Where primary keys match, transfer CSV data to GeoJSON properties object
            if (geojsonKey == csvKey) {
                // Assign all attributes and values
                attrArray.forEach(function(attr){
                    var val = parseFloat(csvState[attr]); // Get CSV attribute value
                    geojsonProps[attr] = val; // Assign attribute and value to GeoJSON properties
                });
            }
        }
    }

    return stateLines;
};

function setEnumerationUnits(provinceLines, stateLines, map, path, colorScale){
    //add states to map
    console.log('here');
    console.log(stateLines);
    console.log(stateLines.features[0].properties);
   
   

// Calculate the minimum and maximum values of the expressed property
var minExpressed = d3.min(provinceLines.features, function(d) { return d.properties[expressed]; });
var maxExpressed = d3.max(provinceLines.features, function(d) { return d.properties[expressed]; });

// Define the color scale
var colorScale = d3.scaleLinear()
    .domain([minExpressed, maxExpressed])
    .range(["white", "red"]);
   
// Add province lines
map.selectAll(".province")
    .data(provinceLines.features)
    .enter().append("path")
    .attr("class", "province")
    .attr("d", path)
    .style("fill", function(d){
        return colorScale(d.properties[expressed]);
    });
    map.selectAll(".state")
    .data(stateLines.features)
    .enter().append("path")
    .attr("class", "state")
    .attr("d", path)
    .style("fill", function(d){
        return colorScale(d.properties[expressed]);
    });
};

// Create the Dropdown Function:
// Define a function called createDropdown that will create the dropdown menu 
// and populate it with options based on your attrArray.
//Now look where I Added the Dropdown to Your setMap Function:

function createDropdown(provinceLines, stateLines, map, path,csvStates) {
    // Add select element
    var dropdown = d3.select("body")
        .append("select")
        .attr("class", "dropdown")
        .on("change", function() {
            // console.log('dropdown change:', this.value);
            var selectedValue = this.value;
            changeAttribute(provinceLines, stateLines, map, path, selectedValue, csvStates);
        });
        
//add initial option
var attrOptions = dropdown.selectAll("attrOptions")
.data(attrArray)
.enter()
.append("option")
.attr("value", function(d) { return d; })
.text(function(d) { return d; });

}
// Called when new attribute is selected
function changeAttribute(attribute, csvStates) {
expressed = attribute;

var colorScale = makeColorScale(csvStates)

var states = d3.selectAll('.states')
.transition()
.duration(500)
.style('fill', function (d) {
    return colorScale(d.properties[expressed])
});
}
// Function to highlight states and bars
function highlight(props) {
    // Change stroke
    var selected = d3.selectAll('.' + props.NAME)
        .style('stroke', '#c8c8c8')
        .style('stroke-width', '2');

    setLabel(props);
}

//function to reset the element style on mouseout
function dehighlight(props) {
    var selected = d3.selectAll("." + props.NAME)
        .style("stroke", "black")
        .style("stroke-width", "0.5px");

    d3.select(".infolabel")
        .remove();
};


//Define the changeAttribute Function:
// This function will handle the attribute change when a different option is 
// selected from the dropdown. It should update the expressed variable, recalculate 
// the color scale, and update the map and chart accordingly
//function to move info label with mouse
function moveLabel() {
    //get width of label
    var labelWidth = d3.select(".infolabel")
        .node()
        .getBoundingClientRect()
        .width;
    
    var labelHeight = d3.select(".infolabel")
        .node()
        .getBoundingClientRect()
        .height;
    
    //use coordinates of mousemove event to set label coordinates    
    var x1 = d3.event.pageX + 10,
        y1 = d3.event.pageY - labelHeight - 10,
        x2 = d3.event.pageX - labelWidth - 5,
        y2 = d3.event.pageY + 25;

    //horizontal label coordinate, testing for overflow
    var x = d3.event.pageX > window.innerWidth - labelWidth - 20 ? x2 : x1;
    //vertical label coordinate, testing for overflow
    var y = d3.event.pageY < 75 ? y2 : y1;

    d3.select(".infolabel")
        .style("left", x + "px")
        .style("top", y + "px");
}
function changeAttribute(provinceLines, stateLines, map, path, attribute, csvStates) {
    // Change the expressed attribute
    expressed = attribute;
    console.log('expressed:', expressed);
var bars = d3.selectAll(".bar")
        //Sort bars
        .sort(function(a, b){
            return b[expressed] - a[expressed];
        });
        
    // Recreate the color scale
    var colorScale = makeColorScale(csvStates);

    //recolor enumeration units
    var regions = d3.selectAll(".regions")
        .style("fill", function(d){            
            var value = d.properties[expressed];            
            if(value) {                
                return colorScale(value);            
            } else {                
                return "#ccc";            
            }    
        });

    // Calculate the minimum and maximum values of the expressed property
    var minExpressed = d3.min(provinceLines.features, function(d) { return d.properties[expressed]; });
    var maxExpressed = d3.max(provinceLines.features, function(d) { return d.properties[expressed]; });


    // Recreate the color scale
    var colorScale = d3.scaleLinear()
        .domain([minExpressed, maxExpressed])
        .range(["white", "red"]);

    // Update province and state colors
    map.selectAll(".province")
        .style("fill", function(d) {
            return colorScale(d.properties[expressed]);
        });

    map.selectAll(".state")
        .style("fill", function(d) {
            return colorScale(d.properties[expressed]);
        });

    // Update enumeration units and chart
    // You need to modify these functions to accept and use the new attribute
    // setEnumerationUnits(provinceLines, stateLines, map, path, colorScale);
    setChart(csvStates, colorScale);
    updateChart(bars, csvStates.length, colorScale);
    //function to position, size, and color bars in chart
function updateChart(bars, n, colorScale){
    //position bars
    bars.attr("x", function(d, i){
            return i * (chartInnerWidth / n) + leftPadding;
        })
        //size/resize bars
        .attr("height", function(d, i){
            return 463 - yScale(parseFloat(d[expressed]));
        })
        .attr("y", function(d, i){
            return yScale(parseFloat(d[expressed])) + topBottomPadding;
        })
        //color/recolor bars
        .style("fill", function(d){            
            var value = d[expressed];            
            if(value) {                
                return colorScale(value);            
            } else {                
                return "#ccc";            
            }    
    });
};
}


})(); //last line of main.js