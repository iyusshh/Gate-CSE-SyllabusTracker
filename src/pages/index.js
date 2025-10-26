import React, { useState, useEffect, useCallback, useReducer, useMemo } from 'react';
import Head from 'next/head';
import { 
    FaPlus, FaTrash, FaLink, FaChevronDown, FaChevronUp, FaLinkedin, 
    FaGithub, FaTimes, FaSignOutAlt, FaCalendarAlt, FaTachometerAlt, 
    FaCog, FaBook, FaGlobe, FaBezierCurve, FaLaptopCode, FaDatabase, 
    FaNetworkWired, FaMicrochip, FaTerminal, FaCodeBranch, FaShieldAlt
} from 'react-icons/fa'; 
import { BsLayersFill } from "react-icons/bs"; 

// The SubjectCard, GateYearModal, getSubjectIcon, and IndexedDB utilities are assumed to be available
import { SubjectCard } from '../components/SubjectCard';
import { GateYearModal } from '../components/GateYearModal';
import { getSubjectIcon } from '../utils/icons'; 
import { saveSubjects, loadSubjects, saveTargetYear, loadTargetYear } from '../utils/idb';


// --------------------------------------------------------------------------------
// --- START: SubjectDetailModal Implementation (Moved from component file) ---
// --------------------------------------------------------------------------------

// --- Reducer Logic for Subject State Management inside Modal ---
const subjectReducer = (state, action) => {
    switch (action.type) {
        case 'UPDATE_FIELD':
            return { ...state, [action.field]: action.value };
        case 'ADD_CHAPTER':
            return { ...state, chapters: [...(state.chapters || []), { id: Math.random().toString(36).substr(2, 9), name: 'New Chapter', completed: false }] };
        case 'REMOVE_CHAPTER':
            return { ...state, chapters: (state.chapters || []).filter(c => c.id !== action.id) };
        case 'TOGGLE_CHAPTER':
            return { ...state, chapters: (state.chapters || []).map(c => c.id === action.id ? { ...c, completed: action.completed } : c) };
        case 'EDIT_CHAPTER_NAME':
            return { ...state, chapters: (state.chapters || []).map(c => c.id === action.id ? { ...c, name: action.name } : c) };
        case 'TOGGLE_LECTURE':
            let completed = new Set(state.completedLectures || []);
            if (action.checked) {
                // Mark current and all previous as completed
                for (let i = 1; i <= action.number; i++) completed.add(i);
            } else {
                // Mark current and all subsequent as uncompleted
                for (let i = action.number; i <= state.totalLectures; i++) completed.delete(i);
            }
            return { ...state, completedLectures: Array.from(completed).sort((a,b) => a - b) };
        case 'CLEAR_COMPLETED_LECTURES':
            return { ...state, completedLectures: [] };
        default:
            return state;
    }
};

// --- LectureToggle Component ---
const LectureToggle = ({ number, isCompleted, onToggle }) => (
    <label>
        <input 
            type="checkbox" 
            className="hidden peer" 
            checked={isCompleted} 
            onChange={(e) => onToggle(number, e.target.checked)}
        />
        <span className={`w-10 h-10 flex items-center justify-center rounded-md text-sm cursor-pointer transition-all ${isCompleted ? 'bg-cyan-500 text-white hover:opacity-80' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            {number}
        </span>
    </label>
);

// --- SubjectDetailModal Component (Adapted for your onUpdate handler) ---
const SubjectDetailModal = ({ subject, onClose, onUpdate }) => {
    // Ensure safe defaults for totalLectures and arrays
    const safeInitialSubject = {
        ...subject,
        chapters: subject.chapters || [],
        completedLectures: subject.completedLectures || [],
        totalLectures: subject.totalLectures || 45
    };
    
    // We use useReducer for managing complex local state changes
    const [localSubject, dispatch] = useReducer(subjectReducer, safeInitialSubject);
    const [lectureInputValue, setLectureInputValue] = useState(localSubject.totalLectures.toString());
    const [showCompletedLectures, setShowCompletedLectures] = useState(false);

    // This effect ensures that every state change in the modal
    // is immediately reflected and saved by calling the parent's onUpdate handler.
    useEffect(() => {
        // Calculate the progress before updating the parent state
        const total = localSubject.totalLectures || 45;
        const completedCount = (localSubject.completedLectures || []).length;
        const newProgress = total > 0 ? Math.round((completedCount / total) * 100) : 0;

        onUpdate({
            ...localSubject,
            progress: newProgress // Automatically update progress on every change
        });
    }, [localSubject, onUpdate]);

    // Sync totalLectures input with state
    useEffect(() => {
        setLectureInputValue(localSubject.totalLectures.toString());
    }, [localSubject.totalLectures]);

    const timeSince = localSubject.startDate ? (() => {
        const dateStr = localSubject.startDate.split('T')[0];
        const start = new Date(dateStr); 
        const today = new Date();
        
        today.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);

        const diffTime = today.getTime() - start.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
        
        return diffDays;
    })() : 0;
    
    const totalLecturesCount = localSubject.totalLectures || 45; 
    const allLectures = Array.from({ length: totalLecturesCount }, (_, i) => i + 1);
    const completedLecturesSet = new Set(localSubject.completedLectures || []);

    const uncompletedLectures = allLectures.filter(l => !completedLecturesSet.has(l));
    const completedLectures = allLectures.filter(l => completedLecturesSet.has(l));
    
    const handleToggleLecture = (number, checked) => {
        dispatch({ type: 'TOGGLE_LECTURE', number, checked, totalLectures: totalLecturesCount });
    };

    const handleToggleChapter = (chapterId, completed) => {
        dispatch({ type: 'TOGGLE_CHAPTER', id: chapterId, completed });
    };

    const handleChapterNameChange = (chapterId, name) => {
        dispatch({ type: 'EDIT_CHAPTER_NAME', id: chapterId, name });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
            <div className="bg-gray-800/80 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl transition-all duration-350 transform scale-100">
                <header className="flex items-start justify-between p-4 border-b border-white/10">
                    <div>
                        <h2 className="text-xl font-bold text-white font-header">{localSubject.name}</h2>
                        <div className="text-xs text-gray-400 mt-2 flex items-center flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <span>Start Date:</span>
                                <input 
                                    type="date" 
                                    value={localSubject.startDate ? localSubject.startDate.split('T')[0] : ''}
                                    onChange={(e) =>  {
                                            const dateValue = e.target.value;
                                            dispatch({ type: 'UPDATE_FIELD', field: 'startDate', value: dateValue || null });
                                        }}
                                    className="bg-white/10 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-cyan-500"
                                />
                            </div>
                            {localSubject.startDate && timeSince >= 0 && <span className="text-teal-400">({timeSince} days ago)</span>}
                        </div>
                        <div className="text-xs text-gray-400 mt-2 flex items-center gap-2 group">
                            <a 
                                href={localSubject.courseLink} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className={`hover:text-cyan-400 ${localSubject.courseLink ? '' : 'pointer-events-none'}`}
                            >
                                <FaLink className="h-4 w-4" />
                            </a>
                            <input 
                                type="text" 
                                placeholder="Paste course link here..." 
                                value={localSubject.courseLink || ''}
                                onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'courseLink', value: e.target.value })}
                                className="bg-white/10 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-cyan-500 w-48"
                            />
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10">
                        <FaTimes className="w-6 h-6" />
                    </button>
                </header>
                <main className="p-6 overflow-y-auto flex-grow scrollbar-thin">
                    <section className="mb-6">
                        <h3 className="font-semibold text-lg text-gray-200 mb-3">Chapters</h3>
                        <div className="space-y-2">
                            {localSubject.chapters.map((chapter) => (
                                <div key={chapter.id} className="flex items-center bg-white/5 p-2 rounded-lg group">
                                    <input 
                                        type="checkbox" 
                                        checked={chapter.completed}
                                        onChange={(e) => handleToggleChapter(chapter.id, e.target.checked)}
                                        className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-cyan-400 focus:ring-cyan-500 cursor-pointer" 
                                    />
                                    <input 
                                        type="text" 
                                        value={chapter.name}
                                        onChange={(e) => handleChapterNameChange(chapter.id, e.target.value)}
                                        className={`flex-grow mx-3 bg-transparent outline-none focus:bg-gray-700/50 rounded px-2 py-1 transition-all ${chapter.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}
                                    />
                                    <button 
                                        onClick={() => dispatch({ type: 'REMOVE_CHAPTER', id: chapter.id })}
                                        className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                    >
                                        <FaTrash className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={() => dispatch({ type: 'ADD_CHAPTER' })}
                            className="mt-3 flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                            <FaPlus className="h-4 w-4" /> Add Chapter
                        </button>
                    </section>
                    
                    <section>
                        <div className="flex items-center justify-between gap-4 mb-3">
                            <div className="flex items-center gap-4">
                                <h3 className="font-semibold text-lg text-gray-200">Lectures</h3>
                                <input 
                                    type="number" 
                                    min="0" 
                                    value={lectureInputValue}
                                    onChange={(e) => setLectureInputValue(e.target.value)}
                                    onBlur={(e) => {
                                        const value = parseInt(e.target.value, 10);
                                        const newValue = isNaN(value) ? 0 : Math.max(0, value);
                                        dispatch({ type: 'UPDATE_FIELD', field: 'totalLectures', value: newValue });
                                        setLectureInputValue(newValue.toString()); 
                                    }}
                                    className="bg-white/10 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-cyan-500 w-20"
                                />
                            </div>
                        </div>
                        
                        <div id="uncompleted-lectures" className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                            {uncompletedLectures.map(num => (
                                <LectureToggle 
                                    key={num} 
                                    number={num} 
                                    isCompleted={false} 
                                    onToggle={handleToggleLecture} 
                                />
                            ))}
                        </div>

                        {allLectures.length > 0 && (
                            <div className="mt-4 border-t border-white/10 pt-4">
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => setShowCompletedLectures(prev => !prev)}
                                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
                                    >
                                        {showCompletedLectures ? <FaChevronUp className="w-4 h-4"/> : <FaChevronDown className="w-4 h-4"/>}
                                        <span>Show {completedLecturesSet.size} Completed</span>
                                    </button>
                                    {completedLecturesSet.size > 0 && (
                                        <button 
                                            onClick={() => dispatch({ type: 'CLEAR_COMPLETED_LECTURES' })}
                                            className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>
                                <div 
                                    className={`grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 mt-3 overflow-hidden transition-all duration-300 ${showCompletedLectures ? 'h-auto max-h-[300px]' : 'h-0 max-h-0'}`}
                                >
                                    {completedLectures.map(num => (
                                        <LectureToggle 
                                            key={num} 
                                            number={num} 
                                            isCompleted={true} 
                                            onToggle={handleToggleLecture} 
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
};
// --------------------------------------------------------------------------------
// --- END: SubjectDetailModal Implementation ---
// --------------------------------------------------------------------------------


// --- UTILITY FUNCTIONS ---
const createChapter = (name) => ({ id: Math.random().toString(36).substr(2, 9), name, completed: false });

const getInitialSubjects = () => [
    { id: 'eng-math', name: 'Engineering Mathematics', chapters: ['Linear Algebra', 'Calculus', 'Probability and Statistics'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'disc-math', name: 'Discrete Mathematics', chapters: ['Propositional and First Order Logic', 'Sets, Relations & Functions', 'Monoids, Groups', 'Graph Theory', 'Combinatorics'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'gen-apti', name: 'General Aptitude', chapters: ['Quantitative Aptitude', 'Analytical Aptitude', 'Spatial Aptitude', 'Verbal Aptitude'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'dig-logic', name: 'Digital Logic', chapters: ['Boolean Algebra', 'Combinational and Sequential Circuits', 'Minimization', 'Number Representations & Computer Arithmetic'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'comp-org', name: 'Computer Organization & Architecture', chapters: ['Machine Instructions & Addressing Modes', 'ALU, Data-path and Control Unit', 'Instruction Pipelining', 'Memory Hierarchy', 'I/O Interface'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'prog-ds', name: 'Programming & Data Structures', chapters: ['Programming in C', 'Recursion', 'Arrays, Stacks, Queues', 'Linked Lists', 'Trees, BSTs, Heaps', 'Graphs'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'algo', name: 'Algorithms', chapters: ['Searching, Sorting, Hashing', 'Asymptotic Complexity', 'Greedy, Dynamic Programming, Divide-and-Conquer', 'Graph Traversals', 'Minimum Spanning Trees', 'Shortest Paths'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
    // ✅ FIX 1: Corrected typo from completedLectules to completedLectures: []
    { id: 'toc', name: 'Theory of Computation', chapters: ['Regular Expressions & Finite Automata', 'Context-Free Grammars & Push-Down Automata', 'Regular and Context-Free Languages', 'Turing Machines and Undecidability'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'comp-des', name: 'Compiler Design', chapters: ['Lexical Analysis', 'Parsing, Syntax-Directed Translation', 'Runtime Environments', 'Intermediate Code Generation', 'Local Optimisation & Data Flow Analyses'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'os', name: 'Operating System', chapters: ['System Calls, Processes, Threads', 'Concurrency and Synchronization', 'Deadlock', 'CPU and I/O Scheduling', 'Memory Management & Virtual Memory', 'File Systems'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
    { id: 'dbms', name: 'Database Management System', chapters: ['ER-model', 'Relational Model (Algebra, Calculus, SQL)', 'Integrity Constraints, Normal Forms', 'File Organization, Indexing', 'Transactions & Concurrency Control'].map(createChapter), completedLectures: [], totalLectures: 45, startDate: null, courseLink: '' },
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
                    Target year not set. Click &apos;Settings&apos; to begin.
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


// --- Main App Component ---
export default function Home() {
    const [subjects, setSubjects] = useState([]);
    const [targetYear, setTargetYear] = useState(null);
    const [selectedSubjectId, setSelectedSubjectId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showYearModal, setShowYearModal] = useState(false);
    
    // Initial Data Loading (IndexedDB)
    useEffect(() => {
        async function loadInitialData() {
            try {
                const savedSubjects = await loadSubjects();
                const defaultSubjects = getInitialSubjects(); 

                let subjectsToSet = defaultSubjects;

                if (savedSubjects && savedSubjects.length > 0) {
                    subjectsToSet = defaultSubjects.map(defaultSub => {
                        const savedSub = savedSubjects.find(s => s.id === defaultSub.id);
                        
                        if (savedSub) {
                            return {
                                ...savedSub,
                                name: defaultSub.name,
                                totalLectures: defaultSub.totalLectures,
                            };
                        }
                        return defaultSub;
                    });
                }
                
                setSubjects(subjectsToSet);
                
                const savedYear = await loadTargetYear();
                setTargetYear(savedYear);
                
                if (!savedYear) {
                    setShowYearModal(true);
                }
                
                if (savedSubjects && savedSubjects.length > 0) {
                     await saveSubjects(subjectsToSet);
                }

            } catch (error) {
                console.error("Error loading or migrating data from IndexedDB:", error);
                setSubjects(getInitialSubjects());
                setShowYearModal(true);
            } finally {
                setIsLoading(false);
            }
        }
        
        loadInitialData();
    }, []); 


    // Update Handler
    const updateSubject = useCallback((updatedSubject) => {
        setSubjects(prevSubjects => {
            const newSubjects = prevSubjects.map(s => s.id === updatedSubject.id ? updatedSubject : s);
            saveSubjects(newSubjects).catch(err => {
                console.error("Error saving subjects to IndexedDB:", err);
            });
            return newSubjects;
        });
    }, []);
    
    // Update Target Year Handler
    const updateTargetYear = useCallback(async (year) => {
        setTargetYear(year);
        setShowYearModal(false);
        saveTargetYear(year).catch(err => {
            console.error("Error saving target year to IndexedDB:", err);
        });
    }, []);
    
    // Calculate Overall Progress
    const { totalLectures, totalCompletedLectures, globalProgress, completedSubjectsCount } = useMemo(() => {
        // Use subjects || [] for safe access, though subjects state starts as [] it's safer when passing props later
        const safeSubjects = subjects || []; 
        
        const total = safeSubjects.reduce((acc, s) => acc + (s.totalLectures || 0), 0);
        
        // ✅ FIX 2: Added (s.completedLectures || []) for safe access
        const completed = safeSubjects.reduce((acc, s) => acc + (s.completedLectures || []).length, 0);
        
        // ✅ FIX 2: Added (s.completedLectures || []) for safe access in filter
        const completedSubs = safeSubjects.filter(s => 
            s.totalLectures > 0 && (s.completedLectures || []).length >= s.totalLectures
        ).length;
        
        return { 
            totalLectures: total, 
            totalCompletedLectures: completed, 
            globalProgress: total > 0 ? (completed / total) * 100 : 0,
            completedSubjectsCount: completedSubs,
        };
    }, [subjects]); // Dependency array is still 'subjects'

    const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
    
    // --- Conditional Loading View ---
    if (isLoading) {
        return (
            <div className="bg-black min-h-screen flex items-center justify-center">
                <div className="text-center text-cyan-400 py-20 text-lg">
                    <FaTachometerAlt className="animate-spin inline-block mr-2" />
                    Loading Local Progress...
                </div>
            </div>
        );
    }

    // --- Main App View ---
    return (
        // Ensured font-sans is here for default text, and no conflicting background color.
        <div className="text-gray-100 selection:bg-cyan-600/50 min-h-screen relative font-sans">
            <Head>
                <title>GATE CSE Dashboard</title>
            </Head>

            <div id="app-root" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* --- HEADER / TOP SECTION --- */}
                <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-800">
                    {/* FIX: Ensuring font-header is applied to the main title */}
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
                                <style jsx>{`
                                    .progress-ring-circle {
                                        transition: stroke-dashoffset 0.5s ease;
                                    }
                                `}</style>
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

                            {/* Progress Details - Also using font-header here for consistency */}
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
                    {/* FIX: Ensuring font-header is applied to the Subjects section title */}
                    <h2 className="text-xl font-header font-semibold mb-6 text-gray-300 flex items-center border-b border-gray-800 pb-2">
                        <FaBook className="mr-2 text-indigo-400"/> Core Subjects
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {subjects.map((subject, index) => (
                            <SubjectCard
                                key={subject.id}
                                subject={subject}
                                index={index}
                                // The SubjectCard component should ideally calculate and pass a color prop
                                // getSubjectIcon is used in SubjectCard to map the icon, but color needs to be handled there too.
                                onClick={() => setSelectedSubjectId(subject.id)}
                            />
                        ))}
                    </div>
                </main>
            
                {/* --- FOOTER (UNCHANGED) --- */}
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
                    onUpdate={updateSubject}
                />
            )}
            
            {showYearModal && (
                <GateYearModal
                    onSetYear={updateTargetYear}
                    onClose={() => setShowYearModal(false)}
                />
            )}
        </div>
    );
}