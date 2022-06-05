let pathChart, probabilityChart;
let nPath = 0;
let nStep = 0;
let delayBetweenPoints;
let totalSteps = 50;
let totalPaths;
let down = false;

const elHeader = document.querySelector("header");

const elRangeInput = document.querySelector("#step-input");
const elRangeOutput = document.querySelector("#rangeoutput");
const elPathSelect = document.querySelector("#path-select");

const elTotalPaths = document.querySelector("#total-paths");
const elPathSimulated = document.querySelector("#path-simulated");

const elPathChart = document.querySelector("#path-chart");
const elProbabilityChart = document.querySelector("#probability-chart");

window.onload = newRandomWalk;
window.onscroll = headerShadow;

async function newRandomWalk() {
  let steps = [0].concat(
    Array.from({ length: totalSteps }, () => (Math.random() < 0.5 ? -1 : 1))
  );
  let walk = steps.reduce(
    (acc, step) => [...acc, (acc.at(-1) ?? 0) + step],
    []
  );

  if (!pathChart) {
    createChart(walk);
  } else {
    updateChart(pathChart, walk);
  }
}

function createChart(walk) {
  const totalDuration = 2000;
  delayBetweenPoints = totalDuration / walk.length;

  const previousY = (ctx) =>
    ctx.index === 0
      ? ctx.chart.scales.y.getPixelForValue(100)
      : ctx.chart
          .getDatasetMeta(ctx.datasetIndex)
          .data[ctx.index - 1].getProps(["y"], true).y;

  const animation = {
    x: {
      type: "number",
      easing: "linear",
      duration: delayBetweenPoints,
      from: NaN, // the point is initially skipped
      delay(ctx) {
        if (ctx.type !== "data" || ctx.xStarted) {
          return 0;
        }
        ctx.xStarted = true;
        return ctx.index * delayBetweenPoints;
      },
    },
    y: {
      type: "number",
      easing: "linear",
      duration: delayBetweenPoints,
      from: previousY,
      delay(ctx) {
        if (ctx.type !== "data" || ctx.yStarted) {
          return 0;
        }
        ctx.yStarted = true;
        return ctx.index * delayBetweenPoints;
      },
    },
  };

  const chartData = {
    labels: Array.from({ length: walk.length }, (_, i) => i),
    datasets: [
      {
        borderColor: "#00112899",
        data: walk,
        pointRadius: 0,
        borderWidth: 3,
        pointHitRadius: 4,
      },
    ],
  };

  const config = {
    type: "line",
    data: chartData,
    options: {
      plugins: {
        legend: {
          display: false,
        },
      },
      maintainAspectRatio: false,
      animation,
    },
  };

  pathChart = new Chart(elPathChart, config);
  probabilityChart = new Chart(elProbabilityChart, {
    type: "bar",
    data: {
      labels: ["-4", "-3", "-2", "-1", "0", "1", "2", "3", "4"],
      datasets: [
        {
          data: [0, 0, 0.25, 0, 0.5, 0, 0.25, 0, 0],
          label: "Probabilidade teórica",
          order: 2,
          borderColor: "#d1d1d1",
          backgroundColor: "#e0e0e0",
          barPercentage: 0.9,
          borderWidth: 1,
          borderRadius: 2,
        },
        {
          data: [0, 0, 0.2, 0, 0.35, 0, 0.45, 0, 0],
          label: "Proporção simulada",
          order: 1,
          //borderColor: "#128fc8",
          backgroundColor: "#128fc8",
          barPercentage: 0.5,
          borderRadius: 3,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
          title: {
            display: true,
            text: "Posição Final",
          },
          grid: {
            display: false,
          },
        },
        y: {
          stacked: false,
          ticks: {
            beginAtZero: true,
          },
          max: 0.6,
        },
      },
    },
  });
}

function updateChart(chart, data) {
  chart.data.datasets[nPath].pointRadius = 0;
  chart.data.datasets[nPath].borderWidth = 2;
  chart.data.datasets[nPath].borderColor = "#00112822";
  chart.data.datasets[nPath].pointHitRadius = 0;

  const newDataset = {
    borderColor: "#00112899",
    data: data,
    pointRadius: 0,
    borderWidth: 3,
    pointHitRadius: 4,
  };

  elPathSimulated.innerHTML = ++nPath + 1;
  chart.data.datasets[nPath] = newDataset;
  chart.update();
}

function headerShadow() {
  if (window.scrollY > 0) {
    elHeader.classList.add("small");
  } else {
    elHeader.classList.remove("small");
  }
}

elRangeInput.addEventListener("input", (e) => {
  let target = e.target;
  const min = target.min;
  const max = target.max;
  const val = target.value;

  const percent = ((val - min) * 100) / (max - min);

  target.style.backgroundSize = 100 - percent + "% 100%";

  if (percent < 50) {
    elRangeOutput.style.left =
      "calc( " + percent + "% + " + 16 * ((50 - percent) / 100) + "px)";
  } else {
    elRangeOutput.style.left =
      "calc( " + percent + "% - " + 16 * ((percent - 50) / 100) + "px)";
  }
  elRangeOutput.value = e.target.value;
});

elRangeInput.addEventListener("mousedown", () => {
  down = true;
  elRangeOutput.classList.add("visible");
});

elRangeInput.addEventListener("mousemove", () => {
  if (!down) return;
});

elRangeInput.addEventListener("mouseup", (e) => {
  down = false;
  totalSteps = e.target.value;
  nStep = 0;
  setTimeout(() => elRangeOutput.classList.remove("visible"), 500);
});

elPathSelect.addEventListener("change", (e) => {
  totalPaths = e.target.value;
  nPath = 0;
  nStep = 0;
  elTotalPaths.innerHTML = totalPaths;
  elPathSimulated.innerHTML = nPath;
});
