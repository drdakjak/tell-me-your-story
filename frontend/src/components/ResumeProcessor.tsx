import React, { useState } from 'react';
import { post } from 'aws-amplify/api';
import ReactMarkdown from 'react-markdown';

interface ResumeProcessorProps {
  resume: string;
  setResume: (resume: string) => void;
}

const ResumeProcessor: React.FC<ResumeProcessorProps> = ({ resume, setResume }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [url, setUrl] = useState('');
  const [analyzedResume, setAnalyzedResume] = useState<any[]>([]);

  const fetchResume = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch resume');
      }
      const text = await response.text();
      setResume(text);
    } catch (err) {
      setError('Error fetching resume. Please check the URL and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeResume = async () => {
    setIsLoading(true);
    setError('');
    try {
      const restOperation = post({
        apiName: 'Api',
        path: 'process_resume',
        options: {
          body: { resume }
        }
      });

      const { body } = await restOperation.response;
      const response = await body.json();
      setAnalyzedResume(response);

    } catch (err) {
      setError('Error analyzing resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <label htmlFor="url-input" className="block text-sm font-medium text-secondary-700 mb-2">
            Resume URL
          </label>
          <div className="flex">
            <input
              type="text"
              id="url-input"
              className="flex-grow px-3 py-2 border border-secondary-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-150 ease-in-out"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/resume"
            />
            <button
              onClick={fetchResume}
              disabled={isLoading}
              className="bg-primary-600 text-white px-4 py-2 rounded-r-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150 ease-in-out"
            >
              {isLoading ? 'Fetching...' : 'Fetch'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <label htmlFor="resume" className="block text-sm font-medium text-secondary-700 mb-2">
            Resume
          </label>
          <textarea
            id="resume"
            rows={10}
            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-150 ease-in-out"
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder="Paste or enter resume here"
          ></textarea>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={analyzeResume}
          disabled={isLoading || !resume}
          className="bg-accent-500 text-white px-6 py-3 rounded-md hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 transition duration-150 ease-in-out transform hover:scale-105"
        >
          {isLoading ? 'Processing...' : 'Process Resume'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
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

      {analyzedResume.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-secondary-900 mb-4">Analyzed Resume</h3>
            <div className="space-y-4">
              {analyzedResume.map((item, index) => (
                <div key={index} className="border-b border-secondary-200 pb-4 last:border-b-0 last:pb-0">
                  <h4 className="text-md font-semibold text-secondary-700 mb-2">
                    <ReactMarkdown>{item.header}</ReactMarkdown>
                  </h4>
                  <div className="prose max-w-none text-secondary-600">
                    <ReactMarkdown>{item.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeProcessor;