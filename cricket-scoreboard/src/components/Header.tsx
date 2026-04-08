import { Link, useLocation } from 'react-router-dom';

export default function Header() {
    const { pathname } = useLocation();

    const nav = [
        { to: '/', label: 'Matches' },
        { to: '/new', label: '+ New Match' },
    ];

    return (
        <header className="bg-brand-green border-b border-brand-greenlt sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

                {/* Brand */}
                <Link to="/" className="flex items-center gap-3 group">
                    <span className="text-3xl select-none">🏏</span>
                    <div className="leading-tight">
                        <p className="text-brand-gold font-display font-bold text-lg tracking-wide group-hover:text-yellow-300 transition">
                            SFS Cricket League
                        </p>
                        <p className="text-green-300 text-xs tracking-wider">SCL Juniors 2026</p>
                    </div>
                </Link>

                {/* Nav */}
                <nav className="flex items-center gap-1">
                    {nav.map(({ to, label }) => (
                        <Link
                            key={to}
                            to={to}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${pathname === to
                                    ? 'bg-brand-gold text-brand-greendark'
                                    : 'text-green-200 hover:bg-brand-greenlt hover:text-white'
                                }`}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
}