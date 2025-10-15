// src/utils/idb.js

import { openDB } from 'idb';

const DB_NAME = 'GATETrackerDB';
const DB_VERSION = 1;
const STORE_NAME = 'userProgress'; // We'll use one store for all data

// Keys for the data in the store
const SUBJECTS_KEY = 'subjects';
const YEAR_KEY = 'targetYear';

/**
 * Initializes the IndexedDB database.
 * The upgrade function runs only if the version number is higher than the existing DB.
 */
async function initDB() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion) {
            // Create a store if it doesn't exist
            if (oldVersion < 1) {
                db.createObjectStore(STORE_NAME);
            }
        },
    });
}

/**
 * Saves the main subject data to IndexedDB.
 * @param {Array} subjects - The array of subject objects.
 */
export async function saveSubjects(subjects) {
    const db = await initDB();
    await db.put(STORE_NAME, subjects, SUBJECTS_KEY);
}

/**
 * Loads the subject data from IndexedDB.
 * @returns {Promise<Array | undefined>} The subjects array, or undefined if not found.
 */
export async function loadSubjects() {
    const db = await initDB();
    return db.get(STORE_NAME, SUBJECTS_KEY);
}

/**
 * Saves the target year to IndexedDB.
 * @param {number} year - The GATE target year.
 */
export async function saveTargetYear(year) {
    const db = await initDB();
    await db.put(STORE_NAME, year, YEAR_KEY);
}

/**
 * Loads the target year from IndexedDB.
 * @returns {Promise<number | undefined>} The target year, or undefined if not found.
 */
export async function loadTargetYear() {
    const db = await initDB();
    return db.get(STORE_NAME, YEAR_KEY);
}