import React from 'react';
import ReactPlayer from 'react-player';
import './Card.css';

export default function Card({
  name,
  description,
  videoUrl,
  imageUrl,
  skillsDeveloped,
  company,
  url,
  dateStarted,
  dateEnded,
}) {
  return (
    <a className="card" href={url} target="_blank">
      {videoUrl && (
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
      )}
      {imageUrl && <img src={imageUrl} className="image" />}
      <div className="project-info">
        <div>
          <div className="top-bar">
            <h2 className="title">{name}</h2>
            {dateStarted && (
              <h3 className="work-period">
                {dateStarted} - {dateEnded}
              </h3>
            )}
          </div>
          {company && <h4 className="company">{company}</h4>}
        </div>
        <p>{description}</p>
      </div>
    </a>
  );
}
