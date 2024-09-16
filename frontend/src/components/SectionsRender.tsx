import React, { useState, useEffect } from 'react';
import { diff_match_patch } from 'diff-match-patch';
import ReactMarkdown from 'react-markdown';
import DiffSection from './DiffSection';
import AdvicePopup from './AdvicePopup';
import { FaLightbulb } from 'react-icons/fa';

interface Section {
  header: string;
  content: string;
  section_id: string;
}

interface TailoredSection {
  advice: string;
  tailored_section: Section;
}

interface RenderProps {
  originalSections: Section[];
  tailoredSections: TailoredSection[];
  onUpdateTailoredContent: (index: number, newContent: string) => void;
}

const Render: React.FC<RenderProps> = ({ 
  originalSections, 
  tailoredSections, 
  onUpdateTailoredContent 
}) => {
  const [sections, setSections] = useState<any[]>([]);
  const [isDesktopView, setIsDesktopView] = useState(window.innerWidth >= 768);
  const [showAdvicePopup, setShowAdvicePopup] = useState<number | null>(null);
  const dmp = new diff_match_patch();

  useEffect(() => {
    const newSections = originalSections.map((originalSection, index) => {
      const advice = tailoredSections[index].advice;
      const tailoredSection = tailoredSections[index].tailored_section || { header: '', content: '' };
      const diffs = dmp.diff_main(originalSection.content, tailoredSection.content);
      dmp.diff_cleanupSemantic(diffs);

      return {
        originalHeader: originalSection.header,
        originalContent: originalSection.content,
        advice: advice,
        tailoredHeader: tailoredSection.header,
        tailoredContent: tailoredSection.content,
        conversationId: originalSection.section_id,
        diffs,
        isEditing: false,
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

  const handleEdit = (index: number) => {
    const newSections = [...sections];
    newSections[index].isEditing = true;
    setSections(newSections);
  };

  const handleSave = (index: number, newHeader: string, newContent: string) => {
    const newSections = [...sections];
    newSections[index].tailoredHeader = newHeader;
    newSections[index].tailoredContent = newContent;
    newSections[index].isEditing = false;
    newSections[index].diffs = dmp.diff_main(newSections[index].originalContent, newContent);
    dmp.diff_cleanupSemantic(newSections[index].diffs);
    setSections(newSections);
    onUpdateTailoredContent(index, newContent);
  };

  const openAdvicePopup = (index: number) => {
    setShowAdvicePopup(index);
  };

  return (
    <div className="p-4 border rounded shadow-lg bg-gray-100">
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={() => setIsDesktopView(!isDesktopView)}
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none"
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
                <ReactMarkdown>{section.originalHeader}</ReactMarkdown>
              </h3>
              <div className="w-full p-2 border rounded bg-white whitespace-pre-wrap">
                <ReactMarkdown>{section.originalContent}</ReactMarkdown>
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
              <DiffSection
                section={section}
                index={index}
                onEdit={handleEdit}
                onSave={handleSave}
                onUpdateTailoredContent={(content: string) => onUpdateTailoredContent(index, content)}
              />
            </div>
          </div>
        ))}
      </div>
      {showAdvicePopup !== null && (
        <AdvicePopup
          advice={sections[showAdvicePopup].advice}
          header={sections[showAdvicePopup].tailoredHeader}
          onClose={() => setShowAdvicePopup(null)}
        />
      )}
    </div>
  );
};

export default Render;