import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { CheckCircle, AlertCircle, Coffee, Wifi, Monitor, Zap, Package, ClipboardCheck } from 'lucide-react';

export default function OpeningPage() {
    const navigate = useNavigate();
    const { user, refreshShift } = useAuth();
    const [step, setStep] = useState(1);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form Data
    const [selectedLocationId, setSelectedLocationId] = useState('');
    const shiftType = useAuth().intendedShiftType; // 'morning' | 'afternoon'
    const [briefingRead, setBriefingRead] = useState(false);
    const [briefingItems, setBriefingItems] = useState([]);

    // Previous Shift Details
    const [prevShift, setPrevShift] = useState(null);
    const [shiftError, setShiftError] = useState('');

    // Thematic Checklist State
    const [checklist, setChecklist] = useState({
        utilities: { electricity: '', wifi: '', lights_ac: false, notes: '' },
        equipment: { pos: false, espresso_machine: false, grinders: false, notes: '' },
        supplies: { cups_lids: false, milk: false, pastries: false, notes: '' },
        admin: { float: false, cleanliness: false, notes: '' }
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
            fetchPreviousShift(selectedLocationId);
        } else {
            setBriefingItems([]);
            setPrevShift(null);
            setShiftError('');
        }
    }, [selectedLocationId]);

    const fetchPreviousShift = async (locationId) => {
        setShiftError('');
        const { data } = await supabase
            .from('shifts')
            .select('*')
            .eq('location_id', locationId)
            .order('start_time', { ascending: false })
            .limit(1);

        if (data && data.length > 0) {
            setPrevShift(data[0]);
        } else {
            setPrevShift(null);
        }
    };

    const fetchBriefingItems = async (locationId) => {
        const { data } = await supabase
            .from('briefing_items')
            .select('*')
            .eq('location_id', locationId)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (data) setBriefingItems(data);
    };

    const updateChecklist = (category, field, value) => {
        setChecklist(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value
            }
        }));
    };

    const canProceedToBriefing = !!selectedLocationId;
    const canProceedToSystems = briefingRead;

    // Evaluate if shift can start
    const isUtilitiesDone = checklist.utilities.electricity !== '' && checklist.utilities.wifi !== '' && checklist.utilities.lights_ac;
    const isEquipmentDone = checklist.equipment.pos && checklist.equipment.espresso_machine && checklist.equipment.grinders;
    const isSuppliesDone = checklist.supplies.cups_lids && checklist.supplies.milk && checklist.supplies.pastries;
    const isAdminDone = checklist.admin.float && checklist.admin.cleanliness;

    const canStartShift = isUtilitiesDone && isEquipmentDone && isSuppliesDone && isAdminDone;

    const startShift = async () => {
        if (!canStartShift) return;
        setLoading(true);

        try {
            // Create Shift in Supabase
            const { data, error } = await supabase.from('shifts').insert([
                {
                    location_id: selectedLocationId.startsWith('mock') ? null : selectedLocationId,
                    bic_id: user.id,
                    shift_type: shiftType,
                    start_time: new Date().toISOString(),
                    cash_float_verified: checklist.admin.float,
                    pos_working: checklist.equipment.pos,
                    wifi_speed: checklist.utilities.wifi,
                    electricity_units: parseFloat(checklist.utilities.electricity),
                    briefing_completed: briefingRead,
                    opening_checklist: checklist // Store the full thematic checklist as JSONB
                }
            ]).select();

            if (error) throw error;

            // Handle One-time briefing items
            const oneTimeItems = briefingItems.filter(i => i.recurrence === 'once');
            if (oneTimeItems.length > 0) {
                await supabase
                    .from('briefing_items')
                    .update({ is_active: false })
                    .in('id', oneTimeItems.map(i => i.id));
            }

            console.log('Shift started:', data);
            await refreshShift();
            navigate('/dashboard');
        } catch (error) {
            console.error('Error starting shift:', error);
            alert('Failed to start shift. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    // Checkbox helper UI component
    const CheckListItem = ({ checked, onChange, label, icon: Icon }) => (
        <label className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${checked ? 'bg-enzi-gold/10 border-enzi-gold/50' : 'bg-white/5 border-white/5 hover:border-enzi-muted/30'}`}>
            <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-enzi-gold border-enzi-gold' : 'bg-enzi-black border-enzi-muted'}`}>
                {checked && <CheckCircle className="text-enzi-black w-4 h-4" size={16} strokeWidth={3} />}
            </div>
            <div className="flex items-center gap-2 flex-1">
                {Icon && <Icon size={16} className={checked ? "text-enzi-gold" : "text-enzi-muted"} />}
                <span className={`font-medium ${checked ? 'text-enzi-text' : 'text-enzi-muted'}`}>{label}</span>
            </div>
        </label>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-300 pb-12">
            <div className="card-panel p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-enzi-text">
                    <Coffee className="w-6 h-6 text-enzi-gold" /> Shift Initiation
                </h2>

                {/* Step 1: Location, Shift Type & BIC */}
                <div className={`space-y-4 transition-all duration-300 ${step === 1 ? 'opacity-100' : 'hidden'}`}>
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
                            <label className="block text-sm font-medium mb-1 text-enzi-muted">Shift Type</label>
                            <div className="py-2 px-4 rounded-lg bg-white/5 border border-enzi-muted/20 flex items-center gap-3">
                                {shiftType === 'morning' ? (
                                    <div className="text-blue-400 font-bold text-xl">☀️</div>
                                ) : (
                                    <div className="text-purple-400 font-bold text-xl">🌙</div>
                                )}
                                <span className="font-bold text-enzi-text capitalize">{shiftType} Shift</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-1 text-enzi-muted opacity-70">Barista in Charge (BIC)</label>
                        <input
                            type="text"
                            value={user.name}
                            disabled
                            className="input-field w-full opacity-60 cursor-not-allowed"
                        />
                    </div>

                    {/* Shift Validation Errors */}
                    {selectedLocationId && shiftType && prevShift && (
                        <div className="text-sm mt-4">
                            {(!prevShift.end_time) && (
                                <div className="p-3 bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg flex items-start gap-2">
                                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                    <p><strong>Cannot start {shiftType} shift.</strong> The previous {prevShift.shift_type || 'active'} shift has not been closed. Management must close it or the previous BIC must log in to close it.</p>
                                </div>
                            )}

                            {(prevShift.end_time && prevShift.shift_type && prevShift.shift_type === shiftType) && (
                                <div className="p-3 bg-amber-900/20 border border-amber-500/30 text-amber-400 rounded-lg flex items-start gap-2">
                                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                    <p><strong>Warning.</strong> The last shift recorded was also a {shiftType} shift on {new Date(prevShift.start_time).toLocaleDateString()}. Shifts should strictly alternate (Morning → Afternoon → Morning).</p>
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        onClick={() => {
                            // Run strict validation before proceeding
                            if (prevShift && !prevShift.end_time) {
                                setShiftError('previous_open');
                                return;
                            }
                            // We allow skipping the sequence warning in case a shift was genuinely skipped, but error out if unclosed.
                            setShiftError('');
                            setStep(2);
                        }}
                        disabled={!canProceedToBriefing || (prevShift && !prevShift.end_time)}
                        className="w-full py-3 bg-enzi-gold text-enzi-black rounded-lg font-bold disabled:opacity-50 hover:bg-enzi-gold/90 transition shadow-lg mt-4"
                    >
                        Proceed to Briefing
                    </button>
                </div>
            </div>

            {/* Step 2: Morning/Afternoon Briefing */}
            {step === 2 && (
                <div className="card-panel p-6 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-enzi-text">
                            <AlertCircle className="w-5 h-5 text-amber-500" /> {shiftType === 'morning' ? 'Morning' : 'Afternoon'} Briefing / Handover
                        </h3>
                        <button onClick={() => setStep(1)} className="text-xs text-enzi-muted hover:text-white uppercase font-bold tracking-wider">Back</button>
                    </div>

                    {/* Handover Notes Module */}
                    {prevShift && prevShift.end_time && prevShift.handover_notes && (
                        <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-900/40 mb-4 animate-pulse">
                            <h4 className="text-sm font-bold text-purple-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-400"></span> Handover Notes from Previous Shift
                            </h4>
                            <p className="text-purple-100 text-sm whitespace-pre-wrap pl-4 border-l-2 border-purple-500/50">
                                {prevShift.handover_notes}
                            </p>
                        </div>
                    )}

                    <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-900/40 mb-4">
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

                    <button
                        onClick={() => setStep(3)}
                        disabled={!canProceedToSystems}
                        className="btn-primary mt-4 disabled:opacity-50 w-full shadow-lg"
                    >
                        Next: Opening Checklist
                    </button>
                </div>
            )}

            {/* Step 3: Thematic Checklist */}
            {step === 3 && (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-enzi-text">
                            <ClipboardCheck className="text-enzi-gold" /> Opening Checklists
                        </h3>
                        <button onClick={() => setStep(2)} className="text-xs text-enzi-muted hover:text-white uppercase font-bold tracking-wider">Back</button>
                    </div>

                    {/* Utilities Group */}
                    <div className="card-panel p-5 space-y-4">
                        <h4 className="font-bold text-enzi-text flex items-center gap-2 border-b border-white/10 pb-2">
                            <Zap size={18} className="text-amber-400" /> Utilities
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-enzi-muted uppercase tracking-wider">Electricity Units</label>
                                <input
                                    type="number"
                                    placeholder="Enter meter reading"
                                    className="input-field w-full"
                                    value={checklist.utilities.electricity}
                                    onChange={(e) => updateChecklist('utilities', 'electricity', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-enzi-muted uppercase tracking-wider">Wifi Status</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['fast', 'normal', 'slow'].map(speed => (
                                        <button
                                            key={speed}
                                            onClick={() => updateChecklist('utilities', 'wifi', speed)}
                                            className={`py-2 px-2 rounded-lg text-xs font-bold capitalize transition-all border ${checklist.utilities.wifi === speed
                                                ? 'bg-enzi-gold text-enzi-black border-enzi-gold shadow-sm'
                                                : 'bg-white/5 text-enzi-muted border-transparent hover:border-enzi-muted/30'
                                                }`}
                                        >
                                            {speed}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-2">
                            <CheckListItem
                                checked={checklist.utilities.lights_ac}
                                onChange={() => updateChecklist('utilities', 'lights_ac', !checklist.utilities.lights_ac)}
                                label="Lights & A/C turned on"
                            />
                        </div>
                        <textarea
                            className="input-field w-full mt-2 text-sm"
                            placeholder="Optional notes or issues regarding utilities..."
                            value={checklist.utilities.notes}
                            onChange={(e) => updateChecklist('utilities', 'notes', e.target.value)}
                            rows={2}
                        />
                    </div>

                    {/* Equipment Group */}
                    <div className="card-panel p-5 space-y-4">
                        <h4 className="font-bold text-enzi-text flex items-center gap-2 border-b border-white/10 pb-2">
                            <Monitor size={18} className="text-blue-400" /> Equipment & Systems
                        </h4>
                        <div className="grid md:grid-cols-2 gap-3">
                            <CheckListItem
                                checked={checklist.equipment.pos}
                                onChange={() => updateChecklist('equipment', 'pos', !checklist.equipment.pos)}
                                label="POS Terminals Booted"
                            />
                            <CheckListItem
                                checked={checklist.equipment.espresso_machine}
                                onChange={() => updateChecklist('equipment', 'espresso_machine', !checklist.equipment.espresso_machine)}
                                label="Espresso Machine Calibrated"
                            />
                            <CheckListItem
                                checked={checklist.equipment.grinders}
                                onChange={() => updateChecklist('equipment', 'grinders', !checklist.equipment.grinders)}
                                label="Grinders Filled & Dialed In"
                            />
                        </div>
                        <textarea
                            className="input-field w-full mt-2 text-sm"
                            placeholder="Optional notes or issues regarding equipment..."
                            value={checklist.equipment.notes}
                            onChange={(e) => updateChecklist('equipment', 'notes', e.target.value)}
                            rows={2}
                        />
                    </div>

                    {/* Supplies Group */}
                    <div className="card-panel p-5 space-y-4">
                        <h4 className="font-bold text-enzi-text flex items-center gap-2 border-b border-white/10 pb-2">
                            <Package size={18} className="text-green-400" /> Supplies & Inventory
                        </h4>
                        <div className="grid md:grid-cols-2 gap-3">
                            <CheckListItem
                                checked={checklist.supplies.cups_lids}
                                onChange={() => updateChecklist('supplies', 'cups_lids', !checklist.supplies.cups_lids)}
                                label="Cups & Lids Stocked"
                            />
                            <CheckListItem
                                checked={checklist.supplies.milk}
                                onChange={() => updateChecklist('supplies', 'milk', !checklist.supplies.milk)}
                                label="Milk Delivered & Refrigerated"
                            />
                            <CheckListItem
                                checked={checklist.supplies.pastries}
                                onChange={() => updateChecklist('supplies', 'pastries', !checklist.supplies.pastries)}
                                label="Pastries Displayed & FIFO"
                            />
                        </div>
                        <textarea
                            className="input-field w-full mt-2 text-sm"
                            placeholder="Optional notes or issues regarding supplies..."
                            value={checklist.supplies.notes}
                            onChange={(e) => updateChecklist('supplies', 'notes', e.target.value)}
                            rows={2}
                        />
                    </div>

                    {/* Admin Group */}
                    <div className="card-panel p-5 space-y-4">
                        <h4 className="font-bold text-enzi-text flex items-center gap-2 border-b border-white/10 pb-2">
                            <ClipboardCheck size={18} className="text-purple-400" /> Admin & Checks
                        </h4>
                        <div className="grid md:grid-cols-2 gap-3">
                            <CheckListItem
                                checked={checklist.admin.float}
                                onChange={() => updateChecklist('admin', 'float', !checklist.admin.float)}
                                label="Cash Float Counted & Verified"
                            />
                            <CheckListItem
                                checked={checklist.admin.cleanliness}
                                onChange={() => updateChecklist('admin', 'cleanliness', !checklist.admin.cleanliness)}
                                label="Floor & Counters Clean"
                            />
                        </div>
                        <textarea
                            className="input-field w-full mt-2 text-sm"
                            placeholder="Optional notes or issues regarding admin/checks..."
                            value={checklist.admin.notes}
                            onChange={(e) => updateChecklist('admin', 'notes', e.target.value)}
                            rows={2}
                        />
                    </div>

                    <button
                        onClick={startShift}
                        disabled={!canStartShift || loading}
                        className="w-full py-4 bg-green-600 text-white rounded-lg font-bold text-lg shadow-xl disabled:opacity-50 hover:bg-green-700 transition transform hover:scale-[1.01] flex items-center justify-center mt-6"
                    >
                        {loading ? 'Starting...' : 'Complete & Start Shift'}
                    </button>
                    {!canStartShift && (
                        <p className="text-center text-sm text-enzi-muted/70 italic mt-2">
                            Please complete all required checks to start the shift
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

