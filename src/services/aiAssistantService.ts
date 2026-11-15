import { Language, AISourceCitation, AIChatMessage, Scholarship } from '../types';
import { VERIFIED_SCHOLARSHIPS } from '../data/verifiedScholarships';

export interface AssistantResponse {
  content: string;
  citations: AISourceCitation[];
  language: Language;
}

export class AIAssistantService {
  /**
   * Retrieve relevant scholarship records matching the student's query keywords
   */
  static retrieveGroundedContext(
    query: string, 
    schemesList?: Scholarship[]
  ): {
    matchedScholarships: Scholarship[];
    citations: AISourceCitation[];
  } {
    const pool = schemesList && schemesList.length > 0 ? schemesList : VERIFIED_SCHOLARSHIPS;
    const q = query.toLowerCase().trim();
    const words = q.split(/\s+/).filter(w => w.length > 2);

    const matches = pool.filter((s) => {
      // Check titles across all languages
      const inTitle = 
        s.title.en.toLowerCase().includes(q) ||
        s.title.te.toLowerCase().includes(q) ||
        s.title.hi.toLowerCase().includes(q);
      
      // Check provider
      const inProvider = 
        s.provider.en.toLowerCase().includes(q) ||
        s.provider.te.toLowerCase().includes(q) ||
        s.provider.hi.toLowerCase().includes(q);

      // Check categories or keywords
      const inWords = words.some(w => 
        s.slug.toLowerCase().includes(w) ||
        s.applicable_categories.some(c => c.toLowerCase().includes(w)) ||
        s.eligible_states.some(st => st.toLowerCase().includes(w)) ||
        (s.award_amount && q.includes('amount')) ||
        (w === 'girl' && s.applicable_genders.includes('female')) ||
        (w === 'engineering' && s.education_levels.includes('undergraduate')) ||
        (w === 'minority' && s.applicable_categories.includes('Minority'))
      );

      return inTitle || inProvider || inWords;
    });

    // If query has no specific keyword hit, return top 2 relevant schemes
    const selected = matches.length > 0 ? matches.slice(0, 3) : pool.slice(0, 2);

    const citations: AISourceCitation[] = selected.map((s) => ({
      scholarship_id: s.id,
      title: s.title.en,
      official_url: s.official_url,
      verified_date: s.last_verified_at,
    }));

    return { matchedScholarships: selected, citations };
  }

  /**
   * Process a chat message with verified RAG grounding
   */
  static async askAssistant(
    userQuery: string,
    _history: AIChatMessage[],
    lang: Language = 'en',
    schemesList?: Scholarship[]
  ): Promise<AssistantResponse> {
    const { matchedScholarships, citations } = this.retrieveGroundedContext(userQuery, schemesList);

    const provider = import.meta.env.VITE_AI_PROVIDER || 'mock';
    const openrouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

    // Check if live API key is configured
    if (provider === 'openrouter' && openrouterKey) {
      try {
        return await this.callOpenRouter(userQuery, matchedScholarships, citations, lang);
      } catch (err) {
        console.warn('OpenRouter call failed, falling back to grounded rule responder:', err);
      }
    } else if (provider === 'openai' && openaiKey) {
      try {
        return await this.callOpenAI(userQuery, matchedScholarships, citations, lang);
      } catch (err) {
        console.warn('OpenAI call failed, falling back to grounded rule responder:', err);
      }
    } else if (provider === 'gemini' && geminiKey) {
      try {
        return await this.callGemini(userQuery, matchedScholarships, citations, lang);
      } catch (err) {
        console.warn('Gemini call failed, falling back to grounded rule responder:', err);
      }
    }

    // High-quality deterministic multilingual grounded response
    return this.generateGroundedResponse(userQuery, matchedScholarships, citations, lang);
  }

  /**
   * Deterministic grounded response generator with zero hallucination guarantee
   */
  private static generateGroundedResponse(
    query: string,
    schemes: Scholarship[],
    citations: AISourceCitation[],
    lang: Language
  ): AssistantResponse {
    const q = query.toLowerCase();
    const primary = schemes[0];

    // English responses
    if (lang === 'en') {
      if (q.includes('document') || q.includes('certificate') || q.includes('required')) {
        const docList = primary.required_documents
          .map((d, i) => `${i + 1}. **${d.name.en}**${d.description?.en ? ` (${d.description.en})` : ''}`)
          .join('\n');

        return {
          content: `Based on verified guidelines for **${primary.title.en}**, the official required documents are:\n\n${docList}\n\n*Important:* Please verify that certificates (Income, Caste) are valid for the current financial year before applying on the official portal.`,
          citations,
          language: 'en',
        };
      }

      if (q.includes('deadline') || q.includes('last date') || q.includes('date')) {
        const deadlineText = primary.closing_date 
          ? `The confirmed application deadline is **${new Date(primary.closing_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}**.`
          : `The application deadline has not yet been announced officially for this cycle.`;

        return {
          content: `Regarding **${primary.title.en}**:\n\n${deadlineText}\n\nLast verified on ${primary.last_verified_at}. We strictly do not publish unverified or speculative deadlines.`,
          citations,
          language: 'en',
        };
      }

      if (q.includes('eligible') || q.includes('eligibility') || q.includes('income')) {
        const conditionsList = primary.eligibility_conditions
          .map((c, i) => `${i + 1}. ${c.description.en}`)
          .join('\n');
        
        const incomeNotice = primary.income_limit 
          ? `\n- **Income Ceiling:** Annual family income must not exceed ₹${primary.income_limit.toLocaleString('en-IN')}.`
          : '\n- **Income Ceiling:** No mandatory family income limit specified.';

        return {
          content: `Official eligibility criteria for **${primary.title.en}**:\n\n${conditionsList}${incomeNotice}\n\n*Note:* VidyaPath AI cannot grant approvals. Applications must be submitted through the official portal.`,
          citations,
          language: 'en',
        };
      }

      // General scheme overview
      const schemeSummaries = schemes.map(s => 
        `### [${s.title.en}](${s.official_url})\n- **Provider:** ${s.provider.en}\n- **Benefits:** ${s.benefits.en}\n- **Income Limit:** ${s.income_limit ? `Up to ₹${s.income_limit.toLocaleString('en-IN')}` : 'Not restricted'}\n- **Official Portal:** [${s.official_url}](${s.official_url})`
      ).join('\n\n');

      return {
        content: `Here are the verified scholarship details matching your query:\n\n${schemeSummaries}\n\n*Disclaimer:* VidyaPath AI is an informational intelligence platform and not a government body.`,
        citations,
        language: 'en',
      };
    }

    // Telugu responses
    if (lang === 'te') {
      if (q.includes('document') || q.includes('పత్రాలు') || q.includes('సర్టిఫికెట్')) {
        const docList = primary.required_documents
          .map((d, i) => `${i + 1}. **${d.name.te || d.name.en}**`)
          .join('\n');

        return {
          content: `**${primary.title.te || primary.title.en}** పథకానికి అధికారికంగా అవసరమైన పత్రాలు:\n\n${docList}\n\n*ముఖ్య గమనిక:* ఆదాయ మరియు కుల ధృవీకరణ పత్రాలు ప్రస్తుత ఆర్థిక సంవత్సరానికి చెల్లుబాటు అయ్యేలా చూసుకోండి.`,
          citations,
          language: 'te',
        };
      }

      const schemeSummariesTe = schemes.map(s => 
        `### ${s.title.te || s.title.en}\n- **సంస్థ:** ${s.provider.te || s.provider.en}\n- **ప్రయోజనాలు:** ${s.benefits.te || s.benefits.en}\n- **ఆదాయ పరిమితి:** ${s.income_limit ? `గరిష్టంగా ₹${s.income_limit.toLocaleString('en-IN')}` : 'పరిమితి లేదు'}\n- **అధికారిక లింక్:** ${s.official_url}`
      ).join('\n\n');

      return {
        content: `మీ ప్రశ్నకు సంబంధించిన అధికారిక మరియు ధృవీకరించబడిన స్కాలర్‌షిప్ వివరాలు ఇక్కడ ఉన్నాయి:\n\n${schemeSummariesTe}\n\n*గమనిక:* విద్యాపథ్ AI సమాచార సహాయ సాధనం మాత్రమే. దరఖాస్తులను అధికారిక వెబ్‌సైట్ ద్వారా మాత్రమే సమర్పించాలి.`,
        citations,
        language: 'te',
      };
    }

    // Hindi responses
    if (q.includes('document') || q.includes('दस्तावेज') || q.includes('प्रमाण')) {
      const docList = primary.required_documents
        .map((d, i) => `${i + 1}. **${d.name.hi || d.name.en}**`)
        .join('\n');

      return {
        content: `**${primary.title.hi || primary.title.en}** के लिए आधिकारिक रूप से आवश्यक दस्तावेज़:\n\n${docList}\n\n*महत्वपूर्ण:* आवेदन करने से पूर्व सुनिश्चित करें कि जाति एवं आय प्रमाण पत्र वर्तमान वित्तीय वर्ष के लिए वैध हों।`,
        citations,
        language: 'hi',
      };
    }

    const schemeSummariesHi = schemes.map(s => 
      `### ${s.title.hi || s.title.en}\n- **प्रदाता:** ${s.provider.hi || s.provider.en}\n- **लाभ:** ${s.benefits.hi || s.benefits.en}\n- **आय सीमा:** ${s.income_limit ? `अधिकतम ₹${s.income_limit.toLocaleString('en-IN')}` : 'कोई अनिवार्य सीमा नहीं'}\n- **आधिकारिक पोर्टल:** ${s.official_url}`
    ).join('\n\n');

    return {
      content: `आपकी खोज से संबंधित सत्यापित छात्रवृत्ति विवरण निम्नानुसार हैं:\n\n${schemeSummariesHi}\n\n*अस्वीकरण:* विद्यापथ AI एक स्वतंत्र सूचना मंच है, सरकारी निकाय नहीं। कृपया आधिकारिक पोर्टल पर आवेदन करें।`,
      citations,
      language: 'hi',
    };
  }

  /**
   * OpenRouter Provider Integration
   */
  private static async callOpenRouter(
    query: string,
    schemes: Scholarship[],
    citations: AISourceCitation[],
    lang: Language
  ): Promise<AssistantResponse> {
    const key = import.meta.env.VITE_OPENROUTER_API_KEY;
    const model = import.meta.env.VITE_AI_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';

    const systemPrompt = `You are VidyaPath AI, a trusted scholarship advisor for Indian students.
STRICT GUIDELINES:
1. Answer strictly based on the following verified Indian scholarship records:
${JSON.stringify(schemes, null, 2)}
2. Respond strictly in language code: "${lang}" (English for en, Telugu for te, Hindi for hi).
3. Do NOT invent eligibility rules, amounts, or deadlines.
4. Explicitly state that VidyaPath AI is not a government agency and cannot guarantee approval.
5. Provide relevant official URLs.`;

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': 'https://vidyapath.ai',
        'X-Title': 'VidyaPath AI',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenRouter responded with status ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || 'Unable to generate response.';
    return { content, citations, language: lang };
  }

  /**
   * OpenAI Compatible Provider Integration
   */
  private static async callOpenAI(
    query: string,
    schemes: Scholarship[],
    citations: AISourceCitation[],
    lang: Language
  ): Promise<AssistantResponse> {
    const key = import.meta.env.VITE_OPENAI_API_KEY;
    const model = import.meta.env.VITE_AI_MODEL || 'gpt-4o-mini';

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { 
            role: 'system', 
            content: `You are VidyaPath AI. Ground your answer strictly in these verified schemes: ${JSON.stringify(schemes)}. Answer in ${lang}. Never fabricate deadlines.` 
          },
          { role: 'user', content: query },
        ],
      }),
    });

    if (!res.ok) throw new Error(`OpenAI responded with status ${res.status}`);
    const data = await res.json();
    return { content: data.choices[0].message.content, citations, language: lang };
  }

  /**
   * Google Gemini Provider Integration
   */
  private static async callGemini(
    query: string,
    schemes: Scholarship[],
    citations: AISourceCitation[],
    lang: Language
  ): Promise<AssistantResponse> {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    const model = import.meta.env.VITE_AI_MODEL || 'gemini-1.5-flash';

    const promptText = `Ground your answer strictly in these verified Indian scholarship schemes: ${JSON.stringify(schemes)}. 
User Query: ${query}
Language to respond in: ${lang}. 
Never invent facts or claim government authority.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
      }),
    });

    if (!res.ok) throw new Error(`Gemini responded with status ${res.status}`);
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
    return { content: text, citations, language: lang };
  }
}
