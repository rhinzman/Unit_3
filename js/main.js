//begin script when window loads
window.onload = setMap();

//set up choropleth map
function setMap() {
    //use Promise.all to parallelize asynchronous data loading

    var promises = [
        // d3.csv("data/unitsData.csv"),
        d3.json("data/States.topojson"),
        d3.json("data/Provinces.topojson"),
    ];
    Promise.all(promises).then(callback);

    function callback(data) {
        var States = data[0],
            Provinces = data[1];
      
        console.log(States);
        console.log(Provinces);
    }
}