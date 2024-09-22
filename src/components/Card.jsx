import React from 'react';
import ReactPlayer from 'react-player';
import './Card.css';

export default function Card({
  name,
  description,
  videoUrl,
  imageUrl,
  skillsDeveloped,
  url,
}) {
  return (
    <a className="card" href={url} target="_blank">
      <div className="video-container">
        <ReactPlayer
          url={videoUrl}
          playing={true}
          loop={true}
          muted={true}
          width={'26.9vw'}
          height={'15.117vw'}
        />
      </div>
      <div className="project-info">
        <h2 className="title">{name}</h2>
        <p>{description}</p>
      </div>
    </a>
  );
}
