import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { IoCloseOutline } from 'react-icons/io5';

interface AdvicePopupProps {
  advice: string;
  header: string;
  onClose: () => void;
}

const AdvicePopup: React.FC<AdvicePopupProps> = ({ advice, header, onClose }) => {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div 
        ref={popupRef}
        className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto shadow-lg transform transition-all ease-out duration-300 animate-fadeIn"
      >
        <div className="sticky top-0 bg-blue-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-semibold">Advice for {header}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition duration-150 ease-in-out focus:outline-none"
            aria-label="Close"
          >
            <IoCloseOutline className="h-6 w-6" />
          </button>
        </div>
        <div className="px-6 py-4">
          <div className="prose max-w-none text-gray-700">
            <ReactMarkdown className="markdown-content">{advice}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvicePopup;