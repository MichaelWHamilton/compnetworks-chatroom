var socket = io();
var username = "";
var input = document.getElementById("input");
var messagesDiv = document.getElementById("messages");
var toggleModeButton = document.getElementById("toggleMode");
var autocompleteBox = document.getElementById("autocomplete-box");

var pendingFile = null;
var fileInput = document.getElementById("fileInput");

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

// Fetch word suggestions from API
async function fetchWordSuggestions(prefix) {
    const response = await fetch(`https://api.datamuse.com/words?sp=${prefix}*&max=10`);
    const words = await response.json();
    return words.map(word => word.word); // Extract word strings
}

// Handle input changes for autocomplete
input.addEventListener("input", async function() {
    let inputText = input.value;
    let lastWord = inputText.split(" ").pop(); // Get the last word typed

    if (lastWord.length < 2) {
        autocompleteBox.innerHTML = "";
        autocompleteBox.style.display = "none";
        return;
    }

    let matches = await fetchWordSuggestions(lastWord);
    autocompleteBox.innerHTML = "";

    if (matches.length > 0) {
        autocompleteBox.style.display = "block";
        matches.forEach(word => {
            let suggestion = document.createElement("div");
            suggestion.textContent = word;
            suggestion.onclick = function() {
                let words = inputText.split(" ");
                words.pop();
                words.push(word);
                input.value = words.join(" ") + " ";
                autocompleteBox.innerHTML = "";
                autocompleteBox.style.display = "none";
            };
            autocompleteBox.appendChild(suggestion);
        });
    }
    else{
        autocompleteBox.style.display= "none";
    }
});

// Use arrow keys & Enter to navigate suggestions
input.addEventListener("keydown", function(event) {
    let suggestions = autocompleteBox.children;
    let selectedIndex = Array.from(suggestions).findIndex(s => s.classList.contains("selected"));

    if (event.key === "ArrowDown") {
        if (selectedIndex < suggestions.length - 1) {
            if (selectedIndex >= 0) suggestions[selectedIndex].classList.remove("selected");
            suggestions[selectedIndex + 1].classList.add("selected");
        }
        event.preventDefault();
    } else if (event.key === "ArrowUp") {
        if (selectedIndex > 0) {
            suggestions[selectedIndex].classList.remove("selected");
            suggestions[selectedIndex - 1].classList.add("selected");
        }
        event.preventDefault();
    } else if (event.key === "Enter" && selectedIndex >= 0) {
        suggestions[selectedIndex].click();
        event.preventDefault();
    }
});

// Hide autocomplete on Enter
input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        autocompleteBox.style.display = "none";
    }
});

// Hide autocomplete when clicking outside
document.addEventListener("click", function (event) {
    if (!autocompleteBox.contains(event.target) && event.target !== input) {
        autocompleteBox.style.display = "none";
    }
});



// Listen for messages
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
    usernameSpan.style.fontWeight = "bold";

    // Create message span
    var messageSpan = document.createElement("span");

    if(data.file_url) {
        var fileLink = document.createElement("a");
        fileLink.href = `http://localhost:5000${data.file_url}`;
        fileLink.textContent = data.message;
        fileLink.target = "_blank";

        messageSpan.appendChild(fileLink);
    }
    else{
        messageSpan.innerHTML = formatMessageText(data.message);
        messageSpan.style.color = userColors[data.username].messageColor;
    }

    // Append username and message to messageDiv
    messageDiv.appendChild(usernameSpan);
    messageDiv.appendChild(messageSpan);
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Send message ensuring username is included
//TODO: come back here after
// input.addEventListener("keypress", function(event) {
//     if (event.key === "Enter" && input.value.trim()) {
//         var message = input.value;
//         console.log("📤 Sending msg: ", message);

//         socket.emit('message', { username: username, message: message });

//         input.value = "";
//         autocompleteBox.innerHTML = ""; // Clear suggestions
//     }
// });

socket.on('connect', function(){
    console.log("connected to websocket server");
});

// Receive assigned username from server
socket.on('set_username', function(data){
    username = data.username;
    console.log("Username: ", username);
});


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




/***********   Upload files   **********/

function uploadFile(file) {
    // if(!file) {
    //     alert("Please select a file first!");
    //     return;
    // }
    
    let formData = new FormData();
    formData.append("file", file);
    formData.append("username", username);

    fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        
        if(data.file_url) {
            
            // socket.emit("message", {
            //     username: username,
            //     message: `Uploaded a file: ${data.file_name}`,
            //     file_url: data.file_url
            // });
            fileUploadAlert("success", `Your file "${data.file_name}" was successfully uploaded!`);
        }
        else {
            fileUploadAlert("fail", "File upload failed: " + data.error);
        }
    })
    .catch(error => console.error("Error:", error));
}

function fileUploadAlert(status, message) {

    const alertStyles={
        success: {backgroundColor: "#4CAF50", textColor: "white"},
        fail: {backgroundColor: "#f44336", textColor: "white"}
    }

    let alertBox = document.createElement("div");
    alertBox.textContent = message;



    alertBox.style.backgroundColor = alertStyles[status]?.backgroundColor || "gray";
    alertBox.style.color = alertStyles[status]?.textColor || "white";
    
    document.body.appendChild(alertBox);

    alertBox.scrollIntoView({ behavior: "smooth", block: "center" });
    
    setTimeout(() => alertBox.remove(), 5000);
};

//assign file
fileInput.addEventListener("change", function(){
    if(fileInput.files.length > 0){
        pendingFile = fileInput.files[0];
        input.value = `[File ready to be sent: ${pendingFile.name}]`;
    }
});



//****sending messages or files***** //

//handle send button click
sendButton.addEventListener("click", function(){
    sendMessageOrFile();
});

//handle enter press for sending
input.addEventListener("keypress", function(event){
    if(event.key === "Enter" && input.value.trim()){
        sendMessageOrFile();
    }
});



/*******   Handle files and messaging   ******/

//handle sending message or file 
function sendMessageOrFile() {
    if(pendingFile){
        uploadFile(pendingFile);
        pendingFile = null;
        input.value = "";
    }
    else{
        var message = input.value;
        console.log("📤 Sending msg: ", message);

        socket.emit("message", {username: username, message: message});
        input.value = "";
        autocompleteBox.innerHTML = "";
    }
}

