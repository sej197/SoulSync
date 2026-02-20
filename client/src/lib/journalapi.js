import axios from 'axios';

const journalapi = axios.create({
    baseURL: `/api/journal`,
    withCredentials: true
});

export const fetchJournalEntries = async (page = 1, limit = 10) => {
    const res = await journalapi.get(`/?page=${page}&limit=${limit}`);
    return res.data;
};

export const fetchJournalByDate = async (date) => {
    const res = await journalapi.get(`/by-date?entryTime=${date}`);
    return res.data;
};

export const fetchCalendarDates = async (month, year) => {
    const res = await journalapi.get(`/calendar-dates?month=${month}&year=${year}`);
    return res.data;
};

export const createJournalEntry = async (text, subject) => {
    const res = await journalapi.post('/', { text, subject });
    return res.data;
};

export const updateJournalEntry = async (entryId, text, subject) => {
    const res = await journalapi.put(`/${entryId}`, { text, subject });
    return res.data;
};

export const deleteJournalEntry = async (entryId) => {
    const res = await journalapi.delete(`/${entryId}`);
    return res.data;
};

export default journalapi;
