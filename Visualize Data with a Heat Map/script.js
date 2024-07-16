// Define constants for SVG dimensions and margins
const margin = { top: 30, right: 20, bottom: 50, left: 60 };
const width = 1200 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Create SVG container
const svg = d3
  .select("#heatmap")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Load data
d3.json(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
).then((data) => {
  const baseTemperature = data.baseTemperature;
  const dataset = data.monthlyVariance;

  // Define scales
  const xScale = d3
    .scaleBand()
    .domain([...new Set(dataset.map((d) => d.year))])
    .range([0, width])
    .padding(0.01); // Reduced padding for more cells

  const yScale = d3
    .scaleBand()
    .domain([...new Set(dataset.map((d) => d.month))])
    .range([0, height])
    .padding(0.01); // Reduced padding for more cells

  const colorScale = d3
    .scaleQuantize()
    .domain([
      d3.min(dataset, (d) => baseTemperature + d.variance),
      d3.max(dataset, (d) => baseTemperature + d.variance),
    ])
    .range(d3.schemeReds[9]);

  // Define axes
  svg
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(
      d3
        .axisBottom(xScale)
        .tickValues(d3.range(1754, 2016, 10))
        .tickFormat(d3.format("d"))
    );

  svg
    .append("g")
    .attr("id", "y-axis")
    .call(
      d3
        .axisLeft(yScale)
        .tickFormat((month) => d3.timeFormat("%B")(new Date(0, month - 1)))
    );

  // Draw cells
  svg
    .selectAll(".cell")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("data-month", (d) => d.month - 1)
    .attr("data-year", (d) => d.year)
    .attr("data-temp", (d) => baseTemperature + d.variance)
    .attr("x", (d) => xScale(d.year))
    .attr("y", (d) => yScale(d.month - 1))
    .attr("width", xScale.bandwidth())
    .attr("height", yScale.bandwidth())
    .attr("fill", (d) => colorScale(baseTemperature + d.variance))
    .on("mouseover", function (event, d) {
      d3.select("#tooltip")
        .style("display", "block")
        .html(
          `Year: ${d.year}<br>Month: ${d3.timeFormat("%B")(
            new Date(0, d.month - 1)
          )}<br>Temperature: ${
            Math.round((baseTemperature + d.variance) * 10) / 10
          }°C`
        )
        .attr("data-year", d.year)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseout", function () {
      d3.select("#tooltip").style("display", "none");
    });

  // Draw legend
  const legend = d3.select("#legend");
  const legendColors = d3.schemeReds[9];
  const legendWidth = 300;
  const legendHeight = 30;
  const legendScale = d3
    .scaleLinear()
    .domain([0, legendColors.length - 1])
    .range([0, legendWidth]);

  legend
    .selectAll("rect")
    .data(legendColors)
    .enter()
    .append("rect")
    .attr("width", legendWidth / legendColors.length)
    .attr("height", legendHeight)
    .attr("x", (d, i) => legendScale(i))
    .attr("fill", (d) => d);
});
