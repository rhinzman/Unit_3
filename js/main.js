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
        .center([38, 97])
        .rotate([90, 1, 0])
        .parallels([45,45])
        .scale(300)
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
   var stateLines = topojson.feature(States, States.objects.States1);
   var provinceLines = topojson.feature(Provinces, Provinces.objects.Provinces)
   
   console.log(Provinces)
   console.log(States)
   console.log(provinceLines)
   console.log(stateLines);

  
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


 //add Europe countries to map
 var countries = map.append("path")
 .datum(provinceLines)
 .attr("GEOID", "NAME")
 .attr("d", path);

//add France regions to map
var regions = map.selectAll(".regions")
 .data(provinceLines)
 .enter()
 .append("path")
 .attr("NAME", function(d){
     return "regions " + d.properties.adm1_code;
 })
 .attr("d", path);
}};