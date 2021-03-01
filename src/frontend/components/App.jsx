import React from 'react';
/* eslint-disable node/no-extraneous-import*/
import Cookies from 'js-cookie';
import { Switch, Route, Redirect } from 'react-router-dom';
import { lazy, LazyBoundary } from 'react-imported-component';
// import Container from 'react-bootstrap/Container';
import { ErrorBoundary } from 'react-error-boundary';
import 'react-form-builder2/dist/app.css';
import Error from './Error.jsx';

const Front = lazy(() => import('./Front.jsx'));
const GoogleMaps = lazy(() => import('./GoogleMaps.jsx'));
const Loading = lazy(() => import('./Loading.jsx'));
const Login = lazy(() => import('./Login.jsx'));
const Dashboard = lazy(() => import('./Dashboard.jsx'));
const ThankYou = lazy(() => import('./ThankYou.jsx'));
const Survey = lazy(() => import('./Survey.jsx'));

export default function App() {
  const [role, setRole] = React.useState(null);
  const [error, setError] = React.useState(null);

  const processError = res => {
    let errorString;
    if (res.statusCode && res.error && res.message) {
      errorString = `HTTP ${res.statusCode} ${res.error}: ${res.message}`;
    } else if (res.statusCode && res.status) {
      errorString = `HTTP ${res.statusCode}: ${res.status}`;
    } else if (res.message) {
      errorString = res.message;
    } else {
      errorString = 'Error in response from server.';
    }
    return errorString;
  };

  // fetch api data
  React.useEffect(() => {
    let isMounted = true;
    let userStatus;
    const username = Cookies.get('p_user');
    console.log('username:', username);
    if (username) {
      // TODO: Add separate case for admin
      fetch(`api/v1/users/${username}`)
        .then(usersResponse => {
          userStatus = usersResponse.status;
          return usersResponse.json();
        })
        .then(user => {
          if (isMounted) {
            if (userStatus === 200) {
              return setRole(user.role);
            } else {
              const error = processError(user);
              throw new Error(error);
            }
          }
          return;
        })
        .catch(error => {
          setError(error);
          console.error(error.name + error.message);
          // setIsLoaded(true);
        });
      return () => {
        isMounted = false;
      };
    }
  }, []);

  if (error) {
    return <div>Error: {error.message}</div>;
  } else {
    return (
      <ErrorBoundary FallbackComponent={Error}>
        <Switch>
          <LazyBoundary fallback={Loading}>
            <Route path="/" exact component={Front} />
            <Route path="/login" render={props => <Login {...props} />} />
            <Route
              path="/admin"
              render={props => <Dashboard {...props} role={role} />}
            />
            <Route path="/thankyou" render={props => <ThankYou {...props} />} />
            <Route path="/survey" render={props => <Survey {...props} />} />
            <Route
              path="/geocoder"
              render={props => <GoogleMaps {...props} />}
            />
          </LazyBoundary>
          <Redirect to="/" />
        </Switch>
      </ErrorBoundary>
    );
  }
}
