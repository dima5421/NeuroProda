/* ==================================================
   NEUROPRODA — SCRIPT.JS
================================================== */


/* ==================================================
   WORKER
================================================== */

const WORKER_URL =
    "https://neuroproda-api.samchukdmitrij2015.workers.dev";


/* ==================================================
   ELEMENTS
================================================== */

const splashScreen =
    document.getElementById(
        "splashScreen"
    );

const splashAnimation =
    document.querySelector(
        ".splash-animation"
    );

const splashLoader =
    document.getElementById(
        "splashLoader"
    );

const splashProgress =
    document.getElementById(
        "splashProgress"
    );


const safetyModal =
    document.getElementById(
        "safetyModal"
    );

const closeSafetyBtn =
    document.getElementById(
        "closeSafetyBtn"
    );


const input =
    document.getElementById(
        "input"
    );

const counter =
    document.getElementById(
        "counter"
    );

const result =
    document.getElementById(
        "result"
    );

const generateBtn =
    document.getElementById(
        "generateBtn"
    );

const clearBtn =
    document.getElementById(
        "clearBtn"
    );

const reportBtn =
    document.getElementById(
        "reportBtn"
    );

const statusText =
    document.getElementById(
        "statusText"
    );

const statusDot =
    document.getElementById(
        "statusDot"
    );

const topics =
    document.querySelectorAll(
        ".topic"
    );


/* ==================================================
   STATE
================================================== */

let selectedTopic =
    "Без темы";

let lastInputText =
    "";

let lastGeneratedText =
    "";


/* ==================================================
   SPLASH SCREEN
================================================== */

function startSplash() {

    if (
        !splashScreen ||
        !splashAnimation ||
        !splashLoader ||
        !splashProgress
    ) {
        return;
    }


    /*
      0–0.85 сек:
      большой N по центру
    */

    setTimeout(() => {

        splashAnimation.classList.add(
            "stage-two"
        );

    }, 850);


    /*
      1.45 сек:
      появляется загрузка
    */

    setTimeout(() => {

        splashLoader.classList.add(
            "visible"
        );


        splashProgress.style.transition =
            "width 1.7s cubic-bezier(0.22, 1, 0.36, 1)";


        splashProgress.style.width =
            "100%";

    }, 1450);


    /*
      После окончания анимации
      убираем заставку
    */

    window.addEventListener(
        "load",
        () => {

            setTimeout(() => {

                splashScreen.classList.add(
                    "hidden"
                );

            }, 3350);

        }
    );

}


startSplash();


/* ==================================================
   SAFETY WARNING
================================================== */

function startSafetyTimer() {

    if (
        !safetyModal ||
        !closeSafetyBtn
    ) {
        return;
    }


    let seconds = 5;


    const timer =
        setInterval(() => {

            seconds--;


            if (seconds > 0) {

                closeSafetyBtn.textContent =
                    `Закрыть через ${seconds}`;

                return;

            }


            clearInterval(
                timer
            );


            closeSafetyBtn.disabled =
                false;

            closeSafetyBtn.textContent =
                "Понятно, закрыть";

        }, 1000);

}


startSafetyTimer();


if (
    safetyModal &&
    closeSafetyBtn
) {

    closeSafetyBtn.addEventListener(
        "click",
        () => {

            safetyModal.classList.add(
                "hidden"
            );


            safetyModal.setAttribute(
                "aria-hidden",
                "true"
            );

        }
    );

}


/* ==================================================
   TOPICS
================================================== */

topics.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                topics.forEach(
                    (item) => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                selectedTopic =
                    button.textContent.trim();

            }
        );

    }
);


/* ==================================================
   COUNTER
================================================== */

if (
    input &&
    counter
) {

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


updateConnectionStatus(
    navigator.onLine
);


window.addEventListener(
    "online",
    () => {

        updateConnectionStatus(
            true
        );

    }
);


window.addEventListener(
    "offline",
    () => {

        updateConnectionStatus(
            false
        );

    }
);


/* ==================================================
   ERROR
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
   REPORT BUTTON
================================================== */

function hideReportButton() {

    if (!reportBtn) {
        return;
    }


    reportBtn.classList.remove(
        "visible"
    );

}


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


            if (
                !navigator.onLine
            ) {

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

                            body:
                                JSON.stringify({

                                    text:

                                        text,

                                    topic:

                                        selectedTopic

                                })
                        }
                    );


                const raw =
                    await response.text();


                let data =
                    null;


                if (
                    raw.trim()
                ) {

                    try {

                        data =
                            JSON.parse(
                                raw
                            );

                    } catch {

                        throw new Error(
                            raw
                        );

                    }

                }


                /*
                  СНАЧАЛА обработка
                  блокировки, потому что Worker
                  может вернуть blocked + 400.
                */

                if (
                    data?.blocked
                ) {

                    result.className =
                        "result error";

                    result.textContent =
                        data.message ||
                        "NeuroProda не принимает этот запрос.";

                    return;

                }


                /*
                  Настоящие ошибки API.
                */

                if (
                    !response.ok
                ) {

                    throw new Error(

                        data?.error ||

                        data?.details ||

                        data?.message ||

                        `HTTP ${response.status}`

                    );

                }


                if (
                    !data?.text
                ) {

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
   CLEAR
================================================== */

if (clearBtn) {

    clearBtn.addEventListener(
        "click",
        () => {

            input.value =
                "";

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
   REPORT / ALARM BUTTON
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
                    "Отправить сигнал тревоги на это продолжение?"
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

                                    timestamp:
                                        new Date()
                                            .toISOString()

                                })
                        }
                    );


                const raw =
                    await response.text();


                let data =
                    null;


                if (
                    raw.trim()
                ) {

                    try {

                        data =
                            JSON.parse(
                                raw
                            );

                    } catch {

                        throw new Error(
                            "Некорректный ответ Worker."
                        );

                    }

                }


                if (
                    !response.ok
                ) {

                    throw new Error(

                        data?.error ||

                        `HTTP ${response.status}`

                    );

                }


                alert(
                    "🚨 Сигнал отправлен. Спасибо за помощь!"
                );


                reportBtn.textContent =
                    "Сигнал отправлен";


            }


            catch (error) {

                console.error(
                    "Report error:",
                    error
                );


                alert(
                    "Не удалось отправить сигнал. Попробуйте позже."
                );


                reportBtn.disabled =
                    false;

                reportBtn.textContent =
                    "Это оскорбительно";

            }

        }
    );

}
