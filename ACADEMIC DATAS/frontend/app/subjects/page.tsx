'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, BookOpen, Clock, Star } from 'lucide-react';
import Link from 'next/link';

const API_BASE_URL = 'http://localhost:4000/api';

interface Subject {
    id: string;
    name: string;
}

export default function SubjectList() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);

    const standardId = searchParams.get('standardId');
    const domainId = searchParams.get('domainId');
    const selectionName = searchParams.get('name');

    useEffect(() => {
        async function fetchSubjects() {
            if (!standardId) return;
            try {
                let url = `${API_BASE_URL}/subjects?standardId=${standardId}`;
                if (domainId) url += `&domainId=${domainId}`;
                const response = await axios.get(url);
                setSubjects(response.data.data);
            } catch (error) {
                console.error('Error fetching subjects:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchSubjects();
    }, [standardId, domainId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 px-6 py-20">
            <div className="max-w-6xl mx-auto">
                <Link
                    href="/"
                    className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors mb-8"
                >
                    <ChevronLeft size={20} className="mr-1" /> Back to Standards
                </Link>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-12"
                >
                    <div className="flex items-end gap-3 mb-2">
                        <h1 className="text-4xl font-extrabold">{selectionName}</h1>
                        <span className="text-gray-400 mb-1">Subjects</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Select a subject to explore the chapters and comprehensive notes.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map((subject, index) => (
                        <motion.button
                            key={subject.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => router.push(`/chapters?subjectId=${subject.id}&name=${encodeURIComponent(subject.name)}`)}
                            className="group p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all text-left"
                        >
                            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <BookOpen size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{subject.name}</h3>
                            <div className="flex gap-4 text-xs text-gray-400">
                                <span className="flex items-center gap-1"><Star size={12} className="text-yellow-500" /> CBSE Syllabus</span>
                                <span className="flex items-center gap-1"><Clock size={12} /> Full Notes</span>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>
        </main>
    );
}
