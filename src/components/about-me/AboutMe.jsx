import { useState, useRef, useEffect } from 'react';
import SectionHeader from '../SectionHeader';
import Glow from '../Glow';
import './AboutMe.css';

export default function AboutMe({ images }) {
  const text = ' software\nengineer intern who enjoys';
  const elementRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const imageElements = images.map((image, index) => (
    <img className="image" src={image} alt="" />
  ));
  const [imageIndex, setImageIndex] = useState(0);
  const breakSeconds = 6;

  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prevImageIndex) => {
        return prevImageIndex + 1 === images.length ? 0 : prevImageIndex + 1;
      });
    }, breakSeconds * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleScroll() {
      if (elementRef.current) {
        setScrollPosition(elementRef.current.scrollTop);
      }
    }

    if (elementRef.current) {
      elementRef.current.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (elementRef.current) {
        elementRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [elementRef]);

  return (
    <div className="section about-me" id="about-me">
      <SectionHeader text="About me" />
      <Glow top="500vh" left="80vw" />
      <div className="sections">
        <div className="info">
          <div className="top">
            <p className="about-me-text">
              <span className="highlighted">Fullstack</span>
              {text}
            </p>
            <div ref={elementRef} className="activity-container">
              <p className="activity-text">skiing</p>
              <p className="activity-text">tennis</p>
              <p className="activity-text">time with family</p>
              <p className="activity-text">robotics</p>
              <p className="activity-text">game development</p>
              <p className="activity-text">traveling</p>
              <p className="activity-text">soccer</p>
              <p className="activity-text">creating</p>
              <div
                style={{ transform: `translateY(${scrollPosition}px)` }}
                className="overlay"
              ></div>
            </div>
          </div>
          <p className="about-me-text">
            <span className="highlighted">Italian </span>
            fluent in English, Italian, and partly Spanish
          </p>
          <p className="about-me-text">
            Lived in the Czech Republic, Belgium, Romania, Switzerland, Iowa,
            and Virginia
          </p>
        </div>
        <div className="image-container">
          {imageElements[imageIndex]}
          <div className="image-timer">
            <div
              className="progress"
              style={{
                animation: `growShrink ${breakSeconds}s infinite linear`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
