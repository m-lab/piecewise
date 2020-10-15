// base imports
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

// Bootstrap imports
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

// icon imports
import { Lock } from 'react-bootstrap-icons';

// module imports
import Loading from './Loading.jsx';

export default function Login() {
  const history = useHistory();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [local, setLocal] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [helperText, setHelperText] = useState('');
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Check to see if we're using OAuth2
    const checkOAuth2 = async () => {
      try {
        const response = await fetch('/api/v1/oauth2/enabled', {
          method: 'GET',
        });
        const result = await response.json();
        console.log('OAuth2 enabled: ', result);
        if (result.status === 1 || result.status === true) {
          window.location.href = '/api/v1/oauth2/login';
        } else {
          setLocal(true);
        }
      } catch (err) {
        console.error('error: ', err);
        // fallback to local auth
        setLocal(true);
      }
    };
    checkOAuth2();
  }, []);

  useEffect(() => {
    if (username.trim() && password.trim()) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }, [username, password]);

  const handleKeyPress = e => {
    if (e.keyCode === 13 || e.which === 13) {
      isButtonDisabled || handleLogin();
    }
  };

  const handleLogin = async event => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('remember', remember);
    try {
      await fetch('/api/v1/login', {
        method: 'POST',
        body: formData,
      })
        .then(response => response.json())
        .then(results => {
          if (results.success) {
            setValidated(true);
            setHelperText('Login successful.');
            history.push({
              pathname: '/admin',
              state: { role: results.user.role },
            });
          } else {
            setError(true);
            setHelperText('Incorrect username or password.');
          }
          return;
        });
    } catch (err) {
      setError(true);
      setHelperText('Could not connect to authentication server.');
      console.error('error: ', err);
    }
  };

  if (local) {
    return (
      <Container className={'m-4'}>
        <Row>
          <Col>
            <Lock size={30} />
          </Col>
        </Row>
        <Row>
          <Col>
            <h1>Sign in</h1>
          </Col>
        </Row>
        <Form validated={validated} onSubmit={handleLogin}>
          <Form.Group>
            <Form.Label htmlFor="username">Username</Form.Label>
            <Form.Control
              required
              type="text"
              name="username"
              id="username"
              value={username}
              autoComplete="username"
              onChange={e => setUsername(e.target.value)}
              onKeyPress={e => handleKeyPress(e)}
              autoFocus={true}
              isInvalid={!!error}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor="password">Password</Form.Label>
            <Form.Control
              required
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyPress={e => handleKeyPress(e)}
              autoComplete="current-password"
              isInvalid={!!error}
            />
            <Form.Control.Feedback type="invalid">
              {helperText}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Check
              id="remember"
              name="remember"
              label="Remember me"
              checked={remember}
              color="primary"
              onChange={e => setRemember(e.target.checked)}
            />
          </Form.Group>
          <Button disabled={isButtonDisabled} type="submit">
            Sign in
          </Button>
        </Form>
      </Container>
    );
  } else {
    return <Loading />;
  }
}
