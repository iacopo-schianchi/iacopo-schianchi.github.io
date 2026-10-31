import './Main.css';
import { useState, useEffect } from 'react';
import Hero from '../components/hero/Hero';
import Skills from '../components/skills/Skills';
import Projects from '../components/projects/Projects';
import { getData, getVisibleSections } from '../firebase';
import CursorGradient from '../components/CursorGradient';
import Navbar from '../components/navbar/Navbar';
import Experience from '../components/experience/Experience';
import AboutMe from '../components/about-me/AboutMe';
import ScrollArrow from '../components/ScrollArrow';
import ContactMe from '../components/contact-me/ContactMe';
import Section from '../components/Section';

export default function Main() {
    const [sections, setSections] = useState();

    useEffect(() => {
        (async () => {
            const sections = await getVisibleSections();
            setSections(sections);
        })();
    }, []);

    console.log(sections);

    return (
        <main className="page-container">
            <CursorGradient />
            <Navbar sections={sections} />
            <div className="page-content">
                {sections?.map((section) => (
                    <Section section={section} />
                ))}
            </div>
        </main>
    );
}
