import React, { useState } from 'react';
import { post } from 'aws-amplify/api';
import ReactMarkdown from 'react-markdown';

const ResumeProcessor: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [url, setUrl] = useState('');
  const [resume, setResume] = useState([]);
  const [analyzedResume, setAnalyzedResume] = useState('');

  const FetchResume = async () => {
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-2">
          Resume URL
        </label>
        <div className="flex">
          <input
            type="text"
            id="url-input"
            className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/resume"
          />
          <button
            onClick={FetchResume}
            disabled={isLoading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Fetch
          </button>
        </div>
      </div>

      <div className="">
        <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-2">
          Resume
        </label>
        <textarea
          id="resume"
          rows={10}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          placeholder="Paste or enter resume here"
        ></textarea>
      </div>

      <div className="flex justify-end">
        <button
          onClick={analyzeResume}
          disabled={isLoading || !resume}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Process
        </button>
      </div>

      {isLoading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {analyzedResume && (
        <div>
          {analyzedResume.map((item) => (
            <div className="mt-6" key={item.name}>
              <ReactMarkdown>{item.header}</ReactMarkdown>
              <ReactMarkdown>{item.content}</ReactMarkdown>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResumeProcessor;