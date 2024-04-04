# About us
Name: Felix Marxen
NIA: 273350
E-Mail : felix.marxen01@estudiant.upf.edu
name : Ahmed Ghaly
Surname : Sentissi El Idrissi
E-mail : ahmedghaly.sentissi01@estudiant.upf.edu
NIA : 289371
Name: Adrià De Angulo
NIA: 235589
E-mail: adria.deangulo01@estudiant.upf.edu

link to youtube video :
https://www.youtube.com/watch?v=dyGjuYonblM


About our code
How to run the server
node routes/index.js
// from there everything gets started


What we have done :
Server:
- We removed any call to SillyClient from the chat from Assignment 1
- We coded our own server using nodejs (using http + WebSocket server)
- We connect the chat client to your own server using a Websocket
- They connect to the application with secure login via an Access Token
Database:
- Manages Login and Registration, including saving the access tokens
- Every important information about the Users is being saved here: Access Token, Last
position, avatar
UI:
- Users have a visual representation of themselves
- Users can display their country flag to others
- Users can change rooms with the room selector
- we can walk,wave,dance,rotate easely with synchronization
Tech:
- we tried to send MP3 files to each other. For that we stored the file on the server side. So
that we can read it afterwards. It works locally but takes a lot of time to load remotely. So we
let it down.
3D space :
- we tried to make a new bigger room but it was not easy for us to fix the textures and we lacked time.