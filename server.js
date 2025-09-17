const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const csv = require('csv-parser');

const app = express();
app.use(bodyParser.json());

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQYOUR_SHEET_ID/pub?output=csv'; // ضع رابط CSV العام هنا

// دالة لتحويل CSV إلى JSON
async function getSheetData() {
  const response = await fetch(SHEET_CSV_URL);
  const text = await response.text();

  return new Promise((resolve, reject) => {
    const results = [];
    const stream = require('stream');
    const readable = new stream.Readable();
    readable._read = () => {};
    readable.push(text);
    readable.push(null);

    readable
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

// endpoint لطباعة ورقة الاقفالية اليومية
app.get('/print', async (req, res) => {
  try {
    const data = await getSheetData();

    // نحدد آخر صف لليوم
    const todayEntry = data[data.length - 1];

    const receipt = `
--------------------------------
        الاقفالية اليومية
      (مواقف السيارات - Parking)
--------------------------------
التاريخ: ${todayEntry['التاريخ']}
الفترة: ${todayEntry['الفترة']}
عدد السيارات: ${todayEntry['عدد السيارات']}
اجمالي الكاش: ${todayEntry['الكاش']}
اجمالي الشبكة: ${todayEntry['الشبكة']}
الصافي الكلي: ${todayEntry['الصافي الكلي']}
--------------------------------
       شكراً لاستخدامكم
--------------------------------
`;

    res.send(`<pre>${receipt}</pre>`); // يظهر المنسق في المتصفح
  } catch (err) {
    res.status(500).send('حدث خطأ أثناء قراءة بيانات الاقفالية اليومية.');
    console.error(err);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
