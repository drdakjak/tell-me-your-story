import React, { useState } from 'react';
import { put } from '@aws-amplify/api';
import ReactMarkdown from 'react-markdown';
import ChatWindow from './ChatWindow';
import DiffPopup from './DiffPopup';
import { IoCreateOutline, IoCheckmarkDoneOutline, IoGitCompareOutline, IoChatbubbleEllipsesOutline } from 'react-icons/io5';

interface SectionProps {
  section: any;
  setIsUpdated: (isUpdated: boolean) => void;
}

const TailoredSection: React.FC<SectionProps> = ({ section, setIsUpdated }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDiffPopupOpen, setIsDiffPopupOpen] = useState(false);
  const [editedHeader, setEditedHeader] = useState(section.tailoredSection.header);
  const [editedContent, setEditedContent] = useState(section.tailoredSection.content);
  const [isEditing, setIsEditing] = useState(false);

  const handleOpenChat = () => setIsChatOpen(true);
  const handleCloseChat = () => setIsChatOpen(false);
  const toggleDiffPopup = () => setIsDiffPopupOpen(!isDiffPopupOpen);
  const handleIsEditing = () => setIsEditing(true);

  const updateSection = async (section) => {
    try {
      const { body } = await put({
        apiName: 'Api',
        path: 'update_tailored_section',
        options: { body: section }
      }).response;
      const response = await body.json();
      console.log(response);
    } catch (error) {
      console.error('Error updating section:', error);
    }
  };

  const handleSave = () => {
    updateSection(section.tailoredSection);
    section.tailoredSection.header = editedHeader;
    section.tailoredSection.content = editedContent;
    setIsEditing(false);
    setIsUpdated(true);
  };

  const handleUpdateTailoredContent = (newContent: string) => {
    setEditedContent(newContent);
    section.tailoredSection.content = newContent;
    setIsEditing(true);
  };

  return (
    <div className="">
      {isEditing ? (
        <div className="space-y-4">
          <input
            value={editedHeader}
            onChange={(e) => setEditedHeader(e.target.value)}
            className="w-full p-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
          />
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full p-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out resize-vertical"
            rows={10}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            <ReactMarkdown  className="markdown-header">{section.tailoredSection.header}</ReactMarkdown>
          </h3>
          <div className="prose max-w-none text-gray-600 bg-gray-50 p-4 rounded-md border border-gray-200">
            <ReactMarkdown className="markdown-content">{section.tailoredSection.content}</ReactMarkdown>
          </div>
        </div>
      )}

      <div className="flex space-x-2 justify-center mt-4">
        {isEditing ? (
          <button
            onClick={handleSave}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            title="Save Changes"
          >
            <IoCheckmarkDoneOutline className="w-5 h-5 mr-1" />
            Save
          </button>
        ) : (
          <button
            onClick={handleIsEditing}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            title="Edit"
          >
            <IoCreateOutline className="w-5 h-5 mr-1" />
            Edit
          </button>
        )}
        <button
          onClick={toggleDiffPopup}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
          title="View Diff"
        >
          <IoGitCompareOutline className="w-5 h-5 mr-1" />
          Diff
        </button>
        <button
          onClick={handleOpenChat}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          title="Open Chat"
        >
          <IoChatbubbleEllipsesOutline className="w-5 h-5 mr-1" />
          Chat
        </button>
      </div>

      <ChatWindow
        section={section}
        isOpen={isChatOpen}
        onClose={handleCloseChat}
        onUpdateTailoredContent={handleUpdateTailoredContent}
      />
      {isDiffPopupOpen && (
        <DiffPopup
          originalHeader={section.originalSection.header}
          originalContent={section.originalSection.content}
          tailoredHeader={section.tailoredSection.header}
          tailoredContent={section.tailoredSection.content}
          onClose={toggleDiffPopup}
        />
      )}
    </div>
  );
};

export default TailoredSection;