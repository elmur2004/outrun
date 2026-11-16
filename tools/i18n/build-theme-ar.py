"""Build Arabic translations for the OUTRUN theme's content (JSON templates, section groups, stored settings).
Source of Arabic: the designer's prototype copy (T.ar), matched on the English text; a few manual strings."""
import html, json, re, sys

content_path, t_path, out_path = sys.argv[1:4]
t = open(content_path).read()
content = json.loads(t[t.find("{"):])["data"]["translatableResource"]["translatableContent"]
T = json.load(open(t_path, encoding="utf-8"))

def norm(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s or ""))).strip()

# English → Arabic from the prototype (first occurrence wins for repeated English).
emap = {}
for k, en in T["en"].items():
    emap.setdefault(norm(en), T["ar"][k])

MANUAL = {
    "Valentine’s, Birthdays, Eid": "الفالنتاين, أعياد الميلاد, العيد",  # ASCII commas: the theme splits on ","
    "Four floating caps set in foam inside the OUTRUN gift box": "أربع أغطية عائمة متسابة في فوم جوه علبة هدية OUTRUN",
    "CAD drawings of the cap on screen beside a 3D printer in the OUTRUN workshop": "رسومات CAD للغطا على الشاشة جنب طابعة 3D في ورشة OUTRUN",
    "Silhouette of the upcoming OUTRUN Ride e-scooter": "ظل سكوتر OUTRUN Ride الكهربا الجاي",
    "Silhouette of the upcoming OUTRUN Kart electric kart": "ظل كارتينج OUTRUN Kart الكهربا الجاي",
    "Leave your email. One message when a line opens, nothing else.": "سيب إيميلك. رسالة واحدة لما الخط يفتح، ومفيش غيرها.",
    "Your set, ready to go.": "الطقم بتاعك جاهز.",
    "Collections": "المجموعات",
    "Street: Your car’s own badge, floating level.\nSignature: The OUTRUN symbol. Two speed lines.\nCustom: Your design, cut and finished for your wheels.":
        "Street: شعار عربيتك نفسه، ثابت وهو بيلف.\nSignature: رمز OUTRUN. خطين سرعة.\nCustom: تصميمك إنت، متقصوص ومتشطب لجنوطك.",
}
for i in range(1, 5):
    MANUAL[f"Customer clip 0{i}"] = f"فيديو عميل 0{i}"

# Brand lines, names and labels that stay in English in Arabic (as in the prototype).
KEEP_VALUES = {
    "Drive", "the", "feeling.", "FEELING", "Drop 01", "Run 01", "Details move differently.", "Built for a different road.",
    "Performance looks better here.", "Drive the feeling.", "OUTRUN", "OUTRUN Car", "OUTRUN Car · Drop 01",
    "Street", "Signature", "Custom", "OUTRUN Ride", "OUTRUN Kart", "CAR", "NEXT", "AHEAD", "WORKSHOP", "FIND", "LINES",
    "°C", "km", "BMW 3 Series", "Mercedes C-Class", "BMW X5", "Mercedes E-Class",
}
# Keys never translated: option names the theme matches on, contact data, and our own locale strings.
SKIP_KEYS = {"general.edition_option", "general.finish_option", "general.custom_value", "general.whatsapp_number",
             "general.phone", "general.email", "general.page", "general.scroll", "general.pagination", "general.previous", "general.next"}
# Per-key choices where the same English has two Arabic versions in the prototype.
KEY_OVERRIDES = {
    ".fitment.eyebrow": "مقاس عربيتك",
    "footer-group.json.footer.copyright_line": None,  # brand line: keep English
}

translations, kept, missing = [], [], []
for x in content:
    key, value, digest = x["key"], x["value"] or "", x["digest"]
    if not (key.startswith("section.") or key.startswith("general.")) or key in SKIP_KEYS:
        continue
    if re.match(r"^(/|#|https?:|shopify:|mailto:|tel:)", value.strip()) or re.fullmatch(r"[\d\s.,%+-]*", value):
        continue
    override = next((v for k, v in KEY_OVERRIDES.items() if k in key), "unset")
    if override is None or value.strip() in KEEP_VALUES:
        kept.append((key, value)); continue
    if override != "unset":
        ar = override
    elif value in MANUAL:
        ar = MANUAL[value]
    elif norm(value) in emap:
        ar = emap[norm(value)]
        if value.strip().startswith("<p>"):
            ar = f"<p>{ar}</p>"  # rich text answers
    else:
        missing.append((key, value)); continue
    if ar.strip() == value.strip():
        kept.append((key, value)); continue
    translations.append({"locale": "ar", "key": key, "value": ar, "translatableContentDigest": digest})

json.dump(translations, open(out_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"translations: {len(translations)} | kept in English: {len(kept)} | NOT MATCHED: {len(missing)}")
for k, v in missing: print("  missing:", k[:70], "|", v[:60].replace("\n", " / "))
for tr in translations[:6]: print("  e.g.", tr["key"][:55].ljust(55), "→", tr["value"][:45].replace("\n", " / "))
