import './App.css';
import { useEffect, useState } from 'react';
import { getAllBlogMetadata } from './firebase';
import Main from './pages/Main';
import { Routes, Route, HashRouter } from 'react-router-dom';
import Research from './pages/Research';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export default function App() {
    const [metadata, setMetadata] = useState();

    useEffect(() => {
        (async () => {
            const metadata = await getAllBlogMetadata();
            setMetadata(metadata);
        })();
    }, []);

    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Main />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/research/:id" element={<Research />} />
            </Routes>
        </HashRouter>
    );
}
