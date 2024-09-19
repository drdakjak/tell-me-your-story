import React, { useState, useEffect } from "react";
import { PiCircleNotchThin } from "react-icons/pi";
import { GrLinkNext } from "react-icons/gr";

const Home = () => {
    const [subText, setSubText] = useState("");
    const [showButton, setShowButton] = useState(false);
    const [typingComplete, setTypingComplete] = useState(false);

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
                // Add a slight delay before showing the button
                setTimeout(() => {
                    setShowButton(true);
                }, 500); // 500ms delay
            }
        }, 50);

        return () => {
            clearInterval(subTextInterval);
        };
    }, []);

    return (
        <div className="relative flex items-center justify-center h-screen bg-gray-100">
            <div className="absolute inset-0 flex items-center justify-center">
                <PiCircleNotchThin className="w-4/5 h-4/5 fill-primary-600 rotate-90 -ml-60" />
            </div>
            <div className="flex flex-col items-center justify-center">
                <div className="flex items-center space-x-4">
                    <div className="text-center ml-32">
                        <div className="font-abel text-primary-600 text-7xl">
                            Tell Me Your Story
                        </div>
                        <div className={`text-primary-600 text-3xl mt-2 ${typingComplete ? 'typing-complete' : 'typing-text'}`}>
                            {subText}
                        </div>
                    </div>
                    <div className="w-12 h-12 flex items-center justify-center">
                        {showButton && (
                            <button
                                className="animate-fade-in bg-primary-600 hover:bg-primary-700 text-white rounded-full flex-none h-full w-full transition-all duration-300 ease-in-out transform hover:scale-110 "
                                title="Start"
                                onClick={() => { }}
                            >
                                <GrLinkNext className='h-full w-full p-3 animate-pulse'></GrLinkNext>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;