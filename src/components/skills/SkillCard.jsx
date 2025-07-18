import React from 'react';
import * as TablerIcons from '@tabler/icons-react';
import './SkillCard.css';

export default function SkillCard({ name, iconName, isLocal }) {
    let content;

    if (isLocal) {
        const localIcon = require(`../../assets/${iconName}.svg`);
        content = <img src={localIcon} alt={name} width={48} height={48} />;
    } else {
        const IconComponent = TablerIcons[iconName];
        if (!IconComponent) {
            return <div className="skill-card">Invalid icon: {iconName}</div>;
        }
        content = <IconComponent size={48} stroke={1.5} />;
    }

    return (
        <div className="skill-card">
            {content}
            <p className="name">{name}</p>
        </div>
    );
}
