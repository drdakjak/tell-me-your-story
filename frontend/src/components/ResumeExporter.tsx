import React from 'react';
import { PiDownloadSimpleLight } from "react-icons/pi";

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
    <div className="flex justify-center">
      <button
        onClick={handleDownload}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        title="Dowload"
      >
      <PiDownloadSimpleLight className="animate-pulse w-7 h-7" />
      </button>
    </div>
  );
};

export default ResumeExporter;