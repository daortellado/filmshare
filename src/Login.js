import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import Cookies from "universal-cookie";
const cookies = new Cookies();

export default function Login() {
  // initial state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const token = cookies.get("TOKEN");

  const handleSubmit = (e) => {
    // prevent the form from refreshing the whole page
    e.preventDefault();

    // set configurations
    const configuration = {
      method: "post",
      url: "https://filmshare-fd851c149ec7.herokuapp.com/login",
      data: {
        username,
        password,
      },
    };

    // make the API call
    axios(configuration)
      .then((result) => {
        // set the cookie
        cookies.set("TOKEN", result.data.token, {
          path: "/",
        });
        // redirect user to the auth page
        window.location.href = "/wchsws/filmroom";
      })
      .catch((error) => {
        error = new Error();
      });
  };

  return (
    <div className='text-center'>
      <h2>Welcome, <b>Warriors!</b></h2>
      <img src="/wclogo.jpeg" alt="west campus logo"></img>
      <Form style={{display: token ? 'none' : 'block' }} onSubmit={(e) => handleSubmit(e)}>
        {/* username */}
        <Form.Group>
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />
        </Form.Group>

        {/* password */}
        <Form.Group controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </Form.Group>

        {/* submit button */}
        <Button
          variant="primary"
          type="submit"
          onClick={(e) => handleSubmit(e)}
        >
          Login
        </Button>

        {/* display success message */}
      </Form>
      {token ? (
          <p className="text-success">You Are Logged In</p>
        ) : (
          <p className="text-danger">You Are Not Logged In</p>
        )}
        <i>Review video of this season's games by clicking on "FilmRoom" above.</i>
      </div>
  );
}
