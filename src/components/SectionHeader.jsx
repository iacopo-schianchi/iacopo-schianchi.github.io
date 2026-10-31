import React from 'react';
import './SectionHeader.css';

export default function SectionHeader({ text }) {
    return (
        <div className="section-header-container">
            <h2 className="section-header">{text}</h2>
            <div className="divider-line"></div>
        </div>
    );
}
