import UAV from "../UAV";

class KeyboardUAVController {

  public keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    Control: false,
    Shift: false,
  };

  public commands = {
    pitchUp: false,
    pitchDown: false,
    rollLeft: false,
    rollRight: false, 
    trim: false,
    throttleUp: false,
    throttleDown: false,
  }

  constructor(public uav: UAV) {
    this.registerEventListeners();
  }

  registerEventListeners() {  
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("keyup", this.handleKeyUp.bind(this));
    window.addEventListener("beforeunload", this.unregisterEventListeners.bind(this));
  }

  handleKeyDown(event: KeyboardEvent) {
    if(event.key === "Control") {
      this.keys.Control = true;
      this.commands.trim = true;
    } else if(event.key === "ArrowUp") {
      this.keys.ArrowUp = true;
      this.commands.pitchUp = true;
    } else if(event.key === "ArrowDown") {
      this.keys.ArrowDown = true;
      this.commands.pitchDown = true;
    } else if(event.key === "ArrowLeft") {
      this.keys.ArrowLeft = true;
      this.commands.rollLeft = true;
    } else if(event.key === "ArrowRight") {
      this.keys.ArrowRight = true;
      this.commands.rollRight = true;
    } else if(event.key === "Shift") {
      this.keys.Shift = true;
    }

    if(this.keys.Shift && this.keys.ArrowUp) {
      this.commands.throttleUp = true;
      this.commands.throttleDown = false;
      this.commands.pitchUp = false;
      this.commands.pitchDown = false;
    } else if(this.keys.Shift && this.keys.ArrowDown) {
      this.commands.throttleDown = true;
      this.commands.throttleUp = false;
      this.commands.pitchUp = false;
      this.commands.pitchDown = false;
    }
  }

  handleKeyUp(event: KeyboardEvent) {
    if(event.key === "Control") {
      this.keys.Control = false;
      this.commands.trim = false;
    } else if(event.key === "ArrowUp") {
      this.keys.ArrowUp = false;
      this.commands.pitchUp = false;
    } else if(event.key === "ArrowDown") {
      this.keys.ArrowDown = false;
      this.commands.pitchDown = false;
    } else if(event.key === "ArrowLeft") {
      this.keys.ArrowLeft = false;
      this.commands.rollLeft = false;
    } else if(event.key === "ArrowRight") {
      this.keys.ArrowRight = false;
      this.commands.rollRight = false;
    }
  }

  unregisterEventListeners() {
    window.removeEventListener("keydown", this.handleKeyDown.bind(this));
    window.removeEventListener("keyup", this.handleKeyUp.bind(this));
    window.removeEventListener("beforeunload", this.unregisterEventListeners.bind(this));
  }
}

export default KeyboardUAVController;

