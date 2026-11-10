import { site } from "@/data/site";

export type BotAction = {
  label: string;
  url?: string;
  variant?: "primary" | "whatsapp" | "outline";
};

export type ConversationTopic =
  | "registration"
  | "pvt_ltd"
  | "sole_prop"
  | "tin_tax"
  | "accounting"
  | "auditing"
  | "consulting"
  | "it"
  | "pricing"
  | "contact"
  | "location"
  | "consultation"
  | null;

export type BotResponse = {
  text: string;
  topic?: ConversationTopic;
  actions?: BotAction[];
  suggestions?: string[];
};

export type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  topic?: ConversationTopic;
  actions?: BotAction[];
  suggestions?: string[];
  isStreaming?: boolean;
};

const COMPANY_SYSTEM_PROMPT = `You are Clarity AI, the official friendly, concise virtual consultant for TV Clarity Capital (Pvt) Ltd ("Our Capital is Your Success"), based in Monaragala, Sri Lanka (serving clients island-wide).
Answer clearly, concisely, and naturally like a real consultant in the exact language the user uses (Sinhala, Singlish, or English). Keep replies short and conversational (2-5 sentences or compact bullet points) — avoid long walls of text.
Company facts:
- Services:
  1. Business Registration: Sole Proprietorship, Partnership, Private Limited (Pvt Ltd) incorporation via eROC (Companies Act No. 07 of 2007, Form 1/18/19, Articles, 3-7 working days), TIN registration with IRD, corporate bank account setup support.
  2. Accounting & Bookkeeping: Daily/monthly bookkeeping, Profit & Loss, Balance Sheet, Cash Flow statements (LKAS/SLFRS for SMEs), Management Accounts, Payroll, EPF/ETF, RAMIS & tax compliance.
  3. Auditing & Financial Services: Internal audits, internal control reviews, financial health checks, statutory audit readiness.
  4. Business Consulting: Bank loan business plans & project reports (BOC, People's Bank, Commercial, HNB, etc.), feasibility studies, cost optimization, startup mentorship.
  5. IT Solutions: Responsive business websites, custom web apps, Cloud POS & billing software, ERP & process automation, digital business setup.
- Contacts:
  - WhatsApp (Recommended & Fastest): 076 430 3421 (https://wa.me/94764303421)
  - Direct Voice Call: 071 405 3449
  - Email: tvclaritycapital@gmail.com
  - Location: Monaragala, Sri Lanka (100% online & island-wide service supported)
  - Hours: Mon–Sat 8:30 AM – 5:30 PM
- Pricing: Fair, transparent, tailored to business scale; initial consultation/quote is free.`;

function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?'"!]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectLanguage(prompt: string, norm: string): "sinhala" | "singlish" | "english" {
  if (/[\u0D80-\u0DFF]/.test(prompt)) return "sinhala";

  const singlishMarkers = [
    "machan", "mchn", "sahodara", "sudda", "ayubowan", "aayubowan", "kohomada", "khomada",
    "kohomd", "mokakda", "mokada", "monawada", "monada", "puluwanda", "pluwanda", "puluvanda",
    "ona", "one", "oni", "karanna", "kranne", "karanne", "denna", "denawada", "kiyada",
    "keeyada", "keeyak", "ganan", "salli", "thiyenawada", "tiyenawada", "thiyenne", "eka",
    "ekak", "ekata", "api", "oyala", "mage", "mata", "apita", "koheda", "kothanada", "wede",
    "wedak", "ganna", "gannawada", "heta", "ada", "ahanna", "kiyanna", "wisthara", "vistara",
    "sthuthi", "stuti", "bohoma", "hari", "ela", "supiri", "patanganna", "patan", "yawida",
    "yanawada", "dawas", "ow", "na", "ne", "neda", "thama", "tawa", "thawa", "wena",
  ];
  const words = norm.split(" ");
  if (singlishMarkers.some((m) => words.includes(m))) return "singlish";

  return "english";
}

function hasAny(norm: string, terms: string[]): boolean {
  const words = norm.split(" ");
  return terms.some((t) => (t.includes(" ") ? norm.includes(t) : words.includes(t) || norm.includes(t)));
}

function getLastBotTopic(history: Message[]): ConversationTopic {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].sender === "bot" && history[i].topic) {
      return history[i].topic ?? null;
    }
  }
  return null;
}

/**
 * Generates an intelligent, context-aware conversational reply using the built-in
 * TV Clarity Capital knowledge engine (always available offline/without external keys).
 */
export function generateLocalReply(userPrompt: string, history: Message[] = []): BotResponse {
  const norm = normalize(userPrompt);
  const lang = detectLanguage(userPrompt, norm);
  const sin = lang !== "english";
  const lastTopic = getLastBotTopic(history);

  // 1. GREETINGS & CASUAL HOW-ARE-YOU
  if (
    hasAny(norm, [
      "hello", "hi", "hey", "hai", "good morning", "good afternoon", "good evening",
      "gm", "ayubowan", "aayubowan", "ආයුබෝවන්", "සුබ උදෑසනක්", "කොහොමද", "kohomada", "khomada",
    ]) &&
    norm.split(" ").length <= 5
  ) {
    return {
      text: sin
        ? `ආයුබෝවන්! හොඳින් ඉන්නවා 😊 ඔබට අද **TV Clarity Capital** වෙතින් මොන වගේ උදව්වක්ද අවශ්‍ය?

අපි Business Registration, Accounting & Tax, Auditing, Business Consulting සහ Website/Software වැඩ කරලා දෙනවා. කෙටියෙන් අහන්න!`
        : `Hello! 👋 Doing great, thanks for asking. How can **TV Clarity Capital** help your business today?

Feel free to ask me anything about Business Registration, Accounting & Tax, Auditing, Business Plans, or Websites & Software.`,
      actions: [
        { label: "💬 WhatsApp (076 430 3421)", url: site.whatsappHref, variant: "whatsapp" },
      ],
      suggestions: sin
        ? ["Business එකක් register කරන්න ඕන", "Accounting & Tax ගැන", "Website / POS හදන්න", "ගාස්තු කොහොමද?"]
        : ["Register a company", "Accounting & Tax services", "Build a website / POS", "Pricing & Consultation"],
    };
  }

  // 2. THANK YOU / CLOSING / ACKNOWLEDGMENTS
  if (
    hasAny(norm, [
      "thanks", "thank you", "thank u", "thx", "ty", "bye", "goodbye",
      "sthuthi", "stuti", "bohoma sthuthi", "ස්තූතියි", "බොහොම ස්තූතියි", "ela", "supiri",
    ]) &&
    norm.split(" ").length <= 6
  ) {
    return {
      text: sin
        ? `බොහොම ස්තූතියි! 😊 වෙනත් ඕනෑම උදව්වක් අවශ්‍ය නම් ඕනෑම වේලාවක මෙතනින් අහන්න. ඉක්මන්ම සේවාවක් සඳහා **076 430 3421** WhatsApp අංකයට msg එකක් දාන්න.`
        : `You're very welcome! 😊 Feel free to ask anytime if you have more questions. For immediate assistance, you can always message us on WhatsApp at **076 430 3421**.`,
      topic: lastTopic,
      actions: [
        { label: "💬 WhatsApp (076 430 3421)", url: site.whatsappHref, variant: "whatsapp" },
      ],
    };
  }

  // 3. FOLLOW-UP CONTEXT: AFFIRMATIVE ("ow", "hari", "yes", "karamu", "start", "how to start")
  if (
    hasAny(norm, ["ow", "yes", "yeah", "yep", "ok", "okay", "hari", "karamu", "kohomada patan ganne", "how to start", "ඔව්", "හරි", "කරමු"]) &&
    norm.split(" ").length <= 5
  ) {
    return {
      text: sin
        ? `නියමයි! අපිට දැන්ම වැඩේ පටන් ගන්න පුළුවන්.

ඉක්මන්ම ක්‍රමය තමයි **076 430 3421** අංකයට WhatsApp පණිවිඩයක් දාන එක — අපේ උපදේශකවරයෙක් එවෙලේම සම්බන්ධ වෙලා ඔයාට හරිම විස්තර ටික කියයි. නැත්නම් Online Consultation form එක පුරවන්නත් පුළුවන්.`
        : `Great! We can get started right away.

The fastest way is to send us a quick message on **WhatsApp (076 430 3421)** and an advisor will guide you immediately, or you can submit our online consultation form.`,
      topic: "consultation",
      actions: [
        { label: "💬 WhatsApp Now (076 430 3421)", url: site.whatsappHref, variant: "whatsapp" },
        { label: "📝 Consultation Form", url: "/consultation", variant: "primary" },
      ],
    };
  }

  // 4. FOLLOW-UP CONTEXT: SPECIFIC PVT LTD vs SOLE PROPRIETOR
  const wantsPvtLtd = hasAny(norm, ["pvt", "private limited", "company", "eroc", "roc", "සමාගම", "සමාගම්"]);
  const wantsSoleProp = hasAny(norm, ["sole", "thani", "individual", "proprietor", "partnership", "hawul", "තනි පුද්ගල", "හවුල්"]);
  const wantsDocsOrTime = hasAny(norm, ["document", "documents", "docs", "monada ona", "monawada ona", "time", "dawas", "how long", "ලේඛන", "දින"]);

  if (wantsPvtLtd && !hasAny(norm, ["price", "cost", "keeyada", "kiyada", "ganan", "fee"])) {
    return {
      text: sin
        ? `**Pvt Ltd සමාගමක් (Private Limited)** ලියාපදිංචි කිරීම අපි eROC හරහා සම්පූර්ණයෙන්ම කරලා දෙනවා. සාමාන්‍යයෙන් **වැඩ කරන දින 3–7ක්** ඇතුළත සහතික ලැබෙනවා.

අවශ්‍ය මූලික දේවල්:
- Directors ලගේ NIC / Passport copy
- සමාගමට යෝජිත නම් 2–3ක්
- ලිපිනය, Email සහ දුරකථන අංක

Form 1, 18, 19, Articles සහ Bank account papers සේරම අපි හදලා දෙනවා.`
        : `We handle **Private Limited (Pvt Ltd)** incorporation end-to-end via eROC under the Companies Act No. 07 of 2007, typically completed within **3–7 business days**.

You'll mainly need:
- NIC / Passport copies of Directors & Shareholders
- 2–3 preferred company names
- Registered office address & contact details

We prepare Form 1, Form 18, Form 19, Articles of Association, and bank account setup docs.`,
      topic: "pvt_ltd",
      actions: [
        { label: "💬 Pvt Ltd Quote (WhatsApp)", url: site.whatsappHref, variant: "whatsapp" },
        { label: "📝 Apply Online", url: "/consultation?service=business-registration", variant: "primary" },
      ],
      suggestions: sin
        ? ["Pvt Ltd ගාස්තු කොහොමද?", "TIN Number ගන්න ඕනද?", "Bank account documents හදනවද?"]
        : ["How much does Pvt Ltd cost?", "Do I also get a TIN number?", "Book a consultation"],
    };
  }

  if (wantsSoleProp) {
    return {
      text: sin
        ? `**තනි පුද්ගල (Sole Proprietorship)** හෝ **හවුල් (Partnership)** ව්‍යාපාරයක් නම් ප්‍රාදේශීය ලේකම් කාර්යාලය (Divisional Secretariat) හරහා ලියාපදිංචි කරන්න ඕන.

මේකට සාමාන්‍යයෙන් **NIC copy**, **ග්‍රාම නිලධාරී සහතිකය**, සහ ව්‍යාපාර ස්ථානයේ **ඔප්පුව හෝ කුලී ගිවිසුම** අවශ්‍ය වෙනවා. සම්පූර්ණ ලේඛන ටික නිවැරදිව සකස් කරලා registration එක කරගන්න අපි උදව් කරනවා.`
        : `For a **Sole Proprietorship** or **Partnership**, registration is done through the local Divisional Secretariat.

You typically need your **NIC copy**, **Grama Niladhari certificate**, and **property deed or lease/consent letter**. We help prepare all paperwork and guide you cleanly through the approval process.`,
      topic: "sole_prop",
      actions: [
        { label: "💬 WhatsApp (076 430 3421)", url: site.whatsappHref, variant: "whatsapp" },
        { label: "📝 Get Assistance", url: "/consultation?service=business-registration", variant: "primary" },
      ],
      suggestions: sin
        ? ["Sole Proprietor vs Pvt Ltd වෙනස මොකක්ද?", "ගාස්තු කොහොමද?", "TIN Number ගන්නේ කොහොමද?"]
        : ["Sole Proprietor vs Pvt Ltd?", "What are the fees?", "TIN Registration"],
    };
  }

  if (wantsDocsOrTime && (lastTopic === "registration" || lastTopic === "pvt_ltd" || lastTopic === "sole_prop")) {
    return {
      text: sin
        ? `ලියාපදිංචියට සාමාන්‍යයෙන් **දින 3–7ක්** (Pvt Ltd) වගේ කාලයක් යන්නේ.

මූලිකව ඕන වෙන්නේ:
- Directors / Owners ලගේ NIC copies
- යෝජිත ව්‍යාපාර නාමය
- ලිපිනය හා contact details (Email / Phone)

ඔයාගේ NIC එකේ photo එකක් එක්ක WhatsApp එකට msg එකක් දැම්මොත් අපිට අදම නම check කරලා වැඩේ පටන් ගන්න පුළුවන්.`
        : `Registration typically takes **3–7 working days** for a Pvt Ltd once the name is approved.

Basic requirements:
- NIC / Passport copies of owners/directors
- Preferred business name options
- Registered business address, email & phone

Send us a message on **WhatsApp (076 430 3421)** and we can check name availability right away!`,
      topic: lastTopic,
      actions: [
        { label: "💬 Check Name on WhatsApp", url: site.whatsappHref, variant: "whatsapp" },
      ],
    };
  }

  // 5. PRICING / FEES / COSTS (Context-Aware!)
  const asksPrice = hasAny(norm, [
    "price", "pricing", "fee", "fees", "cost", "charge", "charges", "rate", "rates", "quotation", "quote",
    "kiyada", "keeyada", "keeyak", "ganan", "salli", "මිල", "ගාස්තු", "කීයද", "මුදල",
  ]);

  if (asksPrice) {
    let contextNoteSin = "ඔබේ ව්‍යාපාරයේ පරිමාව සහ අවශ්‍යතාවය අනුව අපි ඉතා සාධාරණ, සැඟවුණු ගාස්තු නැති packages ලබාදෙනවා.";
    let contextNoteEn = "We keep our pricing transparent and tailored to your exact business scale, with no hidden charges.";

    if (lastTopic === "registration" || lastTopic === "pvt_ltd" || wantsPvtLtd) {
      contextNoteSin = "Pvt Ltd හෝ BR ලියාපදිංචි ගාස්තු තීරණය වන්නේ රජයේ ගාස්තු සහ ව්‍යාපාර වර්ගය අනුවයි. අපි ඉතා සාධාරණ package එකක් දෙනවා.";
      contextNoteEn = "Registration fees depend on the entity type (Sole Prop vs Pvt Ltd) and official government/eROC stamp charges.";
    } else if (lastTopic === "accounting" || hasAny(norm, ["account", "ginum", "tax"])) {
      contextNoteSin = "මාසික Accounting ගාස්තු තීරණය වන්නේ ඔබේ මාසික ගනුදෙනු ප්‍රමාණය (transactions) සහ සේවක සංඛ්‍යාව අනුවයි — කුඩා ව්‍යාපාර සඳහා ඉතා අඩු මාසික පැකේජ තියෙනවා.";
      contextNoteEn = "Monthly accounting packages are priced based on your monthly transaction volume and payroll size, with very affordable plans for small businesses.";
    } else if (lastTopic === "it" || hasAny(norm, ["website", "web", "pos", "software"])) {
      contextNoteSin = "Website හෝ POS software වල මිල තීරණය වන්නේ ඔබට අවශ්‍ය features (Pages ගණන, E-commerce, Billing features) අනුවයි.";
      contextNoteEn = "Website and POS/software costs depend on your specific features (corporate site vs e-commerce vs custom POS/ERP).";
    }

    return {
      text: sin
        ? `${contextNoteSin}

**පළමු සාකච්ඡාව සහ Quotation එක 100% නොමිලේ!** ඔබේ අවශ්‍යතාවය කෙටියෙන් WhatsApp (**076 430 3421**) එකට දැම්මොත් විනාඩි කිහිපයකින් නිශ්චිත මිල ගණන් (Quotation) ලබාගන්න පුළුවන්.`
        : `${contextNoteEn}

**Your initial consultation & quotation is 100% free.** Send your brief requirement to **WhatsApp (076 430 3421)** to get an instant itemized quote.`,
      topic: lastTopic ?? "pricing",
      actions: [
        { label: "💬 Get Instant Quote (WhatsApp)", url: site.whatsappHref, variant: "whatsapp" },
        { label: "📝 Free Consultation", url: "/consultation", variant: "primary" },
      ],
      suggestions: sin
        ? ["WhatsApp එකෙන් අහන්න", "Direct Call (071 405 3449)", "සේවාවන් මොනවද?"]
        : ["Message on WhatsApp", "Call 071 405 3449", "Explore all services"],
    };
  }

  // 6. CONTACT DETAILS
  if (
    hasAny(norm, [
      "contact", "phone", "call", "whatsapp", "watsapp", "email", "mail", "number", "no",
      "kathakaranna", "අංකය", "දුරකථන", "ඇමතුම්", "සම්බන්ධ",
    ])
  ) {
    return {
      text: sin
        ? `ඔබට පහසු ඕනෑම ක්‍රමයකින් අපිව සම්බන්ධ කරගන්න පුළුවන්:

- ⚡ **WhatsApp (ඉක්මන්ම ප්‍රතිචාර):** **076 430 3421**
- 📞 **Voice / Direct Call:** **071 405 3449**
- 📧 **Email:** **tvclaritycapital@gmail.com**
- 📍 **ලිපිනය:** Monaragala, Sri Lanka (දිවයින පුරා Online සේවා)`
        : `You can reach us directly through these channels:

- ⚡ **WhatsApp (Fastest Response):** **076 430 3421**
- 📞 **Voice Call:** **071 405 3449**
- 📧 **Email:** **tvclaritycapital@gmail.com**
- 📍 **Location:** Monaragala, Sri Lanka (Island-wide online service)`,
      topic: "contact",
      actions: [
        { label: "💬 WhatsApp: 076 430 3421", url: site.whatsappHref, variant: "whatsapp" },
        { label: "📞 Call: 071 405 3449", url: site.phoneHref, variant: "primary" },
        { label: "📧 Email", url: `mailto:${site.email}`, variant: "outline" },
      ],
    };
  }

  // 7. BUSINESS REGISTRATION (GENERAL)
  if (
    hasAny(norm, [
      "register", "registration", "br", "ලියාපදිංචි", "ව්‍යාපාර", "business",
    ]) &&
    !hasAny(norm, ["plan", "loan", "consult", "website", "account"])
  ) {
    return {
      text: sin
        ? `අපි **Sole Proprietorship**, **Partnership**, සහ **Pvt Ltd (eROC)** ඇතුළු සියලුම ව්‍යාපාර ලියාපදිංචි කිරීම් මුල සිට අගටම කරලා දෙනවා — **TIN අංකය** සහ **Bank account documents** එක්කම.

ඔබ ආරම්භ කරන්න බලාපොරොත්තු වෙන්නේ **තනි පුද්ගල ව්‍යාපාරයක් (Sole Proprietor)** ද, නැත්නම් **Pvt Ltd සමාගමක්** ද?`
        : `We handle all Sri Lankan business registrations from start to finish — including **Sole Proprietorship**, **Partnership**, **Private Limited (Pvt Ltd)** via eROC, **TIN registration**, and bank account documentation.

Are you looking to register as a **Sole Proprietor** or a **Pvt Ltd company**?`,
      topic: "registration",
      actions: [
        { label: "💬 WhatsApp (076 430 3421)", url: site.whatsappHref, variant: "whatsapp" },
        { label: "විස්තර බලන්න", url: "/services/business-registration", variant: "outline" },
      ],
      suggestions: sin
        ? ["Pvt Ltd එකක් හදන්න ඕන", "තනි පුද්ගල ව්‍යාපාරයක්", "ගාස්තු කොහොමද?"]
        : ["Register a Pvt Ltd", "Sole Proprietorship", "What are the fees?"],
    };
  }

  // 8. TIN & TAXES
  if (hasAny(norm, ["tin", "tax", "ramis", "ird", "vat", "sscl", "apit", "බදු", "ආදායම් බදු"])) {
    return {
      text: sin
        ? `ඔව්, අපි **IRD TIN Number Registration**, **RAMIS ගිණුම් සැකසීම**, සහ **Income Tax / VAT / SSCL / APIT** වාර්තා නියමිත දිනට පෙර නිවැරදිව සකස් කරලා දෙනවා.

දැන් ලංකාවේ සියලුම ව්‍යාපාර හා වයස 18+ පුද්ගලයින්ට TIN අංකය අනිවාර්ය නිසා අපිට ඉක්මනින්ම ඔබේ TIN එකත් හදලා දෙන්න පුළුවන්.`
        : `Yes! We assist with **IRD TIN Registration**, **RAMIS portal setup**, and timely preparation of **Income Tax, VAT, SSCL, and APIT** filings.

Need help getting your TIN number or sorting out your business taxes?`,
      topic: "tin_tax",
      actions: [
        { label: "💬 WhatsApp Tax Help", url: site.whatsappHref, variant: "whatsapp" },
        { label: "📝 Book Tax Consultation", url: "/consultation?service=accounting", variant: "primary" },
      ],
      suggestions: sin
        ? ["TIN එකක් ගන්න මොනවද ඕන?", "මාසික Accounting සේවා", "ගාස්තු කොහොමද?"]
        : ["Documents for TIN", "Monthly Accounting Services", "Tax Filing Fees"],
    };
  }

  // 9. ACCOUNTING & BOOKKEEPING & PAYROLL
  if (
    hasAny(norm, [
      "account", "accounting", "bookkeep", "bookkeeping", "p&l", "balance sheet", "financial statement",
      "payroll", "epf", "etf", "salary", "ginum", "ගිණුම්", "වැටුප්",
    ])
  ) {
    return {
      text: sin
        ? `අපේ **Accounting Services** යටතේ දෛනික/මාසික Bookkeeping, **Profit & Loss**, **Balance Sheet**, **Cash Flow Statements**, සහ **Payroll (EPF/ETF)** සියල්ලම සිදුකර දෙනවා.

කුඩා වෙළඳසැලක සිට Pvt Ltd සමාගම් දක්වා ඕනෑම ව්‍යාපාරයකට ගැලපෙන සරල මාසික packages අපි ලබාදෙනවා. ඔබේ ව්‍යාපාරය කුමන ආකාරයේ එකක්ද?`
        : `Our **Accounting Services** cover daily/monthly bookkeeping, **Profit & Loss**, **Balance Sheets**, **Cash Flow Statements** (LKAS/SLFRS), **Management Accounts**, and **Payroll / EPF & ETF**.

We offer flexible monthly packages scaled to startups, retail shops, and established Pvt Ltd companies.`,
      topic: "accounting",
      actions: [
        { label: "💬 WhatsApp (076 430 3421)", url: site.whatsappHref, variant: "whatsapp" },
        { label: "Accounting Details", url: "/services/accounting", variant: "outline" },
      ],
      suggestions: sin
        ? ["මාසික ගාස්තු කොහොමද?", "Tax & RAMIS වැඩ කරනවද?", "Audit සේවා ගැන"]
        : ["Monthly package rates", "Do you handle Tax & RAMIS?", "Internal Audit Services"],
    };
  }

  // 10. AUDITING
  if (hasAny(norm, ["audit", "auditing", "internal control", "viganana", "විගණන", "පරීක්ෂා"])) {
    return {
      text: sin
        ? `ව්‍යාපාරයේ මුදල් අවභාවිතයන්, වැරදි සහ stock අඩුපාඩු වළක්වා ගැනීමට අපි **Internal Audits**, **Internal Controls Review**, සහ **Statutory Audit Readiness** සේවාවන් සපයනවා.

වාර්ෂික විගණනයට පෙර ඔබේ ගිණුම් පොත් සම්පූර්ණයෙන්ම පරීක්ෂා කර සූදානම් කර දීමටත් අපි සූදානම්.`
        : `We provide **Internal Audits**, **Internal Controls & Stock Reviews**, and **Financial Health Checks** to prevent leakages and ensure your books are 100% ready for external statutory audits.`,
      topic: "auditing",
      actions: [
        { label: "💬 WhatsApp (076 430 3421)", url: site.whatsappHref, variant: "whatsapp" },
        { label: "Auditing Details", url: "/services/auditing-financial", variant: "outline" },
      ],
    };
  }

  // 11. IT SOLUTIONS / WEBSITES / POS / SOFTWARE
  if (
    hasAny(norm, [
      "it", "website", "web", "software", "pos", "erp", "billing", "app", "system", "digital",
      "වෙබ්", "මෘදුකාංග", "තාක්ෂණ",
    ])
  ) {
    return {
      text: sin
        ? `අපි ඔබේ ව්‍යාපාරයටම ගැලපෙන **Modern Websites**, **Cloud POS & Billing Systems**, **Inventory Software**, සහ **Custom Web Applications** නිර්මාණය කර දෙනවා.

ඔබට හදන්න අවශ්‍ය **Website එකක්** ද, නැත්නම් Shop/Business එකකට **POS / Billing Software එකක්** ද? කිව්වොත් මම විස්තර සහ මිල ගණන් ගැන කියන්නම්.`
        : `We build modern, mobile-friendly **Business Websites**, **Cloud POS & Billing Software**, **Inventory/ERP systems**, and **Custom Web Applications**.

Are you looking for a **website** or a **POS / business software solution**?`,
      topic: "it",
      actions: [
        { label: "💬 Discuss on WhatsApp", url: site.whatsappHref, variant: "whatsapp" },
        { label: "IT Solutions", url: "/services/it-solutions", variant: "outline" },
      ],
      suggestions: sin
        ? ["Website එකක් හදන්න කීයද?", "POS Billing Software ගැන", "Free Consultation එකක්"]
        : ["Website pricing", "POS software features", "Request IT consultation"],
    };
  }

  // 12. BUSINESS CONSULTING / LOANS / PLANS
  if (
    hasAny(norm, [
      "consult", "consulting", "plan", "loan", "proposal", "bank", "feasibility", "strategy", "startup",
      "උපදේශන", "ණය", "ව්‍යාපෘති",
    ])
  ) {
    return {
      text: sin
        ? `බැංකු ණය (BOC, People's Bank, Commercial, HNB ආදී) හෝ ආයෝජකයින් සඳහා පිළිගත් **Business Plans / Project Reports**, **Feasibility Studies**, සහ **Startup උපදේශන** සේවාවන් අපි සපයනවා.

ඔබට බැංකු ණයක් සඳහා Project Report එකක් හදන්නද, නැත්නම් ව්‍යාපාරය දියුණු කරගැනීමේ උපදෙස්ද අවශ්‍ය?`
        : `We prepare bank-ready **Business Plans & Project Reports** (for BOC, People's Bank, Commercial, HNB, etc.), **Feasibility Studies**, and provide practical **Business & Startup Consulting**.

Tell me briefly what your goal is, or chat directly on WhatsApp!`,
      topic: "consulting",
      actions: [
        { label: "💬 WhatsApp (076 430 3421)", url: site.whatsappHref, variant: "whatsapp" },
        { label: "Consulting Details", url: "/services/business-consulting", variant: "outline" },
      ],
    };
  }

  // 13. LOCATION / ISLANDWIDE / ONLINE
  if (
    hasAny(norm, [
      "location", "office", "address", "where", "monaragala", "colombo", "kandy", "galle", "online",
      "island", "koheda", "kothanada", "කොහෙද", "ලිපිනය", "මොනරාගල",
    ])
  ) {
    return {
      text: sin
        ? `අපේ ප්‍රධාන කාර්යාලය **මොනරාගල (Monaragala)** පිහිටා තිබුණත්, WhatsApp, Email සහ Online Consultations හරහා **ලංකාවේ ඕනෑම පළාතක (Colombo, Kandy, Galle ඇතුළුව)** සිටින අයට 100% Online අපේ සේවාවන් ලබාගන්න පුළුවන්!

**කාර්යාල වේලාවන්:** සඳුදා – සෙනසුරාදා පෙ.ව. 8:30 – ප.ව. 5:30.`
        : `Our headquarters is in **Monaragala, Sri Lanka**, and we serve clients **100% online across all 9 provinces** (including Colombo, Kandy, Galle, etc.) via WhatsApp, Email, and digital submissions.

**Hours:** Mon – Sat, 8:30 AM – 5:30 PM.`,
      topic: "location",
      actions: [
        { label: "💬 WhatsApp (076 430 3421)", url: site.whatsappHref, variant: "whatsapp" },
        { label: "📍 Contact Page", url: "/contact", variant: "outline" },
      ],
    };
  }

  // 14. CONSULTATION BOOKING
  if (hasAny(norm, ["consultation", "book", "appointment", "meet", "සාකච්ඡා", "හමුවෙන්න"])) {
    return {
      text: sin
        ? `ඔබට දැන්ම Consultation එකක් වෙන් කරගන්න පුළුවන්:
1. **⚡ WhatsApp (ඉක්මන්ම):** **076 430 3421** වෙත පණිවිඩයක් එවන්න.
2. **📝 Online Form:** පහත button එක click කර විස්තර එවන්න.
3. **📞 Direct Call:** **071 405 3449** අමතන්න.`
        : `You can book a free consultation in seconds:
1. **⚡ WhatsApp (Fastest):** Message **076 430 3421**
2. **📝 Online Form:** Click below to submit your request
3. **📞 Voice Call:** **071 405 3449**`,
      topic: "consultation",
      actions: [
        { label: "💬 WhatsApp (076 430 3421)", url: site.whatsappHref, variant: "whatsapp" },
        { label: "📝 Consultation Form", url: "/consultation", variant: "primary" },
      ],
    };
  }

  // 15. ABOUT COMPANY / SERVICES LIST
  if (hasAny(norm, ["about", "services", "service", "clarity", "who", "what do you do", "සේවා", "විස්තර", "කවුද"])) {
    return {
      text: sin
        ? `**TV Clarity Capital (Pvt) Ltd** කියන්නේ මොනරාගල මූලික කරගත්, දිවයින පුරා සේවා සපයන මූල්‍ය, ව්‍යාපාර හා IT උපදේශන ආයතනයක්.

අපේ ප්‍රධාන සේවා 5:
1. **🏢 Business Registration** (Pvt Ltd, BR, TIN)
2. **📊 Accounting & Tax** (Bookkeeping, P&L, EPF/ETF, RAMIS)
3. **🔍 Auditing** (Internal Audits & Financial Health)
4. **💡 Business Consulting** (Bank Loan Plans & Strategy)
5. **💻 IT Solutions** (Websites, POS & Software)

මේ අතරින් ඔබට වැඩිදුර දැනගන්න ඕන මොන සේවාව ගැනද?`
        : `**TV Clarity Capital (Pvt) Ltd** provides integrated finance, corporate, and technology solutions from Monaragala across Sri Lanka:

1. **🏢 Business Registration** (Pvt Ltd, Sole Prop, TIN)
2. **📊 Accounting & Tax** (Bookkeeping, P&L, Payroll, RAMIS)
3. **🔍 Auditing & Assurance** (Internal Audits & Controls)
4. **💡 Business Consulting** (Bank Loan Plans & Strategy)
5. **💻 IT Solutions** (Websites, POS & Custom Software)

Which area would you like to know more about?`,
      actions: [
        { label: "💬 WhatsApp (076 430 3421)", url: site.whatsappHref, variant: "whatsapp" },
        { label: "View All Services", url: "/services", variant: "outline" },
      ],
      suggestions: sin
        ? ["Business Registration ගැන", "Accounting & Tax ගැන", "Website / POS Software ගැන", "ගාස්තු කොහොමද?"]
        : ["Company Registration", "Accounting & Tax", "Websites & Software", "Pricing"],
    };
  }

  // 16. SMART CONVERSATIONAL FALLBACK
  return {
    text: sin
      ? `හොඳයි, ඔබ අසන කාරණය ගැන අපේ කණ්ඩායමට ඉතාම නිවැරදිව උදව් කරන්න පුළුවන්. 

ඔබට Business Registration, Accounting/Tax, Auditing, Bank Loan Plans, හෝ Website/Software සම්බන්ධයෙන් දැනගන්න ඕන නම් කෙටියෙන් ඒ ගැන අහන්න — නැත්නම් කෙලින්ම **076 430 3421** WhatsApp එකට msg එකක් දාන්න!`
      : `I'd love to help you with that! Could you let me know which area your question relates to (**Business Registration**, **Accounting & Tax**, **Auditing**, **Consulting**, or **IT Solutions**)?

Or for an immediate human response, message us directly on **WhatsApp (076 430 3421)**!`,
    topic: lastTopic,
    actions: [
      { label: "💬 WhatsApp (076 430 3421)", url: site.whatsappHref, variant: "whatsapp" },
      { label: "📞 Call (071 405 3449)", url: site.phoneHref, variant: "outline" },
    ],
    suggestions: sin
      ? ["Business Registration", "Accounting & Tax", "Website / Software", "Contact Details"]
      : ["Business Registration", "Accounting & Tax", "IT & Websites", "Contact Us"],
  };
}

/**
 * Generates a response — uses live Google Gemini API when VITE_GEMINI_API_KEY
 * is configured, and seamlessly uses the intelligent built-in conversational
 * engine otherwise so it always responds reliably in real time.
 */
export async function generateBotReplyAsync(userPrompt: string, history: Message[]): Promise<BotResponse> {
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim();

  if (apiKey) {
    try {
      const contents = [
        ...history.slice(-8).map((m) => ({
          role: m.sender === "user" ? "user" : "model",
          parts: [{ text: m.text }],
        })),
        { role: "user", parts: [{ text: userPrompt }] },
      ];

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: COMPANY_SYSTEM_PROMPT }] },
            contents,
            generationConfig: { temperature: 0.5, maxOutputTokens: 350 },
          }),
        },
      );

      if (res.ok) {
        const data = (await res.json()) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        };
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (aiText) {
          const localMeta = generateLocalReply(userPrompt, history);
          return {
            text: aiText,
            topic: localMeta.topic,
            actions: localMeta.actions,
            suggestions: localMeta.suggestions,
          };
        }
      }
    } catch {
      // Seamless fallback to local engine
    }
  }

  return generateLocalReply(userPrompt, history);
}
