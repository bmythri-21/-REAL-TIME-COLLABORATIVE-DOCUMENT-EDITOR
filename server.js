const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const Doc = mongoose.model('Doc', new mongoose.Schema({
    content: String,
}));

let docContent = "";
let docId;

const initDocument = async () => {
    let doc = await Doc.findOne();
    if (!doc) {
        doc = await new Doc({ content: "" }).save();
    }
    docContent = doc.content;
    docId = doc._id;
};
initDocument();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (socket) => {
    console.log("Client connected");

    socket.send(JSON.stringify({ type: 'init', content: docContent }));

    socket.on('message', async (message) => {
        const data = JSON.parse(message);

        if (data.type === 'edit') {
            docContent = data.content;
            await Doc.findByIdAndUpdate(docId, { content: docContent });

            wss.clients.forEach(client => {
                if (client !== socket && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'update', content: docContent, user: data.user }));
                }
            });
        }
    });

    socket.on('close', () => {
        console.log("Client disconnected");
    });
});

server.listen(5000, () => console.log('Server running on http://localhost:5000'));
