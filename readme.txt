link to youtube video :
https://www.youtube.com/watch?v=dyGjuYonblM
![Uploading image.png…]()

## About our Website
We wanted to create a website that changes the erasmus experience from the start 
It allows users to connect easier with other erasmus students and get to know them before the exchange begins.
The 3D space allows users to express themselves in a more effective way than a simple text chat.

This was part of a school project where the chat has been coded from scratch.


## About our code
- Choose either to run the website locally or online (you need to upload the project into a server)
- How to run the server
node routes/index.js

## Prerequisites (will be updated with more specific details soon)
NodeJS
MySQL
http-server




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
