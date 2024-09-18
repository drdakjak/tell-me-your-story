import React, { useState } from 'react';
import { post } from 'aws-amplify/api';
import ReactMarkdown from 'react-markdown';
import { ToggleSwitch } from "flowbite-react";
import { GrLinkNext } from "react-icons/gr";
import { Spinner } from "flowbite-react";
import { PiCpuThin } from "react-icons/pi";
import { Accordion } from "flowbite-react";
interface JobPostProcessorProps {
  jobPost: string;
  setJobPost: (jobPost: string) => void;
  setCurrentPage: (page: string) => void;
}

const JobPostProcessor: React.FC<JobPostProcessorProps> = ({ jobPost, setJobPost, setCurrentPage }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [url, setUrl] = useState('');
  const [analyzedJobPost, setAnalyzedJobPost] = useState('');
  const [isUrlInput, setIsUrlInput] = useState(true);

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
      setIsUrlInput(false); // Switch to textarea after fetching
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

  const toggleInputType = () => {
    setIsUrlInput(!isUrlInput);
    setJobPost(jobPost);
    setUrl(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <ToggleSwitch
              checked={!isUrlInput}
              onChange={toggleInputType}
              label={isUrlInput ? 'Text Input' : 'URL Input'}
            />
          </div>
          {isUrlInput ? (
            <div className="flex">
              <input
                type="text"
                className="flex-grow px-3 py-2 border border-secondary-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-150 ease-in-out"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste url here e.g.: https://example.com/job-post"
              />
              <button
                onClick={fetchJobPost}
                disabled={isLoading}
                className="bg-primary-600 text-white px-4 py-2 rounded-r-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150 ease-in-out"
              >
                {isLoading ? 'Fetching...' : 'Fetch'}
              </button>
            </div>
          ) : (
            <textarea
              rows={10}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-150 ease-in-out"
              value={jobPost}
              onChange={(e) => setJobPost(e.target.value)}
              placeholder="Paste job post here"
            ></textarea>
          )}
          <div className="flex justify-end">
            {jobPost && !isUrlInput && (<button
              onClick={analyzeJobPost}
              disabled={isLoading || (!jobPost && !url)}
              title="Analyze"
              className="bg-primary-600 text-white px-5 py-2 rounded-md hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 transition duration-150 ease-in-out transform hover:scale-105"
            >
              {isLoading ? <Spinner className="h-7 w-7"></Spinner> : <PiCpuThin className="animate-pulse h-7 w-7" />}
            </button>)}
          </div>
        </div>

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
            <Accordion collapseAll>
              <Accordion.Panel>
                <Accordion.Title className="text-lg leading-6 font-normal text-secondary-900 p-4">Analyzed Job Post</Accordion.Title>
                <Accordion.Content>
                  <div className="">
                    <ReactMarkdown className="text-pretty">{analyzedJobPost}</ReactMarkdown>
                  </div>
                </Accordion.Content>
              </Accordion.Panel>
            </Accordion>
            <div className="flex justify-center items-center">
              <button
                onClick={() => setCurrentPage("Resume")}
                title="Resume"
                className="mt-2 bg-accent-500 text-white px-5 py-2 rounded-md hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 transition duration-150 ease-in-out transform hover:scale-105"
              >
                <GrLinkNext className='animate-pulse h-7 w-7'></GrLinkNext>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobPostProcessor;