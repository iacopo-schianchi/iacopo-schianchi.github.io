import './App.css';
import { useEffect, useState } from 'react';
import { getAllBlogMetadata, getBlogPostContent } from './firebase';
import Main from './pages/Main';
import BlogList from './pages/BlogList';
import Blog from './pages/Blog';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

export default function App() {
    const [metadata, setMetadata] = useState();

    useEffect(() => {
        (async () => {
            const metadata = await getAllBlogMetadata();
            setMetadata(metadata);
        })();
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Main />} />
                <Route
                    path="/blogs"
                    element={<BlogList metadata={metadata} />}
                />
                <Route
                    path="/blogs/:id"
                    element={<Blog metadata={metadata} />}
                />
            </Routes>
        </Router>
    );
}
