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
  
  // Local state for smooth typing (prevents the cursor jumping glitch)
  const [tagInput, setTagInput] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");

  // Sync component state when a new video is selected from the parent
  useEffect(() => {
    if (video) {
      setVideoData({
        videoname: video.videoname || "",
        game: video.game || "",
        link: video.link || "",
        tags: video.tags || []
      });
      // Convert the tags array to a comma-separated string for the input field
      setTagInput(Array.isArray(video.tags) ? video.tags.join(', ') : "");
    }
  }, [video]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Convert string back to a clean array
    const tagsArray = tagInput.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0); 

    try {
      const configuration = {
        method: "put",
        url: `https://filmshare-fd851c149ec7.herokuapp.com/api/video/${encodeURIComponent(video.videoname)}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        // We include 'game' here so the backend can find the EXACT record
        data: {
          videoname: video.videoname,
          game: video.game, 
          link: videoData.link,
          tags: tagsArray 
        }
      };

      const response = await axios(configuration);
      
      if (response.status === 200) {
        setUpdateStatus("Video updated successfully!");
      }
      
      // Clear the message after 3 seconds
      setTimeout(() => setUpdateStatus(""), 3000);
    } catch (error) {
      console.error("Error updating video:", error);
      setUpdateStatus("Error updating video. Ensure backend is updated.");
    }
  };

  if (!video) return null;

  return (
    <div className="mt-4">
      <h3 className="mb-4">Edit Video</h3>
      {/* Small helper text to confirm which specific video is being edited */}
      <p className="text-muted small">Targeting: <strong>{video.videoname}</strong> from <strong>{video.game}</strong></p>
      
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
          <Form.Label>Video Link</Form.Label>
          <Form.Control
            type="text"
            value={videoData.link}
            onChange={(e) => setVideoData(prev => ({ ...prev, link: e.target.value }))}
            placeholder="Enter URL"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Tags (comma-separated)</Form.Label>
          <Form.Control
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)} 
            placeholder="Goal, Save, Header"
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="w-100">
          Update Video
        </Button>

        {updateStatus && (
          <div className={`mt-3 text-center text-${updateStatus.includes('Error') ? 'danger' : 'success'}`}>
            {updateStatus}
          </div>
        )}
      </Form>
    </div>
  );
}