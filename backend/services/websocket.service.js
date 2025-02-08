const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

function setupWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  // Store WebSocket server globally for access in routes
  global.wss = wss;

  wss.on('connection', async (ws, req) => {
    try {
      // Get token from query string
      const url = new URL(req.url, 'ws://localhost');
      const token = url.searchParams.get('token');

      if (!token) {
        ws.close(1008, 'Authentication failed');
        return;
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      ws.userId = decoded.id;

      // Send initial connection success message
      ws.send(JSON.stringify({
        type: 'CONNECTION_SUCCESS',
        userId: ws.userId
      }));

      // Handle incoming messages
      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);
          
          // Broadcast message to all connected clients in the same session
          if (data.type === 'NEW_MESSAGE' && data.sessionId) {
            wss.clients.forEach(client => {
              if (client.readyState === WebSocket.OPEN && client.sessionId === data.sessionId) {
                client.send(JSON.stringify(data));
              }
            });
          }
          
          // Handle typing indicators
          if (data.type === 'TYPING' && data.sessionId) {
            wss.clients.forEach(client => {
              if (client.readyState === WebSocket.OPEN && 
                  client.sessionId === data.sessionId &&
                  client.userId !== ws.userId) {
                client.send(JSON.stringify({
                  type: 'TYPING',
                  userId: ws.userId,
                  isTyping: data.isTyping
                }));
              }
            });
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      // Handle client disconnection
      ws.on('close', () => {
        // If client was a mentor, update their online status
        if (ws.userId) {
          // This will be handled by the mentor routes
        }
      });

    } catch (error) {
      console.error('WebSocket connection error:', error);
      ws.close(1011, 'Something went wrong');
    }
  });

  return wss;
}

module.exports = setupWebSocketServer; 