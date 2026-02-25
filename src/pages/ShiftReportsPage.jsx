import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, User, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, AlertTriangle, ListTodo, CheckCircle2, Circle, Check } from 'lucide-react';

export default function ShiftReportsPage() {
    const { user } = useAuth();
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState(() => {
        const d = new Date();
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().split('T')[0];
    });
    const [expandedShiftId, setExpandedShiftId] = useState(null);

    const changeDate = (days) => {
        const [year, month, day] = filterDate.split('-').map(Number);
        const d = new Date(year, month - 1, day);
        d.setDate(d.getDate() + days);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        setFilterDate(`${yyyy}-${mm}-${dd}`);
    };

    useEffect(() => {
        fetchShifts();
    }, [filterDate]);

    const fetchShifts = async () => {
        setLoading(true);
        try {
            // Get shifts for the selected date
            // Get shifts for the selected date (Local Time -> UTC)
            const start = new Date(`${filterDate}T00:00:00`);
            const end = new Date(`${filterDate}T23:59:59.999`);

            const startOfDay = start.toISOString();
            const endOfDay = end.toISOString();

            const { data, error } = await supabase
                .from('shifts')
                .select(`
                    *,
                    profiles:bic_id (name),
                    locations (name)
                `)
                .gte('start_time', startOfDay)
                .lte('start_time', endOfDay)
                .order('start_time', { ascending: false });

            if (error) throw error;
            setShifts(data || []);
        } catch (error) {
            console.error('Error fetching shifts:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <header className="mb-8">
                <LinkToCore />
                <h1 className="text-2xl font-bold text-enzi-text mt-4">Shift Reports</h1>
                <p className="text-sm text-enzi-muted italic">Daily Operational Summaries</p>
            </header>

            {/* Filter */}
            <div className="flex flex-wrap items-center gap-4 bg-white/5 p-4 rounded-xl border border-enzi-muted/10">
                <span className="text-sm font-bold text-enzi-muted uppercase tracking-wider flex items-center gap-2">
                    <Calendar size={16} className="text-enzi-gold" /> Filter Date:
                </span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => changeDate(-1)}
                        className="p-1.5 rounded-lg bg-enzi-black hover:bg-white/10 text-enzi-muted hover:text-enzi-gold transition-colors border border-white/10"
                        title="Previous Day"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="bg-enzi-black border border-enzi-muted/30 rounded-lg px-3 py-1.5 text-sm text-enzi-text focus:border-enzi-gold outline-none"
                    />
                    <button
                        onClick={() => changeDate(1)}
                        className="p-1.5 rounded-lg bg-enzi-black hover:bg-white/10 text-enzi-muted hover:text-enzi-gold transition-colors border border-white/10"
                        title="Next Day"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Shifts List */}
            {loading ? (
                <div className="text-center py-12 text-enzi-muted animate-pulse">Loading reports...</div>
            ) : shifts.length === 0 ? (
                <div className="text-center py-12 text-enzi-muted italic">
                    No shifts found for this date.
                </div>
            ) : (
                <div className="space-y-4">
                    {shifts.map(shift => (
                        <ShiftCard
                            key={shift.id}
                            shift={shift}
                            expanded={expandedShiftId === shift.id}
                            onToggle={() => setExpandedShiftId(expandedShiftId === shift.id ? null : shift.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function LinkToCore() {
    // Basic back button
    return (
        <Link to="/core" className="text-xs font-bold text-enzi-gold hover:underline uppercase tracking-widest mb-2 inline-block">
            &larr; Back to Dashboard
        </Link>
    );
}

function ShiftCard({ shift, expanded, onToggle }) {
    const [details, setDetails] = useState({ wastage: [], issues: [], tasks: [] });
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (expanded && !loaded) {
            fetchDetails();
        }
    }, [expanded]);

    const fetchDetails = async () => {
        setLoadingDetails(true);
        try {
            // Fetch Wastage
            const { data: wastage } = await supabase
                .from('wastage_logs')
                .select('*')
                .eq('shift_id', shift.id);

            // Fetch Issues (Maintenance Tickets) created during shift
            // If shift is active, end_time is null, use now
            const endTime = shift.end_time || new Date().toISOString();
            const { data: issues } = await supabase
                .from('maintenance_tickets')
                .select('*')
                .eq('location_id', shift.location_id)
                .gte('created_at', shift.start_time)
                .lte('created_at', endTime);

            // Fetch Tasks (this is tricky as tasks are stateful, just fetch current for location for now)
            // Ideally we'd have shift_tasks, but we'll use location_tasks
            const { data: tasks } = await supabase
                .from('location_tasks')
                .select('*')
                .eq('location_id', shift.location_id);

            setDetails({
                wastage: wastage || [],
                issues: issues || [],
                tasks: tasks || []
            });
            setLoaded(true);
        } catch (err) {
            console.error('Error fetching shift details:', err);
        } finally {
            setLoadingDetails(false);
        }
    };

    const formatTime = (isoString) => {
        if (!isoString) return 'Active';
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Duration calculation
    const getDuration = () => {
        if (!shift.end_time) return 'Ongoing';
        const start = new Date(shift.start_time);
        const end = new Date(shift.end_time);
        const diffHrs = (end - start) / (1000 * 60 * 60);
        return `${diffHrs.toFixed(1)} hrs`;
    };

    const renderChecklistSummary = (title, checklistObj, colorClass) => {
        if (!checklistObj || Object.keys(checklistObj).length === 0) return null;

        let total = 0;
        let done = 0;
        const notesList = [];

        Object.entries(checklistObj).forEach(([catKey, category]) => {
            if (typeof category === 'object') {
                Object.entries(category).forEach(([key, val]) => {
                    if (key === 'notes') {
                        if (val && typeof val === 'string' && val.trim() !== '') {
                            notesList.push({ category: catKey, note: val });
                        }
                    } else {
                        total++;
                        if (val === true || (typeof val === 'string' && val.trim() !== '')) {
                            done++;
                        }
                    }
                });
            }
        });

        if (total === 0) return null;

        return (
            <div className="bg-white/5 border border-white/10 p-3 rounded-lg mb-4 space-y-3">
                <div>
                    <h5 className={`text-sm font-bold ${colorClass} mb-2 flex items-center gap-2`}>
                        <CheckCircle2 size={14} /> {title}
                    </h5>
                    <div className="flex justify-between text-xs text-enzi-muted mb-1">
                        <span>Completion</span>
                        <span className="font-mono">{done}/{total}</span>
                    </div>
                    <div className="h-1.5 bg-enzi-black rounded-full overflow-hidden">
                        <div className={`h-full ${done === total ? 'bg-green-500' : 'bg-enzi-gold'} transition-all`} style={{ width: `${(done / total) * 100}%` }}></div>
                    </div>
                </div>
                {notesList.length > 0 && (
                    <div className="space-y-2 mt-3 pt-3 border-t border-white/5">
                        <h6 className="text-[10px] font-bold text-enzi-muted uppercase tracking-wider">Comments & Notes</h6>
                        {notesList.map((n, i) => (
                            <div key={i} className="bg-enzi-black/50 p-2 rounded text-sm text-enzi-text border border-white/5">
                                <span className="text-[10px] text-enzi-muted uppercase block mb-1">{n.category.replace('_', ' ')}</span>
                                {n.note}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`card-panel overflow-hidden transition-all duration-300 ${expanded ? 'ring-1 ring-enzi-gold/50' : 'hover:bg-white/5'}`}>
            <div
                onClick={onToggle}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
            >
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl border ${shift.end_time ? 'bg-green-900/20 border-green-900/30 text-green-400' : 'bg-enzi-gold/10 border-enzi-gold/30 text-enzi-gold'}`}>
                        <Clock size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-enzi-text">{shift.locations?.name || 'Unknown Location'}</h3>
                        <div className="flex flex-wrap gap-3 text-sm text-enzi-muted mt-1">
                            <span className="flex items-center gap-1"><User size={14} /> {shift.profiles?.name || 'Unknown User'}</span>
                            <span className="flex items-center gap-1"><Clock size={14} /> {formatTime(shift.start_time)} - {formatTime(shift.end_time)}</span>
                            <span className="bg-white/5 px-2 py-0.5 rounded text-xs font-mono border border-white/10">{getDuration()}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 self-end md:self-center">
                    {expanded ? <ChevronUp className="text-enzi-muted" /> : <ChevronDown className="text-enzi-muted" />}
                </div>
            </div>

            {expanded && (
                <div className="border-t border-enzi-muted/10 bg-black/20 p-6 space-y-6 animate-in slide-in-from-top-2">
                    {loadingDetails ? (
                        <div className="text-sm text-enzi-muted p-4">Loading details...</div>
                    ) : (
                        <>
                            {/* Stats Overview */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-white/5 p-3 rounded-lg text-center border border-white/5">
                                    <span className="text-2xl font-bold text-enzi-text block">{details.wastage.length}</span>
                                    <span className="text-xs text-enzi-muted uppercase tracking-wider">Wastage Logs</span>
                                </div>
                                <div className="bg-white/5 p-3 rounded-lg text-center border border-white/5">
                                    <span className="text-2xl font-bold text-enzi-text block">{details.issues.length}</span>
                                    <span className="text-xs text-enzi-muted uppercase tracking-wider">Issues</span>
                                </div>
                                <div className="bg-white/5 p-3 rounded-lg text-center border border-white/5">
                                    <span className="text-2xl font-bold text-enzi-text block">
                                        {details.tasks.filter(t => t.is_completed).length}/{details.tasks.length}
                                    </span>
                                    <span className="text-xs text-enzi-muted uppercase tracking-wider">Tasks Done</span>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Left Col: Issues & Wastage */}
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <AlertTriangle size={14} /> Reported Issues
                                        </h4>
                                        {details.issues.length === 0 ? (
                                            <p className="text-sm text-enzi-muted italic border-l-2 border-enzi-muted/20 pl-3">No issues reported.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {details.issues.map(issue => (
                                                    <div key={issue.id} className="text-sm bg-red-900/10 border border-red-900/20 p-3 rounded-lg">
                                                        <div className="flex justify-between mb-1">
                                                            <span className="font-bold text-red-200">{issue.equipment_name}</span>
                                                            <span className="text-[10px] bg-red-900/40 px-1.5 rounded text-red-300 uppercase">{issue.status}</span>
                                                        </div>
                                                        <p className="text-enzi-muted">{issue.issue_description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-bold text-enzi-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Circle size={14} /> Wastage Reports
                                        </h4>
                                        {details.wastage.length === 0 ? (
                                            <p className="text-sm text-enzi-muted italic border-l-2 border-enzi-muted/20 pl-3">No wastage recorded.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {details.wastage.map(log => (
                                                    <div key={log.id} className="text-sm bg-white/5 border border-white/10 p-3 rounded-lg flex justify-between items-center">
                                                        <div>
                                                            <span className="font-bold text-enzi-text">{log.item_type}</span>
                                                            <span className="text-enzi-muted ml-2">x{log.quantity}</span>
                                                            <p className="text-xs text-enzi-muted/70">{log.reason}</p>
                                                        </div>
                                                        <span className="text-[10px] font-mono text-enzi-muted/50">
                                                            {new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Col: Tasks */}
                                <div>
                                    {renderChecklistSummary("Opening Checklist", shift.opening_checklist, "text-enzi-gold")}
                                    {renderChecklistSummary("Closing Checklist", shift.closing_checklist, "text-red-400")}

                                    <h4 className="text-sm font-bold text-enzi-gold uppercase tracking-widest mb-3 flex items-center gap-2 mt-4">
                                        <ListTodo size={14} /> Checklist Tasks
                                    </h4>
                                    <div className="space-y-2">
                                        {details.tasks.length === 0 ? (
                                            <p className="text-sm text-enzi-muted italic border-l-2 border-enzi-muted/20 pl-3">No tasks found.</p>
                                        ) : (
                                            details.tasks.map(task => (
                                                <div key={task.id} className={`flex items-start gap-3 p-2 rounded border ${task.is_completed ? 'bg-green-900/10 border-green-900/20 opacity-75' : 'bg-white/5 border-white/10'}`}>
                                                    <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center ${task.is_completed ? 'bg-green-600 border-green-600' : 'border-enzi-muted'}`}>
                                                        {task.is_completed && <Check size={10} className="text-white" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className={`text-sm ${task.is_completed ? 'text-enzi-muted line-through' : 'text-enzi-text'}`}>{task.task_text}</p>
                                                        <span className="text-[10px] text-enzi-muted uppercase tracking-wider">{task.category}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
