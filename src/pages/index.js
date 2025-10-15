import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';
import { FaPlus, FaTrash, FaLink, FaChevronDown, FaChevronUp, FaLinkedin, FaGithub, FaTimes } from 'react-icons/fa';
import { SubjectCard } from '../components/SubjectCard';
import { SubjectDetailModal } from '../components/SubjectDetailModal';
import { GateYearModal } from '../components/GateYearModal';
import { getSubjectIcon } from '../utils/icons';

// 🚨 CRITICAL FIX: Import the Supabase client utility
import { supabase } from '../lib/supabaseClient'; 

// --- Utility Functions (Keep these outside the component) ---
const STORAGE_KEYS = { 
    SUBJECTS: 'gateCseTracker_subjects', 
    TARGET_YEAR: 'gateCseTracker_targetYear',
    LOCAL_USER_ID: 'gateCseTracker_localUserId' // Used to identify the device/user in Supabase
};
const createChapter = (name) => ({ id: Math.random().toString(36).substr(2, 9), name, completed: false });

const getInitialSubjects = () => [
    { id: 'eng-math', name: 'Engineering Mathematics', chapters: ['Linear Algebra', 'Calculus', 'Probability and Statistics'].map(createChapter), completedLectures: [], completed: false, totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'disc-math', name: 'Discrete Mathematics', chapters: ['Propositional and First Order Logic', 'Sets, Relations & Functions', 'Monoids, Groups', 'Graph Theory', 'Combinatorics'].map(createChapter), completedLectures: [], completed: false, totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'gen-apti', name: 'General Aptitude', chapters: ['Quantitative Aptitude', 'Verbal Ability', 'Data Interpretation'].map(createChapter), completedLectures: [], completed: false, totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'comp-org', name: 'Computer Organization & Architecture', chapters: ['Machine Instructions and Addressing Modes', 'ALU & Data Path', 'Control Unit Design', 'Memory Hierarchy', 'I/O Interface'].map(createChapter), completedLectures: [], completed: false, totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'prog-data', name: 'Programming & Data Structures', chapters: ['Programming in C', 'Data Structures (Arrays, Stacks, Queues, Linked Lists, Trees, Graphs)'].map(createChapter), completedLectures: [], completed: false, totalLectures: 90, startDate: null, courseLink: '' },
    { id: 'algorithms', name: 'Algorithms', chapters: ['Searching, Sorting, Hashing', 'Asymptotic Notation', 'Design Techniques (Greedy, Divide & Conquer, Dynamic Programming)', 'Graph Algorithms'].map(createChapter), completedLectures: [], completed: false, totalLectures: 90, startDate: null, courseLink: '' },
    { id: 'theory-comp', name: 'Theory of Computation', chapters: ['Regular Expressions & Finite Automata', 'Context-Free Grammars & PDA', 'Turing Machines', 'Undecidability'].map(createChapter), completedLectures: [], completed: false, totalLectures: 60, startDate: null, courseLink: '' },
    { id: 'compiler', name: 'Compiler Design', chapters: ['Lexical Analysis', 'Parsing (LL, LR)', 'Syntax Directed Translation', 'Run-time Environments', 'Intermediate Code Generation'].map(createChapter), completedLectures: [], completed: false, totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'os', name: 'Operating System', chapters: ['Processes & Threads', 'CPU Scheduling', 'Deadlocks', 'Memory Management', 'File Systems', 'I/O'].map(createChapter), completedLectures: [], completed: false, totalLectures: 60, startDate: null, courseLink: '' },
    { id: 'dbms', name: 'Database Management Systems', chapters: ['ER Model', 'Relational Model', 'SQL', 'Normalization', 'Indexing & B-Trees', 'Transaction & Concurrency Control'].map(createChapter), completedLectures: [], completed: false, totalLectures: 60, startDate: null, courseLink: '' },
    { id: 'cn', name: 'Computer Networks', chapters: ['OSI & TCP/IP Models', 'Physical & Data Link Layer', 'Network Layer (IPv4, Routing)', 'Transport Layer (TCP, UDP)', 'Application Layer (DNS, HTTP)'].map(createChapter), completedLectures: [], completed: false, totalLectures: 60, startDate: null, courseLink: '' },
];


export default function Home() {
    const [subjects, setSubjects] = useState([]);
    const [targetYear, setTargetYear] = useState(null);
    const [selectedSubjectId, setSelectedSubjectId] = useState(null);
    const [showYearModal, setShowYearModal] = useState(false);
    
    // 🚨 STATE ADDITION: Loading state is essential for database fetching
    const [isLoading, setIsLoading] = useState(true);

    // Get or create a unique ID for this device/user
    const localProgressId = useMemo(() => {
        let id = localStorage.getItem(STORAGE_KEYS.LOCAL_USER_ID);
        if (!id) {
            id = crypto.randomUUID(); 
            localStorage.setItem(STORAGE_KEYS.LOCAL_USER_ID, id);
        }
        return id;
    }, []);


    // --- 1. ASYNC SAVE FUNCTION (Must be defined before updateSubject) ---
    const saveProgress = useCallback(async (currentSubjects) => {
        const payload = {
            user_id: localProgressId,
            subjects_json: currentSubjects, 
        };
        
        // Use upsert: inserts a new row or updates the existing one based on 'user_id'
        const { error } = await supabase
            .from('user_progress')
            .upsert(payload, { onConflict: 'user_id' }); 

        if (error) {
            console.error('Error saving progress:', error.message);
        }
    }, [localProgressId]);


    // --- 2. DATA LOADING EFFECT (Replaces old Local Storage useEffects) ---
    // 🚨 This replaces BOTH your old Local Storage useEffects (Load and Save subjects)
    useEffect(() => {
        const loadProgress = async () => {
            setIsLoading(true);

            // 1. Load Target Year (Still using Local Storage for simplicity)
            const savedYear = localStorage.getItem(STORAGE_KEYS.TARGET_YEAR);
            let initialTargetYear = savedYear ? parseInt(savedYear, 10) : null;
            setTargetYear(initialTargetYear);

            // 2. Fetch progress from Supabase using the local user ID
            const { data, error } = await supabase
                .from('user_progress')
                .select('subjects_json')
                .eq('user_id', localProgressId)
                .single();

            let loadedSubjects;

            if (error && error.code !== 'PGRST116') { // PGRST116 means "no row found"
                console.error('Error fetching progress:', error.message);
                loadedSubjects = getInitialSubjects();
            } else if (data) {
                // Data found, load it
                loadedSubjects = data.subjects_json;
            } else {
                // No data found, initialize new progress
                loadedSubjects = getInitialSubjects();
                await saveProgress(loadedSubjects); // Save initial state to Supabase
            }

            // Ensure new properties are present on old data (for smooth schema migration)
            loadedSubjects.forEach(s => {
                if (s.courseLink === undefined) s.courseLink = '';
                if (s.totalLectures === undefined) s.totalLectures = 45;
                if (s.completed === undefined) s.completed = false; // Add default for subjects without completion status
            });

            setSubjects(loadedSubjects);
            setIsLoading(false);
            
            if (!initialTargetYear) {
                setShowYearModal(true);
            }
        };

        loadProgress();

    }, [localProgressId, saveProgress]); // saveProgress is a dependency because it is called inside loadProgress

    
    // --- 3. TARGET YEAR SAVING (Keep using Local Storage) ---
    // 🚨 This replaces your old Target Year useEffect (3.)
    useEffect(() => {
        if (targetYear) {
            try { 
                localStorage.setItem(STORAGE_KEYS.TARGET_YEAR, targetYear.toString()); 
            }
            catch (error) { 
                console.error("Failed to save target year:", error); 
            }
        }
    }, [targetYear]);


    // --- 4. UPDATE SUBJECT (Now triggers Supabase save) ---
    // 🚨 This is your corrected updateSubject function
    const updateSubject = useCallback((updatedSubject) => {
        setSubjects(prevSubjects => {
            const newSubjects = prevSubjects.map(s =>
                s.id === updatedSubject.id ? updatedSubject : s
            );
            
            // Call the async save function here
            saveProgress(newSubjects); 
            
            return newSubjects;
        });
    }, [saveProgress]); 

    // Derived States
    const selectedSubject = useMemo(() => subjects.find(s => s.id === selectedSubjectId), [subjects, selectedSubjectId]);

    const { totalLectures, totalCompletedLectures, globalProgress } = useMemo(() => {
        const total = subjects.reduce((acc, s) => acc + (s.totalLectures || 0), 0);
        const completed = subjects.reduce((acc, s) => acc + s.completedLectures.length, 0);
        return { 
            totalLectures: total, 
            totalCompletedLectures: completed, 
            globalProgress: total > 0 ? (completed / total) * 100 : 0 
        };
    }, [subjects]);


    return (
        <div className="bg-transparent text-gray-100 selection:bg-sky-500/30 min-h-screen relative">
            <Head>
                <title>GATE CSE Syllabus Tracker</title>
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

                {/* 🚨 LOADING SCREEN IMPLEMENTATION */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-[50vh]">
                        <p className="text-xl text-sky-300 font-header animate-pulse">
                            Loading progress from cloud...
                        </p>
                    </div>
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
