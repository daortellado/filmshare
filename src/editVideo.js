import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import Cookies from "universal-cookie";

const cookies = new Cookies();
const token = cookies.get("TOKEN");

export default function EditVideo({ video }) {
  const [videoData, setVideoData] = useState({
    videoname: "",
    game: "",
    link: "",
    tags: []
  });
  
  // NEW: Local state for the text input to prevent jumping/glitching
  const [tagInput, setTagInput] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");

  useEffect(() => {
    if (video) {
      setVideoData({
        videoname: video.videoname || "",
        game: video.game || "",
        link: video.link || "",
        tags: video.tags || []
      });
      // Convert the array to a string for the input field on load
      setTagInput(video.tags ? video.tags.join(', ') : "");
    }
  }, [video]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Convert the text input back into a clean Array for the database
    const tagsArray = tagInput.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== ""); // Remove empty tags if someone leaves a trailing comma

    try {
      const configuration = {
        method: "put",
        // Notice: Use the original video prop name in case videoname was changed in state
        url: `https://filmshare-fd851c149ec7.herokuapp.com/api/video/${encodeURIComponent(video.videoname)}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          link: videoData.link,
          tags: tagsArray // Send the cleaned array
        }
      };

      await axios(configuration);
      setUpdateStatus("Video updated successfully!");
      
      setTimeout(() => setUpdateStatus(""), 3000);
    } catch (error) {
      console.error("Error updating video:", error);
      setUpdateStatus("Error updating video. Please try again.");
    }
  };

  if (!video) return null;

  return (
    <div className="mt-4 border p-3 rounded bg-light">
      <h3 className="mb-4">Edit Video</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Video Name</Form.Label>
          <Form.Control
            type="text"
            value={videoData.videoname}
            disabled
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Game</Form.Label>
          <Form.Control
            type="text"
            value={videoData.game}
            disabled
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Link</Form.Label>
          <Form.Control
            type="text"
            value={videoData.link}
            onChange={(e) => setVideoData(prev => ({ ...prev, link: e.target.value }))}
            placeholder="Enter video link"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Tags (comma-separated)</Form.Label>
          <Form.Control
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)} // Smooth typing
            placeholder="Goal, Free Kick, Save"
          />
          <Form.Text className="text-muted">
            Separate tags with commas.
          </Form.Text>
        </Form.Group>

        <Button variant="primary" type="submit" className="w-100">
          Update Video
        </Button>

        {updateStatus && (
          <div className={`mt-3 text-center fw-bold text-${updateStatus.includes('Error') ? 'danger' : 'success'}`}>
            {updateStatus}
          </div>
        )}
      </Form>
    </div>
  );
}