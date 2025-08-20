

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const SignupPage: React.FC = () => {
    const { signup, isAuthenticated } = useAppContext();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('პაროლები არ ემთხვევა.');
            return;
        }
        setIsLoading(true);
        try {
            await signup(email, password);
            // In a real app with email confirmation, you'd show a success message.
            // In mock mode, the user is logged in automatically, and the useEffect will redirect.
            setIsSuccess(true);
        } catch (err: any) {
            setError(err.message || 'რეგისტრაციისას მოხდა შეცდომა.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess && !isAuthenticated) { // Only show success message if not yet redirected
        return (
             <div className="flex items-center justify-center h-screen w-screen bg-base-color">
                <div className="w-full max-w-md p-8 space-y-6 glass-effect rounded-xl text-center">
                     <h2 className="text-2xl font-bold text-green-400">რეგისტრაცია წარმატებულია!</h2>
                     <p className="text-gray-300">თქვენს იმეილზე გამოგზავნილია დამადასტურებელი ბმული. გთხოვთ, შეამოწმოთ თქვენი შემომავალი წერილები.</p>
                     <Link to="/login" className="font-medium accent-text hover:text-accent-color/80">
                        ავტორიზაციის გვერდზე დაბრუნება
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center h-screen w-screen bg-base-color">
            <div className="w-full max-w-md p-8 space-y-8 glass-effect rounded-xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold brand-text">
                        ანგარიშის შექმნა
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-2">
                        <input
                            name="email"
                            type="email"
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-700 bg-black/30 placeholder-gray-500 text-gray-200 focus:outline-none focus:ring-brand-color focus:border-brand-color sm:text-sm"
                            placeholder="ელ.ფოსტა"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            name="password"
                            type="password"
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-700 bg-black/30 placeholder-gray-500 text-gray-200 focus:outline-none focus:ring-brand-color focus:border-brand-color sm:text-sm"
                            placeholder="პაროლი"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                         <input
                            name="confirm-password"
                            type="password"
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-700 bg-black/30 placeholder-gray-500 text-gray-200 focus:outline-none focus:ring-brand-color focus:border-brand-color sm:text-sm"
                            placeholder="გაიმეორეთ პაროლი"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-brand-color hover:bg-brand-color/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-color disabled:opacity-50"
                        >
                            {isLoading && <span className="loader mr-2 !w-4 !h-4 !border-2"></span>}
                            რეგისტრაცია
                        </button>
                    </div>
                </form>
                 <div className="text-sm text-center">
                    <p className="text-gray-400">
                        უკვე გაქვთ ანგარიში?{' '}
                        <Link to="/login" className="font-medium accent-text hover:text-accent-color/80">
                            ავტორიზაცია
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;