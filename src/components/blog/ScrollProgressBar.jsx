import { useEffect, useState } from 'react';
import './ScrollProgressBar.css';

export default function ScrollProgressBar() {
    const [y, setY] = useState(0);
    const [totalY, setTotalY] = useState();
    const [scrollBar, setScrollBar] = useState();
    const element = document.getElementsByTagName('body')[0];

    useEffect(() => {
        window.addEventListener('scroll', () => {
            setY(window.scrollY);
        });

        return () => {
            window.removeEventListener('scroll', () => setY(window.scrollY));
        };
    }, []);

    useEffect(() => setScrollBar(window.innerHeight), [window.innerHeight]);

    useEffect(() => setTotalY(element.clientHeight, [element.clientHeight]));

    console.log(y, totalY, scrollBar);

    return (
        <div className="scroll-progress-bar-container">
            <div
                className="progress"
                style={{
                    width: `calc(${((y + scrollBar) / totalY) * 100}% + 10px)`,
                }}
            ></div>
        </div>
    );
}
