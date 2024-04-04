link to youtube video :
https://www.youtube.com/watch?v=dyGjuYonblM
![image](https://github.com/ghalys/VCE_03/assets/127297865/94063296-f5cd-4917-b5bd-85c11f66f3b3)

## About our Website
We wanted to create a website that changes the erasmus experience from the start 
It allows users to connect easier with other erasmus students and get to know them before the exchange begins.
The 3D space allows users to express themselves in a more effective way than a simple text chat.
We can change our flag.

![image](https://github.com/ghalys/VCE_03/assets/127297865/e132cec9-6609-4c8d-9c5e-3f8bfc9e0259)
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
- Every important information about the Users is being saved here: Access Token, Last
position, avatar
UI:
- Users have a visual representation of themselves
- Users can display their country flag to others
- Users can change rooms with the room selector
- we can walk,wave,dance,rotate easely with synchronization
