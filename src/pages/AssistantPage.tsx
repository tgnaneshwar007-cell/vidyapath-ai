import React, { useState, useRef, useEffect } from 'react';
import { AIChatMessage, Scholarship } from '@/types';
import { AIAssistantService } from '@/services/aiAssistantService';
import { ScholarshipRepository } from '@/services/scholarshipRepository';
import { useTranslation } from '@/locales/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/services/supabaseClient';
import { Button } from '@/components/ui/button';
import { 
  Send, 
  RotateCcw, 
  ExternalLink, 
  ThumbsUp, 
  ThumbsDown, 
  ShieldCheck, 
  Bot
} from 'lucide-react';

export const AssistantPage: React.FC = () => {
  const { language, t } = useTranslation();
  const { user } = useAuth();
  const [schemes, setSchemes] = useState<Scholarship[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    ScholarshipRepository.getScholarshipsList({ pageSize: 50 })
      .then((data) => {
        if (data && data.length > 0) {
          setSchemes(data);
        }
      })
      .catch((err) => {
        console.warn('AssistantPage: failed to fetch live scholarships:', err);
      });
  }, []);

  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome_msg',
      role: 'assistant',
      content: language === 'te' 
        ? 'నమస్కారం! నేను విద్యాపథ్ AI అసిస్టెంట్‌ని. అధికారిక భారతీయ స్కాలర్‌షిప్‌లు, అర్హత నిబంధనలు లేదా అవసరమైన పత్రాల గురించి మీ సందేహాలను అడగండి.'
        : language === 'hi'
        ? 'नमस्ते! मैं विद्यापथ AI सहायक हूँ। आधिकारिक भारतीय छात्रवृत्तियों, पात्रता नियमों अथवा आवश्यक दस्तावेजों से संबंधित अपने प्रश्न पूछें।'
        : 'Hello! I am VidyaPath AI. Ask me anything about verified Indian scholarships, eligibility criteria, required documents, or application procedures.',
      language,
      timestamp: new Date().toISOString(),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || loading) return;

    const userMessage: AIChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: q,
      language,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setLoading(true);

    try {
      const response = await AIAssistantService.askAssistant(q, messages, language, schemes);

      const botMessage: AIChatMessage = {
        id: `msg_bot_${Date.now()}`,
        role: 'assistant',
        content: response.content,
        citations: response.citations,
        language: response.language,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);

      // Asynchronously log to Supabase if client is connected
      if (supabase) {
        (async () => {
          try {
            let convId = conversationId;
            if (!convId) {
              const { data: conv } = await supabase
                .from('assistant_conversations')
                .insert({
                  user_id: user?.id || null,
                  title: q.slice(0, 60),
                  language,
                })
                .select('id')
                .single();
              if (conv) {
                convId = conv.id;
                setConversationId(conv.id);
              }
            }
            if (convId) {
              await supabase.from('assistant_messages').insert([
                {
                  conversation_id: convId,
                  role: 'user',
                  content: q,
                  language,
                },
                {
                  conversation_id: convId,
                  role: 'assistant',
                  content: response.content,
                  language: response.language,
                  citations: response.citations || [],
                },
              ]);
            }
          } catch (dbErr) {
            console.warn('Silent fallback: could not persist conversation to Supabase', dbErr);
          }
        })();
      }
    } catch (err) {
      console.error(err);
      const errorMessage: AIChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        content: 'I encountered an error retrieving verified records. Please try asking again in a moment.',
        language,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome_msg_${Date.now()}`,
        role: 'assistant',
        content: language === 'te' 
          ? 'చాట్ క్లియర్ చేయబడింది. కొత్త ప్రశ్న అడగండి.'
          : language === 'hi'
          ? 'बातचीत साफ़ कर दी गई है। एक नया प्रश्न पूछें।'
          : 'Conversation cleared. Ask any scholarship question to start afresh.',
        language,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const handleFeedback = (msgId: string, rating: 'helpful' | 'unhelpful') => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, feedback: rating } : m))
    );
  };

  const promptSuggestions = [
    t.assistantIntro.examplePrompt1,
    t.assistantIntro.examplePrompt2,
    t.assistantIntro.examplePrompt3,
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 md:py-10 flex flex-col h-[calc(100vh-8rem)] min-h-[600px]">
      {/* Top Assistant Bar */}
      <div className="flex items-center justify-between border-b border-brand-border pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-black text-brand-orange shadow-subtle">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-brand-black flex items-center gap-2">
              <span>{t.assistant.title}</span>
              <span className="text-[10px] font-mono bg-brand-orange-subtle text-brand-orange px-1.5 py-0.5 rounded font-semibold uppercase">
                Grounded RAG
              </span>
            </h1>
            <p className="text-xs text-brand-mutedText">
              {t.assistant.subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="flex items-center gap-1.5 text-xs text-brand-mutedText hover:text-brand-black transition-colors rounded border border-brand-border px-2.5 py-1.5"
          title="Clear Conversation"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t.assistant.clearHistory}</span>
        </button>
      </div>

      {/* Chat Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`rounded-xl px-4 py-3 max-w-[90%] sm:max-w-[80%] text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-brand-black text-white'
                  : 'border border-brand-border bg-brand-surface text-brand-black shadow-card'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Citations Box for Assistant Responses */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-brand-border/60 text-xs">
                  <span className="font-semibold text-brand-black flex items-center gap-1 mb-1.5 font-mono text-[11px] uppercase">
                    <ShieldCheck className="h-3 w-3 text-brand-success" />
                    <span>{t.assistant.sourcesUsed}</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.citations.map((c) => (
                      <a
                        key={c.scholarship_id}
                        href={c.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded bg-brand-storm-subtle/70 px-2 py-1 text-[11px] text-brand-storm-dark hover:text-brand-orange transition-colors"
                      >
                        <span className="line-clamp-1">{c.title}</span>
                        <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Timestamp & Feedback for Bot Messages */}
            {msg.role === 'assistant' && msg.id !== 'welcome_msg' && (
              <div className="mt-1 flex items-center gap-3 text-[11px] text-brand-mutedText pl-1">
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleFeedback(msg.id, 'helpful')}
                    className={`p-1 rounded hover:bg-brand-storm-subtle ${msg.feedback === 'helpful' ? 'text-brand-success font-bold' : ''}`}
                    title="Helpful response"
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleFeedback(msg.id, 'unhelpful')}
                    className={`p-1 rounded hover:bg-brand-storm-subtle ${msg.feedback === 'unhelpful' ? 'text-brand-danger font-bold' : ''}`}
                    title="Not helpful"
                  >
                    <ThumbsDown className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-brand-mutedText p-3">
            <div className="h-2 w-2 rounded-full bg-brand-orange animate-ping" />
            <span>Consulting verified scholarship database...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Pre-canned Suggestions */}
      {messages.length <= 2 && (
        <div className="py-2">
          <div className="text-[11px] text-brand-mutedText uppercase font-mono mb-1.5">
            {t.assistant.suggestedQuestions}:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {promptSuggestions.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-xs text-brand-storm-dark hover:border-brand-storm hover:text-brand-black transition-colors text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form Bar */}
      <div className="pt-3 border-t border-brand-border">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={t.assistant.inputPlaceholder}
            disabled={loading}
            className="flex-1 rounded-lg border border-brand-border bg-brand-surface px-4 py-2.5 text-sm text-brand-black placeholder:text-brand-mutedText focus:outline-none focus:border-brand-storm focus:ring-1 focus:ring-brand-orange"
          />
          <Button type="submit" variant="primary" disabled={!inputQuery.trim() || loading} className="shrink-0">
            <Send className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">{t.assistant.send}</span>
          </Button>
        </form>

        <p className="mt-2 text-[11px] text-center text-brand-mutedText">
          {t.assistant.disclaimer}
        </p>
      </div>
    </div>
  );
};
