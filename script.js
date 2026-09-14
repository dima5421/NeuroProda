/* ==================================================
   NEUROPRODA — SCRIPT.JS
   Версия с настоящей генерацией через server.js
================================================== */

const input = document.getElementById("input");
const counter = document.getElementById("counter");
const result = document.getElementById("result");

const generateBtn = document.getElementById("generateBtn");
const clearBtn = document.getElementById("clearBtn");

const statusText = document.getElementById("statusText");
const statusDot = document.getElementById("statusDot");

const topics = document.querySelectorAll(".topic");

let selectedTopic = "Без темы";


/* ==================================================
   ВЫБОР ТЕМЫ
================================================== */

topics.forEach(button => {

    button.addEventListener("click", () => {

        topics.forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        selectedTopic = button.textContent.trim();

    });

});


/* ==================================================
   СЧЁТЧИК
================================================== */

input.addEventListener("input", () => {

    counter.textContent = input.value.length;

});


/* ==================================================
   СТАТУС ИНТЕРНЕТА
================================================== */

function updateConnectionStatus(isOnline) {

    if (isOnline) {

        statusText.textContent = "Online";

        statusDot.style.background = "#53d769";

        statusDot.style.boxShadow =
            "0 0 10px rgba(83, 215, 105, .8)";

    } else {

        statusText.textContent = "Offline";

        statusDot.style.background = "#ff5c5c";

        statusDot.style.boxShadow =
            "0 0 10px rgba(255, 92, 92, .8)";

    }

}


/* ==================================================
   OFFLINE-СООБЩЕНИЕ
================================================== */

function showOfflineMessage() {

    result.className = "result offline";

    result.textContent =
`У автора данного сайта нет интернета, простите извините.

Можете заняться другими делами — а интернет у автора появится сегодня, либо завтра.

А если нет уже неделю, то он уехал временно в отпуск.

Попробуйте зайти немного позже.

NeuroProda временно не может продолжить текст.`;

}


/* ==================================================
   КНОПКА "ПРОДОЛЖИТЬ"
================================================== */

generateBtn.addEventListener("click", async () => {

    const text = input.value.trim();


    /* Нет интернета */

    if (!navigator.onLine) {

        showOfflineMessage();

        return;

    }


    /* Пустое поле */

    if (!text) {

        result.className = "result error";

        result.textContent =
            "Напишите начало текста.";

        return;

    }


    /* Блокируем кнопку */

    generateBtn.disabled = true;


    /* Показываем загрузку */

    result.className = "result loading";

    result.textContent =
        "NeuroProda придумывает продолжение...";


    try {

        /* Отправляем запрос серверу */

        const response = await fetch(
            "/api/continue",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    text: text,

                    topic: selectedTopic

                })

            }
        );


        /* Получаем ответ */

        const data = await response.json();


        /* Проверяем блокировку */

        if (data.blocked) {

            result.className = "result error";

            result.textContent =
                data.message;

            return;

        }


        /* Проверяем обычную ошибку */

        if (!response.ok) {

            throw new Error(
                data.error ||
                "Сервер вернул ошибку."
            );

        }


        /* Получаем текст */

        result.className =
            "result success";

        result.textContent =
            data.text ||
            "НейроПрода не получила текст от нейросети.";

    }


    catch (error) {

        console.error(error);


        result.className =
            "result error";


        result.textContent =
`Не удалось связаться с NeuroProda.

Возможные причины:

• сервер ещё не запущен;
• отсутствует интернет;
• API-ключ неправильный;
• закончились средства/лимит API;
• произошла временная ошибка сервера.

Ошибка:
${error.message}`;

    }


    finally {

        generateBtn.disabled = false;

    }

});


/* ==================================================
   КНОПКА "ОЧИСТИТЬ"
================================================== */

clearBtn.addEventListener("click", () => {

    input.value = "";

    counter.textContent = "0";


    result.className =
        "result";


    result.innerHTML = `

        <div class="empty-result">

            <div class="empty-icon">
                ✦
            </div>

            <div class="empty-title">
                Nothing here yet
            </div>

            <div class="empty-text">
                Write the beginning of a text
                and press “Continue”.
            </div>

        </div>

    `;

    input.focus();

});


/* ==================================================
   ИНТЕРНЕТ ПРОПАЛ
================================================== */

window.addEventListener("offline", () => {

    updateConnectionStatus(false);

    showOfflineMessage();

});


/* ==================================================
   ИНТЕРНЕТ ПОЯВИЛСЯ
================================================== */

window.addEventListener("online", () => {

    updateConnectionStatus(true);

    result.className = "result";

    result.textContent =
`Интернет снова появился.

NeuroProda снова готова продолжать ваши тексты.`;

});


/* ==================================================
   ЗАПУСК
================================================== */

updateConnectionStatus(
    navigator.onLine
);


if (!navigator.onLine) {

    showOfflineMessage();

}