import { useEffect, useState } from 'react';
import './Blog.css';
import { useNavigate, useParams } from 'react-router-dom';
import { getBlogPostContent } from '../firebase';
import calendarIcon from '../assets/calendar-event.png';
import ReactMarkdown from 'react-markdown';
import InfoCursor from '../components/InfoCursor';
import BackIcon from '../assets/BackIcon';
import ScrollProgressBar from '../components/blog/ScrollProgressBar';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';

export default function Blog({ metadata }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blogMarkdown, setBlogMarkdown] = useState('');
    const [blogMetadata, setBlogMetadata] = useState();

    useEffect(() => {
        (async () => {
            setBlogMarkdown(await getBlogPostContent(`post${id}`));
        })();
    }, []);

    useEffect(() => {
        if (metadata) {
            setBlogMetadata(
                metadata.filter((post) => post.slug === `post${id}`)[0]
            );
        }
    }, [metadata]);

    return (
        <div className="blog">
            <ScrollProgressBar />
            <InfoCursor />
            <button
                className="back-button link"
                onClick={() => navigate('/blogs')}
            >
                <BackIcon />
            </button>
            {blogMetadata && (
                <div className="header">
                    <img src={blogMetadata.headerImage} alt="" />
                    <h1>{blogMetadata.title}</h1>
                    <div className="date-container">
                        <img src={calendarIcon} alt="" />
                        <p>{blogMetadata.date}</p>
                    </div>
                </div>
            )}
            <ReactMarkdown
                className="react-markdown"
                remarkPlugins={[
                    remarkGfm,
                    remarkMath,
                    remarkParse,
                    remarkRehype,
                    remarkRehype,
                    rehypeKatex,
                    rehypeStringify,
                ]}
            >
                {blogMarkdown}
            </ReactMarkdown>
        </div>
    );
}
