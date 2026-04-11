import React from 'react';
import { usePopup } from '../context/PopupContext';

const CustomPopup = () => {
    const { popup, closePopup } = usePopup();

    if (!popup.show) return null;

    return (
        <div className="custom-popup-overlay" onClick={() => popup.type === 'alert' && closePopup()}>
            <div className="custom-popup" onClick={(e) => e.stopPropagation()}>
                <h2>{popup.title}</h2>
                <p>{popup.message}</p>
                <div className="custom-popup-actions">
                    {popup.type === 'confirm' && (
                        <button className="popup-btn popup-btn-cancel" onClick={() => closePopup(false)}>
                            Cancel
                        </button>
                    )}
                    <button className="popup-btn popup-btn-confirm" onClick={() => closePopup(true)}>
                        {popup.type === 'confirm' ? 'Confirm' : 'OK'}
                    </button>
                </div>
            </div>

            <style jsx="true">{`
                .custom-popup-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.4);
                    backdrop-filter: blur(5px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    animation: fadeIn 0.3s ease;
                }

                .custom-popup {
                    background: white;
                    padding: 30px;
                    border-radius: 24px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
                    text-align: center;
                    width: 90%;
                    max-width: 400px;
                    animation: popupSlide 0.4s cubic-bezier(0.19, 1, 0.22, 1);
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes popupSlide {
                    from {
                        transform: translateY(30px) scale(0.95);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                }

                .custom-popup h2 {
                    margin: 0 0 10px;
                    color: #333;
                    font-size: 22px;
                    font-weight: 700;
                }

                .custom-popup p {
                    color: #666;
                    margin-bottom: 25px;
                    font-size: 15px;
                    line-height: 1.5;
                }

                .custom-popup-actions {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                }

                .popup-btn {
                    padding: 12px 28px;
                    border: none;
                    border-radius: 14px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    min-width: 100px;
                }

                .popup-btn:active {
                    transform: scale(0.96);
                }

                .popup-btn-confirm {
                    background: #0bb15d;
                    color: white;
                    box-shadow: 0 5px 15px rgba(11, 177, 93, 0.2);
                }

                .popup-btn-confirm:hover {
                    box-shadow: 0 8px 20px rgba(11, 177, 93, 0.3);
                    transform: translateY(-2px);
                }

                .popup-btn-cancel {
                    background: #f0f2f5;
                    color: #666;
                }

                .popup-btn-cancel:hover {
                    background: #e4e6e9;
                }
            `}</style>
        </div>
    );
};

export default CustomPopup;
