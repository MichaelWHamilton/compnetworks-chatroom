from server import app, socketio
from flask import render_template

# app = Flask(__name__)
# socketio = SocketIO(app)

# @app.route('/')
# def index():
#     return render_template('index.html') # chat UI

# @socketio.on('message')
# def handle_message(msg):
#     print(f"Message received: {msg}")
#     send(msg, broadcast=True) # broadcasts the message to all clients

# if __name__ == '__main__':
#     socketio.run(app, debug=True)



if __name__ == '__main__':
    socketio.run(app, debug=True)