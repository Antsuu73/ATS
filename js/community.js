import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { escapeHtml } from "./security.js";
import { TOPIC_LABELS } from "./problems-data.js";
import {
    loadPosts,
    loadPostById,
    createPost,
    toggleLikePost,
    incrementViews,
    addComment,
    loadComments,
    getLocalPosts,
    saveLocalPosts
} from "./community-service.js";

let searchEl = null;
let filterBtns = null;
let listEl = null;
let detailEl = null;
let composeModal = null;
let composeForm = null;
let btnCompose = null;
let btnCloseCompose = null;
let btnCancelCompose = null;

let currentFilter = "all";
let currentSearch = "";
let currentPostId = null;
let currentUserUid = null;
let currentUserName = null;

function escapeCode(text) {
    if (text == null) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
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

function getDifficultyClass(difficulty) {
    const key = String(difficulty || "").toLowerCase();
    if (key === "easy") return "difficulty-easy";
    if (key === "hard") return "difficulty-hard";
    return "difficulty-medium";
}

function renderPostCard(post) {
    const topicLabel = getTopicLabel(post.topic);
    const difficultyLabel = post.difficulty || "Medium";
    const difficultyClass = getDifficultyClass(difficultyLabel);
    const likeCount = (post.likes || []).length;
    const preview = escapeHtml(post.content || "").slice(0, 160);
    const hasCode = !!(post.code && String(post.code).trim());
    const isLiked = currentUserUid && (post.likes || []).includes(currentUserUid);

    return `
        <div class="post-card" data-post-id="${escapeHtml(post.id)}">
            <div class="post-card-header">
                <span class="post-topic">${escapeHtml(topicLabel)}</span>
                <span class="post-difficulty ${difficultyClass}">${escapeHtml(difficultyLabel)}</span>
            </div>
            <h3 class="post-title">${escapeHtml(post.title)}</h3>
            <p class="post-preview">${preview}${(post.content || "").length > 160 ? "..." : ""}</p>
            ${hasCode ? '<span class="post-code-badge">💻 Có code</span>' : ""}
            <div class="post-meta">
                <span class="post-author">👤 ${escapeHtml(post.authorName)}</span>
                <span class="post-time">${timeAgo(post.createdAt)}</span>
                <span class="post-likes">❤️ ${likeCount}</span>
                <span class="post-comments-count">💬 ${post.commentCount || 0}</span>
            </div>
            <div class="post-card-actions">
                <button class="btn-post-action btn-view-detail" data-post-id="${escapeHtml(post.id)}">Xem chi tiết</button>
                <button class="btn-post-action btn-like ${isLiked ? "btn-liked" : ""}" data-post-id="${escapeHtml(post.id)}">
                    ${isLiked ? "Đã thích" : "Thích"}
                </button>
            </div>
        </div>
    `;
}

function renderPostDetail(post, comments) {
    const topicLabel = getTopicLabel(post.topic);
    const difficultyLabel = post.difficulty || "Medium";
    const difficultyClass = getDifficultyClass(difficultyLabel);
    const likeCount = (post.likes || []).length;
    const isLiked = currentUserUid && (post.likes || []).includes(currentUserUid);
    const hasCode = !!(post.code && String(post.code).trim());

    const commentsHtml = (comments || []).map((c) => `
        <div class="comment-item">
            <div class="comment-header">
                <span class="comment-author">👤 ${escapeHtml(c.authorName)}</span>
                <span class="comment-time">${timeAgo(c.createdAt)}</span>
            </div>
            <div class="comment-body">${escapeHtml(c.content)}</div>
        </div>
    `).join("");

    detailEl.innerHTML = `
        <div class="post-detail-wrapper">
            <button class="btn-back-list" id="btnBackList">← Quay lại danh sách</button>

            <div class="post-detail-card">
                <div class="post-card-header">
                    <span class="post-topic">${escapeHtml(topicLabel)}</span>
                    <span class="post-difficulty ${difficultyClass}">${escapeHtml(difficultyLabel)}</span>
                </div>
                <h1 class="post-detail-title">${escapeHtml(post.title)}</h1>
                <div class="post-meta">
                    <span class="post-author">👤 ${escapeHtml(post.authorName)}</span>
                    <span class="post-time">${timeAgo(post.createdAt)}</span>
                    <span class="post-likes">❤️ ${likeCount}</span>
                    <button class="btn-like-detail ${isLiked ? "btn-liked" : ""}" data-post-id="${escapeHtml(post.id)}">
                        ${isLiked ? "Đã thích" : "Thích"}
                    </button>
                </div>
                <div class="post-detail-content">
                    ${escapeHtml(post.content).split("\n").map((line) => `<p>${line || "<br>"}</p>`).join("")}
                </div>
                ${hasCode ? `
                    <div class="post-code-block">
                        <pre><code>${escapeCode(post.code)}</code></pre>
                    </div>
                ` : ""}
            </div>

            <div class="comments-section">
                <h2>Bình luận (${(comments || []).length})</h2>

                <div class="comments-list">
                    ${commentsHtml || '<p class="no-comments">Chưa có bình luận nào. Hãy là người đầu tiên!</p>'}
                </div>

                <form id="commentForm" class="comment-form">
                    <div class="form-group">
                        <label for="commentContent">Viết bình luận</label>
                        <textarea id="commentContent" class="compose-textarea" rows="3"
                            placeholder="Nhập bình luận..." required maxlength="2000"></textarea>
                    </div>
                    <button type="submit" class="btn-primary">Gửi bình luận</button>
                </form>
            </div>
        </div>
    `;

    detailEl.style.display = "block";
    listEl.style.display = "none";

    document.getElementById("btnBackList")?.addEventListener("click", hideDetail);
    detailEl.querySelector(".btn-like-detail")?.addEventListener("click", () => onLike(post.id));
    detailEl.querySelector("#commentForm")?.addEventListener("submit", (e) => {
        e.preventDefault();
        onAddComment(post.id);
    });

    currentPostId = post.id;
    window.scrollTo(0, 0);
}

async function renderList() {
    const posts = await loadPosts();
    const q = (currentSearch || "").trim().toLowerCase();

    const filtered = posts.filter((p) => {
        const matchTopic = currentFilter === "all" || p.topic === currentFilter;
        const matchSearch = !q ||
            (p.title || "").toLowerCase().includes(q) ||
            (p.content || "").toLowerCase().includes(q) ||
            (p.authorName || "").toLowerCase().includes(q) ||
            (getTopicLabel(p.topic) || "").toLowerCase().includes(q);
        return matchTopic && matchSearch;
    });

    if (!filtered.length) {
        listEl.innerHTML = `<div class="community-empty">Chưa có bài viết nào. Hãy là người đầu tiên đăng bài!</div>`;
        return;
    }

    listEl.innerHTML = filtered.map(renderPostCard).join("");

    listEl.querySelectorAll(".btn-view-detail").forEach((btn) => {
        btn.addEventListener("click", () => showDetail(btn.dataset.postId));
    });

    listEl.querySelectorAll(".btn-like").forEach((btn) => {
        btn.addEventListener("click", () => onLike(btn.dataset.postId));
    });
}

async function showDetail(postId) {
    const posts = await loadPosts();
    let post = posts.find((p) => p.id === postId);
    if (!post && postId.includes("_")) {
        post = posts.find((p) => p.id === postId);
    }
    if (!post) {
        const remote = await loadPostById(postId);
        if (remote) post = remote;
    }
    if (!post) return;

    await incrementViews(postId);

    const comments = await loadComments(postId);
    const freshPosts = await loadPosts();
    const freshPost = freshPosts.find((p) => p.id === postId) || post;

    renderPostDetail(freshPost, comments);
}

async function onLike(postId) {
    if (!currentUserUid) {
        window.location.href = "login.html";
        return;
    }
    await toggleLikePost(postId, currentUserUid);

    if (currentPostId) {
        const posts = await loadPosts();
        const post = posts.find((p) => p.id === currentPostId);
        if (!post) {
            const remote = await loadPostById(currentPostId);
            if (remote) renderPostDetail(remote, await loadComments(currentPostId));
            renderList();
            return;
        }
        const comments = await loadComments(post.id);
        renderPostDetail(post, comments);
    }
    renderList();
}

async function onAddComment(postId) {
    if (!currentUserUid) {
        window.location.href = "login.html";
        return;
    }
    const contentEl = document.getElementById("commentContent");
    if (!contentEl) return;
    const content = contentEl.value.trim();
    if (!content) return;

    await addComment(postId, {
        content,
        authorId: currentUserUid,
        authorName: currentUserName || "User"
    });

    const posts = await loadPosts();
    const post = posts.find((p) => p.id === postId);
    if (post) {
        post.commentCount = (post.commentCount || 0) + 1;
        saveLocalPosts(posts);
    }

    const comments = await loadComments(postId);
    if (post) {
        renderPostDetail(post, comments);
    }
    renderList();
    window.scrollTo(0, document.body.scrollHeight);
}

function openCompose() {
    if (!currentUserUid) {
        window.location.href = "login.html";
        return;
    }
    composeModal.style.display = "flex";
    document.body.style.overflow = "hidden";
    document.getElementById("composeTitle")?.focus();
}

function closeCompose() {
    composeModal.style.display = "none";
    document.body.style.overflow = "";
    if (composeForm) composeForm.reset();
}

async function submitCompose(e) {
    if (e) e.preventDefault();
    if (!currentUserUid) {
        window.location.href = "login.html";
        return;
    }

    const titleEl = document.getElementById("composeTitle");
    const topicEl = document.getElementById("composeTopic");
    const contentEl = document.getElementById("composeContent");
    const codeEl = document.getElementById("composeCode");

    const title = (titleEl?.value || "").trim();
    const topic = topicEl?.value || "other";
    const content = (contentEl?.value || "").trim();
    const code = (codeEl?.value || "").trim();

    if (!title || !content) return;

    await createPost({
        title,
        content,
        code,
        topic,
        difficulty: "Medium",
        authorName: currentUserName || "User"
    });

    closeCompose();
    renderList();
    window.scrollTo(0, 0);
}

function hideDetail() {
    detailEl.style.display = "none";
    listEl.style.display = "block";
    currentPostId = null;
    renderList();
}

function init() {
    searchEl = document.getElementById("communitySearch");
    filterBtns = document.querySelectorAll(".community-toolbar [data-filter]");
    listEl = document.getElementById("communityList");
    detailEl = document.getElementById("communityDetail");
    composeModal = document.getElementById("composeModal");
    composeForm = document.getElementById("composeForm");
    btnCompose = document.getElementById("btnCompose");
    btnCloseCompose = document.getElementById("btnCloseCompose");
    btnCancelCompose = document.getElementById("btnCancelCompose");

    if (btnCompose) btnCompose.addEventListener("click", openCompose);
    if (btnCloseCompose) btnCloseCompose.addEventListener("click", closeCompose);
    if (btnCancelCompose) btnCancelCompose.addEventListener("click", closeCompose);

    composeModal?.querySelector(".community-modal-backdrop")?.addEventListener("click", closeCompose);

    if (searchEl) {
        searchEl.addEventListener("input", (e) => {
            currentSearch = e.target.value;
            renderList();
        });
    }

    if (filterBtns.length) {
        filterBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
                currentFilter = btn.dataset.value;
                document.querySelectorAll(".community-toolbar .filter-btn").forEach((b) => {
                    b.classList.toggle("active", b.dataset.filter === "topic" && b.dataset.value === currentFilter);
                });
                renderList();
            });
        });
    }

    onAuthStateChanged(auth, (user) => {
        currentUserUid = user ? user.uid : null;
        currentUserName = user ? (user.displayName || user.email || "User") : null;
        renderList();
        if (currentPostId) {
            loadPostById(currentPostId).then((post) => {
                if (post) {
                    loadComments(post.id).then((comments) => {
                        renderPostDetail(post, comments);
                    });
                }
            });
        }
    });

    renderList();
}

init();
