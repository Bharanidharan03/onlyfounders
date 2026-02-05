'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, FileText, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

const API_BASE_URL = 'http://localhost:4000/api';

interface Chapter {
    id: string;
    title: string;
    order: number;
}

export default function ChapterList() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);

    const subjectId = searchParams.get('subjectId');
    const subjectName = searchParams.get('name');

    useEffect(() => {
        async function fetchChapters() {
            if (!subjectId) return;
            try {
                const response = await axios.get(`${API_BASE_URL}/chapters?subjectId=${subjectId}`);
                setChapters(response.data.data);
            } catch (error) {
                console.error('Error fetching chapters:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchChapters();
    }, [subjectId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-white dark:bg-gray-950 px-6 py-20">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors mb-8"
                >
                    <ChevronLeft size={20} className="mr-1" /> Back to Subjects
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 p-8 bg-blue-600 rounded-3xl text-white overflow-hidden relative"
                >
                    <div className="relative z-10">
                        <h1 className="text-4xl font-bold mb-2">{subjectName}</h1>
                        <p className="opacity-90">Select a chapter to read detailed NCERT-level academic notes.</p>
                    </div>
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <FileText size={150} />
                    </div>
                </motion.div>

                <div className="space-y-4">
                    {chapters.map((chapter, index) => (
                        <motion.button
                            key={chapter.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => router.push(`/notes?chapterId=${chapter.id}&title=${encodeURIComponent(chapter.title)}`)}
                            className="w-full flex items-center justify-between p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 font-bold transition-colors">
                                    {chapter.order}
                                </div>
                                <span className="text-lg font-semibold">{chapter.title}</span>
                            </div>
                            <div className={`flex items-center gap-2 text-sm font-medium ${index === 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {index === 0 ? (
                                    <>
                                        <CheckCircle size={16} /> Notes Ready
                                    </>
                                ) : (
                                    <>
                                        <Clock size={16} /> Coming Soon
                                    </>
                                )}
                            </div>
                        </motion.button>
                    ))}

                    {chapters.length === 0 && (
                        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                            <p className="text-gray-500">Chapters and notes for this subject are coming soon.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
