import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithEmailAndPassword } from '../firebase';
import './Login.css';

function getLoginErrorMessage(error) {
    switch (error.code) {
        case 'auth/invalid-email':
            return 'Enter a valid email address.';
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return 'The email or password is incorrect.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please wait a moment and try again.';
        case 'auth/network-request-failed':
            return 'Unable to connect. Check your internet connection and try again.';
        default:
            return 'Sign in failed. Please try again.';
    }
}

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        return onAuthStateChanged(auth, (user) => {
            if (user) navigate('/dashboard', { replace: true });
            setIsCheckingSession(false);
        });
    }, [navigate]);

    async function handleSubmit(event) {
        event.preventDefault();
        setErrorMessage('');
        setIsSubmitting(true);

        try {
            await signInWithEmailAndPassword(email.trim(), password);
            navigate('/dashboard', { replace: true });
        } catch (error) {
            setErrorMessage(getLoginErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isCheckingSession) {
        return (
            <main className="login-page">
                <p className="login-status" role="status">
                    Checking your session...
                </p>
            </main>
        );
    }

    return (
        <main className="login-page">
            <section className="login-card">
                <Link className="login-home-link" to="/">
                    Back to portfolio
                </Link>
                <p className="login-eyebrow">WELCOME BACK</p>
                <h1 className="login-title" id="login-title">
                    Sign in
                </h1>
                <p className="login-description">Update website information</p>

                <form className="login-form" onSubmit={handleSubmit}>
                    <label htmlFor="login-email">Email address</label>
                    <input
                        autoComplete="email"
                        autoFocus
                        id="login-email"
                        name="email"
                        onChange={(event) => setEmail(event.target.value)}
                        required
                        type="email"
                        value={email}
                    />

                    <label htmlFor="login-password">Password</label>
                    <input
                        autoComplete="current-password"
                        id="login-password"
                        name="password"
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        type="password"
                        value={password}
                    />

                    {errorMessage && (
                        <p className="login-error" role="alert">
                            {errorMessage}
                        </p>
                    )}

                    <button
                        className="login-submit"
                        disabled={isSubmitting}
                        type="submit"
                    >
                        {isSubmitting ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
            </section>
        </main>
    );
}
