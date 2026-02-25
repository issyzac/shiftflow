import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { CheckCircle, LogOut, Coffee, Monitor, Zap, ClipboardCheck, Lock, AlertCircle } from 'lucide-react';

export default function ClosingPage() {
    const navigate = useNavigate();
    const { user, activeShift, refreshShift } = useAuth();
    const [loading, setLoading] = useState(false);
    const [handoverNotes, setHandoverNotes] = useState('');

    // Thematic Checklist State
    const [checklist, setChecklist] = useState({
        cleaning: { espresso_machine: false, floors_benches: false, dishes: false, notes: '' },
        equipment: { pos_closed: false, machines_off: false, notes: '' },
        admin: { float_counted: false, wastage_logged: false, notes: '' },
        security: { securely_locked: false, notes: '' }
    });

    const updateChecklist = (category, field, value) => {
        setChecklist(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value
            }
        }));
    };

    // Evaluate if shift can close
    const isCleaningDone = checklist.cleaning.espresso_machine && checklist.cleaning.floors_benches && checklist.cleaning.dishes;
    const isEquipmentDone = checklist.equipment.pos_closed && checklist.equipment.machines_off;
    const isAdminDone = checklist.admin.float_counted && checklist.admin.wastage_logged;
    const isSecurityDone = checklist.security.securely_locked;

    const canCloseShift = isCleaningDone && isEquipmentDone && isAdminDone && isSecurityDone && handoverNotes.trim().length > 0;

    const endShift = async () => {
        if (!canCloseShift || !activeShift) return;
        setLoading(true);

        try {
            const { error } = await supabase.from('shifts')
                .update({
                    end_time: new Date().toISOString(),
                    closing_checklist: checklist, // Store the full thematic checklist as JSONB
                    handover_notes: handoverNotes
                })
                .eq('id', activeShift.id);

            if (error) throw error;

            console.log('Shift closed');
            await refreshShift();
            // AuthContext routing or manual routing
            navigate('/');
        } catch (error) {
            console.error('Error closing shift:', error);
            alert('Failed to end shift. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // If no active shift, shouldn't be here
    if (!activeShift) {
        return (
            <div className="card-panel p-6 text-center text-enzi-muted">
                No active shift found.
            </div>
        );
    }

    const CheckListItem = ({ checked, onChange, label, icon: Icon }) => (
        <label className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${checked ? 'bg-green-900/20 border-green-600/50' : 'bg-white/5 border-white/5 hover:border-enzi-muted/30'}`}>
            <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-green-600 border-green-600' : 'bg-enzi-black border-enzi-muted'}`}>
                {checked && <CheckCircle className="text-white w-4 h-4" size={16} strokeWidth={3} />}
            </div>
            <div className="flex items-center gap-2 flex-1">
                {Icon && <Icon size={16} className={checked ? "text-green-500" : "text-enzi-muted"} />}
                <span className={`font-medium ${checked ? 'text-green-50' : 'text-enzi-muted'}`}>{label}</span>
            </div>
        </label>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-300 pb-12">
            <div className="card-panel p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-enzi-text">
                        <LogOut className="w-6 h-6 text-red-500" /> Shift Closing
                    </h2>
                    <button onClick={() => navigate('/dashboard')} className="text-sm font-medium text-enzi-muted hover:text-white uppercase tracking-widest border border-white/10 px-3 py-1.5 rounded-lg">
                        Cancel
                    </button>
                </div>

                <p className="text-enzi-muted text-sm mb-6 border-b border-white/10 pb-4">
                    Complete all closing procedures before signing off. This ensures the next shift starts smoothly.
                </p>

                <div className="space-y-4">
                    {/* Cleaning Group */}
                    <div className="bg-enzi-black/50 p-4 rounded-xl border border-white/5 space-y-3">
                        <h4 className="font-bold text-enzi-text flex items-center gap-2">
                            <Zap size={18} className="text-blue-400" /> Cleaning & Prep
                        </h4>
                        <div className="grid md:grid-cols-2 gap-3">
                            <CheckListItem
                                checked={checklist.cleaning.espresso_machine}
                                onChange={() => updateChecklist('cleaning', 'espresso_machine', !checklist.cleaning.espresso_machine)}
                                label="Backflush Espresso Machine"
                            />
                            <CheckListItem
                                checked={checklist.cleaning.dishes}
                                onChange={() => updateChecklist('cleaning', 'dishes', !checklist.cleaning.dishes)}
                                label="Wash & Sanitize All Dishes"
                            />
                            <CheckListItem
                                checked={checklist.cleaning.floors_benches}
                                onChange={() => updateChecklist('cleaning', 'floors_benches', !checklist.cleaning.floors_benches)}
                                label="Sweep Floors & Wipe Benches"
                            />
                        </div>
                        <textarea
                            className="input-field w-full mt-2 text-sm border-white/10"
                            placeholder="Optional notes or issues regarding cleaning..."
                            value={checklist.cleaning.notes}
                            onChange={(e) => updateChecklist('cleaning', 'notes', e.target.value)}
                            rows={2}
                        />
                    </div>

                    {/* Equipment Group */}
                    <div className="bg-enzi-black/50 p-4 rounded-xl border border-white/5 space-y-3">
                        <h4 className="font-bold text-enzi-text flex items-center gap-2">
                            <Monitor size={18} className="text-amber-400" /> Equipment
                        </h4>
                        <div className="grid md:grid-cols-2 gap-3">
                            <CheckListItem
                                checked={checklist.equipment.pos_closed}
                                onChange={() => updateChecklist('equipment', 'pos_closed', !checklist.equipment.pos_closed)}
                                label="Close POS & Reconcile Z-Report"
                            />
                            <CheckListItem
                                checked={checklist.equipment.machines_off}
                                onChange={() => updateChecklist('equipment', 'machines_off', !checklist.equipment.machines_off)}
                                label="Turn Off Grinders & Non-essential Systems"
                            />
                        </div>
                        <textarea
                            className="input-field w-full mt-2 text-sm border-white/10"
                            placeholder="Optional notes or issues regarding equipment..."
                            value={checklist.equipment.notes}
                            onChange={(e) => updateChecklist('equipment', 'notes', e.target.value)}
                            rows={2}
                        />
                    </div>

                    {/* Admin Group */}
                    <div className="bg-enzi-black/50 p-4 rounded-xl border border-white/5 space-y-3">
                        <h4 className="font-bold text-enzi-text flex items-center gap-2">
                            <ClipboardCheck size={18} className="text-purple-400" /> Admin
                        </h4>
                        <div className="grid md:grid-cols-2 gap-3">
                            <CheckListItem
                                checked={checklist.admin.float_counted}
                                onChange={() => updateChecklist('admin', 'float_counted', !checklist.admin.float_counted)}
                                label="Count Cash Float & Store Securely"
                            />
                            <CheckListItem
                                checked={checklist.admin.wastage_logged}
                                onChange={() => updateChecklist('admin', 'wastage_logged', !checklist.admin.wastage_logged)}
                                label="All Wastage Logged in Dashboard"
                            />
                        </div>
                        <textarea
                            className="input-field w-full mt-2 text-sm border-white/10"
                            placeholder="Optional notes or issues regarding admin..."
                            value={checklist.admin.notes}
                            onChange={(e) => updateChecklist('admin', 'notes', e.target.value)}
                            rows={2}
                        />
                    </div>

                    {/* Security Group */}
                    <div className="bg-enzi-black/50 p-4 rounded-xl border border-white/5 space-y-3">
                        <h4 className="font-bold text-enzi-text flex items-center gap-2">
                            <Lock size={18} className="text-red-400" /> Security
                        </h4>
                        <div className="grid md:grid-cols-1 gap-3">
                            <CheckListItem
                                checked={checklist.security.securely_locked}
                                onChange={() => updateChecklist('security', 'securely_locked', !checklist.security.securely_locked)}
                                label="Lights out, A/C off, Doors Securely Locked"
                            />
                        </div>
                        <textarea
                            className="input-field w-full mt-2 text-sm border-white/10"
                            placeholder="Optional notes or issues regarding security..."
                            value={checklist.security.notes}
                            onChange={(e) => updateChecklist('security', 'notes', e.target.value)}
                            rows={2}
                        />
                    </div>

                    {/* Handover Notes Group */}
                    <div className="bg-purple-900/20 p-4 rounded-xl border border-purple-500/30 space-y-3 mt-8">
                        <h4 className="font-bold text-purple-300 flex items-center gap-2">
                            <AlertCircle size={18} className="text-purple-400" /> Handover Notes for Next Shift <span className="text-red-500">*</span>
                        </h4>
                        <p className="text-xs text-purple-200/70 mb-2">Write any critical information the next Barista needs to know (e.g. issues, specials, specific restocks needed).</p>
                        <textarea
                            className="input-field w-full text-sm border-purple-500/40 focus:border-purple-400 bg-purple-900/40"
                            placeholder="Type handover notes here..."
                            value={handoverNotes}
                            onChange={(e) => setHandoverNotes(e.target.value)}
                            rows={4}
                        />
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        onClick={endShift}
                        disabled={!canCloseShift || loading}
                        className="w-full py-4 bg-red-600/90 text-white rounded-lg font-bold text-lg shadow-xl disabled:opacity-50 hover:bg-red-700 transition transform hover:scale-[1.01] flex items-center justify-center gap-2"
                    >
                        {loading ? 'Closing...' : <><LogOut size={20} /> Complete & End Shift</>}
                    </button>
                    {!canCloseShift && (
                        <p className="text-center text-sm text-red-400/80 italic mt-3 animate-pulse">
                            Please complete all required checks and write Handover Notes to end the shift.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
