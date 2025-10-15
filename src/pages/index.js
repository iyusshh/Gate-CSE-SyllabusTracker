import { supabase } from '../lib/supabaseClient';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';
import { FaPlus, FaTrash, FaLink, FaChevronDown, FaChevronUp, FaLinkedin, FaGithub, FaTimes } from 'react-icons/fa'; // Added FaTimes here
// Imports updated to use the 'src/' structure:
import { SubjectCard } from '../components/SubjectCard';
import { SubjectDetailModal } from '../components/SubjectDetailModal';
import { GateYearModal } from '../components/GateYearModal';
import { getSubjectIcon } from '../utils/icons';

// --- Utility Functions (Keep these outside the component) ---
const STORAGE_KEYS = { SUBJECTS: 'gateCseTracker_subjects', TARGET_YEAR: 'gateCseTracker_targetYear' };
const createChapter = (name) => ({ id: Math.random().toString(36).substr(2, 9), name, completed: false });

const getInitialSubjects = () => [
    { id: 'eng-math', name: 'Engineering Mathematics', chapters: ['Linear Algebra', 'Calculus', 'Probability and Statistics'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'disc-math', name: 'Discrete Mathematics', chapters: ['Propositional and First Order Logic', 'Sets, Relations & Functions', 'Monoids, Groups', 'Graph Theory', 'Combinatorics'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'gen-apti', name: 'General Aptitude', chapters: ['Quantitative Aptitude', 'Analytical Aptitude', 'Spatial Aptitude', 'Verbal Aptitude'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'dig-logic', name: 'Digital Logic', chapters: ['Boolean Algebra', 'Combinational and Sequential Circuits', 'Minimization', 'Number Representations & Computer Arithmetic'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'comp-org', name: 'Computer Organization', chapters: ['Machine Instructions & Addressing Modes', 'ALU, Data-path and Control Unit', 'Instruction Pipelining', 'Memory Hierarchy', 'I/O Interface'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'prog-ds', name: 'Programming & DS', chapters: ['Programming in C', 'Recursion', 'Arrays, Stacks, Queues', 'Linked Lists', 'Trees, BSTs, Heaps', 'Graphs'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'algo', name: 'Algorithms', chapters: ['Searching, Sorting, Hashing', 'Asymptotic Complexity', 'Greedy, Dynamic Programming, Divide-and-Conquer', 'Graph Traversals', 'Minimum Spanning Trees', 'Shortest Paths'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'toc', name: 'Theory of Computation', chapters: ['Regular Expressions & Finite Automata', 'Context-Free Grammars & Push-Down Automata', 'Regular and Context-Free Languages', 'Turing Machines and Undecidability'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'comp-des', name: 'Compiler Design', chapters: ['Lexical Analysis', 'Parsing, Syntax-Directed Translation', 'Runtime Environments', 'Intermediate Code Generation', 'Local Optimisation & Data Flow Analyses'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'os', name: 'Operating System', chapters: ['System Calls, Processes, Threads', 'Concurrency and Synchronization', 'Deadlock', 'CPU and I/O Scheduling', 'Memory Management & Virtual Memory', 'File Systems'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'dbms', name: 'Database Management', chapters: ['ER-model', 'Relational Model (Algebra, Calculus, SQL)', 'Integrity Constraints, Normal Forms', 'File Organization, Indexing', 'Transactions & Concurrency Control'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'comp-net', name: 'Computer Networks', chapters: ['Layering Concepts (OSI/TCP/IP)', 'Data Link Layer', 'Routing Protocols', 'IP Addressing & Support Protocols (v4)', 'Transport Layer (TCP/UDP)', 'Application Layer Protocols'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
];

const CountdownTimer = ({ targetYear }) => {
    // 1. ALL HOOKS MUST BE CALLED HERE, UNCONDITIONALLY.
    const targetDate = useMemo(() => {
        // Calculation can be conditional, but the hook call cannot.
        return targetYear ? new Date(`${targetYear}-02-01T00:00:00`) : null;
    }, [targetYear]);

    const [timeLeft, setTimeLeft] = useState({});

    const calculateTimeLeft = useCallback(() => {
        if (!targetDate) return {};
        
        const diff = +targetDate - +new Date();
        if (diff > 0) {
            return {
                d: Math.floor(diff / (1000 * 60 * 60 * 24)),
                h: Math.floor((diff / (1000 * 60 * 60)) % 24),
                m: Math.floor((diff / 1000 / 60) % 60),
                s: Math.floor((diff / 1000) % 60),
            };
        }
        return {};
    }, [targetDate]);

    useEffect(() => {
        // The effect runs, but its internal logic is conditional.
        if (!targetDate) return;
        
        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, [calculateTimeLeft, targetDate]);

    // 2. CONDITIONAL RETURNS MUST FOLLOW ALL HOOKS.
    if (!targetYear || !targetDate) {
        return null;
    }
    
    const timeComponents = [
        { l: 'Days', v: timeLeft.d },
        { l: 'Hours', v: timeLeft.h },
        { l: 'Minutes', v: timeLeft.m },
        { l: 'Seconds', v: timeLeft.s },
    ];

    if (timeLeft.d === undefined) {
        return (
            <div className="text-center my-8 p-4 bg-gray-900/50 backdrop-blur-md border border-gray-200/10 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-300 mb-3 font-header">Time Remaining for GATE {targetYear}</h3>
                <span className="text-lg text-white">The exam date has passed.</span>
            </div>
        );
    }

    return (
        <div className="text-center my-8 p-4 bg-gray-900/50 backdrop-blur-md border border-gray-200/10 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-300 mb-3 font-header">Time Remaining for GATE {targetYear}</h3>
            <div id="countdown-timer" className="flex justify-center gap-4 text-white">
                {timeComponents.map((c, index) => (
                    <div key={index} className="text-center">
                        <div className="text-3xl font-bold text-sky-300">{String(c.v).padStart(2, '0')}</div>
                        <div className="text-xs text-gray-400">{c.l}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Main App Component ---
export default function Home() {
    const [subjects, setSubjects] = useState([]);
    const [targetYear, setTargetYear] = useState(null);
    const [selectedSubjectId, setSelectedSubjectId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showYearModal, setShowYearModal] = useState(false);

    // 1. Load State from Local Storage
    useEffect(() => {
        try {
            const savedSubjects = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
            const savedYear = localStorage.getItem(STORAGE_KEYS.TARGET_YEAR);

            let initialSubjects = savedSubjects ? JSON.parse(savedSubjects) : getInitialSubjects();
            let initialTargetYear = savedYear ? parseInt(savedYear, 10) : null;

            // Ensure new properties are present on old data
            initialSubjects.forEach(s => {
                if (s.courseLink === undefined) s.courseLink = '';
                if (s.totalLectures === undefined) s.totalLectures = 45;
            });

            setSubjects(initialSubjects);
            setTargetYear(initialTargetYear);
            setIsLoading(false);
            
            if (!initialTargetYear) {
                setShowYearModal(true);
            }
        } catch (error) {
            console.error("Failed to load state:", error);
            setSubjects(getInitialSubjects());
            setIsLoading(false);
            setShowYearModal(true);
        }
    }, []);

    // 2. Save Subjects to Local Storage on change
    useEffect(() => {
        // Wrap localStorage access in a check to ensure it's client-side
        if (typeof window !== 'undefined' && subjects.length > 0) {
            try { localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects)); } 
            catch (error) { console.error("Failed to save subjects:", error); }
        }
    }, [subjects]);

    // 3. Save Target Year to Local Storage on change
    useEffect(() => {
        // Wrap localStorage access in a check to ensure it's client-side
        if (typeof window !== 'undefined' && targetYear) {
            try { localStorage.setItem(STORAGE_KEYS.TARGET_YEAR, targetYear.toString()); }
            catch (error) { console.error("Failed to save target year:", error); }
        }
    }, [targetYear]);

    // Calculate Overall Progress (Derived State)
    const { totalLectures, totalCompletedLectures, globalProgress } = useMemo(() => {
        const total = subjects.reduce((acc, s) => acc + (s.totalLectures || 0), 0);
        const completed = subjects.reduce((acc, s) => acc + s.completedLectures.length, 0);
        return { 
            totalLectures: total, 
            totalCompletedLectures: completed, 
            globalProgress: total > 0 ? (completed / total) * 100 : 0 
        };
    }, [subjects]);

    // Function passed to modal to update a subject's state
    const updateSubject = useCallback((updatedSubject) => {
        setSubjects(prevSubjects => 
            prevSubjects.map(s => s.id === updatedSubject.id ? updatedSubject : s)
        );
    }, []);

    const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

    return (
        <div className="bg-transparent text-gray-100 selection:bg-sky-500/30 min-h-screen relative">
            <Head>
                <title>GATE CSE Syllabus Tracker</title>
                {/* Include custom font links here if you had a custom _document.js */}
            
            </Head>
            <style jsx global>{`
                :root {
                    --font-header: 'Sora', sans-serif;
                    --font-body: 'Inter', sans-serif;
                }
                body {
                    font-family: var(--font-body);
                    background-color: #0a0a0a;
                }
                .font-header {
                    font-family: var(--font-header);
                }
                .scrollbar-thin { scrollbar-width: thin; scrollbar-color: #374151 #111827; }
                .scrollbar-thin::-webkit-scrollbar { width: 8px; }
                .scrollbar-thin::-webkit-scrollbar-track { background: #111827; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #374151; border-radius: 20px; border: 3px solid #111827; }

                @keyframes pan-overlay {
                    from { background-position: 0% 0%; }
                    to { background-position: 0% -200%; }
                }
                .radiant-bg-container::before {
                    animation: pan-overlay 35s linear infinite;
                    background-image: radial-gradient(circle at 25% 25%, #38bdf8 0%, #3b82f6 25%, #1d4ed8 50%, #1e3a8a 100%);
                    background-size: 400% 400%;
                    content: "";
                    inset: 0;
                    opacity: 0.15;
                    pointer-events: none;
                    position: fixed;
                    z-index: -1;
                    filter: blur(120px);
                }
                
                input[type='number']::-webkit-inner-spin-button,
                input[type='number']::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
                input[type='number'] { -moz-appearance: textfield; }
                .progress-glow {
                    filter: drop-shadow(0 0 6px var(--glow-color));
                }
                .glow-sky { --glow-color: #38bdf880; }
                .glow-teal { --glow-color: #2dd4bf80; }
            `}</style>

            <div className="radiant-bg-container"></div>

            <div id="app-root" className="relative z-10 container mx-auto px-4 py-6">
                <header className="text-center my-8">
                    <h1 className="text-4xl font-header font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-300 to-blue-500">
                        GATE CSE Syllabus Tracker
                    </h1>
                </header>

                <CountdownTimer targetYear={targetYear} />

                {isLoading ? (
                    <div className="text-center text-gray-400 py-20">Initializing Tracker...</div>
                ) : (
                    <>
                        <div className="my-8 px-2">
                            <div className="flex justify-between items-center mb-2 text-sm text-gray-400">
                                <span>{totalCompletedLectures} / {totalLectures} Lectures</span>
                                <span>Overall Progress</span>
                            </div>
                            <div className="w-full bg-gray-900/50 rounded-full h-4 p-1 border border-gray-200/10 shadow-inner">
                                <div className="relative w-full h-full">
                                    <div
                                        className="bg-gradient-to-r from-teal-400 to-sky-500 h-full rounded-full progress-glow glow-sky transition-all duration-500 ease-out"
                                        style={{ width: `${globalProgress}%` }}
                                    ></div>
                                    <span className="absolute inset-0 text-xs font-bold flex items-center justify-center text-white mix-blend-difference">
                                        {Math.round(globalProgress)}% Complete
                                    </span>
                                </div>
                            </div>
                        </div>

                        <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {subjects.map((subject, index) => (
                                <SubjectCard
                                    key={subject.id}
                                    subject={subject}
                                    index={index}
                                    onClick={() => setSelectedSubjectId(subject.id)}
                                />
                            ))}
                        </main>
                    </>
                )}

                <footer className="relative z-10 container mx-auto px-4 py-8 mt-12 text-center text-gray-500 border-t border-gray-200/10">
                    <div className="flex justify-center items-center gap-4 mb-2">
                        <a href="https://www.linkedin.com/in/aayush-rai-7334262a9/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                            <FaLinkedin className="w-6 h-6" />
                </a>
                <a href="https://github.com/iyusshh" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition-colors">
                    <FaGithub className="w-6 h-6" />
                </a>
                    </div>
                    <p>Made by Aayush Rai</p>
                </footer>
            </div>

            {/* Modals are rendered conditionally based on state */}
            {selectedSubject && (
                <SubjectDetailModal
                    subject={selectedSubject}
                    onClose={() => setSelectedSubjectId(null)}
                    onUpdate={updateSubject}
                />
            )}
            
            {showYearModal && (
                <GateYearModal
                    onSetYear={(year) => { setTargetYear(year); setShowYearModal(false); }}
                    onClose={() => setShowYearModal(false)}
                />
            )}
        </div>
    );
}