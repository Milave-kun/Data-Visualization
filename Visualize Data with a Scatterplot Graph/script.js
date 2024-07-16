document.addEventListener("DOMContentLoaded", function () {
  const svgWidth = 960;
  const svgHeight = 500;
  const margin = { top: 20, right: 20, bottom: 60, left: 80 };
  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;

  const svg = d3
    .select("#scatterplot")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  d3.json(
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
  ).then((data) => {
    // Parse time data
    data.forEach((d) => {
      const [minutes, seconds] = d.Time.split(":").map(Number);
      d.Seconds = minutes * 60 + seconds;
    });

    // Set up scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => new Date(d.Year, 0, 1)))
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.Seconds)])
      .range([height, 0]);

    // Add x-axis
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));

    g.append("g")
      .attr("id", "x-axis")
      .attr("class", "axis")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);

    // Add y-axis
    const yAxis = d3.axisLeft(yScale).tickFormat((d) => {
      const minutes = Math.floor(d / 60);
      const seconds = Math.floor(d % 60);
      return `${d3.format("02")(minutes)}:${d3.format("02")(seconds)}`;
    });

    g.append("g").attr("id", "y-axis").attr("class", "axis").call(yAxis);

    // Add dots
    g.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("data-xvalue", (d) => d.Year)
      .attr("data-yvalue", (d) => new Date(1970, 0, 1).setSeconds(d.Seconds))
      .attr("cx", (d) => xScale(new Date(d.Year, 0, 1)))
      .attr("cy", (d) => yScale(d.Seconds))
      .attr("r", 5)
      .on("mouseover", function (event, d) {
        d3.select("#tooltip")
          .style("display", "block")
          .style("left", `${event.pageX + 5}px`)
          .style("top", `${event.pageY - 28}px`)
          .attr("data-year", d.Year)
          .html(`${d.Name}: ${d.Nationality}<br>${d.Time}`);
      })
      .on("mouseout", function () {
        d3.select("#tooltip").style("display", "none");
      });
  });
});
