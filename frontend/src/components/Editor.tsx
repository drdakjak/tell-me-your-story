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
                path: '/optimise_resume',
                options: {
                    body: {}
                }
            }).response;

            const response = await body.json();
            setOriginalSections(response.semantic_sections);
            setTailoredSections(response.tailored_sections);
            console.log(response);
        } catch (err) {
            setError('Error analyzing job post. Please try again.');
            console.error('POST call failed: ', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateTailoredContent = (index: number, newContent: string) => {
        const newTailoredSections = [...tailoredSections];
        newTailoredSections[index].tailored_section.content = newContent;
        setTailoredSections(newTailoredSections);
    };

    const generateTailoredResume = () => {
        return tailoredSections.map(section => `## ${section.tailored_section.header}\n\n${section.tailored_section.content}`).join('\n\n');
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
                        Show Overall Tailored Resume
                    </button>
                )}
            </div>
            {isLoading && <p className="text-gray-600">Loading...</p>}
            {error && <p className="text-red-600">{error}</p>}
            <div className="container mx-auto px-4 py-8">
                <Render
                    originalSections={originalSections}
                    tailoredSections={tailoredSections}
                    onUpdateTailoredContent={handleUpdateTailoredContent}
                />
            </div>
            {showTailoredResume && (
                <TailoredResumeView
                    tailoredResume={generateTailoredResume()}
                    onClose={() => setShowTailoredResume(false)}
                />
            )}
        </div>
    );
}

export default Editor;