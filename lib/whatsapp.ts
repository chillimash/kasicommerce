import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID!
const authToken  = process.env.TWILIO_AUTH_TOKEN!
const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER! // e.g. whatsapp:+14155238886

export const twilioClient = twilio(accountSid, authToken)

export async function sendWhatsApp(to: string, body: string) {
  return twilioClient.messages.create({
    from: fromNumber,
    to: `whatsapp:${to}`,
    body,
  })
}

export async function sendWhatsAppTemplate(
  to: string,
  templateSid: string,
  variables: Record<string, string>
) {
  return twilioClient.messages.create({
    from: fromNumber,
    to: `whatsapp:${to}`,
    contentSid: templateSid,
    contentVariables: JSON.stringify(variables),
  })
}

// ─── Bot State Machine ───────────────────────────────────────────────────────
export type BotState =
  | 'WELCOME'
  | 'AWAIT_LANGUAGE'
  | 'AWAIT_NAME'
  | 'AWAIT_BUSINESS_NAME'
  | 'AWAIT_BUSINESS_TYPE'
  | 'MAIN_MENU'
  | 'BOOKS_LOG_TYPE'
  | 'BOOKS_LOG_AMOUNT'
  | 'BOOKS_LOG_DESC'
  | 'BOOKS_CONFIRM'
  | 'STORE_MENU'
  | 'COMPLY_MENU'
  | 'CREDIT_MENU'

export const MESSAGES: Record<string, Record<string, string>> = {
  en: {
    WELCOME:        `👋 Welcome to *KasiCommerce* — your business assistant!\n\nChoose your language:\n1️⃣ English\n2️⃣ isiZulu\n3️⃣ isiXhosa\n4️⃣ Sesotho\n5️⃣ Afrikaans`,
    AWAIT_NAME:     `What is your name?`,
    AWAIT_BIZ_NAME: `What is the name of your business?`,
    AWAIT_BIZ_TYPE: `What type of business do you run?\n\n1️⃣ Spaza / General dealer\n2️⃣ Hair & Beauty\n3️⃣ Food & Catering\n4️⃣ Clothing & Textiles\n5️⃣ Services (repairs, cleaning, etc)\n6️⃣ Other`,
    MAIN_MENU:      `🏠 *Main Menu*\n\n1️⃣ 📒 KasiBooks — Log income or expense\n2️⃣ 📊 KasiComply — Tax & compliance\n3️⃣ 🛒 KasiStore — My online store\n4️⃣ 💰 KasiCredit — Apply for a loan\n5️⃣ 📈 Reports — View my summary\n\nReply with a number to continue.`,
    LOG_TYPE:       `What do you want to record?\n\n1️⃣ 💚 Income (money in)\n2️⃣ 🔴 Expense (money out)`,
    LOG_AMOUNT:     `How much? (e.g. 150)`,
    LOG_DESC:       `What was it for? (e.g. "sold 3 chickens" or "bought cooking oil")`,
    LOG_CONFIRM:    `✅ Got it! Reply *YES* to save or *NO* to cancel.`,
    LOG_SAVED:      `✅ Saved! Type *MENU* to go back.`,
    LOG_CANCEL:     `Cancelled. Type *MENU* to go back.`,
    COMPLY_MENU:    `📊 *KasiComply*\n\n1️⃣ PAYE calculator\n2️⃣ VAT summary\n3️⃣ UIF / SDL overview\n4️⃣ My upcoming deadlines\n\nReply with a number.`,
    STORE_MENU:     `🛒 *KasiStore*\n\n1️⃣ View my products\n2️⃣ Add a product\n3️⃣ Share my store link\n4️⃣ View orders\n\nReply with a number.`,
    CREDIT_MENU:    `💰 *KasiCredit*\n\nBased on your transaction history, you may qualify for a business loan from R1,000 to R50,000.\n\n1️⃣ Check my eligibility\n2️⃣ Apply now\n3️⃣ Learn more\n\nReply with a number.`,
    UNKNOWN:        `I didn't understand that. Type *MENU* to see your options.`,
  },
  zu: {
    WELCOME:        `👋 Sawubona! Wamukelekile ku-*KasiCommerce*!\n\nKhetha ulimi lwakho:\n1️⃣ English\n2️⃣ isiZulu\n3️⃣ isiXhosa\n4️⃣ Sesotho\n5️⃣ Afrikaans`,
    AWAIT_NAME:     `Ubani igama lakho?`,
    AWAIT_BIZ_NAME: `Ubani igama leshishini lakho?`,
    AWAIT_BIZ_TYPE: `Uhlobo luni lweshishini owenza lona?\n\n1️⃣ Spaza / Isitolo\n2️⃣ Inwele & Ubuhle\n3️⃣ Ukudla & Ukupheka\n4️⃣ Izingubo\n5️⃣ Izinsizakalo\n6️⃣ Okunye`,
    MAIN_MENU:      `🏠 *Imenyu Eyinhloko*\n\n1️⃣ 📒 KasiBooks — Rekhoda imali\n2️⃣ 📊 KasiComply — Intela\n3️⃣ 🛒 KasiStore — Isitolo sami\n4️⃣ 💰 KasiCredit — Cela imalimboleko\n5️⃣ 📈 Imibiko\n\nPhendula ngenombolo.`,
    UNKNOWN:        `Angizwanga. Thayipha *MENU* ukubona izinketho zakho.`,
  },
}

export function getMessage(state: string, lang: string): string {
  const msgs = MESSAGES[lang] || MESSAGES['en']
  return msgs[state] || MESSAGES['en'][state] || MESSAGES['en']['UNKNOWN']
}
