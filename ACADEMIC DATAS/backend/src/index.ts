import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// 1. Fetch all standards
app.get('/api/standards', async (req, res) => {
    try {
        const standards = await prisma.standard.findMany({
            orderBy: { name: 'asc' },
        });
        res.json({ status: 'success', data: standards });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch standards' });
    }
});

// 2. Fetch domains for a specific standard (e.g., Class 11 or 12)
app.get('/api/domains', async (req, res) => {
    const { standardId } = req.query;
    if (!standardId) {
        return res.status(400).json({ status: 'error', message: 'standardId is required' });
    }

    try {
        const domains = await prisma.domain.findMany({
            where: { standardId: String(standardId) },
            orderBy: { name: 'asc' },
        });
        res.json({ status: 'success', data: domains });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch domains' });
    }
});

// 3. Fetch subjects (filtered by standard and optionally domain)
app.get('/api/subjects', async (req, res) => {
    const { standardId, domainId } = req.query;
    if (!standardId) {
        return res.status(400).json({ status: 'error', message: 'standardId is required' });
    }

    try {
        const subjects = await prisma.subject.findMany({
            where: {
                standardId: String(standardId),
                domainId: domainId ? String(domainId) : null,
            },
            orderBy: { name: 'asc' },
        });
        res.json({ status: 'success', data: subjects });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch subjects' });
    }
});

// 4. Fetch chapters for a subject
app.get('/api/chapters', async (req, res) => {
    const { subjectId } = req.query;
    if (!subjectId) {
        return res.status(400).json({ status: 'error', message: 'subjectId is required' });
    }

    try {
        const chapters = await prisma.chapter.findMany({
            where: { subjectId: String(subjectId) },
            orderBy: { order: 'asc' },
        });
        res.json({ status: 'success', data: chapters });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch chapters' });
    }
});

// 5. Fetch full notes for a chapter
app.get('/api/notes', async (req, res) => {
    const { chapterId } = req.query;
    if (!chapterId) {
        return res.status(400).json({ status: 'error', message: 'chapterId is required' });
    }

    try {
        const notes = await prisma.note.findUnique({
            where: { chapterId: String(chapterId) },
        });
        res.json({ status: 'success', data: notes });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch notes' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
