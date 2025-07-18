import { useState, useEffect } from 'react';
import './Navbar.css';

export default function Navbar() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 800);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 850);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    function onClick(id) {
        document
            .getElementById(id)
            ?.scrollIntoView({ scrollBehavior: 'smooth' });

        if (isMobile) setVisible(false);
    }

    return (
        <div className={`nav-container ${!visible && 'hidden'}`}>
            {isMobile && (
                <button
                    className="hamburger-button"
                    onClick={() => setVisible((prev) => !prev)}
                    aria-label="Toggle menu"
                >
                    &#9776;
                </button>
            )}
            <nav
                className={
                    isMobile ? `mobile-navbar ${visible && 'open'}` : 'navbar'
                }
            >
                <a
                    onClick={() => onClick('iacopo-schianchi')}
                    className="nav-button"
                >
                    IS
                </a>
                <a onClick={() => onClick('experience')} className="nav-button">
                    Experience
                </a>
                <a onClick={() => onClick('projects')} className="nav-button">
                    Projects
                </a>
                <a onClick={() => onClick('skills')} className="nav-button">
                    Skills
                </a>
                {/* <a onClick={() => onClick('about-me')} className="nav-button">
                    About
                </a> */}
                <a onClick={() => onClick('contact-me')} className="nav-button">
                    Contact
                </a>
                <a href="/#/blogs" className="nav-button">
                    Blog &#x279C;
                </a>
            </nav>
        </div>
    );
}
