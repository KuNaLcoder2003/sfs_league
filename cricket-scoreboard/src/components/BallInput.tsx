import type { BallType } from '../types';

interface Props {
    ballType: BallType;
    selectedRuns: number;
    isWicket: boolean;
    isBoundary: boolean;
    isPowerplay: boolean;
    onBallType: (t: BallType) => void;
    onRuns: (r: number) => void;
    onWicket: (w: boolean) => void;
    onBoundary: (b: boolean) => void;
    onSubmit: () => void;
    disabled?: boolean;
    overNumber: number;
    ballsInOver: number;  // 0-5 fair balls so far
}

const RUN_OPTIONS = [0, 1, 2, 3, 4, 5, 6];

export default function BallInput({
    ballType, selectedRuns, isWicket, isBoundary, isPowerplay,
    onBallType, onRuns, onWicket, onBoundary, onSubmit,
    disabled = false, overNumber, ballsInOver,
}: Props) {

    const isExtra = ballType === 'WIDE' || ballType === 'NO_BALL';

    // Calculate preview of scored runs
    const scoredRuns = ballType === 'FAIR_BALL'
        ? (isPowerplay ? selectedRuns * 2 : selectedRuns)
        : ballType === 'NO_BALL'
            ? 1 + selectedRuns
            : ballType === 'WIDE'
                ? 1 + selectedRuns
                : 0;
    const penalty = isWicket && isPowerplay && ballType === 'FAIR_BALL' ? 2 : 0;
    const netPreview = scoredRuns - penalty;

    return (
        <div className="bg-gray-900 rounded-2xl p-4 space-y-4">

            {/* Powerplay banner */}
            {isPowerplay && (
                <div className="flex items-center gap-2 bg-yellow-900/40 border border-yellow-600 rounded-xl px-3 py-2">
                    <span className="text-yellow-400 text-lg">⚡</span>
                    <div>
                        <p className="text-yellow-300 text-xs font-bold uppercase tracking-wider">
                            Power Play – Over {overNumber}
                        </p>
                        <p className="text-yellow-500 text-xs">
                            Batting runs doubled · Wicket = −2 run penalty
                        </p>
                    </div>
                </div>
            )}

            {/* Ball type selector */}
            <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Ball Type</p>
                <div className="grid grid-cols-4 gap-2">
                    {(['FAIR_BALL', 'WIDE', 'NO_BALL', 'DEAD_BALL'] as BallType[]).map((bt) => (
                        <button
                            key={bt}
                            disabled={disabled}
                            onClick={() => onBallType(bt)}
                            className={`py-2 rounded-lg text-xs font-bold transition ${ballType === bt
                                    ? 'bg-brand-gold text-gray-900'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            {bt === 'FAIR_BALL' ? 'Fair' : bt === 'WIDE' ? 'Wide' : bt === 'NO_BALL' ? 'No Ball' : 'Dead'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Runs selector */}
            <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                    Runs {isExtra ? '(off extras)' : 'Scored'}
                </p>
                <div className="grid grid-cols-7 gap-1.5">
                    {RUN_OPTIONS.map((r) => (
                        <button
                            key={r}
                            disabled={disabled || ballType === 'DEAD_BALL'}
                            onClick={() => {
                                onRuns(r);
                                if (r === 4 || r === 6) onBoundary(true);
                                else onBoundary(false);
                            }}
                            className={`aspect-square rounded-xl font-bold text-lg transition ${selectedRuns === r
                                    ? r === 6 ? 'bg-purple-600 text-white' :
                                        r === 4 ? 'bg-blue-500 text-white' :
                                            r === 0 ? 'bg-gray-600 text-white' :
                                                'bg-brand-gold text-gray-900'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                } disabled:opacity-40`}
                        >
                            {r === 0 ? '•' : r}
                        </button>
                    ))}
                </div>
            </div>

            {/* Toggles */}
            <div className="flex gap-3">
                <button
                    disabled={disabled || ballType === 'WIDE' || ballType === 'DEAD_BALL'}
                    onClick={() => onWicket(!isWicket)}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition ${isWicket
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        } disabled:opacity-40`}
                >
                    {isWicket ? '🔴 WICKET' : '⚪ Wicket'}
                </button>
                <button
                    disabled={disabled || ballType === 'DEAD_BALL' || ballType === 'WIDE'}
                    onClick={() => onBoundary(!isBoundary)}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition ${isBoundary
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        } disabled:opacity-40`}
                >
                    {isBoundary ? '🔵 Boundary' : '⬜ Boundary'}
                </button>
            </div>

            {/* Preview + Submit */}
            <div className="border-t border-gray-800 pt-3 flex items-center gap-3">
                <div className="flex-1 bg-gray-800 rounded-xl px-3 py-2 text-sm">
                    <span className="text-gray-500">Net runs: </span>
                    <span className={`font-bold text-lg ${netPreview > 0 ? 'text-brand-gold' : netPreview < 0 ? 'text-red-400' : 'text-gray-400'
                        }`}>
                        {netPreview > 0 ? '+' : ''}{netPreview}
                    </span>
                    {isWicket && (
                        <span className="ml-2 text-red-400 text-xs">+ W</span>
                    )}
                    {isPowerplay && penalty > 0 && (
                        <span className="ml-1 text-red-400 text-xs">(−2 penalty)</span>
                    )}
                </div>
                <button
                    onClick={onSubmit}
                    disabled={disabled}
                    className="bg-brand-gold hover:bg-brand-golddark text-gray-900 font-bold px-6 py-2.5 rounded-xl transition disabled:opacity-40 active:scale-95"
                >
                    Record Ball {ballsInOver + 1}/6
                </button>
            </div>
        </div>
    );
}