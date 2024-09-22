import './App.css';
import { useState, useEffect } from 'react';
import Hero from './components/hero/Hero';
import Skills from './components/skills/Skills';
import { getData } from './firebase';

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
      <Hero />
      {data && <Skills data={data.skills} />}
    </>
  );
}

export default App;
