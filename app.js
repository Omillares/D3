var svgWidth = 960;
var svgHeight = 500;

var margin = { top: 20, right: 40, bottom: 80, left: 100 };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;


var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var chart = svg.append("g");


d3.select(".chart").append("div").attr("class", "tooltip").style("opacity", 0);


d3.csv("ACS_14_1YR_S0102.csv", function(err, hairData) {
  if (err) throw err;

  hairData.forEach(function(data) {
    data.hair_length = +data.hair_length;
    data.num_hits = +data.num_hits;
    data.num_albums = +data.num_albums;
  });


  var yLinearScale = d3.scaleLinear().range([height, 0]);

  var xLinearScale = d3.scaleLinear().range([0, width]);


  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);


  var xMin;
  var xMax;
  var yMax;


  function findMinAndMax(dataColumnX) {
    xMin = d3.min(hairData, function(data) {
      return +data[dataColumnX] * 0.8;
    });

    xMax = d3.max(hairData, function(data) {
      return +data[dataColumnX] * 1.1;
    });

    yMax = d3.max(hairData, function(data) {
      return +data.num_hits * 1.1;
    });
  }


  var currentAxisLabelX = "hair_length";


  findMinAndMax(currentAxisLabelX);


  xLinearScale.domain([xMin, xMax]);
  yLinearScale.domain([0, yMax]);


  var toolTip = d3
    .tip()
    .attr("class", "tooltip")

    .offset([80, -60])

    .html(function(data) {
      var bandName = data.rockband;
      var numHits = +data.num_hits;
      var bandInfo = +data[currentAxisLabelX];
      var bandString;

      if (currentAxisLabelX === "hair_length") {
        bandString = "Hair length: ";
      }
      else {
        bandString = "Number of albums: ";
      }
      return bandName +
        "<br>" +
        bandString +
        bandInfo +
        "<br> Hits: " +
        numHits;
    });

  // Create tooltip
  chart.call(toolTip);

  chart
    .selectAll("circle")
    .data(hairData)
    .enter()
    .append("circle")
    .attr("cx", function(data, index) {
      return xLinearScale(+data[currentAxisLabelX]);
    })
    .attr("cy", function(data, index) {
      return yLinearScale(data.num_hits);
    })
    .attr("r", "15")
    .attr("fill", "#E75480")

    .on("click", function(data) {
      toolTip.show(data);
    })

    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });


  chart
    .append("g")
    .attr("transform", "translate(0," + height + ")")

    .attr("class", "x-axis")
    .call(bottomAxis);


  chart.append("g").call(leftAxis);


  chart
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 40)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .attr("class", "axis-text")
    .attr("data-axis-name", "num_hits")
    .text("Number of Billboard 500 Hits");


  chart
    .append("text")
    .attr(
      "transform",
      "translate(" + width / 2 + " ," + (height + margin.top + 20) + ")"
    )

    .attr("class", "axis-text active")
    .attr("data-axis-name", "hair_length")
    .text("Hair Metal Band Hair Length (inches)");

  chart
    .append("text")
    .attr(
      "transform",
      "translate(" + width / 2 + " ," + (height + margin.top + 45) + ")"
    )

    .attr("class", "axis-text inactive")
    .attr("data-axis-name", "num_albums")
    .text("# of Albums Released");

  function labelChange(clickedAxis) {
    d3
      .selectAll(".axis-text")
      .filter(".active")

      .classed("active", false)
      .classed("inactive", true);

    clickedAxis.classed("inactive", false).classed("active", true);
  }

  d3.selectAll(".axis-text").on("click", function() {

    var clickedSelection = d3.select(this);

    var isClickedSelectionInactive = clickedSelection.classed("inactive");

    var clickedAxis = clickedSelection.attr("data-axis-name");
    console.log("current axis: ", clickedAxis);

    if (isClickedSelectionInactive) {

      currentAxisLabelX = clickedAxis;

      findMinAndMax(currentAxisLabelX);

      xLinearScale.domain([xMin, xMax]);

      svg
        .select(".x-axis")
        .transition()

        .duration(1800)
        .call(bottomAxis);

      d3.selectAll("circle").each(function() {
        d3
          .select(this)
          .transition()

          .attr("cx", function(data) {
            return xLinearScale(+data[currentAxisLabelX]);
          })
          .duration(1800);
      });


      labelChange(clickedSelection);
    }
  });
});
