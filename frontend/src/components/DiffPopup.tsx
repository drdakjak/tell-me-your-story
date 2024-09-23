import React from 'react';
import { diff_match_patch } from 'diff-match-patch';
import { IoCloseOutline } from 'react-icons/io5';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Content Comparison</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 focus:outline-none transition-colors duration-200"
            title="Close"
          >
            <IoCloseOutline className="h-6 w-6" />
          </button>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Header</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 p-3 bg-red-50 rounded-lg">
              <strong className="text-red-700">Original:</strong> <span className="text-gray-800">{originalHeader}</span>
            </div>
            <div className="flex-1 p-3 bg-green-50 rounded-lg">
              <strong className="text-green-700">Tailored:</strong> <span className="text-gray-800">{tailoredHeader}</span>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Content</h3>
          <div className="max-h-96 overflow-y-auto whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded-lg border border-gray-200">
            {diffs.map((diff, index) => {
              const [type, text] = diff;
              let className = 'text-gray-800';
              if (type === -1) {
                className = 'bg-red-100 text-red-800 line-through';
              } else if (type === 1) {
                className = 'bg-green-100 text-green-800';
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