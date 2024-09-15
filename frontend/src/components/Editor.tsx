import React, { useState, useEffect } from 'react';
import TextDiff from './TextDiff';
import { post } from 'aws-amplify/api';


const Editor: React.FC = () => {
    const [originalSections, setOriginalSections] = useState([]);
    const [tailoredSections, setTailoredSections] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const optimiseResume = async () => {
        setIsLoading(true);
        setError('');
        try {
            const restOperation = post({
                apiName: 'Api',
                path: '/optimise_resume',
                options: {
                    body: {}
                }
            });

            const { body } = await restOperation.response;
            const response = await body.json();
            setOriginalSections(response.semantic_sections);
            setTailoredSections(response.tailored_sections);
            console.log(response);
        } catch (err) {
            setError('Error analyzing job post. Please try again.');
            console.log('POST call failed: ', JSON.parse(err.response.body));
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div>
            <button
                onClick={optimiseResume}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Tailor Resume
            </button>
            {isLoading && <p className="text-gray-600">Loading...</p>}
            {error && <p className="text-red-600">{error}</p>}
            <div className="container mx-auto px-4 py-8">
                <TextDiff
                    originalSections={originalSections}
                    tailoredSections={tailoredSections}
                />
            </div>
        </div>
    );
}

export default Editor;