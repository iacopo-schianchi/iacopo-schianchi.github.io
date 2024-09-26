import './App.css';
import { useState, useEffect } from 'react';
import Hero from './components/hero/Hero';
import Skills from './components/skills/Skills';
import Projects from './components/projects/Projects';
import { getData } from './firebase';
import InfoCursor from './components/InfoCursor';
import Navbar from './components/navbar/Navbar';
import Experience from './components/experience/Experience';

function App() {
  const [data, setData] = useState();

  useEffect(() => {
    (async () => {
      const response = await getData();
      setData(response);
    })();
  }, []);

  return (
    <>
      <Navbar />
      <InfoCursor />
      <Hero />
      {data && <Skills data={data.skills} />}
      {data && <Projects data={data.projects} />}
      {data && <Experience data={data.experience} />}
    </>
  );
}

export default App;
