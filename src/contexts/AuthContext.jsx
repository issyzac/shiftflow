import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeShift, setActiveShift] = useState(null);

    // Restore session from localStorage on mount
    useEffect(() => {
        const restoreSession = async () => {
            const storedUserId = localStorage.getItem('shiftflow_user_id');
            if (storedUserId) {
                try {
                    const { data: profile, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', storedUserId)
                        .single();

                    if (profile && !error) {
                        setUser(profile);
                        // If user is barista, check for active shift
                        if (profile.role === 'barista') {
                            await checkActiveShift(profile.id);
                        }
                    } else {
                        localStorage.removeItem('shiftflow_user_id');
                    }
                } catch (err) {
                    console.error("Session restore error", err);
                }
            }
            setLoading(false);
        };

        restoreSession();
    }, []);

    const checkActiveShift = async (userId) => {
        try {
            // Find a shift where this user is BIC and end_time is null
            const { data: shift, error } = await supabase
                .from('shifts')
                .select('*')
                .eq('bic_id', userId)
                .is('end_time', null)
                .maybeSingle(); // Use maybeSingle to avoid error if no row

            if (shift) {
                setActiveShift(shift);
            } else {
                setActiveShift(null);
            }
        } catch (err) {
            console.error("Check active shift error", err);
        }
    };

    const login = async (userId, pin) => {
        try {
            // 1. Verify User and PIN
            // In a real secure app, we wouldn't fetch the PIN. We'd call an RPC or rely on Auth.
            // But per plan, we verify against the row.
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error || !profile) {
                throw new Error('User not found');
            }

            if (profile.pin !== pin) {
                throw new Error('Invalid PIN');
            }

            // 2. Set User Session
            setUser(profile);
            localStorage.setItem('shiftflow_user_id', profile.id);

            // 3. Check Context (e.g. active shift)
            if (profile.role === 'barista') {
                await checkActiveShift(profile.id);
            }

            return { success: true };
        } catch (error) {
            console.error('Login failed:', error);
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        setUser(null);
        setActiveShift(null);
        localStorage.removeItem('shiftflow_user_id');
    };

    // Helper to refresh shift status (e.g. after starting/ending a shift)
    const refreshShift = async () => {
        if (user && user.role === 'barista') {
            await checkActiveShift(user.id);
        }
    };

    const value = {
        user,
        activeShift,
        loading,
        login,
        logout,
        refreshShift
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
