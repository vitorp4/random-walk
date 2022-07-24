let pathChart, probabilityChart;
let nPath = 0;
let totalSteps = 10;
let totalPaths = 10;
let lastPositionsCounter = Array.from({ length: totalSteps + 1 }, () => 0);
let interval;
let paths;
let walks;
let baseDelay = 500; // miliseconds
let velocityFactor = 1;
const velocityFactorLimits = {
  min: 0.25,
  max: 8,
};
let state = "SE"; // SE - simuation executing, SP - simulation paused, SF - simulation finished

const elHeader = document.querySelector("header");

const elRangeInput = document.querySelector("#step-input");
const elRangeOutput = document.querySelector("#range-output");
const elPathSelect = document.querySelector("#path-select");

const elPathChart = document.querySelector("#path-chart");
const elProbabilityChart = document.querySelector("#probability-chart");

window.onscroll = () => {
  headerShadow();
  asideHighlight();
  stopSimulationOnScroll();
};

window.onload = () => { 
  headerShadow();
  asideHighlight();
  initializeSimulation();
}

async function initializeSimulation(newData = true) {
  toState("SE");
  nPath = 0;

  if (newData) {
    paths = Array.from({ length: totalPaths }, () =>
      [0].concat(
        Array.from({ length: totalSteps }, () => (Math.random() < 0.5 ? -1 : 1))
      )
    );

    walks = paths.map((steps) =>
      steps.reduce((acc, step) => [...acc, (acc.at(-1) ?? 0) + step], [])
    );
  }

  createCharts();
  executeSimulation();
}

function executeSimulation() {
  interval = setInterval(() => {
    updatePathChart(pathChart, walks[nPath]);
    updateProbabilityChart(probabilityChart, walks[nPath]);
    nPath++;

    if (nPath == totalPaths) {
      clearInterval(interval);
      toState("SF");
    }
  }, baseDelay / velocityFactor);
}

function createCharts() {
  createPathChart();
  createProbabilityChart();
}

function createPathChart() {
  if (pathChart) {
    clearInterval(interval);
    pathChart.destroy();
  }

  const chartData = {
    labels: Array.from({ length: toLabel(totalSteps).length }, (_, i) => i),
  };

  const config = {
    type: "line",
    data: chartData,
    options: {
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          font: {
            size: 14,
            weight: 400,
          },
        },
        annotations: {},
      },
      scales: {
        y: {
          min: -totalSteps,
          max: totalSteps,
          grid: {
            color: "#00000010",
          },
          title: {
            display: false,
            text: 'Posição'
          }
        },
        x: {
          grid: {
            color: "#00000010",
          },
          title: {
            display: true,
            text: 'Passos'
          }
        },
      },
      maintainAspectRatio: false,
      animation: false,
    },
  };

  pathChart = new Chart(elPathChart, config);
}

function createProbabilityChart() {
  if (probabilityChart) {
    probabilityChart.destroy();
    lastPositionsCounter = Array.from({ length: totalSteps + 1 }, () => 0);
  }

  console.log({labels:toLabel(totalSteps), probs: toProbabilities(totalSteps)})

  const data = {
    labels: toLabel(totalSteps),
    datasets: [
      {
        data: toProbabilities(totalSteps),
        label: "Probabilidade",
        order: 2,
        borderColor: "#00112833",
        backgroundColor: "#00112811",
        barPercentage: 1,
        borderWidth: 1,
        borderRadius: 2,
      },
      {
        data: lastPositionsCounter,
        label: "Frequência relativa",
        order: 1,
        backgroundColor: "#128fc8",
        barPercentage: 0.5,
        borderRadius: 2,
      },
    ],
  };

  const config = {
    type: "bar",
    data: data,
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            boxWidth: 20,
          },
        },
      },
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
          ticks: {
            minRotation: 0,
            maxRotation: 0,
          },
        },
        y: {
          stacked: false,
          ticks: {
            beginAtZero: true,
          },
          grid: {
            color: "#00000010",
          },
        },
      },
    },
  };

  probabilityChart = new Chart(elProbabilityChart, config);
}

function updatePathChart(chart, data) {
  const newDataset = {
    borderColor: "#128fc8",
    data: data,
    pointRadius: 2,
    borderWidth: 3,
    pointHitRadius: 0,
    fill: {
      target: "origin",
      below: "#00112811",
      above: "#00112811",
    },
  };
  chart.options.plugins.title.text = `Caminho: ${nPath + 1}/${totalPaths}`;
  chart.data.datasets[0] = newDataset;

  const newLabelAnnotation = {
    annotations: {
      label1: {
        type: "label",
        xValue: totalSteps,
        xAdjust: -10,
        yValue: data[data.length - 1],
        yAdjust: data[data.length - 1] == totalSteps ? 15 : -15,
        content: [data[data.length - 1]],
        color: "#128fc8",
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
  };
  chart.options.plugins.annotation = newLabelAnnotation;
  chart.update();
}

function updateProbabilityChart(chart, walk) {
  let lastPosition = walk[walk.length - 1];
  let labels = toLabel(totalSteps);
  let idx = labels.findIndex((i) => i == lastPosition);

  lastPositionsCounter[idx] += 1;

  chart.data.datasets[1].data = lastPositionsCounter.map(
    (b) => b / (nPath + 1)
  );
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

elRangeInput.addEventListener("mouseup", (e) => {
  totalSteps = +e.target.value;
  initializeSimulation();
});

elRangeInput.addEventListener("touchend", (e) => {
  totalSteps = +e.target.value;
  initializeSimulation();
});

elPathSelect.addEventListener("change", (e) => {
  totalPaths = +e.target.value;
  initializeSimulation();
});

function pascalTriangle(steps) {
  var arr = [];
  var a;
  for (let i = 0; i <= steps; i++) {
    a = [];
    for (let j = 0; j <= i; j++) {
      if (j == 0 || i == j) {
        a.push(1);
      } else {
        a.push(arr[i - 1][j - 1] + arr[i - 1][j]);
      }
    }
    arr.push(a);
  }
  return arr[arr.length - 1];
}

function toProbabilities(steps) {
  let pascalCoeficients = pascalTriangle(steps);
  let sum = pascalCoeficients.reduce((acc, num) => (acc += num), 0);
  return pascalCoeficients.map((a) => a / sum);
}

function toLabel(steps) {
  let labels = [];
  for (let i = -steps; i <= steps; i += 2) labels.push(i);
  return labels;
}

function velocityChangeMsg(parentElement) {
  let elVelocityChangeMsg = document.createElement("div");
  elVelocityChangeMsg.setAttribute("class", "velocity-change-msg");
  elVelocityChangeMsg.innerHTML = velocityFactor + "x";
  parentElement.appendChild(elVelocityChangeMsg);
  setTimeout(() => elVelocityChangeMsg.remove(), 2000);
}

function speedUp() {
  if (velocityFactor * 2 <= velocityFactorLimits.max) {
    clearInterval(interval);
    velocityFactor *= 2;
    executeSimulation();
    velocityChangeMsg(elSpeedUp);
  }


  if (velocityFactor == velocityFactorLimits.max) {
    elSpeedUp.disabled = true;
  }

  if (elSlowDown.disabled) {
    elSlowDown.disabled = false;
  }
}

function slowDown() {
  if (velocityFactor / 2 >= velocityFactorLimits.min) {
    clearInterval(interval);
    velocityFactor /= 2;
    executeSimulation();
    velocityChangeMsg(elSlowDown);
  }

  if (velocityFactor == velocityFactorLimits.min) {
    elSlowDown.disabled = true;
  }

  if (elSpeedUp.disabled) {
    elSpeedUp.disabled = false;
  }
}

function restart() {
  initializeSimulation(false);
  toState("SE");
}

function playToggle() {
  if (elPlayPause.classList.contains("pause")) {
    clearInterval(interval);
    toState("SP");
  } else {
    executeSimulation();
    toState("SE");
  }
}

function stopSimulationOnScroll() {
  if (window.scrollY > window.innerHeight && state == 'SE') {
    clearInterval(interval);
    toState("SP");
  }
}

const elPlayPause = document.querySelector("#play-pause");
const elSlowDown = document.querySelector("#slow-down");
const elSpeedUp = document.querySelector("#speed-up");
const elRestartSimulation = document.querySelector("#restart-simulation");
const elNewSimulation = document.querySelector("#new-simulation");

function toState(toState) {
  switch (toState) {
    case "SE":
      elPlayPause.classList.add("pause");
      elPlayPause.disabled = false;
      if (velocityFactor != velocityFactorLimits.max) {
        elSpeedUp.disabled = false;
      }
      if (velocityFactor != velocityFactorLimits.min) {
        elSlowDown.disabled = false;
      }
      elRestartSimulation.disabled = false;
      elNewSimulation.disabled = false;
      state = "SE";
      break;
    case "SP":
      elPlayPause.classList.remove("pause");
      elPlayPause.disabled = false;
      elSlowDown.disabled = true;
      elSpeedUp.disabled = true;
      elRestartSimulation.disabled = false;
      elNewSimulation.disabled = false;
      state = "SP";
      break;
    case "SF":
      elPlayPause.classList.remove("pause");
      elPlayPause.disabled = true;
      elSlowDown.disabled = true;
      elSpeedUp.disabled = true;
      elRestartSimulation.disabled = false;
      elNewSimulation.disabled = false;
      state = "SF";
      break;
  }
}


const asideLinks = document.querySelectorAll("aside a");
const articleHeadings = document.querySelectorAll(
  ".article-content h2[id], .article-content h3[id]"
);

function asideHighlight() {
  const articleHeadingsList = [...articleHeadings];
  const asideLinksList = [...asideLinks];

  const headingsScrolled = articleHeadingsList
    .filter((el) => el.getBoundingClientRect().top < 100)
    .map((el) => el.id);

  asideLinksList.forEach((el) => {
    if (headingsScrolled.includes(el.getAttribute("href").slice(1))) {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
  });
}

document.querySelector('.hamburger').addEventListener('click', () => {
  if (state === 'SE') {
    clearInterval(interval);
    toState("SP");
  }
  document.querySelector('.toolbar').classList.toggle('active');
})

document.querySelector('.toolbar nav').addEventListener('click', () => {
  document.querySelector('.toolbar').classList.remove('active');
})
