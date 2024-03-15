import React, { useEffect, useState, useRef } from "react";
import { Button, Spinner } from "react-bootstrap";
import axios from "axios";
import Cookies from "universal-cookie";
import ReactPlayer from 'react-player';
import './App.css';
import AWS from 'aws-sdk';
const MediaConvert = require('aws-sdk/clients/mediaconvert'); // Assuming CommonJS (Node.js) environment
const { ImageInserter } = require('aws-sdk/clients/mediaconvert');

//cookies

const cookies = new Cookies();

// get token generated on login
const token = cookies.get("TOKEN");

// s3
const s3 = new AWS.S3({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  // Other configuration options like region if needed
});

export default function FilmRoomComponent() {
  // set an initial state for the message we will receive after the API call
  const [videolist, setVideoList] = useState([]);
  const [result, setResult] = useState([]);
  const [selectedClips, setSelectedClips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  
  // useEffect automatically executes once the page is fully loaded
  useEffect(() => {
    // set configurations for the API call here
    const configuration = {
      method: "get",
      url: "https://filmshare-fd851c149ec7.herokuapp.com/api/video/",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    // make the API call
    axios(configuration)
      .then((result) => {
        // assign the message in our result to the message we initialized above
        setVideoList(result.data);
        console.log();
      })
      .catch((error) => {
        console.error("Error fetching videos:", error); // Improved error handling
      });
  }, []);

  // logout
  const logout = () => {
    // destroy the cookie
    cookies.remove("TOKEN", { path: "/" });
    // redirect user to the landing page
    window.location.href = "/";
  };

  // unique game extraction

  let games = videolist.map(a => a.game);
  let uniquegames = [...new Set(games)];

  // Define the list of player names
  const playerNames = [
    "allie",
    "abbie",
    "jaden",
    "gabi",
    "ella",
    "brandi",
    "amelia",
    "sophia",
    "maya",
    "emily",
    "z",
    "sierra",
    "annya",
    "audrey",
    "jane",
    "liliana",
    "mila",
    "madison",
    "aylin",
    "jhansi",
  ];

  // Generate unique tags, categorize player tags, and create buttons:
  let uniqueTags = [];
  let playerTags = new Set();
  let otherTags = new Set();

  videolist.forEach(video => {
    video.tags.forEach(tag => {
      const normalizedTag = tag.trim().toLowerCase();
      if (playerNames.includes(normalizedTag)) {
        playerTags.add(normalizedTag); // Use Set for uniqueness
      } else {
        otherTags.add(normalizedTag); // Use Set for uniqueness
      }
      if (!uniqueTags.includes(normalizedTag)) {
        uniqueTags.push(normalizedTag);
      }
    });
  });

  // Convert Sets to arrays and sort alphabetically
  const uniquePlayerTags = [...playerTags].sort(); // Assuming playerTags is populated from videolist.tags
  const uniqueOtherTags = [...otherTags].sort(); // Assuming otherTags is populated from videolist.tags

  async function handleDownload() {
    setIsLoading(true);

    const mediaconvert = new MediaConvert({
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
      },
      apiVersion: '2017-08-29',
    });

    const playlistContent = selectedClips.map(clip => clip.link);

    try {
      const jobParams = {
        Role: 'arn:aws:iam::816121288668:role/AWSMediaConvertReact',
        Settings: {
          Inputs: playlistContent.map(url => ({
            FileInput: url,
            AudioSelectors: {
              "Audio Selector 1": {
                "Offset": 0,
                "DefaultSelection": "DEFAULT",
                "ProgramSelection": 1
              }
            }
          })),
          OutputGroups: [
            {
              Name: 'SingleOutputGroup',
              OutputGroupSettings: {
                "Type": "FILE_GROUP_SETTINGS",
                "FileGroupSettings": {
                  "Destination": "s3://filmshareclipdownload/MySquadReel" // Base destination with prefix
                }
              },
              Outputs: [
                {
                  Preset: 'System-Generic_Hd_Mp4_Av1_Aac_16x9_640x360p_24Hz_250Kbps_Qvbr_Vq6',
                  NameModifier: `_${Date.now()}`, // Append timestamp suffix
                  VideoDescription: {
                    Width: 640,
                    Height: 360,
                    VideoPreprocessors: {
                      ImageInserter: {
                        InsertableImages: [
                          {
                            ImageX: 100,
                            ImageY: 25,
                            Height: 75,
                            Width: 75,
                            Layer: 1,
                            ImageInserterInput: "s3://filmshareclipdownload/squadreel.png",
                            Opacity: 50
                          }
                        ]
                      }
                    }
                  }        
                },
              ],
            },
          ],
        },
      };

      const job = await mediaconvert.createJob(jobParams).promise();

      let jobStatus;
      do {
        const { Job } = await mediaconvert.getJob({ Id: job.Job.Id }).promise();
        jobStatus = Job.Status;
        await new Promise(resolve => setTimeout(resolve, 5000));
      } while (jobStatus !== 'COMPLETE');

      const bucket = "filmshareclipdownload"
      const key = "MySquadReel" + jobParams.Settings.OutputGroups[0].Outputs[0].NameModifier + ".mp4";
  
      const params = {
        Bucket: bucket,
        Key: key,
        Expires: 3600
      };
      const url = s3.getSignedUrl('getObject', params);
      setDownloadUrl(url); // Update downloadUrl state with S3 link
    } catch (error) {
      console.error('Error creating job:', error);
    } finally {
      setIsLoading(false); // Always set isLoading to false regardless of success or failure
    }
  }
  
  return (
    <div className="text-center">
      <h4>Select a <b>game</b> by clicking one of the buttons below:</h4>
      <div className="App">
        <p>
          {uniquegames.map((game) => (
            <button
              class="btn btn-outline-light"
              value={game}
              onClick={(e) => {
                setResult(videolist.filter((video) => video.game === game));
                console.log(result);
              }}
            >
              {game}
            </button>
          ))}
        </p>
        <h4>Or select a <b>tag</b> by clicking one of the buttons below:</h4>
        <p>
          <p><h5><i>Players</i></h5></p>
          {uniquePlayerTags.map((tag) => (
            <button key={tag} class="btn btn-outline-light" value={tag} onClick={() => {
              setResult(videolist.filter(video => video.tags.some(videoTag => videoTag.trim().toLowerCase() === tag)));
              setSelectedClips([]); // Deselect all on tag click
              console.log(result);
            }}>
              {tag}
            </button>
          ))}
  
          <p><h5><i>Other Tags</i></h5></p>
          {uniqueOtherTags.map((tag) => (
            <button key={tag} class="btn btn-outline-light" value={tag} onClick={() => {
              setResult(videolist.filter(video => video.tags.some(videoTag => videoTag.trim().toLowerCase() === tag)));
              setSelectedClips([]); // Deselect all on tag click
              console.log(result);
            }}>
              {tag}
            </button>
          ))}
        </p>
        {result.length > 0 && (  
        <> 
    <Button variant="outline-primary" size="sm" onClick={() => setSelectedClips(result)}>  
      Select All
    </Button>
    <Button variant="outline-danger" size="sm" onClick={() => setSelectedClips([])}>
      Clear All Selections
    </Button>
          <h4>Selected Videos:</h4>
          <ul class="no-bullets">
            {selectedClips.map((video) => (
              <li key={video.link}>{video.videoname} ({video.game})</li>
            ))}
          </ul>
          <Button variant="primary" disabled={!selectedClips.length}>
  {downloadUrl ? ( // Check if downloadUrl exists (has a value)
    <Button variant="success" href={downloadUrl} download>
      Download MySquadReel
    </Button>
  ) : (
    isLoading ? (
      <>
        <Spinner
          as="span"
          animation="border"
          size="sm"
          role="status"
          aria-hidden="true"
        />
        {' '}
        Processing...
      </>
    ) : (
      <button variant="primary" onClick={handleDownload} className="create-squadreel-btn">  Create MySquadReel
      </button>
    )
  )}
</Button>
        </>
      )}
        <p>
          {result.map((video) => (
            <div className="paddeddiv">
              <div className="card">
                <b>{video.videoname}</b>
                <i>{video.game}</i>
                <input
                  type="checkbox"
                  checked={selectedClips.includes(video)}
                  onChange={() => {
                    setSelectedClips((prev) =>
                      prev.includes(video)
                        ? prev.filter((clip) => clip !== video)
                        : [...prev, video]
                    );
                  }}
                  className="custom-checkbox"
                  style={{ margin: '0 auto' }}
                />
              </div>
              <div className="player-wrapper">
                <ReactPlayer controls url={video.link} className="react-player" width="100%" height="100%" />
              </div>
            </div>
          ))}
        </p>
      </div>
      {/* Logout button */}
      <Button type="submit" variant="danger" onClick={logout}>
        Logout
      </Button>
    </div>
  );
}