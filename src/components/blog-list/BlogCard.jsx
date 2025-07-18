import './BlogCard.css';
import { useNavigate } from 'react-router-dom';
import { IconCalendarEvent } from '@tabler/icons-react';

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
                            <IconCalendarEvent color="#2e96eb" size={30} />
                            <p>{date}</p>
                        </div>
                    </div>
                </div>
                <p>{description}</p>
            </div>
        </a>
    );
}
