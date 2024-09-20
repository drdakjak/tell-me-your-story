import React, { useState, useEffect } from "react";
import { PiCircleNotchThin } from "react-icons/pi";
import { GrLinkNext } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import { useAppContext } from '../components/AppContext';

const Home = () => {
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
        <div className="relative flex items-center justify-center h-screen bg-gradient-to-b from-primary-50 to-secondary-50">
            <div className="absolute inset-0 flex items-center justify-center rotate-45 -ml-20 md:-ml-40 lg:-ml-60">
                <svg className="w-4/6 h-4/6 rotate-12" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <mask id="notch-mask">
                            <rect width="100" height="100" fill="white" />
                            <path d="M50,5 A45,45 0 0,1 88.97,27.5" className="stroke-2 fill-none stroke-black" stroke="black" />
                        </mask>
                    </defs>
                    <circle cx="50" cy="50" r="45" className="stroke-primary-700 stroke-1" fill="none" mask="url(#notch-mask)" />
                </svg>
            </div>

            <div className="flex flex-col items-center justify-center">
                <div className="flex items-center space-x-4">
                    <div className="text-center ml-32">
                        <div className="font-abel text-primary-600 text-3xl md:text-7xl 2xl:text-9xl">
                            Tell Me Your Story
                        </div>
                        <div className={`font-abel text-primary-600 md:text-4xl 2xl:text-6xl mt-2 ${typingComplete ? 'typing-complete' : 'typing-text'}`}>
                            {subText}
                        </div>
                    </div>
                    <div className="w-8 h-8 md:w-12 md:h-12  2xl:w-16 2xl:h-16 flex items-center justify-center">
                        {showButton && (
                            <button
                                className="animate-fade-in bg-primary-600 hover:bg-primary-700 text-white rounded-full flex-none h-full w-full transition-all duration-300 ease-in-out transform hover:scale-110"
                                title="Start"
                                onClick={handleStartClick}
                            >
                                <GrLinkNext className='h-full w-full p-2 md:p-3 animate-pulse'></GrLinkNext>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;