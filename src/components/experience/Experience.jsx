import { useState, useEffect } from 'react';
import './Experience.css';
import SectionHeader from '../SectionHeader';
import Card from '../Card';
import Glow from '../Glow';

export default function Experience({ data }) {
  const [cards, setCards] = useState();

  useEffect(() => {
    setCards(
      data.map((experience, index) => {
        return (
          <Card
            key={index}
            name={experience.name}
            description={experience.description}
            videoUrl={experience.videoUrl}
            imageUrl={experience.imageUrl}
            skillsDeveloped={experience.skillsDeveloped}
            url={experience.url}
            dateStarted={experience.dateStarted}
            dateEnded={experience.dateEnded}
            company={experience.company}
          />
        );
      })
    );
  }, []);

  return (
    <div className="section experience" id="experience">
      <SectionHeader text="Experience" />
      <Glow top="300vh" left="-30vw" />
      <div className="experience-container">{cards != undefined && cards}</div>
    </div>
  );
}
