import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import { useEffect } from 'react';

export default function Video(props) {
  // initial state
  const [videoname, setVideoName] = useState("");
  const [game, setGame] = useState("");
  const [link, setLink] = useState("");
  const [registervideo, setRegisterVideo] = useState(false);

  const handleSubmit = (e) => {
    // prevent the form from refreshing the whole page
    e.preventDefault();

    // set configurations
    const configuration = {
      method: "post",
      url: "https://filmshare-fd851c149ec7.herokuapp.com/addvideo",
      data: {
        videoname,
        game,
        link
      },
    };

    // make the API call
    axios(configuration)
      .then((result) => {
        setRegisterVideo(true);
      })
      .catch((error) => {
        error = new Error();
      });
  };

  useEffect(() => {
    setGame(props.gameselection);
},[props.gameselection]);
  
  return (
    <>
      <h2>Add Video</h2>
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

        {/* game */}
        <Form.Group>
          <Form.Label>Game</Form.Label>
          <Form.Control
            type="text"
            name="game"
            value={props.dropdown ? props.gameselection : game}
            onChange={(e) => setGame(e.target.value)}
            placeholder="Enter game"
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

        {/* submit button */}
        <Button
          variant="primary"
          type="submit"
          onClick={(e) => handleSubmit(e)}
        >
          Add Video
        </Button>

        {/* display success message */}
        {registervideo ? (
          <p className="text-success">Video Added!</p>
        ) : (
          <p className="text-danger">Video Not Yet Registered</p>
        )}
      </Form>
    </>
  );
}