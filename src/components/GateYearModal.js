import React from 'react';

export const GateYearModal = ({ onSetYear, onClose }) => {
    const currentYear = new Date().getFullYear();
    // Offer current year + 1, +2, +3 as options
    const years = [currentYear + 1, currentYear + 2, currentYear + 3];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
            <div className="bg-gray-800/80 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-sm text-center p-8 shadow-2xl transition-all duration-350 transform scale-100">
                <h2 className="text-2xl font-bold text-white mb-2 font-header">Set Your Goal</h2>
                <p className="text-gray-400 mb-6">Which GATE exam are you preparing for?</p>
                <div className="flex justify-center gap-4">
                    {years.map(y => (
                        <button 
                            key={y} 
                            onClick={() => onSetYear(y)} 
                            className="bg-white/10 hover:bg-sky-500 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-lg"
                        >
                            GATE {y}
                        </button>
                    ))}
                </div>
                <button onClick={onClose} className="mt-6 text-sm text-gray-500 hover:text-gray-300">
                    Skip for now
                </button>
            </div>
        </div>
    );
};
