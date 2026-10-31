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

export async function getVisibleSections() {
    const sectionsQuery = query(
        collection(db, 'sections'),
        where('websiteVisible', '==', true),
    );

    return fetchSections(sectionsQuery);
}

export async function getDashboardSections() {
    return fetchSections(collection(db, 'sections'));
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
