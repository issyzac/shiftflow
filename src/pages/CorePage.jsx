import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, CheckCircle2, Send, MapPin, ListTodo, AlertTriangle, Calendar, ClipboardList, MessageSquare, ArrowRight } from 'lucide-react';
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

                {/* Placeholder for future hubs (e.g. Inventory, Staff) */}
                <div className="card-panel p-6 flex flex-col items-start gap-4 opacity-50 grayscale cursor-not-allowed">
                    <div className="p-3 bg-enzi-black rounded-xl border border-enzi-muted/20">
                        <ListTodo className="text-enzi-muted" size={28} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-enzi-text mb-1">Inventory Manager</h2>
                        <p className="text-sm text-enzi-muted">Coming Soon: Stock levels & Supplier orders</p>
                    </div>
                </div>
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

                        <div className="card-panel p-6">
                            <h2 className="text-lg font-bold mb-4 text-enzi-text flex items-center gap-2">
                                <AlertTriangle className="text-red-500" size={20} />
                                Live Wastage Feed
                            </h2>
                            <div className="space-y-4">
                                {loadingAudit ? (
                                    <div className="flex justify-center p-4"><Loader2 className="animate-spin text-enzi-muted" /></div>
                                ) : wastageFeed.length === 0 ? (
                                    <p className="text-sm text-enzi-muted italic px-2">No wastage logged on this date.</p>
                                ) : (
                                    wastageFeed.map(log => (
                                        <div key={log.id} className="text-sm border-l-2 border-red-500 pl-4 py-2 bg-red-500/5 rounded-r-lg">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-enzi-text">{log.item_type}</span>
                                                <span className="text-[10px] font-mono text-enzi-muted">{getTimeAgo(log.logged_at)}</span>
                                            </div>
                                            <span className="block text-xs text-enzi-muted">
                                                {log.shifts?.locations?.name || 'Unknown'} • {log.reason} • Quantity: {log.quantity}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="card-panel p-6">
                            <h2 className="text-lg font-bold mb-4 text-enzi-text flex items-center gap-2">
                                <ListTodo className="text-enzi-gold" size={20} />
                                Maintenance Status
                            </h2>
                            <div className="space-y-3">
                                {loadingAudit ? (
                                    <div className="flex justify-center p-4"><Loader2 className="animate-spin text-enzi-muted" /></div>
                                ) : maintenanceTickets.length === 0 ? (
                                    <p className="text-sm text-enzi-muted italic px-2">No tickets logged on this date.</p>
                                ) : (
                                    maintenanceTickets.map(ticket => (
                                        <div key={ticket.id} className="flex justify-between items-center bg-white/5 border border-enzi-muted/10 p-3 rounded-xl">
                                            <div>
                                                <span className="block text-sm font-bold text-enzi-text">{ticket.equipment_name}</span>
                                                <span className="text-xs text-enzi-muted">Reported at {ticket.locations?.name} • {getTimeAgo(ticket.created_at)}</span>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${ticket.status === 'open' ? 'bg-amber-900/40 text-amber-400' :
                                                ticket.status === 'fundi_scheduled' ? 'bg-blue-900/40 text-blue-400' :
                                                    'bg-green-900/40 text-green-400'
                                                }`}>
                                                {ticket.status === 'fundi_scheduled' ? 'SCHEDULED' : ticket.status}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div >
        </div >
    );
}
