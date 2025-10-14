import React, { useState, useReducer, useEffect } from 'react';
import { FaPlus, FaTrash, FaLink, FaChevronDown, FaChevronUp, FaTimes } from 'react-icons/fa';

// --- Reducer for Subject State in Modal ---
const subjectReducer = (state, action) => {
    switch (action.type) {
        case 'UPDATE_FIELD':
            return { ...state, [action.field]: action.value };
        case 'ADD_CHAPTER':
            return { ...state, chapters: [...state.chapters, { id: Math.random().toString(36).substr(2, 9), name: 'New Chapter', completed: false }] };
        case 'REMOVE_CHAPTER':
            return { ...state, chapters: state.chapters.filter(c => c.id !== action.id) };
        case 'TOGGLE_CHAPTER':
            // The action.completed property here comes from the checkbox onChange event
            return { ...state, chapters: state.chapters.map(c => c.id === action.id ? { ...c, completed: action.completed } : c) };
        case 'EDIT_CHAPTER_NAME':
            return { ...state, chapters: state.chapters.map(c => c.id === action.id ? { ...c, name: action.name } : c) };
        case 'TOGGLE_LECTURE':
            let completed = new Set(state.completedLectures);
            if (action.checked) {
                // Check lecture and all preceding
                for (let i = 1; i <= action.number; i++) completed.add(i);
            } else {
                // Uncheck lecture and all succeeding
                // This ensures consistency: if lecture 5 is unchecked, 6, 7, etc. must also be unchecked
                for (let i = action.number; i <= state.totalLectures; i++) completed.delete(i);
                
            }
            return { ...state, completedLectures: Array.from(completed).sort((a,b) => a - b) };
        case 'CLEAR_COMPLETED_LECTURES':
            return { ...state, completedLectures: [] };
        default:
            return state;
    }
};

const LectureToggle = ({ number, isCompleted, onToggle }) => (
    <label>
        <input 
            type="checkbox" 
            className="hidden peer" 
            checked={isCompleted} 
            // We pass the new state back to the handler
            onChange={(e) => onToggle(number, e.target.checked)}
        />
        <span className={`w-10 h-10 flex items-center justify-center rounded-md text-sm cursor-pointer transition-all ${isCompleted ? 'bg-teal-500 text-white hover:opacity-80' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            {number}
        </span>
    </label>
);

export const SubjectDetailModal = ({ subject, onClose, onUpdate }) => {
    const [localSubject, dispatch] = useReducer(subjectReducer, subject);
    const [lectureInputValue, setLectureInputValue] = useState(localSubject.totalLectures.toString());
    // Sync the local input value when the subject state changes (e.g., modal opening)
    useEffect(() => {
        setLectureInputValue(localSubject.totalLectures.toString());
    }, [localSubject.totalLectures]);
    const [showCompletedLectures, setShowCompletedLectures] = useState(false);

    // Effect to persist changes back to the parent state and local storage
    // Runs automatically whenever localSubject state changes
    useEffect(() => {
        onUpdate(localSubject);
    }, [localSubject, onUpdate]);

    const timeSince = localSubject.startDate ? Math.floor((new Date() - new Date(localSubject.startDate)) / 864e5) : 0;
    
    // Use the actual totalLectures from state, defaulting to 45 if not set
    const totalLecturesCount = localSubject.totalLectures || 45; 
    const allLectures = Array.from({ length: totalLecturesCount }, (_, i) => i + 1);
    const completedLecturesSet = new Set(localSubject.completedLectures);

    const uncompletedLectures = allLectures.filter(l => !completedLecturesSet.has(l));
    const completedLectures = allLectures.filter(l => completedLecturesSet.has(l));
    
    // Handler for Lecture Toggling
    const handleToggleLecture = (number, checked) => {
        dispatch({ type: 'TOGGLE_LECTURE', number, checked });
    };

    // Handler for Chapter Toggling
    const handleToggleChapter = (chapterId, completed) => {
        dispatch({ type: 'TOGGLE_CHAPTER', id: chapterId, completed });
    };

    // Handler for Chapter Name Change
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
                                    onChange={(e) =>  {
                                    // If the date input has a value, convert it to an ISO string for storage; otherwise, set to null.
                                            const dateValue = e.target.value;
                                            dispatch({ type: 'UPDATE_FIELD', field: 'startDate', value: dateValue ? new Date(dateValue + 'T00:00:00').toISOString() : null });
                                        }}
                                    className="bg-white/10 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-sky-500"
                                />
                            </div>
                            {localSubject.startDate && timeSince >= 0 && <span className="text-teal-400">({timeSince} days ago)</span>}
                        </div>
                        <div className="text-xs text-gray-400 mt-2 flex items-center gap-2 group">
                            <a href={localSubject.courseLink} target="_blank" rel="noopener noreferrer" className={`hover:text-sky-400 ${localSubject.courseLink ? '' : 'pointer-events-none'}`}>
                                <FaLink className="h-4 w-4" />
                            </a>
                            <input 
                                type="text" 
                                placeholder="Paste course link here..." 
                                value={localSubject.courseLink || ''}
                                onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'courseLink', value: e.target.value })}
                                className="bg-white/10 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-sky-500 w-48"
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
                                        className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-sky-400 focus:ring-sky-500 cursor-pointer" 
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
                            className="mt-3 flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300 transition-colors"
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
    // Uses the temporary state for visual display
    value={lectureInputValue} 
    
    // Updates only the temporary state (allows smooth backspacing/typing)
    onChange={(e) => setLectureInputValue(e.target.value)}
    
    // Commits the final value to the main application state only when the field loses focus
    onBlur={(e) => {
        // 1. Convert the user's input to an integer
        const value = parseInt(e.target.value, 10);
        
        // 2. Determine the clean value: if it's not a number (empty string), use 0; otherwise, use the value.
        const newValue = isNaN(value) ? 0 : Math.max(0, value);
        
        // 3. Update the main application state (the reducer)
        dispatch({ type: 'UPDATE_FIELD', field: 'totalLectures', value: newValue });
        
        // 4. Update the temporary state to reflect the committed clean value (e.g., if user typed 45 and deleted it, this makes the box show "0")
        setLectureInputValue(newValue.toString()); 
    }}
    className="bg-white/10 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-sky-500 w-20"
/>
                            </div>
                        </div>
                        
                        <div id="uncompleted-lectures" className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                            {/* Uncompleted Lectures (Toggling sets progress) */}
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
                                        {showCompletedLectures ? <FaChevronUp /> : <FaChevronDown />}
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
                                    {/* Completed Lectures (Toggling unsets progress) */}
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