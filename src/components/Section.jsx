import Card from './Card';
import SectionHeader from './SectionHeader';
import './Section.css';

export default function Section({ section }) {
    return (
        <div className="section" id={section.id}>
            <SectionHeader text={section.title} />
            <div style={{ marginRight: 60 }}>
                {section.itemOrder.map((itemId) => (
                    <Card item={section.items[itemId]} />
                ))}
            </div>
        </div>
    );
}
