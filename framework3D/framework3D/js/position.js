export default class Position {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x; 
    this.y = y;
    this.z = z;
  }
  toArray() {
    return [this.x, this.y, this.z];
  }
  setX(x){
    this.x = x;
  }
  setY(y){
    this.y = y;
  }
  setX(z){
    this.z = z;
  }
  setPosition(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}
//Units are in meters