import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Send, Check, ShieldCheck } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Scheme Correction / Feedback');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
      <div className="border-b border-brand-border pb-6 text-center max-w-xl mx-auto">
        <h1 className="text-3xl font-extrabold text-brand-black font-display">
          Contact & Scheme Feedback
        </h1>
        <p className="mt-2 text-sm text-brand-mutedText">
          Report an updated deadline, suggest a regional scholarship, or reach our editorial desk.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="rounded-xl border border-brand-border bg-brand-surface p-5 shadow-subtle space-y-3">
            <div className="flex items-center gap-2 font-semibold text-brand-black text-sm">
              <Mail className="h-4 w-4 text-brand-orange" />
              <span>Editorial Desk</span>
            </div>
            <p className="text-xs text-brand-mutedText leading-relaxed">
              For scholarship verification inquiries or government ministry notifications:
            </p>
            <div className="text-xs font-mono text-brand-black font-semibold">
              editorial@vidyapath.ai
            </div>
          </div>

          <div className="rounded-xl border border-brand-border bg-brand-surface p-5 shadow-subtle space-y-3">
            <div className="flex items-center gap-2 font-semibold text-brand-black text-sm">
              <ShieldCheck className="h-4 w-4 text-brand-success" />
              <span>Trust & Safety</span>
            </div>
            <p className="text-xs text-brand-mutedText leading-relaxed">
              If you discover an invalid scheme link or an unverified deadline, let us know immediately.
            </p>
            <div className="text-xs font-mono text-brand-black font-semibold">
              verification@vidyapath.ai
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="rounded-xl border border-brand-border bg-brand-surface p-6 sm:p-8 shadow-card">
            {submitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-brand-success mx-auto">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-brand-black">Thank You for Your Feedback</h3>
                <p className="text-sm text-brand-mutedText max-w-sm mx-auto">
                  Your feedback helps maintain verified, high-integrity scholarship records for Indian students.
                </p>
                <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase font-mono text-brand-storm-dark mb-1">
                      Your Name
                    </label>
                    <Input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Student or Institution Name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase font-mono text-brand-storm-dark mb-1">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase font-mono text-brand-storm-dark mb-1">
                    Subject / Topic
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-black focus:outline-none"
                  >
                    <option value="Scheme Correction / Feedback">Scheme Correction / Updated Deadline</option>
                    <option value="Suggest New Scholarship">Suggest a New Verified Scholarship</option>
                    <option value="Institutional Inquiry">College / Nodal Officer Inquiry</option>
                    <option value="General Support">General Platform Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase font-mono text-brand-storm-dark mb-1">
                    Message Details
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide official gazette reference or portal link if reporting a correction..."
                    className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-black placeholder:text-brand-mutedText focus:outline-none focus:border-brand-storm"
                  />
                </div>

                <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto">
                  <Send className="h-4 w-4 mr-2" />
                  <span>Submit Inquiry</span>
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
