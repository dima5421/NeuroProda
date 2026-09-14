/* ==================================================
   NEUROPRODA — SCRIPT.JS
   GitHub + Cloudflare Pages + Cloudflare Worker
================================================== */


/* ==================================================
   CLOUDFLARE WORKER
================================================== */

const WORKER_URL =
    "https://neuroproda-api.samchukdmitrij2015.workers.dev";


/* ==================================================
   ЭЛЕМЕНТЫ
================================================== */

const input =
    document.getElementById("input");

const counter =
    document.getElementById("counter");

const result =
    document.getElementById("result");

const generateBtn =
    document.getElementById("generateBtn");

const clearBtn =
    document.getElementById("clearBtn");

const statusText =
    document.getElementById("statusText");

const statusDot =
    document.getElementById("statusDot");

const topics =
    document.querySelectorAll(".topic");


/* ==================================================
   СОСТОЯНИЕ
================================================== */

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

        selectedTopic =
            button.textContent.trim();

    });

});


/* ==================================================
   СЧЁТЧИК
================================================== */

input.addEventListener("input", () => {

    counter.textContent =
        input.value.length;

});


/* ==================================================
   СТАТУС ИНТЕРНЕТА
================================================== */

function updateConnectionStatus(isOnline) {

    if (isOnline) {

        statusText.textContent =
            "Online";

        statusDot.style.background =
            "#53d769";

        statusDot.style.boxShadow =
            "0 0 10px rgba(83, 215, 105, .8)";

    } else {

        statusText.textContent =
            "Offline";

        statusDot.style.background =
            "#ff5c5c";

        statusDot.style.boxShadow =
            "0 0 10px rgba(255, 92, 92, .8)";

    }

}


/* ==================================================
   OFFLINE
================================================== */

function showOfflineMessage() {

    result.className =
        "result offline";

    result.textContent =
`У автора данного сайта нет интернета, простите извините.

Можете заняться другими делами — а интернет у автора появится сегодня, либо завтра.

А если нет уже неделю, то он уехал временно в отпуск.

Попробуйте зайти немного позже.

NeuroProda временно не может продолжить текст.`;

}


/* ==================================================
   ОШИБКА
================================================== */

function showServerError(message) {

    result.className =
        "result error";

    result.textContent =
`Не удалось получить продолжение.

NeuroProda не смогла связаться с нейросетью.

Причина:
${message}

Попробуйте ещё раз немного позже.`;

}


/* ==================================================
   ПРОВЕРКА WORKER
================================================== */

function isWorkerConfigured() {

    return (
        WORKER_URL &&
        WORKER_URL.startsWith("https://") &&
        !WORKER_URL.includes("ТВОЙ-WORKER")
    );

}


/* ==================================================
   ГЕНЕРАЦИЯ ТЕКСТА
================================================== */

generateBtn.addEventListener(
    "click",
    async () => {

        /* ------------------------------
           Интернет
        ------------------------------ */

        if (!navigator.onLine) {

            showOfflineMessage();

            return;

        }


        /* ------------------------------
           Проверка Worker
        ------------------------------ */

        if (!isWorkerConfigured()) {

            result.className =
                "result error";

            result.textContent =
`NeuroProda ещё не подключена к Cloudflare Worker.

Проверь адрес Worker в script.js.`;

            return;

        }


        /* ------------------------------
           Получаем текст
        ------------------------------ */

        const text =
            input.value.trim();


        /* ------------------------------
           Пустое поле
        ------------------------------ */

        if (!text) {

            result.className =
                "result error";

            result.textContent =
                "Напишите начало текста.";

            input.focus();

            return;

        }


        /* ------------------------------
           Блокируем кнопку
        ------------------------------ */

        generateBtn.disabled = true;


        /* ------------------------------
           Загрузка
        ------------------------------ */

        result.className =
            "result loading";

        result.textContent =
            "NeuroProda придумывает продолжение...";


        try {

            /* --------------------------
               Запрос к Worker
            -------------------------- */

            const response =
                await fetch(
                    `${WORKER_URL}/api/continue`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            text:
                                text,

                            topic:
                                selectedTopic

                        })
                    }
                );


            /* --------------------------
               Получаем JSON
            -------------------------- */

            let data;

            try {

                data =
                    await response.json();

            } catch {

                throw new Error(
                    "Worker вернул некорректный ответ."
                );

            }


            /* --------------------------
               Заблокированный запрос
            -------------------------- */

            if (data?.blocked) {

                result.className =
                    "result error";

                result.textContent =
                    data.message ||
                    "Запрос заблокирован.";

                return;

            }


            /* --------------------------
               Ошибка сервера
            -------------------------- */

            if (!response.ok) {

                throw new Error(
                    data?.error ||
                    `HTTP ${response.status}`
                );

            }


            /* --------------------------
               Ответ нейросети
            -------------------------- */

            const generatedText =
                data?.text;


            if (!generatedText) {

                throw new Error(
                    "НейроПрода не получила текст от нейросети."
                );

            }


            /* --------------------------
               Показываем ответ
            -------------------------- */

            result.className =
                "result success";

            result.textContent =
                generatedText;

        }


        catch (error) {

            console.error(
                "NeuroProda error:",
                error
            );


            if (!navigator.onLine) {

                showOfflineMessage();

            } else {

                showServerError(
                    error?.message ||
                    "Неизвестная ошибка."
                );

            }

        }


        finally {

            generateBtn.disabled =
                false;

        }

    }
);


/* ==================================================
   ОЧИСТКА
================================================== */

clearBtn.addEventListener(
    "click",
    () => {

        input.value = "";

        counter.textContent =
            "0";


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

    }
);


/* ==================================================
   ИНТЕРНЕТ ПРОПАЛ
================================================== */

window.addEventListener(
    "offline",
    () => {

        updateConnectionStatus(false);

        showOfflineMessage();

    }
);


/* ==================================================
   ИНТЕРНЕТ ПОЯВИЛСЯ
================================================== */

window.addEventListener(
    "online",
    () => {

        updateConnectionStatus(true);

        result.className =
            "result";

        result.textContent =
`Интернет снова появился.

NeuroProda снова готова продолжать ваши тексты.`;

    }
);


/* ==================================================
   НАЧАЛЬНЫЙ СТАТУС
================================================== */

updateConnectionStatus(
    navigator.onLine
);


if (!navigator.onLine) {

    showOfflineMessage();

}
