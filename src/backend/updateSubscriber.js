import { v4 as uuidv4 } from 'uuid';
import WebSocket, { WebSocketServer } from 'ws';

const db = {};

export const configureSubscriber = server => {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const { pathname } = new URL(request.url, 'ws://localhost');

    if (pathname === '/play-updates') {
      wss.handleUpgrade(request, socket, head, ws => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', (ws, request) => {
    ws.id = uuidv4();

    ws.on('error', console.error);

    ws.on('message', async message => {
      const { broadcast, update } = JSON.parse(message);

      await db.update(data => {
        data.playingState = {
          ...data.playingState,
          ...update,
        };
      });

      if (!broadcast) {
        return;
      }

      wss.clients?.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              updateId: uuidv4(),
              ...update,
            })
          );
        }
      });
    });
  });
};
