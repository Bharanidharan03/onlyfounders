'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ChevronLeft, GraduationCap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const API_BASE_URL = 'http://localhost:4000/api';

interface Domain {
    id: string;
    name: string;
}

export default function DomainSelection() {
    const router = useRouter();
    const params = useParams();
    const [domains, setDomains] = useState<Domain[]>([]);
    const [loading, setLoading] = useState(true);

    const standardId = params.id as string;

    useEffect(() => {
        async function fetchDomains() {
            try {
                const response = await axios.get(`${API_BASE_URL}/domains?standardId=${standardId}`);
                setDomains(response.data.data);
            } catch (error) {
                console.error('Error fetching domains:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchDomains();
    }, [standardId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 px-6 py-20">
            <div className="max-w-4xl mx-auto">
                <Link
                    href="/"
                    className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors mb-8"
                >
                    <ChevronLeft size={20} className="mr-1" /> Back to Standards
                </Link>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-4xl font-bold mb-4">Choose Your Stream</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        For Class 11 & 12, select your specific domain to access relevant subjects.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 gap-4">
                    {domains.map((domain, index) => (
                        <motion.button
                            key={domain.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => router.push(`/subjects?standardId=${standardId}&domainId=${domain.id}&name=${encodeURIComponent(domain.name)}`)}
                            className="flex items-center justify-between p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                                    <GraduationCap size={24} />
                                </div>
                                <span className="text-xl font-semibold">{domain.name}</span>
                            </div>
                            <ArrowRight size={20} className="text-gray-400" />
                        </motion.button>
                    ))}
                </div>
            </div>
        </main>
    );
}
