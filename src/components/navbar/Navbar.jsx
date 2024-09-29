import React from 'react';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <a href="#iacopo-schianchi" className="nav-button">
        Iacopo Schianchi
      </a>
      <a href="#about-me" className="nav-button">
        About me
      </a>
      <a href="#experience" className="nav-button">
        Experience
      </a>
      <a href="#projects" className="nav-button">
        Projects
      </a>
      <a href="#skills" className="nav-button">
        Skills
      </a>
      <a href="#contact-me" className="nav-button">
        Contact me
      </a>
    </nav>
  );
}
