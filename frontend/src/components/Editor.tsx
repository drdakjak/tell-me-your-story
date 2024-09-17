import React, { useState } from 'react';
import { post } from '@aws-amplify/api';
import Render from './SectionsRender';
import TailoredResumeView from './TailoredResumeView';

interface Section {
    header: string;
    content: string;
    section_id: string;
}

interface TailoredSection {
    advice: string;
    tailored_section: Section;
}

const Editor: React.FC = () => {
    const [originalSections, setOriginalSections] = useState<Section[]>([]);
    const [tailoredSections, setTailoredSections] = useState<TailoredSection[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showTailoredResume, setShowTailoredResume] = useState(false);

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
                {tailoredSections.length > 0 && (
                    <button
                        onClick={() => setShowTailoredResume(true)}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                        Show Tailored Resume
                    </button>
                )}
            </div>
            {isLoading && <p className="text-gray-600">Loading...</p>}
            {error && <p className="text-red-600">{error}</p>}
            <div className="container mx-auto px-4 py-8">
                <Render
                    originalSections={originalSections}
                    tailoredSections={tailoredSections}
                />
            </div>
            {showTailoredResume && (
                <TailoredResumeView
                    tailoredSections={tailoredSections}
                    onClose={() => setShowTailoredResume(false)}
                />
            )}
        </div>
    );
}

export default Editor;