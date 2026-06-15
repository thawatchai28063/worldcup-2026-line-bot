# Cloudflare Worker Proxy สำหรับ LINE Webhook

ใช้ Worker นี้คั่นกลางระหว่าง LINE กับ Google Apps Script เพื่อแก้ปัญหา Apps Script Web App ตอบ `302 Found` ก่อน แล้ว LINE Verify ไม่ตาม redirect

โครงสร้าง:

```text
LINE Messaging API -> Cloudflare Worker -> Google Apps Script
```

## วิธีใช้งาน

1. เข้า Cloudflare Dashboard
2. ไปที่ Workers & Pages
3. กด Create application
4. เลือก Create Worker
5. ตั้งชื่อ เช่น `worldcup-2026-line-bot`
6. กด Deploy
7. กด Edit code
8. ลบโค้ดเดิม แล้ววางโค้ดจาก `worker.js`
9. กด Deploy
10. คัดลอก Worker URL เช่น:

```text
https://worldcup-2026-line-bot.<your-subdomain>.workers.dev
```

11. เอา Worker URL นี้ไปใส่ใน LINE Developers > Messaging API > Webhook URL
12. เปิด Use webhook
13. กด Verify

## ทดสอบ

เปิด Worker URL ใน browser ควรเห็น JSON ประมาณนี้:

```json
{
  "ok": true,
  "service": "worldcup-2026-line-bot-worker",
  "message": "LINE webhook proxy is running."
}
```

หลัง Verify ผ่าน ให้ลองพิมพ์ใน LINE:

```text
/help
/วันนี้
/ตารางคะแนน
```

## Apps Script URL ที่ตั้งไว้

Worker นี้ forward ไปที่:

```text
https://script.google.com/macros/s/AKfycbzL01fl3Ap-AgKBDFc6zxYmG_DVndrfULgj7rY3ONm2E6WyFc8tZ3m1tzMpVLFcytQA/exec
```
