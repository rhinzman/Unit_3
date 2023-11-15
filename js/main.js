//First line of main.js...wrap everything in a self-executing anonymous function to move to local scope
(function(){

    //pseudo-global variables
    var attrArray = ["varA", "varB", "varC", "varD", "varE"]; //list of attributes
    var expressed = attrArray[0]; //initial attribute

//begin script when window loads
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

    //create Albers equal area conic projection centered on France
    var projection = d3.geoAlbers()
        .center([34,97])
        .rotate([0, 1, 0])
        .parallels([-20,30])
        .scale(200)
        .translate([width / 2, height / 2]);

       

var path = d3.geoPath()
    .projection(projection);

    //use Promise.all to parallelize asynchronous data loading
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


   //translate europe TopoJSON
   var provinceLines = topojson.feature(Provinces, Provinces.objects.Provinces)
   var stateLines = topojson.feature(States, States.objects.States1);
   console.log(Provinces)
   console.log(States)
   console.log(provinceLines)
   console.log(stateLines);

  //variables for data join
  var attrArray = ["NAME", "Percent_To", "varC", "vPercent__1", "Percent__2","Percent_2","Percent_3","Percent_4", "Total_Tot"];


  //loop through csv to assign each set of csv attribute values to geojson region
  for (var i=0; i<csvStates.length; i++){
    var csvRegion = csvStates[i]; //the current region
    var csvKey = csvRegion.adm1_code; //the CSV primary key

    //loop through geojson regions to find correct region
    for (var a=0; a<stateLines.length; a++){

        var geojsonProps = stateLines[a].properties; //the current region geojson properties
        var geojsonKey = geojsonProps.adm1_code; //the geojson primary key

        //where primary keys match, transfer csv data to geojson properties object
        if (geojsonKey == csvKey){

            //assign all attributes and values
            attrArray.forEach(function(attr){
                var val = parseFloat(csvStates[attr]); //get csv attribute value
                geojsonProps[attr] = val; //assign attribute and value to geojson properties
            });
        };
    };
};

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



 //add world countries to map
 var countries = map.append("path")
 .datum(provinceLines)
 .attr("GEOID", "NAME")
 .attr("d", path);

//add states to map
var regions = map.selectAll(".regions")
 .data(stateLines)
 .enter()
 .append("path")
 .attr("NAME", function(d){
     return "regions " + d.properties.adm1_code;
 })
 .attr("d", path);
}};
})(); //last line of main.js