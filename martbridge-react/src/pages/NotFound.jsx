import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <Layout>
            <div className="not-found-container">
                <div className="error-code">404</div>
                <h1>Page Not Found</h1>
                <p>The page you're looking for doesn't exist or has been moved.</p>
                <button className="primary-btn" onClick={() => navigate('/')}>
                    Return Home
                </button>
            </div>

            <style jsx="true">{`
                .not-found-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    min-height: 60vh;
                    padding: 20px;
                }
                .error-code {
                    font-size: 120px;
                    font-weight: 900;
                    color: var(--primary-color, #0bb15d);
                    opacity: 0.2;
                    line-height: 1;
                    margin-bottom: -20px;
                }
                .not-found-container h1 {
                    font-size: 32px;
                    color: #333;
                    margin-bottom: 15px;
                    z-index: 1;
                }
                .not-found-container p {
                    color: #666;
                    font-size: 16px;
                    margin-bottom: 30px;
                    max-width: 400px;
                }
                .primary-btn {
                    background: var(--primary-color, #0bb15d);
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 50px;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 10px 20px rgba(11, 177, 93, 0.3);
                    transition: 0.3s;
                }
                .primary-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 15px 25px rgba(11, 177, 93, 0.4);
                }
            `}</style>
        </Layout>
    );
};

export default NotFound;
