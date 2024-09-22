import React from 'react';
import './SkillBar.css';

export default function SkillBar({ name, ability }) {
  return (
    <div className="skill-bar-container">
      <p className="name">{name}</p>
      <div className="bar">
        <div className="progress" style={{ width: `${ability}%` }}></div>
      </div>
    </div>
  );
}
