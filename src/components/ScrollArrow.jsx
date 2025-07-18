import { useEffect, useState } from 'react';
import { IconArrowNarrowDown } from '@tabler/icons-react';
import './ScrollArrow.css';

export default function ScrollArrow() {
    const [fading, setFading] = useState(false);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50 && !fading) {
                setFading(true);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [fading]);

    useEffect(() => {
        if (fading) {
            const timeout = setTimeout(() => setVisible(false), 400);
            return () => clearTimeout(timeout);
        }
    }, [fading]);

    if (!visible) return null;

    return (
        <div className={`scroll-arrow ${fading ? 'hidden' : ''}`}>
            <IconArrowNarrowDown size={150} />
        </div>
    );
}
