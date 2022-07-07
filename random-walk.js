export default class RandomWalk {
  constructor(totalPaths, totalSteps) {
    this.totalPaths = totalPaths;
    this.totalSteps = totalSteps; 
  }

  newData() {
    this.randomSteps = Array.from({ length: totalPaths }, () =>
      [0].concat(
        Array.from({ length: totalSteps }, () => (Math.random() < 0.5 ? -1 : 1))
      )
    );

    this.paths = randomSteps.map((steps) =>
      steps.reduce((acc, step) => [...acc, (acc.at(-1) ?? 0) + step], [])
    );
  }

  getLabels() {
    let labels = [];
    for (let i = -this.totalSteps; i <= this.totalSteps; i += 2) 
      labels.push(i);
    return labels;
  }

  getPath(n) {
    return this.paths[n];
  }


}
