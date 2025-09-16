const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// استقبل بيانات AppSheet
app.post("/print", (req, res) => {
  const data = req.body;

  console.log("Received Data:", data);

  // تصميم الفاتورة
  const receipt = `
 Parking Daily Closure
 ---------------------
 Date: ${data.date}
 Shift: ${data.shift}
 ---------------------
 Cars: ${data.cars}
 Total Cash: ${data.cash} SAR
 Total Mada: ${data.mada} SAR
 ---------------------
 Total Revenue: ${data.total} SAR
 ---------------------
 Thank You!
`;

  console.log(receipt);

  res.status(200).send({ success: true });
});

// السيرفر يعمل على المنفذ الافتراضي Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
