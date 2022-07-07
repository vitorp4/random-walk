import { RandomWalk } from './random-walk.js';
import { Ob }

export default class Simulator {
  constructor(totalSteps, totalPaths, baseDelay, minVelocity, maxVelocity) {
    this.state = "SE";
    this.activePath = 0;
    this.randomWalk = new RandomWalk(totalPaths, totalSteps);
  }

  get state() {
    return this.state; 
  }

  get activePath() {
    return this.activePath;
  }


}