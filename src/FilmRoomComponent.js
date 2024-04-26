import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import axios from "axios";
import Cookies from "universal-cookie";
import ReactPlayer from "react-player";
import "./App.css";
import AWS from "aws-sdk";
import emailjs from 'emailjs-com';

const MediaConvert = require("aws-sdk/clients/mediaconvert");
const { ImageInserter } = require("aws-sdk/clients/mediaconvert");

const cookies = new Cookies();
const token = cookies.get("TOKEN");

const s3 = new AWS.S3({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
});

export default function FilmRoomComponent() {
  const [videolist, setVideoList] = useState([]);
  const [result, setResult] = useState([]);
  const [selectedClips, setSelectedClips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const configuration = {
      method: "get",
      url: "https://filmshare-fd851c149ec7.herokuapp.com/api/video/",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((result) => {
        setVideoList(result.data);
      })
      .catch((error) => {
        console.error("Error fetching videos:", error);
      });
  }, []);

  const logout = () => {
    cookies.remove("TOKEN", { path: "/" });
    window.location.href = "/";
  };

  let games = videolist.map((a) => a.game);
  let uniquegames = [...new Set(games)];

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

  let uniqueTags = [];
  let playerTags = new Set();
  let otherTags = new Set();

  videolist.forEach((video) => {
    video.tags.forEach((tag) => {
      const normalizedTag = tag.trim().toLowerCase();
      if (playerNames.includes(normalizedTag)) {
        playerTags.add(normalizedTag);
      } else {
        otherTags.add(normalizedTag);
      }
      if (!uniqueTags.includes(normalizedTag)) {
        uniqueTags.push(normalizedTag);
      }
    });
  });

  const uniquePlayerTags = [...playerTags].sort();
  const uniqueOtherTags = [...otherTags].sort();

  async function handleDownload() {
    setIsLoading(true);
    const mediaconvert = new MediaConvert({
      region: "us-east-1",
      credentials: {
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
      },
      apiVersion: "2017-08-29",
    });

    const playlistContent = selectedClips.map((clip) => clip.link);

    try {
      const jobParams = {
        Role: "arn:aws:iam::816121288668:role/AWSMediaConvertReact",
        Settings: {
          Inputs: playlistContent.map((url) => ({
            FileInput: url,
            AudioSelectors: {
              "Audio Selector 1": {
                Offset: 0,
                DefaultSelection: "DEFAULT",
                ProgramSelection: 1,
              },
            },
          })),
          OutputGroups: [
            {
              Name: "SingleOutputGroup",
              OutputGroupSettings: {
                Type: "FILE_GROUP_SETTINGS",
                FileGroupSettings: {
                  Destination: "s3://mysquadreeldownload/MySquadReel",
                },
              },
              Outputs: [
                {
                  Preset: "System-Generic_Hd_Mp4_Av1_Aac_16x9_640x360p_24Hz_250Kbps_Qvbr_Vq6",
                  NameModifier: `_${Date.now()}`,
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
                            ImageInserterInput: "s3://squadreelogo/squadreel.png",
                            Opacity: 50,
                          },
                        ],
                      },
                    },
                  },
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
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } while (jobStatus !== "COMPLETE");

      const bucket = "mysquadreeldownload";
      const key = "MySquadReel" + jobParams.Settings.OutputGroups[0].Outputs[0].NameModifier + ".mp4";
      const params = {
        Bucket: bucket,
        Key: key,
        Expires: 3600,
      };

      const url = s3.getSignedUrl("getObject", params);
      setDownloadUrl(url);

      // EmailJS integration
      const templateParams = {
        to_name: userEmail,
        message: `Your download is ready: ${url}`,
        reply_to: 'contact@squadreel.com'
      };

      emailjs.send(process.env.REACT_APP_EMAILJS_SERVICE_ID, process.env.REACT_APP_EMAILJS_TEMPLATE_ID, templateParams, process.env.REACT_APP_EMAILJS_USER_ID)
        .then((response) => {
          console.log('Email successfully sent!', response.status, response.text);
        }, (err) => {
          console.error('Failed to send email. Error: ', err);
        });

    } catch (error) {
      console.error("Error creating job:", error);
    } finally {
      setIsLoading(false);
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
            {downloadUrl ? (
              <p>MySquadReel disabled - link already sent to email. Reload page to create another.</p>
            ) : (
              <div>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                />
                <Button
                  variant="primary"
                  onClick={handleDownload}
                  className="create-squadreel-btn"
                  disabled={!selectedClips.length || isLoading} // Disable button when isLoading is true
                  >
                  {isLoading ? (
                    "MySquadReel is processing - check your email in a few minutes for your download link!"
                  ) : (
                    "Create MySquadReel"
                  )}
                </Button>
              </div>
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