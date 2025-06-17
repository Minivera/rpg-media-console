import { Route, Switch } from 'wouter';

import { Home } from './pages/Home.jsx';
import { PlayerProvider } from './player/PlayerContext.jsx';
import { GameById } from './pages/GameById.jsx';
import { SceneById } from './pages/SceneById.jsx';
import { PlaylistById } from './pages/PlaylistById.jsx';
import { VideoPlayer } from './player/VideoPlayer.jsx';
import { UploadDataDialog } from './components/uploadDataDialog.jsx';
import { PlayerForGameById } from './pages/PlayerForGameById.jsx';
import { Container, Flex } from '@radix-ui/themes';

export const App = () => (
  <>
    <Switch>
      <Route
        path="/"
        component={() => (
          <Container
            minHeight="100vh"
            id="container"
            px={{ md: '0', initial: '2' }}
          >
            <Flex minHeight="100vh" direction="column">
              <Home />
            </Flex>
          </Container>
        )}
      />
      <Route path="/games/:gameId" nest>
        <Container
          minHeight="100vh"
          id="container"
          px={{ md: '0', initial: '2' }}
        >
          <Flex minHeight="100vh" direction="column">
            <PlayerProvider>
              <Switch>
                <Route path="/" component={GameById} />
                <Route path="scenes/:sceneId" nest>
                  <Switch>
                    <Route path="/" component={SceneById} />
                    <Route
                      path="playlists/:playlistId"
                      component={PlaylistById}
                    />
                  </Switch>
                </Route>
              </Switch>
              <VideoPlayer />
            </PlayerProvider>
          </Flex>
        </Container>
      </Route>
      <Route path="/player/:gameId" component={PlayerForGameById} />
      <Route>404: Not found</Route>
    </Switch>
    <UploadDataDialog />
  </>
);
