# About us 
Name: Felix Marxen         
NIA: 273350
E-Mail : felix.marxen01@estudiant.upf.edu

name : Ahmed Ghaly
Surname : Sentissi El Idrissi
Mail : ahmedghaly.sentissi01@estudiant.upf.edu
NIA : 289371


# About our code 
## How to run the server 
node routes/index.js // from there everything gets started 

## What we have done :
- We removed any call to SillyClient from the chat from Assignment 1
- We coded our own server using nodejs (using httpd + WebSocket server)
- We connect the chat client to your own server using a Websocket
- Users have a visual representation of themselves into the screen. the click works well
- "The server must handle messages between users, so when a user sends a message the
server decides who must receive that message and sends it to them based on how far they
are from the user sending the message." Is partially done but not implemented as we can send a message to a specific client inside a room. -> lack of time
- Users must login using a password that is stored in a database in the backend

## What we have not done:
- Users should be able to change rooms by walking to doors in the map. -> not enough time 
- If a user reconnect after disconnecting, he must appear in the same place as he was the last time he connected.


Things that we couldn't finish in time: 
- Changing rooms (going back to the hall)
- Changing background image of canvas
- Letting the user choose its avatar.
- Getting a complete Message History of the room from the database
    - Right now the saving of the messages work but because of many problems that the node-mysql-wrapper caused we didn't have enough time to fix those 
    



