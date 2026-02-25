import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { ClipboardList, Trash2, Wrench, PackagePlus, AlertTriangle, Plus, History, LogOut, Loader2, Check, ListTodo, Repeat, Calendar, Edit, X, PlusCircle, CheckCircle2, Search } from 'lucide-react';

export default function DashboardPage() {
    const navigate = useNavigate();
    const { user, activeShift, refreshShift } = useAuth();
    const [activeTab, setActiveTab] = useState('wastage');
    const [tasks, setTasks] = useState([]);
    const [showManageBriefing, setShowManageBriefing] = useState(false);

    const [elapsedTime, setElapsedTime] = useState('');
    const [startTimeDisplay, setStartTimeDisplay] = useState('');

    useEffect(() => {
        if (activeShift?.start_time) {
            // Set static start time display
            const start = new Date(activeShift.start_time);
            setStartTimeDisplay(start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

            // Initial calculation
            updateElapsedTime();

            // Update every minute
            const interval = setInterval(updateElapsedTime, 60000);
            return () => clearInterval(interval);
        }
    }, [activeShift]);

    const updateElapsedTime = () => {
        if (!activeShift?.start_time) return;

        const start = new Date(activeShift.start_time);
        const now = new Date();
        const diffMs = now - start;

        if (diffMs < 0) {
            setElapsedTime('Just Started');
            return;
        }

        const diffMins = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;

        let timeString = '';
        if (hours > 0) {
            timeString = `${hours}h ${mins}m`;
        } else {
            timeString = `${mins}m`;
        }
        setElapsedTime(timeString);
    };

    useEffect(() => {
        if (activeShift?.location_id) {
            fetchTasks();
        }
    }, [activeShift]);

    const fetchTasks = async () => {
        const { data } = await supabase
            .from('location_tasks')
            .select('*')
            .eq('location_id', activeShift.location_id)
            .order('created_at', { ascending: false });

        if (data) setTasks(data);
    };

    const toggleTask = async (taskId, currentStatus) => {
        const { error } = await supabase
            .from('location_tasks')
            .update({ is_completed: !currentStatus })
            .eq('id', taskId);

        if (!error) fetchTasks();
    };



    const handleEndShift = () => {
        navigate('/closing');
    };

    if (!activeShift) {
        return <div className="p-8 text-center text-espresso-900">Loading Shift Data...</div>;
    }

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center bg-enzi-card p-4 rounded-xl border border-enzi-muted/10 backdrop-blur-sm shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-enzi-text">Barista Dashboard</h2>
                    <p className="text-sm text-enzi-muted font-medium flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${activeShift?.shift_type === 'morning' ? 'bg-blue-900/40 text-blue-300 border border-blue-500/30' :
                                activeShift?.shift_type === 'afternoon' ? 'bg-purple-900/40 text-purple-300 border border-purple-500/30' :
                                    'bg-green-900/40 text-green-400 border border-green-500/30'
                            }`}>
                            {activeShift?.shift_type ? `${activeShift.shift_type} Shift` : 'Active Shift'}
                        </span>
                        • BIC: {user?.name || 'Unknown'}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end mr-2">
                        <div className="text-2xl font-mono font-bold text-enzi-gold leading-none">
                            {elapsedTime}
                        </div>
                        <div className="text-xs text-enzi-muted font-medium mt-1">
                            Started at {startTimeDisplay}
                        </div>
                    </div>
                    <button
                        onClick={handleEndShift}
                        className="flex items-center gap-2 px-4 py-2 bg-red-900/20 text-red-400 border border-red-900/30 rounded-lg hover:bg-red-900/40 transition font-semibold text-sm"
                    >
                        <LogOut size={16} /> End Shift
                    </button>
                </div>
            </header>

            {/* Operational Tasks Section */}
            <div className="card-panel p-5">
                <h3 className="font-bold text-enzi-text mb-4 flex items-center gap-2">
                    <ListTodo className="text-enzi-gold" size={22} />
                    Location Operations
                </h3>
                <div className="space-y-3">
                    {tasks.length === 0 && <p className="text-sm text-enzi-muted italic pl-1">No checklists for this location.</p>}
                    {tasks.map(task => (
                        <div key={task.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${task.is_completed ? 'bg-white/5 border-transparent' : 'bg-enzi-black border-enzi-muted/20 shadow-sm hover:border-enzi-gold'
                            }`}>
                            <button
                                onClick={() => toggleTask(task.id, task.is_completed)}
                                className={`mt-0.5 shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all ${task.is_completed
                                    ? 'bg-green-600 border-green-600 text-white'
                                    : 'bg-transparent border-enzi-muted hover:border-enzi-gold text-transparent'
                                    }`}
                            >
                                <Check size={14} strokeWidth={3} />
                            </button>
                            <div className="flex-1">
                                <p className={`text-sm font-bold transition-colors ${task.is_completed ? 'text-enzi-muted line-through' : 'text-enzi-text'
                                    }`}>
                                    {task.task_text}
                                </p>
                                <div className="flex gap-2 mt-1">
                                    {task.category && (
                                        <span className="text-[10px] bg-enzi-muted/10 text-enzi-muted px-1.5 py-0.5 rounded capitalize">
                                            {task.category}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
                <TabButton
                    active={activeTab === 'wastage'}
                    onClick={() => setActiveTab('wastage')}
                    icon={<Trash2 size={18} />}
                    label="Wastage"
                />
                <TabButton
                    active={activeTab === 'restock'}
                    onClick={() => setActiveTab('restock')}
                    icon={<PackagePlus size={18} />}
                    label="Restock"
                />
                <TabButton
                    active={activeTab === 'maintenance'}
                    onClick={() => setActiveTab('maintenance')}
                    icon={<AlertTriangle size={18} />}
                    label="Issues"
                />
            </div>

            <div className="min-h-[400px]">
                {activeTab === 'wastage' && <WastageSection activeShift={activeShift} />}
                {activeTab === 'restock' && <RestockSection activeShift={activeShift} />}
                {activeTab === 'maintenance' && <MaintenanceSection activeShift={activeShift} />}
            </div>

            {/* Manage Briefing Modal */}
            {showManageBriefing && (
                <ManageBriefingModal
                    locationId={activeShift.location_id}
                    items={briefingItems}
                    onClose={() => setShowManageBriefing(false)}
                    onUpdate={fetchBriefing}
                    currentUser={user}
                />
            )}
        </div>
    );
}

function TabButton({ active, onClick, icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-md transition-all font-medium text-sm
        ${active
                    ? 'bg-enzi-gold text-enzi-black shadow-sm font-bold'
                    : 'text-enzi-muted hover:text-enzi-text hover:bg-white/5'
                }`}
        >
            {icon}
            {label}
        </button>
    );
}

/* --- Sections --- */

function WastageSection({ activeShift }) {
    const [logs, setLogs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchLogs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('wastage_logs')
            .select('*')
            .eq('shift_id', activeShift.id)
            .order('logged_at', { ascending: false });

        if (data) setLogs(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchLogs();
    }, [activeShift.id]);

    return (
        <div className="space-y-4">
            {/* Alert Banner Example */}
            <div className="bg-red-900/20 border border-red-900/30 p-4 rounded-lg flex gap-3 text-red-400 animate-pulse-slow">
                <AlertTriangle className="shrink-0" />
                <div>
                    <p className="font-bold text-sm">Action Required</p>
                    <p className="text-xs mt-1">Check opened Sparkling Water expiry.</p>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <h3 className="font-bold text-enzi-text flex items-center gap-2">
                    <Trash2 className="text-enzi-gold" size={22} />
                    Today's Wastage
                </h3>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center gap-2 py-2 px-3 text-sm"
                >
                    <Plus size={16} />
                    Log Wastage
                </button>
            </div>

            <div className="space-y-3">
                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-enzi-muted" /></div>
                ) : logs.length === 0 ? (
                    <div className="card-panel p-8 text-center border-dashed">
                        <CheckCircle2 className="mx-auto text-green-500/50 mb-2" size={32} />
                        <p className="text-enzi-muted italic">No wastage logged yet.</p>
                        <p className="text-xs text-enzi-muted/50 mt-1">Keep it up!</p>
                    </div>
                ) : (
                    logs.map(log => (
                        <div key={log.id} className="bg-enzi-black p-3 rounded-lg flex justify-between items-center shadow-sm border border-enzi-muted/10">
                            <div>
                                <p className="font-semibold text-enzi-text">{log.item_type} <span className="text-sm font-normal text-enzi-muted">x{log.quantity}</span></p>
                                <p className="text-xs text-red-400">{log.reason}</p>
                            </div>
                            <span className="text-xs text-enzi-muted/50 font-mono">
                                {new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <LogWastageModal
                    activeShift={activeShift}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        fetchLogs();
                    }}
                />
            )}
        </div>
    );
}

function LogWastageModal({ activeShift, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        item_type: '',
        quantity: '',
        reason: ''
    });

    const handleSubmit = async () => {
        if (!form.item_type || !form.quantity || !form.reason) return;
        setLoading(true);

        try {
            const { error } = await supabase.from('wastage_logs').insert([
                {
                    shift_id: activeShift.id,
                    item_type: form.item_type,
                    quantity: parseInt(form.quantity),
                    reason: form.reason
                }
            ]);

            if (error) throw error;
            onSuccess();
        } catch (error) {
            console.error('Error logging wastage:', error);
            alert('Failed to log wastage');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="card-panel p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-enzi-text flex items-center gap-2">
                        <Trash2 className="text-enzi-gold" size={20} />
                        Log Wastage
                    </h3>
                    <button onClick={onClose} className="text-enzi-muted hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="grid gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-enzi-muted uppercase">Item Type</label>
                        <select
                            className="input-field w-full"
                            value={form.item_type}
                            onChange={e => setForm({ ...form, item_type: e.target.value })}
                        >
                            <option value="">Select Item Type...</option>
                            <option value="Pastry">Pastry</option>
                            <option value="Milk/Dairy">Milk/Dairy</option>
                            <option value="Espresso Beans">Espresso Beans</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-enzi-muted uppercase">Quantity</label>
                        <input
                            type="number"
                            placeholder="Qty"
                            className="input-field w-full"
                            value={form.quantity}
                            onChange={e => setForm({ ...form, quantity: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-enzi-muted uppercase">Reason</label>
                        <textarea
                            placeholder="Reason (e.g. Broken, Expired)"
                            className="input-field w-full"
                            rows="2"
                            value={form.reason}
                            onChange={e => setForm({ ...form, reason: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="flex gap-3 mt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2 rounded-lg border border-enzi-muted/20 text-enzi-muted hover:bg-white/5 transition font-semibold text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !form.item_type || !form.quantity || !form.reason}
                            className="flex-1 btn-primary flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                            Log
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RestockSection({ activeShift }) {
    const [requests, setRequests] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchRequests = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('restock_requests')
            .select('*')
            .eq('location_id', activeShift.location_id)
            .neq('status', 'fulfilled') // Show active requests for the location
            .order('created_at', { ascending: false });

        if (data) setRequests(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchRequests();
    }, [activeShift.id]);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-enzi-text flex items-center gap-2">
                    <PackagePlus className="text-enzi-gold" size={22} />
                    Restock Requests
                </h3>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center gap-2 py-2 px-3 text-sm"
                >
                    <Plus size={16} />
                    Request Item
                </button>
            </div>

            <div className="space-y-3">
                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-enzi-muted" /></div>
                ) : requests.length === 0 ? (
                    <div className="card-panel p-8 text-center border-dashed">
                        <CheckCircle2 className="mx-auto text-green-500/50 mb-2" size={32} />
                        <p className="text-enzi-muted italic">No active requests.</p>
                        <p className="text-xs text-enzi-muted/50 mt-1">Stock levels are looking good!</p>
                    </div>
                ) : (
                    requests.map(req => (
                        <div key={req.id} className="flex justify-between items-center text-sm border-b border-enzi-muted/10 pb-2 last:border-0 last:pb-0 bg-enzi-black p-3 rounded-lg border">
                            <div>
                                <span className="font-medium text-enzi-text block">{req.item_name}</span>
                                {req.current_quantity && <span className="text-enzi-muted text-xs">Current Qty: {req.current_quantity}</span>}
                                {req.supplier && <span className="text-enzi-muted text-xs block">Supplier: {req.supplier}</span>}
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${req.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                req.status === 'ordered' ? 'bg-blue-900/30 text-blue-400 border border-blue-900/20' : 'bg-green-900/30 text-green-400 border border-green-900/20'
                                }`}>
                                {req.status}
                            </span>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <RequestRestockModal
                    activeShift={activeShift}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        fetchRequests();
                    }}
                />
            )}
        </div>
    );
}

function RequestRestockModal({ activeShift, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [inventory, setInventory] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [form, setForm] = useState({
        item_name: '',
        current_quantity: '',
        supplier: ''
    });

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const { data } = await supabase
                .from('inventory_items')
                .select('*')
                .order('name');
            setInventory(data || []);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setForm({ ...form, item_name: value });

        if (value.trim().length > 0) {
            const filtered = inventory.filter(item =>
                item.name.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredItems(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const selectItem = (item) => {
        setForm({
            ...form,
            item_name: item.name,
            supplier: '' // Reset or potentially fetch supplier if linked in future
        });
        setShowSuggestions(false);
    };

    const handleSubmit = async () => {
        if (!form.item_name) return;
        setLoading(true);

        try {
            const { error } = await supabase.from('restock_requests').insert([
                {
                    shift_id: activeShift.id,
                    location_id: activeShift.location_id,
                    item_name: form.item_name,
                    current_quantity: form.current_quantity ? parseInt(form.current_quantity) : null,
                    supplier: form.supplier
                }
            ]);

            if (error) throw error;
            onSuccess();
        } catch (error) {
            console.error("Error requesting restock:", error);
            alert("Failed to request restock");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="card-panel p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-enzi-text flex items-center gap-2">
                        <PackagePlus className="text-enzi-gold" size={20} />
                        Request Restock
                    </h3>
                    <button onClick={onClose} className="text-enzi-muted hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="grid gap-4">
                    <div className="space-y-1 relative">
                        <label className="text-xs font-bold text-enzi-muted uppercase">Item Name</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search item..."
                                className="input-field w-full pl-9"
                                value={form.item_name}
                                onChange={handleSearchChange}
                                onFocus={() => {
                                    if (form.item_name) setShowSuggestions(true);
                                }}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-enzi-muted" size={16} />
                        </div>

                        {/* Suggestions Dropdown */}
                        {showSuggestions && filteredItems.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-enzi-card border border-enzi-muted/20 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                {filteredItems.map(item => (
                                    <button
                                        key={item.id}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition flex justify-between items-center group"
                                        onClick={() => selectItem(item)}
                                    >
                                        <span className="font-medium text-enzi-text">{item.name}</span>
                                        <span className="text-[10px] text-enzi-muted bg-white/5 px-1.5 py-0.5 rounded group-hover:bg-white/10">
                                            {item.category}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                        {showSuggestions && filteredItems.length === 0 && form.item_name && (
                            <div className="absolute z-10 w-full mt-1 bg-enzi-card border border-enzi-muted/20 rounded-lg shadow-xl p-3 text-sm text-enzi-muted italic">
                                No specific items found. You can still submit "{form.item_name}".
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-enzi-muted uppercase">Current Qty</label>
                            <input
                                type="number"
                                placeholder="Qty"
                                className="input-field w-full"
                                value={form.current_quantity}
                                onChange={e => setForm({ ...form, current_quantity: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-enzi-muted uppercase">Supplier</label>
                            <input
                                type="text"
                                placeholder="Optional"
                                className="input-field w-full"
                                value={form.supplier}
                                onChange={e => setForm({ ...form, supplier: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2 rounded-lg border border-enzi-muted/20 text-enzi-muted hover:bg-white/5 transition font-semibold text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !form.item_name}
                            className="flex-1 btn-primary flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MaintenanceSection({ activeShift }) {
    const [tickets, setTickets] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchTickets = async () => {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const startOfDay = `${today}T00:00:00.000Z`;
        const endOfDay = `${today}T23:59:59.999Z`;

        const { data, error } = await supabase
            .from('maintenance_tickets')
            .select('*')
            .eq('location_id', activeShift.location_id)
            .gte('created_at', startOfDay)
            .lte('created_at', endOfDay)
            .order('created_at', { ascending: false });

        if (data) setTickets(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchTickets();
    }, [activeShift.location_id]);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-enzi-text flex items-center gap-2">
                    <ListTodo className="text-enzi-gold" size={22} />
                    Today's Issues
                </h3>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center gap-2 py-2 px-3 text-sm"
                >
                    <Plus size={16} />
                    Report Issue
                </button>
            </div>

            <div className="space-y-3">
                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-enzi-muted" /></div>
                ) : tickets.length === 0 ? (
                    <div className="card-panel p-8 text-center border-dashed">
                        <CheckCircle2 className="mx-auto text-green-500/50 mb-2" size={32} />
                        <p className="text-enzi-muted italic">No issues reported today.</p>
                        <p className="text-xs text-enzi-muted/50 mt-1">Everything is running smoothly!</p>
                    </div>
                ) : (
                    tickets.map(ticket => (
                        <div key={ticket.id} className="bg-enzi-black p-4 rounded-lg border border-enzi-muted/20 flex gap-3">
                            <div className="mt-1 shrink-0">
                                <AlertTriangle className="text-amber-500" size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-enzi-text text-sm">{ticket.equipment_name}</h4>
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${ticket.status === 'open' ? 'bg-red-900/30 text-red-400' :
                                        ticket.status === 'fundi_scheduled' ? 'bg-blue-900/30 text-blue-400' :
                                            'bg-green-900/30 text-green-400'
                                        }`}>
                                        {ticket.status === 'fundi_scheduled' ? 'SCHEDULED' : ticket.status}
                                    </span>
                                </div>
                                <p className="text-sm text-enzi-muted mt-1 break-words">{ticket.issue_description}</p>
                                <div className="mt-2 flex items-center gap-2 text-xs text-enzi-muted/50 font-mono">
                                    <History size={12} />
                                    {new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <ReportIssueModal
                    activeShift={activeShift}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        fetchTickets();
                    }}
                />
            )}
        </div>
    );
}

function ReportIssueModal({ activeShift, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        category: '',
        issue_description: ''
    });

    const handleSubmit = async () => {
        if (!form.category || !form.issue_description) return;
        setLoading(true);

        try {
            const { error } = await supabase.from('maintenance_tickets').insert([
                {
                    location_id: activeShift.location_id,
                    equipment_name: form.category,
                    issue_description: form.issue_description,
                    status: 'open'
                }
            ]);

            if (error) throw error;
            onSuccess();
        } catch (error) {
            console.error("Error submitting ticket:", error);
            alert("Failed to submit ticket");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="card-panel p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-enzi-text flex items-center gap-2">
                        <AlertTriangle className="text-enzi-gold" size={20} />
                        Report Issue
                    </h3>
                    <button onClick={onClose} className="text-enzi-muted hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="grid gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-enzi-muted uppercase">Category</label>
                        <select
                            className="input-field w-full"
                            value={form.category}
                            onChange={e => setForm({ ...form, category: e.target.value })}
                        >
                            <option value="">Select Category...</option>
                            <option value="Customer">Customer</option>
                            <option value="Supply">Supply</option>
                            <option value="Machines">Machines</option>
                            <option value="General">General</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-enzi-muted uppercase">Description</label>
                        <textarea
                            placeholder="Describe the issue..."
                            className="input-field w-full"
                            rows="3"
                            value={form.issue_description}
                            onChange={e => setForm({ ...form, issue_description: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="flex gap-3 mt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2 rounded-lg border border-enzi-muted/20 text-enzi-muted hover:bg-white/5 transition font-semibold text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !form.category || !form.issue_description}
                            className="flex-1 btn-primary flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Wrench size={16} />}
                            Log Ticket
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* --- Confirm Dialog Component --- */
function ConfirmDialog({ title, message, confirmText, cancelText, onConfirm, onCancel, danger = false }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="card-panel p-6 max-w-md w-full animate-in zoom-in-95 duration-200">
                <h3 className="text-xl font-bold text-enzi-text mb-3">{title}</h3>
                <p className="text-enzi-muted mb-6">{message}</p>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 px-4 bg-white/5 border border-enzi-muted/20 text-enzi-text rounded-lg font-semibold hover:bg-white/10 transition"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${danger
                            ? 'bg-red-600 text-white hover:bg-red-700 border border-red-600'
                            : 'bg-enzi-gold text-enzi-black hover:bg-enzi-gold-dim border border-enzi-gold'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ManageBriefingModal({ locationId, items, onClose, onUpdate, currentUser }) {
    const [newItem, setNewItem] = useState('');
    const [recurrence, setRecurrence] = useState('recurring'); // 'recurring' | 'once'
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        if (!newItem.trim()) return;
        setLoading(true);

        const { error } = await supabase.from('briefing_items').insert([{
            location_id: locationId,
            content: newItem,
            recurrence: recurrence,
            created_by_name: currentUser.name,
            is_active: true
        }]);

        if (!error) {
            setNewItem('');
            onUpdate();
        } else {
            alert('Failed to add item');
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!confirm('Stop showing this item?')) return;

        // Soft delete: set is_active false
        const { error } = await supabase.from('briefing_items')
            .update({ is_active: false })
            .eq('id', id);

        if (!error) onUpdate();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="card-panel p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-enzi-text">Manage Shift Briefing</h3>
                    <button onClick={onClose} className="text-enzi-muted hover:text-enzi-text">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-enzi-muted mb-1">Add New Item</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newItem}
                                onChange={(e) => setNewItem(e.target.value)}
                                placeholder="e.g. Wipe down counters..."
                                className="input-field flex-1"
                            />
                            <button
                                onClick={handleAdd}
                                disabled={!newItem.trim() || loading}
                                className="btn-primary px-4 flex items-center justify-center"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <PlusCircle size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="recurrence"
                                value="recurring"
                                checked={recurrence === 'recurring'}
                                onChange={() => setRecurrence('recurring')}
                                className="text-enzi-gold focus:ring-enzi-gold bg-enzi-black border-enzi-muted/30"
                            />
                            <span className="text-sm text-enzi-text">Repeats Every Shift</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="recurrence"
                                value="once"
                                checked={recurrence === 'once'}
                                onChange={() => setRecurrence('once')}
                                className="text-enzi-gold focus:ring-enzi-gold bg-enzi-black border-enzi-muted/30"
                            />
                            <span className="text-sm text-enzi-text">One-time Task</span>
                        </label>
                    </div>
                </div>

                <div className="border-t border-enzi-muted/10 pt-4">
                    <h4 className="text-sm font-bold text-enzi-muted mb-3 uppercase tracking-wider">Active Items</h4>
                    <div className="space-y-2">
                        {items.length === 0 && <p className="text-sm text-enzi-muted/50 italic">No active items.</p>}
                        {items.map(item => (
                            <div key={item.id} className="flex justify-between items-center p-3 bg-enzi-black rounded-lg border border-enzi-muted/10">
                                <div>
                                    <p className="text-sm font-medium text-enzi-text">{item.content}</p>
                                    <p className="text-xs text-enzi-muted mt-0.5 capitalize flex items-center gap-1">
                                        {item.recurrence === 'recurring' ? <Repeat size={10} /> : <Calendar size={10} />}
                                        {item.recurrence}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 text-red-500 hover:bg-red-900/20 rounded transition"
                                    title="Stop showing"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
