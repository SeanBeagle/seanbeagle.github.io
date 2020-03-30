class Map {
  constructor(data, widgetID='map-widget') {
    this.widgetID = widgetID;
    this.widget = d3.select('#' + widgetID);

    this.width = 900;
    this.height = 700;

    this.margin = {
      top: 60,
      bottom: 40,
      left: 70,
      right: 40
    }

    this.projection = d3.geoAlbersUsa()
      .translate([this.width/2, this.height/2])
      .scale([1000]);

    this.path = d3.geoPath()
      .projection(this.projection);

    this.svg = this.widget
      .append('svg')
      .attr('id', widgetID + '-svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g')
      .attr('transform', 'translate(0' + this.margin.left + ',' + this.margin.top + ')');

    this.color = d3.scaleQuantile()
      .range(["rgb(237, 248, 233)", "rgb(186, 228, 179)", "rgb(116,196,118)", "rgb(49,163,84)", "rgb(0,109,44)"]);



      var stateMeta = "https://raw.githubusercontent.com/SeanBeagle/seanbeagle.github.io/master/epidemiology/data/state-meta1.csv";
      var usJSON = "https://raw.githubusercontent.com/SeanBeagle/seanbeagle.github.io/master/epidemiology/data/us-states.json";

      d3.csv(stateMeta, function(data) {
        map.color.domain([d3.min(data, d => d.value),
                           d3.max(data, d => d.value)]);

        d3.json(usJSON, function(json) {
          //Merge the agriculture and GeoJSON data
          //Loop through once for each agriculture data value
          for (var i = 0; i < data.length; i++) {
            // grab state name
            var dataState = data[i].state;
            //grab data value, and convert from string to float
            var dataValue = parseFloat(data[i].value);

            //find the corresponding state inside the GeoJSON
            for (var n = 0; n < json.features.length; n++) {
              // properties name gets the states name
              var jsonState = json.features[n].properties.name;
              // if statment to merge by name of state
              if (dataState == jsonState) {
                // Copy the data value into the JSON as new column
                json.features[n].properties.value = dataValue;
                break;
              }
            }
          }

       map.svg.selectAll("path")
          .data(json.features)
          .enter()
          .append("path")
          .attr("d", map.path)
          .style('fill', d => d.properties.value ? map.color(d.properties.value) : "#ccc");
      });
    })
  }
}