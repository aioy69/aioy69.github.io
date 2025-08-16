// Импорт необходимых модулей Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, query, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth, signInWithCustomToken, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Глобальные переменные, предоставленные средой Canvas
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Переменные для инициализации Firebase
let db;
let auth;

// DOM-элементы
const articlesContainer = document.getElementById('articles-container');
const loadingMessage = document.getElementById('loading-message');

// Функция для генерации карточки статьи
function createCard(article) {
    const card = document.createElement('div');
    card.className = "bg-[#2c2c44] rounded-xl shadow-2xl overflow-hidden transition-transform transform hover:scale-105 duration-300";

    const img = document.createElement('img');
    img.src = article.image;
    img.alt = `Изображение для статьи: ${article.title}`;
    img.className = "w-full h-48 object-cover";

    const textContainer = document.createElement('div');
    textContainer.className = "p-6";

    const title = document.createElement('h2');
    title.className = "text-2xl font-bold text-white mb-2";
    title.textContent = article.title;

    const shortText = document.createElement('p');
    shortText.className = "text-gray-400 text-sm mb-4";
    shortText.textContent = article.shortText;

    const button = document.createElement('button');
    button.className = "expand-btn w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transition duration-300 ease-in-out";
    button.textContent = "Читать далее";

    const hiddenContent = document.createElement('div');
    hiddenContent.className = "hidden-content mt-4 hidden text-gray-300";
    const fullText = document.createElement('p');
    fullText.textContent = article.fullText;
    hiddenContent.appendChild(fullText);

    textContainer.appendChild(title);
    textContainer.appendChild(shortText);
    textContainer.appendChild(button);
    textContainer.appendChild(hiddenContent);

    card.appendChild(img);
    card.appendChild(textContainer);

    button.addEventListener('click', () => {
        hiddenContent.classList.toggle('hidden');
        if (hiddenContent.classList.contains('hidden')) {
            button.textContent = 'Читать далее';
        } else {
            button.textContent = 'Свернуть';
        }
    });

    return card;
}

// Инициализация Firebase и загрузка статей
async function initFirebaseAndLoadArticles() {
    if (!firebaseConfig) {
        articlesContainer.innerHTML = '<p class="text-red-400">Ошибка: Конфигурация Firebase не найдена.</p>';
        return;
    }

    try {
        // Инициализация Firebase
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);

        // Аутентификация пользователя
        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
            await signInAnonymously(auth);
        }

        // Путь к коллекции статей
        const articlesCollectionPath = `/artifacts/${appId}/public/data/articles`;
        const q = query(collection(db, articlesCollectionPath));

        // onSnapshot будет слушать изменения в коллекции в реальном времени
        onSnapshot(q, (snapshot) => {
            if (loadingMessage) {
                loadingMessage.style.display = 'none';
            }
            // Очищаем текущий контент, чтобы избежать дублирования
            articlesContainer.innerHTML = ''; 

            if (snapshot.empty) {
                articlesContainer.innerHTML = '<p class="col-span-1 md:col-span-2 lg:col-span-3 text-center text-gray-400">Пока нет статей. Добавьте первую на странице админ-панели!</p>';
                return;
            }

            // Генерируем карточки для каждой статьи
            snapshot.forEach((doc) => {
                const articleData = doc.data();
                const card = createCard(articleData);
                articlesContainer.appendChild(card);
            });
        }, (error) => {
            console.error("Error fetching articles: ", error);
            articlesContainer.innerHTML = '<p class="col-span-1 md:col-span-2 lg:col-span-3 text-red-400">Ошибка при загрузке статей.</p>';
        });

    } catch (e) {
        console.error("Error during Firebase initialization or sign-in: ", e);
        articlesContainer.innerHTML = '<p class="col-span-1 md:col-span-2 lg:col-span-3 text-red-400">Ошибка инициализации. Пожалуйста, попробуйте позже.</p>';
    }
}

document.addEventListener('DOMContentLoaded', initFirebaseAndLoadArticles);
