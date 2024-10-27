import './BlogCard.css';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import calendarIcon from '../../assets/calendar-event.png';

export default function BlogCard({
    title,
    date,
    description,
    postId,
    imageUrl,
}) {
    const navigate = useNavigate();

    return (
        <a className="blog-card" onClick={() => navigate(`/blogs/${postId}`)}>
            {imageUrl && <img src={imageUrl} className="image" />}
            <div className="project-info">
                <div>
                    <div className="top-bar">
                        <h2 className="title">{title}</h2>
                        <div className="date-container">
                            <img src={calendarIcon} alt="" />
                            <p>{date}</p>
                        </div>
                    </div>
                </div>
                <p>{description}</p>
            </div>
        </a>
    );
}
