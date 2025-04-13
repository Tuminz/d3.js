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

const margin1 = { top: 50, right: 40, bottom: 50, left: 60 },
      width1 = 700 - margin1.left - margin1.right,
      height1 = 450 - margin1.top - margin1.bottom;

const svg1 = d3.select("#svg1")
    .attr("width", width1 + margin1.left + margin1.right)
    .attr("height", height1 + margin1.top + margin1.bottom);

const chart1 = svg1.append("g")
    .attr("transform", `translate(${margin1.left},${margin1.top})`);

d3.csv("/data/project_heart_disease_cleaned.csv").then(data => {
    function getAgeGroup1(age) {
        age = +age;
        if (age <= 18) return "0-18";
        else if (age <= 35) return "19-35";
        else if (age <= 65) return "36-65";
        else return "66+";
    }

    data.forEach(d => {
        d.AgeGroup1 = getAgeGroup1(d.Age);
    });

    const grouped1 = d3.rollup(data,
        v => ({
            No1: v.filter(d => d["Heart Disease Status"] === "No").length,
            Yes1: v.filter(d => d["Heart Disease Status"] === "Yes").length
        }),
        d => d.AgeGroup1
    );

    const ageOrder1 = ["0-18", "19-35", "36-65", "66+"];
    const formattedData1 = ageOrder1.map(group => {
        const entry = grouped1.get(group) || { No1: 0, Yes1: 0 };
        return {
            AgeGroup1: group,
            No1: entry.No1,
            Yes1: entry.Yes1
        };
    });

    // Tạo color scale cho các cột
    const colorScale = d3.scaleOrdinal()
        .domain(["No", "Yes"])  // Tên của các loại "No" và "Yes"
        .range(["orange", "steelblue"]);  // Màu của các thanh

    // Scale
    const x1 = d3.scaleBand()
        .domain(ageOrder1)
        .range([0, width1])
        .padding(0.3);

    const y1 = d3.scaleLinear()
        .domain([0, d3.max(formattedData1, d => d.No1 + d.Yes1)])
        .nice()
        .range([height1, 0]);

    // Axis
    chart1.append("g")
        .attr("transform", `translate(0, ${height1})`)
        .call(d3.axisBottom(x1));

    chart1.append("g")
        .call(d3.axisLeft(y1));

    // Bars
    chart1.selectAll(".bar-group1")
        .data(formattedData1)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x1(d.AgeGroup1)},0)`)
        .each(function(d) {
            const g1 = d3.select(this);
            
            // Has Disease
            g1.append("rect")
                .attr("class", "bar-yes1")
                .attr("x", 0)
                .attr("y", y1(d.Yes1)) // Y vị trí cho "Has Disease"
                .attr("width", x1.bandwidth())
                .attr("height", height1 - y1(d.Yes1)) // Chiều cao cho "Has Disease"
                .attr("fill", colorScale("Yes"))  // Đổi màu thanh "Has Disease"
                .on("mouseover", (event) => {
                    tooltip1.style("visibility", "visible")
                        .text(`Has Disease: ${d.Yes1}`);
                })
                .on("mousemove", (event) => {
                    tooltip1.style("top", `${event.pageY + 10}px`)
                           .style("left", `${event.pageX + 10}px`);
                })
                .on("mouseout", () => tooltip1.style("visibility", "hidden"));

            // No Disease
            g1.append("rect")
                .attr("class", "bar-no1")
                .attr("x", 0)
                .attr("y", y1(d.Yes1 + d.No1)) // Y vị trí cho "No Disease"
                .attr("width", x1.bandwidth())
                .attr("height", height1 - y1(d.No1)) // Chiều cao cho "No Disease"
                .attr("fill", colorScale("No"))  // Đổi màu thanh "No Disease"
                .on("mouseover", (event) => {
                    tooltip1.style("visibility", "visible")
                        .text(`No Disease: ${d.No1}`);
                })
                .on("mousemove", (event) => {
                    tooltip1.style("top", `${event.pageY + 10}px`)
                           .style("left", `${event.pageX + 10}px`);
                })
                .on("mouseout", () => tooltip1.style("visibility", "hidden"));
        });

    // Legend
    const legend1 = svg1.append("g")
        .attr("transform", `translate(${width1 - 20}, 20)`);

    legend1.append("rect")
        .attr("x", -80)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "orange");

    legend1.append("text")
        .attr("x", -60)
        .attr("y", 33)
        .text("No Disease")
        .style("font-size", "13px");

    legend1.append("rect")
        .attr("x", -80)
        .attr("y", 20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "steelblue");

    legend1.append("text")
        .attr("x", -60)
        .attr("y", 12)
        .text("Has Disease")
        .style("font-size", "13px");

    chart1.append("g")
        .call(d3.axisLeft(y1).ticks(5))  // Hiện các ticks trên trục Y
        .append("text")  // Thêm tên cho trục Y
        .attr("transform", "rotate(-90)")  // Xoay chữ để nó đứng
        .attr("y", -50)  // Đặt vị trí chữ
        .attr("x", -height1 / 2)
        .style("text-anchor", "middle")
        .text("Số lượng người")  // Tên cột Y là "Số lượng người"
        .style("font-size", "14px")
        .style("fill", "#333");

    svg1.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", width1 / 1)
        .attr("y", height1 + margin1.bottom + 30)
        .text("Tuổi");
});
