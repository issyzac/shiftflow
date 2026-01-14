import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Coffee, Wifi, CreditCard, Monitor } from 'lucide-react';

export default function OpeningPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        location: '',
        bic: '',
        briefingRead: false,
        systems: {
            pos: false,
            wifi: false,
            payment: false,
            float: false
        }
    });

    const locations = ['Mbezi', 'Victoria', 'Masaki', 'Upanga'];
    const staff = ['John Doe', 'Jane Smith', 'Michael Chen', 'Sarah Jones']; // Mock data

    const handleSystemCheck = (key) => {
        setFormData(prev => ({
            ...prev,
            systems: { ...prev.systems, [key]: !prev.systems[key] }
        }));
    };

    const canProceedToBriefing = formData.location && formData.bic;
    const canProceedToSystems = formData.briefingRead;
    const canStartShift = Object.values(formData.systems).every(Boolean);

    const startShift = () => {
        if (!canStartShift) return;
        // In a real app, this would save to Supabase
        console.log('Starting shift with:', formData);
        navigate('/dashboard');
    };

    return (
        <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-espresso-100/50">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-espresso-900">
                    <Coffee className="w-6 h-6" /> Shift Initiation
                </h2>

                {/* Step 1: Location & BIC */}
                <div className={`space-y-4 transition-all duration-300 ${step === 1 ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
                    <div>
                        <label className="block text-sm font-medium mb-1">Select Location</label>
                        <select
                            className="w-full p-3 rounded-lg border border-espresso-900/20 bg-white focus:ring-2 focus:ring-espresso-900 focus:outline-none"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        >
                            <option value="">-- Choose Location --</option>
                            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Barista in Charge (BIC)</label>
                        <select
                            className="w-full p-3 rounded-lg border border-espresso-900/20 bg-white focus:ring-2 focus:ring-espresso-900 focus:outline-none"
                            value={formData.bic}
                            onChange={(e) => setFormData({ ...formData, bic: e.target.value })}
                        >
                            <option value="">-- Select BIC --</option>
                            {staff.map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
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
                <div className={`bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-espresso-100/50 transition-all duration-300 ${step === 2 ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600" /> Morning Briefing
                    </h3>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 mb-4">
                        <h4 className="font-semibold text-amber-900 mb-2">Today's Goals:</h4>
                        <ul className="list-disc list-inside text-sm text-amber-800 space-y-1">
                            <li>Upsell "Spiced Latte" on every order.</li>
                            <li>Maintain &lt; 3 min ticket time.</li>
                            <li>Smile and greet every customer within 5s.</li>
                        </ul>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-espresso-100/50 cursor-pointer transition" onClick={() => setFormData({ ...formData, briefingRead: !formData.briefingRead })}>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${formData.briefingRead ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                            {formData.briefingRead && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                        <span className="font-medium">I verify that the team has been briefed.</span>
                    </div>

                    {step === 2 && (
                        <button
                            onClick={() => setStep(3)}
                            disabled={!canProceedToSystems}
                            className="w-full mt-4 py-3 bg-espresso-900 text-white rounded-lg font-semibold disabled:opacity-50 hover:bg-espresso-900/90 transition"
                        >
                            Next: System Checks
                        </button>
                    )}
                </div>
            )}

            {/* Step 3: Systems Verification */}
            {step >= 3 && (
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-espresso-100/50">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Monitor className="w-5 h-5" /> Systems Check
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <SystemCheckToggle
                            label="POS Terminals"
                            icon={<Monitor className="w-5 h-5" />}
                            checked={formData.systems.pos}
                            onChange={() => handleSystemCheck('pos')}
                        />
                        <SystemCheckToggle
                            label="Wi-Fi"
                            icon={<Wifi className="w-5 h-5" />}
                            checked={formData.systems.wifi}
                            onChange={() => handleSystemCheck('wifi')}
                        />
                        <SystemCheckToggle
                            label="Card/M-Pesa"
                            icon={<CreditCard className="w-5 h-5" />}
                            checked={formData.systems.payment}
                            onChange={() => handleSystemCheck('payment')}
                        />
                        <SystemCheckToggle
                            label="Cash Float"
                            icon={<span className="font-bold text-lg">$</span>}
                            checked={formData.systems.float}
                            onChange={() => handleSystemCheck('float')}
                        />
                    </div>

                    <button
                        onClick={startShift}
                        disabled={!canStartShift}
                        className="w-full py-4 bg-green-600 text-white rounded-lg font-bold text-lg shadow-lg disabled:opacity-50 hover:bg-green-700 transition transform hover:scale-[1.02]"
                    >
                        Start Shift
                    </button>
                </div>
            )}
        </div>
    );
}

function SystemCheckToggle({ label, icon, checked, onChange }) {
    return (
        <div
            onClick={onChange}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 text-center
        ${checked
                    ? 'border-green-500 bg-green-50 text-green-900'
                    : 'border-gray-200 hover:border-espresso-900/30 bg-white'
                }`}
        >
            <div className={checked ? 'text-green-600' : 'text-gray-400'}>{icon}</div>
            <span className="font-semibold text-sm">{label}</span>
        </div>
    );
}
