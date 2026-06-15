# worldcup-2026-line-bot-appscript

โปรเจกต์ LINE Bot สำหรับดูโปรแกรมแข่ง ตารางคะแนน และผลบอลฟุตบอลโลก 2026 โดยใช้ Google Apps Script เป็น backend, Google Sheet เป็น cache/log และใช้ LINE Flex Message เป็นหน้าตอบกลับ

โปรเจกต์นี้เริ่มจาก mock data ก่อน จึงทดสอบคำสั่งหลักได้ทันทีแม้ football-data.org ยังไม่มีข้อมูล World Cup 2026 จริง

## ไฟล์ในโปรเจกต์

- `Code.gs` - LINE Webhook, command routing, reply/push message, config, log
- `FootballApi.gs` - อ่าน mock/sheet data, wrapper สำหรับ football-data.org, sync ข้อมูลลง Sheet
- `SheetService.gs` - สร้าง sheet, อ่าน/เขียน cache, append log
- `FlexMessages.gs` - สร้าง LINE Flex Message ทุกแบบ
- `MockData.gs` - mock matches, standings Groups A-L, results
- `Triggers.gs` - trigger sync รายชั่วโมง และส่งสรุปรายวัน
- `appsscript.json` - manifest สำหรับ clasp และ Apps Script runtime
- `.claspignore` - ให้ clasp อัปโหลดเฉพาะไฟล์ Apps Script
- `.clasp.json.example` - ตัวอย่างไฟล์ `.clasp.json` สำหรับใส่ `scriptId` จริง

## วิธีสร้าง Google Sheet

1. เปิด Apps Script project
2. คัดลอกไฟล์ `.gs` ทั้งหมดในโฟลเดอร์นี้ไปสร้างเป็นไฟล์ใน Apps Script Editor ตามชื่อไฟล์เดิม
3. คัดลอก `appsscript.json` ไปแทน manifest เดิม โดยเปิด Project Settings > Show "appsscript.json" manifest file
4. Run ฟังก์ชัน `setupSheets()` 1 ครั้ง และกดอนุญาตสิทธิ์

ถ้า project ไม่ได้ผูกกับ Google Sheet อยู่แล้ว ระบบจะสร้างไฟล์ Google Sheet ใหม่ชื่อ `World Cup 2026 Bot Data` ให้อัตโนมัติ และจำ Spreadsheet ID ไว้ใน Script Properties ชื่อ `SPREADSHEET_ID`

หลังรัน `setupSheets()` จะได้ sheet:

- `settings`
- `matches`
- `standings`
- `cache`
- `logs`

## ตัวอย่าง settings

ใส่ข้อมูลใน sheet `settings` แบบนี้

| key | value |
| --- | --- |
| LINE_CHANNEL_ACCESS_TOKEN | ใส่ Channel access token จาก LINE Developers |
| LINE_CHANNEL_SECRET | ใส่ Channel secret จาก LINE Developers |
| FOOTBALL_DATA_API_KEY | ใส่ API key จาก football-data.org |
| LINE_PUSH_TARGET_ID | ใส่ userId/groupId/roomId สำหรับ push สรุปรายวัน |
| BASE_DASHBOARD_URL | URL dashboard ถ้ามี หรือปล่อยว่างได้ |
| USE_MOCK_DATA | true |
| TIMEZONE | Asia/Bangkok |

หมายเหตุ: ห้ามใส่ token ลงในโค้ดโดยตรง ให้ใส่เฉพาะใน sheet `settings`

## Deploy เป็น Web App

1. เปิด Apps Script
2. กด Deploy > New deployment
3. เลือก type เป็น Web app
4. ตั้งค่า:
   - Execute as: Me
   - Who has access: Anyone
5. กด Deploy
6. คัดลอก Web app URL ที่ได้

## นำ Web App URL ไปใส่ใน LINE Webhook

1. ไปที่ LINE Developers Console
2. เปิด Messaging API channel ของคุณ
3. ไปที่ Messaging API settings
4. วาง Web app URL ในช่อง Webhook URL
5. เปิด Use webhook
6. กด Verify เพื่อตรวจสอบ

## วิธีใส่ LINE Channel Access Token

1. ใน LINE Developers Console ไปที่ Messaging API settings
2. สร้างหรือคัดลอก Channel access token
3. กลับไปที่ Google Sheet > `settings`
4. ใส่ token ในแถว `LINE_CHANNEL_ACCESS_TOKEN`

## วิธีใส่ football-data.org API Key

1. สมัครหรือเข้าสู่ระบบที่ football-data.org
2. คัดลอก API key
3. ใส่ใน Google Sheet > `settings` แถว `FOOTBALL_DATA_API_KEY`

Endpoint ที่โค้ดเตรียมไว้:

- `GET https://api.football-data.org/v4/competitions/WC/matches`
- `GET https://api.football-data.org/v4/competitions/WC/standings`

Header:

```text
X-Auth-Token: FOOTBALL_DATA_API_KEY
```

## เปิด/ปิด mock data

ใน sheet `settings`:

- `USE_MOCK_DATA = true` ใช้ข้อมูลตัวอย่างจาก `MockData.gs`
- `USE_MOCK_DATA = false` อ่านข้อมูลจาก sheet cache และสามารถ sync จาก football-data.org ได้

แนะนำให้เริ่มด้วย `true` ก่อน เพื่อทดสอบ LINE Flex Message และคำสั่งทั้งหมด

## สร้าง Trigger sync ข้อมูล

1. เปิด Apps Script
2. Run ฟังก์ชัน `createTriggers()`
3. ระบบจะสร้าง trigger:
   - `scheduledSync()` ทุก 1 ชั่วโมง
   - `scheduledDailySummary()` ทุกวันเวลา 08:00 ตาม `TIMEZONE`

ถ้าต้องการลบ trigger ของบอท ให้ Run ฟังก์ชัน `deleteTriggers()`

## ทดสอบคำสั่งใน LINE

เพิ่มบอทเป็นเพื่อน แล้วพิมพ์คำสั่ง:

- `/วันนี้`
- `/พรุ่งนี้`
- `/schedule A`
- `/ตารางคะแนน`
- `/กลุ่ม A`
- `/กลุ่ม B`
- `/ผลบอล`
- `/help`

เวอร์ชัน mock data จะตอบกลับได้ทันทีสำหรับคำสั่งหลัก โดยเฉพาะ `/วันนี้`, `/ตารางคะแนน`, และ `/help`

## ใช้งานผ่าน clasp

ถ้าต้องการใช้ `clasp`:

1. ติดตั้งและ login:

```bash
npm install -g @google/clasp
clasp login
```

2. สร้าง Apps Script project ที่ผูกกับ Google Sheet หรือ clone project ที่มีอยู่
3. วางไฟล์ทั้งหมดในโฟลเดอร์นี้ใน root ของ project
4. รัน:

```bash
clasp push
```

ถ้ามี Apps Script project อยู่แล้ว ให้คัดลอก `.clasp.json.example` เป็น `.clasp.json` แล้วใส่ `scriptId` จริงก่อน `clasp push`

## ข้อควรรู้

- LINE Flex carousel จำกัดไม่เกิน 12 bubbles โค้ดจึงแสดง Group A-L สูงสุด 12 กลุ่ม
- หากไม่มีข้อมูล ระบบจะตอบว่า `ยังไม่มีข้อมูลในตอนนี้`
- หาก API error ระบบจะเขียน log ลง sheet `logs` และตอบกลับด้วย Flex Error Message เมื่อเกิดในคำสั่งผู้ใช้
- ถ้า football-data.org ยังไม่มีข้อมูล World Cup 2026 จริง ให้ใช้ mock data ไปก่อน
