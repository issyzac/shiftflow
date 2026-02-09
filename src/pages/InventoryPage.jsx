import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Package, Trash2, Save, Loader2, CheckCircle2, PackagePlus, Check, MapPin } from 'lucide-react';

export default function InventoryPage() {
    const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'catalog'
    const [items, setItems] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        if (activeTab === 'catalog') {
            fetchItems();
        } else {
            fetchRequests();
        }
    }, [activeTab]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('inventory_items')
                .select('*')
                .order('name');

            if (error) throw error;
            setItems(data || []);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('restock_requests')
                .select(`
                    *,
                    locations (name)
                `)
                .neq('status', 'fulfilled')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequests(data || []);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFulfill = async (requestId) => {
        if (!window.confirm('Mark this item as fulfilled? This will remove it from the active list.')) return;

        try {
            const { error } = await supabase
                .from('restock_requests')
                .update({ status: 'fulfilled' })
                .eq('id', requestId);

            if (error) throw error;
            fetchRequests();
        } catch (error) {
            console.error('Error fulfilling request:', error);
            alert('Failed to fulfill request');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            const { error } = await supabase
                .from('inventory_items')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchItems();
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('Failed to delete item');
        }
    };

    const handleSeed = async () => {
        if (!window.confirm('This will add default items (Milk, Beans, Syrups) to the inventory. Continue?')) return;
        setLoading(true);

        const defaultItems = [
            { name: 'Whole Milk', category: 'Dairy', unit: 'L' },
            { name: 'Oat Milk', category: 'Dairy', unit: 'L' },
            { name: 'Almond Milk', category: 'Dairy', unit: 'L' },
            { name: 'Espresso Beans', category: 'Coffee', unit: 'kg' },
            { name: 'Decaf Beans', category: 'Coffee', unit: 'kg' },
            { name: 'Vanilla Syrup', category: 'Syrup', unit: 'bottle' },
            { name: 'Caramel Syrup', category: 'Syrup', unit: 'bottle' },
            { name: 'Paper Cups (12oz)', category: 'Supplies', unit: 'sleeve' },
            { name: 'Paper Cups (8oz)', category: 'Supplies', unit: 'sleeve' },
            { name: 'Lids', category: 'Supplies', unit: 'sleeve' },
            { name: 'Napkins', category: 'Supplies', unit: 'pack' },
            { name: 'Sugar', category: 'Condiments', unit: 'kg' },
        ];

        try {
            const { error } = await supabase
                .from('inventory_items')
                .upsert(defaultItems, { onConflict: 'name' }); // Prevent duplicates based on name unique constraint

            if (error) throw error;
            fetchItems();
            alert('Default items added successfully!');
        } catch (error) {
            console.error('Error seeding items:', error);
            alert('Failed to seed items. ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <header className="flex items-center gap-4 mb-8">
                <Link to="/core" className="p-2 rounded-full hover:bg-white/5 text-enzi-muted hover:text-enzi-text transition">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-enzi-text">Inventory Manager</h1>
                    <p className="text-sm text-enzi-muted">Overview of requests & stock catalog</p>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex gap-1 bg-white/5 p-1 rounded-lg w-full max-w-md">
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-bold transition flex items-center justify-center gap-2 ${activeTab === 'requests' ? 'bg-enzi-gold text-enzi-black shadow-sm' : 'text-enzi-muted hover:text-enzi-text hover:bg-white/5'
                        }`}
                >
                    <PackagePlus size={16} /> Restock Requests
                    {requests.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{requests.length}</span>}
                </button>
                <button
                    onClick={() => setActiveTab('catalog')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-bold transition flex items-center justify-center gap-2 ${activeTab === 'catalog' ? 'bg-enzi-gold text-enzi-black shadow-sm' : 'text-enzi-muted hover:text-enzi-text hover:bg-white/5'
                        }`}
                >
                    <Package size={16} /> Item Catalog
                </button>
            </div>

            {activeTab === 'requests' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {loading ? (
                        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-enzi-muted" size={32} /></div>
                    ) : requests.length === 0 ? (
                        <div className="card-panel p-12 text-center border-dashed">
                            <CheckCircle2 className="mx-auto text-green-500/50 mb-3" size={48} />
                            <p className="text-xl font-bold text-enzi-text">All Caught Up!</p>
                            <p className="text-enzi-muted mt-1">No pending restock requests from any location.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {requests.map(req => (
                                <div key={req.id} className="card-panel p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-bold text-enzi-text">{req.item_name}</h3>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${req.status === 'ordered' ? 'bg-blue-900/30 text-blue-400 border border-blue-900/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                }`}>
                                                {req.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-enzi-muted flex flex-wrap gap-x-4 gap-y-1">
                                            <span className="flex items-center gap-1"><MapPin size={14} /> {req.locations?.name || 'Unknown Location'}</span>
                                            {req.current_quantity && <span>Current Qty: {req.current_quantity}</span>}
                                            <span>Requested: {new Date(req.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleFulfill(req.id)}
                                        className="btn-primary py-2 px-4 text-sm whitespace-nowrap flex items-center gap-2"
                                    >
                                        <Check size={16} strokeWidth={3} /> Mark Fulfilled
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'catalog' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div className="relative flex-1 w-full sm:w-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-enzi-muted" size={18} />
                            <input
                                type="text"
                                placeholder="Search inventory..."
                                className="input-field pl-10 w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                onClick={handleSeed}
                                className="px-4 py-2 border border-enzi-muted/30 text-enzi-muted hover:text-enzi-text hover:bg-white/5 rounded-lg text-sm font-semibold transition"
                            >
                                Seed Defaults
                            </button>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="btn-primary flex items-center justify-center gap-2 px-4 py-2 text-sm flex-1 sm:flex-initial"
                            >
                                <Plus size={18} />
                                Add Item
                            </button>
                        </div>
                    </div>

                    <div className="card-panel p-0 overflow-hidden min-h-[400px]">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="animate-spin text-enzi-muted" size={32} />
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-enzi-muted">
                                <Package size={48} className="mb-4 opacity-20" />
                                <p className="text-lg font-medium">No items found</p>
                                <p className="text-sm opacity-60">Add a new item or seed defaults to get started.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-enzi-muted/10">
                                {filteredItems.map(item => (
                                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-enzi-gold/10 flex items-center justify-center text-enzi-gold">
                                                <Package size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-enzi-text">{item.name}</h3>
                                                <p className="text-xs text-enzi-muted flex gap-2">
                                                    <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                                                        {item.category || 'Uncategorized'}
                                                    </span>
                                                    <span className="opacity-60">Unit: {item.unit}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 text-enzi-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            title="Delete Item"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showAddModal && (
                <AddItemModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        fetchItems();
                    }}
                />
            )}
        </div>
    );
}

function AddItemModal({ onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        category: '',
        unit: 'unit'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('inventory_items')
                .insert([form]);

            if (error) throw error;
            onSuccess();
        } catch (error) {
            console.error('Error adding item:', error);
            alert('Failed to add item: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="card-panel p-6 max-w-sm w-full animate-in zoom-in-95 duration-200 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-enzi-muted hover:text-enzi-text"
                >
                    <Plus size={24} className="rotate-45" />
                </button>

                <h2 className="text-xl font-bold text-enzi-text mb-6 flex items-center gap-2">
                    <Plus className="text-enzi-gold" /> Add Inventory Item
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-enzi-muted uppercase">Item Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Oat Milk"
                            className="input-field w-full"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-enzi-muted uppercase">Category</label>
                            <select
                                className="input-field w-full"
                                value={form.category}
                                onChange={e => setForm({ ...form, category: e.target.value })}
                            >
                                <option value="">Select...</option>
                                <option value="Dairy">Dairy</option>
                                <option value="Coffee">Coffee</option>
                                <option value="Syrup">Syrup</option>
                                <option value="Supplies">Supplies</option>
                                <option value="Condiments">Condiments</option>
                                <option value="Food">Food</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-enzi-muted uppercase">Unit</label>
                            <input
                                type="text"
                                placeholder="e.g. L, kg, box"
                                className="input-field w-full"
                                value={form.unit}
                                onChange={e => setForm({ ...form, unit: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || !form.name}
                            className="btn-primary w-full flex justify-center items-center gap-2 py-2.5"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            Save Item
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
