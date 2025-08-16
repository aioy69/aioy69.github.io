import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, query, onSnapshot, orderBy } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBn1F1ktpoTdp3J4eSW2rym1jKh4roelMM",
  authDomain: "admin-mir.firebaseapp.com",
  projectId: "admin-mir",
  storageBucket: "admin-mir.firebasestorage.app",
  messagingSenderId: "579733301892",
  appId: "1:579733301892:web:ff2236f12cc5a00dd7f0d1",
  measurementId: "G-70BTKEQ4B6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const articlesContainer = document.getElementById('articles-container');
const loadingMessage = document.getElementById('loading-message');
const searchInput = document.getElementById('search-input');
const filterBtns = document.querySelectorAll('.filter-btn');

let allArticles = [];
let currentCategory = "all";
let searchQuery = "";

function renderArticles() {
    articlesContainer.innerHTML = '';
    let filtered = allArticles.filter(a => {
        let matchCategory = (currentCategory === "all" || a.category === currentCategory);
        let matchSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchSearch;
    });
    if (filtered.length === 0) {
        articlesContainer.innerHTML = '<p class="col-span-3 text-center text-gray-400">Нет статей по запросу.</p>';
        return;
    }
    filtered.forEach(article => {
        articlesContainer.appendChild(createCard(article));
    });
}

function createCard(article) {
    const card = document.createElement('div');
    card.className = "bg-[#2c2c44] rounded-xl shadow-2xl overflow-hidden hover:scale-105 transition-transform duration-300";

    const img = document.createElement('img');
    img.src = article.image || 'images/default.jpg';
    img.alt = `Статья: ${article.title}`;
    img.className = "w-full h-48 object-cover";

    const textContainer = document.createElement('div');
    textContainer.className = "p-6";

    const category = document.createElement('span');
    category.className = "inline-block bg-purple-600 text-xs px-2 py-1 rounded-full mb-2";
    category.textContent = article.category || "Без категории";

    const title = document.createElement('h2');
    title.className = "text-2xl font-bold text-white mb-2";
    title.textContent = article.title;

    const shortText = document.createElement('p');
    shortText.className = "text-gray-400 text-sm mb-4";
    shortText.textContent = article.shortText;

    const button = document.createElement('button');
    button.className = "expand-btn w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 rounded-lg";
    button.textContent = "Читать далее";

    const hiddenContent = document.createElement('div');
    hiddenContent.className = "hidden mt-4 text-gray-300 max-w-3xl leading-relaxed";
    hiddenContent.innerHTML = (article.fullText || "").split("\n").map(p => `<p class='mb-4'>${p}</p>`).join("");

    textContainer.appendChild(category);
    textContainer.appendChild(title);
    textContainer.appendChild(shortText);
    textContainer.appendChild(button);
    textContainer.appendChild(hiddenContent);

    card.appendChild(img);
    card.appendChild(textContainer);

    button.addEventListener('click', () => {
        hiddenContent.classList.toggle('hidden');
        button.textContent = hiddenContent.classList.contains('hidden') ? 'Читать далее' : 'Свернуть';
    });

    return card;
}

function loadArticles() {
    const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
    onSnapshot(q, (snapshot) => {
        if (loadingMessage) loadingMessage.style.display = 'none';
        allArticles = [];
        snapshot.forEach((doc) => {
            allArticles.push(doc.data());
        });
        renderArticles();
    }, (error) => {
        articlesContainer.innerHTML = '<p class="col-span-3 text-center text-red-400">Ошибка загрузки статей.</p>';
    });
}

document.addEventListener('DOMContentLoaded', loadArticles);

// Обработчики поиска и фильтров
searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderArticles();
});

filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        currentCategory = btn.dataset.category;
        renderArticles();
    });
});
