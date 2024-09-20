import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import TailoredSection from './TailoredSection';
import AdvicePopup from './AdvicePopup';
import { MdOutlineFeedback } from "react-icons/md";
import { Accordion } from "flowbite-react";

interface RenderProps {
  originalSections: any[];
  tailoredSections: any[];
  setIsUpdated: (isUpdated: boolean) => void;
}

const Render: React.FC<RenderProps> = ({
  originalSections,
  tailoredSections,
  setIsUpdated
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
    <div className="">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsDesktopView(!isDesktopView)}
          className="p-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150 ease-in-out"
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

      <div className={`space-y-8 ${isDesktopView ? 'md:space-y-12' : ''}`}>
        <Accordion>
          {sections.map((section, index) => (
            <Accordion.Panel key={index}>
              <Accordion.Title className="text-lg leading-6 font-normal text-secondary-900 p-4">{section.originalSection.header}</Accordion.Title>
              <Accordion.Content>
                <div key={index} className={`bg-white shadow-sm rounded-lg overflow-hidden ${isDesktopView ? 'md:flex' : ''}`}>
                  <div className={`space-y-4 p-6 ${isDesktopView ? 'md:w-1/2 md:border-r border-secondary-200' : ''}`}>
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-secondary-900">
                        <ReactMarkdown className="markdown-header">{section.originalSection.header}</ReactMarkdown>
                      </h3>
                      <div className="prose max-w-none text-secondary-700 bg-white p-4 rounded-md border border-secondary-200">
                        <ReactMarkdown className="markdown-content">{section.originalSection.content}</ReactMarkdown>
                      </div>
                    </div>
                    <div className="flex space-x-2 justify-center">
                      <button
                        onClick={() => openAdvicePopup(index)}
                        className="px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-700 transition duration-150 ease-in-out"
                        title="View Advice"
                      >
                        <MdOutlineFeedback className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className={`p-6 ${isDesktopView ? 'md:w-1/2' : ''}`}>
                    <TailoredSection section={section} setIsUpdated={setIsUpdated}/>
                  </div>
                </div>
              </Accordion.Content>
            </Accordion.Panel>
          ))}
        </Accordion>
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