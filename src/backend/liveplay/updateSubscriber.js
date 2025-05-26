import { v4 as uuidv4 } from 'uuid';
import WebSocket, { WebSocketServer } from 'ws';
import * as url from 'node:url';

import {
  getLatestGameState,
  initializeGameState,
  startNewGameState,
  updateExistingGameState,
} from '../db/gamestate.js';

import { playUpdateActions } from './constants.js';
import { GameState } from './gameState.js';
import { getGameById } from '../db/index.js';

export const configureSubscriber = server => {
  const wss = new WebSocketServer({ noServer: true, clientTracking: true });

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
    const parameters = url.parse(request.url, true);
    if (parameters.query.actor_id) {
      ws.id = parameters.query.actor_id;
    } else {
      ws.id = uuidv4();
    }

    ws.send(
      JSON.stringify({
        action: 'CONNECTED',
        connectionId: ws.id,
      })
    );

    ws.on('error', console.error);

    ws.on('message', async message => {
      const { action, gameId, update } = JSON.parse(message);

      const game = getGameById(Number.parseInt(gameId, 10));
      if (!game) {
        return ws.close(
          1007,
          `{"message": "Game ${gameId} not found, closing connection"`
        );
      }

      let gameState = getLatestGameState(game.id);
      if (!gameState) {
        gameState = initializeGameState(game.id, new GameState().toJSON());
      }

      const currentState = new GameState(gameState.data);

      let broadcastAction = null;
      let broadcastToAll = false;
      // TODO: Add validation in the future
      switch (action) {
        case playUpdateActions.PLAY: {
          currentState.setActor(ws.id);
          currentState.startPlaying(update.songs);
          startNewGameState(gameId, gameState.id, currentState.toJSON());

          broadcastAction = playUpdateActions.PLAY;
          broadcastToAll = true;
          break;
        }
        case playUpdateActions.PLAYING: {
          currentState.seekTo(update.seekUpdate);
          // Playing updates only save the update in the database and don't
          // broadcast, we only care about saving this for future clients.
          updateExistingGameState(gameState.id, currentState.toJSON());
          break;
        }
        case playUpdateActions.PAUSE: {
          currentState.setActor(ws.id);
          currentState.pausePlaying();
          updateExistingGameState(gameState.id, currentState.toJSON());

          broadcastAction = playUpdateActions.PAUSE;
          break;
        }
        case playUpdateActions.RESUME: {
          currentState.setActor(ws.id);
          currentState.resumePlaying();
          updateExistingGameState(gameState.id, currentState.toJSON());

          broadcastAction = playUpdateActions.RESUME;
          broadcastToAll = true;
          break;
        }
        case playUpdateActions.SEEK: {
          currentState.setActor(ws.id);
          currentState.seekTo(update.seekUpdate);
          updateExistingGameState(gameState.id, currentState.toJSON());

          broadcastAction = playUpdateActions.SEEK;
          break;
        }
        case playUpdateActions.NEXT: {
          currentState.setActor(ws.id);
          currentState.moveTo(+1);
          updateExistingGameState(gameState.id, currentState.toJSON());

          broadcastAction = playUpdateActions.NEXT;
          break;
        }
        case playUpdateActions.PREVIOUS: {
          currentState.setActor(ws.id);
          currentState.moveTo(-1);
          updateExistingGameState(gameState.id, currentState.toJSON());

          broadcastAction = playUpdateActions.NEXT;
          break;
        }
        case playUpdateActions.UPDATE: {
          currentState.setActor(ws.id);

          const { volume } = update;
          if (volume) {
            currentState.setVolume(volume);
          }

          updateExistingGameState(gameState.id, currentState.toJSON());

          broadcastAction = playUpdateActions.UPDATE;
          break;
        }
        default:
          return;
      }

      if (broadcastAction) {
        wss.clients?.forEach(client => {
          if (
            client.readyState === WebSocket.OPEN &&
            (broadcastToAll || client !== ws)
          ) {
            client.send(
              JSON.stringify({
                action: broadcastAction,
                data: currentState.state,
              })
            );
          }
        });
      }
    });
  });
};
