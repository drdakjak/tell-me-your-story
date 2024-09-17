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
    <div className="container mx-auto px-4 py-8">
      
      <div className="mb-6">
        <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-2">
          Job Post URL
        </label>
        <div className="flex">
          <input
            type="text"
            id="url-input"
            className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/job-post"
          />
          <button
            onClick={fetchJobPost}
            disabled={isLoading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Fetch
          </button>
        </div>
      </div>

      <div className="">
        <label htmlFor="job-post" className="block text-sm font-medium text-gray-700 mb-2">
          Job Post
        </label>
        <textarea
          id="job-post"
          rows={10}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          value={jobPost}
          onChange={(e) => setJobPost(e.target.value)}
          placeholder="Paste or enter job post here"
        ></textarea>
      </div>

      <div className="flex justify-end">
        <button
          onClick={analyzeJobPost}
          disabled={isLoading || !jobPost}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Process
        </button>
      </div>

      {isLoading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {analyzedJobPost && (
        <ReactMarkdown>{analyzedJobPost}</ReactMarkdown> 
      )}
    </div>
  );
};

export default JobPostProcessor;