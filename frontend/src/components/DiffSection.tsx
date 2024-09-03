import React, { useState } from 'react';
import SectionControls from './SectionControls';
import ChatWindow from './ChatWindow';

interface DiffSectionProps {
  section: any;
  index: number;
  onAccept: (index: number) => void;
  onReject: (index: number) => void;
}

const DiffSection: React.FC<DiffSectionProps> = ({ section, index, onAccept, onReject }) => {
  const [isChatVisible, setIsChatVisible] = useState(false);

  const toggleChatWindow = () => {
    setIsChatVisible(!isChatVisible);
  };

  return (
    <div className="mb-4 pb-4 border-b">
      <div className="font-bold mb-2">{section.header}</div>
      
      {/* Diff Section */}
      <div className="w-full">
        <div className="whitespace-pre-wrap font-mono bg-gray-100 p-2 rounded max-h-96 overflow-y-auto">
          {section.isAccepted ? (
            <div>{section.modifiedContent}</div>
          ) : section.isRejected ? (
            <div>{section.originalContent}</div>
          ) : (
            <>
              {section.diffs.map((diff: [number, string], diffIndex: number) => {
                const [type, text] = diff;
                let className = '';
                if (type === -1) {
                  className = 'bg-red-100 line-through';
                } else if (type === 1) {
                  className = 'bg-green-100';
                }
                return <span key={diffIndex} className={className}>{text}</span>;
              })}
            </>
          )}
        </div>
        {section.hasChanges && !section.isAccepted && !section.isRejected && (
          <SectionControls
            onAccept={() => onAccept(index)}
            onReject={() => onReject(index)}
          />
        )}
      </div>
      
      <button
        onClick={toggleChatWindow}
        className="mt-2 px-2 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600"
      >
        {isChatVisible ? 'Close Chat' : 'Open Chat'}
      </button>
      {isChatVisible && (
        <ChatWindow
          sectionHeader={section.header}
          sectionContent={section.isAccepted ? section.modifiedContent : section.originalContent}
        />
      )}
    </div>
  );
};

export default DiffSection;