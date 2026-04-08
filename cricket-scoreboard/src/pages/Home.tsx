import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMatches } from '../api/client';
import type { Match } from '../types';

function MatchCard({ m }: { m: Match }) {
    const innings1 = m.innings?.[0];
    const innings2 = m.innings?.[1];

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-brand-greenlt transition group">
            {/* Teams */}
            <div className="flex items-center justify-between mb-3">
                <div className="text-center flex-1">
                    <span className="text-2xl">{m.teamOne.emoji}</span>
                    <p className="text-sm font-semibold text-white mt-1">{m.teamOne.name}</p>
                    {innings1?.battingTeam.id === m.teamOne.id && innings1?.score && (
                        <p className="text-brand-gold font-bold text-lg">
                            {innings1.score.runs}/{innings1.score.wickets}
                        </p>
                    )}
                    {innings2?.battingTeam.id === m.teamOne.id && innings2?.score && (
                        <p className="text-brand-gold font-bold text-lg">
                            {innings2.score.runs}/{innings2.score.wickets}
                        </p>
                    )}
                </div>

                <div className="text-center px-3">
                    <span className="text-gray-600 font-display text-xs uppercase tracking-widest">vs</span>
                    <p className={`mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${m.status === 'Ongoing' ? 'bg-green-800 text-green-300' :
                        m.status === 'Finished' ? 'bg-gray-700 text-gray-400' :
                            'bg-yellow-900 text-yellow-400'
                        }`}>{m.status}</p>
                </div>

                <div className="text-center flex-1">
                    <span className="text-2xl">{m.teamTwo.emoji}</span>
                    <p className="text-sm font-semibold text-white mt-1">{m.teamTwo.name}</p>
                    {innings1?.battingTeam.id === m.teamTwo.id && innings1?.score && (
                        <p className="text-brand-gold font-bold text-lg">
                            {innings1.score.runs}/{innings1.score.wickets}
                        </p>
                    )}
                    {innings2?.battingTeam.id === m.teamTwo.id && innings2?.score && (
                        <p className="text-brand-gold font-bold text-lg">
                            {innings2.score.runs}/{innings2.score.wickets}
                        </p>
                    )}
                </div>
            </div>

            {m.result && (
                <p className="text-center text-green-400 text-xs mb-2 font-medium">{m.result}</p>
            )}

            <div className="text-xs text-gray-500 text-center mb-3">
                📍 {m.venue} · {new Date(m.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>

            {/* Action links */}
            <div className="flex gap-2">
                <Link
                    to={`/live/${m.id}`}
                    className="flex-1 text-center py-1.5 rounded-lg text-xs font-semibold bg-brand-greenlt text-white hover:bg-brand-green transition"
                >
                    📺 Live Score
                </Link>
                {m.status !== 'Finished' && (
                    <Link
                        to={`/scoring/${m.id}`}
                        className="flex-1 text-center py-1.5 rounded-lg text-xs font-semibold bg-brand-gold text-gray-900 hover:bg-brand-golddark transition"
                    >
                        🏏 Scorer
                    </Link>
                )}
            </div>
        </div>
    );
}

export default function Home() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMatches()
            .then(r => setMatches(r.data.data))
            .finally(() => setLoading(false));
    }, []);

    const ongoing = matches.filter(m => m.status === 'Ongoing');
    const upcoming = matches.filter(m => m.status === 'Upcoming');
    const finished = matches.filter(m => m.status === 'Finished');

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">All Matches</h2>
                <Link
                    to="/new"
                    className="bg-brand-gold text-gray-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand-golddark transition"
                >
                    + New Match
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {ongoing.length > 0 && (
                        <section className="mb-8">
                            <h3 className="text-green-400 text-xs font-bold uppercase tracking-widest mb-3">🟢 Live</h3>
                            <div className="grid gap-4 sm:grid-cols-2">{ongoing.map(m => <MatchCard key={m.id} m={m} />)}</div>
                        </section>
                    )}
                    {upcoming.length > 0 && (
                        <section className="mb-8">
                            <h3 className="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-3">🟡 Upcoming</h3>
                            <div className="grid gap-4 sm:grid-cols-2">{upcoming.map(m => <MatchCard key={m.id} m={m} />)}</div>
                        </section>
                    )}
                    {finished.length > 0 && (
                        <section>
                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">⚫ Completed</h3>
                            <div className="grid gap-4 sm:grid-cols-2">{finished.map(m => <MatchCard key={m.id} m={m} />)}</div>
                        </section>
                    )}
                    {matches.length === 0 && (
                        <div className="text-center py-20 text-gray-500">
                            <p className="text-5xl mb-4">🏏</p>
                            <p className="text-lg font-semibold">No matches yet</p>
                            <Link to="/new" className="text-brand-gold hover:underline text-sm mt-2 block">
                                Create the first match →
                            </Link>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}