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
  | 'STOKVEL_MENU'
  | 'STOKVEL_CREATE_Q1'
  | 'STOKVEL_CREATE_Q2'
  | 'STOKVEL_CREATE_Q3'
  | 'STOKVEL_CREATE_Q4'
  | 'STOKVEL_CONTRIBUTE_SELECT'
  | 'STOKVEL_CONTRIBUTE_WHO'
  | 'STOKVEL_CONTRIBUTE_AMOUNT'

export const MESSAGES: Record<string, Record<string, string>> = {

  // ─── ENGLISH ────────────────────────────────────────────────────────────────
  en: {
    WELCOME:        `👋 Welcome to *KasiCommerce* — your business assistant!\n\nChoose your language:\n1️⃣ English\n2️⃣ isiZulu\n3️⃣ isiXhosa\n4️⃣ Sesotho\n5️⃣ Afrikaans\n6️⃣ Tshivenḓa`,
    AWAIT_NAME:     `What is your name?`,
    AWAIT_BIZ_NAME: `What is the name of your business?`,
    AWAIT_BIZ_TYPE: `What type of business do you run?\n\n1️⃣ Spaza / General dealer\n2️⃣ Hair & Beauty\n3️⃣ Food & Catering\n4️⃣ Clothing & Textiles\n5️⃣ Services\n6️⃣ Other`,
    MAIN_MENU: `🏠 *Main Menu*\n\n1️⃣ 📒 KasiBooks — Log income or expense\n2️⃣ 📊 KasiComply — Tax & compliance\n3️⃣ 🛒 KasiStore — My online store\n4️⃣ 💰 KasiCredit — Apply for a loan\n5️⃣ 📈 Reports — View my summary\n6️⃣ 🤝 KasiStokvel — Group savings\n\nReply with a number.`,
    // MAIN_MENU:      `🏠 *Main Menu*\n\n1️⃣ 📒 KasiBooks — Log income or expense\n2️⃣ 📊 KasiComply — Tax & compliance\n3️⃣ 🛒 KasiStore — My online store\n4️⃣ 💰 KasiCredit — Apply for a loan\n5️⃣ 📈 Reports — View my summary\n\nReply with a number.`,
    LOG_TYPE:       `What do you want to record?\n\n1️⃣ 💚 Income (money in)\n2️⃣ 🔴 Expense (money out)\n3️⃣ 🏠 Main Menu`,
    LOG_AMOUNT:     `How much? (e.g. 150)`,
    LOG_DESC:       `What was it for? (e.g. "sold 3 chickens")`,
    LOG_SAVED:      `✅ Saved!\n\n1️⃣ Capture Income\n2️⃣ Capture Expense\n3️⃣ Main Menu`,
    LOG_CANCEL:     `Cancelled.\n\n1️⃣ Capture Income\n2️⃣ Capture Expense\n3️⃣ Main Menu`,
    COMPLY_MENU:    `📊 *KasiComply — Tax & Compliance*\n\n1️⃣ Check if I qualify for Turnover Tax\n2️⃣ Calculate my tax liability\n3️⃣ View my compliance calendar\n4️⃣ PAYE & employee costs\n5️⃣ My upcoming deadlines\n\nType *MENU* to go back.`,
    TT_Q1:          `📋 *Turnover Tax Qualifier*\n\nQuestion 1 of 3:\n\nWhat is your estimated *annual turnover* (total sales per year)?\n\nReply with the amount in Rands. (e.g. 450000)`,
    TT_Q2:          `Question 2 of 3:\n\nDo you own or run *more than one business*?\n\n1️⃣ No — just this one\n2️⃣ Yes — I have other businesses`,
    TT_Q3:          `Question 3 of 3:\n\nIs your business a *public company*?\n\n1️⃣ No — it's a small private business\n2️⃣ Yes — it's a public company`,
    TT_QUALIFIES:   `✅ *Great news! You qualify for Turnover Tax.*\n\nTurnover Tax replaces 3 separate taxes with one simple annual payment.\n\nYour estimated tax: *{amount}*\nDue once a year on 28 February.\n\n1️⃣ How do I register?\n2️⃣ Calculate my exact amount\n3️⃣ Back to menu`,
    TT_NOT_QUALIFY: `ℹ️ You do not qualify for Turnover Tax.\n\nReason: {reason}\n\n1️⃣ Learn about standard tax\n2️⃣ Back to menu`,
    TT_HOW_REGISTER:`📝 *How to Register for Turnover Tax*\n\n1. Go to sars.gov.za or SARS MobiApp\n2. Log in to eFiling\n3. Select "Register for Turnover Tax"\n4. Complete the TT01 form\n\n✅ Registration is free.\n\nType *MENU* to go back.`,
    CALC_Q1:        `💰 *Tax Calculator*\n\nWhat was your *total income* this month?\n\n(e.g. 12500)`,
    CALC_Q2:        `What were your *total expenses* this month?\n\n(e.g. 4200)\nReply 0 if none.`,
    CALC_RESULT:    `📊 *Your Tax Summary*\n\n💚 Income:   R{income}\n🔴 Expenses: R{expenses}\n📈 Profit:   R{profit}\n\n*Estimated Tax*\n{tax_detail}\n\nType *MENU* to go back.`,
    PAYE_Q1:        `👥 *PAYE Calculator*\n\nHow many employees do you have?`,
    PAYE_Q2:        `What is the total *monthly payroll* (all salaries combined)?\n\n(e.g. 8500)`,
    PAYE_RESULT:    `💼 *Employee Cost Breakdown*\n\n*Gross Salary:* R{gross}\n• PAYE: R{paye}\n• UIF (employee): R{uif_ee}\n\n*Net Pay: R{net}*\n\n*Your costs to SARS:*\n• UIF (employer): R{uif_er}\n• SDL: R{sdl}\n\n*Total Cost to You: R{total}*\n\nDue by 7th of each month.\n\nType *MENU* to go back.`,
    UNKNOWN:        `I didn't understand that. Type *MENU* to see your options.`,
  },

  // ─── ISIZULU ────────────────────────────────────────────────────────────────
  zu: {
    WELCOME:        `👋 Sawubona! Wamukelekile ku-*KasiCommerce*!\n\nKhetha ulimi lwakho:\n1️⃣ English\n2️⃣ isiZulu\n3️⃣ isiXhosa\n4️⃣ Sesotho\n5️⃣ Afrikaans\n6️⃣ Tshivenḓa`,
    AWAIT_NAME:     `Ubani igama lakho?`,
    AWAIT_BIZ_NAME: `Ubani igama leshishini lakho?`,
    AWAIT_BIZ_TYPE: `Uhlobo luni lweshishini owenza lona?\n\n1️⃣ Spaza / Isitolo\n2️⃣ Inwele & Ubuhle\n3️⃣ Ukudla & Ukupheka\n4️⃣ Izingubo\n5️⃣ Izinsizakalo\n6️⃣ Okunye`,
    MAIN_MENU:      `🏠 *Imenyu Eyinhloko*\n\n1️⃣ 📒 KasiBooks — Rekhoda imali\n2️⃣ 📊 KasiComply — Intela\n3️⃣ 🛒 KasiStore — Isitolo sami\n4️⃣ 💰 KasiCredit — Cela imalimboleko\n5️⃣ 📈 Imibiko\n\nPhendula ngenombolo.`,
    LOG_TYPE:       `Yini ofuna ukuyirekhoda?\n\n1️⃣ 💚 Imali engenayo\n2️⃣ 🔴 Imali ephuma\n3️⃣ 🏠 Imenyu Eyinhloko`,
    LOG_AMOUNT:     `Malini? (isib. 150)`,
    LOG_DESC:       `Kwakungani? (isib. "ngithengise amajazi amathathu")`,
    LOG_SAVED:      `✅ Kulondoloziwe!\n\n1️⃣ Rekhoda imali engenayo\n2️⃣ Rekhoda indleko\n3️⃣ Imenyu Eyinhloko`,
    LOG_CANCEL:     `Kukhanselwe.\n\n1️⃣ Rekhoda imali engenayo\n2️⃣ Rekhoda indleko\n3️⃣ Imenyu Eyinhloko`,
    COMPLY_MENU:    `📊 *KasiComply — Intela*\n\n1️⃣ Hlola i-Turnover Tax\n2️⃣ Bala intela yami\n3️⃣ Sheda yokulandela\n4️⃣ PAYE nezindleko\n5️⃣ Izikhathi ezibalulekile\n\nThayipha *MENU* ukubuya.`,
    TT_Q1:          `📋 *Ukuhlola i-Turnover Tax*\n\nUmbuzo 1 waka-3:\n\nIMali yakho yonyaka iyangaki?\n\n(isib. 450000 nge-R450,000)`,
    TT_Q2:          `Umbuzo 2 waka-3:\n\nUnazo izinye izishishini?\n\n1️⃣ Cha — leli kuphela\n2️⃣ Yebo — nginezinye`,
    TT_Q3:          `Umbuzo 3 waka-3:\n\nIngabe ishishini lakho liyinkampani yomphakathi?\n\n1️⃣ Cha — eyabucca\n2️⃣ Yebo`,
    TT_QUALIFIES:   `✅ *Izindaba ezimnandi! Uyafaneleka i-Turnover Tax.*\n\nIntela yakho iqagulwa: *{amount}*\nIfanele ngo-28 February.\n\n1️⃣ Ngibhalise kanjani?\n2️⃣ Bala inani elinembile\n3️⃣ Buyela emenyini`,
    TT_NOT_QUALIFY: `ℹ️ Awufaneleki i-Turnover Tax.\n\nIsizathu: {reason}\n\n1️⃣ Funda ngentela ejwayelekile\n2️⃣ Buyela emenyini`,
    TT_HOW_REGISTER:`📝 *Ukubhalisa i-Turnover Tax*\n\n1. Yiya ku-sars.gov.za\n2. Ngena ku-eFiling\n3. Khetha "Register for Turnover Tax"\n4. Gcwalisa ifomu le-TT01\n\n✅ Ukubhalisa kumahhala.\n\nThayipha *MENU* ukubuya.`,
    CALC_Q1:        `💰 *Isibali Sentela*\n\nImali yakho yenyanga iyangaki?\n\n(isib. 12500)`,
    CALC_Q2:        `Izindleko zakho zenyanga zingaki?\n\n(isib. 4200)\nThayipha 0 uma zingekho.`,
    CALC_RESULT:    `📊 *Isifinyezo Sentela*\n\n💚 Imali: R{income}\n🔴 Izindleko: R{expenses}\n📈 Inzuzo: R{profit}\n\n*Intela Eqagulwayo*\n{tax_detail}\n\nThayipha *MENU* ukubuya.`,
    PAYE_Q1:        `👥 *Isibali se-PAYE*\n\nUnabangaki abasebenzi?`,
    PAYE_Q2:        `Imali yenyanga yomholo wabo wonke iyangaki?\n\n(isib. 8500)`,
    PAYE_RESULT:    `💼 *Izindleko Zabasebenzi*\n\n*Umholo:* R{gross}\n• PAYE: R{paye}\n• UIF: R{uif_ee}\n\n*Umholo Ohlanzekile: R{net}*\n\n*Izindleko zakho ku-SARS:*\n• UIF: R{uif_er}\n• SDL: R{sdl}\n\n*Inani Eliphelele: R{total}*\n\nThayipha *MENU* ukubuya.`,
    UNKNOWN:        `Angizwanga. Thayipha *MENU* ukubona izinketho zakho.`,
  },

  // ─── ISIXHOSA ───────────────────────────────────────────────────────────────
  xh: {
    WELCOME:        `👋 Molo! Wamkelekile ku-*KasiCommerce*!\n\nKhetha ulwimi lwakho:\n1️⃣ English\n2️⃣ isiZulu\n3️⃣ isiXhosa\n4️⃣ Sesotho\n5️⃣ Afrikaans\n6️⃣ Tshivenḓa`,
    AWAIT_NAME:     `Ngubani igama lakho?`,
    AWAIT_BIZ_NAME: `Ngubani igama leshishini lakho?`,
    AWAIT_BIZ_TYPE: `Uhlobo lushishini lwakho luyintoni?\n\n1️⃣ Spaza / Ivenkile\n2️⃣ Iinwele & Ubuhle\n3️⃣ Ukutya & Ukupheka\n4️⃣ Impahla\n5️⃣ Iinkonzo\n6️⃣ Okunye`,
    MAIN_MENU:      `🏠 *Imenyu Eyinhloko*\n\n1️⃣ 📒 KasiBooks — Gcina imali\n2️⃣ 📊 KasiComply — Irhafu\n3️⃣ 🛒 KasiStore — Ivenkile yam\n4️⃣ 💰 KasiCredit — Cela imboleko\n5️⃣ 📈 Ingxelo\n\nPhendula ngenombolo.`,
    LOG_TYPE:       `Yintoni ofuna ukuyigcina?\n\n1️⃣ 💚 Imali engena\n2️⃣ 🔴 Imali ephuma\n3️⃣ 🏠 Imenyu Eyinhloko`,
    LOG_AMOUNT:     `Malini? (umz. 150)`,
    LOG_DESC:       `Yayingantoni? (umz. "ndathengisa iinkukhu ezintathu")`,
    LOG_SAVED:      `✅ Kugcinwe!\n\n1️⃣ Gcina imali engena\n2️⃣ Gcina indleko\n3️⃣ Imenyu Eyinhloko`,
    LOG_CANCEL:     `Kurhoxisiwe.\n\n1️⃣ Gcina imali engena\n2️⃣ Gcina indleko\n3️⃣ Imenyu Eyinhloko`,
    COMPLY_MENU:    `📊 *KasiComply — Irhafu*\n\n1️⃣ Jonga i-Turnover Tax\n2️⃣ Bala irhafu yam\n3️⃣ Ishejuli yokulandelela\n4️⃣ PAYE nezindleko\n5️⃣ Iimvakalelo ezibalulekileyo\n\nTayipha *MENU* ukubuyela.`,
    TT_Q1:          `📋 Umbuzo 1 we-3:\n\nIngakanani imali yakho yonyaka?\n\n(umz. 450000 nge-R450,000)`,
    TT_Q2:          `Umbuzo 2 we-3:\n\nUnazo ezinye iishishini?\n\n1️⃣ Hayi — eli kuphela\n2️⃣ Ewe — ndinezinye`,
    TT_Q3:          `Umbuzo 3 we-3:\n\nIshishini lakho lingumbutho woluntu?\n\n1️⃣ Hayi — yeyabucala\n2️⃣ Ewe`,
    TT_QUALIFIES:   `✅ *Iindaba ezilungileyo! Ufanelekile i-Turnover Tax.*\n\nIrhafu yakho iqikelelwa: *{amount}*\nIya kuhlawulwa nge-28 February.\n\n1️⃣ Ndibhalise njani?\n2️⃣ Bala inani elichanekileyo\n3️⃣ Buyela kwimenyu`,
    TT_NOT_QUALIFY: `ℹ️ Awufaneleki i-Turnover Tax.\n\nIsizathu: {reason}\n\n1️⃣ Funda ngerhafu ejwayelekileyo\n2️⃣ Buyela kwimenyu`,
    TT_HOW_REGISTER:`📝 *Ukubhalisa i-Turnover Tax*\n\n1. Yiya ku-sars.gov.za\n2. Ngena ku-eFiling\n3. Khetha "Register for Turnover Tax"\n4. Gcwalisa ifomu le-TT01\n\n✅ Ukubhalisa kumahhala.\n\nTayipha *MENU* ukubuyela.`,
    CALC_Q1:        `💰 Ingakanani imali yakho yenyanga?\n\n(umz. 12500)`,
    CALC_Q2:        `Zingakanani iindleko zakho zenyanga?\n\n(umz. 4200)\nTayipha 0 ukuba azikho.`,
    CALC_RESULT:    `📊 *Isishwankathelo Serhafu*\n\n💚 Imali: R{income}\n🔴 Iindleko: R{expenses}\n📈 Inzuzo: R{profit}\n\n*Irhafu Eqikelelweyo*\n{tax_detail}\n\nTayipha *MENU* ukubuyela.`,
    PAYE_Q1:        `👥 Unabo bangaphi abasebenzi?`,
    PAYE_Q2:        `Yimalini imivuzo yenyanga yonke?\n\n(umz. 8500)`,
    PAYE_RESULT:    `💼 *Iindleko Zabasebenzi*\n\n*Umvuzo:* R{gross}\n• PAYE: R{paye}\n• UIF: R{uif_ee}\n\n*Umvuzo Ohlanjisiweyo: R{net}*\n\n*Iindleko zakho ku-SARS:*\n• UIF: R{uif_er}\n• SDL: R{sdl}\n\n*Ixabiso Elipheleleyo: R{total}*\n\nTayipha *MENU* ukubuyela.`,
    UNKNOWN:        `Andivanga. Tayipha *MENU* ukubona iinketho zakho.`,
  },

  // ─── SESOTHO ────────────────────────────────────────────────────────────────
  st: {
    WELCOME:        `👋 Lumela! O amohelehile ho *KasiCommerce*!\n\nKgetha puo ya hao:\n1️⃣ English\n2️⃣ isiZulu\n3️⃣ isiXhosa\n4️⃣ Sesotho\n5️⃣ Afrikaans\n6️⃣ Tshivenḓa`,
    AWAIT_NAME:     `Lebitso la hao ke mang?`,
    AWAIT_BIZ_NAME: `Lebitso la kgwebo ya hao ke mang?`,
    AWAIT_BIZ_TYPE: `Mofuta ofe wa kgwebo o o sebetsang?\n\n1️⃣ Spaza / Lebenkele\n2️⃣ Moriri & Botle\n3️⃣ Dijo & Ho pheha\n4️⃣ Diaparo\n5️⃣ Ditshebeletso\n6️⃣ Tse ding`,
    MAIN_MENU:      `🏠 *Menyu Ea Mantlha*\n\n1️⃣ 📒 KasiBooks — Ngola chelete\n2️⃣ 📊 KasiComply — Lekhetho\n3️⃣ 🛒 KasiStore — Lebenkele la ka\n4️⃣ 💰 KasiCredit — Kopa mpho-kadimo\n5️⃣ 📈 Dipego\n\nAraba ka nomoro.`,
    LOG_TYPE:       `O batla ho ngola eng?\n\n1️⃣ 💚 Chelete e kena\n2️⃣ 🔴 Chelete e tswa\n3️⃣ 🏠 Menyu Ea Mantlha`,
    LOG_AMOUNT:     `Ke bokae? (mohlala 150)`,
    LOG_DESC:       `E ne e le ya eng? (mohlala "ke rekisitse dikokoetso tse tharo")`,
    LOG_SAVED:      `✅ Ho boloketswe!\n\n1️⃣ Ngola chelete e kena\n2️⃣ Ngola ditshenyehelo\n3️⃣ Menyu Ea Mantlha`,
    LOG_CANCEL:     `Ho hlaotswe.\n\n1️⃣ Ngola chelete e kena\n2️⃣ Ngola ditshenyehelo\n3️⃣ Menyu Ea Mantlha`,
    COMPLY_MENU:    `📊 *KasiComply — Lekhetho*\n\n1️⃣ Sheba Turnover Tax\n2️⃣ Bala lekhetho la ka\n3️⃣ Shedjule ya ho latela\n4️⃣ PAYE le ditshenyehelo\n5️⃣ Matsatsi a bohlokwa\n\nTaepa *MENU* ho kgutla.`,
    TT_Q1:          `📋 Potso 1 ya 3:\n\nKhethe e kena ya hao ya selemo ke bokae?\n\n(mohlala 450000 bakeng sa R450,000)`,
    TT_Q2:          `Potso 2 ya 3:\n\nA o na le dikgwebo tse ding?\n\n1️⃣ Tjhee — ena feela\n2️⃣ Ee — ke na le tse ding`,
    TT_Q3:          `Potso 3 ya 3:\n\nA kgwebo ya hao ke khamphani ya sechaba?\n\n1️⃣ Tjhee — ya poraefete\n2️⃣ Ee`,
    TT_QUALIFIES:   `✅ *Ditaba tse molemo! O a lekana le Turnover Tax.*\n\nLekhetho la hao le lefiswang: *{amount}*\nLe lefulwa ka la 28 February.\n\n1️⃣ Ke ingolise jwang?\n2️⃣ Bala palo e nepahetseng\n3️⃣ Kgutlela menyung`,
    TT_NOT_QUALIFY: `ℹ️ Ha o lekane le Turnover Tax.\n\nMabaka: {reason}\n\n1️⃣ Ithute ka lekhetho le tloaelehileng\n2️⃣ Kgutlela menyung`,
    TT_HOW_REGISTER:`📝 *Ho Ingolisa Turnover Tax*\n\n1. Eya ho sars.gov.za\n2. Kena ho eFiling\n3. Kgetha "Register for Turnover Tax"\n4. Tlatsa foromo ya TT01\n\n✅ Ho ingolisa ho mahala.\n\nTaepa *MENU* ho kgutla.`,
    CALC_Q1:        `💰 Chelete e kena ya hao ya kgwedi ke bokae?\n\n(mohlala 12500)`,
    CALC_Q2:        `Ditshenyehelo tsa hao tsa kgwedi ke bokae?\n\n(mohlala 4200)\nTaepa 0 ha ho na ditshenyehelo.`,
    CALC_RESULT:    `📊 *Kakaretso ya Lekhetho*\n\n💚 Chelete: R{income}\n🔴 Ditshenyehelo: R{expenses}\n📈 Phaello: R{profit}\n\n*Lekhetho le Lefiswang*\n{tax_detail}\n\nTaepa *MENU* ho kgutla.`,
    PAYE_Q1:        `👥 O na le basebetsi ba bakae?`,
    PAYE_Q2:        `Moputso wa kgwedi wa bohle o bokae?\n\n(mohlala 8500)`,
    PAYE_RESULT:    `💼 *Ditshenyehelo tsa Basebetsi*\n\n*Moputso:* R{gross}\n• PAYE: R{paye}\n• UIF: R{uif_ee}\n\n*Moputso o Hlwekisitsweng: R{net}*\n\n*Ditshenyehelo tsa hao ho SARS:*\n• UIF: R{uif_er}\n• SDL: R{sdl}\n\n*Theko e Feletseng: R{total}*\n\nTaepa *MENU* ho kgutla.`,
    UNKNOWN:        `Ha ke a utlwisisa. Taepa *MENU* ho bona dikgetho tsa hao.`,
  },

  // ─── AFRIKAANS ──────────────────────────────────────────────────────────────
  af: {
    WELCOME:        `👋 Hallo! Welkom by *KasiCommerce*!\n\nKies jou taal:\n1️⃣ English\n2️⃣ isiZulu\n3️⃣ isiXhosa\n4️⃣ Sesotho\n5️⃣ Afrikaans\n6️⃣ Tshivenḓa`,
    AWAIT_NAME:     `Wat is jou naam?`,
    AWAIT_BIZ_NAME: `Wat is die naam van jou besigheid?`,
    AWAIT_BIZ_TYPE: `Watter tipe besigheid bedryf jy?\n\n1️⃣ Spaza / Algemene handelaar\n2️⃣ Hare & Skoonheid\n3️⃣ Kos & Spyseniering\n4️⃣ Klere & Tekstiel\n5️⃣ Dienste\n6️⃣ Ander`,
    MAIN_MENU:      `🏠 *Hoofkieslys*\n\n1️⃣ 📒 KasiBooks — Teken inkomste of uitgawes aan\n2️⃣ 📊 KasiComply — Belasting & nakoming\n3️⃣ 🛒 KasiStore — My aanlynwinkel\n4️⃣ 💰 KasiCredit — Doen aansoek vir 'n lening\n5️⃣ 📈 Verslae — Sien my opsomming\n\nAntwoord met 'n nommer.`,
    LOG_TYPE:       `Wat wil jy aanteken?\n\n1️⃣ 💚 Inkomste (geld in)\n2️⃣ 🔴 Uitgawe (geld uit)\n3️⃣ 🏠 Hoofkieslys`,
    LOG_AMOUNT:     `Hoeveel? (bv. 150)`,
    LOG_DESC:       `Waarvoor was dit? (bv. "verkoop 3 hoenders")`,
    LOG_SAVED:      `✅ Gestoor!\n\n1️⃣ Teken inkomste aan\n2️⃣ Teken uitgawe aan\n3️⃣ Hoofkieslys`,
    LOG_CANCEL:     `Gekanselleer.\n\n1️⃣ Teken inkomste aan\n2️⃣ Teken uitgawe aan\n3️⃣ Hoofkieslys`,
    COMPLY_MENU:    `📊 *KasiComply — Belasting*\n\n1️⃣ Kyk of ek kwalifiseer vir Omsetbelasting\n2️⃣ Bereken my belasting\n3️⃣ Nakomingskalender\n4️⃣ PAYE en werknemerskoste\n5️⃣ Belangrike sperdatums\n\nTik *MENU* om terug te gaan.`,
    TT_Q1:          `📋 Vraag 1 van 3:\n\nWat is jou geskatte *jaarlikse omset*?\n\n(bv. 450000 vir R450,000)`,
    TT_Q2:          `Vraag 2 van 3:\n\nBedryf jy *meer as een besigheid*?\n\n1️⃣ Nee — net hierdie een\n2️⃣ Ja — ek het ander besighede`,
    TT_Q3:          `Vraag 3 van 3:\n\nIs jou besigheid 'n *openbare maatskappy*?\n\n1️⃣ Nee — dit is privaat\n2️⃣ Ja`,
    TT_QUALIFIES:   `✅ *Goeie nuus! Jy kwalifiseer vir Omsetbelasting.*\n\nJou geskatte belasting: *{amount}*\nVerskuldig op 28 Februarie.\n\n1️⃣ Hoe registreer ek?\n2️⃣ Bereken presiese bedrag\n3️⃣ Terug na kieslys`,
    TT_NOT_QUALIFY: `ℹ️ Jy kwalifiseer nie vir Omsetbelasting nie.\n\nRede: {reason}\n\n1️⃣ Leer oor standaard belasting\n2️⃣ Terug na kieslys`,
    TT_HOW_REGISTER:`📝 *Hoe om te Registreer vir Omsetbelasting*\n\n1. Gaan na sars.gov.za\n2. Meld aan by eFiling\n3. Kies "Register for Turnover Tax"\n4. Voltooi die TT01-vorm\n\n✅ Registrasie is gratis.\n\nTik *MENU* om terug te gaan.`,
    CALC_Q1:        `💰 Wat was jou *totale inkomste* hierdie maand?\n\n(bv. 12500)`,
    CALC_Q2:        `Wat was jou *totale uitgawes* hierdie maand?\n\n(bv. 4200)\nTik 0 as daar geen is nie.`,
    CALC_RESULT:    `📊 *Jou Belastingopsomming*\n\n💚 Inkomste: R{income}\n🔴 Uitgawes: R{expenses}\n📈 Wins: R{profit}\n\n*Geskatte Belasting*\n{tax_detail}\n\nTik *MENU* om terug te gaan.`,
    PAYE_Q1:        `👥 Hoeveel werknemers het jy?`,
    PAYE_Q2:        `Wat is die totale *maandelikse salarisse*?\n\n(bv. 8500)`,
    PAYE_RESULT:    `💼 *Werknemer Koste Uiteensetting*\n\n*Bruto Salaris:* R{gross}\n• PAYE: R{paye}\n• UIF: R{uif_ee}\n\n*Netto Betaling: R{net}*\n\n*Jou koste aan SARS:*\n• UIF: R{uif_er}\n• SDL: R{sdl}\n\n*Totale Koste: R{total}*\n\nTik *MENU* om terug te gaan.`,
    UNKNOWN:        `Ek het nie verstaan nie. Tik *MENU* om jou opsies te sien.`,
  },

  // ─── TSHIVENDA ──────────────────────────────────────────────────────────────
ve: {
    WELCOME:        `👋 Vho tanganedzwa kha *KasiCommerce* — Muthusi wa bindu lavho!\n\nLuambo lwa u shumisa hafha:\n1️⃣ English\n2️⃣ isiZulu\n3️⃣ isiXhosa\n4️⃣ Sesotho\n5️⃣ Afrikaans\n6️⃣ Tshivenḓa`,
    AWAIT_NAME:     `Dzina ḽavho ndi nnyi?`,
    AWAIT_BIZ_NAME: `Dzina la bindu ḽavho?`,
    AWAIT_BIZ_TYPE: `Khethekanyo ya bindu ḽavho?\n\n1️⃣ Tshiphaza / Vhengele\n2️⃣ Mavhudzi & Lunako\n3️⃣ Zwiliwa\n4️⃣ Zwiambaro & Malabi\n5️⃣ Tshumelo\n6️⃣ Zwinwevho`,
    MAIN_MENU:      `🏠 *Main Menu*\n\n1️⃣ 📒 KasiBooks — Rekhodo ya Masheleni o dzhenaho kana o bvaho\n2️⃣ 📊 KasiComply — Muthelo & compliance\n3️⃣ 🛒 KasiStore — Vhengele ḽa online\n4️⃣ 💰 KasiCredit — Khumbelo ya tshelede\n5️⃣ 📈 Reports — Muvhigo wa tshelede\n\nKha vha nange nomboro.`,
    LOG_TYPE:       `Vha khou toda u rekhoda mini?\n\n1️⃣ 💚 Income (Tshelede yo dzhenaho)\n2️⃣ 🔴 Expense (Tshelede yo bvaho)\n3️⃣ 🏠 Main Menu`,
    LOG_AMOUNT:     `Vhugai? (e.g. 150)`,
    LOG_DESC:       `Ndi ya mini? (e.g. "Khuhu tharu(3)")`,
    LOG_SAVED:      `✅ Ro rekhoda!\n\n1️⃣ 💚 Income (Tshelede yo dzhenaho)\n2️⃣ 🔴 Expense (Tshelede yo bvaho)\n3️⃣ Main Menu`,
    LOG_CANCEL:     `Ro khansela.\n\n1️⃣ 💚 Income (Tshelede yo dzhenaho)\n2️⃣ 🔴 Expense (Tshelede yo bvaho)\n3️⃣ Main Menu`,
    COMPLY_MENU:    `📊 *KasiComply — Muthelo & compliance*\n\n1️⃣ Kha vha sedze arali vha tshi fanela muthelo wa mveledziso (Turnover Tax) ?\n2️⃣ Kha vha vhalele muthelo wa bindu\n3️⃣ Ntsumbedze khalenda yanga ya muthelo\n4️⃣ PAYE & mbadelo dza vhashumi\n5️⃣ Maduvha a u vala ane a khou sendela\n\nType *MENU* to go back.`,
    TT_Q1:          `📋 *Turnover Tax Qualifier*\n\nMbudziso 1 ya 3:\n\nNga u tou anganyela bindu lavho li dzhenisa vhugai nga nwaha?\n\nKha vha pange tshelede. (e.g. 450000)`,
    TT_Q2:          `Mbudziso 2 ya 3:\n\nVha na mabindu ano fhira lithihi?\n\n1️⃣ Hai — Ndi lithihi fhedzi\n2️⃣ Ee — Ndi na manwe mabindu`,
    TT_Q3:          `Mbudziso 3 ya 3:\n\nBindu lavho *khamphani ya tshitshavha / public company*?\n\n1️⃣ Hai — Ndi bindu li tuku la phuraivethe\n2️⃣ Ee — Ndi khampani ya tshitshavha`,
    TT_QUALIFIES:   `✅ *Mafhungo a vhudi! Vha tendelwa u badela muthelo wa meledziso /Turnover Tax.*\n\nMuthelo wa meledziso (Turnover Tax) u dzhiela vhudzulo mithelo miraru  yo fhambanaho nga mbadelo nthihi yo leluwaho ya ṅwaha.\n\nMuthelo wo anganyelwaho: *{amount}*\nDucha la u fhedzisa u badela ndi dzi 28 dza Luhuhi/February.\n\n1️⃣ Vha nwalisa hani?\n2️⃣ Khari vhalele tshelede ya vhukuma\n3️⃣ Humela murahu kha menu`,
    TT_NOT_QUALIFY: `ℹ️ Avho ngo fanelwa nga muthelo wa mveledziso (Turnover Tax).\n\nMbuno: {reason}\n\n1️⃣ Kha vha gude ha ha muthelo wo ḓoweleaho \n2️⃣ Humela murahu kha menu`,
    TT_HOW_REGISTER:`📝 *Nḓila ya u ṅwalisa kha Muthelo wa mveledziso (Turnover Tax)*\n\n1. Kha vha dzhene kha sars.gov.za kana SARS MobiApp\n2. Kha vha dzhene kha eFiling\n3. Vha nange "Register for Turnover Tax"\n4. Vha dadzhe TT01 form\n\n✅ U nwalisa a zwi badelwi.\n\nType *MENU* to go back.`,
    CALC_Q1:        `💰 *Tax Calculator*\n\nWhat was your *total income* this month?\n\n(e.g. 12500)`,
    CALC_Q2:        `Tshelede yo bvaho uno nwedzi ndi vhugai you tangana?\n\n(e.g. 4200)\nReply 0 if none.`,
    CALC_RESULT:    `📊 *Muthelo Wavho*\n\n💚 Tshelede yo dzhenaho:   R{income}\n🔴 Tshelede yo bvaho: R{expenses}\n📈 Profit:   R{profit}\n\n*Estimated Tax*\n{tax_detail}\n\nType *MENU* to go back.`,
    PAYE_Q1:        `👥 *PAYE Calculator*\n\nVha na vhashumi vhangana.?`,
    PAYE_Q2:        `Vha badela vhugai ya vha shumi yo tangana nga nwedzi?\n\n(e.g. 8500)`,
    PAYE_RESULT:    `💼 *U fhandekanywa ha mbadelo dza vhashumi*\n\n*Gross Salary:* R{gross}\n• PAYE: R{paye}\n• UIF (employee): R{uif_ee}\n\n*Net Pay: R{net}*\n\n*Your costs to SARS:*\n• UIF (employer): R{uif_er}\n• SDL: R{sdl}\n\n*Total Cost to You: R{total}*\n\nDuvha la u fhedzisa ndi dzi 7 dza nwedzi munwe na munwe.\n\nType *MENU* to go back.`,
    UNKNOWN:        `A thi zwi pfesesi. Kha vha ṅwale *MENU* u itela u vhona zwine vha nga zwi nanga`,
  },

}

export function getMessage(state: string, lang: string): string {
  const msgs = MESSAGES[lang] || MESSAGES['en']
  return msgs[state] || MESSAGES['en'][state] || MESSAGES['en']['UNKNOWN']
}
