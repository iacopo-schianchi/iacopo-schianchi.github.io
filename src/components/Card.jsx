import { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import ReactMarkdown from 'react-markdown';
import './Card.css';

export default function Card({ item }) {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const { title, subtitle, date, content, image, video, link } = item;

    const hasMedia = Boolean(image || video);

    useEffect(() => {
        if (!video || !videoRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsPlaying(entry.isIntersecting);
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 0.5,
            },
        );

        observer.observe(videoRef.current);

        return () => observer.disconnect();
    }, [video]);

    const Tag = link ? 'a' : 'div';

    return (
        <Tag
            className={`card ${hasMedia ? 'has-media' : 'no-media'}`}
            {...(link
                ? { href: link, target: '_blank', rel: 'noopener noreferrer' }
                : {})}
        >
            {hasMedia && (
                <div className="card-media">
                    {video ? (
                        <div className="video-container" ref={videoRef}>
                            <ReactPlayer
                                src={video}
                                playing={isPlaying}
                                loop
                                muted
                                playsInline
                                width="100%"
                                height="100%"
                            />
                        </div>
                    ) : (
                        <img src={image} className="image" alt={title || ''} />
                    )}
                </div>
            )}

            <div className="project-info">
                {(title || date || subtitle) && (
                    <div className="card-header">
                        {(title || date) && (
                            <div className="top-bar">
                                {title && <h2 className="title">{title}</h2>}

                                {date && (
                                    <span className="work-period">{date}</span>
                                )}
                            </div>
                        )}

                        {subtitle && <h4 className="company">{subtitle}</h4>}
                    </div>
                )}

                {content && (
                    <div className="card-content">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                )}
            </div>
        </Tag>
    );
}
