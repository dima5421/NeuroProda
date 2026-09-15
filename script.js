/* ==================================================
   NEUROPRODA — SCRIPT.JS
================================================== */

const WORKER_URL =
    "https://neuroproda-api.samchukdmitrij2015.workers.dev";


/* ==================================================
   ELEMENTS
================================================== */

const input = document.getElementById("input");
const counter = document.getElementById("counter");
const result = document.getElementById("result");

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
   STATE
================================================== */

let selectedTopic = "Без темы";


/* ==================================================
   TOPICS
================================================== */

topics.forEach((button) => {

    button.addEventListener("click", () => {

        topics.forEach((item) => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        selectedTopic =
            button.textContent.trim();

    });

});


/* ==================================================
   COUNTER
================================================== */

if (input && counter) {

    input.addEventListener("input", () => {

        counter.textContent =
            input.value.length;

    });

}


/* ==================================================
   CONNECTION STATUS
================================================== */

function updateConnectionStatus(isOnline) {

    if (!statusText || !statusDot) {
        return;
    }

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

Попробуйте зайти немного позже.

NeuroProda временно не может продолжить текст.`;

}


/* ==================================================
   ERROR
================================================== */

function showError(message) {

    result.className =
        "result error";

    result.textContent =
`Не удалось получить продолжение.

Причина:
${message || "Неизвестная ошибка."}`;

}


/* ==================================================
   GENERATE
================================================== */

if (generateBtn) {

    generateBtn.addEventListener(
        "click",
        async () => {

            if (!navigator.onLine) {

                showOfflineMessage();

                return;

            }


            const text =
                input.value.trim();


            if (!text) {

                result.className =
                    "result error";

                result.textContent =
                    "Напишите начало текста.";

                input.focus();

                return;

            }


            generateBtn.disabled =
                true;

            result.className =
                "result loading";

            result.textContent =
                "NeuroProda придумывает продолжение...";


            try {

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
                                text,
                                topic:
                                    selectedTopic
                            })
                        }
                    );


                const rawText =
                    await response.text();


                let data = null;


                if (rawText.trim()) {

                    try {

                        data =
                            JSON.parse(rawText);

                    } catch {

                        throw new Error(
                            rawText
                        );

                    }

                }


                if (!response.ok) {

                    throw new Error(
                        data?.error ||
                        data?.message ||
                        `HTTP ${response.status}`
                    );

                }


                if (data?.blocked) {

                    result.className =
                        "result error";

                    result.textContent =
                        data.message ||
                        "Запрос заблокирован.";

                    return;

                }


                if (!data?.text) {

                    throw new Error(
                        "Worker не вернул текст."
                    );

                }


                result.className =
                    "result success";

                result.textContent =
                    data.text;

            }


            catch (error) {

                console.error(
                    "NeuroProda error:",
                    error
                );

                showError(
                    error?.message
                );

            }


            finally {

                generateBtn.disabled =
                    false;

            }

        }
    );

}


/* ==================================================
   CLEAR
================================================== */

if (clearBtn) {

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

}


/* ==================================================
   INTERNET EVENTS
================================================== */

window.addEventListener(
    "offline",
    () => {

        updateConnectionStatus(false);

    }
);


window.addEventListener(
    "online",
    () => {

        updateConnectionStatus(true);

    }
);


/* ==================================================
   START
================================================== */

updateConnectionStatus(
    navigator.onLine
);
