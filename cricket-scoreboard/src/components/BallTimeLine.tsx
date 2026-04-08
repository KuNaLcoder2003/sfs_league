import type { Ball, BallType } from '../types';

interface Props {
    balls: Ball[];
    overNo: number;
}

function ballLabel(b: Ball): string {
    if (b.is_wicket) return 'W';
    if (b.ball_type === 'WIDE') return 'Wd';
    if (b.ball_type === 'NO_BALL') return `NB${b.physical_runs > 0 ? `+${b.physical_runs}` : ''}`;
    if (b.ball_type === 'DEAD_BALL') return 'Db';
    if (b.physical_runs === 0) return '•';
    if (b.is_boundary && b.physical_runs === 6) return '6';
    if (b.is_boundary && b.physical_runs === 4) return '4';
    return String(b.physical_runs);
}

function ballColor(b: Ball): string {
    if (b.is_wicket) return 'bg-red-600 text-white';
    if (b.ball_type === 'WIDE') return 'bg-yellow-600 text-white';
    if (b.ball_type === 'NO_BALL') return 'bg-orange-500 text-white';
    if (b.is_boundary && b.physical_runs === 6) return 'bg-purple-600 text-white';
    if (b.is_boundary && b.physical_runs === 4) return 'bg-blue-500 text-white';
    if (b.physical_runs === 0) return 'bg-gray-700 text-gray-300';
    return 'bg-brand-greenlt text-white';
}

export default function BallTimeline({ balls, overNo }: Props) {
    return (
        <div className="bg-gray-900 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-widest">
                Over {overNo}
            </p>
            <div className="flex flex-wrap gap-2">
                {balls.length === 0 && (
                    <span className="text-gray-600 text-sm italic">No balls yet</span>
                )}
                {balls.map((b, i) => (
                    <div key={b.id ?? i} className="relative">
                        <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow ${ballColor(b)}`}
                        >
                            {ballLabel(b)}
                        </div>
                        {b.is_powerplay && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-gray-900" title="Power Play" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}