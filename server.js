// server.js
const express = require("express");
const { google } = require("googleapis");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// مسار ملف credentials من Google Cloud
const CREDENTIALS_PATH = "./credentials.json";
const SPREADSHEET_ID = "1ZaG0fDw96Q7CBTcYQdC6zKJ8PI3987SauTbJevikejM";
const SHEET_NAME = "الاقفالية اليومية";

// تحميل بيانات الـ credentials
const auth = new google.auth.GoogleAuth({
  keyFile: CREDENTIALS_PATH,
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

// دالة لجلب البيانات من Google Sheet
async function getSheetData() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: SHEET_NAME,
  });

  return res.data.values; // ترجع المصفوفة
}

// تحويل بيانات الصفوف إلى نص منسق
function formatSheetData(values) {
  let output = "--------------------------------\n";
  output += "        الاقفالية اليومية\n";
  output += "      (مواقف السيارات - Parking)\n";
  output += "--------------------------------\n";

  // افترض الصف الأول هو العناوين
  const headers = values[0];
  const rows = values.slice(1);

  rows.forEach((row) => {
    headers.forEach((header, index) => {
      output += `${header}: ${row[index] || ""}\n`;
    });
    output += "--------------------------------\n";
  });

  output += "       شكراً لاستخدامكم\n";
  output += "--------------------------------\n";
  return output;
}

// endpoint
app.get("/print", async (req, res) => {
  try {
    const values = await getSheetData();
    const receipt = formatSheetData(values);
    res.send(`<pre>${receipt}</pre>`);
  } catch (err) {
    console.error(err);
    res.status(500).send("حدث خطأ أثناء قراءة ملف الاقفالية اليومية.");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
