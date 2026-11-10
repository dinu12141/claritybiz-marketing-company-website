import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  Phone,
  RotateCcw,
  Send,
  Sparkles,
  Square,
  X,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { site } from "@/data/site";
import { generateBotReplyAsync, type Message } from "@/lib/aiBotEngine";
import { cn } from "@/utils/cn";

const INITIAL_MESSAGE: Message = {
  id: "initial-welcome",
  sender: "bot",
  text: `ආයුබෝවන්! මම **TV Clarity Capital** හි AI සහයකයා. 👋

Business Registration, Accounting, Tax, Consulting හෝ Website/Software ගැන ඕනෑම දෙයක් **සිංහලෙන්**, **Singlish** වලින් හෝ **English** වලින් කෙලින්ම අහන්න!`,
  timestamp: new Date(),
  suggestions: [
    "🏢 Business Registration",
    "📊 Accounting & Tax",
    "💻 Websites & POS",
    "📞 WhatsApp / Contact",
  ],
};

function formatMessageText(text: string, isUser: boolean, isStreaming?: boolean) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1 text-[13px] leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-0.5" />;

        const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("* ");
        const isNumbered = /^\d+\.\s/.test(trimmed);

        const content = isBullet
          ? trimmed.slice(2)
          : isNumbered
          ? trimmed.replace(/^\d+\.\s/, "")
          : trimmed;

        const parts = content.split(/(\*\*[^*]+\*\*)/g);
        const rendered = parts.map((part, pIdx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={pIdx} className={cn("font-bold", isUser ? "text-gold" : "text-navy")}>
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        const isLastLine = idx === lines.length - 1;
        const cursor = isStreaming && isLastLine ? (
          <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-royal align-middle" aria-hidden="true" />
        ) : null;

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-0.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              <div>
                {rendered}
                {cursor}
              </div>
            </div>
          );
        }

        if (isNumbered) {
          const numMatch = trimmed.match(/^(\d+)\.\s/);
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-0.5">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-royal/10 text-[10px] font-bold text-royal">
                {numMatch?.[1] ?? "•"}
              </span>
              <div>
                {rendered}
                {cursor}
              </div>
            </div>
          );
        }

        return (
          <p key={idx}>
            {rendered}
            {cursor}
          </p>
        );
      })}
    </div>
  );
}

export function AiChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamTimerRef = useRef<number | null>(null);

  const stopStreaming = () => {
    if (streamTimerRef.current !== null) {
      window.clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }
    setIsStreaming(false);
    setMessages((prev) => prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m)));
  };

  useEffect(() => {
    return () => {
      if (streamTimerRef.current !== null) window.clearInterval(streamTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setHasUnread(false);
      if (!isThinking && !isStreaming) {
        inputRef.current?.focus();
      }
    }
  }, [isOpen, messages, isThinking, isStreaming]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isThinking || isStreaming) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date(),
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    if (!textToSend) setInputValue("");
    setIsThinking(true);

    const botReply = await generateBotReplyAsync(text, nextHistory);
    setIsThinking(false);

    const botMsgId = `bot-${Date.now()}`;
    const fullText = botReply.text;
    const tokens = fullText.split(/(\s+)/);
    let cursor = 0;

    setIsStreaming(true);
    setMessages((prev) => [
      ...prev,
      {
        id: botMsgId,
        sender: "bot",
        text: "",
        timestamp: new Date(),
        topic: botReply.topic,
        actions: botReply.actions,
        suggestions: botReply.suggestions,
        isStreaming: true,
      },
    ]);

    streamTimerRef.current = window.setInterval(() => {
      // Stream 2-3 tokens per tick for snappy ChatGPT/Gemini feel
      cursor = Math.min(cursor + 3, tokens.length);
      const partial = tokens.slice(0, cursor).join("");
      const done = cursor >= tokens.length;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMsgId ? { ...m, text: partial, isStreaming: !done } : m,
        ),
      );

      if (done) {
        if (streamTimerRef.current !== null) {
          window.clearInterval(streamTimerRef.current);
          streamTimerRef.current = null;
        }
        setIsStreaming(false);
        if (!isOpen) setHasUnread(true);
      }
    }, 22);
  };

  const handleReset = () => {
    stopStreaming();
    setMessages([{ ...INITIAL_MESSAGE, timestamp: new Date() }]);
    setInputValue("");
    setIsThinking(false);
  };

  return (
    <>
      {/* Floating Trigger Button - Round Circular FAB */}
      <div className="fixed bottom-12 right-4 sm:bottom-6 sm:right-6 z-50">
        <div className="relative group">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-label="Clarity AI Assistant"
            className={cn(
              "relative flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-full shadow-[0_12px_32px_-6px_rgba(6,43,82,0.65)] transition-all duration-300 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold",
              isOpen
                ? "bg-navy text-gold ring-2 ring-gold rotate-90"
                : "bg-gradient-to-tr from-navy-deep via-navy to-royal text-gold ring-2 ring-gold/90 hover:ring-gold",
            )}
          >
            {isOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <>
                <div className="relative flex items-center justify-center">
                  <Bot className="h-6 w-6 sm:h-7 sm:w-7 text-gold transition-transform duration-300 group-hover:scale-110" />
                  <Sparkles className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 text-cyan animate-pulse" />
                </div>
                <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-navy" />
                </span>
              </>
            )}

            <span
              role="tooltip"
              className="pointer-events-none absolute right-full top-1/2 mr-3 hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition-all duration-200 group-hover:opacity-100 sm:block after:absolute after:left-full after:top-1/2 after:-translate-y-1/2 after:border-[5px] after:border-transparent after:border-l-navy"
            >
              {isOpen ? "Close Chat" : "Ask Clarity AI ✦"}
            </span>

            {hasUnread && !isOpen && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow">
                1
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Compact Executive Chat Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Clarity AI Chatbot"
          className="fixed bottom-28 right-4 sm:bottom-22 sm:right-6 z-50 flex flex-col w-[min(calc(100vw-2rem),355px)] h-[min(calc(100dvh-12rem),440px)] sm:h-[min(calc(100dvh-10rem),465px)] overflow-hidden rounded-2xl border border-line/90 bg-white shadow-[0_22px_55px_-15px_rgba(6,43,82,0.42)] animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          {/* Slim Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-navy via-royal to-navy px-3.5 py-2.5 text-white">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gold text-navy shadow-xs">
                <Bot className="h-4.5 w-4.5" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-navy" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display text-[13px] font-bold tracking-tight text-white">
                    Clarity AI
                  </h3>
                  <span className="rounded-full bg-emerald-500/25 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300">
                    Online
                  </span>
                </div>
                <p className="truncate text-[10px] text-white/75">
                  TV Clarity Capital Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handleReset}
                title="New chat"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="New chat"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3 bg-slate-50/70">
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col gap-1.5 max-w-[90%]",
                    isUser ? "ml-auto items-end" : "mr-auto items-start",
                  )}
                >
                  <div
                    className={cn(
                      "rounded-2xl px-3 py-2 shadow-2xs",
                      isUser
                        ? "bg-navy text-white rounded-br-xs"
                        : "bg-white border border-line/80 text-ink rounded-bl-xs",
                    )}
                  >
                    {formatMessageText(msg.text, isUser, msg.isStreaming)}

                    {/* Inline Action Buttons (shown once streaming completes) */}
                    {!msg.isStreaming && msg.actions && msg.actions.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5 pt-2 border-t border-line/60">
                        {msg.actions.map((act, aIdx) => {
                          const isExt =
                            act.url?.startsWith("http") ||
                            act.url?.startsWith("mailto:") ||
                            act.url?.startsWith("tel:");
                          const isWhatsapp = act.variant === "whatsapp";

                          if (act.url && isExt) {
                            return (
                              <a
                                key={aIdx}
                                href={act.url}
                                target={act.url.startsWith("http") ? "_blank" : undefined}
                                rel={act.url.startsWith("http") ? "noopener noreferrer" : undefined}
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all shadow-2xs",
                                  isWhatsapp
                                    ? "bg-[#25D366] text-white hover:bg-[#1ebd5a]"
                                    : act.variant === "primary"
                                    ? "bg-navy text-gold hover:bg-deep-blue"
                                    : "border border-line bg-white text-ink hover:bg-slate-100",
                                )}
                              >
                                {isWhatsapp && <WhatsAppIcon className="h-3 w-3" />}
                                {act.url.startsWith("tel:") && <Phone className="h-3 w-3" />}
                                {act.label}
                              </a>
                            );
                          }

                          if (act.url) {
                            return (
                              <Link
                                key={aIdx}
                                to={act.url}
                                onClick={() => setIsOpen(false)}
                                className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2.5 py-1 text-[11px] font-bold text-royal hover:bg-slate-100 transition-colors shadow-2xs"
                              >
                                {act.label} →
                              </Link>
                            );
                          }

                          return null;
                        })}
                      </div>
                    )}
                  </div>

                  {/* Quick Suggestions (shown once streaming completes) */}
                  {!msg.isStreaming && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {msg.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => handleSend(sug)}
                          className="rounded-full border border-royal/20 bg-white px-2.5 py-0.5 text-[11px] font-semibold text-royal shadow-2xs hover:bg-royal hover:text-white transition-all text-left"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {isThinking && (
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-xs border border-line bg-white px-3 py-2 w-fit shadow-2xs">
                <Bot className="h-3.5 w-3.5 text-royal animate-pulse" />
                <div className="flex gap-1 items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-royal/70 animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-royal/70 animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-royal/70 animate-bounce" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="border-t border-line bg-white p-2.5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (isStreaming) {
                  stopStreaming();
                } else {
                  handleSend();
                }
              }}
              className="flex items-center gap-1.5"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask anything in Sinhala or English..."
                className="flex-1 rounded-xl border border-line bg-slate-50 px-3 py-2 text-[13px] text-ink placeholder:text-muted focus:border-royal focus:bg-white focus:outline-none focus:ring-1 focus:ring-royal"
              />
              {isStreaming ? (
                <button
                  type="button"
                  onClick={stopStreaming}
                  aria-label="Stop response"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white transition-colors hover:bg-red-600 shadow-xs"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isThinking}
                  aria-label="Send message"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy text-gold transition-colors hover:bg-deep-blue disabled:opacity-40 disabled:pointer-events-none shadow-xs"
                >
                  <Send className="h-4 w-4" />
                </button>
              )}
            </form>
            <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-muted">
              <span>Sinhala • Singlish • English</span>
              <a
                href={site.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-[#1f9d55] hover:underline"
              >
                <WhatsAppIcon className="h-2.5 w-2.5" /> 076 430 3421 (Fastest)
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
