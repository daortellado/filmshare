import React, { useState } from "react";
import axios from "axios";
import { Table, Button, Form, Alert, ProgressBar } from "react-bootstrap";
import Cookies from "universal-cookie";

const cookies = new Cookies();
const token = cookies.get("TOKEN");

export default function BatchVideo({ gameselection, dropdown }) {
  const [inputLinks, setInputLinks] = useState("");
  const [stagedVideos, setStagedVideos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Parse the pasted links into a table
  const handleProcessLinks = () => {
    if (!inputLinks.trim()) return;

    const links = inputLinks.split("\n").filter((link) => link.trim() !== "");
    
    const newBatch = links.map((url, index) => {
      // Decode URL to get a readable filename for the title
      // Example: .../1-0%20WC%20Goal.mp4 -> 1-0 WC Goal
      const decodedUrl = decodeURIComponent(url);
      const filename = decodedUrl.substring(decodedUrl.lastIndexOf('/') + 1);
      const title = filename.replace(/\.[^/.]+$/, ""); // Remove extension

      return {
        id: index,
        videoname: title, 
        link: url.trim(),
        game: gameselection,
        tags: "", // Placeholder for tags/notes
        status: "pending" // pending, success, error
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
      alert("Please select a game from the dropdown above first!");
      return;
    }

    setIsUploading(true);
    let completedCount = 0;

    for (const video of stagedVideos) {
      if (video.status === "success") {
        completedCount++;
        continue;
      }

      try {
        await axios({
          method: "post",
          url: "https://filmshare-fd851c149ec7.herokuapp.com/api/video/",
          headers: { Authorization: `Bearer ${token}` },
          data: {
            videoname: video.videoname,
            link: video.link,
            game: gameselection,
            // Assuming your backend accepts a 'tags' field. 
            // If not, you might need to append this to 'videoname' or handle differently.
            tags: video.tags 
          },
        });

        setStagedVideos((prev) =>
          prev.map((v) => (v.id === video.id ? { ...v, status: "success" } : v))
        );
      } catch (error) {
        console.error("Upload failed for", video.videoname, error);
        setStagedVideos((prev) =>
          prev.map((v) => (v.id === video.id ? { ...v, status: "error" } : v))
        );
      }

      completedCount++;
      setUploadProgress(Math.round((completedCount / stagedVideos.length) * 100));
    }

    setIsUploading(false);
    
    // Check if all succeeded
    const allSuccess = stagedVideos.every(v => v.status === "success" || (completedCount > 0 && v.status === "success"));
    if (allSuccess && completedCount === stagedVideos.length) {
         alert("All videos uploaded successfully!");
         setStagedVideos([]); // Clear table on full success
         setInputLinks("");
    }
  };

  if (!dropdown) return <Alert variant="info" className="mt-3">Please select a Game from the dropdown above to begin.</Alert>;

  return (
    <div className="mt-4">
      <h4 className="mb-3">Batch Upload</h4>
      
      {stagedVideos.length === 0 ? (
        <div className="mb-3">
          <Form.Group>
            <Form.Label>Paste Links from Batch Script (One per line)</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              placeholder="https://wchsfilmshare.b-cdn.net/..."
              value={inputLinks}
              onChange={(e) => setInputLinks(e.target.value)}
            />
          </Form.Group>
          <Button className="mt-2" onClick={handleProcessLinks} disabled={!inputLinks}>
            Generate List
          </Button>
        </div>
      ) : (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Button variant="outline-secondary" size="sm" onClick={() => setStagedVideos([])}>
              Cancel / Clear
            </Button>
            <Button variant="success" onClick={handleBatchUpload} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload All to DB"}
            </Button>
          </div>

          {isUploading && <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} className="mb-3" />}

          <Table striped bordered hover size="sm" responsive>
            <thead>
              <tr>
                <th style={{width: '40%'}}>Title</th>
                <th style={{width: '40%'}}>Tags</th>
                <th style={{width: '20%'}}>Status</th>
              </tr>
            </thead>
            <tbody>
              {stagedVideos.map((video) => (
                <tr key={video.id}>
                  <td>
                    <Form.Control
                      type="text"
                      size="sm"
                      value={video.videoname}
                      onChange={(e) => handleRowChange(video.id, "videoname", e.target.value)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      size="sm"
                      placeholder="e.g. Free Kick, Goal"
                      value={video.tags}
                      onChange={(e) => handleRowChange(video.id, "tags", e.target.value)}
                    />
                  </td>
                  <td style={{verticalAlign: 'middle', textAlign: 'center'}}>
                    {video.status === 'pending' && <span className="text-muted">Waiting</span>}
                    {video.status === 'success' && <span className="text-success">✅ Saved</span>}
                    {video.status === 'error' && <span className="text-danger">❌ Error</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}