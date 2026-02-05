'use client';

import { useEffect, useState, Suspense } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Printer, Share2, Menu } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const API_BASE_URL = 'http://localhost:4000/api';

interface Note {
    id: string;
    content: string;
}

function NotesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);

    const chapterId = searchParams.get('chapterId');
    const chapterTitle = searchParams.get('title');

    useEffect(() => {
        async function fetchNotes() {
            if (!chapterId) return;
            try {
                const response = await axios.get(`${API_BASE_URL}/notes?chapterId=${chapterId}`);
                setNote(response.data.data);
            } catch (error) {
                console.error('Error fetching notes:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchNotes();
    }, [chapterId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div className="flex-1 px-6 truncate">
                        <h1 className="text-xl font-bold truncate">{chapterTitle}</h1>
                    </div>

                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Print Notes">
                            <Printer size={20} />
                        </button>
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Share">
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6 py-12">
                <article className="prose prose-blue dark:prose-invert max-w-none 
          prose-headings:font-bold prose-h1:text-4xl prose-h2:text-2xl prose-h2:border-b prose-h2:pb-2 prose-h2:mt-12
          prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed
          prose-strong:text-blue-600 dark:prose-strong:text-blue-400
          prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20 prose-blockquote:p-4 prose-blockquote:rounded-r-xl"
                >
                    {note ? (
                        <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                        >
                            {note.content}
                        </ReactMarkdown>
                    ) : (
                        <div className="text-center py-20">
                            <h2 className="text-2xl font-bold mb-4">No content available</h2>
                            <p className="text-gray-500">The notes for this chapter are currently being prepared. Check back later!</p>
                        </div>
                    )}
                </article>
            </main>

            {/* Footer Navigation */}
            <footer className="max-w-4xl mx-auto px-6 py-12 border-t border-gray-100 dark:border-gray-800 text-center">
                <p className="text-sm text-gray-500 mb-4">End of Chapter: {chapterTitle}</p>
                <button
                    onClick={() => router.back()}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-all shadow-lg hover:shadow-blue-500/20"
                >
                    Back to Chapters
                </button>
            </footer>
        </div>
    );
}

export default function NoteViewer() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        }>
            <NotesContent />
        </Suspense>
    );
}
