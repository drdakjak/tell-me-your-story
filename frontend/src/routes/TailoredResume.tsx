import React, { useState, useEffect } from 'react';
import { get } from 'aws-amplify/api';
import ReactMarkdown from 'react-markdown';
import ResumeExporter from '../components/ResumeExporter';
import { IoDocumentTextOutline } from 'react-icons/io5';

interface TailoredResumeProps {
  tailoredResume: string;
  setTailoredResume: (tailoredResume: string) => void;
  isUpdated: boolean;
  setIsUpdated: (isUpdated: boolean) => void;
}

const TailoredResume: React.FC<TailoredResumeProps> = ({ 
  tailoredResume, 
  setTailoredResume, 
  isUpdated, 
  setIsUpdated 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTailoredResume = async () => {
    setIsLoading(true);
    setError('');
    setTailoredResume('');
    try {
      const restOperation = get({
        apiName: 'Api',
        path: 'tailored_resume',
      });

      const { body } = await restOperation.response;
      const response = await body.json();

      if (response && typeof response === 'string') {
        setTailoredResume(response);
      } else {
        setError('Invalid response received. Please try again.');
      }
      setIsUpdated(false);
    } catch (err) {
      setError('Loading the tailored resume failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!tailoredResume || isUpdated) {
      fetchTailoredResume();
    }
  }, [tailoredResume, isUpdated]);

  return (
    <div className="space-y-6">
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {tailoredResume && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-5">
            <div className="prose max-w-none text-gray-600">
              <ReactMarkdown className="markdown-content">{tailoredResume}</ReactMarkdown>
            </div>
            <div className="mt-8">
              <ResumeExporter textToDownload={tailoredResume} />
            </div>
          </div>
        </div>
      )}
      
      {!isLoading && !error && !tailoredResume && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <IoDocumentTextOutline className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-600">No tailored resume available. Please process your resume and job post first.</p>
        </div>
      )}
    </div>
  );
};

export default TailoredResume;