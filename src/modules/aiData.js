import { t } from '../i18n/index.js';

/**
 * Intelligent Multi-Lingual AI Memory Companion Engine
 * SIH 2026 Memory Assistant
 *
 * Supports Hindi, Hinglish, English, Assamese, and Bengali.
 * Integrates live schedule reminders, real CVI analytics, memory grounding,
 * cultural heritage storytelling, and empathetic dementia caregiver support.
 */

// Helper: Detect language/dialect from query string
function detectLanguage(text) {
  if (!text) return 'en';
  const lower = text.toLowerCase();

  // Assamese characters / markers
  if (/[\u0980-\u09FF]/.test(text)) {
    if (lower.includes('ৰাহুল') || lower.includes('প্ৰিয়া') || lower.includes('আজি') || lower.includes('পৰিয়াল') || lower.includes('ঔষধ') || lower.includes('নমস্কাৰ')) {
      return 'as';
    }
    return 'bn';
  }

  // Devanagari Hindi
  if (/[\u0900-\u097F]/.test(text)) {
    return 'hi';
  }

  // Hinglish heuristics (Romanized Hindi)
  const hinglishWords = [
    'kya', 'kaise', 'karo', 'khel', 'dawai', 'dawa', 'aaj', 'parivar', 'madad',
    'yaad', 'bhool', 'nahi', 'raha', 'hai', 'batao', 'namaste', 'kaun', 'mera',
    'meri', 'mere', 'khelna', 'khana', 'pani', 'kaisi', 'shubh', 'dar', 'neend'
  ];
  const words = lower.split(/\s+/);
  const matchCount = words.filter(w => hinglishWords.includes(w)).length;
  if (matchCount >= 1) {
    return 'hi';
  }

  return 'en';
}

/**
 * Core conversational generator with full context awareness
 */
export const getAIResponse = (question, contextOrPatientId = 'P001') => {
  if (!question || typeof question !== 'string') {
    return t('ai.responses.default');
  }

  // Parse context object or fallback
  let ctx = {};
  if (typeof contextOrPatientId === 'object' && contextOrPatientId !== null) {
    ctx = contextOrPatientId;
  } else {
    ctx = { patientId: contextOrPatientId || 'P001' };
  }

  const pName = ctx.patientName || 'Loved One';
  const cName = ctx.caregiverName || 'Caregiver';
  const isCaregiver = ctx.role === 'caregiver';
  const lang = ctx.language || detectLanguage(question);
  const query = question.trim().toLowerCase();

  // Real data snapshots
  const reminders = Array.isArray(ctx.reminders) ? ctx.reminders : [];
  const analytics = ctx.analyticsData || {};
  const cviScore = analytics.vitalityIndex !== null && analytics.vitalityIndex !== undefined ? `${analytics.vitalityIndex}%` : null;
  const gamesToday = analytics.totalSessions || 0;
  const overallAcc = analytics.overallAccuracy ? `${analytics.overallAccuracy}%` : null;

  // -------------------------------------------------------------
  // 1. GREETINGS & INTRODUCTIONS
  // -------------------------------------------------------------
  if (/^(hi|hello|hey|namaste|pranam|namaskar|shubh prabhat|good morning|good evening|good afternoon|ki khobor|kemon acho)\b/.test(query) || query === 'hi' || query === 'hello') {
    if (lang === 'hi') {
      return isCaregiver
        ? `नमस्ते ${cName} जी! मैं आपका नोकलाई (Noklai) केयर असिस्टेंट हूँ। मैं ${pName} जी की दिनचर्या, गेम प्रोग्रेस, और याददाश्त देखभाल में आपकी मदद के लिए उपस्थित हूँ। आज आप क्या जानना चाहेंगे?`
        : `नमस्ते ${pName} जी! मैं आपका नोकलाई साथी हूँ। आप आज कैसा महसूस कर रहे हैं? आप मुझसे अपनी दवाइयों, परिवार, या आज के शेड्यूल के बारे में कभी भी पूछ सकते हैं!`;
    }
    if (lang === 'as') {
      return isCaregiver
        ? `নমস্কাৰ ${cName}! মই আপোনাৰ নোকলাই কেয়াৰ সহায়ক। ${pName}ৰ যত্ন আৰু মানসিক স্বাস্থ্যৰ অগ্ৰগতি সম্পৰ্কে সহায় কৰিবলৈ সাজু আছোঁ।`
        : `নমস্কাৰ ${pName}! মই আপোনাৰ নোকলাই সংগী। আজি আপোনাৰ দিনটো কেনে গৈছে? কিবা সহায়ৰ প্ৰয়োজন আছে নেকি?`;
    }
    if (lang === 'bn') {
      return isCaregiver
        ? `নমস্কার ${cName}! আমি আপনার নোকলাই কেয়ার অ্যাসিস্ট্যান্ট। ${pName}-এর প্রোগ্রেস ও প্রতিদিনের যত্নে সাহায্য করার জন্য আমি আছি।`
        : `নমস্কার ${pName}! আমি আপনার নোকলাই বন্ধু। আজকের দিনটি কেমন কাটছে? কোনো সাহায্য প্রয়োজন?`;
    }
    return isCaregiver
      ? `Hello ${cName}! I am your Noklai Care Assistant. I can help you monitor ${pName}'s cognitive progress, review upcoming reminders, or recommend stimulating cultural memory exercises.`
      : `Hello ${pName}! I'm your Noklai companion. How are you feeling today? Take your time—I can help you with your daily routine, family stories, or play a gentle brain exercise with you.`;
  }

  // -------------------------------------------------------------
  // 2. WHO ARE YOU / WHAT CAN YOU DO (IDENTITY & CAPABILITIES)
  // -------------------------------------------------------------
  if (query.includes('who are you') || query.includes('kaun ho') || query.includes('tum kaun') || query.includes('kya kar sakte') || query.includes('help') || query.includes('madad') || query.includes('kya kaam')) {
    if (lang === 'hi') {
      return `मैं नोकलाई (Noklai) AI असिस्टेंट हूँ — खास तौर पर बुजुर्गों और स्मृति देखभाल (Dementia & Memory Care) के लिए डिज़ाइन किया गया साथी।\n\nमैं आपकी इन चीज़ों में मदद कर सकता हूँ:\n1. ⏰ दवाइयों और दिनचर्या के ऑडियो व विज़ुअल रिमाइंडर्स\n2. 🎋 पारंपरिक सांस्कृतिक खेल (Suh Tah Lam, Dhopkhel, Sinaki Sthan)\n3. 📊 कॉग्निटिव वाइटैलिटी इंडेक्स (CVI) और प्रगति रिपोर्ट\n4. 📖 परिवार के सदस्यों की पहचान और पूर्वोत्तर की लोक कथाएँ`;
    }
    return `I am your Noklai AI Memory Companion, purpose-built to support cognitive vitality and daily care for elders and caregivers.\n\nHere is how I can assist you:\n• Track daily routines, appointments, and timely medication alerts\n• Stimulate memory with cultural games (Suh Tah Lam, Dhopkhel, Sinaki Sthan)\n• Monitor Cognitive Vitality Index (CVI) and clinical trend progress\n• Provide comforting memory grounding and Northeast cultural folklore`;
  }

  // -------------------------------------------------------------
  // 3. MEDICINE & PRESCRIPTION REMINDERS
  // -------------------------------------------------------------
  if (query.includes('medicine') || query.includes('dawai') || query.includes('dawa') || query.includes('tablet') || query.includes('goli') || query.includes('ঔষধ') || query.includes('ওষুধ') || query.includes('दवा')) {
    const medReminders = reminders.filter(r => (r.category === 'Medicine' || r.title?.toLowerCase().includes('med') || r.title?.toLowerCase().includes('dawa')));
    if (medReminders.length > 0) {
      const pendingMeds = medReminders.filter(r => !r.done);
      if (pendingMeds.length > 0) {
        if (lang === 'hi') {
          return `आज की जरूरी दवाइयां:\n• ` + pendingMeds.map(m => `${m.time}: ${m.title}`).join('\n• ') + `\n\nकृपया पानी के साथ समय पर लें। क्या आपने पहले वाली खुराक ले ली है?`;
        }
        return `Upcoming medications for ${pName}:\n• ` + pendingMeds.map(m => `${m.time}: ${m.title}`).join('\n• ') + `\n\nPlease ensure taken on time with water.`;
      }
      if (lang === 'hi') {
        return `शाबाश! आज की सभी निर्धारित दवाइयाँ पूरी हो चुकी हैं। अगर कोई नई सलाह चाहिए, तो डॉक्टर या ${cName} जी से संपर्क करें।`;
      }
      return `All scheduled medications for today have already been marked completed! Great routine consistency.`;
    }
    if (lang === 'hi') {
      return `दवाइयों का सामान्य नियम: सुबह 8:00 AM नाश्ते के बाद और रात 8:00 PM भोजन के बाद। आप 'My Day & Reminders' में जाकर अपनी सटीक दवाइयाँ जोड़ सकते हैं।`;
    }
    return t('ai.responses.medicine') || `Routine medication timing is usually at 8:00 AM and 8:00 PM after meals. Please check your personalized routine tab or consult your doctor.`;
  }

  // -------------------------------------------------------------
  // 4. TODAY'S SCHEDULE & ROUTINES
  // -------------------------------------------------------------
  if (query.includes('schedule') || query.includes('routine') || query.includes('today') || query.includes('aaj') || query.includes('din') || query.includes('time table') || query.includes('সূচী') || query.includes('दिनचर्या')) {
    if (reminders.length > 0) {
      const pending = reminders.filter(r => !r.done);
      if (pending.length > 0) {
        if (lang === 'hi') {
          return `${pName} जी की आज की आगामी गतिविधियाँ:\n• ` + pending.map(p => `${p.time} - ${p.title}`).join('\n• ') + `\n\nक्या आप चाहते हैं कि मैं इसके लिए ऑडियो अलर्ट सेट करूँ?`;
        }
        return `Today's upcoming tasks for ${pName}:\n• ` + pending.map(p => `${p.time} - ${p.title}`).join('\n• ') + `\n\nWould you like an audio reminder set?`;
      }
      if (lang === 'hi') {
        return `बहुत बढ़िया! आज की सभी निर्धारित गतिविधियाँ पूरी हो चुकी हैं। अब थोड़ा विश्राम करें या एक आरामदायक मेमोरी गेम खेलें।`;
      }
      return `All scheduled activities for today are completed! Great job maintaining daily structure and regularity.`;
    }
    if (lang === 'hi') {
      return `आज का अनुशंसित कार्यक्रम:\n• सुबह 8:00 AM - दवा व हल्का नाश्ता\n• 10:30 AM - बागीचे में टहलना\n• 4:00 PM - 'Suh Tah Lam' या 'Dhopkhel' खेल\n• 7:30 PM - रात्रि भोजन और परिजनों से बात`;
    }
    return t('ai.responses.schedule') || `Today's schedule: 8:00 AM - Morning medication & breakfast, 10:30 AM - Gentle garden walk, 4:00 PM - Brain exercises, 8:00 PM - Evening family check-in.`;
  }

  // -------------------------------------------------------------
  // 5. CVI (COGNITIVE VITALITY INDEX) & PROGRESS
  // -------------------------------------------------------------
  if (query.includes('cvi') || query.includes('vitality') || query.includes('score') || query.includes('progress') || query.includes('kaisa chal raha') || query.includes('performance') || query.includes('accuracy') || query.includes('report') || query.includes('doing')) {
    if (cviScore) {
      if (lang === 'hi') {
        return `📊 ${pName} जी की वर्तमान कॉग्निटिव रिपोर्ट:\n• कॉग्निटिव वाइटैलिटी इंडेक्स (CVI): ${cviScore}\n• कुल पूरे किए गए अभ्यास: ${gamesToday}\n• औसत सटीकता: ${overallAcc || 'सक्रिय'}\n\nयह स्कोर 70% एक्यूरेसी और 30% निरंतरता पर आधारित है। मानसिक स्वास्थ्य बहुत स्थिर और उत्साहजनक है!`;
      }
      return `📊 Cognitive Vitality Summary for ${pName}:\n• Cognitive Vitality Index (CVI): ${cviScore}\n• Total Verified Game Sessions: ${gamesToday}\n• Aggregate Accuracy: ${overallAcc || 'Active'}\n\nStatus is calibrated and healthy. Regular daily play helps maintain neurological recall pathways.`;
    }
    if (lang === 'hi') {
      return `CVI स्कोर कैलिब्रेट करने के लिए कम से कम 3 पूरे गेम राउंड पूरे करने होते हैं। अभी डेटा इकट्ठा हो रहा है। आज एक गेम खेलें ताकि आपकी नई प्रगति रिपोर्ट तैयार हो सके!`;
    }
    return `${pName}'s cognitive vitality is actively gathering calibration data. Completing 3 or more game sessions unlocks the full CVI radar and domain breakdown.`;
  }

  // -------------------------------------------------------------
  // 6. SUGGEST BRAIN EXERCISES & GAMES
  // -------------------------------------------------------------
  if (query.includes('suggest') || query.includes('game') || query.includes('khel') || query.includes('exercise') || query.includes('kasrat') || query.includes('brain') || query.includes('suh tah') || query.includes('dhop') || query.includes('coconut')) {
    if (lang === 'hi') {
      return `आज के लिए अनुशंसित खेल:\n1. 🎋 Suh Tah Lam (बांस ताल): विज़ुअल मेमोरी और लयबद्ध पैटर्न याद रखने के लिए उत्तम।\n2. ⚽ Dhopkhel (धोपखेल): त्वरित ध्यान (Attention & Focus) और कैचिंग समन्वय के लिए।\n3. 🏞️ Sinaki Sthan: पूर्वोत्तर के सुंदर दृश्यों को देखकर पुरानी यादें ताज़ा करने के लिए।\n\nआप कौन सा खेल शुरू करना चाहेंगे?`;
    }
    return `Recommended cognitive exercises for today:\n1. 🎋 Suh Tah Lam (Mizo Bamboo Rhythm) — Strengthens visual pattern recognition and auditory-motor sequencing.\n2. ⚽ Dhopkhel Catch (Assam Ball Toss) — Sharpens quick visual focus and coordination.\n3. 🏞️ Sinaki Sthan (Scenic Northeast Recall) — Encourages long-term episodic memory and peaceful recognition.\n\nWhich exercise would you like to start?`;
  }

  // -------------------------------------------------------------
  // 7. FAMILY MEMBERS & LOVED ONES
  // -------------------------------------------------------------
  if (query.includes('family') || query.includes('parivar') || query.includes('rahul') || query.includes('priya') || query.includes('beta') || query.includes('beti') || query.includes('pota') || query.includes('poti') || query.includes('পৰিয়াল') || query.includes('পরিবার') || query.includes('परिवार')) {
    if (query.includes('rahul') || query.includes('ৰাহুল') || query.includes('রাহুল') || query.includes('राहुल')) {
      if (lang === 'hi') return `राहुल आपके सुपुत्र हैं। वे गुवाहाटी में सॉफ्टवेयर इंजीनियर हैं और आपसे बहुत प्रेम करते हैं। वे हर महीने आपसे मिलने आते हैं।`;
      return t('ai.responses.rahul') || `Rahul is your son. He lives in Guwahati, works as a software engineer, and visits regularly.`;
    }
    if (query.includes('priya') || query.includes('প্ৰিয়া') || query.includes('প্রিয়া') || query.includes('प्रिया')) {
      if (lang === 'hi') return `प्रिया आपकी सुपुत्री हैं। वे दिल्ली में डॉक्टर हैं और हर रविवार आपसे वीडियो कॉल पर बात करती हैं।`;
      return t('ai.responses.priya') || `Priya is your daughter. She is a doctor in Delhi and calls every Sunday.`;
    }
    if (lang === 'hi') {
      return `आपके परिवार में आपके बेटे राहुल, बेटी प्रिया, और आपकी प्यारी पोती अनीता हैं। आपका परिवार हमेशा आपके साथ है और आपकी परवाह करता है।`;
    }
    return t('ai.responses.family') || `Your family includes your son Rahul, daughter Priya, and granddaughter Anita. They love you deeply and stay closely connected.`;
  }

  // -------------------------------------------------------------
  // 8. MEMORY FORGETTING, FEAR, ANXIETY & EMOTIONAL GROUNDING
  // -------------------------------------------------------------
  if (query.includes('bhool') || query.includes('forget') || query.includes('yaad nahi') || query.includes('dar') || query.includes('scared') || query.includes('lost') || query.includes('akela') || query.includes('lonely') || query.includes('anxious') || query.includes('ghabrahat')) {
    if (lang === 'hi') {
      return `बिल्कुल घबराइए मत ${pName} जी। आप बिल्कुल सुरक्षित हैं। कभी-कभी बातें भूल जाना बहुत सामान्य है।\n\nएक लंबी और गहरी सांस लें। आप अपने घर पर हैं, और आपके अपने लोग आपके साथ हैं। आइए एक शांत सुखद याद या मनपसंद संगीत के बारे में सोचते हैं। क्या आप एक घूंट गुनगुना पानी पीना चाहेंगे?`;
    }
    return `Take a gentle, deep breath, ${pName}. You are completely safe and cared for. It is very natural to have moments where things feel foggy.\n\nLook around the room: you are in a familiar, peaceful place. Take your time. We are right here with you, step by step.`;
  }

  // -------------------------------------------------------------
  // 9. CULTURAL STORIES & FOLKLORE
  // -------------------------------------------------------------
  if (query.includes('story') || query.includes('kahani') || query.includes('kotha') || query.includes('bihu') || query.includes('chapchar') || query.includes('folk') || query.includes('katha') || query.includes('hills')) {
    if (lang === 'hi') {
      return `यहाँ पूर्वोत्तर की एक सुंदर स्मृति है:\n\n"वसंत ऋतु में मिज़ोरम की हरी पहाड़ियों पर चापचार कुट (Chapchar Kut) का उल्लास छा जाता है। बांस की खनकती ताल पर युवा पारंपरिक धुन गाते हैं, और गाँव के बुजुर्ग बरगद की छांव में बैठकर मीठे पकवानों का आनंद लेते हैं..."\n\nक्या आप 'Xuworoni Kotha' (मेमोरी स्टोरीज़) गेम खेलना चाहेंगे?`;
    }
    return `Here is a comforting memory from the gentle hills:\n\n"During the Chapchar Kut spring festival in the lush hills, the village drums echo softly under clear blue skies. Dancers leap gracefully between rhythmic bamboo poles while elders share songs of harvests past..."\n\nWould you like to play the Story Memory game to relive these traditional memories?`;
  }

  // -------------------------------------------------------------
  // 10. DEFAULT CONTEXTUAL EMPATHETIC FALLBACK
  // -------------------------------------------------------------
  if (lang === 'hi') {
    return isCaregiver
      ? `मैं ${pName} जी की देखरेख में आपकी सहायता के लिए तैयार हूँ। आप मुझसे उनके गेम स्कोर (CVI), दवाइयों के समय, या संज्ञानात्मक अभ्यासों के बारे में पूछ सकते हैं।`
      : `मैं हर कदम पर आपके साथ हूँ ${pName} जी। आप मुझसे अपनी दवाइयों, परिवार, आज के शेड्यूल, या किसी खेल के बारे में कभी भी पूछ सकते हैं। आप क्या जानना चाहेंगे?`;
  }

  if (lang === 'as') {
    return `মই আপোনাৰ লগত আছোঁ। আপুনি আপোনাৰ ঔষধ, আজিৰ কাৰ্যসূচী, বা পৰিয়ালৰ বিষয়ে সুধিব পাৰে।`;
  }

  if (lang === 'bn') {
    return `আমি সবসময় আপনার সাথে আছি। আপনি আপনার ওষুধ, আজকের রুটিন, বা পরিবারের বিষয়ে জানতে চাইতে পারেন।`;
  }

  return isCaregiver
    ? `I'm monitoring ${pName}'s daily routines and memory engagement. You can ask me about game scores (CVI), schedule completion, or care suggestions.`
    : `I'm here with you always, ${pName}. Take your time, enjoy today's moments, and feel free to ask me about medicines, daily schedules, or your family!`;
};