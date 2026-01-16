import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Coffee, Users, Bell, Search, Menu } from 'lucide-react';

export default function AppLayout({ children }) {
    const { pathname } = useLocation();

    const isActive = (path) => pathname === path;

    return (
        <div className="flex min-h-screen bg-gray-100 font-sans text-gray-800">
            {/* Sidebar - Inspired by the dark sidebar in the template */}
            <aside className="w-64 bg-espresso-900 text-espresso-100 flex flex-col shadow-2xl z-10">
                <div className="p-6 flex items-center gap-3 border-b border-white/10">
                    <div className="p-2 bg-white/10 rounded-lg">
                        <Coffee className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-wide text-white">SHIFTFLOW</span>
                </div>

                <nav className="flex-1 py-6 space-y-2 px-3">
                    <p className="px-3 text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Operations</p>
                    <NavItem to="/" icon={<Coffee size={20} />} label="Daily Opening" active={isActive('/')} />
                    <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Barista Dashboard" active={isActive('/dashboard')} />
                    <NavItem to="/core" icon={<Users size={20} />} label="Core Portal" active={isActive('/core')} />
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition cursor-pointer">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                            alt="User"
                            className="w-8 h-8 rounded-full bg-espresso-100"
                        />
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">Stanislav Kirilov</p>
                            <p className="text-xs text-white/50 truncate">Head Barista</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">

                {/* Header - Inspired by the clean white header with search */}
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm">
                    <div className="flex items-center gap-4 w-96">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search tasks, items, or staff..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-espresso-900/20 focus:bg-white transition"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 relative text-gray-400 hover:text-espresso-900 transition">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        <div className="h-8 w-px bg-gray-200 mx-2"></div>
                        <span className="text-sm font-medium text-espresso-900">Mbezi Beach Branch</span>
                    </div>
                </header>

                {/* Scrollable Content Area */}
                <main className="flex-1 overflow-auto p-8">
                    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

function NavItem({ to, icon, label, active }) {
    return (
        <Link
            to={to}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative
        ${active
                    ? 'bg-espresso-100 text-espresso-900 font-semibold shadow-md'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
        >
            {/* Accent Line for active state (inspired by template's green line, using espresso-900 here or just the full bg) */}
            {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-espresso-900 rounded-r-full"></div>}

            <span className={active ? 'text-espresso-900' : 'text-gray-400 group-hover:text-white'}>
                {icon}
            </span>
            <span>{label}</span>
        </Link>
    );
}
