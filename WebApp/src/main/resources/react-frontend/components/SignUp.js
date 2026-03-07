function SignUp({ onSuccess, onSignIn }) {
    const { Box, Typography, TextField, Button, Link, Alert, useMediaQuery, useTheme } = MaterialUI;
    const { setLoading } = useLoading();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [emailError, setEmailError] = React.useState('');
    const [passwordError, setPasswordError] = React.useState('');
    const [confirmPasswordError, setConfirmPasswordError] = React.useState('');

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

    const validateConfirmPassword = (value) => {
        if (!value) return 'Confirm password is required';
        if (value !== password) return 'Passwords do not match';
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
        if (confirmPassword) setConfirmPasswordError(value !== confirmPassword ? 'Passwords do not match' : '');
    };

    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);
        setConfirmPasswordError(validateConfirmPassword(value));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const emailErr = validateEmail(email);
        const passwordErr = validatePassword(password);
        const confirmPasswordErr = validateConfirmPassword(confirmPassword);
        setEmailError(emailErr);
        setPasswordError(passwordErr);
        setConfirmPasswordError(confirmPasswordErr);
        console.log('111111111111');
        if (emailErr || passwordErr || confirmPasswordErr) return;

        setLoading(true);
        try {
            const data = await authService.register(email, password);
            console.log('Registration response:', data);
            if (data.status) {
                alert('Registration successful! Please sign in.');
                onSuccess();
            } else if (data.errorCode === 'ALREADY_LOGGED_IN') {
                onSuccess();
            } else {
                setError(data.errorMsg || 'Registration failed');
            }
        } catch (err) {
            if (err.response?.data?.errorCode === 'ALREADY_LOGGED_IN') {
                onSuccess();
            } else {
                setError('Registration failed. Please try again.');
            }
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
                background: 'linear-gradient(135deg, rgba(255, 136, 62, 0.9), rgba(230, 119, 48, 0.95)), url("https://images.unsplash.com/a-group-of-boats-floating-on-top-of-a-river-bIEEfOMQOVk?w=800")',
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
                    🏡 Join AccommodateMe
                </Typography>
                <Typography variant={isMobile ? 'body1' : 'h6'} sx={{ textAlign: 'center', maxWidth: '500px', opacity: 0.95 }}>
                    Start your journey to finding the perfect home in Ireland
                </Typography>
            </Box>

            {/* Right Panel - Sign Up Form */}
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
                            color: '#FF883E', 
                            mb: 1, 
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}>
                            Create Account
                        </Typography>
                        <Typography variant="body2" sx={{ 
                            color: '#6B7280', 
                            mb: 4,
                            textAlign: 'center'
                        }}>
                            Sign up to start listing or finding properties
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
                                        '&.Mui-focused fieldset': { borderColor: '#FF883E', borderWidth: 2 }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': { color: '#FF883E' }
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
                                        '&.Mui-focused fieldset': { borderColor: '#FF883E', borderWidth: 2 }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': { color: '#FF883E' }
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Confirm Password"
                                type="password"
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                error={!!confirmPasswordError}
                                helperText={confirmPasswordError}
                                margin="normal"
                                sx={{ 
                                    '& .MuiOutlinedInput-root': { 
                                        borderRadius: 2,
                                        '&.Mui-focused fieldset': { borderColor: '#FF883E', borderWidth: 2 }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': { color: '#FF883E' }
                                }}
                            />

                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                sx={{ 
                                    mt: 3,
                                    mb: 2,
                                    py: 1.5,
                                    bgcolor: '#169B62',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    boxShadow: '0 4px 12px rgba(22, 155, 98, 0.3)',
                                    '&:hover': { 
                                        bgcolor: '#0F7A4D',
                                        boxShadow: '0 6px 16px rgba(22, 155, 98, 0.4)'
                                    }
                                }}
                            >
                                Create Account
                            </Button>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <Box sx={{ textAlign: 'center', mt: 3 }}>
                            <Typography variant="body2" sx={{ color: '#6B7280', display: 'inline' }}>
                                Already have an account?{' '}
                            </Typography>
                            <Link 
                                component="button" 
                                type="button"
                                onClick={onSignIn} 
                                sx={{ 
                                    color: '#FF883E',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    '&:hover': { color: '#E67730', textDecoration: 'underline' }
                                }}
                            >
                                Sign in here
                            </Link>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
