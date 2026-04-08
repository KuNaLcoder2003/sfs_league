import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTeams, createMatch } from '../api/client';
import type { Team, TossDecision, MatchType } from '../types';

export default function NewMatch() {
    const navigate = useNavigate();
    const [teams, setTeams] = useState<Team[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [teamOneId, setTeamOneId] = useState<number | ''>('');
    const [teamTwoId, setTeamTwoId] = useState<number | ''>('');
    const [tossTeamId, setTossTeamId] = useState<number | ''>('');
    const [tossDecision, setTossDecision] = useState<TossDecision>('Bat');
    const [venue, setVenue] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [matchType, setMatchType] = useState<MatchType>('league');
    const [powerplayOvers, setPowerplayOvers] = useState(2);

    useEffect(() => {
        getTeams().then(r => setTeams(r.data.data));
    }, []);

    const totalOvers = matchType === 'final' ? 10 : 8;

    const handleSubmit = async () => {
        if (!teamOneId || !teamTwoId || !tossTeamId || !venue) {
            setError('Please fill all required fields');
            return;
        }
        if (teamOneId === teamTwoId) {
            setError('Teams must be different');
            return;
        }
        setSaving(true);
        try {
            const r = await createMatch({
                teamOneId, teamTwoId, tossTeamId, tossDecision,
                venue, date, match_type: matchType, powerplay_overs: powerplayOvers,
            });
            navigate(`/scoring/${r.data.data.id}`);
        } catch { setError('Failed to create match'); }
        finally { setSaving(false); }
    };

    return (
        <div className="max-w-lg mx-auto px-4 py-6">
            <h2 className="text-xl font-bold text-white mb-6">Create New Match</h2>

            {error && (
                <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-xl px-4 py-3 text-sm mb-4">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {/* Teams */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Team 1</label>
                        <select
                            value={teamOneId}
                            onChange={e => setTeamOneId(Number(e.target.value))}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm"
                        >
                            <option value="">Select team</option>
                            {teams.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Team 2</label>
                        <select
                            value={teamTwoId}
                            onChange={e => setTeamTwoId(Number(e.target.value))}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm"
                        >
                            <option value="">Select team</option>
                            {teams.filter(t => t.id !== teamOneId).map(t => <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Toss */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Toss Won By</label>
                        <select
                            value={tossTeamId}
                            onChange={e => setTossTeamId(Number(e.target.value))}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm"
                        >
                            <option value="">Select</option>
                            {[teamOneId, teamTwoId].filter(Boolean).map(id => {
                                const t = teams.find(t => t.id === id);
                                return t ? <option key={t.id} value={t.id}>{t.emoji} {t.name}</option> : null;
                            })}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Elected To</label>
                        <div className="grid grid-cols-2 gap-1.5">
                            {(['Bat', 'Bowl'] as TossDecision[]).map(d => (
                                <button key={d}
                                    onClick={() => setTossDecision(d)}
                                    className={`py-2.5 rounded-xl text-sm font-semibold transition ${tossDecision === d
                                            ? 'bg-brand-gold text-gray-900'
                                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                        }`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Venue & Date */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Venue</label>
                        <input
                            value={venue}
                            onChange={e => setVenue(e.target.value)}
                            placeholder="Ground name"
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm placeholder-gray-600"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm"
                        />
                    </div>
                </div>

                {/* Match type & Powerplay */}
                <div className="bg-gray-900 rounded-xl p-4 space-y-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">SCL 2026 Rules</p>

                    <div>
                        <label className="text-xs text-gray-500 block mb-1.5">Match Type</label>
                        <div className="grid grid-cols-3 gap-1.5">
                            {(['league', 'semifinal', 'final'] as MatchType[]).map(m => (
                                <button key={m}
                                    onClick={() => setMatchType(m)}
                                    className={`py-2 rounded-lg text-xs font-semibold capitalize transition ${matchType === m ? 'bg-brand-gold text-gray-900' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                        }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{totalOvers} overs per side</p>
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 block mb-1.5">
                            Power Play Overs (छोटा धमाका / रणचंडी)
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                            {[2, 3].map(n => (
                                <button key={n}
                                    onClick={() => setPowerplayOvers(n)}
                                    className={`py-2 rounded-lg text-xs font-semibold transition ${powerplayOvers === n ? 'bg-yellow-500 text-gray-900' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                        }`}
                                >
                                    {n} overs
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Runs doubled · Wicket = −2 penalty</p>
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="w-full bg-brand-gold text-gray-900 font-bold py-3.5 rounded-xl hover:bg-brand-golddark transition disabled:opacity-40 text-base"
                >
                    {saving ? 'Creating…' : '🏏 Create Match & Start Scoring'}
                </button>
            </div>
        </div>
    );
}