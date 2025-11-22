// proxy-server.js - Deploy this on Vercel/Render/Railway
const WebSocket = require('ws');
const http = require('http');

const OPENAI_API_KEY = 'YOUR_API_KEY_HERE';
const PORT = process.env.PORT || 3000;

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', (clientWs) => {
  console.log('Client connected');
  
  // Connect to OpenAI Realtime API
  const openaiWs = new WebSocket(
    'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01',
    {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'realtime=v1',
      }
    }
  );
  
  // Forward messages from client to OpenAI
  clientWs.on('message', (data) => {
    if (openaiWs.readyState === WebSocket.OPEN) {
      openaiWs.send(data);
    }
  });
  
  // Forward messages from OpenAI to client
  openaiWs.on('message', (data) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(data);
    }
  });
  
  // Handle disconnections
  clientWs.on('close', () => {
    console.log('Client disconnected');
    openaiWs.close();
  });
  
  openaiWs.on('close', () => {
    clientWs.close();
  });
});

server.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
