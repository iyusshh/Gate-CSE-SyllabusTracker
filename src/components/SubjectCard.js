import React from 'react';
// Imports updated to use the 'src/' structure:
import { getSubjectIcon } from '../utils/icons';
import { renderCircularProgressBar } from '../utils/progress';

export const SubjectCard = ({ subject, index, onClick }) => {
    // Ensure totalLectures is never zero or null to prevent division by zero in UI
    const totalLecturesCount = subject.totalLectures || 45; 
    const lectureProgress = totalLecturesCount > 0 ? (subject.completedLectures.length / totalLecturesCount) * 100 : 0;
    
    // Ensure chapters.length is never zero
    const totalChaptersCount = subject.chapters.length;
    const completedChapters = subject.chapters.filter(c => c.completed).length;
    const chapterProgress = totalChaptersCount > 0 ? (completedChapters / totalChaptersCount) * 100 : 0;
    
    const Icon = getSubjectIcon(subject.id);

    return (
        <div
            data-subject-id={subject.id}
            className="subject-card relative bg-gray-900/50 backdrop-blur-md border border-gray-200/10 rounded-2xl p-4 cursor-pointer shadow-lg flex flex-col justify-between transition-all duration-300 hover:scale-[1.03] hover:border-sky-400/50 hover:shadow-sky-400/10 overflow-hidden"
            style={{ animationDelay: `${index * 60}ms` }}
            onClick={onClick}
        >
            <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                {Icon && <Icon className="w-full h-full scale-125 text-gray-500" />}
            </div>
            <div className="relative flex-grow flex flex-col">
                <h3 className="font-semibold text-lg text-gray-100 mb-3 truncate">{subject.name}</h3>
                <div className="flex items-center justify-center my-4">
                    <div dangerouslySetInnerHTML={{ __html: renderCircularProgressBar(lectureProgress) }} />
                </div>
                <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Chapters</span>
                        <span>{completedChapters}/{totalChaptersCount}</span>
                    </div>
                    <div className="w-full bg-gray-200/10 rounded-full h-1.5">
                        <div 
                            className="bg-teal-400 h-1.5 rounded-full progress-glow glow-teal transition-all duration-500 ease-out" 
                            style={{ width: `${chapterProgress}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};