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
const margin6 = { top: 50, right: 40, bottom: 50, left: 60 },
      width6 = 700 - margin6.left - margin6.right,
      height6 = 450 - margin6.top - margin6.bottom;

const svg6 = d3.select("#svg6")
    .attr("width", width6 + margin6.left + margin6.right)
    .attr("height", height6 + margin6.top + margin6.bottom);

const chart6 = svg6.append("g")
    .attr("transform", `translate(${margin6.left},${margin6.top})`);

// Đọc dữ liệu từ file CSV
d3.csv("/data/project_heart_disease_cleaned.csv").then(data => {

    // Hàm phân loại Cholesterol
    function getCholesterolLevel(chol) {
        chol = +chol;
        if (chol < 187) return "Thấp";
        else if (chol <= 262) return "Trung bình";
        else return "Cao";
    }

    data.forEach(d => {
        d.CholesterolLevelGroup = getCholesterolLevel(d["Cholesterol Level"]);
    });

    // Gom nhóm theo CholesterolLevelGroup và giới tính
    const grouped = d3.rollup(data,
        v => ({
            Male: v.filter(d => d.Gender === "Male").length,
            Female: v.filter(d => d.Gender === "Female").length
        }),
        d => d.CholesterolLevelGroup
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

    // Trục x và y
    const x6 = d3.scaleBand()
        .domain(cholesterolLevels)
        .range([0, width6])
        .padding(0.3);

    const y6 = d3.scaleLinear()
        .domain([0, d3.max(formattedData, d => d.Male + d.Female)])
        .nice()
        .range([height6, 0]);

    chart6.append("g")
        .attr("transform", `translate(0, ${height6})`)
        .call(d3.axisBottom(x6));

    chart6.append("g")
        .call(d3.axisLeft(y6));

    // Vẽ cột chồng
    chart6.selectAll(".bar-group")
        .data(formattedData)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x6(d.CholesterolLevel)},0)`)
        .each(function(d) {
            const g = d3.select(this);

            // Nam
            g.append("rect")
                .attr("x", 0)
                .attr("y", y6(d.Male))
                .attr("width", x6.bandwidth())
                .attr("height", height6 - y6(d.Male))
                .attr("fill", "steelblue")
                .on("mouseover", () => tooltip6.style("visibility", "visible").text(`Nam: ${d.Male}`))
                .on("mousemove", (event) => {
                    tooltip6.style("top", `${event.pageY + 10}px`)
                            .style("left", `${event.pageX + 10}px`);
                })
                .on("mouseout", () => tooltip6.style("visibility", "hidden"));

            // Nữ (vẽ chồng lên Nam)
            g.append("rect")
                .attr("x", 0)
                .attr("y", y6(d.Male + d.Female))
                .attr("width", x6.bandwidth())
                .attr("height", height6 - y6(d.Female))
                .attr("fill", "orange")
                .on("mouseover", () => tooltip6.style("visibility", "visible").text(`Nữ: ${d.Female}`))
                .on("mousemove", (event) => {
                    tooltip6.style("top", `${event.pageY + 10}px`)
                            .style("left", `${event.pageX + 10}px`);
                })
                .on("mouseout", () => tooltip6.style("visibility", "hidden"));
        });

    // Chú thích
    const legend6 = svg6.append("g")
        .attr("transform", `translate(${width6 + margin6.left - 80}, 20)`);

    legend6.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "steelblue");

    legend6.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text("Nam")
        .style("font-size", "13px");

    legend6.append("rect")
        .attr("y", 20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "orange");

    legend6.append("text")
        .attr("x", 20)
        .attr("y", 33)
        .text("Nữ")
        .style("font-size", "13px");

    // Thêm tên trục Y
    chart6.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin6.left  + 30)
        .attr("x", -height6 / 2)
        .attr("dy", "-1em")
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Số lượng người");

    // Thêm tên trục X
    chart6.append("text")
        .attr("x", width6 / 2)
        .attr("y", height6 + margin6.bottom - 5)
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Mức Cholesterol");
});
