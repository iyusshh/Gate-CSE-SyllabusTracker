import React from 'react';
import { FaBook, FaGlobe, FaBezierCurve, FaLaptopCode, FaDatabase, FaNetworkWired, FaCog, FaMicrochip, FaTerminal, FaCodeBranch, FaShieldAlt } from 'react-icons/fa';
import { BsLayersFill } from "react-icons/bs";

// Map subject IDs to their corresponding React Icon components
const iconMap = {
    'eng-math': FaBook,
    'disc-math': FaBezierCurve, // Discrete Structures/Graphs
    'gen-apti': FaGlobe,
    'dig-logic': FaMicrochip,
    'comp-org': FaCog,
    'prog-ds': FaTerminal, // Programming
    'algo': FaCodeBranch, // Algorithms/Flow
    'toc': FaShieldAlt, // Theory (Abstract)
    'comp-des': FaLaptopCode,
    'os': BsLayersFill, // Operating System
    'dbms': FaDatabase,
    'comp-net': FaNetworkWired,
};

// Returns the React Icon Component for use in JSX
export function getSubjectIcon(subjectId) {
    return iconMap[subjectId];
}