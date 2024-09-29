import { useState, useEffect } from 'react';
import './InfoCursor.css';
import arrowIcon from '../assets/arrow-up-right.png';
import scrollIcon from '../assets/scroll-icon.svg';

export default function InfoCursor() {
  const hoverIcons = {
    card: arrowIcon,
    'email link': arrowIcon,
    'link grid-link': arrowIcon,
    'activity-text': scrollIcon,
  };
  const [size, setSize] = useState(30);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [icon, setIcon] = useState(null);

  useEffect(() => {
    let mouseMoveListener = window.addEventListener('mousemove', (event) => {
      setMousePos({ x: event.clientX, y: event.clientY });
    });
    let mouseHoverListener = window.addEventListener('mouseover', (event) => {
      let newIcon = hoverIcons[event.target.className];
      if (newIcon) {
        setIcon(newIcon);
        setSize(60);
      }
    });
    let mouseOutListener = window.addEventListener('mouseout', (event) => {
      if (hoverIcons[event.target.className]) {
        setIcon(null);
        setSize(30);
      }
    });

    return () => {
      window.removeEventListener('mousemove', mouseMoveListener);
      window.removeEventListener('mouseover', mouseHoverListener);
      window.removeEventListener('mouseout', mouseOutListener);
    };
  }, []);

  return (
    <div
      className="info-cursor"
      style={{
        backgroundSize: 'contain',
        backgroundImage: `url(${icon})`,
        top: `calc(${mousePos.y}px - ${size / 2}px)`,
        left: `calc(${mousePos.x}px - ${size / 2}px)`,
        width: `${size}px`,
        height: `${size}px`,
      }}
    ></div>
    // <AnimatedCursor
    //   innerSize={8}
    //   outerSize={20}
    //   color="255, 255, 255"
    //   outerAlpha={1}
    //   innerScale={0.7}
    //   outerScale={2}
    //   outerStyle={{
    //     backgroundImage: 'url("src/assets/arrow-up-right.png")',
    //     backgroundSize: 'contain',
    //     backgroundRepeat: 'no-repeat',
    //   }}
    // />
  );
}
