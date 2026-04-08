import type { Over } from '../types';

interface Props { overs: Over[] }

export default function OverSummary({ overs }: Props) {
    if (!overs.length) return null;
    return (
        <div className="bg-gray-900 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                        <th className="px-3 py-2 text-left">Over</th>
                        <th className="px-3 py-2 text-left">Bowler</th>
                        <th className="px-3 py-2 text-center">Runs</th>
                        <th className="px-3 py-2 text-center">Wkts</th>
                        <th className="px-3 py-2 text-center">Extras</th>
                    </tr>
                </thead>
                <tbody>
                    {overs.map((ov) => (
                        <tr key={ov.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                            <td className="px-3 py-2 text-gray-400">{ov.over_no}</td>
                            <td className="px-3 py-2 font-medium text-white">{ov.bowler.name}</td>
                            <td className="px-3 py-2 text-center text-brand-gold font-bold">{ov.total_runs}</td>
                            <td className="px-3 py-2 text-center text-red-400">{ov.wickets}</td>
                            <td className="px-3 py-2 text-center text-yellow-400">{ov.extras}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}