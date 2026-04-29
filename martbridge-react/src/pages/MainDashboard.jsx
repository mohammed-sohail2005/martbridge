import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const MainDashboard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        try {
            // Persistent Login Logic: Check for stored IDs and redirect
            const adminId = typeof localStorage !== 'undefined' ? localStorage.getItem('adminId') : null;
            const deptId = typeof localStorage !== 'undefined' ? localStorage.getItem('deptId') : null;
            const vegId = typeof localStorage !== 'undefined' ? localStorage.getItem('vegId') : null;
            const meatId = typeof localStorage !== 'undefined' ? localStorage.getItem('meatId') : null;
            const hotelId = typeof localStorage !== 'undefined' ? localStorage.getItem('hotelId') : null;

            if (adminId) navigate('/admin');
            else if (deptId) navigate('/department/dashboard');
            else if (vegId) navigate('/vegetable/dashboard');
            else if (meatId) navigate('/meat/dashboard');
            else if (hotelId) navigate('/hotel/dashboard');
        } catch (err) {
            console.warn("Storage access failed:", err);
        }
    }, [navigate]);

    const roles = [
        {
            title: "Department Store",
            description: "Manage items, prices & hotel tie-ups",
            image: "https://akm-img-a-in.tosshub.com/indiatoday/images/story/202203/Grocery_store.jpg?size=690:388",
            path: "/department/register"
        },
        {
            title: "Vegetable Shop",
            description: "Supply fresh vegetables to hotels",
            image: "https://images.unsplash.com/photo-1542838132-92c53300491e",
            path: "/vegetable/register"
        },
        {
            title: "Meat Shop",
            description: "Manage meat supply & daily rates",
            image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f",
            path: "/meat/register"
        },
        {
            title: "Hotel / Restaurant",
            description: "Manage orders & Profile",
            image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
            path: "/hotel/login"
        },
        {
            title: "Catering Agent",
            description: "Find nearby stores & prices",
            image: "https://images.unsplash.com/photo-1555244162-803834f70033",
            onClick: () => alert('Agent module coming soon')
        }
    ];

    return (
        <Layout>
            <div className="title">
                <h1>SELECT YOUR <span>ROLE</span></h1>
                <p>Continue to register or login</p>
            </div>

            <div className="grid">
                {roles.map((role, index) => (
                    <div
                        key={index}
                        className="card"
                        onClick={role.onClick || (() => navigate(role.path))}
                        style={{ backgroundImage: `url('${role.image}')` }}
                    >
                        <div className="overlay">
                            <h2>{role.title}</h2>
                            <p>{role.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx="true">{`
                .title {
                    text-align: center;
                    margin-bottom: 28px;
                }

                .title h1 {
                    font-size: 26px;
                    font-weight: 800;
                }

                .title span {
                    color: var(--primary-color);
                }

                .title p {
                    font-size: 14px;
                    color: var(--secondary-color);
                    margin-top: 6px;
                }

                .grid {
                    width: 100%;
                    max-width: 1100px;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 18px;
                }

                .card {
                    height: 240px;
                    border-radius: 24px;
                    background-size: cover;
                    background-position: center;
                    position: relative;
                    overflow: hidden;
                    cursor: pointer;
                    box-shadow: 0 14px 40px rgba(0, 0, 0, .12);
                    transition: .3s;
                }

                .card:hover {
                    transform: translateY(-6px) scale(1.02);
                }

                .overlay {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    padding: 20px;
                    background: linear-gradient(transparent, rgba(0, 0, 0, .75));
                    color: white;
                    text-align: left;
                }

                .overlay h2 {
                    font-size: 20px;
                    margin-bottom: 4px;
                    color: white;
                }

                .overlay p {
                    font-size: 13px;
                    opacity: .9;
                    color: white;
                }

                @media (max-width: 768px) {
                    .title h1 { font-size: 22px; }
                    .grid { grid-template-columns: 1fr; gap: 12px; }
                    .card { height: 180px; border-radius: 20px; }
                    .overlay h2 { font-size: 18px; }
                }
            `}</style>
        </Layout>
    );
};

export default MainDashboard;
