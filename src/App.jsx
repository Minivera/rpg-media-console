import { Route, Switch } from 'wouter';

import { Home } from './pages/Home.jsx';
import { GameById } from './pages/GameById.jsx';

export const App = () => (
  <>
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/games/:gameId" component={GameById} />
      <Route path="/games/:gameId/scene/:sceneId">
        {params => <>Hello, {params.name}!</>}
      </Route>
      <Route>404: Not found</Route>
    </Switch>
  </>
);
