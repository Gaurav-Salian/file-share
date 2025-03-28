// server.js
const WebSocket = require('ws');
const PORT = process.env.PORT || 8080; // Use Render's assigned port or default to 8080 locally

// Create WebSocket server
const wss = new WebSocket.Server({ port: PORT });

// Store connected peers
const peers = {};

wss.on('connection', (ws) => {
  // Generate a unique peer ID (simple random string for demo purposes)
  const peerId = Math.random().toString(36).substring(2, 8);
  peers[peerId] = ws;

  console.log(`New peer connected: ${peerId}`);
  ws.send(JSON.stringify({ type: 'id', id: peerId }));

  // Handle incoming messages from peers
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`Message from ${peerId}: ${JSON.stringify(data)}`);

      // Relay message to the intended recipient
      if (data.to && peers[data.to]) {
        data.from = peerId; // Attach sender ID
        peers[data.to].send(JSON.stringify(data));
        console.log(`Relayed message to ${data.to}`);
      } else {
        console.log(`Recipient ${data.to} not found`);
      }
    } catch (error) {
      console.error(`Error processing message: ${error}`);
    }
  });

  // Clean up when a peer disconnects
  ws.on('close', () => {
    console.log(`Peer disconnected: ${peerId}`);
    delete peers[peerId];
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for ${peerId}: ${error}`);
  });
});

// Log server startup
console.log(`Signaling server running on port ${PORT}`);
