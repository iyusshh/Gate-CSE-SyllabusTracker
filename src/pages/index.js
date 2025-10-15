// pages/index.js (Redesigned UI - V3 with User's Specific Icons)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';
import { 
    FaPlus, FaTrash, FaLink, FaChevronDown, FaChevronUp, FaLinkedin, 
    FaGithub, FaTimes, FaSignOutAlt, FaCalendarAlt, FaTachometerAlt, 
    FaCog, FaBook, FaGlobe, FaBezierCurve, FaLaptopCode, FaDatabase, 
    FaNetworkWired, FaMicrochip, FaTerminal, FaCodeBranch, FaShieldAlt
} from 'react-icons/fa'; 
import { BsLayersFill } from "react-icons/bs"; // NEW: Import BsLayersFill

// Imports updated to use the 'src/' structure (assuming components/ and utils/ are under src/)
import { SubjectCard } from '../components/SubjectCard';
import { SubjectDetailModal } from '../components/SubjectDetailModal';
import { GateYearModal } from '../components/GateYearModal';
import { getSubjectIcon } from '../utils/icons'; 

// NEW IMPORT for IndexedDB
import { saveSubjects, loadSubjects, saveTargetYear, loadTargetYear } from '../utils/idb';


// --- UTILITY FUNCTIONS (Kept as is) ---
const createChapter = (name) => ({ id: Math.random().toString(36).substr(2, 9), name, completed: false });

const getInitialSubjects = () => [
    // ... Your complete list of subjects as originally defined ...
    { id: 'eng-math', name: 'Engineering Mathematics', chapters: ['Linear Algebra', 'Calculus', 'Probability and Statistics'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'disc-math', name: 'Discrete Mathematics', chapters: ['Propositional and First Order Logic', 'Sets, Relations & Functions', 'Monoids, Groups', 'Graph Theory', 'Combinatorics'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'gen-apti', name: 'General Aptitude', chapters: ['Quantitative Aptitude', 'Analytical Aptitude', 'Spatial Aptitude', 'Verbal Aptitude'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'dig-logic', name: 'Digital Logic', chapters: ['Boolean Algebra', 'Combinational and Sequential Circuits', 'Minimization', 'Number Representations & Computer Arithmetic'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'comp-org', name: 'Computer Organization', chapters: ['Machine Instructions & Addressing Modes', 'ALU, Data-path and Control Unit', 'Instruction Pipelining', 'Memory Hierarchy', 'I/O Interface'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'prog-ds', name: 'Programming & DS', chapters: ['Programming in C', 'Recursion', 'Arrays, Stacks, Queues', 'Linked Lists', 'Trees, BSTs, Heaps', 'Graphs'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'algo', name: 'Algorithms', chapters: ['Searching, Sorting, Hashing', 'Asymptotic Complexity', 'Greedy, Dynamic Programming, Divide-and-Conquer', 'Graph Traversals', 'Minimum Spanning Trees', 'Shortest Paths'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'toc', name: 'Theory of Computation', chapters: ['Regular Expressions & Finite Automata', 'Context-Free Grammars & Push-Down Automata', 'Regular and Context-Free Languages', 'Turing Machines and Undecidability'].map(createChapter), completedLectures: [], totalLectules: 45, startDate: null, courseLink: '' },
    { id: 'comp-des', name: 'Compiler Design', chapters: ['Lexical Analysis', 'Parsing, Syntax-Directed Translation', 'Runtime Environments', 'Intermediate Code Generation', 'Local Optimisation & Data Flow Analyses'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'os', name: 'Operating System', chapters: ['System Calls, Processes, Threads', 'Concurrency and Synchronization', 'Deadlock', 'CPU and I/O Scheduling', 'Memory Management & Virtual Memory', 'File Systems'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'dbms', name: 'Database Management', chapters: ['ER-model', 'Relational Model (Algebra, Calculus, SQL)', 'Integrity Constraints, Normal Forms', 'File Organization, Indexing', 'Transactions & Concurrency Control'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'comp-net', name: 'Computer Networks', chapters: ['Layering Concepts (OSI/TCP/IP)', 'Data Link Layer', 'Routing Protocols', 'IP Addressing & Support Protocols (v4)', 'Transport Layer (TCP/UDP)', 'Application Layer Protocols'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
];
// --- End UTILITY FUNCTIONS ---

// --- CountdownTimer Component (UNCHANGED) ---
const CountdownTimer = ({ targetYear }) => {
    const targetDate = useMemo(() => {
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
        if (!targetDate) return;
        
        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, [calculateTimeLeft, targetDate]);

    if (!targetYear || !targetDate) {
        return (
            <div className="p-4 bg-gray-800/50 rounded-lg shadow-xl border border-gray-700">
                <p className="text-sm text-gray-400 flex items-center">
                    <FaCalendarAlt className="mr-2 text-red-400" /> 
                    Target year not set. Click 'Settings' to begin.
                </p>
            </div>
        );
    }
    
    const timeComponents = [
        { l: 'DAYS', v: timeLeft.d },
        { l: 'HRS', v: timeLeft.h },
        { l: 'MIN', v: timeLeft.m },
        { l: 'SEC', v: timeLeft.s },
    ];

    if (timeLeft.d === undefined) {
        return (
            <div className="p-4 bg-gray-800/50 rounded-lg shadow-xl border border-gray-700">
                <h3 className="text-lg font-semibold text-red-400 mb-1">GATE {targetYear}</h3>
                <span className="text-sm text-gray-300">The examination date has passed. Great job!</span>
            </div>
        );
    }

    return (
        <div className="p-4 bg-gray-800/50 rounded-lg shadow-xl border border-gray-700">
            <h3 className="text-xs uppercase font-semibold text-gray-400 mb-3">
                GATE {targetYear} Countdown
            </h3>
            <div id="countdown-timer" className="flex justify-between items-center text-white">
                {timeComponents.map((c, index) => (
                    <div key={index} className="text-center w-1/4">
                        <div className="text-3xl lg:text-4xl font-mono font-extrabold text-cyan-400 leading-none">
                            {String(c.v).padStart(2, '0')}
                        </div>
                        <div className="text-xs uppercase text-gray-500 mt-1">{c.l}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};
// --- End CountdownTimer ---


// --- Main App Component (MODIFIED with new UI structure) ---
export default function Home() {
    const [subjects, setSubjects] = useState([]);
    const [targetYear, setTargetYear] = useState(null);
    const [selectedSubjectId, setSelectedSubjectId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showYearModal, setShowYearModal] = useState(false);
    
    // 1. Initial Data Loading (IndexedDB)
    useEffect(() => {
        async function loadInitialData() {
            try {
                const savedSubjects = await loadSubjects();
                const initialSubjects = savedSubjects || getInitialSubjects();
                setSubjects(initialSubjects);
                
                const savedYear = await loadTargetYear();
                setTargetYear(savedYear);
                
                if (!savedYear) {
                    setShowYearModal(true);
                }
            } catch (error) {
                console.error("Error loading data from IndexedDB:", error);
                setSubjects(getInitialSubjects());
                setShowYearModal(true);
            } finally {
                setIsLoading(false);
            }
        }
        
        loadInitialData();
    }, []); 


    // 2. Update Handler - updates state and saves to IndexedDB
    const updateSubject = useCallback((updatedSubject) => {
        setSubjects(prevSubjects => {
            const newSubjects = prevSubjects.map(s => s.id === updatedSubject.id ? updatedSubject : s);
            
            saveSubjects(newSubjects).catch(err => {
                console.error("Error saving subjects to IndexedDB:", err);
            });
            
            return newSubjects;
        });
    }, []);
    
    // 3. Update Target Year Handler
    const updateTargetYear = useCallback(async (year) => {
        setTargetYear(year);
        setShowYearModal(false);
        
        saveTargetYear(year).catch(err => {
            console.error("Error saving target year to IndexedDB:", err);
        });
    }, []);
    
    // Calculate Overall Progress (Derived State - UNCHANGED)
    const { totalLectures, totalCompletedLectures, globalProgress, completedSubjectsCount } = useMemo(() => {
        const total = subjects.reduce((acc, s) => acc + (s.totalLectures || 0), 0);
        const completed = subjects.reduce((acc, s) => acc + s.completedLectures.length, 0);
        
        const completedSubs = subjects.filter(s => 
            s.totalLectures > 0 && s.completedLectures.length >= s.totalLectures
        ).length;
        
        return { 
            totalLectures: total, 
            totalCompletedLectures: completed, 
            globalProgress: total > 0 ? (completed / total) * 100 : 0,
            completedSubjectsCount: completedSubs,
        };
    }, [subjects]);

    const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
    
    // --- Conditional Rendering ---
    if (isLoading) {
        return (
            <div className="bg-[#0f172a] min-h-screen flex items-center justify-center">
                <div className="text-center text-cyan-400 py-20 text-lg">
                    <FaTachometerAlt className="animate-spin inline-block mr-2" />
                    Loading Local Progress...
                </div>
            </div>
        );
    }

    // Main App View
    return (
        <div className="bg-[#0f172a] text-gray-100 selection:bg-cyan-600/50 min-h-screen relative font-sans">
            <Head>
                <title>GATE CSE Dashboard</title>
            </Head>
            {/* Global Styles for the new aesthetic */}
            <style jsx global>{`
                :root {
                    --font-header: 'Sora', sans-serif;
                    --font-body: 'Inter', sans-serif;
                }
                body {
                    font-family: var(--font-body);
                    background-color: #0f172a; /* Slate-900 */
                }
                .font-header {
                    font-family: var(--font-header);
                }
                .scrollbar-thin { scrollbar-width: thin; scrollbar-color: #334155 #0f172a; }
                .scrollbar-thin::-webkit-scrollbar { width: 8px; }
                .scrollbar-thin::-webkit-scrollbar-track { background: #0f172a; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #334155; border-radius: 20px; border: 3px solid #0f172a; }
                
                /* Darker, subtle background pattern/glow */
                .radiant-bg-container::before {
                    content: "";
                    position: fixed;
                    inset: 0;
                    opacity: 0.1;
                    background-image: radial-gradient(circle at 10% 10%, #06b6d4 0%, transparent 20%), 
                                      radial-gradient(circle at 90% 90%, #6366f1 0%, transparent 20%);
                    background-size: 100% 100%;
                    pointer-events: none;
                    z-index: -1;
                    filter: blur(150px);
                }
                .progress-ring-circle { transition: stroke-dashoffset 0.5s ease-out; }

            `}</style>

            <div className="radiant-bg-container"></div>

            <div id="app-root" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* --- HEADER / TOP SECTION --- */}
                <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-800">
                    <h1 className="text-3xl font-header font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-500">
                        GATE CSE TRACKER <span className='text-sm text-gray-500 ml-2'>v1.0</span>
                    </h1>
                    
                    <button 
                        onClick={() => setShowYearModal(true)} 
                        className="flex items-center text-sm font-medium px-3 py-1.5 rounded-full bg-indigo-500 hover:bg-indigo-600 transition-colors text-white shadow-lg shadow-indigo-500/30"
                        title="Change Target Year"
                    >
                        <FaCog className="mr-2" />
                        Settings
                    </button>
                </header>

                {/* --- DASHBOARD SUMMARY ROW --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                    
                    {/* 1. Countdown Widget */}
                    <div className="lg:col-span-1">
                        <CountdownTimer targetYear={targetYear} />
                    </div>

                    {/* 2. Overall Progress Gauge (Redesigned Visualization) */}
                    <div className="lg:col-span-2 p-6 bg-gray-800/50 rounded-lg shadow-xl border border-gray-700 flex items-center justify-between">
                        
                        <div className="flex items-center">
                            {/* SVG Progress Ring */}
                            <div className="relative w-24 h-24 sm:w-32 sm:h-32 mr-6 flex-shrink-0">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle 
                                        cx="50" cy="50" r="45" 
                                        fill="none" 
                                        stroke="#1e293b" // Base color (slate-800)
                                        strokeWidth="10"
                                    />
                                    <circle 
                                        cx="50" cy="50" r="45" 
                                        fill="none" 
                                        stroke="#06b6d4" // Active color (cyan-500)
                                        strokeWidth="10"
                                        strokeLinecap="round"
                                        className="progress-ring-circle"
                                        style={{
                                            strokeDasharray: 283, // 2 * pi * 45
                                            strokeDashoffset: 283 - (globalProgress / 100) * 283
                                        }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xl sm:text-3xl font-mono font-bold text-cyan-400">
                                        {Math.round(globalProgress)}%
                                    </span>
                                </div>
                            </div>

                            {/* Progress Details */}
                            <div>
                                <h2 className="text-xl sm:text-2xl font-header font-bold mb-1 text-white">
                                    Overall Syllabus Progress
                                </h2>
                                <p className="text-sm text-gray-400">
                                    <span className="font-semibold text-cyan-300">{totalCompletedLectures}</span> / {totalLectures} Lectures Completed
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    <span className="font-semibold text-white">{completedSubjectsCount}</span> / {subjects.length} Subjects Fully Covered
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- SUBJECTS GRID --- */}
                <main className="mb-12">
                    <h2 className="text-xl font-header font-semibold mb-6 text-gray-300 flex items-center border-b border-gray-800 pb-2">
                        {/* Using FaBook as a general icon for the subject list section */}
                        <FaBook className="mr-2 text-indigo-400"/> Core Subjects
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {/* The subject card will now use the specific icons you defined */}
                        {subjects.map((subject, index) => (
                            <SubjectCard
                                key={subject.id}
                                subject={subject}
                                index={index}
                                onClick={() => setSelectedSubjectId(subject.id)}
                            />
                        ))}
                    </div>
                </main>
            
                {/* --- FOOTER --- */}
                <footer className="relative z-10 max-w-7xl mx-auto px-4 py-6 mt-12 text-center text-gray-600 border-t border-gray-800">
  <div className="flex justify-center items-center gap-6 mb-2">
    <a
      href="https://www.linkedin.com/in/aayush-rai-7334262a9/"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-blue-400 transition-colors"
      aria-label="LinkedIn Profile"
    >
      <FaLinkedin className="w-5 h-5" />
    </a>

    {/* GitHub icon with green hover and scale effect */}
    <a
      href="https://github.com/iyusshh"
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-600 hover:text-green-400 transform hover:scale-110 transition-all duration-300 ease-in-out"
      aria-label="GitHub Profile"
    >
      <FaGithub className="w-5 h-5" />
    </a>
  </div>

  <p className="text-sm">
    Developed by Aayush Rai
  </p>
  <p className="text-xs mt-1 text-gray-700">
    Data stored locally using IndexedDB
  </p>
</footer>

            </div>

            {/* Modals are rendered conditionally based on state */}
            {selectedSubject && (
                <SubjectDetailModal
                    subject={selectedSubject}
                    onClose={() => setSelectedSubjectId(null)}
                    onUpdate={updateSubject} // Triggers IndexedDB save
                />
            )}
            
            {showYearModal && (
                <GateYearModal
                    onSetYear={updateTargetYear} // Triggers IndexedDB save
                    onClose={() => setShowYearModal(false)}
                />
            )}
        </div>
    );
}