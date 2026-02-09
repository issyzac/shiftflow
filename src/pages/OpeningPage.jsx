import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { CheckCircle, AlertCircle, Coffee, Wifi, CreditCard, Monitor } from 'lucide-react';

export default function OpeningPage() {
    const navigate = useNavigate();
    const { user, refreshShift } = useAuth();
    const [step, setStep] = useState(1);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form Data
    const [selectedLocationId, setSelectedLocationId] = useState('');
    const [briefingRead, setBriefingRead] = useState(false);
    const [briefingItems, setBriefingItems] = useState([]);
    const [systems, setSystems] = useState({
        pos: false,
        wifi: '',
        float: false,
        electricity: ''
    });

    useEffect(() => {
        const fetchLocations = async () => {
            const { data } = await supabase.from('locations').select('*');
            if (data && data.length > 0) {
                setLocations(data);
            } else {
                console.log("No locations found. Run migrations/02_seed_mock_data.sql");
            }
        };
        fetchLocations();
    }, []);

    useEffect(() => {
        if (selectedLocationId) {
            fetchBriefingItems(selectedLocationId);
        } else {
            setBriefingItems([]);
        }
    }, [selectedLocationId]);

    const fetchBriefingItems = async (locationId) => {
        const { data } = await supabase
            .from('briefing_items')
            .select('*')
            .eq('location_id', locationId)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (data) setBriefingItems(data);
    };

    const handleSystemCheck = (key) => {
        setSystems(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const canProceedToBriefing = !!selectedLocationId;
    const canProceedToSystems = briefingRead;
    const canStartShift = systems.pos && systems.float && systems.wifi && systems.electricity;

    const startShift = async () => {
        if (!canStartShift) return;
        setLoading(true);

        try {
            // Create Shift in Supabase
            const { data, error } = await supabase.from('shifts').insert([
                {
                    location_id: selectedLocationId.startsWith('mock') ? null : selectedLocationId,
                    bic_id: user.id,
                    start_time: new Date().toISOString(),
                    cash_float_verified: systems.float,
                    pos_working: systems.pos,
                    wifi_speed: systems.wifi,
                    electricity_units: parseFloat(systems.electricity),
                    briefing_completed: briefingRead
                }
            ]).select();

            if (error) throw error;

            // Handle One-time briefing items: Archive them for this location
            // We assume if the user briefed the team, the 'once' items are consumed.
            const oneTimeItems = briefingItems.filter(i => i.recurrence === 'once');
            if (oneTimeItems.length > 0) {
                await supabase
                    .from('briefing_items')
                    .update({ is_active: false })
                    .in('id', oneTimeItems.map(i => i.id));
            }

            if (error) throw error;

            console.log('Shift started:', data);

            // Refresh context to update 'activeShift'
            await refreshShift();

            // Navigation handled by App.jsx based on activeShift, but we can push just in case
            navigate('/dashboard');
        } catch (error) {
            console.error('Error starting shift:', error);
            alert('Failed to start shift. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null; // Should be handled by parent, but safety check

    return (
        <div className="space-y-6">
            <div className="card-panel p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-enzi-text">
                    <Coffee className="w-6 h-6 text-enzi-gold" /> Shift Initiation
                </h2>

                {/* Step 1: Location & BIC */}
                <div className={`space-y-4 transition-all duration-300 ${step === 1 ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-enzi-muted">Select Location</label>
                            <select
                                className="input-field"
                                value={selectedLocationId}
                                onChange={(e) => setSelectedLocationId(e.target.value)}
                            >
                                <option value="">-- Choose Location --</option>
                                {locations.map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-enzi-muted opacity-70">Barista in Charge (BIC)</label>
                            <input
                                type="text"
                                value={user.name}
                                disabled
                                className="input-field opacity-60 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {step === 1 && (
                        <button
                            onClick={() => setStep(2)}
                            disabled={!canProceedToBriefing}
                            className="w-full py-3 bg-espresso-900 text-white rounded-lg font-semibold disabled:opacity-50 hover:bg-espresso-900/90 transition"
                        >
                            Next: Morning Briefing
                        </button>
                    )}
                </div>
            </div>

            {/* Step 2: Morning Briefing */}
            {step >= 2 && (
                <div className={`card-panel p-6 transition-all duration-300 ${step === 2 ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-enzi-text">
                        <AlertCircle className="w-5 h-5 text-amber-500" /> Morning Briefing
                    </h3>
                    <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-900/40 mb-4">
                        <h4 className="font-semibold text-amber-400 mb-2">Shift Briefing Points:</h4>
                        {briefingItems.length === 0 ? (
                            <p className="text-sm text-enzi-muted italic">No specific briefing items for this location today.</p>
                        ) : (
                            <ul className="space-y-2">
                                {briefingItems.map(item => (
                                    <li key={item.id} className="flex items-start gap-2 text-sm text-amber-100/90">
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-0.5 ${item.recurrence === 'recurring' ? 'bg-blue-900/50 text-blue-300' : 'bg-purple-900/50 text-purple-300'
                                            }`}>
                                            {item.recurrence === 'recurring' ? 'Repeat' : 'Once'}
                                        </span>
                                        <span>{item.content}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="flex items-center gap-3 p-3 border border-enzi-muted/20 rounded-lg hover:bg-white/5 cursor-pointer transition" onClick={() => setBriefingRead(!briefingRead)}>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${briefingRead ? 'bg-green-600 border-green-600' : 'border-enzi-muted'}`}>
                            {briefingRead && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                        <span className="font-medium text-enzi-text">I verify that the team has been briefed.</span>
                    </div>

                    {step === 2 && (
                        <button
                            onClick={() => setStep(3)}
                            disabled={!canProceedToSystems}
                            className="btn-primary mt-4 disabled:opacity-50"
                        >
                            Next: System Checks
                        </button>
                    )}
                </div>
            )}

            {/* Step 3: Systems Verification */}
            {step >= 3 && (
                <div className="card-panel p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-enzi-text">
                        <Monitor className="w-5 h-5 text-enzi-gold" /> Systems Check
                    </h3>
                    <div className="space-y-6 mb-6">
                        {/* 1. POS Status */}
                        <div className="p-4 rounded-xl border border-enzi-muted/20 bg-white/5">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 rounded border-enzi-muted text-enzi-gold focus:ring-enzi-gold bg-enzi-black"
                                    checked={systems.pos}
                                    onChange={(e) => setSystems(prev => ({ ...prev, pos: e.target.checked }))}
                                />
                                <div className="flex items-center gap-2">
                                    <Monitor className={systems.pos ? "text-enzi-gold" : "text-enzi-muted"} size={20} />
                                    <span className="text-enzi-text font-medium">POS Terminals are working</span>
                                </div>
                            </label>
                        </div>

                        {/* 2. Wifi Speed */}
                        <div className="p-4 rounded-xl border border-enzi-muted/20 bg-white/5">
                            <h4 className="text-sm font-bold text-enzi-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Wifi size={16} /> Wifi Connection
                            </h4>
                            <div className="grid grid-cols-3 gap-3">
                                {['fast', 'normal', 'slow'].map(speed => (
                                    <button
                                        key={speed}
                                        onClick={() => setSystems(prev => ({ ...prev, wifi: speed }))}
                                        className={`py-2 px-3 rounded-lg text-sm font-bold capitalize transition-all border ${
                                            systems.wifi === speed 
                                            ? 'bg-enzi-gold text-enzi-black border-enzi-gold' 
                                            : 'bg-transparent text-enzi-muted border-enzi-muted/30 hover:border-enzi-gold/50'
                                        }`}
                                    >
                                        {speed}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. Float Verification */}
                        <div className="p-4 rounded-xl border border-enzi-muted/20 bg-white/5">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 rounded border-enzi-muted text-enzi-gold focus:ring-enzi-gold bg-enzi-black"
                                    checked={systems.float}
                                    onChange={(e) => setSystems(prev => ({ ...prev, float: e.target.checked }))}
                                />
                                <div className="flex items-center gap-2">
                                    <span className="text-enzi-gold font-bold text-lg">$</span>
                                    <span className="text-enzi-text font-medium">I have counted and verified the Cash Float</span>
                                </div>
                            </label>
                        </div>

                        {/* 4. Electricity Units */}
                        <div className="p-4 rounded-xl border border-enzi-muted/20 bg-white/5">
                             <h4 className="text-sm font-bold text-enzi-muted uppercase tracking-wider mb-2 flex items-center gap-2">
                                ⚡ Electricity
                            </h4>
                            <input 
                                type="number" 
                                placeholder="Enter units (e.g. 145.5)"
                                className="input-field"
                                value={systems.electricity}
                                onChange={(e) => setSystems(prev => ({ ...prev, electricity: e.target.value }))}
                            />
                        </div>
                    </div>

                    <button
                        onClick={startShift}
                        disabled={!canStartShift || loading}
                        className="w-full py-4 bg-green-600 text-white rounded-lg font-bold text-lg shadow-lg disabled:opacity-50 hover:bg-green-700 transition transform hover:scale-[1.02] flex items-center justify-center"
                    >
                        {loading ? 'Starting...' : 'Start Shift'}
                    </button>
                </div>
            )}
        </div>
    );
}



