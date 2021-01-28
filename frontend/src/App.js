import React from 'react';
import { 
  BrowserRouter as Router, 
  Route, 
  Redirect, 
  Switch 
} from 'react-router-dom';

import Users from './user/pages/Users';
import NewDish from './dishes/pages/NewDish';
import UserDishes from './dishes/pages/UserDishes';
import UpdateDish from './dishes/pages/UpdateDish';
import Auth from './user/pages/Auth';
import MainNavigation from './shared/components/Navigation/MainNavigation';
import { AuthContext } from './shared/context/auth-context';
import { useAuth } from './shared/hooks/auth-hook';

const App = () => {
  const { token, login, logout, userId } = useAuth();
  let routes;
  
  if (token) {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users /> 
        </Route>
        <Route path="/:userId/dishes" exact>
          <UserDishes />
        </Route>
        <Route path="/dishes/new" exact>
          <NewDish />
        </Route>
        <Route path="/dishes/:dishId">
          <UpdateDish />
        </Route>
        <Redirect to="/" />
      </Switch>
    );
  } else {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users /> 
        </Route>
        <Route path="/:userId/dishes" exact>
          <UserDishes />
        </Route>
        <Route path="/auth">
          <Auth /> 
        </Route>
        <Redirect to="/auth" />
      </Switch>
    );
  }

    return (
      <AuthContext.Provider 
      value={{
        isLoggedIn: !!token, 
        token: token, 
        userId: userId, 
        login: login, 
        logout: logout 
        }}
      >
        <Router>
          <MainNavigation />
            <main>{routes}</main>
        </Router>
    </AuthContext.Provider>
    );
};

export default App;
