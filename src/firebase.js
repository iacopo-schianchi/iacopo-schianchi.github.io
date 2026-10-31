import {
    getFirestore,
    collection,
    getDocs,
    query,
    where,
    getDoc,
    doc,
    updateDoc,
    deleteField,
    runTransaction,
    setDoc,
    deleteDoc,
    writeBatch,
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
    signOut as firebaseSignOut,
} from 'firebase/auth';

const firebaseConfig = {
    apiKey: 'AIzaSyDk2BJthQiwd0uNa7yN8jN2046XUdKyaZA',
    authDomain: 'iacopo-schianchi-website.firebaseapp.com',
    projectId: 'iacopo-schianchi-website',
    storageBucket: 'iacopo-schianchi-website.firebasestorage.app',
    messagingSenderId: '617900698774',
    appId: '1:617900698774:web:5ee9547f0f823b412ca6b7',
    measurementId: 'G-HQR90B8R4Q',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export const auth = getAuth(app);

export async function signInWithEmailAndPassword(email, password) {
    return firebaseSignInWithEmailAndPassword(auth, email, password);
}

async function fetchSections(sectionsQuery) {
    const snapshot = await getDocs(sectionsQuery);

    const sections = await Promise.all(
        snapshot.docs.map(async (sectionDoc) => {
            const itemsSnapshot = await getDocs(
                collection(db, 'sections', sectionDoc.id, 'items'),
            );

            const itemsMap = itemsSnapshot.docs.reduce((acc, itemDoc) => {
                acc[itemDoc.id] = {
                    id: itemDoc.id,
                    ...itemDoc.data(),
                };
                return acc;
            }, {});

            return {
                id: sectionDoc.id,
                ...sectionDoc.data(),
                items: itemsMap,
            };
        }),
    );

    return sections;
}

async function fetchSectionOrder() {
    const orderSnapshot = await getDoc(doc(db, 'websiteData', 'sectionOrder'));
    const order = orderSnapshot.exists() ? orderSnapshot.data().order : [];

    return Array.isArray(order)
        ? order.filter((sectionId) => typeof sectionId === 'string')
        : [];
}

function orderSections(sections, order) {
    const sectionsById = new Map(sections.map((section) => [section.id, section]));
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

export async function getVisibleSections() {
    const sectionsQuery = query(
        collection(db, 'sections'),
        where('websiteVisible', '==', true),
    );

    const [sections, order] = await Promise.all([
        fetchSections(sectionsQuery),
        fetchSectionOrder(),
    ]);

    return orderSections(sections, order);
}

export async function getDashboardSections() {
    const [sections, order] = await Promise.all([
        fetchSections(collection(db, 'sections')),
        fetchSectionOrder(),
    ]);
    const orderedSections = orderSections(sections, order);

    return {
        sections: orderedSections,
        order: orderedSections.map((section) => section.id),
    };
}

export async function updateSectionOrder(order) {
    await setDoc(
        doc(db, 'websiteData', 'sectionOrder'),
        { order },
        { merge: true },
    );
}

export async function addSection(title) {
    const sectionRef = doc(collection(db, 'sections'));
    const section = {
        title,
        websiteVisible: false,
        itemOrder: [],
    };

    await setDoc(sectionRef, section);
    return { id: sectionRef.id, ...section, items: {} };
}

export async function updateSectionTitle(sectionId, title) {
    await updateDoc(doc(db, 'sections', sectionId), { title });
}

export async function updateSectionVisibility(sectionId, websiteVisible) {
    await updateDoc(doc(db, 'sections', sectionId), { websiteVisible });
}

export async function removeSection(sectionId) {
    const sectionRef = doc(db, 'sections', sectionId);
    const itemsSnapshot = await getDocs(
        collection(db, 'sections', sectionId, 'items'),
    );
    const itemDocs = itemsSnapshot.docs;
    const batchSize = 450;

    if (itemDocs.length === 0) {
        await deleteDoc(sectionRef);
        return;
    }

    for (let offset = 0; offset < itemDocs.length; offset += batchSize) {
        const batch = writeBatch(db);
        const itemsInBatch = itemDocs.slice(offset, offset + batchSize);
        itemsInBatch.forEach((itemDoc) => batch.delete(itemDoc.ref));

        if (offset + itemsInBatch.length === itemDocs.length) {
            batch.delete(sectionRef);
        }

        await batch.commit();
    }
}

export async function updateSectionItem(sectionId, itemId, fields) {
    const editableFields = [
        'title',
        'subtitle',
        'link',
        'image',
        'video',
        'date',
        'content',
    ];
    const updates = {};

    editableFields.forEach((field) => {
        const value = fields[field];
        updates[field] =
            typeof value === 'string' && value.trim() !== ''
                ? value
                : deleteField();
    });

    await updateDoc(doc(db, 'sections', sectionId, 'items', itemId), updates);
}

export async function updateSectionItemOrder(sectionId, itemOrder) {
    await updateDoc(doc(db, 'sections', sectionId), { itemOrder });
}

export async function addSectionItem(sectionId) {
    const sectionRef = doc(db, 'sections', sectionId);
    const itemRef = doc(collection(db, 'sections', sectionId, 'items'));

    const itemOrder = await runTransaction(db, async (transaction) => {
        const sectionSnapshot = await transaction.get(sectionRef);

        if (!sectionSnapshot.exists()) {
            throw new Error(`Section ${sectionId} does not exist.`);
        }

        const currentOrder = sectionSnapshot.data().itemOrder;
        const nextOrder = [
            ...(Array.isArray(currentOrder) ? currentOrder : []),
            itemRef.id,
        ];
        transaction.set(itemRef, {});
        transaction.update(sectionRef, { itemOrder: nextOrder });
        return nextOrder;
    });

    return { itemId: itemRef.id, itemOrder };
}

export async function removeSectionItem(sectionId, itemId) {
    const sectionRef = doc(db, 'sections', sectionId);
    const itemRef = doc(db, 'sections', sectionId, 'items', itemId);

    return runTransaction(db, async (transaction) => {
        const sectionSnapshot = await transaction.get(sectionRef);

        if (!sectionSnapshot.exists()) {
            throw new Error(`Section ${sectionId} does not exist.`);
        }

        const currentOrder = sectionSnapshot.data().itemOrder;
        const itemOrder = Array.isArray(currentOrder)
            ? currentOrder.filter((orderedItemId) => orderedItemId !== itemId)
            : [];
        transaction.delete(itemRef);
        transaction.update(sectionRef, { itemOrder });
        return itemOrder;
    });
}

export async function signOut() {
    await firebaseSignOut(auth);
}

export async function fetchResearch(id) {
    try {
        const docRef = doc(db, 'research', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data(),
            };
        } else {
            console.warn(`No research document found with ID: ${id}`);
            return null;
        }
    } catch (error) {
        console.error('Error fetching research document:', error);
        throw error;
    }
}

export async function getData() {
    // const url = await getDownloadURL(ref(storage, 'website-data.json'));
    // const response = await fetch(url);
    // const data = await response.json();
    // return data;
}

export async function getAllBlogMetadata() {
    // const response = await getDownloadURL(ref(storage, 'website-data.json'));
    // const metadataListResponse = await fetch(response);
    // const metadataList = await metadataListResponse.json();
    // return metadataList.blogPosts;
}

export async function getBlogPostContent(slug) {
    // try {
    //     const mdUrl = await getDownloadURL(
    //         ref(storage, `blog-posts/${slug}.md`),
    //     );
    //     const mdResponse = await fetch(mdUrl);
    //     const content = await mdResponse.text();
    //     return content;
    // } catch (error) {
    //     console.error('Error fetching blog content:', error);
    //     return null;
    // }
}
