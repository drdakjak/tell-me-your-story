import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import TailoredSection from './TailoredSection';
import AdvicePopup from './AdvicePopup';
import { FaLightbulb } from 'react-icons/fa';

interface OriginalSectionInterface {
  header: string;
  content: string;
  section_id: string;
}

interface TailoredSectionInterface {
  advice: string;
  tailored_section: OriginalSectionInterface;
}

interface RenderProps {
  originalSections: OriginalSectionInterface[];
  tailoredSections: TailoredSectionInterface[];
}

const Render: React.FC<RenderProps> = ({
  originalSections,
  tailoredSections,
}) => {
  const [sections, setSections] = useState<any[]>([]);
  const [isDesktopView, setIsDesktopView] = useState(window.innerWidth >= 768);
  const [showAdvicePopup, setShowAdvicePopup] = useState<number | null>(null);

  useEffect(() => {
    const newSections = originalSections.map((originalSection, index) => {
      const tailoredSection = tailoredSections[index];

      return {
        originalSection: originalSection,
        tailoredSection: tailoredSection, 
      };
    });
    console.log(newSections);
    setSections(newSections);
  }, [originalSections, tailoredSections]);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktopView(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const openAdvicePopup = (index: number) => {
    setShowAdvicePopup(index);
  };

  return (
    <div className="p-4 border rounded shadow-lg bg-gray-100">
      <div className="relative mb-4 flex justify-between items-center">
        <button
          onClick={() => setIsDesktopView(!isDesktopView)}
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none absolute bottom-0 right-0"
          title={`Switch to ${isDesktopView ? 'Mobile' : 'Desktop'} View`}
        >
          {isDesktopView ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4zM8 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H9a1 1 0 01-1-1V4zM15 3a1 1 0 00-1 1v12a1 1 0 001 1h2a1 1 0 001-1V4a1 1 0 00-1-1h-2z" />
            </svg>
          )}
        </button>
      </div>
      <div className={`mb-4 font-mono text-sm ${isDesktopView ? 'md:flex flex-col' : ''}`}>
        {sections.map((section, index) => (
          <div key={index} className={`mb-4 ${isDesktopView ? 'md:flex' : ''}`}>
            <div className={`${isDesktopView ? 'md:w-1/2 md:pr-2' : 'mb-4'}`}>
              <h3 className="text-md font-semibold mb-2">
                <ReactMarkdown>{section.originalSection.header}</ReactMarkdown>
              </h3>
              <div className="w-full p-2 border rounded bg-white whitespace-pre-wrap">
                <ReactMarkdown>{section.originalSection.content}</ReactMarkdown>
              </div>
              <button
                onClick={() => openAdvicePopup(index)}
                className="p-2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold rounded-full"
                title="Advice"
              >
                <FaLightbulb className="h-5 w-5" />
              </button>
            </div>
            <div className={`${isDesktopView ? 'md:w-1/2 md:pl-2' : ''}`}>
              <TailoredSection
                section={section}
              />
            </div>
          </div>
        ))}
      </div>
      {showAdvicePopup !== null && (
        <AdvicePopup
          advice={sections[showAdvicePopup].tailoredSection.advice}
          header={sections[showAdvicePopup].tailoredSection.header}
          onClose={() => setShowAdvicePopup(null)}
        />
      )}
    </div>
  );
};

export default Render;