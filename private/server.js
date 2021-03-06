'use strict';
const express = require('express');
const axios = require('axios');

const port = 8080;

const backendAPIAddress = (function(){
    if (process.env.NODE_ENV === 'production') {
        return 'http://backend:80/course';
    } else {
        return 'http://127.0.0.1:8000/course';
    }
}());
const backendWSAddress = (function(){
    if (process.env.NODE_ENV === 'production') {
        return 'ws://backend:80/ws/';
    } else {
        return 'ws://127.0.0.1:8000/ws/';
    }
}()); 
console.log('backendAddress:', backendAPIAddress)


var app = express();
// WebSocket for notification push
var WebSocketClient = require('websocket').client;
var socketConnection;
// Web Push
var serverKey = 'AAAAv0b6qUo:APA91bHH6ogyI5jVz7VOuYq6_oKpJOxBts9tUnnrOj_NBh2uy-Ea0BF6ZkcG4ei37TRm3fmjw_vsmDzMUK066SfZTDnThtXgdA-NBV-7Al21EQmE-qwrivzKuYdpymfoJcVNZkqs3A96';
const webpush = require('web-push');
webpush.setGCMAPIKey(serverKey);
// Server setting
const path = require('path');
const buildPath = path.resolve(__dirname, '../build');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.use('/', express.static(buildPath));

app.post('/subscribe', function(req, res) {
    const subObj = req.body;
    socketConnection.sendUTF(JSON.stringify(subObj));
    res.send('Subscribed');
});

require('./routes.js')(app, backendAPIAddress);  // connect to client routes

app.listen(port, function () {
    console.log('Server is now running at ' + port);
});

const clientconnection = function() {
    let client = new WebSocketClient();
    client.on('connectFailed', function (error) {
        console.log('Connect Error: ' + error.toString());
        console.log('Trying to reconnect...')
        setTimeout(clientconnection, 1000);
    });
    
    client.on('connect', function (connection) {
        console.log('Backend WebSocket Client Connected');
        // Globalize the connection
        socketConnection = connection;
    
        connection.on('error', function (error) {
            console.log("Connection Error: " + error.toString());
        });
    
        connection.on('close', function () {
            console.log('Connection Closed');
        });
    
        connection.on('message', function (message) {
            // TODO receive the server messaging
            if (message.type === 'utf8') {
                const body = JSON.parse(message.utf8Data);
                if (body.push) {
                    // Create a push notification
                    const pushSubscription = {
                        endpoint: body.endpoint,
                        keys: {
                            p256dh: body.p256dh,
                            auth: body.auth
                        }
                    };
                    webpush.sendNotification(
                        pushSubscription,
                        body.notification
                    ).then(res => {
                        console.log(res);
                    })
                    .catch(res => {
                        console.log(res);
                    });
                } else {
                    // Print the system message
                    console.log(body.message)
                }
            }
        });
        function sendToServer() {
            if (connection.connected) {
                var number = Math.round(Math.random() * 0xFFFFFF);
                connection.sendUTF(number.toString());
            }
        }
        sendToServer();
    });
    // Start the connection to websocket
    client.connect(backendWSAddress);
}

clientconnection();

// Always return the main index.html, so react-router render the route in the client
app.get('*', (req, res) => {
    res.sendFile(buildPath + '/index.html');
  });