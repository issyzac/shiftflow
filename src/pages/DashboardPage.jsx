import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { ClipboardList, Trash2, Wrench, PackagePlus, AlertTriangle, Plus, History, LogOut, Loader2, Check, ListTodo, Repeat, Calendar, Edit, X, PlusCircle } from 'lucide-react';

export default function DashboardPage() {
    const { user, activeShift, refreshShift } = useAuth();
    const [activeTab, setActiveTab] = useState('wastage');
    const [tasks, setTasks] = useState([]);
    const [showEndShiftDialog, setShowEndShiftDialog] = useState(false);
    const [showManageBriefing, setShowManageBriefing] = useState(false);

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



    const handleEndShift = async () => {
        if (!activeShift) return;
        setShowEndShiftDialog(false);

        try {
            const { error } = await supabase
                .from('shifts')
                .update({ end_time: new Date().toISOString() })
                .eq('id', activeShift.id);

            if (error) throw error;

            await refreshShift();
            // App.jsx will automatically route back to logic
        } catch (err) {
            console.error('Error ending shift:', err);
            alert('Failed to end shift.');
        }
    };

    if (!activeShift) {
        return <div className="p-8 text-center text-espresso-900">Loading Shift Data...</div>;
    }

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center bg-enzi-card p-4 rounded-xl border border-enzi-muted/10 backdrop-blur-sm shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-enzi-text">Barista Dashboard</h2>
                    <p className="text-sm text-enzi-muted font-medium">
                        Shift Active • BIC: {user?.name || 'Unknown'}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-2xl font-mono font-bold text-enzi-gold hidden md:block">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <button
                        onClick={() => setShowEndShiftDialog(true)}
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

            {/* End Shift Confirmation Dialog */}
            {showEndShiftDialog && (
                <ConfirmDialog
                    title="End Shift?"
                    message="Are you sure you want to end your shift? This action cannot be undone."
                    confirmText="End Shift"
                    cancelText="Cancel"
                    onConfirm={handleEndShift}
                    onCancel={() => setShowEndShiftDialog(false)}
                    danger
                />
            )}

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
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        item_type: '',
        quantity: '',
        reason: ''
    });

    const fetchLogs = async () => {
        const { data, error } = await supabase
            .from('wastage_logs')
            .select('*')
            .eq('shift_id', activeShift.id)
            .order('logged_at', { ascending: false });

        if (data) setLogs(data);
    };

    useEffect(() => {
        fetchLogs();
    }, [activeShift.id]);

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

            setForm({ item_type: '', quantity: '', reason: '' });
            fetchLogs();
        } catch (error) {
            console.error('Error logging wastage:', error);
            alert('Failed to log wastage');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Alert Banner Example - Static for now, could be dynamic based on shift start time */}
            <div className="bg-red-900/20 border border-red-900/30 p-4 rounded-lg flex gap-3 text-red-400 animate-pulse-slow">
                <AlertTriangle className="shrink-0" />
                <div>
                    <p className="font-bold text-sm">Action Required</p>
                    <p className="text-xs mt-1">Check opened Sparkling Water expiry.</p>
                </div>
            </div>

            <div className="card-panel p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">Log New Wastage</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <select
                        className="input-field"
                        value={form.item_type}
                        onChange={e => setForm({ ...form, item_type: e.target.value })}
                    >
                        <option value="">Select Item Type...</option>
                        <option value="Pastry">Pastry</option>
                        <option value="Milk/Dairy">Milk/Dairy</option>
                        <option value="Espresso Beans">Espresso Beans</option>
                        <option value="Other">Other</option>
                    </select>
                    <input
                        type="number"
                        placeholder="Quantity"
                        className="input-field"
                        value={form.quantity}
                        onChange={e => setForm({ ...form, quantity: e.target.value })}
                    />
                    <textarea
                        placeholder="Reason (e.g. Broken, Expired)"
                        className="input-field md:col-span-2"
                        rows="2"
                        value={form.reason}
                        onChange={e => setForm({ ...form, reason: e.target.value })}
                    ></textarea>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="md:col-span-2 btn-primary flex justify-center items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Plus size={18} />}
                        Log Wastage
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <h4 className="text-sm font-bold text-enzi-muted uppercase tracking-wider">Today's Logs</h4>
                {logs.length === 0 && <p className="text-sm text-enzi-muted italic">No wastage logged yet.</p>}
                {logs.map(log => (
                    <div key={log.id} className="bg-enzi-black p-3 rounded-lg flex justify-between items-center shadow-sm border border-enzi-muted/10">
                        <div>
                            <p className="font-semibold text-enzi-text">{log.item_type} <span className="text-sm font-normal text-enzi-muted">x{log.quantity}</span></p>
                            <p className="text-xs text-red-400">{log.reason}</p>
                        </div>
                        <span className="text-xs text-enzi-muted/50 font-mono">
                            {new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function RestockSection({ activeShift }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        item_name: '',
        current_quantity: '',
        supplier: ''
    });

    const fetchRequests = async () => {
        const { data, error } = await supabase
            .from('restock_requests')
            .select('*')
            .eq('shift_id', activeShift.id)
            .order('created_at', { ascending: false });

        if (data) setRequests(data);
    };

    useEffect(() => {
        fetchRequests();
    }, [activeShift.id]);

    const handleSubmit = async () => {
        if (!form.item_name) return;
        setLoading(true);

        try {
            const { error } = await supabase.from('restock_requests').insert([
                {
                    shift_id: activeShift.id,
                    item_name: form.item_name,
                    current_quantity: form.current_quantity ? parseInt(form.current_quantity) : null,
                    supplier: form.supplier
                }
            ]);

            if (error) throw error;
            setForm({ item_name: '', current_quantity: '', supplier: '' });
            fetchRequests();
        } catch (error) {
            console.error("Error requesting restock:", error);
            alert("Failed to request restock");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="card-panel p-6">
                <h3 className="font-bold mb-4 text-enzi-text">Request Restock</h3>
                <div className="grid gap-4">
                    <input
                        type="text"
                        placeholder="Item Name (e.g. Oat Milk)"
                        className="input-field"
                        value={form.item_name}
                        onChange={e => setForm({ ...form, item_name: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="number"
                            placeholder="Current Qty"
                            className="input-field"
                            value={form.current_quantity}
                            onChange={e => setForm({ ...form, current_quantity: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Supplier"
                            className="input-field"
                            value={form.supplier}
                            onChange={e => setForm({ ...form, supplier: e.target.value })}
                        />
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="btn-primary flex justify-center items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <PackagePlus size={18} />}
                        Submit Request
                    </button>
                </div>
            </div>

            <div className="card-panel p-4">
                <h4 className="font-bold mb-3 text-sm text-enzi-text">Pending Orders</h4>
                {requests.length === 0 && <div className="text-sm text-enzi-muted italic">No pending orders.</div>}

                <div className="space-y-2">
                    {requests.map(req => (
                        <div key={req.id} className="flex justify-between items-center text-sm border-b border-enzi-muted/10 pb-2 last:border-0 last:pb-0">
                            <div>
                                <span className="font-medium text-enzi-text">{req.item_name}</span>
                                {req.current_quantity && <span className="text-enzi-muted ml-2">(Qty: {req.current_quantity})</span>}
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${req.status === 'pending' ? 'bg-yellow-900/30 text-yellow-500' :
                                req.status === 'ordered' ? 'bg-blue-900/30 text-blue-400' : 'bg-green-900/30 text-green-400'
                                }`}>
                                {req.status.toUpperCase()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function MaintenanceSection({ activeShift }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState({
        category: '',
        issue_description: ''
    });

    const handleSubmit = async () => {
        if (!form.equipment_name || !form.issue_description) return;
        setLoading(true);
        setSuccess(false);

        try {
            const { error } = await supabase.from('maintenance_tickets').insert([
                {
                    location_id: activeShift.location_id,
                    equipment_name: form.category, // Using equipment_name for category compatibility
                    issue_description: form.issue_description,
                    status: 'open'
                }
            ]);

            if (error) throw error;
            setForm({ category: '', issue_description: '' });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Error submitting ticket:", error);
            alert("Failed to submit ticket");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="card-panel p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-enzi-text">
                    <AlertTriangle className="w-5 h-5 text-enzi-gold" /> Report Issue
                </h3>
                <div className="grid gap-4">
                    <select
                        className="input-field"
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
                    <textarea
                        placeholder="Describe the issue..."
                        className="input-field"
                        rows="3"
                        value={form.issue_description}
                        onChange={e => setForm({ ...form, issue_description: e.target.value })}
                    ></textarea>

                    {success && (
                        <div className="p-3 bg-green-900/30 text-green-400 border border-green-900/50 rounded-lg flex items-center gap-2 text-sm">
                            <Check size={16} /> Ticket submitted successfully!
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="btn-primary flex justify-center items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Wrench size={18} />}
                        Log Ticket
                    </button>
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
