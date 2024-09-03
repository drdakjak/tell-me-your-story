import React, { useState } from 'react';
import ChatWindow from './ChatWindow';
import SectionControls from './SectionControls;

interface DiffSectionProps {
  section: any;
  index: number;
  onAccept: (index: number) => void;
  onReject: (index: number) => void;
}

const DiffSection: React.FC<DiffSectionProps> = ({ section, index, onAccept, onReject }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
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
        onClick={handleOpenChat}
        className="mt-2 px-2 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600"
      >
        Open Chat
      </button>
      <ChatWindow
        sectionHeader={section.header}
        sectionContent={section.isAccepted ? section.modifiedContent : section.originalContent}
        isOpen={isChatOpen}
        onClose={handleCloseChat}
      />
    </div>
  );
};

export default DiffSection;