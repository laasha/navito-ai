

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const LoginPage: React.FC = () => {
    const { login, isAuthenticated } = useAppContext();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'ელ.ფოსტა ან პაროლი არასწორია.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen w-screen bg-base-color">
            <div className="w-full max-w-md p-8 space-y-8 glass-effect rounded-xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold brand-text">
                        ავტორიზაცია
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-black/30 placeholder-gray-500 text-gray-200 rounded-t-md focus:outline-none focus:ring-brand-color focus:border-brand-color focus:z-10 sm:text-sm"
                                placeholder="ელ.ფოსტა"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-black/30 placeholder-gray-500 text-gray-200 rounded-b-md focus:outline-none focus:ring-brand-color focus:border-brand-color focus:z-10 sm:text-sm"
                                placeholder="პაროლი"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-brand-color hover:bg-brand-color/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-color disabled:opacity-50"
                        >
                            {isLoading && <span className="loader mr-2 !w-4 !h-4 !border-2"></span>}
                            შესვლა
                        </button>
                    </div>
                </form>
                <div className="text-sm text-center">
                    <p className="text-gray-400">
                        არ გაქვთ ანგარიში?{' '}
                        <Link to="/signup" className="font-medium accent-text hover:text-accent-color/80">
                            რეგისტრაცია
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;