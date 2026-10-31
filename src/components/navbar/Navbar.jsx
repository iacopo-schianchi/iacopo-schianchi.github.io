import { useState, useEffect } from 'react';
import './Navbar.css';
import ContactMe from '../contact-me/ContactMe';

export default function Navbar({ sections }) {
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
        const targetElement = document.getElementById(id);
        const scrollContainer = document.querySelector('.page-content');

        if (targetElement && scrollContainer) {
            const topPos =
                scrollContainer.scrollTop +
                targetElement.getBoundingClientRect().top -
                scrollContainer.getBoundingClientRect().top;
            scrollContainer.scrollTo({
                top: topPos,
                behavior: 'smooth',
            });
        } else {
            targetElement?.scrollIntoView({ behavior: 'smooth' });
        }

        if (isMobile) setVisible(false);
    }

    return (
        <div className={`nav-container ${!visible && 'hidden'}`}>
            <h1 className="name">
                Hi, I'm <span className="highlight">Iacopo</span>
            </h1>
            <div>
                <h2 style={{ marginBottom: 10 }}>
                    NLP &bull; Explainability &bull; Computer Vision
                </h2>
                <p>
                    Researching and building more explainable, reliable NLP and
                    computer vision systems
                </p>
            </div>
            <nav
                className={
                    isMobile ? `mobile-navbar ${visible && 'open'}` : 'navbar'
                }
            >
                {sections?.map(({ id, title }) => (
                    <a onClick={() => onClick(id)} key={id}>
                        {title}
                    </a>
                ))}
            </nav>
            <ContactMe />

            {/* {isMobile && (
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
                <a onClick={() => onClick('contact-me')} className="nav-button">
                    Contact
                </a>
            </nav> */}
        </div>
    );
}
