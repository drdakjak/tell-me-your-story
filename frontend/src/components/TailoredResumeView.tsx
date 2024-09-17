import React from 'react';
import ReactMarkdown from 'react-markdown';

interface TailoredResumeViewProps {
  tailoredSections: any[];
  onClose: () => void;
}

const generateTailoredResume = ( tailoredSections ) => {
  return tailoredSections.map(section => `## ${section.header}\n\n${section.content}`).join('\n\n');
};

const TailoredResumeView: React.FC<TailoredResumeViewProps> = ({ tailoredSections, onClose }) => {
  
 

  const tailoredResume = generateTailoredResume(tailoredSections)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl max-h-[80vh] overflow-auto relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-xl font-bold mb-4">Tailored Resume</h2>
        <ReactMarkdown>{tailoredResume}</ReactMarkdown>
      </div>
    </div>
  );
};

export default TailoredResumeView;