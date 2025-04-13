// Tooltip
const tooltip5 = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "rgba(0, 0, 0, 0.7)")
    .style("color", "#fff")
    .style("padding", "5px 10px")
    .style("border-radius", "5px")
    .style("font-size", "14px")
    .style("visibility", "hidden");

// Kích thước
const width5 = 700;
const height5 = 450;
const margin5 = { top: 30, right: 150, bottom: 60, left: 100 };

// SVG
const svg5 = d3.select("#svg5") 
    .attr("width", width5)
    .attr("height", height5);

// Đọc dữ liệu
d3.csv("../data/project_heart_disease_cleaned.csv").then(data => {
    const grouped = d3.rollup(data,
        v => ({
            NoDisease: v.filter(d => d["Heart Disease Status"] === "No").length,
            HasDisease: v.filter(d => d["Heart Disease Status"] === "Yes").length
        }),
        d => d["Family Heart Disease"]
    );

    const formatted = Array.from(grouped, ([FamilyHistory, values]) => ({
        FamilyHistory,
        ...values
    }));

    const x = d3.scaleBand()
        .domain(formatted.map(d => d.FamilyHistory))
        .range([margin5.left, width5 - margin5.right])
        .padding(0.5);

    const y = d3.scaleLinear()
        .domain([0, d3.max(formatted, d => d.NoDisease + d.HasDisease)])
        .nice()
        .range([height5 - margin5.bottom, margin5.top]);

    // Trục
    svg5.append("g")
        .attr("transform", `translate(0,${height5 - margin5.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("class", "axis-label");

    svg5.append("g")
        .attr("transform", `translate(${margin5.left},0)`)
        .call(d3.axisLeft(y))
        .selectAll("text")
        .attr("class", "axis-label");

    // Nhãn trục
    svg5.append("text")
        .attr("class", "axis-label")
        .attr("x", width5 / 2)
        .attr("y", height5 - 10)
        .attr("text-anchor", "middle")
        .text("Tiền sử gia đình mắc bệnh tim");

    svg5.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height5 / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .text("Số lượng người");

    // Cột chồng
    svg5.selectAll(".bar-group")
        .data(formatted)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x(d.FamilyHistory)},0)`)
        .each(function (d) {
            const g = d3.select(this);

            g.append("rect")
                .attr("class", "bar-yes")
                .attr("x", 0)
                .attr("y", y(d.HasDisease))
                .attr("width", x.bandwidth())
                .attr("height", y(0) - y(d.HasDisease))
                .on("mouseover", function (event) {
                    tooltip5.style("visibility", "visible")
                        .text(`Has Disease: ${d.HasDisease}`);
                })
                .on("mousemove", function (event) {
                    tooltip5.style("top", `${event.pageY - 10}px`)
                        .style("left", `${event.pageX + 10}px`);
                })
                .on("mouseout", () => tooltip5.style("visibility", "hidden"));

            g.append("rect")
                .attr("class", "bar-no")
                .attr("x", 0)
                .attr("y", y(d.NoDisease + d.HasDisease))
                .attr("width", x.bandwidth())
                .attr("height", y(0) - y(d.NoDisease))
                .on("mouseover", function (event) {
                    tooltip5.style("visibility", "visible")
                        .text(`No Disease: ${d.NoDisease}`);
                })
                .on("mousemove", function (event) {
                    tooltip5.style("top", `${event.pageY - 10}px`)
                        .style("left", `${event.pageX + 10}px`);
                })
                .on("mouseout", () => tooltip5.style("visibility", "hidden"));
        });

    // Legend
    const legend = svg5.append("g")
        .attr("transform", `translate(${width5 - 200}, ${margin5.top + 10})`);

    legend.append("rect").attr("class", "bar-yes").attr("width", 20).attr("height", 20);
    legend.append("text").attr("x", 30).attr("y", 15).text("Has Disease").attr("class", "axis-label");

    legend.append("rect").attr("class", "bar-no").attr("width", 20).attr("height", 20).attr("y", 30);
    legend.append("text").attr("x", 30).attr("y", 45).text("No Disease").attr("class", "axis-label");
});
