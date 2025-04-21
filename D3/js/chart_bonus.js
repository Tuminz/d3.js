const margin7 = { top: 80, right: 100, bottom: 50, left: 200 },
      width7 = 700 - margin7.left - margin7.right,
      height7 = 450 - margin7.top - margin7.bottom;

const svg7 = d3.select("#svg7")
  .attr("width", width7 + margin7.left + margin7.right)
  .attr("height", height7 + margin7.top + margin7.bottom)
  .append("g")
  .attr("transform", `translate(${margin7.left},${margin7.top})`);

function getAgeGroup(age) {
    if (age <= 18) return "0-18";
    else if (age <= 35) return "19-35";
    else if (age <= 65) return "36-65";
    else return "66+";
}

d3.csv("/data/project_heart_disease_cleaned.csv").then(data => {
  // Chuẩn hóa kiểu dữ liệu
  data.forEach(d => {
    d.age = +d.Age;
    d.heart_disease = d["Heart Disease Status"] === "Yes" ? 1 : 0;
    d.AgeGroup = getAgeGroup(d.age);
  });

  // Các yếu tố lối sống cần xét
  const factors = [
    { field: "Smoking", prefix: "Smoking-" },
    { field: "Alcohol Consumption", prefix: "Alcohol Consumption-" },
    { field: "Exercise Habits", prefix: "Exercise Habits-" }
  ];

  let processed = [];

  factors.forEach(factor => {
    const values = Array.from(new Set(data.map(d => d[factor.field])));
    values.forEach(value => {
      const label = `${factor.prefix}${value}`;

      ["0-18", "19-35", "36-65", "66+"].forEach(ageGroup => {
        const subset = data.filter(d => d[factor.field] === value && d.AgeGroup === ageGroup);
        const rate = subset.length > 0
          ? (d3.mean(subset, d => d.heart_disease)).toFixed(2)
          : null;

        if (rate !== null) {
          processed.push({
            Lifestyle: label,
            AgeGroup: ageGroup,
            HeartDiseaseRate: +rate
          });
        }
      });
    });
  });

  // Trục
  const ageGroups = ["0-18", "19-35", "36-65", "66+"];
  const lifestyleLabels = Array.from(new Set(processed.map(d => d.Lifestyle)));

  const x7 = d3.scaleBand()
    .range([0, width7])
    .domain(ageGroups)
    .padding(0.05);

  const y7 = d3.scaleBand()
    .range([0, height7])
    .domain(lifestyleLabels)
    .padding(0.05);

  const color = d3.scaleSequential()
    .interpolator(d3.interpolateReds)
    .domain([0.17, 0.28]);

  svg7.append("g")
    .call(d3.axisTop(x7))
    .selectAll("text")
    .style("text-anchor", "middle");

  svg7.append("g")
    .call(d3.axisLeft(y7));

  svg7.selectAll()
    .data(processed)
    .enter()
    .append("rect")
    .attr("x", d => x7(d.AgeGroup))
    .attr("y", d => y7(d.Lifestyle))
    .attr("width", x7.bandwidth())
    .attr("height", y7.bandwidth())
    .style("fill", d => color(d.HeartDiseaseRate));

  svg7.selectAll()
    .data(processed)
    .enter()
    .append("text")
    .text(d => d.HeartDiseaseRate)
    .attr("x", d => x7(d.AgeGroup) + x7.bandwidth() / 2)
    .attr("y", d => y7(d.Lifestyle) + y7.bandwidth() / 2 + 5)
    .attr("text-anchor", "middle")
    .style("fill", "#000");

  // ===== THÊM LEGEND DỌC =====
  const defs = svg7.append("defs");
  const gradient = defs.append("linearGradient")
    .attr("id", "legend-gradient")
    .attr("x1", "0%")
    .attr("y1", "100%")
    .attr("x2", "0%")
    .attr("y2", "0%");

  const legendSteps = d3.range(0, 1.01, 0.1);
  legendSteps.forEach(t => {
    gradient.append("stop")
      .attr("offset", `${t * 100}%`)
      .attr("stop-color", color(color.domain()[0] + t * (color.domain()[1] - color.domain()[0])));
  });

  const legendHeight = height7;
  svg7.append("rect")
    .attr("x", width7 + 30)
    .attr("y", 0)
    .attr("width", 20)
    .attr("height", legendHeight)
    .style("fill", "url(#legend-gradient)");

  const legendScale = d3.scaleLinear()
    .domain(color.domain())
    .range([legendHeight, 0]);

  const legendAxis = d3.axisRight(legendScale)
    .tickValues(legendSteps.map(t => +(color.domain()[0] + t * (color.domain()[1] - color.domain()[0])).toFixed(2)))
    .tickFormat(d3.format(".2f"));

  svg7.append("g")
    .attr("transform", `translate(${width7 + 50}, 0)`)
    .call(legendAxis);
});
