import { UAV } from "../uav";

class KeyboardControls {
  constructor(public uav: UAV) {}

  handleKeyboardEvent(event: KeyboardEvent) {
    let keys = {
        // pitch up
        ArrowUp: false,
        // pitch down
        ArrowDown: false,
        // roll left
        ArrowLeft: false,
        // roll right
        ArrowRight: false,

        // if the control key is pressed while arrow up/down/left/right is pressed, 
        // then we will conside the user to be "trimming" the UAV. So the attitude
        // values will be updated to reflect the new trim. The UAV will still have
        // to achieve those values by taking into account the dynamics, wind, etc.
        Control: false,

        // This wil be set by the control key being pressed
        Trim: false,
    }

    if (event.key in keys) {
        keys[event.key as keyof typeof keys] = true;
    }

    if (keys.ArrowUp) {
        // pitch up
    }

    if (keys.ArrowDown) {
        // pitch down
    }

    if (keys.ArrowLeft) {
        // roll left
    }
    
    if (keys.ArrowRight) {
        // roll right
    }
  }
}

export default KeyboardControls;


