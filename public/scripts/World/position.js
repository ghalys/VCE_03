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
  setPosition(position) {
    this.x = position[0];
    this.y = position[1];
    this.z = position[2];
  }
  updatePosition(position) {
    this.x = position.x;
    this.y = position.y;
    this.z = position.z;
  }
  getDirection(destination){
    return [destination[0] - this.x, destination[1] - this.y, destination[2] - this.z];
  }
  getDistanceTo(destination){
    let direction = this.getDirection(destination);
    return Math.sqrt(direction[0]**2 + direction[1]**2 + direction[2]**2);
  }

  getPositionOfUsername(){
    return [this.x,this.y+45,this.z]
  }

}
//Units are in meters