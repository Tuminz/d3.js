// Tooltip setup
const tooltip6 = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "rgba(0, 0, 0, 0.7)")
    .style("color", "#fff")
    .style("padding", "5px 10px")
    .style("border-radius", "5px")
    .style("font-size", "14px")
    .style("visibility", "hidden")
    .style("z-index", 1000);

// Kích thước biểu đồ
const margin = { top: 50, right: 40, bottom: 50, left: 60 },
      width = 700 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom;

const svg = d3.select("#svg6")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Đọc dữ liệu từ file CSV
d3.csv("/data/project_heart_disease_cleaned.csv").then(data => {
    
    // Phân loại mức cholesterol
    function getCholesterolLevel(chol) {
        chol = +chol;
        if (chol < 187) return "Thấp";
        else if (chol >= 187 && chol <= 262) return "Trung bình";
        else return "Cao";
    }

    // Phân loại dữ liệu theo mức cholesterol và giới tính
    data.forEach(d => {
        d.CholesterolLevel = getCholesterolLevel(d.Cholesterol);
    });

    // Nhóm dữ liệu theo giới tính và mức cholesterol
    const grouped = d3.rollup(data,
        v => ({
            Male: v.filter(d => d.Gender === "Male").length,
            Female: v.filter(d => d.Gender === "Female").length
        }),
        d => d.CholesterolLevel
    );

    const cholesterolLevels = ["Thấp", "Trung bình", "Cao"];
    const formattedData = cholesterolLevels.map(level => {
        const entry = grouped.get(level) || { Male: 0, Female: 0 };
        return {
            CholesterolLevel: level,
            Male: entry.Male,
            Female: entry.Female
        };
    });

    // Thiết lập scale cho trục X và trục Y
    const x = d3.scaleBand()
        .domain(cholesterolLevels)
        .range([0, width])
        .padding(0.3);

    const y = d3.scaleLinear()
        .domain([0, d3.max(formattedData, d => d.Male + d.Female)])
        .nice()
        .range([height, 0]);

    // Vẽ trục X và trục Y
    chart.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    chart.append("g")
        .call(d3.axisLeft(y));

    // Vẽ các cột
    chart.selectAll(".bar-group")
        .data(formattedData)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x(d.CholesterolLevel)},0)`)
        .each(function(d) {
            const g = d3.select(this);

            // Vẽ cột cho Nam
            g.append("rect")
                .attr("class", "bar-male")
                .attr("x", 0)
                .attr("y", y(d.Male + d.Female))
                .attr("width", x.bandwidth() / 2)  // Mỗi cột cho một giới tính
                .attr("height", height - y(d.Male))
                .attr("fill", "steelblue")  // Màu xanh dương cho nam
                .on("mouseover", () => tooltip6.style("visibility", "visible").text(`Nam: ${d.Male}`))
                .on("mousemove", (event) => {
                    tooltip1.style("top", `${event.pageY + 10}px`)
                           .style("left", `${event.pageX + 10}px`);
                })
                .on("mouseout", () => tooltip6.style("visibility", "hidden"));

            // Vẽ cột cho Nữ
            g.append("rect")
                .attr("class", "bar-female")
                .attr("x", x.bandwidth() / 2)  // Vị trí của cột nữ
                .attr("y", y(d.Female + d.Male))
                .attr("width", x.bandwidth() / 2)  // Mỗi cột cho một giới tính
                .attr("height", height - y(d.Female))
                .attr("fill", "orange")  // Màu cam cho nữ
                .on("mouseover", () => tooltip6.style("visibility", "visible").text(`Nữ: ${d.Female}`))
                .on("mousemove", (event) => {
                    tooltip1.style("top", `${event.pageY + 10}px`)
                           .style("left", `${event.pageX + 10}px`);
                })
                .on("mouseout", () => tooltip6.style("visibility", "hidden"));
        });

    // Thiết lập legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 20}, 20)`);

    // Legend cho nam
    legend.append("rect")
        .attr("x", -80)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "steelblue");

    legend.append("text")
        .attr("x", -60)
        .attr("y", 12)
        .text("Nam")
        .style("font-size", "13px");

    // Legend cho nữ
    legend.append("rect")
        .attr("x", -80)
        .attr("y", 20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "orange");

    legend.append("text")
        .attr("x", -60)
        .attr("y", 33)
        .text("Nữ")
        .style("font-size", "13px");

});
