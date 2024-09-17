import React, { useState, useEffect } from 'react';
import { get } from 'aws-amplify/api';
import Markdown from 'react-markdown';
import ResumeExporter from './ResumeExporter';

interface TailoredResumeProps {
  tailoredResume: string;
  setTailoredResume: (tailoredResume: string) => void;
}

const TailoredResume: React.FC<TailoredResumeProps> = ({ tailoredResume, setTailoredResume }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchTailoredResume = async () => {
        setIsLoading(true);
        setError('');
        try {
          const restOperation = get({
            apiName: 'Api',
            path: 'tailored_resume',
          });
    
          const { body } = await restOperation.response;
          const response = await body.json();

          setTailoredResume(response);
        } catch (err) {
          setError('Loading the tailored resume failed. Please try again.');
        } finally {
          setIsLoading(false);
        }
    };
    
    useEffect(() => {
      if (!tailoredResume) {
        fetchTailoredResume();
      }
    }, [tailoredResume]);


    return (
        <div>
          {isLoading && <p className="text-gray-600">Loading...</p>}
          {error && <p className="text-red-600">{error}</p>}
          {tailoredResume && (
            <>
              <Markdown>{tailoredResume}</Markdown>
              <ResumeExporter textToDownload={tailoredResume} />
            </>
          )}
        </div>
    );
};

export default TailoredResume;