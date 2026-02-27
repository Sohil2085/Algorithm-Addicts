import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Briefcase, FileText, Activity, Eye, EyeOff } from 'lucide-react';
import { register } from '../api/authApi';
import AuthLayout from '../components/AuthLayout';
import toast from 'react-hot-toast';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'MSME',
        gstin: '',
        businessAge: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validate = () => {
        if (formData.name.length < 3) return 'Name must be at least 3 characters';
        if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Invalid email format';
        if (formData.password.length < 6) return 'Password must be at least 6 characters';
        if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
        if (formData.role === 'MSME') {
            if (formData.gstin.length !== 15) return 'GSTIN must be 15 characters';
        }
        const age = Number(formData.businessAge);
        if (isNaN(age) || age < 0 || age > 100) return 'Business Age must be between 0 and 100';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validate();
        if (validationError) {
            toast.error(validationError);
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                businessAge: Number(formData.businessAge),
            };

            if (formData.role === 'MSME') {
                payload.gstin = formData.gstin;
            }

            await register(payload);
            toast.success('Account created successfully! Please sign in.');
            navigate('/login');
        } catch (err) {
            toast.error(err.toString());
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Create Account"
            subtitle="Join tailored financing for MSMEs & Lenders"
        >
            <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>

                <div className="input-wrapper">
                    <User size={18} />
                    <input
                        type="text"
                        name="name"
                        className="form-input"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="input-wrapper">
                    <Mail size={18} />
                    <input
                        type="email"
                        name="email"
                        className="form-input"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="input-wrapper">
                    <Lock size={18} />
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className="form-input"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <button
                        type="button"
                        className="eye-icon"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <div className="input-wrapper">
                    <Lock size={18} />
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        className="form-input"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                    <button
                        type="button"
                        className="eye-icon"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <div className="input-wrapper">
                    <Briefcase size={18} />
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="form-input"
                    >
                        <option value="MSME" style={{ color: 'black' }}>MSME (Borrower)</option>
                        <option value="LENDER" style={{ color: 'black' }}>Lender (Investor)</option>
                    </select>
                </div>

                <AnimatePresence>
                    {formData.role === 'MSME' && (
                        <motion.div
                            className="input-wrapper"
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        >
                            <FileText size={18} />
                            <input
                                type="text"
                                name="gstin"
                                className="form-input"
                                placeholder="GSTIN (15 characters)"
                                value={formData.gstin}
                                onChange={handleChange}
                                required
                                maxLength={15}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="input-wrapper">
                    <Activity size={18} />
                    <input
                        type="number"
                        name="businessAge"
                        className="form-input"
                        placeholder="Business Age (Years)"
                        value={formData.businessAge}
                        onChange={handleChange}
                        required
                        min="0"
                        max="100"
                    />
                </div>

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                >
                    {loading ? <div className="spinner"></div> : 'Register'}
                </button>
            </form>

            <div className="auth-footer">
                Already have an account? <Link to="/login" className="link-primary" style={{ marginLeft: '4px' }}>Sign In</Link>
            </div>
        </AuthLayout>
    );
};

export default Register;