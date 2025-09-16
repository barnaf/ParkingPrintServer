const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// رسالة ترحيب على المسار /
app.get("/", (req, res) => {
  res.send("Server is running! Ready to receive AppSheet Webhooks at /print");
});

// استقبل بيانات AppSheet على /print
app.post("/print", (req, res) => {
  const data = req.body;

  console.log("Received Data:", data);

  // تصميم الفاتورة بالشكل نفسه الموجود في الشيت
  const receipt = `
--------------------------------
        الاقفالية اليومية
      (مواقف السيارات - Parking)
--------------------------------
التاريخ: ${data.date}
الفـــتـــرة: ${data.shift}
--------------------------------
عدد السيارات: ${data.cars} سيارة
اجمالي الكاش: ${data.cash} ريال
اجمالي الشبكة: ${data.mada} ريال
صافي الايراد الكلي: ${data.total} ريال
--------------------------------
       شكراً لاستخدامكم
--------------------------------
`;

  // نطبع الفاتورة في Console (لاحقاً يمكن الإرسال للطابعة)
  console.log(receipt);

  // نرسل تأكيد استلام البيانات
  res.status(200).send({ success: true, message: "Receipt generated successfully" });
});

// تشغيل السيرفر على المنفذ الافتراضي Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
