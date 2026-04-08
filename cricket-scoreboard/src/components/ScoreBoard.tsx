import type { Innings, Match } from '../types';

interface Props {
    match: Match;
    innings: Innings[];
    currentInningsIndex: number;
}

function oversStr(n: number): string {
    return String(n);
}

export default function Scoreboard({ match, innings, currentInningsIndex }: Props) {
    const current = innings[currentInningsIndex];
    const previous = innings[currentInningsIndex - 1];
    const score = current?.score;
    const isPP = current
        ? Math.floor((score?.overs ?? 0)) < match.powerplay_overs
        : false;

    const runsNeeded = previous && current
        ? (previous.score?.runs ?? previous.runs_scored) + 1 - (score?.runs ?? 0)
        : null;

    const ballsLeft = current
        ? match.total_overs * 6 - (current.overs_bowled
            ? Math.floor(current.overs_bowled) * 6 + (current.overs_bowled % 1) * 10
            : 0)
        : null;

    return (
        <div className="bg-brand-green rounded-2xl overflow-hidden shadow-2xl border border-brand-greenlt">

            {/* Header bar */}
            <div className="bg-brand-greendark px-4 py-2 flex items-center justify-between">
                <span className="text-brand-gold font-display text-sm font-bold">
                    {match.venue}
                </span>
                <div className="flex items-center gap-2">
                    {isPP && (
                        <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                            ⚡ POWER PLAY
                        </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${match.status === 'Ongoing' ? 'bg-green-500 text-white' :
                        match.status === 'Finished' ? 'bg-gray-500 text-white' :
                            'bg-yellow-500 text-gray-900'
                        }`}>
                        {match.status}
                    </span>
                </div>
            </div>

            {/* Main score */}
            {current && score ? (
                <div className="p-5">
                    <div className="flex items-end justify-between mb-1">
                        <div>
                            <p className="text-green-300 text-sm font-medium">
                                {current.battingTeam.emoji} {current.battingTeam.name}
                            </p>
                            <p className="text-white font-display text-5xl font-bold tracking-tight">
                                {score.runs}
                                <span className="text-3xl text-green-300">/{score.wickets}</span>
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-green-400 text-sm">Overs</p>
                            <p className="text-white text-3xl font-bold">
                                {oversStr(score.overs)}
                                <span className="text-green-400 text-lg"> / {match.total_overs}</span>
                            </p>
                        </div>
                    </div>

                    {/* Target / Run rate */}
                    {runsNeeded !== null && ballsLeft !== null && (
                        <div className="mt-3 bg-brand-greendark rounded-xl p-3 flex justify-between text-sm">
                            <span className="text-green-300">
                                Target: <strong className="text-white">{current.target}</strong>
                            </span>
                            <span className="text-green-300">
                                Need: <strong className="text-brand-gold">{runsNeeded}</strong> off{' '}
                                <strong className="text-white">{ballsLeft}</strong> balls
                            </span>
                        </div>
                    )}

                    {/* Previous innings summary */}
                    {previous && (
                        <div className="mt-3 border-t border-brand-greenlt pt-3 text-sm text-green-400">
                            {previous.battingTeam.emoji} {previous.battingTeam.name}:{' '}
                            <strong className="text-white">
                                {previous.score?.runs ?? previous.runs_scored}/{previous.score?.wickets ?? previous.wickets}
                            </strong>{' '}
                            ({oversStr(previous.score?.overs ?? previous.overs_bowled)})
                        </div>
                    )}
                </div>
            ) : (
                <div className="p-6 text-center text-green-400">
                    Waiting for innings to begin…
                </div>
            )}
        </div>
    );
}