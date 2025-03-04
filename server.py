from flask import Flask, render_template
from flask_socketio import SocketIO
import uuid

app = Flask(__name__)

socketio = SocketIO(app);

@app.route('/')
def index():
    favicon_version = str(uuid.uuid4())
    return render_template('index.html', favicon_version=favicon_version)

@socketio.on('message')
def handle_message(msg):
    print(f"Received message: {msg}")
    socketio.send(msg)

if __name__ == '__main__':
    socketio.run(app, debug=True)

