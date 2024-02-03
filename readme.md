# About me 
Name: Felix Marxen         
NIA: 273350
E-Mail : felix.marxen01@estudiant.upf.edu

# About my code 

## HTML 
I used the google material icons as additional ressource for some icons. 

## CSS
I divided the css code into three files: ``layout.css`` , ``sidebar.css`` and ``chat-window.css``. 

## JavaScript
The structure of my .js file goes like this: 
- Class definitions with their functions 
- Additional functions
- Handling the connection to the server and login 
    

### Class definitions
I added the User and Msg class and oriented the MyChat class on the one we saw in the lecture. 
For the MyChat Class a lot of the functions get invoked when a connection is established: 
- Other Users get informed 
- The name of the room in the HTML is set 
- The icon of the user in the HTML is set 

For the on_message function of the server these actions happen: 
- Checks if the message is an object and needs to be handled as such 
- Depending on what the msg is we do: 
    - text: 
        - show the message in the chat
        - add message to history
    - status-update:
        -update other users about the change via and saving the users information in an array

For the rest of the code I hope the comments clear up any confusions that might come up, otherwise I apologize for that.


Things that I couldn't finish in time (but are shown in the interface): 
- Setting Buttons
- Emoji Button 
- Private Chats 
- Chat Pictures 
- Functionality of searchbar 
- Modern Looking Interface...



