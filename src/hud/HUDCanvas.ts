class HUDCanvas {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  target?: HTMLElement;
  isMounted: boolean = false;
  dpr: number = 1;
  displayWidth: number = 0;
  displayHeight: number = 0;
  currentTime: Date = new Date();
  displayItems: Array<CallableFunction> = [];

  constructor() {
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.dpr = window.devicePixelRatio || 1;
    this.context.scale(this.dpr, this.dpr);
    this.clear();
    this.#setCanvasAttributes();
  }

  /**
   * Clears the canvas.
   */
  clear(): void {
    this.context.clearRect(0, 0, this.displayWidth, this.displayHeight);
  }

  /**
   * Sets the target element for the canvas.
   *
   * @param target - The target element to mount the canvas to.
   */
  setTarget(target: HTMLElement): void {
    this.target = target;
  }

  #resizeCanvas(): void {
    this.displayWidth = this.canvas.clientWidth;
    this.displayHeight = this.canvas.clientHeight;

    this.canvas.width = this.displayWidth * this.dpr;
    this.canvas.height = this.displayHeight * this.dpr;

    this.context.scale(this.dpr, this.dpr);
  }

  /**
   * Sets the style attributes of the canvas.
   */
  #setCanvasAttributes(): void {
    let styles = {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
    };

    Object.assign(this.canvas.style, styles);

    // Add event listener for resize
    window.addEventListener("resize", this.render.bind(this, this.currentTime));
  }

  /**
   * Mounts the canvas to the target element.
   *
   * @throws {Error} If the target element is not found.
   */
  mount(): void {
    if (!this.target) {
      throw new Error("Target element not found");
    }

    if (this.isMounted) {
      console.warn("HUDCanvas is already mounted");

      return;
    }

    this.target.appendChild(this.canvas);

    this.displayWidth = this.canvas.clientWidth;
    this.displayHeight = this.canvas.clientHeight;

    this.isMounted = true;
  }

  /**
   * Unmounts the canvas from the target element.
   *
   * @throws {Error} If the target element is not found.
   */
  unmount(): void {
    if (!this.target) {
      throw new Error("Target element not found");
    }

    if (!this.isMounted) {
      console.warn("HUDCanvas is not mounted");

      return;
    }

    this.target?.removeChild(this.canvas);

    this.isMounted = false;
  }

  render(currentTime: Date): void {
    this.clear();

    this.#resizeCanvas();

    this.currentTime = currentTime;

    this.displayItems.forEach((item) => {
      item();
    });
  }

  addRenderableItem(item: CallableFunction): void {
    this.displayItems.push(item);
  }
}

export default HUDCanvas;
