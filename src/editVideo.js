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
  const [updateStatus, setUpdateStatus] = useState("");

  useEffect(() => {
    if (video) {
      setVideoData({
        videoname: video.videoname || "",
        game: video.game || "",
        link: video.link || "",
        tags: video.tags || []
      });
    }
  }, [video]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const configuration = {
        method: "put",
        url: `https://filmshare-fd851c149ec7.herokuapp.com/api/video/${video._id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: videoData
      };

      const result = await axios(configuration);
      setUpdateStatus("Video updated successfully!");
      
      // Reset status after 3 seconds
      setTimeout(() => setUpdateStatus(""), 3000);
    } catch (error) {
      setUpdateStatus("Error updating video");
      console.error("Error updating video:", error);
    }
  };

  const handleTagsChange = (e) => {
    const tagsArray = e.target.value.split(',').map(tag => tag.trim());
    setVideoData(prev => ({
      ...prev,
      tags: tagsArray
    }));
  };

  if (!video) return null;

  return (
    <div className="mt-4 p-4 border rounded">
      <h3 className="mb-4">Edit Video</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Video Name</Form.Label>
          <Form.Control
            type="text"
            value={videoData.videoname}
            onChange={(e) => setVideoData(prev => ({ ...prev, videoname: e.target.value }))}
            disabled
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Game</Form.Label>
          <Form.Control
            type="text"
            value={videoData.game}
            onChange={(e) => setVideoData(prev => ({ ...prev, game: e.target.value }))}
            disabled
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Link</Form.Label>
          <Form.Control
            type="text"
            value={videoData.link}
            onChange={(e) => setVideoData(prev => ({ ...prev, link: e.target.value }))}
            disabled
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Tags (comma-separated)</Form.Label>
          <Form.Control
            type="text"
            value={videoData.tags.join(', ')}
            onChange={handleTagsChange}
            placeholder="Enter tags separated by commas"
          />
        </Form.Group>

        <Button variant="primary" type="submit">
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