import React, { useState, useEffect } from 'react';
import { post } from '@aws-amplify/api';
import Render from '../components/SectionsRender';
import { GrLinkNext } from "react-icons/gr";
import { Spinner } from "flowbite-react";

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

const Editor: React.FC<EditorProps> = ({ originalSections, setOriginalSections, tailoredSections, setTailoredSections, setIsUpdated, setCurrentPage }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const optimiseResume = async () => {
        setIsLoading(true);
        setError('');
        setIsUpdated(true)

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
            console.error(err)
            setError('Error tailoring resume. Please try again.');
        } finally {
            console.log("finall")
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!tailoredSections.length) {
            console.log("optimiseResume")
            optimiseResume();
        }

    }, [tailoredSections, originalSections, isLoading, error]);

    

    return (
        <div className="space-y-6">
            {isLoading && (
                <div className="flex justify-center items-center py-12">
                        <Spinner className="h-7 w-7"></Spinner>
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

            {(originalSections.length > 0 && tailoredSections.length > 0) && (
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div className="px-4 pt-5 sm:p-2">
                        <Render
                            setIsUpdated={setIsUpdated}
                            originalSections={originalSections}
                            tailoredSections={tailoredSections}
                        />
                    </div>
                    <div className="flex justify-center items-center">
                        <button
                            onClick={() => setCurrentPage("Tailored Resume")}
                            title="Tailored Resume"
                            className="bg-accent-500 text-white px-5 py-2 rounded-md hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 transition duration-150 ease-in-out transform hover:scale-105"
                        >
                            <GrLinkNext className='animate-pulse h-6 w-5'></GrLinkNext>
                        </button>
                    </div>
                </div>

            )}

            {!isLoading && !error && (originalSections.length === 0 || tailoredSections.length === 0) && (
                <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-6 text-center">
                    <p className="text-secondary-600">No resume sections available.</p>
                </div>
            )}
        </div>
    );
}

export default Editor;