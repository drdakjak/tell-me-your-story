import React, { useState, useEffect } from 'react';
import { post } from '@aws-amplify/api';
import TextDiff from './TextDiff';
import { FaLightbulb, FaFileAlt } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';

interface Section {
  header: string;
  content: string;
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
    const [showAdvicePopup, setShowAdvicePopup] = useState(false);
    const [showResumePopup, setShowResumePopup] = useState(false);
    const [selectedAdvice, setSelectedAdvice] = useState('');
    const [overallResume, setOverallResume] = useState('');
    const [animateResumeIcon, setAnimateResumeIcon] = useState(false);

    useEffect(() => {
        if (tailoredSections.length > 0) {
            setAnimateResumeIcon(true);
            setTimeout(() => setAnimateResumeIcon(false), 1000);
        }
    }, [tailoredSections]);

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
            updateOverallResume(response.tailored_sections);
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
        updateOverallResume(newTailoredSections);
    };

    const updateOverallResume = (sections: TailoredSection[]) => {
        const resumeContent = sections.map(section => 
            `## ${section.tailored_section.header}\n\n${section.tailored_section.content}`
        ).join('\n\n');
        setOverallResume(resumeContent);
    };

    const openAdvicePopup = (advice: string) => {
        setSelectedAdvice(advice);
        setShowAdvicePopup(true);
    };

    const openResumePopup = () => {
        setShowResumePopup(true);
    };

    return (
        <div className="relative">
            <div className="flex space-x-2 mb-4">
                <button
                    onClick={optimiseResume}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Tailor Resume
                </button>
                <button
                    onClick={() => openAdvicePopup(tailoredSections[0]?.advice || '')}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded flex items-center"
                    disabled={tailoredSections.length === 0}>
                    <FaLightbulb className="mr-2" /> Advice
                </button>
                <button
                    onClick={openResumePopup}
                    className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center ${animateResumeIcon ? 'animate-pulse' : ''}`}
                    disabled={tailoredSections.length === 0}>
                    <FaFileAlt className="mr-2" /> Overall Resume
                </button>
            </div>
            {isLoading && <p className="text-gray-600">Loading...</p>}
            {error && <p className="text-red-600">{error}</p>}
            <div className="container mx-auto px-4 py-8">
                <TextDiff
                    originalSections={originalSections}
                    tailoredSections={tailoredSections}
                    onUpdateTailoredContent={handleUpdateTailoredContent}
                />
            </div>

            {showAdvicePopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg max-w-2xl max-h-[80vh] overflow-auto">
                        <h2 className="text-xl font-bold mb-4">Advice</h2>
                        <ReactMarkdown>{selectedAdvice}</ReactMarkdown>
                        <button
                            onClick={() => setShowAdvicePopup(false)}
                            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Close
                        </button>
                    </div>
                </div>
            )}

            {showResumePopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg max-w-2xl max-h-[80vh] overflow-auto">
                        <h2 className="text-xl font-bold mb-4">Overall Tailored Resume</h2>
                        <ReactMarkdown>{overallResume}</ReactMarkdown>
                        <button
                            onClick={() => setShowResumePopup(false)}
                            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Editor;