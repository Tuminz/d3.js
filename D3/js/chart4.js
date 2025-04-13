// Tooltip
const tooltip4 = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "rgba(0, 0, 0, 0.7)")
    .style("color", "#fff")
    .style("padding", "5px 10px")
    .style("border-radius", "5px")
    .style("font-size", "14px")
    .style("visibility", "hidden");

// Kích thước biểu đồ rộng rãi hơn
const width4 = 700;
const height4 = 450;
const margin4 = { top: 30, right: 150, bottom: 60, left: 100 };

// SVG
const svg4 = d3.select("#svg4")
    .attr("width", width4)
    .attr("height", height4);

// Đọc dữ liệu từ file CSV
d3.csv("../data/project_heart_disease_cleaned.csv").then(data => {
    // Nhóm dữ liệu theo Exercise Habit và Heart Disease Status
    let groupedData = d3.rollup(data,
        v => ({
            NoDisease: v.filter(d => d["Heart Disease Status"] === "No").length,
            HasDisease: v.filter(d => d["Heart Disease Status"] === "Yes").length
        }),
        d => d["Exercise Habits"]
    );

    // Chuyển dữ liệu từ Map sang Array
    let formattedData = Array.from(groupedData, ([ExerciseHabit, values]) => ({
        ExerciseHabit,
        ...values
    }));

    // Scale cho trục X (Exercise Habit)
    const x = d3.scaleBand()
        .domain(formattedData.map(d => d.ExerciseHabit)) 
        .range([margin4.left, width4 - margin4.right])
        .padding(0.5);

    // Scale cho trục Y (Tổng số người)
    const y = d3.scaleLinear()
        .domain([0, d3.max(formattedData, d => d.NoDisease + d.HasDisease)])
        .nice()
        .range([height4 - margin4.bottom, margin4.top]);

    // Vẽ trục X
    svg4.append("g")
        .attr("transform", `translate(0,${height4 - margin4.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("class", "axis-label");

    // Vẽ trục Y
    svg4.append("g")
        .attr("transform", `translate(${margin4.left},0)`)
        .call(d3.axisLeft(y))
        .selectAll("text")
        .attr("class", "axis-label");

    // Nhãn trục X
    svg4.append("text")
        .attr("class", "axis-label")
        .attr("x", width4 / 2)
        .attr("y", height4 - 10)
        .attr("text-anchor", "middle")
        .text("Thói quen tập thể dục");

    // Nhãn trục Y
    svg4.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height4 / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .text("Số lượng người");

    // Vẽ cột chồng
    svg4.selectAll(".bar-group")
        .data(formattedData)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x(d.ExerciseHabit)},0)`)  // Sửa từ d.Exercise thành d.ExerciseHabit
        .each(function (d) {
            const g = d3.select(this);

            // Vẽ phần "Has Disease" (màu cam)
            g.append("rect")
                .attr("class", "bar-yes")
                .attr("x", 0)
                .attr("y", y(d.HasDisease))
                .attr("width", x.bandwidth())
                .attr("height", y(0) - y(d.HasDisease))
                .on("mouseover", function (event) {
                    tooltip4.style("visibility", "visible")
                        .text(`Has Disease: ${d.HasDisease}`);
                })
                .on("mousemove", function (event) {
                    tooltip4.style("top", `${event.pageY - 10}px`)
                        .style("left", `${event.pageX + 10}px`);
                })
                .on("mouseout", function () {
                    tooltip4.style("visibility", "hidden");
                });

            // Vẽ phần "No Disease" (màu xanh)
            g.append("rect")
                .attr("class", "bar-no")
                .attr("x", 0)
                .attr("y", y(d.NoDisease + d.HasDisease))
                .attr("width", x.bandwidth())
                .attr("height", y(0) - y(d.NoDisease))
                .on("mouseover", function (event) {
                    tooltip4.style("visibility", "visible")
                        .text(`No Disease: ${d.NoDisease}`);
                })
                .on("mousemove", function (event) {
                    tooltip4.style("top", `${event.pageY - 10}px`)
                        .style("left", `${event.pageX + 10}px`);
                })
                .on("mouseout", function () {
                    tooltip4.style("visibility", "hidden");
                });
        });

    // Thêm chú thích (Legend)
    const legend = svg4.append("g")
    .attr("transform", `translate(${width4 - 200}, ${margin4.top + 10})`);

    // Chú thích "Has Disease"
    legend.append("rect")
        .attr("class", "bar-yes")
        .attr("width", 20)
        .attr("height", 20)
        .attr("x", 0)        // Dời hình vuông sang phải (so với nhóm)
        .attr("y", 0);       // Dòng đầu

    legend.append("text")
        .attr("x", 30)       // Dời text ra xa khỏi rect
        .attr("y", 15)
        .text("Has Disease")
        .attr("class", "axis-label");

    // Chú thích "No Disease"
    legend.append("rect")
        .attr("class", "bar-no")
        .attr("width", 20)
        .attr("height", 20)
        .attr("x", 0)
        .attr("y", 30);      // Dòng dưới

    legend.append("text")
        .attr("x", 30)
        .attr("y", 45)
        .text("No Disease")
        .attr("class", "axis-label");

});
