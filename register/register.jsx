import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase-config";
import "./register.css";
const Register = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    createUserWithEmailAndPassword(auth, email, password).then((data) => {
      console.log(data, "authData");
    });
  };

  return (
    <div className="body">
      <div className="signup-container">
        <h1>Sign Up</h1>
        <div className="signup-form">
          <h4>Sign Up Form Validation</h4>
          <div className="form">
            <form onSubmit={(e) => handleSubmit(e)}>
              <div className="form-group">
                <label htmlFor="name">
                  <strong>Name:</strong>
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Enter name"
                  name="name"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <strong>Email:</strong>
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter email"
                  name="email"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <strong>Password:</strong>
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter Password"
                  name="password"
                  className="form-control"
                />
              </div>

              <div className="form-group mt-3">
                <button className="btn btn-blue w-50">Sign Up</button>
                <Link to="/login" className="btn btn-success w-50">
                  Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
