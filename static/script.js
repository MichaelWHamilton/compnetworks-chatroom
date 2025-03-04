var socket = io();
var username = "";
var input = document.getElementById("input");
var messagesDiv = document.getElementById("messages");


// listen for messages
socket.on('message', function(data) {
    var messageDiv = document.createElement("div");
    messageDiv.textContent = data.message;
    // messageDiv.innerHTML = "message sent";
    messagesDiv.appendChild(messageDiv); //adds div containing the new mseaage to the messages container
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// send message
input.addEventListener("keypress", function(event) {
    if (event.key === "Enter" && input.value.trim()) {
        var message = input.value;
        var timestamp = new Date().toISOString();
        console.log("Sending msg: ", message);

        socket.emit('message', {message: message, timestamp: timestamp});
        //socket.send(input.value); // sends msg to server
        input.value = ""; // clears input field for user
    }
});


socket.on('connect', function(){
    console.log("connected to websocket server")
})

console.log("Hello.");

socket.on('set_username', function(data){
    username = data.username;
    console.log("Username: ", username);
})


function sendMessage() {
    var message = document.getElementById("messageInput").value;
    console.log("Sending msg: ", message);
    var timestamp = new Date().toISOString();
    if (message.trim() !== "") {
        // Log the data to see what you're sending
        console.log("Sending data:");

        socket.emit('message', { message: message, timestamp: timestamp });  // Send as an object
        document.getElementById("messageInput").value = "";  // Clear input
    }
    document.getElementById("messageInput").value="";
    
}


