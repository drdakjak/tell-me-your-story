import React from 'react';
import { diff_match_patch } from 'diff-match-patch';

interface DiffPopupProps {
  originalHeader: string;
  originalContent: string;
  tailoredHeader: string;
  tailoredContent: string;
  onClose: () => void;
}

const DiffPopup: React.FC<DiffPopupProps> = ({
  originalHeader,
  originalContent,
  tailoredHeader,
  tailoredContent,
  onClose,
}) => {
  const dmp = new diff_match_patch();
  const diffs = dmp.diff_main(originalContent, tailoredContent);
  dmp.diff_cleanupSemantic(diffs);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-md p-4 w-3/4 max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold"></h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Header</h3>
          <div className="flex">
            <div className="w-1/2 p-2 bg-red-100">
              <strong>Original:</strong> {originalHeader}
            </div>
            <div className="w-1/2 p-2 bg-green-100">
              <strong>Tailored:</strong> {tailoredHeader}
            </div>
          </div>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Content</h3>
          <div className="max-h-96 overflow-y-auto whitespace-pre-wrap font-mono bg-gray-100 p-2 rounded">
            {diffs.map((diff, index) => {
              const [type, text] = diff;
              let className = '';
              if (type === -1) {
                className = 'bg-red-200 line-through';
              } else if (type === 1) {
                className = 'bg-green-200';
              }
              return <span key={index} className={className}>{text}</span>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiffPopup;