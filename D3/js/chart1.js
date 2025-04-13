// Tooltip setup
const tooltip1 = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "rgba(0, 0, 0, 0.7)")
    .style("color", "#fff")
    .style("padding", "5px 10px")
    .style("border-radius", "5px")
    .style("font-size", "14px")
    .style("visibility", "hidden")
    .style("z-index", 1000);  // Thêm z-index

const margin = { top: 50, right: 40, bottom: 50, left: 60 },
      width = 700 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom;

const svg = d3.select("#svg1")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("/data/project_heart_disease_cleaned.csv").then(data => {
    function getAgeGroup(age) {
        age = +age;
        if (age <= 18) return "0-18";
        else if (age <= 35) return "19-35";
        else if (age <= 65) return "36-65";
        else return "66+";
    }

    data.forEach(d => {
        d.AgeGroup = getAgeGroup(d.Age);
    });

    const grouped = d3.rollup(data,
        v => ({
            No: v.filter(d => d["Heart Disease Status"] === "No").length,
            Yes: v.filter(d => d["Heart Disease Status"] === "Yes").length
        }),
        d => d.AgeGroup
    );

    const ageOrder = ["0-18", "19-35", "36-65", "66+"];
    const formattedData = ageOrder.map(group => {
        const entry = grouped.get(group) || { No: 0, Yes: 0 };
        return {
            AgeGroup: group,
            No: entry.No,
            Yes: entry.Yes
        };
    });

    // Scale
    const x = d3.scaleBand()
        .domain(ageOrder)
        .range([0, width])
        .padding(0.3);

    const y = d3.scaleLinear()
        .domain([0, d3.max(formattedData, d => d.No + d.Yes)])
        .nice()
        .range([height, 0]);

    // Axis
    chart.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    chart.append("g")
        .call(d3.axisLeft(y));

    // Bars
    chart.selectAll(".bar-group")
        .data(formattedData)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x(d.AgeGroup)},0)`)
        .each(function(d) {
            const g = d3.select(this);
            // Has Disease
            g.append("rect")
                .attr("class", "bar-yes")
                .attr("x", 0)
                .attr("y", y(d.Yes)) // Y vị trí cho "Has Disease"
                .attr("width", x.bandwidth())
                .attr("height", height - y(d.Yes)) // Chiều cao cho "Has Disease"
                .on("mouseover", (event) => {
                    tooltip1.style("visibility", "visible")
                        .text(`Has Disease: ${d.Yes}`);
                })
                .on("mousemove", (event) => {
                    tooltip1.style("top", `${event.pageY + 10}px`)
                           .style("left", `${event.pageX + 10}px`);
                })
                .on("mouseout", () => tooltip1.style("visibility", "hidden"));

            // No Disease
            g.append("rect")
                .attr("class", "bar-no")
                .attr("x", 0)
                .attr("y", y(d.Yes + d.No)) // Y vị trí cho "No Disease"
                .attr("width", x.bandwidth())
                .attr("height", height - y(d.No)) // Chiều cao cho "No Disease"
                .on("mouseover", (event) => {
                    tooltip1.style("visibility", "visible")
                        .text(`No Disease: ${d.No}`);
                })
                .on("mousemove", (event) => {
                    tooltip1.style("top", `${event.pageY + 10}px`)
                           .style("left", `${event.pageX + 10}px`);
                })
                .on("mouseout", () => tooltip1.style("visibility", "hidden"));
        });

    // Legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 20}, 20)`);

    legend.append("rect")
        .attr("x", -80)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "orange");

    legend.append("text")
        .attr("x", -60)
        .attr("y", 33)
        .text("No Disease")
        .style("font-size", "13px");

    legend.append("rect")
        .attr("x", -80)
        .attr("y", 20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "steelblue");

    legend.append("text")
        .attr("x", -60)
        .attr("y", 12)
        .text("Has Disease")
        .style("font-size", "13px");

        chart.append("g")
        .call(d3.axisLeft(y).ticks(5))  // Hiện các ticks trên trục Y
        .append("text")  // Thêm tên cho trục Y
        .attr("transform", "rotate(-90)")  // Xoay chữ để nó đứng
        .attr("y", -50)  // Đặt vị trí chữ
        .attr("x", -height / 2)
        .style("text-anchor", "middle")
        .text("Số lượng người")  // Tên cột Y là "Số lượng người"
        .style("font-size", "14px")
        .style("fill", "#333");chart.append("g")
        .call(d3.axisLeft(y).ticks(5))  // Hiện các ticks trên trục Y
        .append("text")  // Thêm tên cho trục Y
        .attr("transform", "rotate(-90)")  // Xoay chữ để nó đứng
        .attr("y", -50)  // Đặt vị trí chữ
        .attr("x", -height / 2)
        .style("text-anchor", "middle")
        .text("Số lượng người")  // Tên cột Y là "Số lượng người"
        .style("font-size", "14px")
        .style("fill", "#333");

        svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", width / 1)
        .attr("y", height + margin.bottom + 30)
        .text("Tuổi");

});
