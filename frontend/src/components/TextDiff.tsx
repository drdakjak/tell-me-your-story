import React, { useState, useEffect } from 'react';
import { diff_match_patch } from 'diff-match-patch';
import ReactMarkdown from 'react-markdown';
import DiffSection from './DiffSection';

interface TextDiffProps {
  originalText: string;
  modifiedText: string;
}

interface Section {
  header: string;
  content: string;
}

const TextDiff: React.FC<TextDiffProps> = ({ originalText, modifiedText }) => {
  const [currentText, setCurrentText] = useState(originalText);
  const [sections, setSections] = useState<any[]>([]);
  const [isDesktopView, setIsDesktopView] = useState(window.innerWidth >= 768);
  const dmp = new diff_match_patch();

  useEffect(() => {
    const originalSections = splitIntoSections(originalText);
    const modifiedSections = splitIntoSections(modifiedText);

    const newSections = originalSections.map((originalSection, index) => {
      const modifiedSection = modifiedSections[index] || { header: '', content: '' };
      const diffs = dmp.diff_main(originalSection.content, modifiedSection.content);
      dmp.diff_cleanupSemantic(diffs);

      return {
        header: originalSection.header,
        originalContent: originalSection.content,
        modifiedContent: modifiedSection.content,
        diffs,
        hasChanges: diffs.some(([type]) => type !== 0),
        isAccepted: false,
        isRejected: false,
      };
    });

    setSections(newSections);
  }, [originalText, modifiedText]);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktopView(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const splitIntoSections = (text: string): Section[] => {
    const lines = text.split('\n');
    const sections: Section[] = [];
    let currentSection: Section = { header: '', content: '' };

    lines.forEach((line) => {
      if (line.startsWith('#')) {
        if (currentSection.header) {
          sections.push(currentSection);
        }
        currentSection = { header: line, content: '' };
      } else {
        currentSection.content += line + '\n';
      }
    });

    if (currentSection.header) {
      sections.push(currentSection);
    }

    return sections;
  };

  const handleAcceptSection = (index: number) => {
    const newSections = [...sections];
    newSections[index].isAccepted = true;
    newSections[index].isRejected = false;
    setSections(newSections);

    updateCurrentText(index, newSections[index].modifiedContent);
  };

  const handleRejectSection = (index: number) => {
    const newSections = [...sections];
    newSections[index].isRejected = true;
    newSections[index].isAccepted = false;
    setSections(newSections);

    updateCurrentText(index, newSections[index].originalContent);
  };

  const updateCurrentText = (index: number, newContent: string) => {
    const newText = currentText.split('\n');
    const sectionStart = newText.findIndex((line) => line === sections[index].header);
    const sectionEnd = sectionStart + sections[index].originalContent.split('\n').length;
    newText.splice(sectionStart + 1, sectionEnd - sectionStart - 1, ...newContent.trim().split('\n'));
    setCurrentText(newText.join('\n'));
  };

  const handleOriginalContentChange = (index: number, newContent: string) => {
    const newSections = [...sections];
    newSections[index].originalContent = newContent;
    const diffs = dmp.diff_main(newContent, newSections[index].modifiedContent);
    dmp.diff_cleanupSemantic(diffs);
    newSections[index].diffs = diffs;
    newSections[index].hasChanges = diffs.some(([type]) => type !== 0);
    setSections(newSections);

    updateCurrentText(index, newContent);
  };

  return (
    <div className="p-4 border rounded shadow-lg bg-gray-100">
      <div className="mb-4 flex justify-between items-center">
        <div className="text-lg font-bold">CV Text Diff</div>
        <button
          onClick={() => setIsDesktopView(!isDesktopView)}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Switch to {isDesktopView ? 'Mobile' : 'Desktop'} View
        </button>
      </div>
      <div className={`mb-4 font-mono text-sm ${isDesktopView ? 'md:flex flex-col' : ''}`}>
        {sections.map((section, index) => (
          <div key={index} className={`mb-4 ${isDesktopView ? 'md:flex' : ''}`}>
            <div className={`${isDesktopView ? 'md:w-1/2 md:pr-2' : 'mb-4'}`}>
              <h3 className="text-md font-semibold mb-2">{section.header}</h3>
              <textarea
                value={section.originalContent}
                onChange={(e) => handleOriginalContentChange(index, e.target.value)}
                className="w-full h-48 p-2 border rounded resize-none"
              />
            </div>
            <div className={`${isDesktopView ? 'md:w-1/2 md:pl-2' : ''}`}>
              <DiffSection
                section={section}
                index={index}
                onAccept={handleAcceptSection}
                onReject={handleRejectSection}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <div className="font-bold">Current Text:</div>
        <ReactMarkdown>{currentText}</ReactMarkdown>
      </div>
    </div>
  );
};

export default TextDiff;