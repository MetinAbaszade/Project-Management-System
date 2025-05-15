// src/components/dashboard/DailyQuote.tsx

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

interface Quote {
  text: string;
  author: string;
}

const QUOTES: Quote[] = [
  { text: "Discipline equals freedom.", author: "Jocko Willink" },
  { text: "What you do speaks so loudly I cannot hear what you say.", author: "Ralph Waldo Emerson" },
  { text: "Amateurs wait for inspiration. Professionals get to work.", author: "Steven Pressfield" },
  { text: "Suffer the pain of discipline or suffer the pain of regret.", author: "Jim Rohn" },
  { text: "You become what you consistently do.", author: "James Clear" },
  { text: "Show me your calendar and I'll show you your priorities.", author: "Cal Newport" },
];

function getDailyRandomQuote(): Quote {
  const todayKey = new Date().toDateString();
  const seed = [...todayKey].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return QUOTES[seed % QUOTES.length];
}

export function DailyQuote() {
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    const selected = getDailyRandomQuote();
    setQuote(selected);
  }, []);

  if (!quote) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <MessageSquare className="h-5 w-5" />
        </div>

        <div>
          <blockquote className="text-md italic">"{quote.text}"</blockquote>
          <cite className="text-sm text-muted-foreground block mt-2">— {quote.author}</cite>
        </div>
      </div>
    </motion.div>
  );
}
