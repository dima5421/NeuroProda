/* ==================================================
   NEUROPRODA — SCRIPT.JS
================================================== */


const WORKER_URL =
    "https://neuroproda-api.samchukdmitrij2015.workers.dev";


/* ==================================================
   ELEMENTS
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

const reportBtn =
    document.getElementById("reportBtn");

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

let lastInputText = "";

let lastGeneratedText = "";


/* ==================================================
   TOPICS
================================================== */

topics.forEach((button) => {

    button.addEventListener(
        "click",
        () => {

            topics.forEach((item) => {

                item.classList.remove(
                    "active"
                );

            });


            button.classList.add(
                "active"
            );


            selectedTopic =
                button.textContent.trim();

        }
    );

});


/* ==================================================
   COUNTER
================================================== */

if (input && counter) {

    input.addEventListener(
        "input",
        () => {

            counter.textContent =
                input.value.length;

        }
    );

}


/* ==================================================
   CONNECTION STATUS
================================================== */

function updateConnectionStatus(
    isOnline
) {

    if (
        !statusText ||
        !statusDot
    ) {
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
   SHOW ERROR
================================================== */

function showError(
    message
) {

    result.className =
        "result error";

    result.textContent =
`Не удалось получить продолжение.

${message || "Произошла неизвестная ошибка."}`;

}


/* ==================================================
   OFFLINE
================================================== */

function showOffline() {

    result.className =
        "result offline";

    result.textContent =
`У автора данного сайта нет интернета, простите извините.

Попробуйте зайти немного позже.

NeuroProda временно не может продолжить текст.`;

}


/* ==================================================
   HIDE REPORT
================================================== */

function hideReportButton() {

    if (!reportBtn) {
        return;
    }

    reportBtn.classList.remove(
        "visible"
    );

}


/* ==================================================
   SHOW REPORT
================================================== */

function showReportButton() {

    if (!reportBtn) {
        return;
    }

    reportBtn.classList.add(
        "visible"
    );

}


/* ==================================================
   GENERATE
================================================== */

if (generateBtn) {

    generateBtn.addEventListener(
        "click",
        async () => {

            hideReportButton();


            if (!navigator.onLine) {

                showOffline();

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


            lastInputText =
                text;


            generateBtn.disabled =
                true;


            result.className =
                "result loading";

            result.textContent =
                "NeuroProda проверяет запрос и придумывает продолжение...";


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

                            body:
                                JSON.stringify({

                                    text,

                                    topic:
                                        selectedTopic

                                })
                        }
                    );


                const raw =
                    await response.text();


                let data = null;


                if (raw.trim()) {

                    try {

                        data =
                            JSON.parse(raw);

                    } catch {

                        throw new Error(
                            raw
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
                        "Запрос не прошёл проверку безопасности.";

                    return;

                }


                if (!data?.text) {

                    throw new Error(
                        "Нейросеть не вернула текст."
                    );

                }


                lastGeneratedText =
                    data.text;


                result.className =
                    "result success";

                result.textContent =
                    lastGeneratedText;


                showReportButton();

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
   REPORT
================================================== */

if (reportBtn) {

    reportBtn.addEventListener(
        "click",
        async () => {

            if (
                !lastInputText ||
                !lastGeneratedText
            ) {

                return;

            }


            const confirmed =
                window.confirm(
                    "Отправить жалобу на это продолжение?"
                );


            if (!confirmed) {
                return;
            }


            reportBtn.disabled =
                true;

            reportBtn.textContent =
                "Отправка...";


            try {

                const response =
                    await fetch(
                        `${WORKER_URL}/api/report`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    phrase:
                                        lastInputText,

                                    continuation:
                                        lastGeneratedText,

                                    topic:
                                        selectedTopic,

                                    page:
                                        location.href,

                                    userAgent:
                                        navigator.userAgent,

                                    timestamp:
                                        new Date()
                                            .toISOString()

                                })
                        }
                    );


                const raw =
                    await response.text();


                let data = null;


                if (raw.trim()) {

                    try {

                        data =
                            JSON.parse(raw);

                    } catch {

                        throw new Error(
                            "Некорректный ответ Worker."
                        );

                    }

                }


                if (!response.ok) {

                    throw new Error(
                        data?.error ||
                        `HTTP ${response.status}`
                    );

                }


                alert(
                    "Жалоба отправлена. Спасибо за помощь!"
                );


                reportBtn.textContent =
                    "Жалоба отправлена";

            }


            catch (error) {

                console.error(
                    "Report error:",
                    error
                );


                alert(
                    "Не удалось отправить жалобу. Попробуйте позже."
                );


                reportBtn.disabled =
                    false;

                reportBtn.textContent =
                    "Это оскорбительно";

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


            lastInputText =
                "";

            lastGeneratedText =
                "";


            hideReportButton();


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
   NETWORK
================================================== */

window.addEventListener(
    "offline",
    () => {

        updateConnectionStatus(
            false
        );

    }
);


window.addEventListener(
    "online",
    () => {

        updateConnectionStatus(
            true
        );

    }
);


/* ==================================================
   START
================================================== */

updateConnectionStatus(
    navigator.onLine
);
