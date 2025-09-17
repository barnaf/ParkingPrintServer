const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// رسالة ترحيب على المسار /
app.get("/", (req, res) => {
  res.send("Server is running! Ready to receive AppSheet Webhooks at /print");
});

// مسار GET جديد لعرض الاقفالية مباشرة في المتصفح
app.get("/print", (req, res) => {
  const receipt = `
--------------------------------
        الاقفالية اليومية
      (مواقف السيارات - Parking)
--------------------------------
التاريخ: 9/16/2025
الفترة: المسائية
عدد السيارات: 20 سيارة
اجمالي الكاش: 60 ريال
اجمالي الشبكة: 32 ريال
صافي الايراد الكلي: 92 ريال
--------------------------------
       شكراً لاستخدامكم
--------------------------------
`;
  res.send(`<pre>${receipt}</pre>`); // يعرضها منسقة في المتصفح
});

// استقبال بيانات POST من AppSheet (للاستخدام لاحقًا)
app.post("/print", (req, res) => {
  const data = req.body;
  console.log("Received Data:", data);

  // لو تحب تولد الفاتورة من البيانات المرسلة بدل القيم الثابتة
  const dynamicReceipt = `
--------------------------------
        الاقفالية اليومية
      (مواقف السيارات - Parking)
--------------------------------
التاريخ: ${data.date || "غير محدد"}
الفترة: ${data.shift || "غير محدد"}
عدد السيارات: ${data.cars || 0} سيارة
اجمالي الكاش: ${data.cash || 0} ريال
اجمالي الشبكة: ${data.mada || 0} ريال
صافي الايراد الكلي: ${data.total || 0} ريال
--------------------------------
       شكراً لاستخدامكم
--------------------------------
`;

  // نطبع في Console
  console.log(dynamicReceipt);

  // نرسل تأكيد الاستلام
  res.status(200).send({ success: true, message: "Receipt generated successfully" });
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
