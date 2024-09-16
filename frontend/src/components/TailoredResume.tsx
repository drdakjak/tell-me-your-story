import React, { useState, useEffect } from 'react';
import { post } from '@aws-amplify/api';
import Markdown from 'react-markdown';
import ResumeExporter from './ResumeExporter';

const TailoredResume: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [tailoredResume, setTailoredResume] = useState('');

    const fetchResume = async () => {
        setIsLoading(true);
        setError('');
        try {
          const restOperation = post({
            apiName: 'Api',
            path: '/tailored_resume'
          });
    
          const { body } = await restOperation.response;
          const response = await body.json();
          setTailoredResume(response);
        
        } catch (err) {
          setError('Loading the resume failed. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
    // fetchResume();
    useEffect(() => {
      // Simulate fetching the tailored resume
      setTailoredResume("#sddfsdfds");
    }, []); // Empty dependency array ensures this runs only once
  

    return (
        <div>
            <Markdown>{tailoredResume}</Markdown>
            <ResumeExporter textToDownload={tailoredResume} />
        </div>
    );
};

export default TailoredResume;