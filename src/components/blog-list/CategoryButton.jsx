import './CategoryButton.css';
import React from 'react';

export default function CategoryButton({
    category,
    handleCategoryToggle,
    selectedCategories,
}) {
    return (
        <button
            key={category}
            onClick={() => handleCategoryToggle(category)}
            className={`category-button ${
                selectedCategories[category] ? 'selected' : ''
            }`}
        >
            {category}
        </button>
    );
}
