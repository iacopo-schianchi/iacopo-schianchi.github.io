import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: 'AIzaSyDiSPl8valcqJ-wCRNLrLyBObi9yK7g8e4',
    authDomain: 'personal-portfolio-2395a.firebaseapp.com',
    projectId: 'personal-portfolio-2395a',
    storageBucket: 'personal-portfolio-2395a.appspot.com',
    messagingSenderId: '1030166057266',
    appId: '1:1030166057266:web:0c96f08ff1a0e9d13c472b',
    measurementId: 'G-QQ52RLW4N6',
};

const app = initializeApp(firebaseConfig);
const storage = getStorage();

export async function getData() {
    const url = await getDownloadURL(ref(storage, 'website-data.json'));
    const response = await fetch(url);
    const data = await response.json();

    return data;
}

export async function getAllBlogMetadata() {
    const response = await getDownloadURL(ref(storage, 'website-data.json'));
    const metadataListResponse = await fetch(response);
    const metadataList = await metadataListResponse.json();

    return metadataList.blogPosts;
}

export async function getBlogPostContent(slug) {
    try {
        const mdUrl = await getDownloadURL(
            ref(storage, `blog-posts/${slug}.md`)
        );
        const mdResponse = await fetch(mdUrl);
        const content = await mdResponse.text();

        return content;
    } catch (error) {
        console.error('Error fetching blog content:', error);
        return null;
    }
}
