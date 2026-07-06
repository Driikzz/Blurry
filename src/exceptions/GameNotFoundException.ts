export class GameNotFoundException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GameNotFoundException";
    Object.setPrototypeOf(this, GameNotFoundException.prototype);
  }
}
