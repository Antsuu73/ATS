import { auth, db } from "./firebase-config.js";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    setDoc,
    deleteDoc,
    updateDoc,
    query,
    orderBy,
    limit,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { sanitizeUserProfile, escapeHtml } from "./security.js";
import { TOPIC_LABELS } from "./problems-data.js";
import { isPermissionError } from "./progress-storage.js";

const POSTS_COL = "communityPosts";

function generateId() {
    return `c_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function timeAgo(ts) {
    const diff = Date.now() - ts;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds} giây trước`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} ngày trước`;
    const months = Math.floor(days / 30);
    return `${months} tháng trước`;
}

function getTopicLabel(topic) {
    return TOPIC_LABELS[topic] || topic || "Khác";
}

export async function createPost({ title, content, code, topic, difficulty, authorName }) {
    const user = auth.currentUser;
    if (!user) throw new Error("Vui lòng đăng nhập để đăng bài.");

    const postDoc = {
        authorId: user.uid,
        authorName: authorName || "User",
        title,
        content,
        code,
        topic,
        difficulty: difficulty || "Medium",
        likes: [],
        views: 0,
        commentCount: 0,
        createdAt: Date.now()
    };

    let remoteId = null;
    try {
        const snap = await addDoc(collection(db, POSTS_COL), {
            ...postDoc,
            createdAt: serverTimestamp()
        });
        remoteId = snap.id;
    } catch (err) {
        if (!isPermissionError(err)) {
            console.error("createPost remote error:", err);
        }
    }

    const localId = remoteId || generateId();
    const localPost = { ...postDoc, id: localId, remoteId: remoteId || localId };

    const existing = getLocalPosts();
    existing.unshift(localPost);
    saveLocalPosts(existing);

    return localPost;
}

export async function loadPosts() {
    const local = getLocalPosts();

    try {
        const q = query(collection(db, POSTS_COL), orderBy("createdAt", "desc"), limit(200));
        const snap = await getDocs(q);
        const remote = snap.docs.map((d) => {
            const data = d.data();
            return {
                id: d.id,
                remoteId: d.id,
                authorId: data.authorId || "",
                authorName: data.authorName || "User",
                title: data.title || "",
                content: data.content || "",
                code: data.code || "",
                topic: data.topic || "other",
                difficulty: data.difficulty || "Medium",
                likes: Array.isArray(data.likes) ? data.likes : [],
                views: typeof data.views === "number" ? data.views : 0,
                commentCount: typeof data.commentCount === "number" ? data.commentCount : 0,
                createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : (data.createdAt || Date.now())
            };
        });

        const merged = mergePosts(remote, local);
        saveLocalPosts(merged);
        return merged;
    } catch (err) {
        if (isPermissionError(err)) {
            return local;
        }
        console.error("loadPosts error:", err);
        return local;
    }
}

export async function loadPostById(postId) {
    const local = getLocalPosts().find((p) => p.id === postId);
    if (local && !local.remoteId) {
        return local;
    }

    try {
        const ref = doc(db, POSTS_COL, postId);
        const snap = await getDoc(ref);
        if (!snap.exists()) return local || null;

        const data = snap.data();
        const remote = {
            id: snap.id,
            remoteId: snap.id,
            authorId: data.authorId || "",
            authorName: data.authorName || "User",
            title: data.title || "",
            content: data.content || "",
            code: data.code || "",
            topic: data.topic || "other",
            difficulty: data.difficulty || "Medium",
            likes: Array.isArray(data.likes) ? data.likes : [],
            views: typeof data.views === "number" ? data.views : 0,
            commentCount: typeof data.commentCount === "number" ? data.commentCount : 0,
            createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : (data.createdAt || Date.now())
        };

        return remote;
    } catch (err) {
        if (isPermissionError(err)) return local || null;
        console.error("loadPostById error:", err);
        return local || null;
    }
}

export async function toggleLikePost(postId, uid) {
    const posts = getLocalPosts();
    const post = posts.find((p) => p.id === postId);
    if (!post) return false;

    const currentLiked = (post.likes || []).includes(uid);
    const targetLikes = currentLiked
        ? (post.likes || []).filter((id) => id !== uid)
        : [...((post.likes || []).filter((id) => id !== uid)), uid];

    post.likes = targetLikes;
    saveLocalPosts(posts);

    try {
        const ref = doc(db, POSTS_COL, postId);
        await updateDoc(ref, { likes: targetLikes });
    } catch (err) {
        if (!isPermissionError(err)) {
            console.error("toggleLikePost remote error:", err);
        }
    }

    return !currentLiked;
}

export async function incrementViews(postId) {
    const posts = getLocalPosts();
    const post = posts.find((p) => p.id === postId);
    if (post) {
        post.views = (post.views || 0) + 1;
        saveLocalPosts(posts);
    }

    try {
        const ref = doc(db, POSTS_COL, postId);
        await updateDoc(ref, {
            views: (post?.views || 0)
        });
    } catch (err) {
        if (!isPermissionError(err)) {
            console.error("incrementViews remote error:", err);
        }
    }
}

export async function addComment(postId, { content, authorId, authorName }) {
    if (!authorId) throw new Error("Thiếu thông tin người dùng.");

    const comment = {
        id: generateId(),
        postId,
        authorId,
        authorName: authorName || "User",
        content: content || "",
        createdAt: Date.now()
    };

    const key = `ats_community_comments`;
    const all = getLocalComments();
    all.push(comment);
    localStorage.setItem(key, JSON.stringify(all));

    const posts = getLocalPosts();
    const post = posts.find((p) => p.id === postId);
    if (post) {
        post.commentCount = (post.commentCount || 0) + 1;
        saveLocalPosts(posts);
    }

    try {
        const ref = doc(collection(db, POSTS_COL, postId, "comments"));
        await addDoc(ref, {
            ...comment,
            createdAt: serverTimestamp()
        });
    } catch (err) {
        if (!isPermissionError(err)) {
            console.error("addComment remote error:", err);
        }
    }

    return comment;
}

export async function loadComments(postId) {
    try {
        const q = query(collection(db, POSTS_COL, postId, "comments"), orderBy("createdAt", "asc"));
        const snap = await getDocs(q);
        const remote = snap.docs.map((d) => {
            const data = d.data();
            return {
                id: d.id,
                postId,
                authorId: data.authorId || "",
                authorName: data.authorName || "User",
                content: data.content || "",
                createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : (data.createdAt || Date.now())
            };
        });

        const local = getLocalComments().filter((c) => c.postId === postId);
        const merged = mergeComments(remote, local);
        saveLocalComments(merged);
        return merged;
    } catch (err) {
        if (isPermissionError(err)) {
            return getLocalComments().filter((c) => c.postId === postId);
        }
        console.error("loadComments error:", err);
        return getLocalComments().filter((c) => c.postId === postId);
    }
}

export function getLocalPosts() {
    try {
        const raw = localStorage.getItem("ats_community_posts");
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveLocalPosts(posts) {
    localStorage.setItem("ats_community_posts", JSON.stringify(posts));
}

export function getLocalComments() {
    try {
        const raw = localStorage.getItem("ats_community_comments");
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveLocalComments(comments) {
    localStorage.setItem("ats_community_comments", JSON.stringify(comments));
}

function mergePosts(remote, local) {
    const map = new Map();

    remote.forEach((p) => map.set(p.id, p));
    local.forEach((p) => {
        if (!map.has(p.id)) {
            map.set(p.id, p);
        } else {
            const existing = map.get(p.id);
            const remoteTime = existing.createdAt || 0;
            const localTime = p.createdAt || 0;
            if (localTime > remoteTime) {
                map.set(p.id, {
                    ...existing,
                    ...p,
                    likes: Array.isArray(p.likes) ? p.likes : existing.likes
                });
            }
        }
    });

    return Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

function mergeComments(remote, local) {
    const map = new Map();
    remote.forEach((c) => map.set(c.id, c));
    local.forEach((c) => {
        if (!map.has(c.id)) {
            map.set(c.id, c);
        } else {
            const existing = map.get(c.id);
            const remoteTime = existing.createdAt || 0;
            const localTime = c.createdAt || 0;
            if (localTime > remoteTime) {
                map.set(c.id, { ...existing, ...c });
            }
        }
    });

    return Array.from(map.values()).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
}
