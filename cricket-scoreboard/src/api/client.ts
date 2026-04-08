import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
    headers: { 'Content-Type': 'application/json' },
});

// Teams
export const getTeams = () => api.get('/teams');
export const getTeamById = (id: number) => api.get(`/teams/${id}`);

// Matches
export const getMatches = () => api.get('/matches');
export const getMatchById = (id: number) => api.get(`/matches/${id}`);
export const getLiveScore = (id: number) => api.get(`/matches/${id}/live`);
export const createMatch = (data: object) => api.post('/matches', data);
export const endMatch = (id: number, data: object) => api.put(`/matches/${id}/end`, data);

// Innings
export const startInnings = (data: object) => api.post('/innings', data);
export const getInnings = (id: number) => api.get(`/innings/${id}`);
export const completeInnings = (id: number) => api.put(`/innings/${id}/complete`, {});

// Balls
export const recordBall = (data: object) => api.post('/balls', data);
export const startOver = (data: object) => api.post('/balls/over', data);