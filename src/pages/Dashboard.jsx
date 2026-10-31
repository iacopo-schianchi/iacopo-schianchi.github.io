import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import {
    auth,
    addSectionItem,
    getDashboardSections,
    removeSectionItem,
    signOut,
    updateSectionItem,
    updateSectionItemOrder,
} from '../firebase';
import './Dashboard.css';

const editableFields = [
    { name: 'title', label: 'Title' },
    { name: 'subtitle', label: 'Subtitle' },
    { name: 'link', label: 'Link' },
    { name: 'image', label: 'Image' },
    { name: 'video', label: 'Video' },
    { name: 'date', label: 'Date' },
    { name: 'content', label: 'Content', multiline: true },
];

function getSectionItemIds(section) {
    const itemIds = Object.keys(section.items);
    const itemOrder = Array.isArray(section.itemOrder)
        ? section.itemOrder.filter((id) => itemIds.includes(id))
        : [];

    return [...itemOrder, ...itemIds.filter((id) => !itemOrder.includes(id))];
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [sections, setSections] = useState([]);
    const [savedOrders, setSavedOrders] = useState({});
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [savingKey, setSavingKey] = useState('');

    useEffect(() => {
        return onAuthStateChanged(
            auth,
            (user) => {
                if (!user) {
                    navigate('/login', { replace: true });
                    return;
                }

                setIsCheckingAuth(false);
            },
            (error) => {
                console.error('Unable to verify the current user:', error);
                setErrorMessage('Unable to verify your sign-in. Please try again.');
                setIsCheckingAuth(false);
                setIsLoading(false);
            },
        );
    }, [navigate]);

    useEffect(() => {
        if (isCheckingAuth) return undefined;

        let isActive = true;

        async function loadSections() {
            setIsLoading(true);
            setErrorMessage('');

            try {
                const loadedSections = await getDashboardSections();
                if (!isActive) return;

                setSections(loadedSections);
                setSavedOrders(
                    Object.fromEntries(
                        loadedSections.map((section) => [
                            section.id,
                            getSectionItemIds(section),
                        ]),
                    ),
                );
            } catch (error) {
                console.error('Unable to load dashboard sections:', error);
                if (isActive) {
                    setErrorMessage(
                        'Unable to load sections. Check your connection and permissions, then try again.',
                    );
                }
            } finally {
                if (isActive) setIsLoading(false);
            }
        }

        loadSections();

        return () => {
            isActive = false;
        };
    }, [isCheckingAuth]);

    function updateItemField(sectionId, itemId, field, value) {
        setSections((currentSections) =>
            currentSections.map((section) =>
                section.id === sectionId
                    ? {
                          ...section,
                          items: {
                              ...section.items,
                              [itemId]: {
                                  ...section.items[itemId],
                                  [field]: value,
                              },
                          },
                      }
                    : section,
            ),
        );
        setStatusMessage('');
    }

    function moveItem(sectionId, itemId, direction) {
        setSections((currentSections) =>
            currentSections.map((section) => {
                if (section.id !== sectionId) return section;

                const itemOrder = getSectionItemIds(section);
                const currentIndex = itemOrder.indexOf(itemId);
                const destinationIndex = currentIndex + direction;

                if (
                    currentIndex < 0 ||
                    destinationIndex < 0 ||
                    destinationIndex >= itemOrder.length
                ) {
                    return section;
                }

                [itemOrder[currentIndex], itemOrder[destinationIndex]] = [
                    itemOrder[destinationIndex],
                    itemOrder[currentIndex],
                ];

                return { ...section, itemOrder };
            }),
        );
        setStatusMessage('');
    }

    async function saveItem(sectionId, itemId) {
        const section = sections.find((item) => item.id === sectionId);
        const item = section?.items[itemId];
        if (!item) return;

        const key = `${sectionId}:${itemId}`;
        setSavingKey(key);
        setErrorMessage('');
        setStatusMessage('');

        try {
            await updateSectionItem(sectionId, itemId, item);
            setSections((currentSections) =>
                currentSections.map((currentSection) => {
                    if (currentSection.id !== sectionId) return currentSection;

                    const savedItem = { ...currentSection.items[itemId] };
                    editableFields.forEach(({ name }) => {
                        if (
                            typeof savedItem[name] !== 'string' ||
                            savedItem[name].trim() === ''
                        ) {
                            delete savedItem[name];
                        }
                    });

                    return {
                        ...currentSection,
                        items: {
                            ...currentSection.items,
                            [itemId]: savedItem,
                        },
                    };
                }),
            );
            setStatusMessage('Item saved.');
        } catch (error) {
            console.error('Unable to save section item:', error);
            setErrorMessage(
                'Unable to save this item. Check your connection and permissions, then try again.',
            );
        } finally {
            setSavingKey('');
        }
    }

    async function saveOrder(section) {
        const itemOrder = getSectionItemIds(section);
        const key = `${section.id}:order`;
        setSavingKey(key);
        setErrorMessage('');
        setStatusMessage('');

        try {
            await updateSectionItemOrder(section.id, itemOrder);
            setSavedOrders((currentOrders) => ({
                ...currentOrders,
                [section.id]: itemOrder,
            }));
            setStatusMessage(`Order saved for ${section.title || section.id}.`);
        } catch (error) {
            console.error('Unable to save section item order:', error);
            setErrorMessage(
                'Unable to save this item order. Check your connection and permissions, then try again.',
            );
        } finally {
            setSavingKey('');
        }
    }

    async function handleAddItem(section) {
        const key = `${section.id}:add`;
        setSavingKey(key);
        setErrorMessage('');
        setStatusMessage('');

        try {
            const { itemId, itemOrder } = await addSectionItem(section.id);

            setSections((currentSections) =>
                currentSections.map((currentSection) =>
                    currentSection.id === section.id
                        ? {
                              ...currentSection,
                              items: {
                                  ...currentSection.items,
                                  [itemId]: { id: itemId },
                              },
                              itemOrder,
                          }
                        : currentSection,
                ),
            );
            setSavedOrders((currentOrders) => ({
                ...currentOrders,
                [section.id]: itemOrder,
            }));
            setStatusMessage(`New item added to ${section.title || section.id}.`);
        } catch (error) {
            console.error('Unable to add section item:', error);
            setErrorMessage(
                'Unable to add an item. Check your connection and permissions, then try again.',
            );
        } finally {
            setSavingKey('');
        }
    }

    async function handleRemoveItem(section, itemId) {
        const item = section.items[itemId];
        const itemName = item.title || itemId;

        if (
            !window.confirm(
                `Remove "${itemName}" from ${section.title || section.id}? This cannot be undone.`,
            )
        ) {
            return;
        }

        const key = `${section.id}:${itemId}:remove`;
        setSavingKey(key);
        setErrorMessage('');
        setStatusMessage('');

        try {
            const itemOrder = await removeSectionItem(section.id, itemId);

            setSections((currentSections) =>
                currentSections.map((currentSection) => {
                    if (currentSection.id !== section.id) return currentSection;

                    const items = { ...currentSection.items };
                    delete items[itemId];

                    return { ...currentSection, items, itemOrder };
                }),
            );
            setSavedOrders((currentOrders) => ({
                ...currentOrders,
                [section.id]: itemOrder,
            }));
            setStatusMessage(`"${itemName}" removed.`);
        } catch (error) {
            console.error('Unable to remove section item:', error);
            setErrorMessage(
                'Unable to remove this item. Check your connection and permissions, then try again.',
            );
        } finally {
            setSavingKey('');
        }
    }

    async function handleSignOut() {
        setErrorMessage('');
        try {
            await signOut();
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Unable to sign out:', error);
            setErrorMessage('Unable to sign out. Please try again.');
        }
    }

    if (isCheckingAuth) {
        return (
            <main className="dashboard-page">
                <p className="dashboard-status" role="status">
                    Checking your session...
                </p>
            </main>
        );
    }

    return (
        <main className="dashboard-page">
            <header className="dashboard-header">
                <div>
                    <p className="dashboard-eyebrow">PORTFOLIO ADMIN</p>
                    <h1 className="dashboard-title">Dashboard</h1>
                </div>
                <div className="dashboard-header-actions">
                    <Link className="dashboard-secondary-button" to="/">
                        View portfolio
                    </Link>
                    <button
                        className="dashboard-secondary-button"
                        onClick={handleSignOut}
                        type="button"
                    >
                        Sign out
                    </button>
                </div>
            </header>

            {errorMessage && (
                <p className="dashboard-message dashboard-error" role="alert">
                    {errorMessage}
                </p>
            )}
            {statusMessage && (
                <p className="dashboard-message dashboard-success" role="status">
                    {statusMessage}
                </p>
            )}

            {isLoading ? (
                <p className="dashboard-status" role="status">
                    Loading sections...
                </p>
            ) : sections.length === 0 ? (
                <p className="dashboard-status">No sections were found.</p>
            ) : (
                <div className="dashboard-sections">
                    {sections.map((section) => {
                        const itemIds = getSectionItemIds(section);
                        const currentOrder = JSON.stringify(itemIds);
                        const savedOrder = JSON.stringify(
                            savedOrders[section.id] || [],
                        );

                        return (
                            <section
                                className="dashboard-section"
                                key={section.id}
                            >
                                <div className="dashboard-section-heading">
                                    <div>
                                        <h2>
                                            {section.title || section.id}
                                        </h2>
                                        <p className="dashboard-document-id">
                                            Document ID: {section.id}
                                        </p>
                                    </div>
                                    <button
                                        className="dashboard-primary-button"
                                        disabled={
                                            currentOrder === savedOrder ||
                                            savingKey === `${section.id}:add` ||
                                            savingKey === `${section.id}:order`
                                        }
                                        onClick={() => saveOrder(section)}
                                        type="button"
                                    >
                                        {savingKey === `${section.id}:order`
                                            ? 'Saving order...'
                                            : 'Save item order'}
                                    </button>
                                    <button
                                        className="dashboard-secondary-button"
                                        disabled={
                                            savingKey === `${section.id}:add`
                                        }
                                        onClick={() => handleAddItem(section)}
                                        type="button"
                                    >
                                        {savingKey === `${section.id}:add`
                                            ? 'Adding item...'
                                            : 'Add item'}
                                    </button>
                                </div>

                                {itemIds.map((itemId, index) => {
                                    const item = section.items[itemId];
                                    const saveKey = `${section.id}:${itemId}`;

                                    return (
                                        <article
                                            className="dashboard-item"
                                            key={itemId}
                                        >
                                            <div className="dashboard-item-heading">
                                                <h3>
                                                    {item.title || itemId}
                                                </h3>
                                                <span className="dashboard-document-id">
                                                    {itemId}
                                                </span>
                                            </div>

                                            <div className="dashboard-item-fields">
                                                {editableFields.map(
                                                    ({
                                                        name,
                                                        label,
                                                        multiline,
                                                    }) => (
                                                        <label
                                                            className={
                                                                multiline
                                                                    ? 'dashboard-field dashboard-field-wide'
                                                                    : 'dashboard-field'
                                                            }
                                                            htmlFor={`${section.id}-${itemId}-${name}`}
                                                            key={name}
                                                        >
                                                            <span>{label}</span>
                                                            {multiline ? (
                                                                <textarea
                                                                    className="dashboard-markdown"
                                                                    id={`${section.id}-${itemId}-${name}`}
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        updateItemField(
                                                                            section.id,
                                                                            itemId,
                                                                            name,
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    rows={10}
                                                                    value={
                                                                        item[
                                                                            name
                                                                        ] ||
                                                                        ''
                                                                    }
                                                                />
                                                            ) : (
                                                                <input
                                                                    id={`${section.id}-${itemId}-${name}`}
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        updateItemField(
                                                                            section.id,
                                                                            itemId,
                                                                            name,
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    type="text"
                                                                    value={
                                                                        item[
                                                                            name
                                                                        ] ||
                                                                        ''
                                                                    }
                                                                />
                                                            )}
                                                        </label>
                                                    ),
                                                )}
                                            </div>

                                            <div className="dashboard-item-actions">
                                                <div className="dashboard-reorder-actions">
                                                    <button
                                                        aria-label={`Move ${item.title || itemId} up`}
                                                        className="dashboard-secondary-button"
                                                        disabled={index === 0}
                                                        onClick={() =>
                                                            moveItem(
                                                                section.id,
                                                                itemId,
                                                                -1,
                                                            )
                                                        }
                                                        type="button"
                                                    >
                                                        Move up
                                                    </button>
                                                    <button
                                                        aria-label={`Move ${item.title || itemId} down`}
                                                        className="dashboard-secondary-button"
                                                        disabled={
                                                            index ===
                                                            itemIds.length - 1
                                                        }
                                                        onClick={() =>
                                                            moveItem(
                                                                section.id,
                                                                itemId,
                                                                1,
                                                            )
                                                        }
                                                        type="button"
                                                    >
                                                        Move down
                                                    </button>
                                                </div>
                                                <button
                                                    className="dashboard-primary-button"
                                                    disabled={
                                                        savingKey === saveKey ||
                                                        savingKey ===
                                                            `${section.id}:${itemId}:remove`
                                                    }
                                                    onClick={() =>
                                                        saveItem(
                                                            section.id,
                                                            itemId,
                                                        )
                                                    }
                                                    type="button"
                                                >
                                                    {savingKey === saveKey
                                                        ? 'Saving...'
                                                        : 'Save item'}
                                                </button>
                                                <button
                                                    className="dashboard-remove-button"
                                                    disabled={
                                                        savingKey ===
                                                        `${section.id}:${itemId}:remove`
                                                    }
                                                    onClick={() =>
                                                        handleRemoveItem(
                                                            section,
                                                            itemId,
                                                        )
                                                    }
                                                    type="button"
                                                >
                                                    {savingKey ===
                                                    `${section.id}:${itemId}:remove`
                                                        ? 'Removing...'
                                                        : 'Remove item'}
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })}
                            </section>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
