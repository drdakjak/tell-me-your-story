import React, { useState, useEffect } from "react";
import { IoArrowForward } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useAppContext } from '../components/AppContext';

const Home: React.FC = () => {
    const [subText, setSubText] = useState("");
    const [showButton, setShowButton] = useState(false);
    const [typingComplete, setTypingComplete] = useState(false);
    const navigate = useNavigate();
    const { setCurrentPage } = useAppContext();

    useEffect(() => {
        const subTextFull = "Use AI to get your dream Job";
        let subIndex = 0;

        const subTextInterval = setInterval(() => {
            if (subIndex < subTextFull.length) {
                setSubText(subTextFull.slice(0, subIndex + 1));
                subIndex++;
            } else {
                clearInterval(subTextInterval);
                setTypingComplete(true);
                setTimeout(() => {
                    setShowButton(true);
                }, 200);
            }
        }, 50);

        return () => {
            clearInterval(subTextInterval);
        };
    }, []);

    const handleStartClick = () => {
        setCurrentPage('Job Post');
        navigate("/job-post");
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-blue-100">
            <div className="text-center px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-4">
                    Tell Me Your Story
                </h1>
                <div className={`text-xl sm:text-2xl lg:text-3xl text-blue-600 mb-8 h-8 sm:h-10 lg:h-12 ${typingComplete ? 'typing-complete' : 'typing-text'}`}>
                    {subText}
                </div>
                {showButton ? (
                    <button
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out transform hover:scale-105"
                        onClick={handleStartClick}
                    >
                        Get Started
                        <IoArrowForward className="ml-2 -mr-1 h-5 w-5" />
                    </button>
                    ) : (
                        <div className="h-14"></div> // Placeholder with the same height as the button
                    )}
            </div>
        </div>
    );
};

export default Home;