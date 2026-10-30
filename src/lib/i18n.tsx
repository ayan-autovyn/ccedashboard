import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "hi";

const dict = {
  appName: { en: "Telecaller Desk", hi: "टेलीकॉलर डेस्क" },
  dashboard: { en: "My Dashboard", hi: "मेरा डैशबोर्ड" },
  followup: { en: "Service Follow-up Calls", hi: "सर्विस फॉलो-अप कॉल" },
  appointments: { en: "Appointment Calls", hi: "अपॉइंटमेंट कॉल" },
  greeting: { en: "Good morning", hi: "सुप्रभात" },
  todayWork: { en: "Here is your work for today. Tap any box to open the calling list.", hi: "आज का आपका काम यहाँ है। कॉलिंग लिस्ट खोलने के लिए किसी भी बॉक्स पर टैप करें।" },
  dealer: { en: "Dealer", hi: "डीलर" },
  dealerCode: { en: "Dealer Code", hi: "डीलर कोड" },
  // service calls report
  serviceCallsTitle: { en: "1. Service Reminder Calls", hi: "1. सर्विस रिमाइंडर कॉल" },
  serviceCallsDesc: { en: "Customers whose service is due — call and book an appointment", hi: "जिन ग्राहकों की सर्विस ड्यू है — कॉल करें और अपॉइंटमेंट बुक करें" },
  callsDue: { en: "Total Calls Due", hi: "कुल ड्यू कॉल" },
  callsDueHint: { en: "Pending + Today's", hi: "पेंडिंग + आज की" },
  callsDone: { en: "Calls Done", hi: "कॉल पूरी" },
  connected: { en: "Connected", hi: "बात हुई" },
  apptCreated: { en: "Appointments Created", hi: "अपॉइंटमेंट बने" },
  // appointment report
  apptTitle: { en: "2. Appointment Confirmation Calls", hi: "2. अपॉइंटमेंट कन्फर्मेशन कॉल" },
  apptDesc: { en: "Customers with appointments — call to confirm their visit", hi: "जिन ग्राहकों का अपॉइंटमेंट है — विज़िट कन्फर्म करने के लिए कॉल करें" },
  totalAppt: { en: "Total Appointments", hi: "कुल अपॉइंटमेंट" },
  totalApptHint: { en: "Today + Pending + Tomorrow", hi: "आज + पेंडिंग + कल" },
  confirmed: { en: "Confirmed", hi: "कन्फर्म हुए" },
  cancelled: { en: "Cancelled", hi: "रद्द हुए" },
  reported: { en: "Reported (Came to workshop)", hi: "रिपोर्ट हुए (वर्कशॉप आए)" },
  withCce: { en: "With your call", hi: "आपकी कॉल से" },
  withoutCce: { en: "Without call", hi: "बिना कॉल के" },
  ofTarget: { en: "of", hi: "में से" },
  left: { en: "left", hi: "बाकी" },
  startCalling: { en: "Start Calling", hi: "कॉल शुरू करें" },
  open: { en: "Open list", hi: "लिस्ट खोलें" },
  todayActivity: { en: "Today's Activity", hi: "आज की गतिविधि" },
  dailyTarget: { en: "Today's calling target", hi: "आज का कॉलिंग लक्ष्य" },
  assignedTarget: { en: "Based on your assigned calling lists", hi: "आपकी निर्धारित कॉलिंग लिस्ट के अनुसार" },
  completedCalls: { en: "Calls completed", hi: "कॉल पूरी हुईं" },
  remainingCalls: { en: "Calls remaining", hi: "कॉल बाकी हैं" },
  callsToMake: { en: "calls to make", hi: "कॉल करें" },
  targetClosed: { en: "Today's calling target completed", hi: "आज का कॉलिंग लक्ष्य पूरा हुआ" },
  focusNow: { en: "Focus now", hi: "अभी इस पर ध्यान दें" },
  focusPlan: { en: "Your path to today's target", hi: "आज का लक्ष्य पूरा करने का क्रम" },
  afterGroup: { en: "After these calls", hi: "ये कॉल पूरी होने पर" },
  targetProgress: { en: "Target progress", hi: "लक्ष्य की प्रगति" },
  completedStep: { en: "Complete", hi: "पूरा हुआ" },
  savedCounts: { en: "Each assigned customer with a saved call result counts once, including unanswered calls. Confirmations and bookings increase only when that outcome is saved.", hi: "हर निर्धारित ग्राहक का कॉल परिणाम सेव होने पर एक कॉल गिनी जाएगी, बात न होने पर भी। कन्फर्मेशन और बुकिंग केवल वही परिणाम सेव होने पर बढ़ेंगे।" },
  impactToday: { en: "Remind customers to visit today; confirmed visits can increase.", hi: "आज आने की याद दिलाएँ; कन्फर्म विज़िट बढ़ सकती हैं।" },
  impactTomorrow: { en: "Confirm tomorrow's visits; appointment confirmations can increase.", hi: "कल की विज़िट पक्की करें; अपॉइंटमेंट कन्फर्मेशन बढ़ सकते हैं।" },
  impactPendingAppt: { en: "Reconnect with missed visits; rescheduled appointments can increase.", hi: "छूटी हुई विज़िट के लिए संपर्क करें; दोबारा तय अपॉइंटमेंट बढ़ सकते हैं।" },
  impactService: { en: "Call customers due today; new service bookings can increase.", hi: "आज की ड्यू सर्विस के लिए कॉल करें; नई सर्विस बुकिंग बढ़ सकती हैं।" },
  impactFollowup: { en: "Follow up with customers; connected calls and bookings can increase.", hi: "ग्राहकों को फॉलो-अप करें; बातचीत और बुकिंग बढ़ सकती हैं।" },
  impactPending: { en: "Clear overdue calls; completed calls and service bookings can increase.", hi: "बाकी ड्यू कॉल पूरी करें; पूरी कॉल और सर्विस बुकिंग बढ़ सकती हैं।" },
  attempts: { en: "Attempts", hi: "प्रयास" },
  nonConnect: { en: "Not Connected", hi: "बात नहीं हुई" },
  apptBooked: { en: "Appointment Booked", hi: "अपॉइंटमेंट बुक" },
  callLater: { en: "Call Me Later", hi: "बाद में कॉल करें" },
  notInterested: { en: "Not Interested", hi: "रुचि नहीं" },
  // tabs
  totalCalls: { en: "Total Calls", hi: "कुल कॉल" },
  todaysDue: { en: "Today's Due Calls", hi: "आज की ड्यू कॉल" },
  pendingDue: { en: "Pending Due & Follow-up", hi: "पेंडिंग ड्यू और फॉलो-अप" },
  followupTab: { en: "Follow-up", hi: "फॉलो-अप" },
  reportedCalls: { en: "Reported Calls", hi: "रिपोर्टेड कॉल" },
  lostCalls: { en: "Lost Calls", hi: "लॉस्ट कॉल" },
  totalAppointment: { en: "Total Appointment", hi: "कुल अपॉइंटमेंट" },
  todayAppt: { en: "Today's Appointment", hi: "आज के अपॉइंटमेंट" },
  tomorrowAppt: { en: "Tomorrow's Appointment", hi: "कल के अपॉइंटमेंट" },
  pendingAppt: { en: "Pending / No-show Appointment", hi: "पेंडिंग / नो-शो अपॉइंटमेंट" },
  // table
  customer: { en: "Customer", hi: "ग्राहक" },
  vehicle: { en: "Vehicle", hi: "वाहन" },
  regNo: { en: "Reg. No", hi: "रजि. नंबर" },
  service: { en: "Service", hi: "सर्विस" },
  dueDate: { en: "Due Date", hi: "ड्यू तारीख" },
  lastVisit: { en: "Last Visit", hi: "पिछली विज़िट" },
  status: { en: "Status", hi: "स्थिति" },
  apptTime: { en: "Appointment Time", hi: "अपॉइंटमेंट समय" },
  action: { en: "Action", hi: "कार्य" },
  call: { en: "Call", hi: "कॉल करें" },
  search: { en: "Search name, reg no, mobile…", hi: "नाम, रजि. नंबर, मोबाइल खोजें…" },
  noRows: { en: "No customers in this list 🎉", hi: "इस लिस्ट में कोई ग्राहक नहीं 🎉" },
  back: { en: "Back to Dashboard", hi: "डैशबोर्ड पर वापस" },
  callingNow: { en: "Calling", hi: "कॉल हो रही है" },
  whatHappened: { en: "What happened on the call?", hi: "कॉल पर क्या हुआ?" },
  cancel: { en: "Close", hi: "बंद करें" },
  pendingConfirmation: { en: "Pending Confirmation", hi: "कन्फर्मेशन बाकी" },
  confirm: { en: "Confirm", hi: "कन्फर्म" },
  rescheduled: { en: "Rescheduled", hi: "दोबारा तय" },
  smrDue: { en: "SMR Due", hi: "सर्विस ड्यू" },
  saved: { en: "Saved", hi: "सेव हुआ" },
  customers: { en: "customers", hi: "ग्राहक" },
  // daily calling priority flow
  flowTitle: { en: "Today's Calling Order", hi: "आज का कॉलिंग क्रम" },
  flowDesc: { en: "Call in this order — finish each step, then move to the next one.", hi: "इसी क्रम में कॉल करें — पहला स्टेप पूरा करें, फिर अगले पर जाएँ।" },
  startHere: { en: "Start here", hi: "यहाँ से शुरू करें" },
  step1: { en: "Today's appointments — remind them to come for service", hi: "आज के अपॉइंटमेंट — सर्विस के लिए आने की याद दिलाएँ" },
  step2: { en: "Tomorrow's appointments — remind them today", hi: "कल के अपॉइंटमेंट — आज ही याद दिलाएँ" },
  step3: { en: "Pending & no-show appointments", hi: "पेंडिंग और नो-शो अपॉइंटमेंट" },
  step4: { en: "Pending calling list — start with today's due", hi: "पेंडिंग कॉलिंग लिस्ट — आज की ड्यू से शुरू करें" },
  step5: { en: "Follow-up calls", hi: "फॉलो-अप कॉल" },
  step6: { en: "Pending due & follow-up calls", hi: "पेंडिंग ड्यू और फॉलो-अप कॉल" },
  ccm: { en: "Team Dashboard (CCM)", hi: "टीम डैशबोर्ड (CCM)" },
  headOffice: { en: "Head Office Dashboard", hi: "हेड ऑफिस डैशबोर्ड" },
  headOfficeView: { en: "Head Office View", hi: "हेड ऑफिस व्यू" },
} as const;

export type Key = keyof typeof dict;

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string }>({
  lang: "en",
  setLang: () => {},
  t: (k) => dict[k].en,
});

export function I18nProvider({ children, forcedLang }: { children: ReactNode; forcedLang?: Lang }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const s = localStorage.getItem("lang");
    if (s === "hi" || s === "en") setLangState(s);
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };
  const active = forcedLang ?? lang;
  return <Ctx.Provider value={{ lang: active, setLang, t: (k) => dict[k][active] }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
