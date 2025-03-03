from flask import Flask, render_template
from flask_socketio import SocketIO

app = Flask(__name__, template_folder='../templates')

socketio = SocketIO(app);

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('message')
def handle_message(msg):
    print(f"Received message: {msg}")
    socketio.send(msg)

if __name__ == '__main__':
    socketio.run(app, debug=True)

