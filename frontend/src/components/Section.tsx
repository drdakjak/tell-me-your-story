import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import ChatWindow from './ChatWindow';
import DiffPopup from './DiffPopup';

interface Section {
  section: any;
}

const Section: React.FC<SectionProps> = ({
  section,
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDiffPopupOpen, setIsDiffPopupOpen] = useState(false);
  const [editedHeader, setEditedHeader] = useState(section.tailoredHeader);
  const [editedContent, setEditedContent] = useState(section.tailoredContent);
  const [isEditing, setIsEditing] = useState(false);

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  const toggleDiffPopup = () => {
    setIsDiffPopupOpen(!isDiffPopupOpen);
  };

  const handleIsEdditing = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    section.tailoredHeader = editedHeader;
    section.tailoredContent = editedContent;
    setIsEditing(false);
  };

  const handleUpdateTailoredContent = (newContent: string) => {
    setEditedContent(newContent)
    section.tailoredContent = editedContent;
    setIsEditing(true);
  };


  return (
    <div className="mb-4 pb-4 border-b">
      {isEditing ? (
        <>
          <textarea
            value={editedHeader}
            onChange={(e) => setEditedHeader(e.target.value)}
            className="w-full p-2 mb-2 border rounded resize-none"
            rows={1}
          />
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full p-2 mb-2 border rounded resize-vertical"
            rows={10}
          />
          <button
            onClick={handleSave}
            className="p-2 mr-2 text-white bg-green-500 rounded-full hover:bg-green-600 focus:outline-none"
            title="Save"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </>
      ) : (
        <>
          <h3 className="font-bold mb-2">
            <ReactMarkdown>{section.tailoredHeader}</ReactMarkdown>
          </h3>
          <div className="w-full p-2 border rounded bg-white whitespace-pre-wrap">
            <ReactMarkdown>{section.tailoredContent}</ReactMarkdown>
          </div>
          <button
            onClick={handleIsEdditing}
            className="p-2 mr-2 text-white bg-blue-500 rounded-full hover:bg-blue-600 focus:outline-none"
            title="Edit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
        </>
      )}
      <button
        onClick={toggleDiffPopup}
        className="p-2 mr-2 text-white bg-purple-500 rounded-full hover:bg-purple-600 focus:outline-none"
        title="View Diff"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
        </svg>
      </button>
      <button
        onClick={handleOpenChat}
        className="p-2 text-white bg-blue-500 rounded-full hover:bg-blue-600 focus:outline-none"
        title="Open Chat"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
        </svg>
      </button>
      <ChatWindow
        sectionHeader={section.tailoredHeader}
        sectionContent={section.tailoredContent}
        isOpen={isChatOpen}
        onClose={handleCloseChat}
        conversationId={section.conversationId}
        onUpdateTailoredContent={handleUpdateTailoredContent}
      />
      {isDiffPopupOpen && (
        <DiffPopup
          originalHeader={section.originalHeader}
          originalContent={section.originalContent}
          tailoredHeader={section.tailoredHeader}
          tailoredContent={section.tailoredContent}
          diffs={section.diffs}
          onClose={toggleDiffPopup}
        />
      )}
    </div>
  );
};

export default Section;