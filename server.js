const express = require("express");
const fetch = require("node-fetch"); // لقراءة رابط Google Sheet بصيغة CSV
const app = express();

// رابط Google Sheet بصيغة CSV (الورقة "الاقفالية اليومية")
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQNj3Zf0Kkq4d7gXkL6pSBl7yV0QXYZ123/pub?gid=1751567397&single=true&output=csv";

// دالة لتحويل CSV إلى مصفوفة من الصفوف
async function getSheetData() {
  const response = await fetch(SHEET_CSV_URL);
  const text = await response.text();
  const rows = text.split("\n").map(row => row.split(","));
  return rows;
}

// مسار عرض الاقفالية اليومية
app.get("/print", async (req, res) => {
  try {
    const rows = await getSheetData();

    // نفترض الصفوف 2 وما بعد (الصف الأول هو العناوين)
    const lastRow = rows[rows.length - 1];

    const التاريخ = lastRow[1];  // عمود B
    const الفترة = lastRow[2];   // عمود C
    const عدد_السيارات = lastRow[3]; // عمود D
    const الكاش = lastRow[4];    // عمود E
    const الشبكة = lastRow[5];   // عمود F
    const الصافي = lastRow[6];   // عمود G

    const receipt = `
--------------------------------
        الاقفالية اليومية
      (مواقف السيارات - Parking)
--------------------------------
التاريخ: ${التاريخ}
الفترة: ${الفترة}
عدد السيارات: ${عدد_السيارات}
اجمالي الكاش: ${الكاش}
اجمالي الشبكة: ${الشبكة}
صافي الايراد الكلي: ${الصافي}
--------------------------------
       شكراً لاستخدامكم
--------------------------------
`;

    res.send(`<pre>${receipt}</pre>`);
  } catch (err) {
    console.error(err);
    res.status(500).send("حدث خطأ أثناء قراءة ورقة الاقفالية اليومية.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
