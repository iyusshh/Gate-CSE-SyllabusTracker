// utils/icons.js (Your provided update)

import React from 'react';
import { 
    FaBook, FaGlobe, FaBezierCurve, FaLaptopCode, FaDatabase, 
    FaNetworkWired, FaCog, FaMicrochip, FaTerminal, FaCodeBranch, 
    FaShieldAlt 
} from 'react-icons/fa';
import { BsLayersFill } from "react-icons/bs"; // Ensure this import is correct

// Map subject IDs to their corresponding React Icon components
const iconMap = {
    'eng-math': FaBook, // Engineering Mathematics
    'disc-math': FaBezierCurve, // Discrete Structures/Graphs
    'gen-apti': FaGlobe, // General Aptitude (Global/General knowledge)
    'dig-logic': FaMicrochip, // Digital Logic
    'comp-org': FaCog, // Computer Organization (Mechanism/Gears)
    'prog-ds': FaTerminal, // Programming/Command Line
    'algo': FaCodeBranch, // Algorithms/Flow/Branching Logic
    'toc': FaShieldAlt, // Theory (Abstract/Foundation/Shield)
    'comp-des': FaLaptopCode, // Compiler Design
    'os': BsLayersFill, // Operating System (Layers of Abstraction)
    'dbms': FaDatabase,
    'comp-net': FaNetworkWired, // Computer Networks
};

// Returns the React Icon Component for use in JSX
export function getSubjectIcon(subjectId) {
    const IconComponent = iconMap[subjectId] || FaBook;
    // The SubjectCard component in index.js now expects the component itself, 
    // but typically a utility wraps it for size/styling consistency.
    // Assuming SubjectCard handles the size/styling, we return the component:
    return IconComponent; 
}