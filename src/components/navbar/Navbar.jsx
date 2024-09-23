import React from 'react';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <a href="#hero" className="nav-button">
        Iacopo Schianchi
      </a>
      <a href="#skills" className="nav-button">
        Skills
      </a>
      <a href="#projects" className="nav-button">
        Projects
      </a>
    </nav>
  );
}
