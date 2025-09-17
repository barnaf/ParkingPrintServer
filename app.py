# app.py
from flask import Flask, request, jsonify, render_template_string
import os
import datetime
import re

app = Flask(__name__)

LAST_FILE = "last_receipt.html"

def get_field(data, *keys):
    for k in keys:
        # try exact key
        if isinstance(data, dict) and k in data:
            return data[k]
        # try without spaces and variations
        if isinstance(data, dict):
            for dk in data.keys():
                if dk.replace(" ", "").replace("_","").lower() == k.replace(" ", "").replace("_","").lower():
                    return data[dk]
    return ""

def cleanup_amount(v):
    if v is None: 
        return ""
    s = str(v)
    # remove currency words and commas
    s = re.sub(r"[^\d\.\-]", "", s)
    return s

RECEIPT_HTML = """
<!doctype html>
<meta charset="utf-8">
<pre style="font-family: monospace; font-size: 14px; line-height:1.1;">
--------------------------------
        الاقفالية اليومية
      (مواقف السيارات - Parking)
--------------------------------
التاريخ: {{date}}
الفـــتـــرة: {{shift}}
--------------------------------
عدد السيارات: {{cars}}
اجمالي الكاش: {{cash}} ريال
اجمالي الشبكة: {{mada}} ريال
صافي الايراد الكلي: {{total}} ريال
--------------------------------
       شكراً لاستخدامكم
--------------------------------
</pre>
"""

@app.route("/")
def index():
    return "Server is running! Ready to receive POST at /print"

@app.route("/last")
def last():
    if os.path.exists(LAST_FILE):
        with open(LAST_FILE, "r", encoding="utf-8") as f:
            return f.read()
    return "No receipt saved yet."

@app.route("/print", methods=["POST","GET"])
def receive_print():
    # Accept JSON POST, or query parameters (for external:go to website)
    data = {}
    if request.method == "POST":
        try:
            data = request.get_json(force=True) or {}
        except Exception:
            data = {}
    # also merge form or args (so GET with query params works)
    data = {**data, **request.form.to_dict(), **request.args.to_dict()}

    # try multiple possible key names (English / Arabic / different labels)
    date = get_field(data, "date", "التاريخ - Date", "التاريخ", "Time In - وقت الدخول", "TimeIn", "timein")
    shift = get_field(data, "shift", "الفترة", "الفـــتـــرة")
    cars = get_field(data, "cars", "عدد السيارات", "عدد_السيارات")
    cash = get_field(data, "cash", "الكاش", "Cash / كاش", "اجمالي الكاش - Total Cash")
    mada = get_field(data, "mada", "الشبكة", "Mada / مدى", "اجمالي الشبكة - Mada")
    total = get_field(data, "total", "الصافي", "صافي الايراد الكلي - Total", "صافي الايراد الكلي")

    # cleanup numeric-looking fields
    cash_clean = cleanup_amount(cash)
    mada_clean = cleanup_amount(mada)
    total_clean = cleanup_amount(total)

    # fallback defaults
    if not date:
        date = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    if not cars:
        cars = "0"
    # render receipt HTML
    html = render_template_string(RECEIPT_HTML,
                                  date=date,
                                  shift=shift or "",
                                  cars=cars,
                                  cash=cash_clean or cash,
                                  mada=mada_clean or mada,
                                  total=total_clean or total)
    # save to file so you can open https://your-app/onrender.com/last
    with open(LAST_FILE, "w", encoding="utf-8") as f:
        f.write(html)

    # log to console
    app.logger.info("Received Data: %s", data)
    app.logger.info("Generated receipt saved to %s", LAST_FILE)

    return jsonify(success=True, message="Receipt generated", view="/last")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
