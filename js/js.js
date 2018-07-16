//Width and height
    var w = 1000;
    var h = 600;
    // preparing for the legend text
    var color_domain = [30, 60, 90, 120];
    var ext_color_domain = [30, 60, 90, 120];
    var legend_labels = ["30", "60", "90", "120"];

    // colour scale 
    var color = d3.scale.quantize()
    // domain for the legend
        .domain(color_domain)
        .range(["#9BFFD0", "#49E8E7", "#29A4FF", "#6C7EE8", "#5A13FF"
        ]);

    //Define map projection
    var projection = d3.geo.mercator()
        .translate([w / 2, h / 2])
        .scale([100]);

    //Define path generator
    var path = d3.geo.path()
        .projection(projection);

    //Create SVG element
    var svg = d3.select("body")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    //Add a title to explain the map   
    svg.append("text")
        .attr("class", "title")
        .attr("x", 620)
        .attr("y", 15)
        .text("MEIT Average Score Per Country");

    //Load CSV
    d3.json("http://emotional-apps.com/apis/meit/stats/getdata.php?test=1&gender=all&age=all&begindate=2000-01-01&enddate=2017-02-04", function(data) {

        //Set color domain INPUT
        color.domain([
            d3.min(data, function(d) {
                return parseFloat(d.score_average);
            }),
            d3.max(data, function(d) {
                return parseFloat(d.score_average);
            })
        ]);

        //Load in GeoJSON data
        d3.json("https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json", function(json) {

            //tip
            var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([0, -10])
                .html(function(d) {
                    if (d.properties.value > 0) {
                        return "<span style='color:cyan'>" + d.properties.name + "</span>" +
                            "<br>Average Score: <span style='color:cyan'>" + Math.round(d.properties.value) + "</span>";
                    } else {
                        return "<span style='color:cyan'>" + d.properties.name + "</span>";
                    }
                });
            svg.call(tip);
            //Merge the ag. data and GeoJSON
            //Loop through once for each ag. data value
            for (var i = 0; i < data.length; i++) {

                //Grab state name
                var dataCountry = data[i].iso3;

                //Grab data value, and convert from string to float
                var dataValue = parseFloat(data[i].score_average);

                //Find the corresponding state inside the GeoJSON
                for (var j = 0; j < json.features.length; j++) {

                    var jsonCountry = json.features[j].id;

                    if (dataCountry == jsonCountry) {

                        //Copy the data value into the JSON
                        json.features[j].properties.value = dataValue;

                        //Stop looking through the JSON
                        break;

                    }
                }
            }

            //Bind data and create one path per GeoJSON feature
            svg.selectAll("path")
                .data(json.features)
                .enter()
                .append("path")
                .attr("d", path)
                .on("mouseover", tip.show)
                .on("mouseout", tip.hide)
                .on("mousedown", function(d) {
                    d3.select(this).transition().duration(500).style("opacity", 1);
                })
                .on("mouseup", function(d) {
                    d3.select(this).transition().duration(500).style("opacity", 0.9);
                })
                .style("fill", function(d) {
                    var value = d.properties.value;
                    if (value) {
                        return color(value);
                    } else
                        return "#ccc";
                })
                .style("opacity", 0.9);

        });
    });

            // creating the legend for the map
            var legend = svg.selectAll("g.legend")
                .data(ext_color_domain)
                .enter().append("g")
                .attr("class", "legendText");

            var ls_w = 20,
                ls_h = 20;

            legend.append("rect")
                .attr("x", 120)
                .attr("y", function(d, i) {
                    return 470 - (i * ls_h) - 2 * ls_h;
                })
                .attr("width", ls_w)
                .attr("height", ls_h)
                .style("fill", function(d, i) {
                    return color(d);
                })
                .style("opacity", 0.8);

            legend.append("text")
                .attr("x", 150)
                .attr("y", function(d, i) {
                    return 470 - (i * ls_h) - ls_h - 4;
                })
                .text(function(d, i) {
                    return legend_labels[i];
                });
            legend.append("text")
                .attr("x", 120)
                .attr("y", 360)
                .attr("class", "legendText")
                .text("Average Scores");