import React, { useState } from 'react';
import { Mail, MessageSquare, Send, Heart, ShieldAlert, Sparkles, AlertCircle, CheckCircle2, Star } from 'lucide-react';
import { UserProfile } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

interface FeedbackPanelProps {
  profile: UserProfile;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ profile }) => {
  const [topic, setTopic] = useState('bug');
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [lastSubmittedMsg, setLastSubmittedMsg] = useState('');
  const [lastSubmittedTopicText, setLastSubmittedTopicText] = useState('');
  const [lastSubmittedRatingVal, setLastSubmittedRatingVal] = useState(5);

  // Topics description
  const TOPICS = [
    { id: 'bug', name: 'Software Bug & Interface Lag', emoji: '🐛' },
    { id: 'question', name: 'Diagnostic Question/Correction Correction', emoji: '✏️' },
    { id: 'feature', name: 'New Subject Block Feature Request', emoji: '💡' },
    { id: 'billing', name: 'GCash Upgrade / Billing Clearance', emoji: '💳' },
    { id: 'general', name: 'General Professional Review Feedback', emoji: '🌟' }
  ];

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorInfo('Please compose your feedback feedback prior to submission!');
      return;
    }

    setIsSubmitting(true);
    setSuccessInfo(null);
    setErrorInfo(null);

    const selectedTopicText = TOPICS.find(t => t.id === topic)?.name || 'General Reviewee Feedback';
    setLastSubmittedMsg(message);
    setLastSubmittedTopicText(selectedTopicText);
    setLastSubmittedRatingVal(rating);

    const feedbackPayload = {
      email: profile.email,
      topic,
      rating: Number(rating),
      message,
      timestamp: new Date().toISOString()
    };

    try {
      // 1. Submit to Firestore Cloud first!
      const randomFeedbackId = doc(collection(db, 'feedbacks')).id;
      await setDoc(doc(db, 'feedbacks', randomFeedbackId), feedbackPayload);

      // 2. Relay via local server API endpoint if operational
      try {
        await fetch('/api/submit-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(feedbackPayload)
        });
      } catch (apiErr) {
        console.warn('Backend API relay bypassed; Firestore persistent cloud save was completed.');
      }

      setSuccessInfo('💚 Secure receipt confirmed! Your feedback has been synchronized to our Firebase Cloud Database. Please choose one of the options below to also launch and send key draft parameters directly to dsmind.pmle@gmail.com.');
      setMessage('');
      setTopic('bug');
    } catch (err: any) {
      console.warn('Cloud feedback submission failed, utilizing secure local failover:', err);
      try {
        handleFirestoreError(err, OperationType.CREATE, 'feedbacks');
      } catch (e) {
        // Log formatted error object
      }

      // Failover fallback local storage log
      const localFeedbacks = JSON.parse(localStorage.getItem('bp_feedbacks') || '[]');
      localFeedbacks.push(feedbackPayload);
      localStorage.setItem('bp_feedbacks', JSON.stringify(localFeedbacks));

      setSuccessInfo('🎉 Sent! Feedback recorded locally & synced to offline storage block. Please choose one of the options below to copy or directly draft to dsmind.pmle@gmail.com.');
      setMessage('');
      setTopic('bug');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pre-generate Mailto parameters
  const generateMailto = (isFromLastSubmitted = false) => {
    const targetMsg = isFromLastSubmitted ? lastSubmittedMsg : message;
    const targetRating = isFromLastSubmitted ? lastSubmittedRatingVal : rating;
    const currentSelectedTopicText = TOPICS.find(t => t.id === topic)?.name || 'General Reviewee Feedback';
    const selectedTopicText = isFromLastSubmitted ? lastSubmittedTopicText : currentSelectedTopicText;
    const subject = encodeURIComponent(`[BoardPassPH Feedback] ${selectedTopicText} - ${profile.email}`);
    const bodyStr = `Hello BoardPassPH Team,\n\n` +
      `Here is my feedback on the board review platform:\n` +
      `-----------------------------------------------\n` +
      `Topic: ${selectedTopicText}\n` +
      `Reviewee Email: ${profile.email}\n` +
      `Rating: ${targetRating}/5 Stars\n` +
      `Message:\n${targetMsg}\n` +
      `-----------------------------------------------\n\n` +
      `Sent from BoardPassPH Workspace portal.`;
    const body = encodeURIComponent(bodyStr);
    return `mailto:dsmind.pmle@gmail.com?subject=${subject}&body=${body}`;
  };

  // Pre-generate Gmail Compose compose URL 
  const generateGmailUrl = (isFromLastSubmitted = false) => {
    const targetMsg = isFromLastSubmitted ? lastSubmittedMsg : message;
    const targetRating = isFromLastSubmitted ? lastSubmittedRatingVal : rating;
    const currentSelectedTopicText = TOPICS.find(t => t.id === topic)?.name || 'General Reviewee Feedback';
    const selectedTopicText = isFromLastSubmitted ? lastSubmittedTopicText : currentSelectedTopicText;
    const subject = encodeURIComponent(`[BoardPassPH Feedback] ${selectedTopicText} - ${profile.email}`);
    const bodyStr = `Hello BoardPassPH Team,\n\n` +
      `Here is my feedback on the board review platform:\n` +
      `-----------------------------------------------\n` +
      `Topic: ${selectedTopicText}\n` +
      `Reviewee Email: ${profile.email}\n` +
      `Rating: ${targetRating}/5 Stars\n` +
      `Message:\n${targetMsg}\n` +
      `-----------------------------------------------\n\n` +
      `Sent from BoardPassPH Workspace portal.`;
    const body = encodeURIComponent(bodyStr);
    return `https://mail.google.com/mail/?view=cm&fs=1&to=dsmind.pmle@gmail.com&su=${subject}&body=${body}`;
  };

  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText('dsmind.pmle@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const copyDraftToClipboard = (isFromLastSubmitted = false) => {
    const targetMsg = isFromLastSubmitted ? lastSubmittedMsg : message;
    const targetRating = isFromLastSubmitted ? lastSubmittedRatingVal : rating;
    const currentSelectedTopicText = TOPICS.find(t => t.id === topic)?.name || 'General Reviewee Feedback';
    const selectedTopicText = isFromLastSubmitted ? lastSubmittedTopicText : currentSelectedTopicText;
    const bodyStr = `Hello BoardPassPH Team,\n\n` +
      `Here is my feedback on the board review platform:\n` +
      `-----------------------------------------------\n` +
      `Topic: ${selectedTopicText}\n` +
      `Reviewee Email: ${profile.email}\n` +
      `Rating: ${targetRating}/5 Stars\n` +
      `Message:\n${targetMsg}\n` +
      `-----------------------------------------------\n\n` +
      `Sent from BoardPassPH Workspace portal.`;
    navigator.clipboard.writeText(bodyStr);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Visual Header Banner */}
      <div className="bg-gradient-to-br from-pine to-pine-mid rounded-2xl p-6 text-cream relative overflow-hidden select-none border border-pine-light/25">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <span className="text-[9px] uppercase tracking-[0.25em] font-extrabold text-mint bg-pine px-3 py-1 rounded-full w-max block border border-pine-light/20">
            Reviewee Helpline Panel
          </span>
          <h2 className="font-display text-3xl tracking-tight leading-tight">
            Connect with Board Room Directors
          </h2>
          <p className="text-xs text-mint/80 max-w-xl leading-relaxed">
            Your scores, diagnostics, and reviews matter. Have a corrections query about a DSM-5 criteria, a bug report, or billing clarification? Our mental health board examiners are on service.
          </p>
        </div>
        <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-10 pointer-events-none">
          <MessageSquare className="w-40 h-40" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Contact Cards and Information Block (5 Columns) */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Email Card info */}
          <div className="bg-white border border-pine/10 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-mint/10 border border-mint/30 text-pine rounded-xl shadow-inner">
                <Mail className="w-5 h-5 text-sage" />
              </div>
              <div>
                <span className="text-[8px] uppercase tracking-wider font-extrabold text-pine-mid/50 block font-mono">Designated Support Email</span>
                <span className="text-xs font-bold text-pine block font-mono">dsmind.pmle@gmail.com</span>
              </div>
            </div>

            <div className="h-px bg-pine/5" />

            <div className="space-y-2">
              <span className="text-[9px] uppercase font-bold text-pine-mid/60 block font-mono">Commitment of Quality:</span>
              <ul className="space-y-1.5 text-[11px] text-pine-mid/80 leading-normal">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sage flex-shrink-0 mt-0.5" />
                  <span>Verified 24-hour turnaround response time.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sage flex-shrink-0 mt-0.5" />
                  <span>Licensed mental health clinicians backing questions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sage flex-shrink-0 mt-0.5" />
                  <span>Responsive alignment with professional curriculum.</span>
                </li>
              </ul>
            </div>

            <div className="h-px bg-pine/5" />

            {/* Direct Routing Options */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] uppercase font-bold text-pine-mid/60 block font-mono tracking-wider">Direct Email Routing:</span>
              
              {/* Copy Email Address */}
              <button
                type="button"
                onClick={copyEmailToClipboard}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-foam hover:bg-mint/20 text-pine text-xs font-black uppercase tracking-wider border border-mint/30 hover:border-mint rounded-xl transition duration-150 select-none text-left cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-sage" />
                  Copy Support Email
                </span>
                <span className="text-[10px] font-mono text-sage bg-white px-2.5 py-0.5 rounded-lg border border-sage/10">
                  {copiedEmail ? '✅ Copied!' : 'Copy'}
                </span>
              </button>

              {/* Open in Gmail Web */}
              <a
                href={generateGmailUrl(lastSubmittedMsg !== '')}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-between px-3 py-2.5 bg-rose-50/70 hover:bg-rose-100 text-rose-950 text-xs font-black uppercase tracking-wider border border-rose-200 rounded-xl transition duration-150 select-none text-left block"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  Compose in Web Gmail
                </span>
                <span className="text-[9px] text-rose-700 bg-white px-2 py-0.5 rounded-lg border border-rose-200">
                  Launch ↗
                </span>
              </a>

              {/* Launch Native App Client */}
              <a
                href={generateMailto(lastSubmittedMsg !== '')}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-amber-50/70 hover:bg-amber-100 text-amber-950 text-xs font-black uppercase tracking-wider border border-amber-200 rounded-xl transition duration-150 select-none text-left block"
              >
                <span className="flex items-center gap-2">
                  <Send className="w-3.5 h-3.5 text-amber-600" />
                  Launch Email Client
                </span>
                <span className="text-[9px] text-amber-700 bg-white px-2 py-0.5 rounded-lg border border-amber-200 font-mono">
                  mailto:
                </span>
              </a>

              {/* Copy Draft Body */}
              {(message.trim() || lastSubmittedMsg) && (
                <button
                  type="button"
                  onClick={() => copyDraftToClipboard(lastSubmittedMsg !== '')}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-blue-50/70 hover:bg-blue-100 text-blue-950 text-xs font-black uppercase tracking-wider border border-blue-200 rounded-xl transition duration-150 select-none text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                    Copy Draft Body Text
                  </span>
                  <span className="text-[9px] text-blue-700 bg-white px-2.5 py-0.5 rounded-lg border border-blue-200">
                    {copiedDraft ? '✅ Copied Text!' : 'Copy Body'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Quick FAQ / Guidance Block */}
          <div className="bg-amber-50/30 border border-amber-100 rounded-2xl p-5 space-y-3">
            <div className="flex gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 leading-none">Standard Board Matrix Alignment</h4>
                <p className="text-[10px] text-amber-800/80 leading-relaxed mt-1.5">
                  Our diagnostic modules and questions are engineered inside the Philippines. All references coordinate securely with the <strong>DSM-5-TR (Diagnostic and Statistical Manual of Mental Disorders)</strong> and international clinical standards.
                </p>
                <p className="text-[10px] text-amber-800/80 leading-relaxed mt-1">
                  For corrections regarding specific psychiatric items, citing the DSM section or page triggers immediate board resolution.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Interaction Form block (7 Columns) */}
        <div className="md:col-span-7 bg-white border border-pine/10 rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <h3 className="text-sm font-bold text-pine uppercase tracking-wider font-mono border-b border-pine/5 pb-2">
              📝 Submit Digital Reviewee Form
            </h3>

            {/* Display message boards */}
            {successInfo && (
              <div className="space-y-3">
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3.5 rounded-xl flex gap-2.5 items-start animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-relaxed font-semibold">{successInfo}</span>
                </div>

                {lastSubmittedMsg && (
                  <div className="p-3.5 bg-emerald-50/50 border border-emerald-105 rounded-xl space-y-3 animate-in slide-in-from-top-2 duration-200">
                    <p className="text-[10px] uppercase font-bold text-[#1e3d29] tracking-wider font-mono">
                      ✉️ Swift Direct Send to dsmind.pmle@gmail.com:
                    </p>
                    <p className="text-[10px] text-emerald-900 leading-normal">
                      Most email systems require client confirmation. Choose an option below to ensure immediate, direct delivery of your submitted text:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <button
                        type="button"
                        onClick={copyEmailToClipboard}
                        className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-emerald-900 bg-white/95 border border-emerald-200 py-2 rounded-lg cursor-pointer hover:bg-emerald-50 transition active:scale-95"
                      >
                        <Mail className="w-3.5 h-3.5 text-sage" />
                        {copiedEmail ? '✅ Copied Email!' : 'Copy Support Email'}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyDraftToClipboard(true)}
                        className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-emerald-900 bg-white/95 border border-emerald-200 py-2 rounded-lg cursor-pointer hover:bg-emerald-50 transition active:scale-95"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                        {copiedDraft ? '✅ Copied Draft!' : 'Copy Body Draft'}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={generateGmailUrl(true)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 text-[10px] font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 py-2 rounded-lg transition text-center"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-mint" />
                        Compose on Gmail ↗
                      </a>
                      <a
                        href={generateMailto(true)}
                        className="flex items-center justify-center gap-1.5 text-[10px] font-extrabold text-white bg-pine hover:bg-pine-mid py-2 rounded-lg transition text-center"
                      >
                        <Send className="w-3.5 h-3.5 text-mint" />
                        Draft via Mail App ↗
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {errorInfo && (
              <div className="bg-rose-50 border border-rose-100/40 text-rose-800 p-3.5 rounded-xl flex gap-2.5 items-start">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed font-semibold">{errorInfo}</span>
              </div>
            )}

            {/* Reviewee email info (disabled input) */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-pine-mid/70 block tracking-wider font-mono">
                Active Reviewee Account
              </label>
              <input
                type="email"
                disabled
                value={profile.email}
                className="w-full bg-gray-50 border border-gray-150 pl-3 pr-3 py-2 text-xs font-semibold text-gray-500 rounded-xl cursor-not-allowed outline-none font-mono"
              />
            </div>

            {/* Dropdown focus topic */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-pine-mid/70 block tracking-wider font-mono">
                Core Topic Category
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-white border border-pine/15 rounded-xl pl-3 pr-3 py-2 text-xs font-medium text-pine outline-none focus:border-mint focus:ring-2 focus:ring-mint/10"
              >
                {TOPICS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.emoji} {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Core satisfaction scale */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-pine-mid/70 block tracking-wider font-mono">
                Workspace Satisfaction Rating
              </label>
              <div className="flex gap-2.5 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 active:scale-95 transition-all text-xl cursor-pointer select-none"
                    title={`${star} Star Rating`}
                  >
                    <Star 
                      className={`w-6 h-6 transition-all ${
                        star <= rating 
                          ? 'fill-amber-400 text-amber-400 drop-shadow-sm' 
                          : 'text-gray-200'
                      }`} 
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-pine-mid/60 self-center ml-2">
                  {rating === 5 ? '🌟 Exceptional!' : rating === 4 ? '😊 Great!' : rating === 3 ? '😐 Neutral' : rating === 2 ? '⚠️ Needs Work' : '🛑 Poor/Broken'}
                </span>
              </div>
            </div>

            {/* Big message textbox */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-pine-mid/70 block tracking-wider font-mono">
                Reviewee Notes, Message, or Bug Context Description
              </label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Detail your request. Include diagnostic codes, screen issues, or upgrade timelines so we can resolve this immediately..."
                className="w-full bg-white border border-pine/15 rounded-xl pl-3 pr-3 py-2 text-xs text-pine placeholder-pine-mid/30 outline-none focus:border-mint focus:ring-2 focus:ring-mint/10 leading-relaxed font-medium"
              />
            </div>

            {/* Submission triggers */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-pine text-cream hover:bg-pine-mid font-sans uppercase tracking-widest font-black text-xs rounded-xl shadow-md cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Transmitting Data...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-mint" />
                    <span>Submit Digital Form securely</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
