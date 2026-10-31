import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import {
    auth,
    addSection,
    addSectionItem,
    getDashboardSections,
    removeSection,
    removeSectionItem,
    signOut,
    updateSectionOrder,
    updateSectionTitle,
    updateSectionVisibility,
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

function getOrderedSections(sections, order) {
    const sectionsById = new Map(
        sections.map((section) => [section.id, section]),
    );
    const orderedSections = [];
    const includedIds = new Set();

    order.forEach((sectionId) => {
        const section = sectionsById.get(sectionId);
        if (section && !includedIds.has(sectionId)) {
            orderedSections.push(section);
            includedIds.add(sectionId);
        }
    });

    sections.forEach((section) => {
        if (!includedIds.has(section.id)) orderedSections.push(section);
    });

    return orderedSections;
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [sections, setSections] = useState([]);
    const [sectionOrder, setSectionOrder] = useState([]);
    const [savedSectionOrder, setSavedSectionOrder] = useState([]);
    const [sectionTitles, setSectionTitles] = useState({});
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
                const {
                    sections: loadedSections,
                    order: loadedSectionOrder,
                } = await getDashboardSections();
                if (!isActive) return;

                setSections(loadedSections);
                setSectionOrder(loadedSectionOrder);
                setSavedSectionOrder(loadedSectionOrder);
                setSectionTitles(
                    Object.fromEntries(
                        loadedSections.map((section) => [
                            section.id,
                            section.title || '',
                        ]),
                    ),
                );
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

    const orderedSections = getOrderedSections(sections, sectionOrder);

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

    function moveSection(sectionId, direction) {
        setSectionOrder((currentOrder) => {
            const order = getOrderedSections(sections, currentOrder).map(
                (section) => section.id,
            );
            const currentIndex = order.indexOf(sectionId);
            const destinationIndex = currentIndex + direction;

            if (
                currentIndex < 0 ||
                destinationIndex < 0 ||
                destinationIndex >= order.length
            ) {
                return currentOrder;
            }

            [order[currentIndex], order[destinationIndex]] = [
                order[destinationIndex],
                order[currentIndex],
            ];
            return order;
        });
        setStatusMessage('');
    }

    async function saveSectionOrder() {
        const order = orderedSections.map((section) => section.id);
        setSavingKey('section-order');
        setErrorMessage('');
        setStatusMessage('');

        try {
            await updateSectionOrder(order);
            setSectionOrder(order);
            setSavedSectionOrder(order);
            setStatusMessage('Section order saved.');
        } catch (error) {
            console.error('Unable to save section order:', error);
            setErrorMessage(
                'Unable to save section order. Check your connection and permissions, then try again.',
            );
        } finally {
            setSavingKey('');
        }
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

    async function handleAddSection() {
        const key = 'section:add';
        setSavingKey(key);
        setErrorMessage('');
        setStatusMessage('');

        try {
            const section = await addSection('New section');
            setSections((currentSections) => [...currentSections, section]);
            setSectionTitles((currentTitles) => ({
                ...currentTitles,
                [section.id]: section.title,
            }));
            setSavedOrders((currentOrders) => ({
                ...currentOrders,
                [section.id]: [],
            }));
            setStatusMessage('Section added.');
        } catch (error) {
            console.error('Unable to add section:', error);
            setErrorMessage(
                'Unable to add a section. Check your connection and permissions, then try again.',
            );
        } finally {
            setSavingKey('');
        }
    }

    async function handleRenameSection(section) {
        const title = (sectionTitles[section.id] || '').trim();
        if (!title) {
            setErrorMessage('Section name cannot be empty.');
            return;
        }

        setSavingKey(`${section.id}:rename`);
        setErrorMessage('');
        setStatusMessage('');

        try {
            await updateSectionTitle(section.id, title);
            setSections((currentSections) =>
                currentSections.map((currentSection) =>
                    currentSection.id === section.id
                        ? { ...currentSection, title }
                        : currentSection,
                ),
            );
            setSectionTitles((currentTitles) => ({
                ...currentTitles,
                [section.id]: title,
            }));
            setStatusMessage(`Section renamed to "${title}".`);
        } catch (error) {
            console.error('Unable to rename section:', error);
            setErrorMessage(
                'Unable to rename this section. Check your connection and permissions, then try again.',
            );
        } finally {
            setSavingKey('');
        }
    }

    async function handleToggleSectionVisibility(section) {
        const websiteVisible = !section.websiteVisible;
        setSavingKey(`${section.id}:visibility`);
        setErrorMessage('');
        setStatusMessage('');

        try {
            await updateSectionVisibility(section.id, websiteVisible);
            setSections((currentSections) =>
                currentSections.map((currentSection) =>
                    currentSection.id === section.id
                        ? { ...currentSection, websiteVisible }
                        : currentSection,
                ),
            );
            setStatusMessage(
                `Section ${websiteVisible ? 'shown on' : 'hidden from'} the website.`,
            );
        } catch (error) {
            console.error('Unable to update section visibility:', error);
            setErrorMessage(
                'Unable to update visibility. Check your connection and permissions, then try again.',
            );
        } finally {
            setSavingKey('');
        }
    }

    async function handleRemoveSection(section) {
        const sectionName = section.title || section.id;
        if (
            !window.confirm(
                `Delete "${sectionName}" and all ${Object.keys(section.items).length} of its items? This cannot be undone.`,
            )
        ) {
            return;
        }

        setSavingKey(`${section.id}:remove`);
        setErrorMessage('');
        setStatusMessage('');

        try {
            await removeSection(section.id);
            setSections((currentSections) =>
                currentSections.filter(
                    (currentSection) => currentSection.id !== section.id,
                ),
            );
            setSectionTitles((currentTitles) => {
                const nextTitles = { ...currentTitles };
                delete nextTitles[section.id];
                return nextTitles;
            });
            setSavedOrders((currentOrders) => {
                const nextOrders = { ...currentOrders };
                delete nextOrders[section.id];
                return nextOrders;
            });
            setStatusMessage(`Section "${sectionName}" deleted.`);
        } catch (error) {
            console.error('Unable to delete section:', error);
            setErrorMessage(
                'Unable to delete this section. Check your connection and permissions, then try again.',
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
                    <button
                        className="dashboard-primary-button"
                        disabled={
                            JSON.stringify(
                                orderedSections.map((section) => section.id),
                            ) === JSON.stringify(savedSectionOrder) ||
                            savingKey === 'section-order'
                        }
                        onClick={saveSectionOrder}
                        type="button"
                    >
                        {savingKey === 'section-order'
                            ? 'Saving section order...'
                            : 'Save section order'}
                    </button>
                    <button
                        className="dashboard-primary-button"
                        disabled={
                            savingKey === 'section:add' ||
                            savingKey === 'section-order'
                        }
                        onClick={handleAddSection}
                        type="button"
                    >
                        {savingKey === 'section:add'
                            ? 'Adding section...'
                            : 'Add section'}
                    </button>
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
            ) : (
                <div className="dashboard-sections">
                    {sections.length === 0 && (
                        <p className="dashboard-status">
                            No sections were found. Add one to get started.
                        </p>
                    )}
                    {orderedSections.map((section, sectionIndex) => {
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
                                        <label
                                            className="dashboard-section-title-field"
                                            htmlFor={`section-title-${section.id}`}
                                        >
                                            <span>Section name</span>
                                            <input
                                                id={`section-title-${section.id}`}
                                                onChange={(event) =>
                                                    setSectionTitles(
                                                        (currentTitles) => ({
                                                            ...currentTitles,
                                                            [section.id]:
                                                                event.target
                                                                    .value,
                                                        }),
                                                    )
                                                }
                                                value={
                                                    sectionTitles[section.id] ??
                                                    ''
                                                }
                                            />
                                        </label>
                                        <p className="dashboard-document-id">
                                            Document ID: {section.id}
                                        </p>
                                    </div>
                                    <div className="dashboard-section-actions">
                                        <div className="dashboard-reorder-actions">
                                            <button
                                                aria-label={`Move section ${section.title || section.id} up`}
                                                className="dashboard-secondary-button"
                                                disabled={
                                                    sectionIndex === 0 ||
                                                    savingKey ===
                                                        'section-order'
                                                }
                                                onClick={() =>
                                                    moveSection(section.id, -1)
                                                }
                                                type="button"
                                            >
                                                Move section up
                                            </button>
                                            <button
                                                aria-label={`Move section ${section.title || section.id} down`}
                                                className="dashboard-secondary-button"
                                                disabled={
                                                    sectionIndex ===
                                                        orderedSections.length -
                                                            1 ||
                                                    savingKey ===
                                                        'section-order'
                                                }
                                                onClick={() =>
                                                    moveSection(section.id, 1)
                                                }
                                                type="button"
                                            >
                                                Move section down
                                            </button>
                                        </div>
                                        <label className="dashboard-visibility-toggle">
                                            <input
                                                checked={
                                                    section.websiteVisible ===
                                                    true
                                                }
                                                disabled={
                                                    savingKey ===
                                                    `${section.id}:visibility`
                                                }
                                                onChange={() =>
                                                    handleToggleSectionVisibility(
                                                        section,
                                                    )
                                                }
                                                type="checkbox"
                                            />
                                            <span>Visible on website</span>
                                        </label>
                                        <button
                                            className="dashboard-secondary-button"
                                            disabled={
                                                savingKey ===
                                                `${section.id}:rename`
                                            }
                                            onClick={() =>
                                                handleRenameSection(section)
                                            }
                                            type="button"
                                        >
                                            {savingKey ===
                                            `${section.id}:rename`
                                                ? 'Renaming...'
                                                : 'Save name'}
                                        </button>
                                        <button
                                            className="dashboard-primary-button"
                                            disabled={
                                                currentOrder === savedOrder ||
                                                savingKey ===
                                                    `${section.id}:add` ||
                                                savingKey ===
                                                    `${section.id}:order`
                                            }
                                            onClick={() => saveOrder(section)}
                                            type="button"
                                        >
                                            {savingKey ===
                                            `${section.id}:order`
                                                ? 'Saving order...'
                                                : 'Save item order'}
                                        </button>
                                        <button
                                            className="dashboard-secondary-button"
                                            disabled={
                                                savingKey ===
                                                `${section.id}:add`
                                            }
                                            onClick={() =>
                                                handleAddItem(section)
                                            }
                                            type="button"
                                        >
                                            {savingKey === `${section.id}:add`
                                                ? 'Adding item...'
                                                : 'Add item'}
                                        </button>
                                        <button
                                            className="dashboard-remove-button"
                                            disabled={
                                                savingKey ===
                                                    `${section.id}:remove` ||
                                                savingKey === 'section-order'
                                            }
                                            onClick={() =>
                                                handleRemoveSection(section)
                                            }
                                            type="button"
                                        >
                                            {savingKey ===
                                            `${section.id}:remove`
                                                ? 'Deleting...'
                                                : 'Delete section'}
                                        </button>
                                    </div>
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
