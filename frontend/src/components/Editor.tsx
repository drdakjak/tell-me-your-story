import React, { useState } from 'react';
import { post } from '@aws-amplify/api';
import Render from './SectionsRender';

interface Section {
    header: string;
    content: string;
    section_id: string;
}

interface TailoredSection {
    advice: string;
    header: string;
    content: string;
    section_id: string;
}

interface EditorProps {
    originalSections: Section[];
    setOriginalSections: (originalSections: Section[]) => void;
    tailoredSections: TailoredSection[];
    setTailoredSections: (tailoredSections: TailoredSection[]) => void;
}


const Editor: React.FC<EditorProps> = ({ originalSections, setOriginalSections, tailoredSections, setTailoredSections }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const optimiseResume = async () => {
        setIsLoading(true);
        setError('');
        try {
            const { body } = await post({
                apiName: 'Api',
                path: 'optimise_resume',
                options: {
                    body: {}
                }
            }).response;

            const response = await body.json();
            setOriginalSections(response.semantic_sections);
            setTailoredSections(response.tailored_sections);
        } catch (err) {
            setError('Error analyzing job post. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between mb-4">
                <button
                    onClick={optimiseResume}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Tailor Resume
                </button>
            </div>
            {isLoading && <p className="text-gray-600">Loading...</p>}
            {error && <p className="text-red-600">{error}</p>}
            <div className="container mx-auto px-4 py-8">
                <Render
                    originalSections={originalSections}
                    tailoredSections={tailoredSections}
                />
            </div>
        </div>
    );
}

export default Editor;