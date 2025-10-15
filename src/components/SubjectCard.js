import React from 'react';
import { FaLaptopCode, FaLink, FaCheckCircle } from 'react-icons/fa';
import { getSubjectIcon } from '../utils/icons';
// Assuming this utility exists to generate the SVG for the circular progress bar
import { renderCircularProgressBar } from '../utils/progress';

export const SubjectCard = ({ subject, index, onClick }) => {
    // --- Data Calculation ---
    const totalLecturesCount = subject.totalLectures || 45; 
    const lectureProgress = totalLecturesCount > 0 ? (subject.completedLectures.length / totalLecturesCount) * 100 : 0;
    
    const totalChaptersCount = subject.chapters.length;
    const completedChapters = subject.chapters.filter(c => c.completed).length;
    const chapterProgress = totalChaptersCount > 0 ? (completedChapters / totalChaptersCount) * 100 : 0;
    
    // Get the icon component
    const IconComponent = getSubjectIcon(subject.id) || FaLaptopCode;
    const isComplete = lectureProgress >= 100;

    // --- Dynamic Styles ---
    const hoverBorder = isComplete ? 'hover:border-green-500/50' : 'hover:border-sky-500/50';
    const hoverShadow = isComplete ? 'hover:shadow-green-500/30' : 'hover:shadow-sky-500/30';

    return (
        <div
            onClick={onClick}
            className={`
                subject-card relative 
                bg-gray-900/50 backdrop-blur-sm 
                border border-gray-700
                rounded-2xl p-6 cursor-pointer 
                flex flex-col justify-between 
                transition-all duration-300 
                transform hover:scale-[1.03] 
                ${hoverBorder} ${hoverShadow} 
                shadow-xl group
            `}
            style={{ animationDelay: `${index * 60}ms` }}
        >
            {/* 1. Subject Header */}
            <div className="flex items-start justify-between mb-4">
                {/* CHANGE 1: Removed 'items-center' for better vertical alignment 
                            if name wraps to 3+ lines.
                  CHANGE 2: Added 'flex-wrap' to ensure the text can move to the next line.
                */}
                <div className="flex items-start flex-wrap"> 
                    <IconComponent className="w-6 h-6 text-sky-400 flex-shrink-0 mr-3 transition-transform duration-300 group-hover:scale-110" />
                    {/* CHANGE 3: Removed 'truncate'.
                      CHANGE 4: Added 'flex-1' to let the h3 take the remaining width.
                    */}
                    <h3 className="font-header font-bold text-lg text-white leading-tight flex-1">
                        {subject.name}
                    </h3>
                </div>
            </div>
            
            {/* 2. Main Circular Progress (Lectures) */}
            <div className="flex items-center justify-center my-4">
                <div dangerouslySetInnerHTML={{ __html: renderCircularProgressBar(lectureProgress, isComplete) }} />
            </div>
            
            {/* 3. Chapter Progress Bar */}
            <div className="relative z-10 pt-4 border-t border-gray-700/50 mt-4">
                <div className="flex justify-between text-sm font-medium text-gray-400 mb-1">
                    <span>Chapters</span>
                    <span className="text-white font-bold">
                        {completedChapters}/{totalChaptersCount}
                    </span>
                </div>
                
                <div className="w-full bg-gray-700/70 rounded-full h-2.5 overflow-hidden">
                    <div 
                        className="h-full rounded-full bg-indigo-500 transition-all duration-700 ease-out progress-glow glow-teal" 
                        style={{ width: `${chapterProgress}%` }}
                    />
                </div>
            </div>
            
            {/* 4. Status Badge (Footer) */}
            <div className="relative z-10 pt-4 flex justify-end">
                {isComplete ? (
                    <span className="flex items-center text-sm font-semibold text-green-400">
                        <FaCheckCircle className="mr-1.5 w-4 h-4" />
                        Completed
                    </span>
                ) : (
                    <span className="text-sm font-semibold text-gray-500">
                        In Progress
                    </span>
                )}
            </div>
        </div>
    );
};