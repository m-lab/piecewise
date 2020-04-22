import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { lazy, LazyBoundary } from 'react-imported-component';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  container: {
    padding: 0,
  },
}));

const Basic = lazy(() => import('./Basic.jsx'));
const Loading = lazy(() => import('./Loading.jsx'));
const Login = lazy(() => import('./Login.jsx'));
const Admin = lazy(() => import('./Admin.jsx'));
const ThankYou = lazy(() => import('./ThankYou.jsx'));

export default function App() {
  const classes = useStyles();
  return (
    <Container className={classes.container}>
      <Switch>
        <LazyBoundary fallback={Loading}>
          <Route exact path="/" render={props => <Basic {...props} />} />
          <Route path="/login" render={props => <Login {...props} />} />
          <Route path="/admin" render={props => <Admin {...props} />} />
          <Route path="/thankyou" render={props => <ThankYou {...props} />} />
        </LazyBoundary>
        <Redirect to="/" />
      </Switch>
    </Container>
  );
}
