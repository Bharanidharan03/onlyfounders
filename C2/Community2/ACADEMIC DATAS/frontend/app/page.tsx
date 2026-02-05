'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { GraduationCap, ChevronRight, BookOpen, Layers } from 'lucide-react';

const API_BASE_URL = 'http://localhost:4000/api';

interface Standard {
  id: string;
  name: string;
}

export default function Home() {
  const [standards, setStandards] = useState<Standard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStandards() {
      try {
        const response = await axios.get(`${API_BASE_URL}/standards`);
        const sortedStandards = response.data.data.sort((a: Standard, b: Standard) => {
          const numA = parseInt(a.name.replace(/\D/g, '')) || 0;
          const numB = parseInt(b.name.replace(/\D/g, '')) || 0;
          return numA - numB;
        });
        setStandards(sortedStandards);
      } catch (error) {
        console.error('Error fetching standards:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStandards();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 px-6 py-20">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <GraduationCap size={18} />
            CBSE Academic Platform
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-6">
            Master Your Grades with <span className="text-blue-600">Precision Notes.</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Access strictly CBSE-aligned, high-quality notes for Class 8 to 12.
            Choose your standard to begin your journey to excellence.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {standards.map((std, index) => (
            <motion.div
              key={std.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={['Class 11', 'Class 12'].includes(std.name)
                  ? `/select-domain/${std.id}`
                  : `/subjects?standardId=${std.id}&name=${encodeURIComponent(std.name)}`
                }
                className="group relative block p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Layers size={80} />
                </div>

                <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                  {std.name}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Comprehensive notes for all major CBSE subjects.
                </p>

                <div className="flex items-center text-blue-600 font-semibold text-sm">
                  Get Started <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
