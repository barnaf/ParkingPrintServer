const https = require("https");
const http = require("http");

// رابط CSV للورقة من Google Sheets (تأكد أن الورقة عامة للنشر)
const sheetCSVUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?gid=1751567397&single=true&output=csv";

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  if (req.url === "/print") {
    // جلب البيانات من Google Sheets
    https.get(sheetCSVUrl, (sheetRes) => {
      let data = "";
      sheetRes.on("data", chunk => data += chunk);
      sheetRes.on("end", () => {
        // تقسيم الصفوف
        const rows = data.split("\n").map(r => r.split(","));
        
        // افتراضياً الصفوف: التاريخ, الفترة, عدد السيارات, الكاش, الشبكة, الصافي الكلي
        const latestRow = rows[rows.length - 1]; // آخر صف
        const [date, shift, cars, cash, mada, total] = latestRow;

        // توليد الاقفالية اليومية منسقة
        const receipt = `
--------------------------------
        الاقفالية اليومية
      (مواقف السيارات - Parking)
--------------------------------
التاريخ: ${date}
الفترة: ${shift}
عدد السيارات: ${cars}
اجمالي الكاش: ${cash}
اجمالي الشبكة: ${mada}
صافي الايراد الكلي: ${total}
--------------------------------
       شكراً لاستخدامكم
--------------------------------
`;
        res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
        res.end(`<pre>${receipt}</pre>`);
      });
    }).on("error", (err) => {
      res.writeHead(500);
      res.end("حدث خطأ أثناء قراءة بيانات الاقفالية اليومية.");
      console.error(err);
    });

  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
}).listen(PORT, () => {
  console.log(`Server is running! Ready to receive AppSheet Webhooks at /print on port ${PORT}`);
});
