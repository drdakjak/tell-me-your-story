import React from 'react';
import { IoDownloadOutline } from 'react-icons/io5';

interface ResumeExporterProps {
  textToDownload: string;
}

const ResumeExporter: React.FC<ResumeExporterProps> = ({ textToDownload }) => {
  const handleDownload = () => {
    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex justify-center mt-6">
      <button
        onClick={handleDownload}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ease-in-out flex items-center space-x-2"
        title="Download Resume"
      >
        <IoDownloadOutline className="w-5 h-5" />
        <span>Download Resume</span>
      </button>
    </div>
  );
};

export default ResumeExporter;