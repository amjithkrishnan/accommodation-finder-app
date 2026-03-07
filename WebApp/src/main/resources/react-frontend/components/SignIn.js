function SignIn({ onSignUp, onForgotPassword, onSuccess }) {
    const { Box, Typography, TextField, Button, Link, Alert, Checkbox, FormControlLabel, useMediaQuery, useTheme } = MaterialUI;
    const { setLoading } = useLoading();
    const { login } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [rememberMe, setRememberMe] = React.useState(false);
    const [error, setError] = React.useState('');
    const [emailError, setEmailError] = React.useState('');
    const [passwordError, setPasswordError] = React.useState('');

    const validateEmail = (value) => {
        if (!value) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Invalid email format';
        return '';
    };

    const validatePassword = (value) => {
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        setEmailError(validateEmail(value));
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        setPasswordError(validatePassword(value));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const emailErr = validateEmail(email);
        const passwordErr = validatePassword(password);
        setEmailError(emailErr);
        setPasswordError(passwordErr);
        if (emailErr || passwordErr) return;

        setLoading(true);
        try {
            const success = await login(email, password);
            if (success) {
                onSuccess();
            } else {
                setError('Invalid credentials');
            }
        } catch (err) {
            if (err.response?.data?.errorCode === 'ALREADY_LOGGED_IN') {
                onSuccess();
            } else {
                setError('Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        setError('');
        const emailErr = validateEmail(email);
        setEmailError(emailErr);
        if (emailErr) return;

        setLoading(true);
        try {
            const data = await authService.forgotPassword(email);
            if (data.status) {
                alert(data.response || 'Password reset link sent to your email');
            } else {
                setError(data.errorMsg || 'Email not found');
            }
        } catch (err) {
            setError('Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ 
            display: 'flex', 
            minHeight: '100vh',
            flexDirection: isMobile ? 'column' : 'row'
        }}>
            {/* Left Panel - Hero Image */}
            <Box sx={{ 
                flex: isMobile ? '0 0 200px' : 1,
                background: 'linear-gradient(135deg, rgba(22, 155, 98, 0.9), rgba(15, 122, 77, 0.95)), url("https://images.unsplash.com/photo-1590086782792-42dd2350140d?w=800")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: isMobile ? 3 : 6,
                color: 'white'
            }}>
                <Typography variant={isMobile ? 'h4' : 'h3'} sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                    🏡 AccommodateMe
                </Typography>
                <Typography variant={isMobile ? 'body1' : 'h6'} sx={{ textAlign: 'center', maxWidth: '500px', opacity: 0.95 }}>
                    Find your perfect home in Ireland's most beautiful locations
                </Typography>
            </Box>

            {/* Right Panel - Sign In Form */}
            <Box sx={{ 
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: isMobile ? 3 : 6,
                bgcolor: '#FAFAFA'
            }}>
                <Box sx={{ width: '100%', maxWidth: '450px' }}>
                    <Box sx={{ 
                        bgcolor: 'white',
                        borderRadius: 3,
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                        p: isMobile ? 3 : 5
                    }}>
                        <Typography variant="h4" sx={{ 
                            color: '#169B62', 
                            mb: 1, 
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}>
                            Welcome Back
                        </Typography>
                        <Typography variant="body2" sx={{ 
                            color: '#6B7280', 
                            mb: 4,
                            textAlign: 'center'
                        }}>
                            Sign in to continue to your account
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Email Address"
                                type="email"
                                value={email}
                                onChange={handleEmailChange}
                                error={!!emailError}
                                helperText={emailError}
                                margin="normal"
                                sx={{ 
                                    '& .MuiOutlinedInput-root': { 
                                        borderRadius: 2,
                                        '&.Mui-focused fieldset': { borderColor: '#169B62', borderWidth: 2 }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': { color: '#169B62' }
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                value={password}
                                onChange={handlePasswordChange}
                                error={!!passwordError}
                                helperText={passwordError}
                                margin="normal"
                                sx={{ 
                                    '& .MuiOutlinedInput-root': { 
                                        borderRadius: 2,
                                        '&.Mui-focused fieldset': { borderColor: '#169B62', borderWidth: 2 }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': { color: '#169B62' }
                                }}
                            />
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 3 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox 
                                            checked={rememberMe} 
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            sx={{ 
                                                color: '#169B62',
                                                '&.Mui-checked': { color: '#169B62' }
                                            }}
                                        />
                                    }
                                    label={<Typography variant="body2" sx={{ color: '#6B7280' }}>Remember me</Typography>}
                                />
                                <Link 
                                    component="button" 
                                    type="button"
                                    onClick={handleForgotPassword} 
                                    sx={{ 
                                        color: '#169B62', 
                                        cursor: 'pointer',
                                        textDecoration: 'none',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        '&:hover': { color: '#0F7A4D', textDecoration: 'underline' }
                                    }}
                                >
                                    Forgot Password?
                                </Link>
                            </Box>

                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                sx={{ 
                                    mt: 2,
                                    mb: 2,
                                    py: 1.5,
                                    bgcolor: '#FF883E',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    boxShadow: '0 4px 12px rgba(255, 136, 62, 0.3)',
                                    '&:hover': { 
                                        bgcolor: '#E67730',
                                        boxShadow: '0 6px 16px rgba(255, 136, 62, 0.4)'
                                    }
                                }}
                            >
                                Sign In
                            </Button>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <Box sx={{ textAlign: 'center', mt: 3 }}>
                            <Typography variant="body2" sx={{ color: '#6B7280', display: 'inline' }}>
                                Don't have an account?{' '}
                            </Typography>
                            <Link 
                                component="button" 
                                type="button"
                                onClick={onSignUp} 
                                sx={{ 
                                    color: '#169B62',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    '&:hover': { color: '#0F7A4D', textDecoration: 'underline' }
                                }}
                            >
                                Register here
                            </Link>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
