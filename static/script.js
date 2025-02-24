var socket = io.connect('http://' + document.domain + ':' + location.port);
socket.on('connect', function(){
    console.log("connected to websocket server")
})

console.log("Hello.");


function sendMessage() {
    var message = document.getElementById("messageInput").value;
    socket.send(message);
}

socket.on('message', function(msg) {
    document.getElementById("messages").innerHTML += "<p>" + msg + "</p>";
});
