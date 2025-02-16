const width = 960;
const height = 600;
const padding = 50;

const svg = d3.select("#choropleth")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const tooltip = d3.select("body").append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);

const colorScale = d3.scaleThreshold()
    .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
    .range(d3.schemeBlues[9]);

const legendScale = d3.scaleLinear()
    .domain([2.6, 75.1])
    .range([0, 200]);

const legendAxis = d3.axisBottom(legendScale)
    .tickSize(13)
    .tickValues(colorScale.domain())
    .tickFormat(d => `${d}%`);

Promise.all([
    d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"),
    d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json")
]).then(([us, educationData]) => {
    const counties = topojson.feature(us, us.objects.counties).features;

    svg.append("g")
        .selectAll("path")
        .data(counties)
        .enter()
        .append("path")
        .attr("class", "county")
        .attr("d", d3.geoPath())
        .attr("fill", d => {
            const countyData = educationData.find(e => e.fips === d.id);
            return countyData ? colorScale(countyData.bachelorsOrHigher) : "#ccc";
        })
        .attr("data-fips", d => d.id)
        .attr("data-education", d => {
            const countyData = educationData.find(e => e.fips === d.id);
            return countyData ? countyData.bachelorsOrHigher : 0;
        })
        .on("mouseover", (event, d) => {
            const countyData = educationData.find(e => e.fips === d.id);
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(`${countyData.area_name}, ${countyData.state}: ${countyData.bachelorsOrHigher}%`)
                .attr("data-education", countyData.bachelorsOrHigher)
                .style("left", `${event.pageX + 5}px`)
                .style("top", `${event.pageY - 28}px`);
        })
        .on("mouseout", () => {
            tooltip.transition().duration(500).style("opacity", 0);
        });

    svg.append("path")
        .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
        .attr("class", "states")
        .attr("d", d3.geoPath());

    const legend = d3.select("#legend")
        .append("svg")
        .attr("width", 250)
        .attr("height", 50);

    legend.append("g")
        .attr("transform", "translate(25, 20)")
        .call(legendAxis);

    legend.selectAll("rect")
        .data(colorScale.range().map(color => {
            const d = colorScale.invertExtent(color);
            if (d[0] == null) d[0] = legendScale.domain()[0];
            if (d[1] == null) d[1] = legendScale.domain()[1];
            return d;
        }))
        .enter()
        .append("rect")
        .attr("height", 8)
        .attr("x", d => legendScale(d[0]))
        .attr("width", d => legendScale(d[1]) - legendScale(d[0]))
        .attr("fill", d => colorScale(d[0]));
});
