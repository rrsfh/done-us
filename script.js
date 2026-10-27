document.addEventListener('DOMContentLoaded', () => {
    // ---- Settings ----
    const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbyAymX3GoGMfXvDF19Sn4M0aUAwRAfxiQjqp9_Ko_ekJ-SrobYLSbxwpyya6Q1mSQLvOw/exec';
    const FINISHED_DELAY_MS = 0; // the code only appears once the server has saved it, so no wait is needed
 
    const REQUIRED_PARAMS = ['bpid', 'bnum'];
    const OPTIONAL_PARAMS = ['battempt', 'bkey', 'tc', 'tg'];
 
    // ---- DOM elements (looked up once) ----
    const codeEl = document.getElementById('completionCode');
    const messageEl = document.getElementById('completionCodeMessage');
    const finishedEl = document.getElementById('finishedMessage');
 
    // ---- Helpers ----
    function getParams() {
        const names = [...REQUIRED_PARAMS, ...OPTIONAL_PARAMS];
        const urlParams = new URLSearchParams(window.location.search);
        const hasUrlParams = names.some(name => urlParams.has(name));

        let stored = {};
        try { stored = JSON.parse(sessionStorage.getItem('params')) || {}; } catch (e) {}

        const params = {};
        names.forEach(name => {
            const raw = hasUrlParams ? urlParams.get(name) : stored[name];
            params[name] = (raw || '').trim();
        });

        if (hasUrlParams) {
            try { sessionStorage.setItem('params', JSON.stringify(params)); } catch (e) {}
            history.replaceState(null, '', window.location.pathname); // clean the address bar
        }
        return params;
    }
 
    function showError() {
        codeEl.textContent = 'Cannot generate';
        codeEl.classList.remove('loading');
        codeEl.classList.add('error');
        messageEl.hidden = true;
        finishedEl.hidden = true;
    }
 
    function showCode(code) {
        codeEl.textContent = code;
        codeEl.classList.remove('loading', 'error');
        messageEl.hidden = false;
        setTimeout(() => { finishedEl.hidden = false; }, FINISHED_DELAY_MS);
    }
 
    // Sends the data to Google Sheets; the server calculates and returns the completion code
    function submitToSheet(data) {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => formData.append(key, value));
 
        return fetch(GOOGLE_SHEET_URL, { method: 'POST', body: formData })
            .then(response => response.json());
    }
 
    // ---- Main flow ----
    const params = getParams();
 
    // Quick check so obviously bad links never hit the server
    if (!params.bpid || !/^\d+$/.test(params.bnum)) {
        showError();
        return;
    }
 
    codeEl.classList.add('loading');
 
    submitToSheet({
        ...params,                                                  // bpid, bnum, battempt, bkey, tc, tg
        timestampUTC: new Date().toISOString(),                     // e.g. 2026-10-27T14:32:05.123Z
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // e.g. Europe/London
        utcOffsetMinutes: new Date().getTimezoneOffset()            // minutes behind UTC (BST = -60)
    })
    .then(result => {
        console.log('Server response', result);
        if (result.completionCode) {
            showCode(result.completionCode); // 'success' or 'duplicate' (repeat visit)
        } else {
            showError();
        }
    })
    .catch(error => {
        console.error('Error submitting the form', error);
        showError();
    });
});