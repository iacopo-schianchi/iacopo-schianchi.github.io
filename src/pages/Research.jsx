import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Research.css';
import { fetchResearch } from '../firebase';

export default function Research() {
    const { id } = useParams();
    const [research, setResearch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadData() {
            try {
                const data = await fetchResearch(id);
                if (data) {
                    setResearch(data);
                } else {
                    setError('Research document not found.');
                }
            } catch (err) {
                setError('Failed to load the research details.');
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            loadData();
        }
    }, [id]);

    if (loading) {
        return <div className="research-status">Loading research...</div>;
    }

    if (error) {
        return <div className="research-status error">{error}</div>;
    }

    if (!research) return null;

    return (
        <article className="research-detail-container">
            <h1 className="research-title">{research.title}</h1>

            <div className="research-meta">
                {research.authors && (
                    <p className="research-authors">
                        <strong>Authors:</strong>{' '}
                        {Array.isArray(research.authors)
                            ? research.authors.join(', ')
                            : research.authors}
                    </p>
                )}
                {research.date && (
                    <p className="research-date">
                        <strong>Date:</strong>{' '}
                        {research.date.toDate().toLocaleDateString()}
                    </p>
                )}
            </div>

            {research.tldr && (
                <section className="research-section tldr-section">
                    <h2>TL;DR</h2>
                    <p>{research.tldr}</p>
                </section>
            )}

            {research.abstract && (
                <section className="research-section abstract-section">
                    <h2>Abstract</h2>
                    <p>{research.abstract}</p>
                </section>
            )}

            {(research.pdfUrl || research.doi) && (
                <div className="research-links">
                    {research.pdfUrl && (
                        <a
                            href={research.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="research-btn pdf-btn"
                        >
                            View PDF
                        </a>
                    )}
                    {research.doi && (
                        <a
                            href={`https://doi.org/${research.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="research-btn doi-btn"
                        >
                            DOI Link ({research.doi})
                        </a>
                    )}
                </div>
            )}
        </article>
    );
}
