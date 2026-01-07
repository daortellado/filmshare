import React, { useState } from "react";
import axios from "axios";
import { Table, Button, Form, Alert, ProgressBar } from "react-bootstrap";

export default function BatchVideo({ gameselection, dropdown }) {
  const [inputLinks, setInputLinks] = useState("");
  const [stagedVideos, setStagedVideos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleProcessLinks = () => {
    if (!inputLinks.trim()) return;
    const links = inputLinks.split("\n").filter((link) => link.trim() !== "");
    
    const newBatch = links.map((url, index) => {
      const decodedUrl = decodeURIComponent(url);
      const filename = decodedUrl.substring(decodedUrl.lastIndexOf('/') + 1);
      const title = filename.replace(/\.[^/.]+$/, ""); 

      return {
        id: index,
        videoname: title, 
        link: url.trim(),
        game: gameselection,
        tags: "", 
        status: "pending" 
      };
    });
    setStagedVideos(newBatch);
  };

  const handleRowChange = (id, field, value) => {
    setStagedVideos((prev) =>
      prev.map((vid) => (vid.id === id ? { ...vid, [field]: value } : vid))
    );
  };

  const handleBatchUpload = async () => {
    if (!gameselection) {
      alert("Please enter or select a game name first!");
      return;
    }

    setIsUploading(true);
    let completedCount = 0;

    for (const video of stagedVideos) {
      if (video.status === "success") {
        completedCount++;
        continue;
      }

      // MATCHING YOUR WORKING CONFIGURATION EXACTLY
      const configuration = {
        method: "post",
        url: "https://filmshare-fd851c149ec7.herokuapp.com/addvideo",
        data: {
          videoname: video.videoname,
          game: gameselection, // Using the prop passed from Admin
          link: video.link,
          tags: video.tags 
        },
      };

      try {
        await axios(configuration);
        setStagedVideos((prev) =>
          prev.map((v) => (v.id === video.id ? { ...v, status: "success" } : v))
        );
      } catch (error) {
        console.error("Upload failed", error);
        setStagedVideos((prev) =>
          prev.map((v) => (v.id === video.id ? { ...v, status: "error" } : v))
        );
      }

      completedCount++;
      setUploadProgress(Math.round((completedCount / stagedVideos.length) * 100));
    }

    setIsUploading(false);
  };

  if (!dropdown) return <Alert variant="info" className="mt-3">Select or enter a Game name above to start.</Alert>;

  return (
    <div className="mt-4 border-top pt-3">
      <h4>Batch Upload: {gameselection}</h4>
      
      {stagedVideos.length === 0 ? (
        <div className="mb-3">
          <Form.Group>
            <Form.Label>Paste URLs from Batch Script</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              value={inputLinks}
              onChange={(e) => setInputLinks(e.target.value)}
            />
          </Form.Group>
          <Button className="mt-2 w-100" onClick={handleProcessLinks} disabled={!inputLinks}>
            Process Links
          </Button>
        </div>
      ) : (
        <div>
          <div className="d-flex justify-content-between mb-2">
            <Button variant="outline-secondary" size="sm" onClick={() => setStagedVideos([])}>Clear</Button>
            <Button variant="success" onClick={handleBatchUpload} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Save All to DB"}
            </Button>
          </div>

          {isUploading && <ProgressBar animated now={uploadProgress} label={`${uploadProgress}%`} className="mb-3" />}

          <Table striped bordered hover size="sm" responsive>
            <thead>
              <tr>
                <th>Title</th>
                <th>Tags</th>
                <th style={{width: '50px'}}>Status</th>
              </tr>
            </thead>
            <tbody>
              {stagedVideos.map((video) => (
                <tr key={video.id}>
                  <td>
                    <Form.Control size="sm" value={video.videoname} onChange={(e) => handleRowChange(video.id, "videoname", e.target.value)} />
                  </td>
                  <td>
                    <Form.Control size="sm" placeholder="tag1, tag2" value={video.tags} onChange={(e) => handleRowChange(video.id, "tags", e.target.value)} />
                  </td>
                  <td className="text-center">{video.status === 'success' ? "✅" : video.status === 'error' ? "❌" : "⏳"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}