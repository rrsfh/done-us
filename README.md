# done-us

## Completion Code Page
Final page of the study. It reads the participant's URL parameters, sends them to a Google Sheet, and displays a completion code for payment. 

## How it works
1. The participant arrives with parameters in the URL.
2. The page sends them to a Google Apps Script, which saves a row in the sheet.
3. The script calculates the completion code (using a secret multiplier kept in Script Properties) and returns it.
4. The page shows the code. A repeat visit with the same `bpid` shows the original code and adds no new row.

If `bpid` or `bnum` is missing or invalid, the page shows **Cannot generate** in red and nothing is saved.

## URL parameters
`bpid` | Required (Yes) | Purpose (Participant's unique ID)

`bnum` | Required (Yes) | Purpose (Used to calculate the completion code: `bnum` * `besample_researcher_id`)

`battempt`, `bkey`, `tc`, `tg` | Required (No) | Purpose (Saved if present)

Example: https://your-site/?bpid=ABC123&nbum=2&battempt=1&bkey=xdawd82d&tc=982&tg=f

## Setup
1. **Sheet headers** (row 1 of Sheet1, spelled exactly): `timestamp` | `bpid` | `bnum` | `completionCode` | `battempt` | `bkey` | `tc` | `tg` | `timestampUTC` | `timezone` | `utcOffsetMinutes`
2. **Apps Script**: paste in google-apps-script.txt, run initialSetup once, and add a Script Property named `multiplier` (your besample researcher code).
3. **Deploy** it as a web app (Deploy -> Manage deployments -> New version after any change), then paste the web app URL into GOOGLE_SHEET_URL in script.js.
4. **Host** `index.html`, `styles.css`, and `script.js` on GitHub Pages.


## Notes
* Never put the multiplier in the website files. The repo is public.
* `timestamp` is set by the server; `timestampUTC`, `timezone`, and `utcOffsetMinutes` come from the participant's device.


## Credits
Developed with assistance from Claude (Anthropic), October 2026. Reviewed and tested by Richardt Hansen
