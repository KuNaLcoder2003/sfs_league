import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type {
    Match, Player, BallType, ScoringPhase, LocalScore, Over, Ball,
} from '../types';
import {
    getMatchById, startInnings, startOver, recordBall, completeInnings, endMatch,
} from '../api/client';
import BallInput from '../components/BallInput';
import BallTimeline from '../components/BallTimeLine';
import OverSummary from '../components/OverSummary';
import Scoreboard from '../components/ScoreBoard';


function fmt(o: number) { return String(o); }

export default function Scoring() {
    const { matchId } = useParams<{ matchId: string }>();
    const navigate = useNavigate();

    // ── Match data
    const [match, setMatch] = useState<Match | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ── Innings state
    const [phase, setPhase] = useState<ScoringPhase>('INNINGS_SETUP');
    const [currentInningsIdx, setCurrentInningsIdx] = useState(0);
    const [inningsId, setInningsId] = useState<number | null>(null);
    const [inningsBatTeamId, setInningsBatTeamId] = useState<number | null>(null);
    const [inningsBowTeamId, setInningsBowTeamId] = useState<number | null>(null);

    // ── Over state
    const [overId, setOverId] = useState<number | null>(null);
    const [overNo, setOverNo] = useState(1);
    const [ballsInOver, setBallsInOver] = useState(0); // fair balls
    const [overBalls, setOverBalls] = useState<Ball[]>([]);
    const [allOvers, setAllOvers] = useState<Over[]>([]);

    // ── Batsmen & bowler
    const [striker, setStriker] = useState<Player | null>(null);
    const [nonStriker, setNonStriker] = useState<Player | null>(null);
    const [bowler, setBowler] = useState<Player | null>(null);
    const [dismissed, setDismissed] = useState<number[]>([]);

    // ── Score
    const [score, setScore] = useState<LocalScore>({
        runs: 0, wickets: 0, totalFairBalls: 0, oversDisplay: '0.0',
    });

    // ── Ball input
    const [selRuns, setSelRuns] = useState(0);
    const [selBallType, setSelBallType] = useState<BallType>('FAIR_BALL');
    const [selWicket, setSelWicket] = useState(false);
    const [selBoundary, setSelBoundary] = useState(false);

    // ── Load match
    useEffect(() => {
        if (!matchId) return;
        getMatchById(Number(matchId))
            .then(r => {
                const m: Match = r.data.data;
                setMatch(m);
                // If match already has innings, resume
                if (m.innings.length > 0) {
                    const last = m.innings[m.innings.length - 1];
                    setCurrentInningsIdx(m.innings.length - 1);
                    setInningsId(last.id);
                    setInningsBatTeamId(last.battingTeam.id as unknown as number ?? last.battingTeam.id);
                    setInningsBowTeamId(last.bowlingTeam.id as unknown as number ?? last.bowlingTeam.id);
                    const lastOver = last.overs[last.overs.length - 1];
                    if (lastOver && !lastOver.is_complete) {
                        setOverId(lastOver.id);
                        setOverNo(lastOver.over_no);
                        const fairBalls = lastOver.ball.filter(b => b.ball_type === 'FAIR_BALL' || b.ball_type === 'DEAD_BALL');
                        setBallsInOver(fairBalls.length);
                        setOverBalls(lastOver.ball);
                        const lastBall = lastOver.ball[lastOver.ball.length - 1];
                        if (lastBall) {
                            setStriker(lastBall.batsmen_id_on_strike);
                            setNonStriker(lastBall.batsmen_id_on_non_strike);
                            setBowler(lastOver.bowler);
                        }
                    }
                    setAllOvers(last.overs);
                    if (last.score) {
                        setScore({
                            runs: last.score.runs,
                            wickets: last.score.wickets,
                            totalFairBalls: Math.floor(last.overs_bowled) * 6 + Math.round((last.overs_bowled % 1) * 10),
                            oversDisplay: String(last.overs_bowled),
                        });
                    }
                    setPhase(last.is_complete ? 'INNINGS_COMPLETE' : 'SCORING');
                }
            })
            .catch(() => setError('Failed to load match'))
            .finally(() => setLoading(false));
    }, [matchId]);

    // ─── Derived ────────────────────────────────────────────────────────────────
    const totalOvers = match?.total_overs ?? 8;
    const powerplayOvers = match?.powerplay_overs ?? 2;
    const isPowerplay = overNo <= powerplayOvers;

    const battingTeam = match
        ? (inningsBatTeamId === match.teamOne.id ? match.teamOne : match.teamTwo)
        : null;
    const bowlingTeam = match
        ? (inningsBowTeamId === match.teamOne.id ? match.teamOne : match.teamTwo)
        : null;

    const availableBatsmen = battingTeam?.players.filter(
        p => !dismissed.includes(p.id) && p.id !== striker?.id && p.id !== nonStriker?.id
    ) ?? [];

    const availableBowlers = bowlingTeam?.players ?? [];
    const lastBowlerId = allOvers.length > 0 ? allOvers[allOvers.length - 1]?.bowler?.id : null;

    // ─── Actions ────────────────────────────────────────────────────────────────

    const handleStartInnings = async () => {
        if (!match || !inningsBatTeamId || !inningsBowTeamId) return;
        setSaving(true);
        try {
            const firstInningsScore = currentInningsIdx > 0
                ? (match.innings[0]?.score?.runs ?? 0)
                : 0;
            const r = await startInnings({
                matchId: match.id,
                battingTeamId: inningsBatTeamId,
                bowlingTeamId: inningsBowTeamId,
                inningsNumber: currentInningsIdx + 1,
                target: currentInningsIdx > 0 ? firstInningsScore + 1 : 0,
            });
            setInningsId(r.data.data.id);
            setPhase('OPENERS_SELECT');
        } catch { setError('Failed to start innings'); }
        finally { setSaving(false); }
    };

    const handleStartOver = async (bowlerPlayer: Player) => {
        if (!match || !inningsId) return;
        setSaving(true);
        try {
            const r = await startOver({
                matchId: match.id,
                inningsId,
                bowlerId: bowlerPlayer.id,
                overNo,
            });
            setOverId(r.data.data.id);
            setBowler(bowlerPlayer);
            setBallsInOver(0);
            setOverBalls([]);
            setPhase('SCORING');
        } catch { setError('Failed to start over'); }
        finally { setSaving(false); }
    };

    const handleBallSubmit = async () => {
        if (!match || !inningsId || !overId || !striker || !nonStriker || !bowler) return;
        setSaving(true);
        try {
            const r = await recordBall({
                matchId: match.id,
                inningsId,
                overId,
                overNumber: overNo,
                ballNumberInOver: ballsInOver + 1,
                ballType: selBallType,
                strikerBatsmanId: striker.id,
                nonStrikerBatsmanId: nonStriker.id,
                physicalRuns: selRuns,
                isBoundary: selBoundary,
                isWicket: selWicket,
                powerplayOvers,
            });

            const { calc, score: newScore, totalFairBalls } = r.data.data;

            // Update local score
            setScore({
                runs: newScore.runs,
                wickets: newScore.wickets,
                totalFairBalls,
                oversDisplay: String(newScore.overs),
            });

            // Build ball for timeline
            const ballPill: Ball = {
                id: r.data.data.ball.id,
                ball_number: ballsInOver + 1,
                ball_type: selBallType,
                batsmen_id_on_strike: striker,
                batsmen_id_on_non_strike: nonStriker,
                physical_runs: selRuns,
                scored_runs: calc.scoredRuns,
                runs: calc.netRuns,
                extras: calc.extras,
                is_boundary: selBoundary,
                is_wicket: selWicket,
                is_powerplay: isPowerplay,
                wicket_penalty: calc.wicketPenalty,
            };
            setOverBalls(prev => [...prev, ballPill]);

            // Increment ball counter only for fair balls
            let newBallsInOver = ballsInOver;
            if (selBallType === 'FAIR_BALL') {
                newBallsInOver += 1;
                setBallsInOver(newBallsInOver);
            }

            // Strike rotation on odd runs (fair ball only)
            let currentStriker = striker;
            let currentNonStriker = nonStriker;
            if (selBallType === 'FAIR_BALL' && selRuns % 2 !== 0) {
                [currentStriker, currentNonStriker] = [nonStriker, striker];
                setStriker(currentStriker);
                setNonStriker(currentNonStriker);
            }

            // Reset input
            setSelRuns(0);
            setSelBallType('FAIR_BALL');
            setSelWicket(false);
            setSelBoundary(false);

            // Check wicket → new batter
            if (selWicket) {
                setDismissed(prev => [...prev, striker.id]);
                const totalWickets = newScore.wickets;
                if (totalWickets >= 10) {
                    await handleInningsComplete();
                    return;
                }
                setStriker(null); // will be selected
                setPhase('WICKET_NEW_BATTER');
                return;
            }

            // Check over complete
            if (newBallsInOver >= 6) {
                // End of over: rotate strike
                setStriker(currentNonStriker);
                setNonStriker(currentStriker);

                // Push over to allOvers
                setAllOvers(prev => {
                    const updated = [...prev];
                    const idx = updated.findIndex(o => o.id === overId);
                    if (idx >= 0) {
                        updated[idx] = { ...updated[idx], ball: overBalls, is_complete: true };
                    } else {
                        updated.push({ id: overId, over_no: overNo, bowler, ball: overBalls, total_runs: 0, wickets: 0, extras: 0, is_complete: true });
                    }
                    return updated;
                });

                // Check innings complete (all overs done)
                if (overNo >= totalOvers) {
                    await handleInningsComplete();
                    return;
                }

                setOverNo(prev => prev + 1);
                setBallsInOver(0);
                setOverBalls([]);
                setPhase('OVER_COMPLETE');
                return;
            }

            // Check target chased (2nd innings)
            if (currentInningsIdx === 1 && newScore.runs >= (match.innings[0]?.score?.runs ?? 0) + 1) {
                await handleInningsComplete();
                return;
            }

        } catch (e: unknown) {
            setError('Failed to record ball');
        }
        finally { setSaving(false); }
    };

    const handleInningsComplete = useCallback(async () => {
        if (!inningsId) return;
        await completeInnings(inningsId).catch(() => { });
        setPhase('INNINGS_COMPLETE');
    }, [inningsId]);

    const handleEndMatch = async (winnerId: number, result: string) => {
        if (!match) return;
        setSaving(true);
        try {
            await endMatch(match.id, { winnerId, result });
            setPhase('MATCH_COMPLETE');
            // Refresh
            const r = await getMatchById(match.id);
            setMatch(r.data.data);
        } catch { setError('Failed to end match'); }
        finally { setSaving(false); }
    };


    if (loading) return (
        <div className="flex justify-center items-center min-h-64">
            <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!match) return (
        <div className="text-center text-red-400 py-20">Match not found</div>
    );

    return (
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">

            {/* Live scoreboard (always visible) */}
            <Scoreboard
                match={match}
                innings={currentInningsIdx > 0
                    ? match.innings.slice(0, currentInningsIdx)
                    : []}
                currentInningsIndex={0}
            />

            {error && (
                <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-xl px-4 py-3 text-sm">
                    ⚠️ {error}
                    <button className="ml-2 underline" onClick={() => setError(null)}>dismiss</button>
                </div>
            )}

            {/* ── INNINGS SETUP ─*/}
            {phase === 'INNINGS_SETUP' && (
                <div className="bg-gray-900 rounded-2xl p-5 space-y-4">
                    <h3 className="text-white font-bold text-lg">
                        {currentInningsIdx === 0 ? '1st Innings Setup' : '2nd Innings Setup'}
                    </h3>

                    <div>
                        <p className="text-gray-400 text-sm mb-2">Batting Team</p>
                        <div className="grid grid-cols-2 gap-2">
                            {[match.teamOne, match.teamTwo].map(t => (
                                <button key={t.id}
                                    onClick={() => {
                                        setInningsBatTeamId(t.id);
                                        setInningsBowTeamId(t.id === match.teamOne.id ? match.teamTwo.id : match.teamOne.id);
                                    }}
                                    className={`p-3 rounded-xl text-left transition border ${inningsBatTeamId === t.id
                                        ? 'border-brand-gold bg-brand-gold/10 text-white'
                                        : 'border-gray-700 text-gray-400 hover:border-gray-500'
                                        }`}
                                >
                                    <span className="text-xl">{t.emoji}</span>
                                    <p className="text-sm font-semibold mt-1">{t.name}</p>
                                    {currentInningsIdx === 0 && match.tossTeam.id === t.id && (
                                        <p className="text-xs text-brand-gold mt-0.5">
                                            Toss winner · chose to {match.tossDecision}
                                        </p>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        disabled={!inningsBatTeamId || saving}
                        onClick={handleStartInnings}
                        className="w-full bg-brand-gold text-gray-900 font-bold py-3 rounded-xl hover:bg-brand-golddark transition disabled:opacity-40"
                    >
                        {saving ? 'Starting…' : 'Start Innings →'}
                    </button>
                </div>
            )}

            {/* ── OPENERS SELECT ────────────────────────────────────────────────── */}
            {phase === 'OPENERS_SELECT' && battingTeam && (
                <div className="bg-gray-900 rounded-2xl p-5 space-y-4">
                    <h3 className="text-white font-bold text-lg">Select Opening Batsmen</h3>

                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                            {striker ? `✅ Striker: ${striker.name}` : 'Click to set Striker (faces first)'}
                        </p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                            {nonStriker ? `✅ Non-Striker: ${nonStriker.name}` : 'Click again to set Non-Striker'}
                        </p>
                        <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
                            {battingTeam.players.map(p => {
                                const isStriker = striker?.id === p.id;
                                const isNonStriker = nonStriker?.id === p.id;
                                return (
                                    <button key={p.id}
                                        onClick={() => {
                                            if (!striker || (striker && nonStriker)) {
                                                setStriker(p);
                                                setNonStriker(null);
                                            } else if (striker.id !== p.id) {
                                                setNonStriker(p);
                                            }
                                        }}
                                        className={`p-3 rounded-xl text-left border transition ${isStriker ? 'border-brand-gold bg-brand-gold/10 text-white' :
                                            isNonStriker ? 'border-blue-500 bg-blue-900/20 text-white' :
                                                'border-gray-700 text-gray-400 hover:border-gray-500'
                                            }`}
                                    >
                                        <p className="text-sm font-semibold">{p.name}</p>
                                        <p className="text-xs text-gray-500">Age {p.age}</p>
                                        {isStriker && <span className="text-xs text-brand-gold">🏏 Striker</span>}
                                        {isNonStriker && <span className="text-xs text-blue-400">▶ Non-Striker</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        disabled={!striker || !nonStriker}
                        onClick={() => setPhase('BOWLER_SELECT')}
                        className="w-full bg-brand-gold text-gray-900 font-bold py-3 rounded-xl disabled:opacity-40"
                    >
                        Select Bowler →
                    </button>
                </div>
            )}

            {/* ── BOWLER SELECT ────*/}
            {(phase === 'BOWLER_SELECT' || phase === 'OVER_COMPLETE') && bowlingTeam && (
                <div className="bg-gray-900 rounded-2xl p-5 space-y-4">
                    <h3 className="text-white font-bold text-lg">
                        {phase === 'OVER_COMPLETE'
                            ? `Over ${overNo - 1} Complete — Select Bowler for Over ${overNo}`
                            : `Select Bowler — Over ${overNo}`}
                    </h3>

                    {phase === 'OVER_COMPLETE' && overBalls.length > 0 && (
                        <div className="bg-gray-800 rounded-xl p-3 text-sm">
                            <p className="text-gray-400 mb-1 text-xs">Over {overNo - 1} summary</p>
                            <div className="flex flex-wrap gap-1.5">
                                {overBalls.map((b, i) => (
                                    <span key={i} className={`px-2 py-0.5 rounded text-xs font-bold ${b.is_wicket ? 'bg-red-600 text-white' : 'bg-gray-700 text-white'
                                        }`}>
                                        {b.is_wicket ? 'W' : b.ball_type === 'WIDE' ? 'Wd' : b.ball_type === 'NO_BALL' ? 'Nb' : b.physical_runs === 0 ? '•' : b.physical_runs}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
                        {availableBowlers.map(p => (
                            <button key={p.id}
                                onClick={() => handleStartOver(p)}
                                disabled={p.id === lastBowlerId || saving}
                                className={`p-3 rounded-xl text-left border transition ${p.id === lastBowlerId
                                    ? 'border-gray-800 text-gray-600 cursor-not-allowed'
                                    : 'border-gray-700 text-gray-400 hover:border-brand-gold hover:text-white'
                                    }`}
                            >
                                <p className="text-sm font-semibold">{p.name}</p>
                                {p.id === lastBowlerId && <p className="text-xs text-gray-600">Bowled last over</p>}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── SCORING ─────*/}
            {phase === 'SCORING' && striker && nonStriker && bowler && (
                <>
                    {/* Current batsmen / bowler strip */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-gray-900 rounded-xl p-3">
                            <p className="text-xs text-brand-gold uppercase tracking-wider mb-1">🏏 Striker</p>
                            <p className="text-white font-semibold text-sm">{striker.name}</p>
                        </div>
                        <div className="bg-gray-900 rounded-xl p-3">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">▶ Non-Striker</p>
                            <p className="text-white font-semibold text-sm">{nonStriker.name}</p>
                        </div>
                        <div className="bg-gray-900 rounded-xl p-3">
                            <p className="text-xs text-blue-400 uppercase tracking-wider mb-1">⚾ Bowler</p>
                            <p className="text-white font-semibold text-sm">{bowler.name}</p>
                        </div>
                    </div>

                    {/* Score */}
                    <div className="bg-brand-green rounded-2xl p-4 text-center">
                        <p className="text-green-300 text-sm mb-1">{battingTeam?.emoji} {battingTeam?.name}</p>
                        <p className="text-white font-display text-5xl font-bold">
                            {score.runs}<span className="text-3xl text-green-300">/{score.wickets}</span>
                        </p>
                        <p className="text-green-400 text-lg mt-1">
                            {score.oversDisplay} / {totalOvers} overs
                        </p>
                        {isPowerplay && (
                            <span className="mt-2 inline-block bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-0.5 rounded-full">
                                ⚡ POWER PLAY — Runs ×2
                            </span>
                        )}
                    </div>

                    {/* Ball timeline */}
                    <BallTimeline balls={overBalls} overNo={overNo} />

                    {/* Ball input */}
                    <BallInput
                        ballType={selBallType}
                        selectedRuns={selRuns}
                        isWicket={selWicket}
                        isBoundary={selBoundary}
                        isPowerplay={isPowerplay}
                        onBallType={setSelBallType}
                        onRuns={setSelRuns}
                        onWicket={setSelWicket}
                        onBoundary={setSelBoundary}
                        onSubmit={handleBallSubmit}
                        disabled={saving}
                        overNumber={overNo}
                        ballsInOver={ballsInOver}
                    />

                    {/* Over history */}
                    {allOvers.length > 0 && (
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Over History</p>
                            <OverSummary overs={allOvers} />
                        </div>
                    )}
                </>
            )}

            {/* ── WICKET: NEW BATTER ──── */}
            {phase === 'WICKET_NEW_BATTER' && battingTeam && (
                <div className="bg-gray-900 rounded-2xl p-5 space-y-4">
                    <div className="text-center">
                        <span className="text-4xl">🔴</span>
                        <h3 className="text-white font-bold text-lg mt-2">Wicket!</h3>
                        <p className="text-gray-400 text-sm">
                            {isPowerplay && '−2 run penalty applied. '}
                            Select new batsman
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                        {availableBatsmen.map(p => (
                            <button key={p.id}
                                onClick={() => {
                                    setStriker(p);
                                    setPhase('SCORING');
                                }}
                                className="p-3 rounded-xl text-left border border-gray-700 text-gray-400 hover:border-brand-gold hover:text-white transition"
                            >
                                <p className="text-sm font-semibold">{p.name}</p>
                                <p className="text-xs text-gray-500">Age {p.age}</p>
                            </button>
                        ))}
                    </div>
                    {availableBatsmen.length === 0 && (
                        <p className="text-center text-red-400 text-sm">All batsmen dismissed — innings over!</p>
                    )}
                </div>
            )}

            {/* ── INNINGS COMPLETE ─*/}
            {phase === 'INNINGS_COMPLETE' && (
                <div className="bg-gray-900 rounded-2xl p-6 text-center space-y-4">
                    <span className="text-5xl">🏁</span>
                    <h3 className="text-white font-bold text-xl">Innings Complete</h3>
                    <div className="bg-brand-green rounded-xl p-4">
                        <p className="text-green-300 text-sm">{battingTeam?.emoji} {battingTeam?.name}</p>
                        <p className="text-white font-display text-4xl font-bold">
                            {score.runs}/{score.wickets}
                        </p>
                        <p className="text-green-400">({score.oversDisplay} overs)</p>
                    </div>

                    {currentInningsIdx === 0 ? (
                        <button
                            onClick={() => {
                                setCurrentInningsIdx(1);
                                setInningsBatTeamId(inningsBowTeamId);
                                setInningsBowTeamId(inningsBatTeamId);
                                setStriker(null);
                                setNonStriker(null);
                                setBowler(null);
                                setDismissed([]);
                                setOverNo(1);
                                setBallsInOver(0);
                                setOverBalls([]);
                                setAllOvers([]);
                                setScore({ runs: 0, wickets: 0, totalFairBalls: 0, oversDisplay: '0.0' });
                                setPhase('INNINGS_SETUP');
                            }}
                            className="w-full bg-brand-gold text-gray-900 font-bold py-3 rounded-xl"
                        >
                            Start 2nd Innings →
                        </button>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-gray-400 text-sm">Determine match result</p>
                            {match && match.innings[0] && (
                                <>
                                    {score.runs >= (match.innings[0].score?.runs ?? 0) + 1 ? (
                                        <button
                                            onClick={() => handleEndMatch(
                                                inningsBatTeamId ?? 0,
                                                `${battingTeam?.name} won by ${10 - score.wickets} wickets`
                                            )}
                                            className="w-full bg-green-600 text-white font-bold py-3 rounded-xl"
                                        >
                                            🏆 {battingTeam?.name} wins!
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleEndMatch(
                                                inningsBowTeamId ?? 0,
                                                `${bowlingTeam?.name} won by ${(match.innings[0].score?.runs ?? 0) - score.runs} runs`
                                            )}
                                            className="w-full bg-green-600 text-white font-bold py-3 rounded-xl"
                                        >
                                            🏆 {bowlingTeam?.name} wins!
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ── MATCH COMPLETE ────*/}
            {phase === 'MATCH_COMPLETE' && match?.winner && (
                <div className="bg-brand-greendark rounded-2xl p-8 text-center space-y-3">
                    <span className="text-6xl">🏆</span>
                    <h3 className="text-brand-gold font-display font-bold text-2xl">
                        {match.winner.emoji} {match.winner.name}
                    </h3>
                    <p className="text-green-300">{match.result}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 bg-brand-gold text-gray-900 font-bold px-6 py-2.5 rounded-xl"
                    >
                        Back to Matches
                    </button>
                </div>
            )}
        </div>
    );
}