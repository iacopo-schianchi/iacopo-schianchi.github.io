import { useState, useEffect } from 'react';
import './Skills.css';
import SectionHeader from '../SectionHeader';
import SkillBar from './SkillBar';

export default function Skills({ data }) {
  const [skillElements, setSkillElements] = useState();

  useEffect(() => {
    setSkillElements(
      data.map((skill) => {
        return <SkillBar name={skill.name} ability={skill.ability} />;
      })
    );
  }, []);

  return (
    <div className="section skills">
      <SectionHeader text="Skills" />
      <div className="skill-container">{skillElements}</div>
    </div>
  );
}
