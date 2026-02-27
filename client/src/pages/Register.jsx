import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Building2, Landmark } from 'lucide-react';
import { register } from '../api/authApi';
import AuthLayout from '../components/AuthLayout';
import toast from 'react-hot-toast';

const ROLES = [
    {
        value: 'MSME',
        label: 'MSME',
        description: 'Upload invoices & get funded',
        Icon: Building2,
    },
    {
        value: 'LENDER',
        label: 'Lender',
        description: 'Browse & bid on invoices',
        Icon: Landmark,
    },
];

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'MSME',
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
            };

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
            {/* Role selection */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                {ROLES.map(({ value, label, description, Icon }) => {
                    const isSelected = formData.role === value;
                    return (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setFormData({ ...formData, role: value })}
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.85rem 0.5rem',
                                borderRadius: '12px',
                                border: isSelected
                                    ? '1.5px solid var(--accent)'
                                    : '1.5px solid var(--cardBorder)',
                                background: isSelected
                                    ? 'rgba(99,102,241,0.12)'
                                    : 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: isSelected ? '0 0 12px rgba(99,102,241,0.3)' : 'none',
                            }}
                        >
                            {Icon && <Icon
                                size={22}
                                style={{ color: isSelected ? 'var(--accent)' : 'var(--muted)' }}
                            />}
                            <span style={{
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: isSelected ? 'var(--text)' : 'var(--muted)',
                            }}>{label}</span>
                            <span style={{
                                fontSize: '0.68rem',
                                color: 'var(--muted)',
                                textAlign: 'center',
                                lineHeight: 1.3,
                            }}>{description}</span>
                        </button>
                    );
                })}
            </div>

            <form onSubmit={handleSubmit} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>

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

