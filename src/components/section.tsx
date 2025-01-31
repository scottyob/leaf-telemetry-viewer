import React from 'react';

interface SectionProps {
    title: string;
    children: React.ReactNode;
    maxHeight?: number;
}

const Section: React.FC<SectionProps> = ({ title, children, maxHeight }) => {

    const [expanded, setExpanded] = React.useState(true);
    let height = maxHeight ? maxHeight : 150;
    if (!expanded) {
        height = 0;
    }

    return (
        <section>
            <a onClick={() => setExpanded(!expanded)}><h3>{expanded ? "↓" : "→"} {title}</h3></a>
            <main style={{maxHeight: height}} className={`overflow-y-auto transition-all duration-500 ease-in-out`}>
                {children}
            </main>
        </section>
    );
};

export default Section;