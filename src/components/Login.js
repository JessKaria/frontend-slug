import React, { useState, useReducer } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";

const Login = props => {
  const [user, setUser] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      username: "jordan",
      password: "chicken"
    }
  );
  const [errors, setErrors] = useState([]);
  const history = useHistory();

  const handleChange = event => {
    const key = event.target.name;
    const newValue = event.target.value;

    setUser({ [key]: newValue });
  };

  const handleSubmit = event => {
    event.preventDefault();

    let url = process.env.REACT_APP_API;

    // console.log('url', url);
    axios
      .post(`${url}/user/login`, {
        user,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        }
      })
      .then(res => {
        // console.log( res )
        if (res.data.token) {
          localStorage.setItem("x-auth-header", res.data.token);
          // localStorage.setItem('userId', res.data.user.id);
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${res.data.token}`;
          // props.loginMessage( true, res.data.user.name )
          history.push("/dashboard");
        } else {
          setErrors(res.data.failure);
          // console.log(error)
        }
      })
      .catch(err => {
        console.warn(err);
      });

    setUser({
      username: "",
      password: ""
    });

    // props.loginDisplay()
  };

  return (
    <div className="Login">
      <h2 className="formTitle">Login</h2>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Username:</label>
          <br />
          <input
            value={user.username}
            onChange={handleChange}
            type="text"
            name="username"
            placeholder="username"
            required
          />
        </div>
        <br />

        <div className="field">
          <label>Password:</label>
          <br />
          <input
            value={user.password}
            onChange={handleChange}
            type="password"
            name="password"
            placeholder="password"
            autoComplete="on"
            required
          />
        </div>
        <br />

        <button className="formButton" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Login;
