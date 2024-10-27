import './BlogList.css';
import { useEffect, useState } from 'react';
import Hero from '../components/hero/Hero';
import BlogCard from '../components/blog-list/BlogCard';
import CategoryButton from '../components/blog-list/CategoryButton';
import InfoCursor from '../components/InfoCursor';

export default function BlogList({ metadata }) {
    const [selectedCategories, setSelectedCategories] = useState({});

    // Extract all unique categories
    useEffect(() => {
        if (metadata) {
            const categories = {};
            metadata.forEach((post) => {
                post.tags.forEach((tag) => {
                    if (!categories[tag]) {
                        categories[tag] = false; // Initialize each unique category as false
                    }
                });
            });
            setSelectedCategories(categories);
        }
    }, [metadata]);

    const handleCategoryToggle = (category) => {
        setSelectedCategories((prevCategories) => ({
            ...prevCategories,
            [category]: !prevCategories[category],
        }));
    };

    const isAnyCategorySelected = Object.values(selectedCategories).some(
        (isSelected) => isSelected
    );

    console.log(isAnyCategorySelected);

    const filteredMetadata = metadata
        ? metadata.filter(
              (post) =>
                  !isAnyCategorySelected ||
                  post.tags.some((tag) => selectedCategories[tag])
          )
        : [];
    console.log(filteredMetadata);

    return (
        <div>
            <InfoCursor />
            <a href="/" className="link blog-link">
                Personal portfolio
            </a>
            <Hero finalLines={['Welcome to my', 'blogs']} />
            <div className="section">
                <div className="category-filters">
                    {Object.keys(selectedCategories).map((category, index) => (
                        <CategoryButton
                            key={index}
                            category={category}
                            handleCategoryToggle={handleCategoryToggle}
                            selectedCategories={selectedCategories}
                        />
                    ))}
                </div>
                <div className="blog-list">
                    {metadata && filteredMetadata.length > 0 ? (
                        filteredMetadata.map((post) => (
                            <BlogCard
                                key={post.slug}
                                title={post.title}
                                description={post.description}
                                date={post.date}
                                postId={post.slug.replace('post', '')}
                                imageUrl="https://www.econlib.org/wp-content/uploads/2020/07/entrepreneurship2.jpg"
                            />
                        ))
                    ) : (
                        <p>No blogs found for the selected categories.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
