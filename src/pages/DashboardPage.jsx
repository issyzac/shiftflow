import { useState } from 'react';
import { ClipboardList, Trash2, Wrench, PackagePlus, AlertTriangle, Plus, History } from 'lucide-react';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState('wastage');

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center bg-white/50 p-4 rounded-xl border border-espresso-100/50 backdrop-blur-sm">
                <div>
                    <h2 className="text-xl font-bold text-espresso-900">Barista Dashboard</h2>
                    <p className="text-sm text-espresso-900/60">Shift Active • BIC: Michael Chen</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-mono font-bold text-espresso-900">11:42 AM</div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="flex gap-2 p-1 bg-espresso-900/5 rounded-lg overflow-x-auto">
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
                    icon={<Wrench size={18} />}
                    label="Maintenance"
                />
            </div>

            <div className="min-h-[400px]">
                {activeTab === 'wastage' && <WastageSection />}
                {activeTab === 'restock' && <RestockSection />}
                {activeTab === 'maintenance' && <MaintenanceSection />}
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-all font-medium text-sm whitespace-nowrap
        ${active
                    ? 'bg-white shadow-sm text-espresso-900'
                    : 'text-espresso-900/60 hover:text-espresso-900 hover:bg-white/50'
                }`}
        >
            {icon}
            {label}
        </button>
    );
}

/* --- Sections --- */

function WastageSection() {
    const [logs, setLogs] = useState([
        { id: 1, item: 'Croissant (Almond)', time: '09:30 AM', reason: 'Expired (>48h)', type: 'Pastry' }
    ]);

    return (
        <div className="space-y-4">
            {/* Alert Banner Example */}
            <div className="bg-red-50 border border-red-100 p-4 rounded-lg flex gap-3 text-red-800 animate-pulse-slow">
                <AlertTriangle className="shrink-0" />
                <div>
                    <p className="font-bold text-sm">Action Required</p>
                    <p className="text-xs mt-1">2 Open Sparkling Water bottles expire in 15 mins.</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-espresso-100/50">
                <h3 className="font-bold mb-4 flex items-center gap-2">Log New Wastage</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <select className="input-field">
                        <option>Select Item Type...</option>
                        <option>Pastry</option>
                        <option>Milk/Dairy</option>
                        <option>Espresso Beans</option>
                    </select>
                    <input type="number" placeholder="Quantity" className="input-field" />
                    <textarea placeholder="Reason (e.g. Broken, Expired)" className="input-field md:col-span-2" rows="2"></textarea>
                    <button className="md:col-span-2 btn-primary flex justify-center items-center gap-2">
                        <Plus size={18} /> Log Wastage
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <h4 className="text-sm font-bold text-espresso-900/50 uppercase tracking-wider">Today's Logs</h4>
                {logs.map(log => (
                    <div key={log.id} className="bg-white p-3 rounded-lg flex justify-between items-center shadow-sm">
                        <div>
                            <p className="font-semibold">{log.item}</p>
                            <p className="text-xs text-red-500">{log.reason}</p>
                        </div>
                        <span className="text-xs text-gray-400 font-mono">{log.time}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function RestockSection() {
    return (
        <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-espresso-100/50">
                <h3 className="font-bold mb-4">Request Restock</h3>
                <div className="grid gap-4">
                    <input type="text" placeholder="Item Name (e.g. Oat Milk)" className="input-field" />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" placeholder="Current Qty" className="input-field" />
                        <input type="text" placeholder="Supplier" className="input-field" />
                    </div>
                    <button className="btn-primary">Submit Request</button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100">
                <h4 className="font-bold mb-3 text-sm">Pending Orders</h4>
                <div className="text-sm text-gray-500 italic">No pending orders.</div>
            </div>
        </div>
    );
}

function MaintenanceSection() {
    return (
        <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-espresso-100/50">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Wrench className="w-5 h-5" /> Report Issue
                </h3>
                <div className="grid gap-4">
                    <select className="input-field">
                        <option>Select Equipment...</option>
                        <option>La Marzocco (Main)</option>
                        <option>Grinder 1 (House)</option>
                        <option>Dishwasher</option>
                        <option>Generic/Facility</option>
                    </select>
                    <textarea placeholder="Describe the issue..." className="input-field" rows="3"></textarea>
                    <button className="btn-primary bg-amber-600 hover:bg-amber-700">Log Ticket</button>
                </div>
            </div>
        </div>
    );
}
