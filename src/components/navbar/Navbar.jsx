import React from 'react';
import './Navbar.css';

export default function Navbar() {
    return (
        <nav className="navbar">
            <a
                onClick={() =>
                    document
                        .getElementById('iacopo-schianchi')
                        ?.scrollIntoView({ scrollBehavior: 'smooth' })
                }
                className="nav-button"
            >
                Iacopo Schianchi
            </a>
            <a
                onClick={() =>
                    document
                        .getElementById('experience')
                        ?.scrollIntoView({ scrollBehavior: 'smooth' })
                }
                className="nav-button"
            >
                Experience
            </a>
            <a
                onClick={() =>
                    document
                        .getElementById('projects')
                        ?.scrollIntoView({ scrollBehavior: 'smooth' })
                }
                className="nav-button"
            >
                Projects
            </a>
            <a
                onClick={() =>
                    document
                        .getElementById('skills')
                        ?.scrollIntoView({ scrollBehavior: 'smooth' })
                }
                className="nav-button"
            >
                Skills
            </a>
            <a
                onClick={() =>
                    document
                        .getElementById('about-me')
                        ?.scrollIntoView({ scrollBehavior: 'smooth' })
                }
                className="nav-button"
            >
                About me
            </a>
            <a
                onClick={() =>
                    document
                        .getElementById('contact-me')
                        ?.scrollIntoView({ scrollBehavior: 'smooth' })
                }
                className="nav-button"
            >
                Contact me
            </a>
            <a href="/#/blogs" className="nav-button">
                Blog &#x279C;
            </a>
        </nav>
    );
}
