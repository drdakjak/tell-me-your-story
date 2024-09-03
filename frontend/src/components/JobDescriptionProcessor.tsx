import React, { useState } from 'react';
import { post } from 'aws-amplify/api';

const JobDescriptionProcessor: React.FC = () => {
  const [url, setUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [requirements, setRequirements] = useState<{ text: string; type: 'required' | 'nice to have' }[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchJobDescription = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch job description');
      }
      const text = await response.text();
      setJobDescription(text);
    } catch (err) {
      setError('Error fetching job description. Please check the URL and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeJobDescription = async () => {
    setIsLoading(true);
    setError('');
    try {
      const restOperation = post({
        apiName: 'JobAnalysisAPI',
        path: '/analyze',
        options: {
          body: { jobDescription }
        }
      });

      const { data, response } = await restOperation.response;

      if (!response.ok) {
        throw new Error('Failed to analyze job description');
      }

      setRequirements(data.requirements);
      setKeywords(data.keywords);
    } catch (err) {
      setError('Error analyzing job description. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAnalysis = async () => {
    setIsLoading(true);
    setError('');
    try {
      const restOperation = post({
        apiName: 'JobAnalysisAPI',
        path: '/save',
        options: {
          body: {
            jobDescription,
            requirements,
            keywords
          }
        }
      });

      const { data, response } = await restOperation.response;

      if (!response.ok) {
        throw new Error('Failed to save analysis');
      }

      console.log('Analysis saved successfully with ID:', data.id);
      // Handle successful save (e.g., show a success message)
    } catch (err) {
      setError('Error saving analysis. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Job Description Analysis</h1>
      
      <div className="mb-6">
        <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-2">
          Job Description URL
        </label>
        <div className="flex">
          <input
            type="text"
            id="url-input"
            className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/job-description"
          />
          <button
            onClick={fetchJobDescription}
            disabled={isLoading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Fetch
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="job-description" className="block text-sm font-medium text-gray-700 mb-2">
          Job Description
        </label>
        <textarea
          id="job-description"
          rows={10}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste or enter job description here"
        ></textarea>
      </div>

      <div className="flex justify-between mb-6">
        <button
          onClick={analyzeJobDescription}
          disabled={isLoading || !jobDescription}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Extract Requirements and Keywords
        </button>
        <button
          onClick={saveAnalysis}
          disabled={isLoading || (!requirements.length && !keywords.length)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save Analysis
        </button>
      </div>

      {isLoading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {requirements.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Requirements</h2>
          <ul className="list-disc pl-5">
            {requirements.map((req, index) => (
              <li key={index} className={req.type === 'required' ? 'font-semibold' : ''}>
                {req.text} ({req.type})
              </li>
            ))}
          </ul>
        </div>
      )}

      {keywords.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Keywords</h2>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <span key={index} className="bg-gray-200 px-2 py-1 rounded-md text-sm">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDescriptionProcessor;