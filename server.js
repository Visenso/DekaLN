const express = require('express');
const cors = require('cors');

const app = express();

// อนุญาตให้หน้าเว็บ (CORS) เรียกใช้งาน
app.use(cors());
app.use(express.json());

app.post('/api/proxy', async (req, res) => {
    try {
        const targetEndpoint = req.body.endpoint; 
        const payload = req.body.payload;
        
        // รับ Headers ทั้ง 2 แบบที่หน้าเว็บส่งมา
        const authHeader = req.headers.authorization;
        const apiKeyHeader = req.headers['x-api-key'];

        const targetUrl = 'https://api.slegaltools.digital' + targetEndpoint;
        console.log(`[Proxy] กำลังเชื่อมต่อไปที่: ${targetUrl}`);

        // สร้าง Headers ปลายทาง ส่งครอบคลุมไปทั้ง 2 แบบเผื่อระบบต้องการ
        const fetchHeaders = {
            'Content-Type': 'application/json'
        };
        if (authHeader) fetchHeaders['Authorization'] = authHeader;
        if (apiKeyHeader) fetchHeaders['X-API-Key'] = apiKeyHeader;

        // ดำเนินการยิงข้อมูลไปที่ API จริง
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: fetchHeaders,
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        // --- เพิ่มบรรทัดนี้เพื่อแอบดูข้อมูลที่ API ส่งกลับมา ---
        console.log(`[Proxy] สถานะ: ${response.status}`);
        console.log(`[Proxy] ข้อมูลที่ API ตอบกลับ (ย่อ):`, JSON.stringify(data).substring(0, 500));
        // ------------------------------------------

        if (!response.ok) {
            console.log(`[Proxy] พบ Error จาก API:`, data);
            return res.status(response.status).json(data);
        }

        res.json(data);

    } catch (error) {
        console.error('[Proxy Error]:', error);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดที่ Proxy Server: ' + error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Proxy Server อัปเดตใหม่พร้อมทำงานที่: http://localhost:${PORT}`);
    console.log(`>> รองรับระบบตรวจสอบ API Key ทุกรูปแบบแล้ว <<`);
});