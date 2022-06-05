let myChart, myChart2;
let nChart = 0;

window.onload = newRandomWalk;

async function newRandomWalk() {
  let steps = [0].concat(
    Array.from({ length: 100 }, () => (Math.random() < 0.5 ? -1 : 1))
  );
  let walk = steps.reduce(
    (acc, step) => [...acc, (acc.at(-1) ?? 0) + step],
    []
  );

  if (!myChart) {
    createChart(walk);
  } else {
    //   myChart.destroy();
    updateChart(myChart, walk);
  }
}

function createChart(walk) {
  const totalDuration = 2000;
  const delayBetweenPoints = totalDuration / walk.length;

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
        pointHitRadius: 4
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

  myChart = new Chart(document.getElementById("path-chart"), config);
  myChart2 = new Chart(document.getElementById("probability-chart"), {
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
  const dataset = {
    borderColor: "#00112899",
    data: data,
    pointRadius: 0,
    borderWidth: 3,
    pointHitRadius: 4
  };

  chart.data.datasets[nChart].pointRadius = 0;
  chart.data.datasets[nChart].borderWidth = 2;
  chart.data.datasets[nChart].borderColor = "#00112822";
  chart.data.datasets[nChart].pointHitRadius = 0;

  chart.data.datasets[++nChart] = dataset;
  chart.update();
}

function newSummarizeChart() {}

window.onscroll = headerShadow;

function headerShadow() {
  let header = document.querySelector("header");
  if (window.scrollY > 0) {
    header.classList.add("small");
  } else {
    header.classList.remove("small");
  }
}

const rangeInput = document.querySelector("#step-input");
const rangeOutput = document.querySelector("#rangeoutput");

function handleInputChange(e) {
  let target = e.target;
  const min = target.min;
  const max = target.max;
  const val = target.value;

  const percent = ((val - min) * 100) / (max - min);

  target.style.backgroundSize =
    (100 - percent) + "% 100%";

  rangeOutput.style.left = percent + '%';
  rangeOutput.value = e.target.value;  
}

let down = false;
rangeInput.addEventListener("input", handleInputChange);
rangeInput.addEventListener('mousedown', () => {
  down = true;
  rangeOutput.classList.add('visible');
});
rangeInput.addEventListener('mousemove', () => {
  if (!down) return;
});
rangeInput.addEventListener('mouseup', () => {
  down = false;
  setTimeout(()=>rangeOutput.classList.remove('visible'),500);
})