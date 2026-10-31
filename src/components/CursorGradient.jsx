import { useEffect, useRef } from 'react';
import './CursorGradient.css';

export default function CursorGradient() {
    const gradientRef = useRef(null);

    useEffect(() => {
        const gradient = gradientRef.current;
        if (!gradient) return;

        let targetX = window.innerWidth / 2;
        let targetY = window.innerHeight / 3;
        let currentX = targetX;
        let currentY = targetY;
        let frameId;

        const handleMouseMove = (event) => {
            targetX = event.clientX;
            targetY = event.clientY;
        };

        const animate = () => {
            currentX += (targetX - currentX) * 0.04;
            currentY += (targetY - currentY) * 0.04;

            gradient.style.setProperty('--x', `${currentX}px`);
            gradient.style.setProperty('--y', `${currentY}px`);

            frameId = requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', handleMouseMove);
        frameId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(frameId);
        };
    }, []);

    return (
        <div ref={gradientRef} className="cursor-gradient" aria-hidden="true" />
    );
}
