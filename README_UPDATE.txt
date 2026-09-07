BCP Offline Central Sync — 2026-09-07

โครงสร้าง
- index.html : ระบบหลัก + ฐานข้อมูลแพ้ยา/List2 ฝังใน HTML เป็น fallback
- data/qr16015-allergy150666.xlsx : ฐานข้อมูลแพ้ยากลาง
- data/list2.xlsx : List 2 กลาง
- data/version.json : เลขเวอร์ชันที่เครื่องผู้ใช้ตรวจสอบ
- sw.js : Offline cache + network-first สำหรับ data/

การทำงาน
1) เปิด Offline: ใช้ข้อมูลล่าสุดจาก IndexedDB ถ้ามี; ถ้าไม่มีใช้ข้อมูลที่ฝังใน HTML
2) เปิด Online: ตรวจ data/version.json อัตโนมัติ
3) ถ้าเวอร์ชันใหม่: ดาวน์โหลด 2 ไฟล์กลาง บันทึก IndexedDB และใช้ทันที
4) Use / Time ยังอัปเดตเองจากหน้า ตั้งค่าระบบ ตามระบบเดิม

การเผยแพร่ฐานข้อมูลกลางจากหน้าเว็บ
- ตั้งค่าระบบ > ฐานข้อมูลแพ้ยาและการจับคู่ยา
- เลือกไฟล์ qr16015 allergy150666 และ/หรือ List 2
- เปิดหัวข้อ “ผู้ดูแลระบบ: เผยแพร่ฐานข้อมูลกลางไป GitHub”
- ใส่ GitHub Fine-grained token ที่จำกัดเฉพาะ repo jumpon097/pharubchbcp และ Contents: Read and write
- กดเผยแพร่
- Token ไม่ถูกบันทึกใน Local Storage หรือ HTML

Mapping
- Allergy: HN = A, Drug allergy name = C
- List 2: Code = B, Name = C, DrugGenericName = O
