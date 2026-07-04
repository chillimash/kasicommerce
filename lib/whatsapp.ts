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
  // KasiComply states
  | 'TT_Q1'
  | 'TT_Q2'
  | 'TT_Q3'
  | 'TT_RESULT'
  | 'TT_HOW_REGISTER'
  | 'CALC_Q1'
  | 'CALC_Q2'
  | 'CALC_RESULT'
  | 'PAYE_Q1'
  | 'PAYE_Q2'
  | 'PAYE_RESULT'
  | 'CALENDAR_VIEW'

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
    STORE_MENU:     `🛒 *KasiStore*\n\n1️⃣ View my products\n2️⃣ Add a product\n3️⃣ Share my store link\n4️⃣ View orders\n\nReply with a number.`,
    CREDIT_MENU:    `💰 *KasiCredit*\n\nBased on your transaction history, you may qualify for a business loan from R1,000 to R50,000.\n\n1️⃣ Check my eligibility\n2️⃣ Apply now\n3️⃣ Learn more\n\nReply with a number.`,
    UNKNOWN:        `I didn't understand that. Type *MENU* to see your options.`,
    // KasiComply flows
    COMPLY_MENU:       `📊 *KasiComply — Tax & Compliance*\n\n1️⃣ Check if I qualify for Turnover Tax\n2️⃣ Calculate my tax liability\n3️⃣ View my compliance calendar\n4️⃣ PAYE & employee costs\n5️⃣ My upcoming deadlines\n\nType *MENU* to go back.`,
    TT_Q1:             `📋 *Turnover Tax Qualifier*\n\nQuestion 1 of 3:\n\nWhat is your estimated *annual turnover* (total sales per year)?\n\nReply with the amount in Rands.\n(e.g. 450000 for R450,000)`,
    TT_Q2:             `Question 2 of 3:\n\nDo you own or run *more than one business*?\n\n1️⃣ No — just this one\n2️⃣ Yes — I have other businesses`,
    TT_Q3:             `Question 3 of 3:\n\nIs your business a *public company* (listed on a stock exchange)?\n\n1️⃣ No — it's a small private business\n2️⃣ Yes — it's a public company`,
    TT_QUALIFIES:      `✅ *Great news! You qualify for Turnover Tax.*\n\nTurnover Tax replaces 3 separate taxes with one simple annual payment:\n• Income Tax\n• Provisional Tax\n• Capital Gains Tax\n\nBased on your turnover, your estimated tax is:\n*{amount}*\n\nThis is due once a year on 28 February.\n\n1️⃣ How do I register?\n2️⃣ Calculate my exact amount\n3️⃣ Back to menu`,
    TT_NOT_QUALIFY:    `ℹ️ *Turnover Tax Assessment*\n\nBased on your answers, you do not qualify for Turnover Tax at this time.\n\nReason: {reason}\n\nYou will need to file under the standard tax system.\n\n1️⃣ Learn about standard tax\n2️⃣ Back to menu`,
    TT_HOW_REGISTER:   `📝 *How to Register for Turnover Tax*\n\n1. Go to sars.gov.za or the SARS MobiApp\n2. Log in to your eFiling profile\n3. Select *"Register for Turnover Tax"*\n4. Complete the TT01 form\n\nYou can also register via the SARS Online Query System (SOQS).\n\n✅ Registration is free.\n\nType *MENU* to go back.`,
    CALC_Q1:           `💰 *Tax Liability Calculator*\n\nWhat was your *total income* this month?\n\nReply with the amount in Rands.\n(e.g. 12500)`,
    CALC_Q2:           `What were your *total expenses* this month?\n\n(e.g. 4200 for R4,200)\nReply 0 if none.`,
    CALC_RESULT:       `📊 *Your Tax Summary*\n\n💚 Income:   R{income}\n🔴 Expenses: R{expenses}\n📈 Profit:   R{profit}\n\n*Estimated Tax*\n{tax_detail}\n\nThis is an estimate. Type *COMPLY* for full calendar.\n\nType *MENU* to go back.`,
    PAYE_Q1:           `👥 *PAYE & Employee Costs*\n\nHow many employees do you have?\n\nReply with the number (e.g. 2)`,
    PAYE_Q2:           `What is the *monthly salary* for your employee?\n\n(If multiple employees, enter the total monthly payroll)\n\nReply with the amount in Rands.`,
    PAYE_RESULT:       `💼 *Employee Cost Breakdown*\n\n*Gross Salary:* R{gross}\n\n*Deductions (from employee):*\n• PAYE: R{paye}\n• UIF:  R{uif_ee}\n\n*Net Pay to Employee: R{net}*\n\n*Your employer costs:*\n• UIF: R{uif_er}\n• SDL: R{sdl}\n\n*Total Cost to You: R{total}*\n\nDue to SARS by the 7th of each month.\n\nType *MENU* to go back.`,

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
