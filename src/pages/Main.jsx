import './Main.css';
import { useState, useEffect } from 'react';
import Hero from '../components/hero/Hero';
import Skills from '../components/skills/Skills';
import Projects from '../components/projects/Projects';
import { getData } from '../firebase';
import InfoCursor from '../components/InfoCursor';
import Navbar from '../components/navbar/Navbar';
import Experience from '../components/experience/Experience';
import AboutMe from '../components/about-me/AboutMe';
import ScrollArrow from '../components/ScrollArrow';
import ContactMe from '../components/contact-me/ContactMe';

export default function Main() {
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
            <ScrollArrow />
            <InfoCursor />
            <Hero finalLines={["Hi, I'm", 'Iacopo Schianchi']} />
            {data && <Experience data={data.experience} />}
            {data && <Projects data={data.projects} />}
            {data && <Skills data={data.skills} />}
            {/* {data && <AboutMe images={data.aboutMe.images} />} */}
            <ContactMe />
        </>
    );
}
