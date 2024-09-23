import React, { useState } from 'react';
import { post } from 'aws-amplify/api';
import ReactMarkdown from 'react-markdown';
import { Switch } from '@headlessui/react';
import { IoSparklesSharp, IoChevronForwardOutline } from "react-icons/io5";
import { HiFire } from "react-icons/hi";
import { Accordion } from 'flowbite-react';


interface JobPostProcessorProps {
  jobPost: string;
  setJobPost: (jobPost: string) => void;
  analyzedJobPost: string;
  setAnalyzedJobPost: (analyzedJobPost: string) => void;
  setTailoredSections: (tailoredSections: any[]) => void;
  setCurrentPage: (page: string) => void;
}

const JobPostProcessor: React.FC<JobPostProcessorProps> = ({
  jobPost,
  setJobPost,
  analyzedJobPost,
  setAnalyzedJobPost,
  setTailoredSections,
  setCurrentPage
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [url, setUrl] = useState('');
  const [isUrlInput, setIsUrlInput] = useState<boolean>(!Boolean(analyzedJobPost) && false);
  const [isFetchUrlCall, setIsFetchUrlCall] = useState(false);

  const fetchJobPost = async () => {
    setIsFetchUrlCall(true);
    console.log(isFetchUrlCall);
    // Functionality remains the same, commented out for brevity
  };

  const analyzeJobPost = async () => {
    setIsLoading(true);
    setError('');
    setTailoredSections([])
    setAnalyzedJobPost("")
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
        <div className="px-6 py-5">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-600">
              {isUrlInput ? 'URL Input' : 'Text Input'}
            </span>
            <Switch
              checked={!isUrlInput}
              onChange={toggleInputType}
              className={`${!isUrlInput ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              <span className="sr-only">Toggle input type</span>
              <span
                className={`${!isUrlInput ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>

          {isFetchUrlCall && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md flex items-center">
              <HiFire className="h-5 w-5 mr-2" />
              <span>Sorry, work in progress. Please switch to "Text input"</span>
            </div>
          )}

          {isUrlInput ? (
            <div className="flex">
              <input
                type="text"
                className="flex-grow px-4 py-2 border-2 border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste url here e.g.: https://example.com/job-post"
              />
              <button
                onClick={fetchJobPost}
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
              >
                {isLoading ? 'Fetching...' : 'Fetch'}
              </button>
            </div>
          ) : (
            <textarea
              rows={10}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
              value={jobPost}
              onChange={(e) => setJobPost(e.target.value)}
              placeholder="Paste job post here"
            ></textarea>
          )}

          <div className="mt-4 flex justify-end">
            {jobPost && !isUrlInput && (
              <button
                onClick={analyzeJobPost}
                disabled={isLoading || (!jobPost && !url)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out flex items-center"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <IoSparklesSharp className="h-5 w-5 mr-2" />
                )}
                Analyze
              </button>
            )}
          </div>
        </div>
      </div>

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

      {analyzedJobPost && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <Accordion collapseAll>
              <Accordion.Panel>
                <Accordion.Title className="text-lg font-semibold text-gray-900">Hiring Criteria</Accordion.Title>
                <Accordion.Content>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <ReactMarkdown className="markdown-content prose max-w-none">{analyzedJobPost}</ReactMarkdown>
                  </div>
                </Accordion.Content>
              </Accordion.Panel>
            </Accordion>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setCurrentPage("Resume")}
                className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out flex items-center"
              >
                Next
                <IoChevronForwardOutline className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobPostProcessor;