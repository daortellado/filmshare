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
  
  // Local state for smooth typing
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
      // Convert current tags array to a comma-separated string for the input
      setTagInput(Array.isArray(video.tags) ? video.tags.join(', ') : "");
    }
  }, [video]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clean up the tags before sending
    const tagsArray = tagInput.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0); 

    try {
      const configuration = {
        method: "put",
        // CRITICAL: Using the unique database ID instead of the non-unique name
        url: `https://filmshare-fd851c149ec7.herokuapp.com/api/video/${video._id}`, 
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          videoname: videoData.videoname,
          game: videoData.game,
          link: videoData.link,
          tags: tagsArray 
        }
      };

      await axios(configuration);
      setUpdateStatus("Video updated successfully!");
      
      // Clear status after 3 seconds
      setTimeout(() => setUpdateStatus(""), 3000);
    } catch (error) {
      console.error("Error updating video:", error);
      setUpdateStatus("Error updating video. Please check console.");
    }
  };

  if (!video) return null;

  return (
    <div className="mt-4">
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
            onChange={(e) => setTagInput(e.target.value)} 
            placeholder="Goal, Save, Header"
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="w-100">
          Update Video
        </Button>

        {updateStatus && (
          <div className={`mt-3 text-${updateStatus.includes('Error') ? 'danger' : 'success'}`}>
            {updateStatus}
          </div>
        )}
      </Form>
    </div>
  );
}