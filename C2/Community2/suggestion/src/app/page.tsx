"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  BrainCircuit,
  Sparkles,
  Code2,
  Terminal,
  Trophy,
  ExternalLink,
  Loader2,
  ChevronRight,
  Target
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DEFAULT_JSON = {
  "content_type": "manual_entry",
  "metadata": {
    "file_type": "text",
    "processing_method": "manual_entry",
    "source_file": "demo.txt"
  },
  "text": "I am a second-year computer science student interested in competitive programming and data structures. I want to participate in hackathons to improve my problem-solving skills.",
  "word_count": 28
};

export default function Home() {
  const [inputJson, setInputJson] = useState(JSON.stringify(DEFAULT_JSON, null, 2));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: inputJson,
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white selection:bg-purple-500/30 font-sans">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-purple-400 mb-6"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Opportunity Intelligence</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent mb-6 tracking-tight"
          >
            V-Suggestions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg max-w-2xl mx-auto"
          >
            Turn your learning metadata into a personalized roadmap of hackathons, contests, and workshops.
          </motion.p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Block: Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-1 overflow-hidden transition-colors hover:border-purple-500/30">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10">
                <Terminal className="w-5 h-5 text-purple-400" />
                <span className="font-mono text-sm text-white/80">learning_input.json</span>
              </div>
              <textarea
                value={inputJson}
                onChange={(e) => setInputJson(e.target.value)}
                className="w-full h-[400px] bg-transparent p-6 font-mono text-sm text-white/70 outline-none resize-none"
                placeholder="Paste your JSON input here..."
              />
              <div className="p-4 bg-white/5 border-t border-white/10 flex justify-between items-center">
                <span className="text-xs text-white/40 uppercase tracking-widest font-medium">Ready for analysis</span>
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  {loading ? "Analyzing..." : "Generate Recommendations"}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right Block: Results */}
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              {!result && !loading ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-white/10 rounded-2xl"
                >
                  <BrainCircuit className="w-12 h-12 text-white/10 mb-4" />
                  <p className="text-white/30 italic">Input learning data to see recommendations...</p>
                </motion.div>
              ) : loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl border border-white/10" />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  {/* Error Message */}
                  {result?.error && (
                    <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm">
                      <p className="font-semibold mb-1">Error processing recommendations</p>
                      <p className="opacity-80">{result.details || result.error}</p>
                    </div>
                  )}

                  {/* Analysis Summary */}
                  {result?.input_summary && (
                    <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
                      <div className="flex items-center gap-2 mb-6">
                        <Target className="w-5 h-5 text-blue-400" />
                        <h3 className="font-semibold text-white">Semantic Analysis</h3>
                        <div className="ml-auto px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                          {Math.round((result?.input_summary?.confidence || 0) * 100)}% Confidence
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-white">
                        <div>
                          <p className="text-xs text-white/40 mb-1">Inferred Domain</p>
                          <div className="flex flex-wrap gap-1 text-white">
                            {result?.input_summary?.detected_domains?.map((d: string) => (
                              <span key={d} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs">
                                {d}
                              </span>
                            )) || <span className="text-white/30 text-xs">No domains detected</span>}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-white/40 mb-1">Intent</p>
                          <p className="text-sm font-medium text-purple-400 capitalize">{result?.input_summary?.intent || "General"}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 px-2 text-white">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      Platform Recommendations
                    </h3>
                    <div className="space-y-3">
                      {result?.recommendations?.map((rec: any, idx: number) => (
                        <motion.div
                          key={rec.event_name}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="group relative p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/[0.08] transition-all"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-white group-hover:text-purple-400 transition-colors uppercase tracking-tight">
                                {rec.event_name}
                              </h4>
                              <p className="text-xs text-white/40 font-mono tracking-wider">{rec.platform}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 uppercase tracking-widest">
                                {rec.event_type}
                              </span>
                              <div className="text-[10px] text-white/30 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                MATCH: {Math.round(rec.match_score * 100)}%
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {rec.skill_focus.map((s: string) => (
                              <span key={s} className="text-[10px] font-mono text-white/50 bg-white/5 px-2 py-1 rounded">
                                #{s.toLowerCase()}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between text-xs pt-4 border-t border-white/5">
                            <span className="text-white/40">Deadline: <span className="text-white/70">{rec.registration_deadline}</span></span>
                            <a
                              href={rec.registration_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-purple-400 font-bold hover:text-purple-300 transition-colors"
                            >
                              Register <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
