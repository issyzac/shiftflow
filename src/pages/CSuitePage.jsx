export default function CSuitePage() {
    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-espresso-900">C-Suite Portal</h1>
                <p className="text-sm opacity-60">Overview & Management</p>
            </header>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Task Dispatcher */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-espresso-100/50">
                    <h2 className="text-lg font-bold mb-4">Task Dispatcher</h2>
                    <div className="space-y-4">
                        <input type="text" placeholder="Task Title" className="w-full p-2 border rounded" />
                        <textarea placeholder="Description" className="w-full p-2 border rounded" rows="3"></textarea>
                        <div className="flex gap-2">
                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" /> All Locations</label>
                        </div>
                        <button className="w-full py-2 bg-espresso-900 text-white rounded hover:bg-espresso-900/90">Dispatch Task</button>
                    </div>
                </section>

                {/* Audit Dashboard */}
                <section className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-espresso-100/50">
                        <h2 className="text-lg font-bold mb-2">Live Wastage Feed</h2>
                        <div className="space-y-2">
                            <div className="text-sm border-l-4 border-red-500 pl-3 py-1">
                                <span className="font-bold">Croissant (Almond)</span>
                                <span className="block text-xs text-gray-500">Mbezi • 09:30 AM • Expired</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-espresso-100/50">
                        <h2 className="text-lg font-bold mb-2">Maintenance Status</h2>
                        <div className="text-sm flex justify-between items-center bg-amber-50 p-3 rounded">
                            <span>Grinder 1 (Victoria)</span>
                            <span className="px-2 py-0.5 bg-amber-200 text-amber-800 rounded text-xs font-bold">OPEN</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
