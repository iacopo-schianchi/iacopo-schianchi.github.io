import { useState, useEffect } from 'react';
import './Skills.css';
import SectionHeader from '../SectionHeader';
import SkillBar from './SkillBar';
import SkillCard from './SkillCard';

export default function Skills({ data }) {
    const [skillElements, setSkillElements] = useState();

    useEffect(() => {
        setSkillElements(
            data.map((category) => (
                <div>
                    <h2 className="category-header">{category.name}</h2>
                    {category.subcategories.map((subcategory) => (
                        <div>
                            <h3 className="subcategory">{subcategory.name}</h3>
                            <div className="skill-container">
                                {subcategory.skills.map((skill) => (
                                    <SkillCard
                                        name={skill.name}
                                        iconName={skill.iconName}
                                        isLocal={skill.localFile}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ))
        );
    }, []);

    return (
        <div className="section skills" id="skills">
            <SectionHeader text="Skills" />
            <div className="category-container">{skillElements}</div>
        </div>
    );
}
