import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, CheckCircle2, Send, MapPin, ListTodo, AlertTriangle, Calendar, ClipboardList, MessageSquare, ArrowRight, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CorePage() {
    const { user } = useAuth();
    const [locations, setLocations] = useState([]);
    const [loadingLocations, setLoadingLocations] = useState(true);



    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            const { data, error } = await supabase.from('locations').select('*').order('name');
            if (error) throw error;
            setLocations(data || []);
        } catch (err) {
            console.error('Error fetching locations:', err);
        } finally {
            setLoadingLocations(false);
        }
    };



    const [wastageFeed, setWastageFeed] = useState([]);
    const [maintenanceTickets, setMaintenanceTickets] = useState([]);
    const [loadingAudit, setLoadingAudit] = useState(true);
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchAuditData();
    }, [filterDate]);

    const fetchAuditData = async () => {
        setLoadingAudit(true);
        try {
            const startOfDay = `${filterDate}T00:00:00.000Z`;
            const endOfDay = `${filterDate}T23:59:59.999Z`;

            // Fetch live wastage (joining with shifts and locations)
            const { data: wastage, error: wError } = await supabase
                .from('wastage_logs')
                .select(`
                    id, item_type, quantity, reason, logged_at,
                    shifts (
                        locations (name)
                    )
                `)
                .gte('logged_at', startOfDay)
                .lte('logged_at', endOfDay)
                .order('logged_at', { ascending: false });

            if (wError) throw wError;
            setWastageFeed(wastage || []);

            // Fetch maintenance tickets
            const { data: maintenance, error: mError } = await supabase
                .from('maintenance_tickets')
                .select(`
                    *,
                    locations (name)
                `)
                .gte('created_at', startOfDay)
                .lte('created_at', endOfDay)
                .order('created_at', { ascending: false });

            if (mError) throw mError;
            setMaintenanceTickets(maintenance || []);

        } catch (err) {
            console.error('Error fetching audit data:', err);
        } finally {
            setLoadingAudit(false);
        }
    };

    const [activeAuditTab, setActiveAuditTab] = useState('wastage');

    const getTimeAgo = (dateString) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffInMs = now - past;
        const diffInMins = Math.floor(diffInMs / (1000 * 60));

        if (diffInMins < 1) return 'JUST NOW';
        if (diffInMins < 60) return `${diffInMins} MIN AGO`;
        const diffInHours = Math.floor(diffInMins / 60);
        if (diffInHours < 24) return `${diffInHours} HR AGO`;
        return past.toLocaleDateString();
    };

    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-enzi-text">Core Portal</h1>
                <p className="text-sm text-enzi-muted italic">Overview & Strategic Management</p>
            </header>

            <div className="grid gap-6 md:grid-cols-3 mb-8">
                {/* Navigation Card: Communications Hub */}
                <Link to="/core/communications" className="card-panel p-6 flex flex-col items-start gap-4 hover:border-enzi-gold transition group bg-gradient-to-br from-enzi-card to-enzi-card/50">
                    <div className="p-3 bg-enzi-black rounded-xl border border-enzi-muted/20 group-hover:border-enzi-gold/50 transition">
                        <MessageSquare className="text-enzi-gold" size={28} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-enzi-text mb-1">Communications Hub</h2>
                        <p className="text-sm text-enzi-muted">Manage Shift Briefings & Operational Task Checklists</p>
                    </div>
                    <div className="mt-auto pt-2 text-xs font-bold text-enzi-gold uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                        Open Hub <ArrowRight size={14} />
                    </div>
                </Link>

                {/* Navigation Card: Shift Reports */}
                <Link to="/core/shift-reports" className="card-panel p-6 flex flex-col items-start gap-4 hover:border-enzi-gold transition group bg-gradient-to-br from-enzi-card to-enzi-card/50">
                    <div className="p-3 bg-enzi-black rounded-xl border border-enzi-muted/20 group-hover:border-enzi-gold/50 transition">
                        <ClipboardList className="text-enzi-gold" size={28} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-enzi-text mb-1">Shift Reports</h2>
                        <p className="text-sm text-enzi-muted">View Daily Operational Summaries</p>
                    </div>
                    <div className="mt-auto pt-2 text-xs font-bold text-enzi-gold uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                        View Reports <ArrowRight size={14} />
                    </div>
                </Link>

                {/* Inventory Manager */}
                <Link to="/core/inventory" className="card-panel p-6 flex flex-col items-start gap-4 hover:border-enzi-gold transition group bg-gradient-to-br from-enzi-card to-enzi-card/50">
                    <div className="p-3 bg-enzi-black rounded-xl border border-enzi-muted/20 group-hover:border-enzi-gold/50 transition">
                        <Package className="text-enzi-gold" size={28} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-enzi-text mb-1">Inventory Manager</h2>
                        <p className="text-sm text-enzi-muted">Manage Stock Items & Suppliers</p>
                    </div>
                    <div className="mt-auto pt-2 text-xs font-bold text-enzi-gold uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                        Manage Items <ArrowRight size={14} />
                    </div>
                </Link>
            </div>

            <div className="grid gap-6">
                {/* Audit Dashboard */}
                <section className="space-y-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xs font-bold text-enzi-muted uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={14} className="text-enzi-gold" />
                                Audit Date:
                            </h2>
                            <input
                                type="date"
                                className="bg-white/5 border border-enzi-muted/20 rounded-lg px-3 py-1.5 text-sm text-enzi-text focus:outline-none focus:border-enzi-gold transition-colors cursor-pointer"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                            />
                        </div>

                        <div className="card-panel p-0 overflow-hidden">
                            <div className="flex border-b border-enzi-muted/10">
                                <button
                                    onClick={() => setActiveAuditTab('wastage')}
                                    className={`flex-1 py-4 px-6 text-sm font-bold flex items-center justify-center gap-2 transition-colors relative
                                    ${activeAuditTab === 'wastage' ? 'text-enzi-text bg-white/5' : 'text-enzi-muted hover:text-enzi-text hover:bg-white/5'}
                                `}
                                >
                                    <AlertTriangle className={activeAuditTab === 'wastage' ? 'text-red-500' : ''} size={18} />
                                    Live Wastage
                                    <span className={`text-xs ml-1 px-1.5 py-0.5 rounded-full ${activeAuditTab === 'wastage' ? 'bg-red-900/40 text-red-400' : 'bg-enzi-muted/20 text-enzi-muted'}`}>
                                        {wastageFeed.length}
                                    </span>
                                    {activeAuditTab === 'wastage' && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 animate-in fade-in zoom-in-50 duration-200"></div>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveAuditTab('issues')}
                                    className={`flex-1 py-4 px-6 text-sm font-bold flex items-center justify-center gap-2 transition-colors relative
                                    ${activeAuditTab === 'issues' ? 'text-enzi-text bg-white/5' : 'text-enzi-muted hover:text-enzi-text hover:bg-white/5'}
                                `}
                                >
                                    <ListTodo className={activeAuditTab === 'issues' ? 'text-enzi-gold' : ''} size={18} />
                                    Reported Issues
                                    <span className={`text-xs ml-1 px-1.5 py-0.5 rounded-full ${activeAuditTab === 'issues' ? 'bg-enzi-gold/20 text-enzi-gold' : 'bg-enzi-muted/20 text-enzi-muted'}`}>
                                        {maintenanceTickets.length}
                                    </span>
                                    {activeAuditTab === 'issues' && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-enzi-gold animate-in fade-in zoom-in-50 duration-200"></div>
                                    )}
                                </button>
                            </div>

                            <div className="p-6 min-h-[300px]">
                                {loadingAudit ? (
                                    <div className="flex justify-center p-12"><Loader2 className="animate-spin text-enzi-muted" size={32} /></div>
                                ) : (
                                    <>
                                        {activeAuditTab === 'wastage' && (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                {wastageFeed.length === 0 ? (
                                                    <div className="text-center py-12 text-enzi-muted italic">
                                                        <CheckCircle2 className="mx-auto mb-2 text-green-500/50" size={32} />
                                                        No wastage logged on this date.
                                                    </div>
                                                ) : (
                                                    wastageFeed.map(log => (
                                                        <div key={log.id} className="text-sm border-l-2 border-red-500 pl-4 py-3 bg-red-500/5 rounded-r-lg hover:bg-red-500/10 transition">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <span className="font-bold text-enzi-text text-base">{log.item_type}</span>
                                                                <span className="text-[10px] font-mono text-enzi-muted">{getTimeAgo(log.logged_at)}</span>
                                                            </div>
                                                            <div className="flex justify-between items-end">
                                                                <span className="text-xs text-enzi-muted/80 block max-w-[80%]">
                                                                    {log.reason}
                                                                </span>
                                                                <span className="text-xs font-bold text-enzi-text bg-white/10 px-2 py-0.5 rounded">
                                                                    Qty: {log.quantity}
                                                                </span>
                                                            </div>
                                                            <div className="mt-2 text-[10px] text-enzi-muted uppercase tracking-wider flex items-center gap-1">
                                                                <MapPin size={10} />
                                                                {log.shifts?.locations?.name || 'Unknown Location'}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}

                                        {activeAuditTab === 'issues' && (
                                            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                {maintenanceTickets.length === 0 ? (
                                                    <div className="text-center py-12 text-enzi-muted italic">
                                                        <CheckCircle2 className="mx-auto mb-2 text-green-500/50" size={32} />
                                                        No tickets logged on this date.
                                                    </div>
                                                ) : (
                                                    maintenanceTickets.map(ticket => (
                                                        <div key={ticket.id} className="flex justify-between items-start bg-white/5 border border-enzi-muted/10 p-4 rounded-xl gap-4 hover:border-enzi-gold/30 transition">
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className="text-[10px] font-bold text-enzi-gold bg-enzi-gold/10 px-2 py-0.5 rounded-full uppercase tracking-wider border border-enzi-gold/20">
                                                                        {ticket.equipment_name}
                                                                    </span>
                                                                    <span className="text-[10px] text-enzi-muted font-mono whitespace-nowrap">
                                                                        {getTimeAgo(ticket.created_at)}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm font-medium text-enzi-text mb-2 break-words leading-relaxed">
                                                                    {ticket.issue_description}
                                                                </p>
                                                                <p className="text-xs text-enzi-muted flex items-center gap-1.5 opacity-60">
                                                                    <MapPin size={12} />
                                                                    {ticket.locations?.name || 'Unknown Location'}
                                                                </p>
                                                            </div>
                                                            <span className={`shrink-0 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${ticket.status === 'open' ? 'bg-red-900/20 text-red-400 border-red-900/30' :
                                                                ticket.status === 'fundi_scheduled' ? 'bg-blue-900/20 text-blue-400 border-blue-900/30' :
                                                                    'bg-green-900/20 text-green-400 border-green-900/30'
                                                                }`}>
                                                                {ticket.status === 'fundi_scheduled' ? 'SCHEDULED' : ticket.status}
                                                            </span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div >
        </div >
    );
}
