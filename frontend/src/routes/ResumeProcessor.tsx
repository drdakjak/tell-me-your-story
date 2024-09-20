import React, { useState } from 'react';
import { post } from 'aws-amplify/api';
import ReactMarkdown from 'react-markdown';
import { ToggleSwitch } from "flowbite-react";
import { GrLinkNext } from "react-icons/gr";
import { Spinner } from "flowbite-react";
import { Accordion } from "flowbite-react";
import FileUpload from '../components/FileUpload';
import { IoCloudUploadOutline } from "react-icons/io5"
import { IoSparklesSharp } from "react-icons/io5";
import { Toast } from "flowbite-react";
import { HiFire } from "react-icons/hi";

interface ResumeProcessorProps {
  resume: string;
  setResume: (resume: string) => void;
  analyzedResume: any[];
  setAnalyzedResume: (analyzedResume: any[]) => void;
  setTailoredSections: (tailoredSections: any[]) => void;
  setCurrentPage: (page: string) => void;
}

const ResumeProcessor: React.FC<ResumeProcessorProps> = ({ resume, setResume, analyzedResume, setAnalyzedResume, setTailoredSections, setCurrentPage }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [url, setUrl] = useState('');
  const [isFileInput, setIsFileInput] = useState(!Boolean(analyzedResume) && false);
  const [isFileInputCall, setIsFileInputCall] = useState(false);


  const fetchResume = async () => {
    setIsFileInputCall(true);
    // setIsLoading(true);
    // setError('');
    // try {
    //   const response = await fetch(url);
    //   if (!response.ok) {
    //     throw new Error('Failed to fetch job post');
    //   }
    //   const text = await response.text();
    //   setResume(text);
    //   setIsFileInput(false); // Switch to textarea after fetching
    // } catch (err) {
    //   setError('Error fetching job post. Please check the URL and try again.');
    // } finally {
    //   setIsLoading(false);
    // }
  };

  const analyzeResume = async () => {
    setIsLoading(true);
    setError('');
    setTailoredSections([])
    setAnalyzedResume([])
    try {
      const restOperation = post({
        apiName: 'Api',
        path: 'process_resume',
        options: {
          body: { resume }
        }
      });

      const { body } = await restOperation.response;
      // console.log(await body.text())

      const response = await body.json();

      setAnalyzedResume(response);
    } catch (err) {
      setError('Error analyzing resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleInputType = () => {
    setIsFileInput(!isFileInput);
    setResume(resume);
    setUrl(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <ToggleSwitch
              checked={!isFileInput}
              onChange={toggleInputType}
              label={isFileInput ? 'Text Input' : ''}
            />
          </div>
          {isFileInputCall && (
            <div className="flex justify-end"><Toast>
              <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200">
                <HiFire className="h-5 w-5" />
              </div>
              <div className="ml-3 text-sm font-normal">Sorry, work in progress. Please switch to "Text input"</div>
              <Toast.Toggle />
            </Toast>
            </div>)}
          {isFileInput ? (
            <div className="">
              <FileUpload />
              <div className="flex justify-end">
                <button
                  onClick={fetchResume}
                  disabled={isLoading}
                  className="bg-primary-600 text-white px-5 py-2 rounded-md hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 transition duration-150 ease-in-out transform hover:scale-105"
                >
                  {isLoading ? <Spinner className="h-6 w-5"></Spinner> : <IoCloudUploadOutline className="animate-pulse h-6 w-5"></IoCloudUploadOutline>}
                </button>
              </div>
            </div>
          ) : (
            <textarea
              rows={10}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-150 ease-in-out"
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Paste resume here"
            ></textarea>
          )}
          <div className="flex justify-end">
            {resume && !isFileInput && (<button
              onClick={analyzeResume}
              disabled={isLoading || (!resume && !url)}
              title="Analyze"
              className="bg-primary-600 text-white px-5 py-2 rounded-md hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 transition duration-150 ease-in-out transform hover:scale-105"
            >
              {isLoading ? <Spinner className="h-6 w-5"></Spinner> : <IoSparklesSharp className="animate-pulse h-6 w-5" />}

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

      {Boolean(analyzedResume.length) && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <Accordion collapseAll>
              {analyzedResume.map((section, index) => (
                <Accordion.Panel key={index}>
                  <Accordion.Title className="text-lg leading-6 font-normal text-secondary-900 p-4">{section.header}</Accordion.Title>
                  <Accordion.Content>
                    <div className="">
                      <ReactMarkdown className="markdown-content">{section.content}</ReactMarkdown>
                    </div>
                  </Accordion.Content>
                </Accordion.Panel>
              ))}
            </Accordion>
            <div className="flex justify-center items-center">
              <button
                onClick={() => setCurrentPage("Editor")}
                title="Editor"
                className="mt-2 bg-accent-500 text-white px-5 py-2 rounded-md hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 transition duration-150 ease-in-out transform hover:scale-105"
              >
                <GrLinkNext className='animate-pulse h-6 w-5'></GrLinkNext>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeProcessor;