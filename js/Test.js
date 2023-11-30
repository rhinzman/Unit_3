// Step 1: Define a color scale
var colorScale = d3.scaleQuantize()
    .range([
        "#D4B9DA",
        "#C994C7",
        "#DF65B0",
        "#DD1C77",
        "#980043"
    ]);

// Step 2: Join CSV data to GeoJSON data
for (var i = 0; i < csvStates.length; i++) {
    var csvState = csvStates[i];
    var geojsonState = States.features.find(feature => feature.properties.ID === csvState.ID);

    if (geojsonState) {
        geojsonState.properties.data = csvState;
    }
}

// Update color scale domain based on data
colorScale.domain([
    d3.min(States.features, feature => feature.properties.data.P_total),
    d3.max(States.features, feature => feature.properties.data.P_total)
]);

// Step 3: Apply the color scale to your map
map.selectAll(".state")
    .data(States.features)
    .enter()
    .append("path")
    .attr("class", "state")
    .attr("d", path)
    .style("fill", feature => colorScale(feature.properties.data.P_total));