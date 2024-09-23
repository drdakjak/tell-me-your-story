import React, { useState, useEffect } from 'react';
import { post } from '@aws-amplify/api';
import Render from '../components/SectionsRender';
import { IoChevronForwardOutline } from "react-icons/io5";

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
    setIsUpdated: (isUpdated: boolean) => void;
    setCurrentPage: (currentPage: string) => void;
}

const Editor: React.FC<EditorProps> = ({
    originalSections,
    setOriginalSections,
    tailoredSections,
    setTailoredSections,
    setIsUpdated,
    setCurrentPage
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const optimiseResume = async () => {
        setIsLoading(true);
        setError('');
        setIsUpdated(true);

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
            console.error(err);
            setError('Error tailoring resume. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!tailoredSections.length) {
            optimiseResume();
        }
    }, [tailoredSections, originalSections]);

    return (
        <div className="space-y-6">
            {isLoading && (
                <div className="flex justify-center items-center py-12">
                    <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}

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

            {(originalSections.length > 0 && tailoredSections.length > 0) && (
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div className="px-6 py-5">
                        <Render
                            setIsUpdated={setIsUpdated}
                            originalSections={originalSections}
                            tailoredSections={tailoredSections}
                        />
                    </div>
                    <div className="px-6 py-4 bg-gray-50 flex justify-center">
                        <button
                            onClick={() => setCurrentPage("Tailored Resume")}
                            className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out flex items-center"
                        >
                            Next
                            <IoChevronForwardOutline className="ml-2 h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}

            {!isLoading && !error && (originalSections.length === 0 || tailoredSections.length === 0) && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <p className="text-gray-600">No resume sections available.</p>
                </div>
            )}
        </div>
    );
}

export default Editor;