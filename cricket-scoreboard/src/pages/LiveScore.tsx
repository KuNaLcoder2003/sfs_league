import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLiveScore } from '../api/client';
import { useSocket } from '../hooks/useSocket';
import type { Match, Ball } from '../types';
import BallTimeline from '../components/BallTimeLine';
import OverSummary from '../components/OverSummary';

// Poll every 10 seconds
const POLL_MS = 10_000;

export default function LiveScore() {
    const { matchId } = useParams<{ matchId: string }>();
    const [match, setMatch] = useState<Match | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastBall, setLastBall] = useState<Ball | null>(null);
    const [flash, setFlash] = useState(false);

    const fetchData = useCallback(() => {
        if (!matchId) return;
        getLiveScore(Number(matchId))
            .then(r => setMatch(r.data.data))
            .finally(() => setLoading(false));
    }, [matchId]);

    useEffect(() => {
        fetchData();
        const iv = setInterval(fetchData, POLL_MS);
        return () => clearInterval(iv);
    }, [fetchData]);

    // Real-time socket updates
    useSocket(matchId ? Number(matchId) : null, {
        ball_recorded: (data: unknown) => {
            const d = data as { ball: Ball };
            setLastBall(d.ball);
            setFlash(true);
            setTimeout(() => setFlash(false), 800);
            fetchData(); // refresh full state after each ball
        },
        innings_started: fetchData,
        innings_complete: fetchData,
        match_ended: fetchData,
    });

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-gray-950">
            <div className="w-10 h-10 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!match) return (
        <div className="text-center text-red-400 py-20">Match not found</div>
    );

    const innings1 = match.innings[0];
    const innings2 = match.innings[1];
    const current = innings2 ?? innings1;
    const score = current?.score;
    const totalOvers = match.total_overs;
    const pp = match.powerplay_overs;
    const curOver = current?.overs?.find(o => !o.is_complete) ?? current?.overs?.[current.overs.length - 1];
    const isPP = curOver ? curOver.over_no <= pp : false;

    const runsNeeded = innings2 && innings1
        ? (innings1.score?.runs ?? 0) + 1 - (innings2.score?.runs ?? 0)
        : null;
    const ballsLeft = current
        ? totalOvers * 6 - (Math.floor(current.overs_bowled) * 6 + Math.round((current.overs_bowled % 1) * 10))
        : null;

    return (
        <div className="min-h-screen bg-gray-950">
            {/* Top brand strip */}
            <div className="bg-brand-green py-2 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🏏</span>
                    <div>
                        <p className="text-brand-gold font-bold text-sm">SFS Cricket League</p>
                        <p className="text-green-300 text-xs">SCL Juniors 2026 · LIVE</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-green-300 text-xs font-medium">LIVE</span>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-3 py-4 space-y-4">

                {/* Giant score panel */}
                <div className={`bg-brand-green rounded-2xl overflow-hidden shadow-2xl transition ${flash ? 'ring-2 ring-brand-gold' : ''}`}>
                    <div className="bg-brand-greendark px-4 py-2 flex justify-between text-xs">
                        <span className="text-green-400">📍 {match.venue}</span>
                        <span className={`font-bold ${match.status === 'Ongoing' ? 'text-green-400' : 'text-gray-400'}`}>
                            {match.status.toUpperCase()}
                        </span>
                    </div>

                    <div className="p-5">
                        {current && score ? (
                            <>
                                <p className="text-green-300 text-sm font-medium mb-1">
                                    {current.battingTeam.emoji} {current.battingTeam.name} batting
                                </p>
                                <div className="flex items-end justify-between">
                                    <p className={`font-display text-6xl font-bold text-white transition ${flash ? 'animate-score-pop' : ''}`}>
                                        {score.runs}
                                        <span className="text-4xl text-green-300">/{score.wickets}</span>
                                    </p>
                                    <div className="text-right">
                                        <p className="text-green-400 text-xs mb-0.5">Overs</p>
                                        <p className="text-white text-3xl font-bold">{score.overs}</p>
                                        <p className="text-green-500 text-xs">/ {totalOvers}</p>
                                    </div>
                                </div>

                                {isPP && (
                                    <div className="mt-3 flex items-center gap-2 bg-yellow-900/30 border border-yellow-700 rounded-xl px-3 py-2">
                                        <span className="text-yellow-400 text-lg">⚡</span>
                                        <div>
                                            <p className="text-yellow-300 text-xs font-bold">POWER PLAY</p>
                                            <p className="text-yellow-600 text-xs">Runs doubled · Wicket = −2 penalty</p>
                                        </div>
                                    </div>
                                )}

                                {runsNeeded !== null && ballsLeft !== null && (
                                    <div className="mt-3 bg-brand-greendark rounded-xl px-3 py-2 text-sm flex justify-between">
                                        <span className="text-green-300">
                                            Target <strong className="text-white">{current.target}</strong>
                                        </span>
                                        <span className="text-green-300">
                                            Need <strong className="text-brand-gold">{runsNeeded}</strong>{' '}
                                            off <strong className="text-white">{ballsLeft}</strong> balls
                                        </span>
                                    </div>
                                )}

                                {/* Previous innings */}
                                {innings1 && innings2 && (
                                    <div className="mt-3 border-t border-brand-greenlt pt-3 text-sm text-green-400">
                                        {innings1.battingTeam.emoji} {innings1.battingTeam.name}:{' '}
                                        <strong className="text-white">
                                            {innings1.score?.runs}/{innings1.score?.wickets}
                                        </strong>{' '}
                                        ({innings1.score?.overs})
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="py-4 text-center text-green-400">Waiting for innings…</div>
                        )}
                    </div>
                </div>

                {/* Match result */}
                {match.status === 'Finished' && match.result && (
                    <div className="bg-brand-gold rounded-2xl p-4 text-center">
                        <p className="text-gray-900 font-bold text-lg">🏆 {match.result}</p>
                    </div>
                )}

                {/* Current batsmen */}
                {curOver && current && (
                    <>
                        {(() => {
                            const lastBallInOver = curOver.ball?.[curOver.ball.length - 1];
                            if (!lastBallInOver) return null;
                            return (
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="bg-gray-900 rounded-xl p-3">
                                        <p className="text-brand-gold text-xs uppercase tracking-wider mb-1">🏏 Striker</p>
                                        <p className="text-white font-semibold">{lastBallInOver.batsmen_id_on_strike.name}</p>
                                    </div>
                                    <div className="bg-gray-900 rounded-xl p-3">
                                        <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">▶ Non-Striker</p>
                                        <p className="text-white font-semibold">{lastBallInOver.batsmen_id_on_non_strike.name}</p>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Current over balls */}
                        <BallTimeline balls={curOver.ball} overNo={curOver.over_no} />
                    </>
                )}

                {/* Over history */}
                {current && current.overs.length > 0 && (
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Over History</p>
                        <OverSummary overs={current.overs} />
                    </div>
                )}

                {/* Match info footer */}
                <div className="text-center text-xs text-gray-600 pb-4 space-y-1">
                    <p>{match.teamOne.emoji} {match.teamOne.name} vs {match.teamTwo.emoji} {match.teamTwo.name}</p>
                    <p>Toss: {match.tossTeam.name} · {match.tossDecision}</p>
                    <p>{match.match_type.toUpperCase()} · {totalOvers} overs · Powerplay: {pp} overs</p>
                </div>
            </div>
        </div>
    );
}