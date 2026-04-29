import React, { useEffect, useState } from 'react';

const SplashScreen = ({ onFinish }) => {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Wait 1.5 seconds, then trigger fade out
        const timer1 = setTimeout(() => {
            setFadeOut(true);
        }, 1500);

        // After fade out transition (0.5s), tell App to unmount splash
        const timer2 = setTimeout(() => {
            if (onFinish) onFinish();
        }, 2000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [onFinish]);

    return (
        <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
            <div className="splash-content">
                <img src="/logo.png" alt="MartBridge" className="splash-logo" />
                <h1 className="splash-title">MartBridge</h1>
                <div className="spinner"></div>
            </div>

            <style jsx="true">{`
                .splash-screen {
                    position: fixed;
                    inset: 0;
                    background: var(--bg-gradient, #f4fffb);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    transition: opacity 0.5s ease-out;
                    opacity: 1;
                }
                .splash-screen.fade-out {
                    opacity: 0;
                    pointer-events: none;
                }
                .splash-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    animation: pulse 2s infinite ease-in-out;
                }
                .splash-logo {
                    width: 100px;
                    height: 100px;
                    object-fit: contain;
                    margin-bottom: 20px;
                    filter: drop-shadow(0 10px 15px rgba(11, 177, 93, 0.3));
                }
                .splash-title {
                    font-size: 32px;
                    font-weight: 800;
                    color: var(--primary-color, #0bb15d);
                    margin-bottom: 30px;
                    letter-spacing: 1px;
                }
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid rgba(11, 177, 93, 0.2);
                    border-top-color: var(--primary-color, #0bb15d);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                @keyframes pulse {
                    0% { transform: scale(0.98); }
                    50% { transform: scale(1.02); }
                    100% { transform: scale(0.98); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default SplashScreen;
