import React from 'react';
import './Glow.css';

export default function Glow({ top, left }) {
  return (
    <div
      className="glow"
      style={{
        top: top,
        left: left,
      }}
    ></div>
  );
}
