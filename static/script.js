// This file contains the client-side JavaScript code for the chat application.
// It connects to the server using a WebSocket connection and listens for messages.
var socket = io();
var username = "";
var input = document.getElementById("input");
var messagesDiv = document.getElementById("messages");
var toggleModeButton = document.getElementById("toggleMode");

// Object to store colors for each username
var userColors = {};

// Function to generate a random color
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Function to format message text with username colors
function formatMessageText(text) {
    return text.replace(/User-\d{4}/g, function(match) {
        if (userColors[match]) {
            return `<span style="color: ${userColors[match].usernameColor}; font-weight: bold;">${match}</span>`;
        }
        return match;
    });
}

// listen for messages
socket.on('message', function(data) {
    var messageDiv = document.createElement("div");

    // Assign colors if not already assigned
    if (!userColors[data.username]) {
        userColors[data.username] = {
            usernameColor: getRandomColor(),
            messageColor: getRandomColor()
        };
    }

    // Create username span
    var usernameSpan = document.createElement("span");
    usernameSpan.textContent = data.username + ": ";
    usernameSpan.style.color = userColors[data.username].usernameColor;
    usernameSpan.style.fontWeight = "bold"; // Make username bold

    // Create message span
    var messageSpan = document.createElement("span");
    messageSpan.innerHTML = formatMessageText(data.message); // Format message text
    messageSpan.style.color = userColors[data.username].messageColor;

    // Append username and message to messageDiv
    messageDiv.appendChild(usernameSpan);
    messageDiv.appendChild(messageSpan);

    messagesDiv.appendChild(messageDiv); //adds div containing the new message to the messages container
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// send message
input.addEventListener("keypress", function(event) {
    if (event.key === "Enter" && input.value.trim()) {
        var message = input.value;
        var timestamp = new Date().toISOString();
        console.log("Sending msg: ", message);

        socket.emit('message', {message: message, timestamp: timestamp});
        input.value = ""; // clears input field for user
    }
});

socket.on('connect', function(){
    console.log("connected to websocket server")
});

console.log("Hello.");

socket.on('set_username', function(data){
    username = data.username;
    console.log("Username: ", username);
});

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

// Toggle dark/light mode
toggleModeButton.addEventListener("click", function() {
    var body = document.body;
    if (body.classList.contains("dark-mode")) {
        body.classList.remove("dark-mode");
        body.classList.add("light-mode");
    } else {
        body.classList.remove("light-mode");
        body.classList.add("dark-mode");
    }
});