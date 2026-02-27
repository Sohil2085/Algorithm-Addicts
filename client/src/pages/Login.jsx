import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { login as loginApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import toast from 'react-hot-toast';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await loginApi(formData);
            login(response.token, response.user);

            toast.success('Welcome back!');

            if (response.user.role === 'MSME') {
                navigate('/msme');
            } else if (response.user.role === 'LENDER') {
                navigate('/lender');
            } else if (response.user.role === 'ADMIN') {
                navigate('/admin');
            } else if (response.user.role === 'CONTROLLER') {
                navigate('/system-control');
            } else {
                toast.error('Unknown role encountered');
            }
        } catch (err) {
            toast.error(err.toString());
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Sign in to your account to continue"
        >
            <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
                <div className="form-group">
                    <label style={{ display: 'none' }}>Email</label>
                    <div className="input-wrapper">
                        <Mail size={18} />
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="Email address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label style={{ display: 'none' }}>Password</label>
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
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                    <Link to="/forgot-password" className="link-primary" style={{ fontSize: '0.85rem' }}>
                        Forgot password?
                    </Link>
                </div>

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                >
                    {loading ? <div className="spinner"></div> : 'Sign In'}
                </button>
            </form>

            <div className="auth-footer">
                Don't have an account? <Link to="/register" className="link-primary" style={{ marginLeft: '4px' }}>Create account</Link>
            </div>
        </AuthLayout>
    );
};

export default Login;
