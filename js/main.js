(function(){

    //pseudo-global variables
    var attrArray = ["NAME", "Percent_To", "varC", "vPercent__1", "Percent__2","Percent_2","Percent_3","Percent_4", "Total_Tot"]; //list of attributes
    var expressed = attrArray[0]; //initial attribute
    
window.onload = setMap();

//set up choropleth map
function setMap() {
    //use Promise.all to parallelize asynchronous data loading
    //map frame dimensions
    var width = 960,
        height = 460;
    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);
    
    //create Robinson projection
    var projection = d3.geoRobinson()
        .scale(148)
        .translate([width / 2, height / 2]);
    //create path generator
    var path = d3.geoPath().projection(projection);
    //use Promise.all to parallelize asynchronous data loading})(); //last line of main.js
    var promises = [];
    promises.push(d3.csv("data/States.csv")); //load attributes from csv
    promises.push(d3.json("data/Provinces.topojson")); //load background spatial data
    promises.push(d3.json("data/States.topojson")); //load choropleth spatial data
    Promise.all(promises).then(callback);

    function callback(data){
        var csvStates = data[0],
            Provinces = data[1],
            States = data[2];
    console.log(Provinces);
    console.log(States);
    //place graticule on the map
    setGraticule(map, path);
    

   //translate europe TopoJSON
   var provinceLines = topojson.feature(Provinces, Provinces.objects.Provinces)
   var stateLines = topojson.feature(States, States.objects.States1);

   console.log(Provinces)
   console.log(States)
   console.log(provinceLines)
   console.log(stateLines)

   //add countries to map
 var countries = map.append("path")
 .datum(provinceLines)
 .attr("GEOID", "NAME")
 .attr("d", path);

 //join csv data to GeoJSON enumeration units
 stateLines = joinData(stateLines, csvStates);
//create the color scale
var colorScale = makeColorScale(csvData);


 //add enumeration units to the map
 setEnumerationUnits(stateLines, map, path);
};
};//end of setMap()

function setGraticule(map, path){
    // Continue with your map creation code...
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

function joinData(stateLines, csvStates){
    
    // Loop through CSV data to assign each set of CSV attribute values to GeoJSON state
    for (var i = 0; i < csvStates.length; i++) {
        var csvState = csvStates[i]; // The current state
        var csvKey = csvState.adm1_code; // The CSV primary key
        // Loop through GeoJSON states to find correct state
        for (var a = 0; a < stateLines.length; a++) {
            var geojsonProps = stateLines[a].properties; // The current state GeoJSON properties
            var geojsonKey = geojsonProps.adm1_code; // The GeoJSON primary key
            // Where primary keys match, transfer CSV data to GeoJSON properties object
            if (geojsonKey == csvKey) {
                // Assign all attributes and values
                attrArray.forEach(function(attr){
                    var val = parseFloat(csvState[attr]); // Get CSV attribute value
                    geojsonProps[attr] = val; // Assign attribute and value to GeoJSON properties
                });
            };
        };
    };
return stateLines;
};
function setEnumerationUnits(stateLines, map, path,colorScale){
//add states to map
var regions = map.selectAll(".regions")
 .data(stateLines)
 .enter()
 .append("path")
 .attr("NAME", function(d){
     return "regions " + d.properties.adm1_code;
 })
 .attr("d", path)
 .style("fill", function(d){
    var value = d.properties[expressed];            
                if(value) {          
    return colorScale(d.properties[expressed]);
} else {                
    return "#ccc";            
}    
});
}
// Add state lines
map.selectAll(".state")
    .data(stateLines.features)
    .enter().append("path")
    .attr("class", "state")
    .attr("d", path);
// Add province lines
map.selectAll(".province")
    .data(provinceLines.features)
    .enter().append("path")
    .attr("class", "province")
    .attr("d", path);

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


    //assign array of expressed values as scale domain
    colorScale.domain(domainArray);

    return colorScale;
};
}
)(); //last line of main.js