import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, CheckCircle2, Send, MapPin, ListTodo, AlertTriangle, ClipboardList, ArrowLeft, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CommunicationsPage() {
    const { user } = useAuth();
    const [locations, setLocations] = useState([]);
    const [loadingLocations, setLoadingLocations] = useState(true);

    // Briefing Form State
    const [briefingContent, setBriefingContent] = useState('');
    const [recurrence, setRecurrence] = useState('one_time'); // 'recurring' | 'once'
    const [briefingLocation, setBriefingLocation] = useState('all');
    const [isPostingBriefing, setIsPostingBriefing] = useState(false);
    const [briefingStatus, setBriefingStatus] = useState(null);

    // Task Dispatcher Form State
    const [taskText, setTaskText] = useState('');
    const [taskCategory, setTaskCategory] = useState('general'); // 'general', 'maintenance', 'adhoc'
    const [taskLocation, setTaskLocation] = useState('all');
    const [isDispatchingTask, setIsDispatchingTask] = useState(false);
    const [taskStatus, setTaskStatus] = useState(null);

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

    const handlePostBriefing = async (e) => {
        e.preventDefault();
        if (!briefingContent.trim()) return;

        setIsPostingBriefing(true);
        setBriefingStatus(null);

        try {
            const itemsToInsert = [];
            const createdByName = user?.name || 'Core System';

            const targets = briefingLocation === 'all'
                ? locations
                : locations.filter(l => l.id === briefingLocation);

            targets.forEach(loc => {
                itemsToInsert.push({
                    location_id: loc.id,
                    content: briefingContent,
                    recurrence: recurrence === 'recurring' ? 'recurring' : 'once',
                    is_active: true,
                    created_by_name: createdByName
                });
            });

            const { error } = await supabase.from('briefing_items').insert(itemsToInsert);
            if (error) throw error;

            setBriefingStatus('success');
            setBriefingContent('');
            setTimeout(() => setBriefingStatus(null), 3000);
        } catch (err) {
            console.error('Error posting briefing:', err);
            setBriefingStatus('error');
        } finally {
            setIsPostingBriefing(false);
        }
    };

    const handleDispatchTask = async (e) => {
        e.preventDefault();
        if (!taskText.trim()) return;

        setIsDispatchingTask(true);
        setTaskStatus(null);

        try {
            const tasksToInsert = [];
            const assignedBy = user?.name || 'Core';

            const targets = taskLocation === 'all'
                ? locations
                : locations.filter(l => l.id === taskLocation);

            targets.forEach(loc => {
                tasksToInsert.push({
                    location_id: loc.id,
                    task_text: taskText,
                    category: taskCategory,
                    assigned_by: assignedBy,
                    is_completed: false
                });
            });

            const { error } = await supabase.from('location_tasks').insert(tasksToInsert);
            if (error) throw error;

            setTaskStatus('success');
            setTaskText('');
            setTimeout(() => setTaskStatus(null), 3000);
        } catch (err) {
            console.error('Error dispatching task:', err);
            setTaskStatus('error');
        } finally {
            setIsDispatchingTask(false);
        }
    };

    return (
        <div className="space-y-6">
            <header className="mb-4">
                <Link to="/core" className="flex items-center gap-2 text-enzi-muted hover:text-enzi-gold transition mb-4 text-sm font-medium">
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-enzi-card rounded-xl border border-enzi-muted/20">
                        <MessageSquare className="text-enzi-gold" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-enzi-text">Communications Hub</h1>
                        <p className="text-sm text-enzi-muted">Manage Briefings & Operational Tasks</p>
                    </div>
                </div>
            </header>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* 1. Shift Briefing Manager */}
                <section className="card-panel p-6 flex flex-col h-full border-t-4 border-t-blue-500">
                    <h2 className="text-lg font-bold mb-4 text-enzi-text flex items-center gap-2">
                        <ClipboardList className="text-blue-400" size={20} />
                        Shift Briefing Manager
                    </h2>
                    <p className="text-xs text-enzi-muted mb-4">
                        Points added here appear in the "Shift Initiation" flow during opening. Use for alignment, updates, and goals.
                    </p>

                    <form onSubmit={handlePostBriefing} className="space-y-4 flex-1 flex flex-col">
                        <div>
                            <label className="block text-xs font-bold text-enzi-muted uppercase tracking-widest mb-1.5 ml-1">Briefing Content</label>
                            <textarea
                                placeholder="E.g. Check the new espresso machine, Upsell the seasonal blend..."
                                className="input-field min-h-[120px] resize-none focus:border-blue-500/50"
                                rows="3"
                                value={briefingContent}
                                onChange={(e) => setBriefingContent(e.target.value)}
                                required
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-enzi-muted uppercase tracking-widest mb-1.5 ml-1">Recurrence</label>
                            <div className="flex gap-4 p-3 bg-white/5 rounded-lg border border-enzi-muted/20">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="coreRecurrence"
                                        value="recurring"
                                        checked={recurrence === 'recurring'}
                                        onChange={() => setRecurrence('recurring')}
                                        className="text-blue-500 focus:ring-blue-500 bg-enzi-black border-enzi-muted/30"
                                    />
                                    <span className="text-sm text-enzi-text">Repeats Daily</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="coreRecurrence"
                                        value="once"
                                        checked={recurrence === 'once'}
                                        onChange={() => setRecurrence('once')}
                                        className="text-blue-500 focus:ring-blue-500 bg-enzi-black border-enzi-muted/30"
                                    />
                                    <span className="text-sm text-enzi-text">One-Time (Next Shift)</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-enzi-muted uppercase tracking-widest mb-1.5 ml-1">Target Location</label>
                            <div className="relative">
                                <select
                                    className="input-field appearance-none pl-10 focus:border-blue-500/50"
                                    value={briefingLocation}
                                    onChange={(e) => setBriefingLocation(e.target.value)}
                                    disabled={loadingLocations}
                                >
                                    <option value="all">Broadcast to All Locations</option>
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                                    ))}
                                </select>
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                            </div>
                        </div>

                        {briefingStatus === 'success' && (
                            <div className="flex items-center gap-2 text-green-400 text-sm font-medium bg-green-400/10 p-3 rounded-lg border border-green-400/20">
                                <CheckCircle2 size={18} />
                                Briefing posted successfully!
                            </div>
                        )}
                        {briefingStatus === 'error' && (
                            <div className="flex items-center gap-2 text-red-400 text-sm font-medium bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                                <AlertTriangle size={18} />
                                Failed to post briefing.
                            </div>
                        )}

                        <div className="mt-auto pt-4">
                            <button
                                type="submit"
                                disabled={isPostingBriefing || !briefingContent.trim()}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex justify-center items-center gap-2 font-bold transition disabled:opacity-50"
                            >
                                {isPostingBriefing ? <Loader2 className="animate-spin" size={20} /> : <Send size={18} />}
                                Post Briefing
                            </button>
                        </div>
                    </form>
                </section>

                {/* 2. Task Dispatcher */}
                <section className="card-panel p-6 flex flex-col h-full border-t-4 border-t-enzi-gold">
                    <h2 className="text-lg font-bold mb-4 text-enzi-text flex items-center gap-2">
                        <ListTodo className="text-enzi-gold" size={20} />
                        Operational Task Dispatch
                    </h2>
                    <p className="text-xs text-enzi-muted mb-4">
                        Create actionable checklists for the Barista Dashboard (e.g., Clean Filters, Count Stock).
                    </p>

                    <form onSubmit={handleDispatchTask} className="space-y-4 flex-1 flex flex-col">
                        <div>
                            <label className="block text-xs font-bold text-enzi-muted uppercase tracking-widest mb-1.5 ml-1">Task Description</label>
                            <textarea
                                placeholder="E.g. Deep clean the steam wand, Count all paper cups..."
                                className="input-field min-h-[120px] resize-none"
                                rows="3"
                                value={taskText}
                                onChange={(e) => setTaskText(e.target.value)}
                                required
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-enzi-muted uppercase tracking-widest mb-1.5 ml-1">Category</label>
                            <select
                                className="input-field"
                                value={taskCategory}
                                onChange={(e) => setTaskCategory(e.target.value)}
                            >
                                <option value="general">General</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="cleaning">Cleaning</option>
                                <option value="adhoc">Ad-Hoc / Urgent</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-enzi-muted uppercase tracking-widest mb-1.5 ml-1">Target Location</label>
                            <div className="relative">
                                <select
                                    className="input-field appearance-none pl-10"
                                    value={taskLocation}
                                    onChange={(e) => setTaskLocation(e.target.value)}
                                    disabled={loadingLocations}
                                >
                                    <option value="all">Assign to All Locations</option>
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                                    ))}
                                </select>
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-enzi-gold" size={18} />
                            </div>
                        </div>

                        {taskStatus === 'success' && (
                            <div className="flex items-center gap-2 text-green-400 text-sm font-medium bg-green-400/10 p-3 rounded-lg border border-green-400/20">
                                <CheckCircle2 size={18} />
                                Task dispatched successfully!
                            </div>
                        )}
                        {taskStatus === 'error' && (
                            <div className="flex items-center gap-2 text-red-400 text-sm font-medium bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                                <AlertTriangle size={18} />
                                Failed to dispatch task.
                            </div>
                        )}

                        <div className="mt-auto pt-4">
                            <button
                                type="submit"
                                disabled={isDispatchingTask || !taskText.trim()}
                                className="btn-primary w-full flex justify-center items-center gap-2"
                            >
                                {isDispatchingTask ? <Loader2 className="animate-spin" size={20} /> : <ListTodo size={18} />}
                                Dispatch Task
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}
