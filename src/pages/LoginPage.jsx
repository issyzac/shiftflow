import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Users, Coffee, Briefcase, ChevronLeft, Delete } from 'lucide-react';
import hzeLogo from '../assets/hze-icon.png';
import hzeFullLogo from '../assets/hze-full-logo.png';

const LoginPage = () => {
    const { login } = useAuth();
    const [step, setStep] = useState('role'); // 'role', 'user', 'pin'
    // const [selectedRole, setSelectedRole] = useState(null); // Unused
    const [profiles, setProfiles] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Clear error when pin changes
    useEffect(() => {
        if (error) setError('');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pin]);

    const handleRoleSelect = async (role) => {
        // setSelectedRole(role); 
        setLoadingUsers(true);
        setError('');

        try {
            const { data, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', role);

            if (fetchError) throw fetchError;
            setProfiles(data || []);
            setStep('user');
        } catch (err) {
            console.error('Error fetching profiles:', err);
            setError('Failed to load users for this role.');
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setPin('');
        setStep('pin');
    };

    const handlePinInput = (digit) => {
        if (pin.length < 4) {
            setPin(prev => prev + digit);
        }
    };

    const handlePinDelete = () => {
        setPin(prev => prev.slice(0, -1));
    };

    const handleLoginSubmit = async () => {
        if (pin.length !== 4) return;

        const result = await login(selectedUser.id, pin);
        if (!result.success) {
            setError(result.error === 'Invalid PIN' ? 'Incorrect PIN. Please try again.' : 'Login failed.');
            setPin('');
        }
        // Navigation is handled in App.jsx based on user state change
    };

    // Auto-submit when PIN length is 4
    useEffect(() => {
        if (pin.length === 4) {
            handleLoginSubmit();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pin]);

    const goBack = () => {
        if (step === 'pin') {
            setStep('user');
            setPin('');
            setError('');
        } else if (step === 'user') {
            setStep('role');
            setProfiles([]);
            // setSelectedRole(null);
        }
    };

    return (
        <div className="min-h-screen bg-enzi-black flex items-center justify-center p-4">
            <div className="bg-enzi-card w-full max-w-md rounded-2xl shadow-2xl overflow-hidden min-h-[500px] flex flex-col relative border border-enzi-muted/10">

                {/* Header */}
                <div className="bg-enzi-card/50 p-6 flex flex-col items-center justify-center relative backdrop-blur-sm border-b border-enzi-muted/5">
                    {step !== 'role' && (
                        <button
                            onClick={goBack}
                            className="absolute left-4 top-6 text-enzi-text hover:text-enzi-gold transition"
                        >
                            <ChevronLeft size={28} />
                        </button>
                    )}

                    {step === 'role' ? (
                        <div className="flex flex-col items-center gap-3 mb-2">
                            <img src={hzeFullLogo} alt="Shiftflow Logo" className="w-48 opacity-90 object-contain" />
                        </div>
                    ) : (
                        <h1 className="text-2xl font-bold text-enzi-text tracking-wide uppercase">Shiftflow</h1>
                    )}

                    <p className="text-sm text-enzi-muted font-medium mt-1">
                        {step === 'role' && "Select Your Role"}
                        {step === 'user' && "Who are you?"}
                        {step === 'pin' && `Welcome, ${selectedUser?.name}`}
                    </p>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 flex flex-col justify-center">

                    {/* Step 1: Role Selection */}
                    {step === 'role' && (
                        <div className="space-y-4">
                            <RoleButton
                                icon={<Coffee size={32} />}
                                label="Barista"
                                onClick={() => handleRoleSelect('barista')}
                            />
                            <RoleButton
                                icon={<Briefcase size={32} />}
                                label="Manager"
                                onClick={() => handleRoleSelect('manager')}
                            />
                            <RoleButton
                                icon={<Users size={32} />}
                                label="Core"
                                onClick={() => handleRoleSelect('core')}
                            />
                        </div>
                    )}

                    {/* Step 2: User Selection */}
                    {step === 'user' && (
                        <div className="grid grid-cols-2 gap-4">
                            {loadingUsers ? (
                                <p className="col-span-2 text-center text-enzi-muted">Loading users...</p>
                            ) : profiles.length === 0 ? (
                                <p className="col-span-2 text-center text-red-400">No users found for this role.</p>
                            ) : (
                                profiles.map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => handleUserSelect(user)}
                                        className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl shadow-sm hover:shadow-md hover:scale-105 hover:bg-white/10 transition active:scale-95 space-y-2 border border-transparent hover:border-enzi-gold"
                                    >
                                        <div className="w-12 h-12 bg-enzi-gold text-enzi-black rounded-full flex items-center justify-center text-lg font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <span className="font-medium text-enzi-text text-center">{user.name}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    )}

                    {/* Step 3: PIN Entry */}
                    {step === 'pin' && (
                        <div className="w-full max-w-xs mx-auto">
                            {/* PIN Bubbles */}
                            <div className="flex justify-center space-x-4 mb-8">
                                {[...Array(4)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-4 h-4 rounded-full border-2 border-enzi-gold transition-all ${i < pin.length ? 'bg-enzi-gold' : 'bg-transparent'
                                            }`}
                                    />
                                ))}
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="text-red-600 text-center mb-4 text-sm font-medium animate-pulse">
                                    {error}
                                </div>
                            )}

                            {/* Keypad */}
                            <div className="grid grid-cols-3 gap-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                    <KeypadButton key={num} num={num} onClick={() => handlePinInput(num.toString())} />
                                ))}
                                <div />
                                <KeypadButton num={0} onClick={() => handlePinInput('0')} />
                                <button
                                    onClick={handlePinDelete}
                                    className="bg-transparent hover:bg-white/10 text-enzi-text font-bold rounded-lg p-3 flex items-center justify-center transition active:bg-white/20"
                                >
                                    <Delete size={24} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const RoleButton = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center p-4 bg-white/5 rounded-xl shadow-sm hover:shadow-md hover:bg-white/10 transition active:scale-[0.98] group space-x-4 border border-enzi-muted/20 hover:border-enzi-gold h-20"
    >
        <div className="text-enzi-gold group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <span className="text-xl font-bold text-enzi-text">{label}</span>
    </button>
);

const KeypadButton = ({ num, onClick }) => (
    <button
        onClick={onClick}
        className="bg-white/5 shadow-sm border-b-2 border-enzi-black text-enzi-text font-bold text-xl rounded-lg h-14 w-full flex items-center justify-center hover:bg-white/10 active:translate-y-0.5 active:border-b-0 transition-all"
    >
        {num}
    </button>
);

export default LoginPage;
