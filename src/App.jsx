import { Route, Switch } from 'wouter';

import { PlayerProvider } from './player/PlayerContext.jsx';
import { Home } from './pages/Home.jsx';
import { GameById } from './pages/GameById.jsx';
import { SceneById } from './pages/SceneById.jsx';
import { PlaylistById } from './pages/PlaylistById.jsx';
import { VideoPlayer } from './player/VideoPlayer.jsx';
import { UploadDataDialog } from './components/uploadDataDialog.jsx';

export const App = () => (
  <PlayerProvider>
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/games/:gameId" component={GameById} />
      <Route path="/games/:gameId/scenes/:sceneId" component={SceneById} />
      <Route
        path="/games/:gameId/scenes/:sceneId/playlists/:playlistId"
        component={PlaylistById}
      />
      <Route>404: Not found</Route>
    </Switch>
    <Route path="games/*">
      <VideoPlayer />
    </Route>
    <UploadDataDialog />
  </PlayerProvider>
);
