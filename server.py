from flask import Flask, render_template, session
from flask_socketio import SocketIO
import uuid, random, string

app = Flask(__name__)

socketio = SocketIO(app);

def gen_username():
    return "User" + ''.join(random.choices(string.digits, k=4)) 

@app.route('/')
def index():
    favicon_version = str(uuid.uuid4())
    return render_template('index.html', favicon_version=favicon_version)

@socketio.on('connect')
def handle_connect():
    if 'username' not in session:
        session['username'] = gen_username()
    username = session['username']
    print(f"System: {username} has joined the chat.")    
    socketio.emit('set_username', {'username': username})

@socketio.on('message')
def handle_message(data):
    try:
        # Ensure that data is a dictionary and contains the 'message' field
        if isinstance(data, dict):
            username = session.get('username', 'Anonymous')
            message = data.get('message')
            print(f"{username}: {message}")

            # Broadcast the message to all clients
            socketio.emit('message', {'message': f"{username}: {message}"})
        else:
            print("Error: Received data is not a valid object or missing 'message' field.")
    except Exception as e:
        print(f"Error handling message: {e}")

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)

