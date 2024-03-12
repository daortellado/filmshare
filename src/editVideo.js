import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import Cookies from "universal-cookie";

const cookies = new Cookies();

export default function EditVideo({ video }) {
  const [selectedVideo, setSelectedVideo] = useState(video);
  const [editVideoSuccess, setEditVideoSuccess] = useState(""); // State for success message

  useEffect(() => {
    setSelectedVideo(video);
  }, [video]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedVideo = {
      ...selectedVideo,
      link: e.target.elements.link.value,
      tags: e.target.elements.tags.value.split(","),
    };

    const token = cookies.get("TOKEN");

    try {
      const configuration = {
        method: "put",
        url: `https://filmshare-fd851c149ec7.herokuapp.com/api/video/${selectedVideo.videoname}?game=${selectedVideo.game}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: updatedVideo,
      };

      const response = await axios(configuration);

      setEditVideoSuccess(response.data.message || "Video updated successfully"); // Set success message

    } catch (error) {
      // Handle update errors
      console.error("Error updating video:", error);
      // Implement error message display or other feedback
    }
  };

  return (
    <>
      <h2>Edit Video</h2>
      {selectedVideo && (
        <Form onSubmit={handleSubmit}>
        {/* video name (pre-populated) */}
        <Form.Group>
          <Form.Label>Video Name</Form.Label>
          <Form.Control type="text" name="videoname" value={selectedVideo.videoname} disabled />
        </Form.Group>

        {/* game (pre-populated) */}
        <Form.Group>
          <Form.Label>Game</Form.Label>
          <Form.Control type="text" name="game" value={selectedVideo.game} disabled />
        </Form.Group>

        {/* link */}
        <Form.Group>
          <Form.Label>Link</Form.Label>
          <Form.Control
            type="text"
            name="link"
            value={selectedVideo.link || ""} // Pre-populate link from state (handle potential undefined value)
            onChange={(e) => setSelectedVideo({ ...selectedVideo, link: e.target.value })}
          />
        </Form.Group>

        {/* tags */}
        <Form.Group>
          <Form.Label>Tags</Form.Label>
          <Form.Control
            type="text"
            name="tags"
            value={selectedVideo.tags?.join(",") || ""} // Handle potential undefined value and join tags array
            onChange={(e) => setSelectedVideo({ ...selectedVideo, tags: e.target.value.split(",") })}
          />
        </Form.Group>

        {/* submit button */}
        <Button variant="primary" type="submit">
          Update Video
        </Button>
        {editVideoSuccess ? (
            <p className="text-success">{editVideoSuccess}</p>
          ) : null} {/* Conditionally render success message */}
        </Form>
      )}
    </>
  );
}
