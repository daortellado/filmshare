import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import ReactPlayer from "react-player";

export default function AddTactic(props) {
  const [videoname, setVideoName] = useState("");
  const [session, setSession] = useState("");
  const [link, setLink] = useState("");
  const [registerTactic, setRegisterTactic] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const configuration = {
      method: "post",
      url: "https://filmshare-fd851c149ec7.herokuapp.com/addtactic",
      data: {
        videoname,
        session,
        link
      },
    };

    axios(configuration)
      .then((result) => {
        setRegisterTactic(true);
      })
      .catch((error) => {
        error = new Error();
      });
  };

  useEffect(() => {
    setSession(props.sessionSelection);
  }, [props.sessionSelection]);
  
  return (
    <>
      <h2>Add Tactic</h2>
      <Form onSubmit={(e) => handleSubmit(e)}>
        {/* video name */}
        <Form.Group>
          <Form.Label>Video Name</Form.Label>
          <Form.Control
            type="text"
            name="videoname"
            value={videoname}
            onChange={(e) => setVideoName(e.target.value)}
            placeholder="Enter video name"
          />
        </Form.Group>

        {/* session */}
        <Form.Group>
          <Form.Label>Session</Form.Label>
          <Form.Control
            type="text"
            name="session"
            value={props.dropdown ? props.sessionSelection : session}
            onChange={(e) => setSession(e.target.value)}
            placeholder="Enter session name"
          />
        </Form.Group>

        {/* link */}
        <Form.Group>
          <Form.Label>Link</Form.Label>
          <Form.Control
            type="text"
            name="link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Enter video link"
          />
        </Form.Group>

        {/* preview */}
        {link && (
          <div className="video-preview" style={{ marginTop: '20px' }}>
            <ReactPlayer
              url={link}
              controls
              width="100%"
              height="auto"
              loop={true}
            />
          </div>
        )}

        {/* submit button */}
        <Button
          variant="primary"
          type="submit"
          onClick={(e) => handleSubmit(e)}
        >
          Add Tactic
        </Button>

        {/* display success message */}
        {registerTactic ? (
          <p className="text-success">Tactic Added!</p>
        ) : (
          <p className="text-danger">Tactic Not Yet Registered</p>
        )}
      </Form>
    </>
  );
}