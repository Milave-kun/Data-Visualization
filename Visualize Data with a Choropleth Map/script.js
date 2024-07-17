const educationDataUrl =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const countyDataUrl =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

Promise.all([d3.json(educationDataUrl), d3.json(countyDataUrl)]).then(
  (data) => {
    const [educationData, countyData] = data;
    drawMap(educationData, countyData);
  }
);

const width = 960;
const height = 600;

const svg = d3.select("#map").attr("width", width).attr("height", height);

const path = d3.geoPath();

const colorScale = d3
  .scaleThreshold()
  .domain([10, 20, 30, 40])
  .range(d3.schemeBlues[5]);

function drawMap(educationData, countyData) {
  const educationById = {};
  educationData.forEach((d) => {
    educationById[d.fips] = d;
  });

  svg
    .append("g")
    .selectAll("path")
    .data(topojson.feature(countyData, countyData.objects.counties).features)
    .enter()
    .append("path")
    .attr("class", "county")
    .attr("data-fips", (d) => d.id)
    .attr("data-education", (d) =>
      educationById[d.id] ? educationById[d.id].bachelorsOrHigher : 0
    )
    .attr("d", path)
    .attr("fill", (d) => {
      const education = educationById[d.id]
        ? educationById[d.id].bachelorsOrHigher
        : 0;
      return colorScale(education);
    })
    .on("mouseover", function (event, d) {
      const education = educationById[d.id]
        ? educationById[d.id].bachelorsOrHigher
        : 0;
      d3.select("#tooltip")
        .style("opacity", 1)
        .html(`FIPS: ${d.id}<br>Education: ${education}%`)
        .attr("data-education", education)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function () {
      d3.select("#tooltip").style("opacity", 0);
    });

  // Draw the legend
  const legend = d3
    .select("#legend")
    .append("svg")
    .attr("width", 400)
    .attr("height", 50);

  const legendColors = d3
    .scaleThreshold()
    .domain([10, 20, 30, 40])
    .range(d3.schemeBlues[5]);

  const legendX = d3.scaleLinear().domain([0, 40]).range([0, 400]);

  const legendAxis = d3
    .axisBottom(legendX)
    .tickSize(13)
    .tickValues(legendColors.domain());

  legend
    .selectAll("rect")
    .data(
      legendColors.range().map((color) => {
        const d = legendColors.invertExtent(color);
        if (!d[0]) d[0] = legendX.domain()[0];
        if (!d[1]) d[1] = legendX.domain()[1];
        return d;
      })
    )
    .enter()
    .append("rect")
    .attr("height", 13)
    .attr("x", (d) => legendX(d[0]))
    .attr("width", (d) => legendX(d[1]) - legendX(d[0]))
    .attr("fill", (d) => legendColors(d[0]));

  legend.append("g").attr("transform", "translate(0,13)").call(legendAxis);
}
