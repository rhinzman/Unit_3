(function(){
    //pseudo-global variables
    var attrArray = ["ID","P_Art","P_Business","P_HE","P_Sience","P_related", "P_total","name"]; //list of attributes
    var expressed = attrArray[0]; //initial attribute

window.onload = setMap();
//set up choropleth map


function setMap() {
    //use Promise.all to parallelize asynchronous data loading
    //map frame dimensions
    var width = 960, //map frame width
        height = 460; //map frame height

    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    //create Albers equal area conic projection centered on France
    var projection = d3.geoAlbers()
        .scale(350)
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

 //add enumeration units to the map
 setEnumerationUnits(provinceLines, stateLines, map, path, colorScale);
};

}; //end of setMap()

//function to create coordinated bar chart
function setChart(csvStates, colorScale){
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
        return "bar " + d.name;
    })
    .attr("width", chartInnerWidth / csvStates.length - 1)
    .attr("x", function(d, i){
        return i * (chartInnerWidth / csvStates.length) + leftPadding;
    })
    // 
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
            return colorScale(d[expressed]);
        });

        var numbers = chart.selectAll(".numbers")
        .data(csvStates)
        .enter()
        .append("text")
        .sort(function(a, b){
            return a[expressed]-b[expressed]
        })
        .attr("class", function(d){
            return "numbers " + d.name;
        })
        .attr("text-anchor", "middle")
        .attr("x", function(d, i){
            var fraction = chartWidth / csvStates.length;
            return i * fraction + (fraction - 1) / 2;
        })
        .attr("y", function(d){
            return chartHeight - yScale(parseFloat(d[expressed])) +240;
        })
        .text(function(d){
            return d[expressed];
        });
        var chartTitle = chart.append("text")
        .attr("x", 20)
        .attr("y", 40)
        .attr("class", "chartTitle")
        // .text("Number of Variable " + expressed[4] + " in each state");
        .text("Percentage of adults age 25 and older with a Bachelor in Art in each state");
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


})(); //last line of main.js