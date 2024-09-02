import React, { useState, useEffect } from 'react';
import { diff_match_patch } from 'diff-match-patch';

interface TextDiffProps {
  originalText: string;
  modifiedText: string;
}

interface Section {
  header: string;
  content: string;
}

const TextDiff: React.FC<TextDiffProps> = ({ originalText, modifiedText }) => {
  const [finalText, setFinalText] = useState(originalText);
  const [sections, setSections] = useState<Section[]>([]);
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
      };
    });

    setSections(newSections);
  }, [originalText, modifiedText]);

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
    const newFinalText = finalText.split('\n');
    const sectionStart = newFinalText.findIndex((line) => line === sections[index].header);
    const sectionEnd = sectionStart + sections[index].originalContent.split('\n').length;
    newFinalText.splice(sectionStart + 1, sectionEnd - sectionStart - 1, ...sections[index].modifiedContent.trim().split('\n'));
    setFinalText(newFinalText.join('\n'));
  };

  const handleDiscardSection = (index: number) => {
    const newFinalText = finalText.split('\n');
    const sectionStart = newFinalText.findIndex((line) => line === sections[index].header);
    const sectionEnd = sectionStart + sections[index].modifiedContent.split('\n').length;
    newFinalText.splice(sectionStart + 1, sectionEnd - sectionStart - 1, ...sections[index].originalContent.trim().split('\n'));
    setFinalText(newFinalText.join('\n'));
  };

  const handleAcceptAll = () => {
    setFinalText(modifiedText);
  };

  const handleDiscardAll = () => {
    setFinalText(originalText);
  };

  return (
    <div className="p-4 border rounded shadow-lg bg-gray-100">
      <div className="mb-4 text-lg font-bold">CV Text Diff</div>
      <div className="mb-4 font-mono text-sm">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-4 border-b pb-4">
            <div className="font-bold mb-2">{section.header}</div>
            <div className="whitespace-pre-wrap">
              {section.diffs.map((diff, index) => {
                const [type, text] = diff;
                let className = '';
                if (type === -1) {
                  className = 'bg-red-100 line-through';
                } else if (type === 1) {
                  className = 'bg-green-100';
                }
                return <span key={index} className={className}>{text}</span>;
              })}
            </div>
            <div className="mt-2 flex justify-end space-x-2">
              <button
                onClick={() => handleAcceptSection(sectionIndex)}
                className="px-2 py-1 text-xs text-white bg-green-500 rounded hover:bg-green-600"
              >
                Accept Section
              </button>
              <button
                onClick={() => handleDiscardSection(sectionIndex)}
                className="px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600"
              >
                Discard Section
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end space-x-2">
        <button
          onClick={handleAcceptAll}
          className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
        >
          Accept All
        </button>
        <button
          onClick={handleDiscardAll}
          className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
        >
          Discard All
        </button>
      </div>
      <div className="mt-4">
        <div className="font-bold">Final Text:</div>
        <div className="whitespace-pre-wrap font-mono text-sm">{finalText}</div>
      </div>
    </div>
  );
};

export default TextDiff;