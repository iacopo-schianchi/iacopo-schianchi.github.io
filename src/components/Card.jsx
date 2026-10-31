import { useState } from 'react';
import ReactPlayer from 'react-player';
import ReactMarkdown from 'react-markdown';
import './Card.css';

export default function Card({ item }) {
    const [isHovered, setIsHovered] = useState(false);

    const { title, subtitle, date, content, image, video, link } = item;

    const hasMedia = Boolean(image || video);
    const Tag = link ? 'a' : 'div';

    return (
        <Tag
            className={`card ${hasMedia ? 'has-media' : 'no-media'}`}
            {...(link
                ? { href: link, target: '_blank', rel: 'noopener noreferrer' }
                : {})}
        >
            {hasMedia && (
                <div
                    className="card-media"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {video ? (
                        <div className="video-container">
                            <ReactPlayer
                                url={video}
                                playing={isHovered}
                                loop
                                muted
                                playsinline
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
