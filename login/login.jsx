import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase-config';
import './login.css'; 

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/board');
    } catch (error) {
      console.error('Error signing in:', error.message);
      setErrorMessage('Error signing in. Please check your email and password.');
    }
  };

  return (
    <div className='login-container'>
      <div className='login-box'>
        <h2>Sign-in</h2>
        <form onSubmit={handleLogin}>
          <div className='form-group'>
            <label htmlFor='email'>Email</label>
            <input
              type='email'
              placeholder='Enter email'
              name='email'
              className='form-control'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className='form-group'>
            <label htmlFor='password'>Password</label>
            <input
              type='password'
              placeholder='Enter password'
              name='password'
              className='form-control'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type='submit' className='btn btn-success btn-block'>Log in</button>

          {errorMessage && (
            <div className='alert alert-danger mt-3' role='alert'>
              {errorMessage}
            </div>
          )}

          <p>You agree to our terms and policies</p>
          <Link to='/register' className='btn btn-light btn-block text-decoration-none'>
            Create an account
          </Link>
        </form>
      </div>
    </div>
  );
}

export default Login;
