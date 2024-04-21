link to youtube video :
https://www.youtube.com/watch?v=dyGjuYonblM

## The project
https://github.com/ghalys/VCE_03/assets/127297865/73ea492a-0c61-4f9a-bec9-1d4a04225034

## About our Website
We created a website that changes the erasmus experience from the start 
It allows users to connect easier with other erasmus students and get to know them before the exchange begins.
The 3D space allows users to express themselves in a more effective way than a simple text chat.
We can change our flag.

![Capture d'écran 2024-04-21 155546](https://github.com/ghalys/VCE_03/assets/127297865/7a52f96f-dd93-4e55-9f38-481f953df1fb)
This was part of a school project where the chat has been coded from scratch.


## About our code
- Choose either to run the website locally or online (you need to upload the project into a server and fix the variable in testingLocally in public/scripts/testing.js)
- How to run the server
node routes/index.js

## Prerequisites (will be updated with more specific details soon)
NodeJS
MySQL
http-server
npm install express


## What we have done :
Server:
- We coded our own server using nodejs (using http + WebSocket server)
- We connect the chat client to your own server using a Websocket
- They connect to the application with secure login via an Access Token
Database:
- Manages Login and Registration, including saving the access tokens
- Every important information about the Users is being saved here: Access Token, Last position, avatar
UI:
- Users have a visual representation of themselves
- Users can display their country flag to others
- Users can change rooms with the room selector
- we can walk,wave,dance,rotate easely with synchronization
