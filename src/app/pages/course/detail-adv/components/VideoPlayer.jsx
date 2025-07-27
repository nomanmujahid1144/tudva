"use client";

import dynamic from "next/dynamic";
const Plyr = dynamic(() => import("plyr-react"));
import "plyr-react/plyr.css";
const VideoPlayer = () => {
  return <div className="video-player rounded-3">
      <Plyr playsInline crossOrigin="anonymous" controls source={{
      tracks: [{
        kind: "captions",
        label: "English",
        src: "/videos/en.vtt",
        srcLang: "en",
        default: true
      }, {
        kind: "captions",
        label: "French",
        src: "/videos/fr.vtt",
        srcLang: "fr"
      }],
      type: "video",
      poster: "/videos/poster.jpg",
      sources: [{
        src: '/videos/360p.mp4',
        size: 360
      }, {
        src: '/videos/720p.mp4',
        size: 720
      }, {
        src: '/videos/1080p.mp4',
        size: 1080
      }]
    }} />
    </div>;
};
export default VideoPlayer;
