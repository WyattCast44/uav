import UAV from "./UAV";
import UAVState from "./UAVState";

class UAVControls {
    constructor(public uav: UAV, public uavState: UAVState) {
        this.registerEventListeners();
    }

    public keys =  {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        Control: false, // for trimming
        Space: false, // for starting/stopping the simulation
    } as const;

    registerEventListeners() {
        window.addEventListener("keydown", this.handleKeyDown.bind(this));
        window.addEventListener("keyup", this.handleKeyUp.bind(this));
    }

    handleKeyDown(event: KeyboardEvent) {
        console.log("keydown", event.key);
    }

    handleKeyUp(event: KeyboardEvent) {
        console.log("keyup", event.key);
    }
}

export default UAVControls;
