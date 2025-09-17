const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

// مسار ملف CSV داخل المشروع
const CSV_FILE = path.join(__dirname, "الاقفالية_اليومية.csv");

app.get("/print", (req, res) => {
  try {
    const data = fs.readFileSync(CSV_FILE, "utf8");
    const rows = data.split("\n").map(row => row.split(","));

    if (!rows || rows.length < 2) {
      return res.send("لا توجد بيانات في ورقة الاقفالية اليومية.");
    }

    const header = rows[0]; // الصف الأول: العناوين
    const firstRow = rows[1]; // الصف الثاني: أول بيانات

    const receipt = `
--------------------------------
        الاقفالية اليومية
      (مواقف السيارات - Parking)
--------------------------------
التاريخ: ${firstRow[0]}
الفترة: ${firstRow[1]}
عدد السيارات: ${firstRow[2]}
اجمالي الكاش: ${firstRow[3]}
اجمالي الشبكة: ${firstRow[4]}
صافي الايراد الكلي: ${firstRow[5]}
--------------------------------
       شكراً لاستخدامكم
--------------------------------
`;

    res.send(`<pre>${receipt}</pre>`);

  } catch (err) {
    console.error(err);
    res.status(500).send("حدث خطأ أثناء قراءة ملف الاقفالية اليومية.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
