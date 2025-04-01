import { Degrees } from "../support";
import UAV from "./UAV";
import UAVState from "./UAVState";

class UAVCommandedAttitude {
    constructor(public uav: UAV, public state: UAVState) {}

    pitchUp(amount: number | Degrees) { 
        let gamma = amount instanceof Degrees ? amount.degrees : amount;

        let clampedGamma = this.#clampGamma(gamma);

        this.state.gamma = clampedGamma;
    }

    pitchDown(amount: number | Degrees) {
        let gamma = amount instanceof Degrees ? amount.degrees : amount;

        let clampedGamma = this.#clampGamma(-gamma);

        this.state.gamma = clampedGamma;
    }

    #clampGamma(gamma: number,): Degrees {
        let commandedGamma = this.state.gamma.degrees + gamma;

        if (commandedGamma > this.uav.limits.maxGamma.degrees) {
            gamma = this.uav.limits.maxGamma.degrees;
        } else if(commandedGamma < -this.uav.limits.maxGamma.degrees) {
            gamma = -this.uav.limits.maxGamma.degrees;
        } else {
            gamma = commandedGamma;
        }

        return new Degrees(gamma);
    }
}

export default UAVCommandedAttitude;

