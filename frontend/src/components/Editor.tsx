import React, { useState, useEffect } from 'react';
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
            setError('Error tailoring resume. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log('tailoredSections:', tailoredSections);
        if (!tailoredSections.length) {
            optimiseResume();
        }
    }, [tailoredSections]);

    return (
        <div className="space-y-6">
            {isLoading && (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                </div>
            )}

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

            {(originalSections.length > 0 || tailoredSections.length > 0) && (
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:p-6">
                        <Render
                            originalSections={originalSections}
                            tailoredSections={tailoredSections}
                        />
                    </div>
                </div>
            )}

            {!isLoading && !error && originalSections.length === 0 && tailoredSections.length === 0 && (
                <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-6 text-center">
                    <p className="text-secondary-600">No resume sections available. Click the "Tailor Resume" button to start the process.</p>
                </div>
            )}
        </div>
    );
}

export default Editor;