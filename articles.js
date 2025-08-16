import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// 🔹 Конфиг Firebase
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

// 🔹 Контейнер для статей
const articlesContainer = document.getElementById("articles-container");

// 🔹 Загружаем статьи
async function loadArticles() {
  articlesContainer.innerHTML = "<p class='text-gray-400'>Загрузка статей...</p>";

  try {
    const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      articlesContainer.innerHTML = "<p class='text-gray-400'>Пока нет статей.</p>";
      return;
    }

    articlesContainer.innerHTML = "";

    snapshot.forEach(doc => {
      const art = doc.data();

      const articleDiv = document.createElement("article");
      articleDiv.className = "bg-[#2c2c44] p-6 rounded-2xl shadow-lg space-y-4";

      articleDiv.innerHTML = `
        <h2 class="text-2xl font-bold text-white">${art.title}</h2>
        <p class="text-gray-400">${art.shortText}</p>
        ${art.image ? `<img src="${art.image}" alt="${art.title}" class="rounded-lg max-h-80 w-full object-cover"/>` : ""}
        <div class="text-gray-200 leading-relaxed prose prose-invert max-w-none">
          ${art.fullText}
        </div>
        <p class="text-sm text-gray-400 italic">Категория: ${art.category || "Без категории"}</p>
      `;

      articlesContainer.appendChild(articleDiv);
    });
  } catch (err) {
    console.error("Ошибка загрузки статей:", err);
    articlesContainer.innerHTML = "<p class='text-red-400'>Ошибка загрузки статей. Проверь консоль.</p>";
  }
}

loadArticles();
