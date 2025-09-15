import Link from 'next/link';
import React, { useState } from 'react';

export default function StartPage() {
  const [messages, setMessages] = useState<Array<{ id: number; role: 'user' | 'assistant'; content: string }>>([
    { id: 1, role: 'assistant', content: 'Welcome to MedAI! Ready for a quick quiz or to chat about a topic?' },
    { id: 2, role: 'user', content: "Let's do a quick anatomy quiz." },
    { id: 3, role: 'assistant', content: 'Great! First question: Which cranial nerve controls the lateral rectus muscle?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage = { id: Date.now(), role: 'user' as const, content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      setIsLoading(true);
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: trimmed }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'AI request failed');
      }

      const data = (await response.json()) as { response?: string };
      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant' as const,
        content: data?.response?.trim() || 'Sorry, I could not think of a good answer right now.',
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          role: 'assistant',
          content: 'Oops! Something went wrong while talking to the AI. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50 via-purple-50 to-purple-100 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 md:px-6 py-4 md:py-6 flex flex-col h-screen">
        {/* Header */}
        <header className="flex items-center justify-between gap-3 rounded-xl border border-purple-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600" />
            <h1 className="text-lg md:text-xl font-semibold text-purple-800">MedAI</h1>
            <span className="hidden md:inline text-sm text-purple-700/80">Student Mode</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/" className="text-sm font-medium text-purple-700 hover:text-purple-800">Home</Link>
          </nav>
        </header>

        {/* Chat area */}
        <section className="mt-4 flex-1 overflow-hidden rounded-2xl border border-purple-200 bg-white/75 backdrop-blur supports-[backdrop-filter]:bg-white/55 shadow">
          {/* Title bar */}
          <div className="flex items-center justify-between border-b border-purple-200/70 px-4 md:px-6 py-3 bg-gradient-to-r from-purple-50 to-white/0">
            <div>
              <h2 className="font-semibold text-purple-900">Chat & Quizzes</h2>
              <p className="text-sm text-purple-800/70">Ask anything or start a quiz. Light, calm, and focused.</p>
            </div>
            <button
              type="button"
              className="hidden md:inline-flex items-center justify-center rounded-full border border-purple-300 bg-white/70 px-3 py-1.5 text-sm font-medium text-purple-700 hover:bg-purple-50"
            >
              New Chat
            </button>
          </div>

          {/* Messages */}
          <div className="h-[calc(100vh-280px)] md:h-[calc(100vh-300px)] overflow-y-auto px-3 md:px-6 py-4 space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={
                    'max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm md:text-base shadow-sm ' +
                    (m.role === 'user'
                      ? 'bg-purple-600 text-white rounded-br-md'
                      : 'bg-white/80 text-slate-900 border border-purple-200 rounded-bl-md')
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[70%] rounded-2xl rounded-bl-md border border-purple-200 bg-white/80 px-4 py-3 text-sm md:text-base text-slate-900 shadow-sm">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-purple-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 px-3 md:px-4 py-3">
            <div className="mx-auto max-w-3xl flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                placeholder="Send a message or type /quiz to start"
                className="flex-1 resize-none rounded-xl border border-purple-300 bg-white/90 px-3 py-2 text-sm md:text-base shadow-sm placeholder:text-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={!input.trim() || isLoading}
                className="inline-flex items-center justify-center rounded-full bg-purple-600 text-white px-4 py-2 font-semibold shadow-sm hover:bg-purple-700 active:bg-purple-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
