# Codex Handoff: World Cup 2026 LINE Bot

ไฟล์นี้ทำไว้สำหรับย้ายเครื่องหรือให้ Codex ตัวใหม่รับงานต่อได้ทันที โดยไม่ต้องไล่ประวัติแชตเดิมทั้งหมด

## Repo

- GitHub: https://github.com/thawatchai28063/worldcup-2026-line-bot
- Main branch: `main`
- โปรเจกต์เป็น LINE bot สำหรับกลุ่ม LINE ดูโปรแกรมแข่ง ตารางคะแนน และผลบอล FIFA World Cup 2026

## โครงสร้างไฟล์

- `Code.gs` - LINE webhook, command routing, reply/push, config, logging
- `FootballApi.gs` - football-data.org integration, mock/live mode, sync matches/standings
- `SheetService.gs` - Google Sheets settings/cache/logs
- `FlexMessages.gs` - LINE Flex Message builders
- `MockData.gs` - mock data fallback
- `Triggers.gs` - scheduled sync and daily summary triggers
- `appsscript.json` - Apps Script manifest
- `.claspignore` - files uploaded by clasp
- `.clasp.json.example` - template for local `.clasp.json`
- `cloudflare-worker/worker.js` - Cloudflare Worker proxy to avoid Apps Script 302 webhook issue
- `assets/rich-menu.png` - old rich menu image, currently not required

## Live Project IDs

These are not API secrets, but keep them reasonably private.

- Apps Script script ID: `1W6z7oRgPBr_f9jAtpY2RFKYn5VnfDzyLhIg-qMZU7vgKrYbbBihkEK5S`
- Apps Script web app URL:
  `https://script.google.com/macros/s/AKfycbzL01fl3Ap-AgKBDFc6zxYmG_DVndrfULgj7rY3ONm2E6WyFc8tZ3m1tzMpVLFcytQA/exec`
- Cloudflare Worker webhook URL:
  `https://worldcup-2026-line-bot.thawatchaijanthakit1.workers.dev/`
- Google Sheet:
  `https://docs.google.com/spreadsheets/d/1kpGxnOGHpu6KEbe7rc4zDtiBHGXy2Hm7mgwiq9FHv-c/edit?gid=0#gid=0`
- Script property:
  - `SPREADSHEET_ID=1kpGxnOGHpu6KEbe7rc4zDtiBHGXy2Hm7mgwiq9FHv-c`

## Secrets

Do not commit secrets to Git.

Secrets live in Google Sheet tab `settings`:

- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_CHANNEL_SECRET`
- `FOOTBALL_DATA_API_KEY`
- `LINE_PUSH_TARGET_ID`
- `BASE_DASHBOARD_URL`
- `USE_MOCK_DATA`
- `TIMEZONE`

For live football-data.org data, set:

- `USE_MOCK_DATA` empty or `false`
- `TIMEZONE` `Asia/Bangkok`

## Fresh Machine Setup

1. Clone repo:

   ```powershell
   git clone https://github.com/thawatchai28063/worldcup-2026-line-bot.git
   cd worldcup-2026-line-bot
   ```

2. Install or use `clasp`:

   ```powershell
   npm install -g @google/clasp
   clasp login
   ```

   If global install is not wanted:

   ```powershell
   npx @google/clasp login
   ```

3. Create local `.clasp.json` from example:

   ```json
   {
     "scriptId": "1W6z7oRgPBr_f9jAtpY2RFKYn5VnfDzyLhIg-qMZU7vgKrYbbBihkEK5S",
     "rootDir": "."
   }
   ```

4. Push Apps Script files:

   ```powershell
   npx @google/clasp push -f
   ```

5. Deploy over the existing web app deployment:

   ```powershell
   npx @google/clasp deploy --deploymentId AKfycbzL01fl3Ap-AgKBDFc6zxYmG_DVndrfULgj7rY3ONm2E6WyFc8tZ3m1tzMpVLFcytQA --description "Update bot"
   ```

## Cloudflare Worker

LINE webhook should point to Cloudflare Worker, not Apps Script directly.

Reason: Apps Script web app may respond with `302 Found`, which LINE webhook verify rejects. Worker follows the redirect and returns a clean 200 response.

Worker source:

- `cloudflare-worker/worker.js`

Deploy from Cloudflare dashboard or Wrangler. If using Wrangler, create a normal Cloudflare Worker project and replace the worker code with `cloudflare-worker/worker.js`.

Webhook URL in LINE Developers:

```text
https://worldcup-2026-line-bot.thawatchaijanthakit1.workers.dev/
```

## Current Commands

English commands are the main UX:

- `/today`
- `/tomorrow`
- `/schedule`
- `/standings`
- `/A` through `/L`
- `/results`
- `/allresults`
- `/live`
- `/help`

Thai legacy aliases are still supported for convenience.

## Current UX Notes

- `/help` should show the classic command center list.
- After most data responses, the bot appends a compact command menu so the user does not need to type `/help` repeatedly.
- Quick reply buttons are attached to the last outgoing message.
- `/results` should show only the latest 4 matches.
- `/allresults` shows all cached finished matches in chunks.
- `/standings` is split into carousel batches to stay under LINE Flex size limits.

## Validation Commands

Syntax check:

```powershell
node -e "const fs=require('fs'); for (const f of fs.readdirSync('.').filter(x=>x.endsWith('.gs'))) new Function(fs.readFileSync(f,'utf8')); console.log('syntax OK');"
```

Test Worker GET:

```powershell
node -e "fetch('https://worldcup-2026-line-bot.thawatchaijanthakit1.workers.dev/').then(r=>r.text()).then(console.log)"
```

Test fake LINE event through Worker:

```powershell
node -e "const url='https://worldcup-2026-line-bot.thawatchaijanthakit1.workers.dev/'; const payload={events:[{type:'message',replyToken:'TEST_REPLY_TOKEN',message:{type:'text',text:'/help'}}]}; fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)}).then(async r=>{console.log('status',r.status); console.log(await r.text());});"
```

Expected fake event result:

```text
LINE API error 400: Invalid reply token
```

That means routing works; the reply token is fake only for testing.

## Important Gotchas

- Do not push/deploy in parallel. Always `clasp push` first, wait for success, then `clasp deploy`.
- Do not commit `.clasp.json`; it is ignored.
- Do not commit LINE token, LINE secret, football-data.org API key, or Sheet data exports.
- If LINE webhook verify fails with `302 Found`, confirm the webhook URL is the Cloudflare Worker URL.
- If the bot replies old UI, deploy over the existing deployment ID again.
- If data looks fake, check `USE_MOCK_DATA`; live mode requires it to be empty or `false`.

## Last Known State

- Apps Script latest deployed during setup was around version `@26`.
- Cloudflare Worker webhook was working.
- Real football-data.org data was enabled.
- Repo initial commit was pushed to GitHub.
