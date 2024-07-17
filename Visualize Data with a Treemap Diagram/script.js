const videoGameSalesUrl =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";
const movieSalesUrl =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json";
const kickstarterPledgesUrl =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json";

const width = 960;
const height = 600;

// Use a diverse color scale
const color = d3.scaleOrdinal(d3.schemeTableau10);

const svg = d3.select(".chart").attr("width", width).attr("height", height);

const tooltip = d3.select("#tooltip");

function drawTreemap(url) {
  d3.json(url).then((data) => {
    const root = d3
      .hierarchy(data)
      .eachBefore((d) => {
        d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
      })
      .sum((d) => d.value)
      .sort((a, b) => b.height - a.height || b.value - a.value);

    d3.treemap().size([width, height]).paddingInner(1)(root);

    svg.selectAll("*").remove();

    const cell = svg
      .selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

    cell
      .append("rect")
      .attr("id", (d) => d.data.id)
      .attr("class", "tile")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("data-name", (d) => d.data.name)
      .attr("data-category", (d) => d.data.category)
      .attr("data-value", (d) => d.data.value)
      .attr("fill", (d) => color(d.data.category));

    cell
      .append("text")
      .selectAll("tspan")
      .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
      .enter()
      .append("tspan")
      .attr("x", 4)
      .attr("y", (d, i) => 13 + i * 10)
      .text((d) => d);

    const categories = root.leaves().map((nodes) => nodes.data.category);
    const uniqueCategories = [...new Set(categories)];

    const legend = d3.select("#legend");

    legend.selectAll("*").remove(); // Clear existing legend

    uniqueCategories.forEach((category) => {
      const legendItem = legend.append("div").attr("class", "legend-item");

      legendItem
        .append("div")
        .attr("class", "legend-item-rect")
        .style("background-color", color(category));

      legendItem
        .append("span")
        .attr("class", "legend-item-text")
        .text(category);
    });

    cell.on("mouseover", (event, d) => {
      tooltip.style("opacity", 0.9);
      tooltip
        .html(
          `Name: ${d.data.name}<br>Category: ${d.data.category}<br>Value: ${d.data.value}`
        )
        .attr("data-value", d.data.value)
        .style("left", `${event.pageX + 5}px`)
        .style("top", `${event.pageY - 28}px`);
    });

    cell.on("mouseout", () => {
      tooltip.style("opacity", 0);
    });
  });
}

document
  .getElementById("video-game-sales")
  .addEventListener("click", () => drawTreemap(videoGameSalesUrl));
document
  .getElementById("movie-sales")
  .addEventListener("click", () => drawTreemap(movieSalesUrl));
document
  .getElementById("kickstarter-pledges")
  .addEventListener("click", () => drawTreemap(kickstarterPledgesUrl));

// Initial load
drawTreemap(videoGameSalesUrl);
