import React, { useState } from 'react';
import { post } from 'aws-amplify/api';
import ReactMarkdown from 'react-markdown';

interface JobPostProcessorProps {
  jobPost: string;
  setJobPost: (jobPost: string) => void;
}

const JobPostProcessor: React.FC<JobPostProcessorProps> = ({ jobPost, setJobPost }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [url, setUrl] = useState('');
  const [analyzedJobPost, setAnalyzedJobPost] = useState('');

  const fetchJobPost = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch job post');
      }
      const text = await response.text();
      setJobPost(text);
    } catch (err) {
      setError('Error fetching job post. Please check the URL and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeJobPost = async () => {
    setIsLoading(true);
    setError('');
    try {
      const restOperation = post({
        apiName: 'Api',
        path: 'process_job_post',
        options: {
          body: { jobPost }
        }
      });

      const { body } = await restOperation.response;
      const response = await body.json();

      setAnalyzedJobPost(response);

    } catch (err) {
      setError('Error analyzing job post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <label htmlFor="url-input" className="block text-sm font-medium text-secondary-700 mb-2">
            Job Post URL
          </label>
          <div className="flex">
            <input
              type="text"
              id="url-input"
              className="flex-grow px-3 py-2 border border-secondary-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-150 ease-in-out"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/job-post"
            />
            <button
              onClick={fetchJobPost}
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
          <label htmlFor="job-post" className="block text-sm font-medium text-secondary-700 mb-2">
            Job Post
          </label>
          <textarea
            id="job-post"
            rows={10}
            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-150 ease-in-out"
            value={jobPost}
            onChange={(e) => setJobPost(e.target.value)}
            placeholder="Paste or enter job post here"
          ></textarea>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={analyzeJobPost}
          disabled={isLoading || !jobPost}
          className="bg-accent-500 text-white px-6 py-3 rounded-md hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 transition duration-150 ease-in-out transform hover:scale-105"
        >
          {isLoading ? 'Processing...' : 'Process Job Post'}
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

      {analyzedJobPost && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-secondary-900 mb-4">Analyzed Job Post</h3>
            <div className="prose max-w-none">
              <ReactMarkdown>{analyzedJobPost}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobPostProcessor;