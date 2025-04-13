// Tooltip
const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "rgba(0, 0, 0, 0.7)")
    .style("color", "#fff")
    .style("padding", "5px 10px")
    .style("border-radius", "5px")
    .style("font-size", "14px")
    .style("visibility", "hidden");

// Kích thước
const width = 700;
const height = 450;
const margin = { top: 20, right: 30, bottom: 60, left: 100 };

const svg = d3.select("#svg1")
    .attr("width", width)
    .attr("height", height);

d3.csv("/data/project_heart_disease_cleaned.csv").then(data => {
    // Nhóm theo nhóm tuổi
    let grouped = d3.rollup(data,
        v => ({
            HasDisease: v.filter(d => d["Heart Disease Status"] === "Yes").length,
            NoDisease: v.filter(d => d["Heart Disease Status"] === "No").length
        }),
        d => d["Age Category"]
    );

    // Chuyển sang mảng
    const formatted = Array.from(grouped, ([AgeGroup, values]) => ({
        AgeGroup,
        ...values
    }));

    // Sắp xếp theo thứ tự tuổi
    const ageOrder = ["18-24", "25-29", "30-34", "35-39", "40-44", "45-49", "50-54", "55-59", "60-64", "65-69", "70-74", "75-79", "80+"];
    formatted.sort((a, b) => ageOrder.indexOf(a.AgeGroup) - ageOrder.indexOf(b.AgeGroup));

    const x = d3.scaleBand()
        .domain(formatted.map(d => d.AgeGroup))
        .range([margin.left, width - margin.right])
        .padding(0.3);

    const y = d3.scaleLinear()
        .domain([0, d3.max(formatted, d => d.HasDisease + d.NoDisease)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // Trục X
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(45)")
        .style("text-anchor", "start");

    // Trục Y
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    // Vẽ cột
    svg.selectAll(".bar-group")
        .data(formatted)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x(d.AgeGroup)},0)`)
        .each(function(d) {
            const g = d3.select(this);
            const barWidth = x.bandwidth();

            // Has Disease
            g.append("rect")
                .attr("x", 0)
                .attr("y", y(d.HasDisease))
                .attr("width", barWidth)
                .attr("height", y(0) - y(d.HasDisease))
                .attr("fill", "orange")
                .on("mouseover", event => tooltip.style("visibility", "visible").text(`Has Disease: ${d.HasDisease}`))
                .on("mousemove", event => tooltip.style("top", `${event.pageY - 10}px`).style("left", `${event.pageX + 10}px`))
                .on("mouseout", () => tooltip.style("visibility", "hidden"));

            // No Disease
            g.append("rect")
                .attr("x", 0)
                .attr("y", y(d.HasDisease + d.NoDisease))
                .attr("width", barWidth)
                .attr("height", y(0) - y(d.NoDisease))
                .attr("fill", "seagreen")
                .on("mouseover", event => tooltip.style("visibility", "visible").text(`No Disease: ${d.NoDisease}`))
                .on("mousemove", event => tooltip.style("top", `${event.pageY - 10}px`).style("left", `${event.pageX + 10}px`))
                .on("mouseout", () => tooltip.style("visibility", "hidden"));
        });

    // Chú thích
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 150},${margin.top})`);

    legend.append("rect").attr("x", 0).attr("y", 0).attr("width", 20).attr("height", 20).attr("fill", "seagreen");
    legend.append("text").attr("x", 25).attr("y", 15).text("No Disease");

    legend.append("rect").attr("x", 0).attr("y", 30).attr("width", 20).attr("height", 20).attr("fill", "orange");
    legend.append("text").attr("x", 25).attr("y", 45).text("Has Disease");
});
