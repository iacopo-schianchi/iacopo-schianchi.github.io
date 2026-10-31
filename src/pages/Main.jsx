import './Main.css';
import { useState, useEffect } from 'react';
import { getVisibleSections } from '../firebase';
import CursorGradient from '../components/CursorGradient';
import Navbar from '../components/navbar/Navbar';
import Section from '../components/Section';

export default function Main() {
    const [sections, setSections] = useState();

    useEffect(() => {
        (async () => {
            const sections = await getVisibleSections();
            setSections(sections);
        })();
    }, []);

    return (
        <main className="page-container">
            <CursorGradient />
            <Navbar sections={sections} />
            <div className="page-content">
                {sections?.map((section) => (
                    <Section key={section.id} section={section} />
                ))}
            </div>
        </main>
    );
}
