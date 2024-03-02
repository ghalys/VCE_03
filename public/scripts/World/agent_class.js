import Position from "./position.js"

export default class Agent {
  static FACING = {
    RIGHT : 0,
    FRONT : 1,
    LEFT  : 2,
    BACK  : 3
  }
  static ANIMATION = {
    IDLE :[0],
    TALK : [0,1],
    SIT : [13],
    WALK :[2,3,4,5,6,7,8,9]
  }

  constructor(id,username,avatar ="Avatar", position = new Position(), facing = Agent.FACING.FRONT, animation=Agent.ANIMATION.IDLE) {
      this.id = id,
      this.username =username,
      this.avatar = avatar,
      this.facing = facing,
      this.position = position,
      this.animation= animation,
      this.onMyWay = false // is True when there is a mouse click and the user should go to somewhere till he arrives
  }
  
  sendJSON(){
    return {
            id : this.id,
            facing: this.facing,
            position : this.position,
            animation :this.animation,
            }
  }
  updateFromJSON(msgJSON){
    this.facing = msgJSON.facing;
    this.position = msgJSON.position;
    this.animation= msgJSON.animation;
  }

  setId(id){
      this.id=id;
  }
  changeAvatar(avatar){
    this.avatar = avatar;
  }

  //function for changing face direction
  facingRight(){
    this.facing = Agent.FACING.RIGHT;
  }
  facingLeft(){
    this.facing = Agent.FACING.LEFT;
  }
  facingFront(){
    this.facing = Agent.FACING.FRONT;
  }
  facingBack(){
    this.facing = Agent.FACING.BACK;
  }

  //function for changing the animation
  animatIdle(){
    this.animation = Agent.ANIMATION.IDLE;
  }
  animatWalk(){
    this.animation = Agent.ANIMATION.WALK;
  }
  animatSit(){
    this.animation = Agent.ANIMATION.SIT;
  }
  animatTalk(){
    this.animation = Agent.ANIMATION.TALK;
  }

  //walk to the right
  moveToRight(dt){
    this.facingRight();
    this.animatWalk();
    this.position.x += dt*32;
  }
  //walk to the left
  moveToLeft(dt){
    this.facingLeft();
    this.animatWalk();
    this.position.x -= dt*32;
  }
  //sit down
  sitDown(){
    this.animatSit();
  }
  //stand up
  standUp(){
    this.animatIdle();
  }

  // function which allows us to move to a new point
  moveTo(newX, newY = this.position.y) {
    this.position.setPosition(newX, newY);
  }

  // walk to the mouse 
  walkTo(newX,dt){

    if(newX>this.position.x){ //we move to the right
      //if we are close to the destination
      if(Math.abs(newX-this.position.x)<=32*dt){ 
        var dx = newX-this.position.x;
        this.moveToRight(dx/32);
        this.onMyWay = false
      }
      else{// if we are far from the destination
        this.moveToRight(dt)
      }
    }
    else if(newX<this.position.x){ // We move to the left
      if(Math.abs(newX-this.position.x)<=32*dt){ //if we are close
        var dx = this.position.x-newX;
        this.moveToLeft(dx/32);
        this.onMyWay = false
      }
      else{// if we are far from the destination
        this.moveToLeft(dt)
      }
    }
    else{ //we already arrived
      this.animatIdle();
      this.onMyWay = false;
    }
  }

}