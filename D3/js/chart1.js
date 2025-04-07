// Tạo tooltip (hộp hiển thị thông tin)
const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "rgba(0, 0, 0, 0.7)")
    .style("color", "#fff")
    .style("padding", "5px 10px")
    .style("border-radius", "5px")
    .style("font-size", "14px")
    .style("visibility", "hidden");

// Kích thước biểu đồ
const width = 600;
const height = 400;
const margin = { top: 20, right: 30, bottom: 50, left: 100 };

// Chọn thẻ SVG
const svg = d3.select("#svg1")
    .attr("width", width)
    .attr("height", height);

// Đọc dữ liệu từ file gốc
d3.csv("/data/project_heart_disease_cleaned.csv").then(data => {
    // Nhóm dữ liệu theo giới tính và trạng thái bệnh
    let groupedData = d3.rollup(data,
        v => ({
            NoDisease: v.filter(d => d["Heart Disease Status"] === "No").length,
            HasDisease: v.filter(d => d["Heart Disease Status"] === "Yes").length
        }),
        d => d.Gender
    );

    // Chuyển dữ liệu từ Map sang Array để dễ xử lý
    let formattedData = Array.from(groupedData, ([Gender, values]) => ({
        Gender,
        ...values
    }));

    // Scale cho trục X (Giới tính)
    const x = d3.scaleBand()
        .domain(formattedData.map(d => d.Gender))
        .range([margin.left, width - margin.right])
        .padding(0.5);

    // Scale cho trục Y (Tổng số người)
    const y = d3.scaleLinear()
        .domain([0, d3.max(formattedData, d => d.NoDisease + d.HasDisease)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // Vẽ trục X
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("class", "axis-label");

    // Vẽ trục Y
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .selectAll("text")
        .attr("class", "axis-label");

    // Vẽ cột chồng
    svg.selectAll(".bar-group")
        .data(formattedData)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x(d.Gender)},0)`)
        .each(function (d) {
            const g = d3.select(this);
            
        // Vẽ phần "Has Disease" (màu cam) trước
        g.append("rect")
            .attr("class", "bar-yes")
            .attr("x", 0)
            .attr("y", y(d.HasDisease))  // Giữ nguyên vị trí theo số người mắc bệnh
            .attr("width", x.bandwidth())
            .attr("height", y(0) - y(d.HasDisease)) // Đảm bảo chiều cao đúng
            .on("mouseover", function (event) {
                tooltip.style("visibility", "visible")
                    .text(`Has Disease: ${d.HasDisease}`);
            })
            .on("mousemove", function (event) {
                tooltip.style("top", `${event.pageY - 10}px`)
                    .style("left", `${event.pageX + 10}px`);
            })
            .on("mouseout", function () {
                tooltip.style("visibility", "hidden");
            });
        // Vẽ phần "No Disease" (màu xanh) chồng lên trên
        g.append("rect")
            .attr("class", "bar-no")
            .attr("x", 0)
            .attr("y", y(d.NoDisease + d.HasDisease)) // Đặt lên trên phần màu cam
            .attr("width", x.bandwidth())
            .attr("height", y(0) - y(d.NoDisease)) // Đảm bảo chiều cao đúng
            .on("mouseover", function (event) {
                tooltip.style("visibility", "visible")
                    .text(`No Disease: ${d.NoDisease}`);
            })
            .on("mousemove", function (event) {
                tooltip.style("top", `${event.pageY - 10}px`)
                    .style("left", `${event.pageX + 10}px`);
            })
            .on("mouseout", function () {
                tooltip.style("visibility", "hidden");
            });
        });

    // Thêm chú thích (Legend)
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 110}, ${margin.top})`);

    legend.append("rect").attr("class", "bar-no").attr("width", 20).attr("height", 20);
    legend.append("text").attr("x", 30).attr("y", 15).text("No Disease").attr("class", "axis-label");

    legend.append("rect").attr("class", "bar-yes").attr("width", 20).attr("height", 20).attr("y", 30);
    legend.append("text").attr("x", 30).attr("y", 45).text("Has Disease").attr("class", "axis-label");
});
