import { Route, Switch, useParams, useRoute } from 'wouter';

import { PlayerProvider } from './player/PlayerContext.jsx';
import { Home } from './pages/Home.jsx';
import { GameById } from './pages/GameById.jsx';
import { SceneById } from './pages/SceneById.jsx';
import { PlaylistById } from './pages/PlaylistById.jsx';
import { VideoPlayer } from './player/VideoPlayer.jsx';
import { UploadDataDialog } from './components/uploadDataDialog.jsx';

export const App = () => (
  <>
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/games/:gameId" nest>
        <PlayerProvider>
          <Switch>
            <Route path="/" component={GameById} />
            <Route path="scenes/:sceneId" nest>
              <Switch>
                <Route path="/" component={SceneById} />
                <Route path="playlists/:playlistId" component={PlaylistById} />
              </Switch>
            </Route>
          </Switch>
          <VideoPlayer />
        </PlayerProvider>
      </Route>
      <Route>404: Not found</Route>
    </Switch>
    <UploadDataDialog />
  </>
);
