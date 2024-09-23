import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import TailoredSection from './TailoredSection';
import AdvicePopup from './AdvicePopup';
import { IoInformationCircleOutline, IoPhonePortraitOutline, IoDesktopOutline } from 'react-icons/io5';
import { Accordion } from 'flowbite-react';


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
          className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
          title={`Switch to ${isDesktopView ? 'Mobile' : 'Desktop'} View`}
        >
          {isDesktopView ? <IoPhonePortraitOutline className="h-5 w-5" /> : <IoDesktopOutline className="h-5 w-5" />}
        </button>
      </div>

      <div className={`space-y-4 ${isDesktopView ? 'md:space-y-6' : ''}`}>
        <Accordion collapseAll>
          {sections.map((section, index) => (
            <Accordion.Panel key={index} className="border border-gray-200 rounded-md p-4">
              <Accordion.Title className="text-md font-medium text-gray-700">{section.originalSection.header}</Accordion.Title>
              <Accordion.Content>
                <div className={`bg-gray-50 p-4 rounded-md ${isDesktopView ? 'md:flex' : ''}`}>
                  <div className={`space-y-4 p-6 ${isDesktopView ? 'md:w-1/2 md:border-r border-gray-200' : ''}`}>
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-gray-800">
                        <ReactMarkdown className="markdown-header">{section.originalSection.header}</ReactMarkdown>
                      </h3>
                      <div className="prose max-w-none text-gray-600 bg-gray-50 p-4 rounded-md border border-gray-200">
                        <ReactMarkdown className="markdown-content">{section.originalSection.content}</ReactMarkdown>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <button
                        onClick={() => openAdvicePopup(index)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                        title="View Advice"
                      >
                        <IoInformationCircleOutline className="mr-1 h-5 w-5" />
                        View Advice
                      </button>
                    </div>
                  </div>
                  <div className={`p-6 ${isDesktopView ? 'md:w-1/2' : ''}`}>
                    <TailoredSection section={section} setIsUpdated={setIsUpdated} />
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