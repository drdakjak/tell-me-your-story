import React, { useState } from 'react';
import { put } from '@aws-amplify/api';
import ReactMarkdown from 'react-markdown';
import ChatWindow from './ChatWindow';
import DiffPopup from './DiffPopup';
import { CiEdit } from "react-icons/ci";
import { VscDiffMultiple } from "react-icons/vsc";
import { TfiCheckBox } from "react-icons/tfi";
import { LiaComments } from "react-icons/lia";

interface SectionProps {
  section: any;
}

const TailoredSection: React.FC<SectionProps> = ({ section }) => {
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
  };

  const handleUpdateTailoredContent = (newContent: string) => {
    setEditedContent(newContent);
    section.tailoredSection.content = newContent;
    setIsEditing(true);
  };

  return (
    <div className="space-y-4">
      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={editedHeader}
            onChange={(e) => setEditedHeader(e.target.value)}
            className="w-full p-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-150 ease-in-out"
            rows={1}
          />
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full p-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-150 ease-in-out resize-vertical"
            rows={10}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-secondary-900">
            <ReactMarkdown className="markdown-content">{section.tailoredSection.header}</ReactMarkdown>
          </h3>
          <div className="prose max-w-none text-secondary-700 bg-white p-4 rounded-md border border-secondary-200">
            <ReactMarkdown className="markdown-content">{section.tailoredSection.content}</ReactMarkdown>
          </div>
        </div>
      )}

      <div className="flex space-x-2 justify-center">
        {isEditing ? (
          <button
            onClick={handleSave}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
            title="Save Changes"
          >
            <TfiCheckBox className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleIsEditing}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-accent-500 hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 transition duration-150 ease-in-out"            
            title="Edit"
          >
            <CiEdit className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={toggleDiffPopup}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-secondary-500 hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 transition duration-150 ease-in-out"
          title="View Diff"
        >
          <VscDiffMultiple className="w-5 h-5" />
        </button>
        <button
          onClick={handleOpenChat}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150 ease-in-out"
          title="Open Chat"
        >
          <LiaComments className="w-5 h-5" />
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