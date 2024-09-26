import { useState, useEffect } from 'react';
import './Projects.css';
import SectionHeader from '../SectionHeader';
import Card from '../Card';

export default function Projects({ data }) {
  console.log('Data: ', data);
  const [cards, setCards] = useState();

  useEffect(() => {
    setCards(
      data.map((project, index) => {
        return (
          <Card
            key={index}
            name={project.name}
            description={project.description}
            videoUrl={project.videoUrl}
            imageUrl={project.imageUrl}
            skillsDeveloped={project.skillsDeveloped}
            url={project.url}
          />
        );
      })
    );
  }, []);

  return (
    <div className="section projects" id="projects">
      <SectionHeader text="Projects" />
      <div className="project-container">{cards != undefined && cards}</div>
    </div>
  );
}
