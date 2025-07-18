import { useState, useEffect } from 'react';
import './Hero.css';
import Glow from '../Glow';

export default function Hero({ finalLines }) {
    const typeMs = 100;

    const [lines, setLines] = useState(['', '']);
    const [finished, setFinished] = useState([false, false]);

    async function writeLine(lineIndex) {
        return new Promise((resolve) => {
            let i = 0;

            let typingInterval = setInterval(() => {
                const currentLine = finalLines[lineIndex];
                const newChar = currentLine[i];

                setLines((prevLines) => {
                    return prevLines.map((prevLine, index) =>
                        index === lineIndex
                            ? prevLine.concat(newChar)
                            : prevLine
                    );
                });

                i++;

                if (lineIndex === 0 && currentLine.slice(0, i) === 'Hi,') {
                    clearInterval(typingInterval);

                    setTimeout(() => {
                        typingInterval = setInterval(() => {
                            const nextChar = currentLine[i];
                            setLines((prevLines) => {
                                return prevLines.map((prevLine, index) =>
                                    index === lineIndex
                                        ? prevLine.concat(nextChar)
                                        : prevLine
                                );
                            });

                            i++;
                            if (i >= currentLine.length) {
                                clearInterval(typingInterval);
                                setFinished((prevFinished) =>
                                    prevFinished.map((value, index) =>
                                        index === lineIndex ? true : value
                                    )
                                );
                                resolve();
                            }
                        }, typeMs);
                    }, typeMs * 5);
                }

                if (i >= currentLine.length) {
                    clearInterval(typingInterval);
                    setTimeout(
                        () => {
                            setFinished((prevFinished) =>
                                prevFinished.map((value, index) =>
                                    index === lineIndex ? true : value
                                )
                            );
                        },
                        lineIndex === 1 ? 3000 : 0
                    );
                    resolve();
                }
            }, typeMs);
        });
    }

    useEffect(() => {
        async function writeHeader() {
            await writeLine(0);
            await writeLine(1);
        }

        writeHeader();
    }, []);

    return (
        <div className="hero" id="iacopo-schianchi">
            <Glow top="30vh" left="80vw" />
            <h1
                className={`title ${finished[0] ? 'finished' : ''}`}
                id="typing-text"
            >
                {lines[0]}
            </h1>
            <br />
            <h1
                className={`title ${finished[1] ? 'finished' : ''}`}
                id="typing-text"
            >
                {lines[1]}
            </h1>
        </div>
    );
}
