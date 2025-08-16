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

// 🔹 Загрузка статей
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
      articleDiv.className =
        "bg-[#2c2c44] p-6 rounded-2xl shadow-lg flex flex-col justify-between";

      articleDiv.innerHTML = `
        ${art.image ? `<img src="${art.image}" alt="${art.title}" class="rounded-lg max-h-60 w-full object-cover mb-4"/>` : ""}
        <h2 class="text-xl font-bold text-white mb-2">${art.title}</h2>
        <p class="text-gray-400 mb-4">${art.shortText}</p>
        <button class="read-more bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded self-start"
                data-full="${encodeURIComponent(art.fullText)}"
                data-title="${encodeURIComponent(art.title)}"
                data-category="${encodeURIComponent(art.category || "Без категории")}"
        >
          Читать полностью
        </button>
      `;

      articlesContainer.appendChild(articleDiv);
    });

    // 🔹 Обработчик кнопки "Читать полностью"
    document.querySelectorAll(".read-more").forEach(btn => {
      btn.addEventListener("click", () => {
        const title = decodeURIComponent(btn.dataset.title);
        const fullText = decodeURIComponent(btn.dataset.full);
        const category = decodeURIComponent(btn.dataset.category);

        // Модальное окно
        const modal = document.createElement("div");
        modal.className =
          "fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center p-4 z-50";
        modal.innerHTML = `
          <div class="bg-[#1a1a2e] max-w-2xl w-full p-6 rounded-2xl shadow-lg overflow-y-auto max-h-[90vh]">
            <h2 class="text-2xl font-bold mb-4">${title}</h2>
            <div class="text-gray-200 leading-relaxed prose prose-invert max-w-none mb-4">
              ${fullText}
            </div>
            <p class="text-sm text-gray-400 italic mb-4">Категория: ${category}</p>
            <button class="close-modal bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">Закрыть</button>
          </div>
        `;

        document.body.appendChild(modal);

        // Закрытие
        modal.querySelector(".close-modal").addEventListener("click", () => {
          modal.remove();
        });

        modal.addEventListener("click", (e) => {
          if (e.target === modal) modal.remove();
        });
      });
    });
  } catch (err) {
    console.error("Ошибка загрузки статей:", err);
    articlesContainer.innerHTML =
      "<p class='text-red-400'>Ошибка загрузки статей. Проверь консоль.</p>";
  }
}

loadArticles();
