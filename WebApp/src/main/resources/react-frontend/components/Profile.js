function Profile() {
    const { Typography, Box, Button, TextField, Container, Grid, Avatar, Card, CardContent, IconButton } = MaterialUI;
    const { user, checkAuth } = useAuth();
    
    const [isEditMode, setIsEditMode] = React.useState(false);
    const [form, setForm] = React.useState({ name: '', phone: '', location: '', bio: '' });
    const [savedForm, setSavedForm] = React.useState({ name: '', phone: '', location: '', bio: '' });
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');

    React.useEffect(() => {
        if (user) {
            const userData = {
                name: user.name || '',
                phone: user.phone || '',
                location: user.location || '',
                bio: user.bio || ''
            };
            setForm(userData);
            setSavedForm(userData);
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleEdit = () => {
        setIsEditMode(true);
        setError('');
        setSuccess('');
    };

    const handleCancel = () => {
        setForm(savedForm);
        setIsEditMode(false);
        setError('');
        setSuccess('');
    };

    const handleSave = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const payload = { name: form.name, phone: form.phone, location: form.location, bio: form.bio };
            const response = await axios.put(`${API_CONFIG.BASE_URL}/api/user/profile`, payload, { withCredentials: true });
            setSavedForm(form);
            setIsEditMode(false);
            setSuccess('Profile updated successfully!');
            await checkAuth();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const getUserInitial = () => user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U';

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F5F6F7' }}>
            <Header />
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#12321A', mb: 1 }}>My Profile</Typography>
                    <Typography variant="body1" sx={{ color: '#6B7280' }}>Manage your account information</Typography>
                </Box>

                {success && (
                    <Box sx={{ mb: 3, p: 2, bgcolor: '#E8F5F0', borderRadius: 2, border: '1px solid #169B62' }}>
                        <Typography sx={{ color: '#169B62', fontWeight: 600 }}>✓ {success}</Typography>
                    </Box>
                )}

                {error && (
                    <Box sx={{ mb: 3, p: 2, bgcolor: '#FEE2E2', borderRadius: 2, border: '1px solid #EF4444' }}>
                        <Typography sx={{ color: '#EF4444', fontWeight: 600 }}>✕ {error}</Typography>
                    </Box>
                )}

                <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, mb: 4, pb: 3, borderBottom: '1px solid #E5E7EB', gap: 2 }}>
                            <Avatar sx={{ bgcolor: '#169B62', width: { xs: 64, sm: 80 }, height: { xs: 64, sm: 80 }, fontSize: { xs: '24px', sm: '32px' }, mr: { xs: 0, sm: 3 } }}>{getUserInitial()}</Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#12321A', mb: 0.5, fontSize: { xs: '1.25rem', sm: '1.5rem' }, wordBreak: 'break-word' }}>{user?.name || 'User'}</Typography>
                                <Typography variant="body2" sx={{ color: '#6B7280', wordBreak: 'break-all' }}>{user?.email}</Typography>
                            </Box>
                            {!isEditMode && (
                                <Button onClick={handleEdit} variant="contained" sx={{ bgcolor: '#169B62', color: 'white', textTransform: 'none', fontWeight: 600, px: { xs: 2, sm: 3 }, py: 1.5, borderRadius: 2, whiteSpace: 'nowrap', alignSelf: { xs: 'stretch', sm: 'auto' }, '&:hover': { bgcolor: '#0F7A4D' } }}>
                                    Edit Profile
                                </Button>
                            )}
                        </Box>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#4B5563', mb: 1 }}>Full Name</Typography>
                                {isEditMode ? (
                                    <TextField fullWidth name="name" value={form.name} onChange={handleChange} placeholder="Enter your name" required />
                                ) : (
                                    <Typography variant="body1" sx={{ color: '#12321A', py: 1 }}>{form.name || '—'}</Typography>
                                )}
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#4B5563', mb: 1 }}>Email Address</Typography>
                                <TextField fullWidth value={user?.email || ''} disabled helperText="🔒 Email cannot be changed" InputProps={{ sx: { bgcolor: '#F9FAFB' } }} />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#4B5563', mb: 1 }}>Phone Number</Typography>
                                {isEditMode ? (
                                    <TextField fullWidth name="phone" value={form.phone} onChange={handleChange} placeholder="Enter phone number" />
                                ) : (
                                    <Typography variant="body1" sx={{ color: '#12321A', py: 1 }}>{form.phone || '—'}</Typography>
                                )}
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#4B5563', mb: 1 }}>Location</Typography>
                                {isEditMode ? (
                                    <TextField fullWidth name="location" value={form.location} onChange={handleChange} placeholder="Enter city/location" />
                                ) : (
                                    <Typography variant="body1" sx={{ color: '#12321A', py: 1 }}>{form.location || '—'}</Typography>
                                )}
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#4B5563', mb: 1 }}>Bio</Typography>
                                {isEditMode ? (
                                    <TextField fullWidth multiline rows={4} name="bio" value={form.bio} onChange={handleChange} placeholder="Tell us about yourself" />
                                ) : (
                                    <Typography variant="body1" sx={{ color: '#12321A', py: 1, whiteSpace: 'pre-wrap' }}>{form.bio || '—'}</Typography>
                                )}
                            </Grid>
                        </Grid>

                        {isEditMode && (
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'flex-end', mt: 4, pt: 3, borderTop: '1px solid #E5E7EB' }}>
                                <Button onClick={handleCancel} disabled={loading} variant="outlined" sx={{ textTransform: 'none', fontWeight: 600, px: 4, py: 1.5, borderRadius: 2, borderColor: '#D1D5DB', color: '#6B7280', '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F9FAFB' } }}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} disabled={loading} variant="contained" sx={{ textTransform: 'none', fontWeight: 600, px: 4, py: 1.5, borderRadius: 2, bgcolor: '#169B62', color: 'white', boxShadow: '0 4px 12px rgba(22, 155, 98, 0.3)', '&:hover': { bgcolor: '#0F7A4D' }, '&:disabled': { bgcolor: '#D1D5DB' } }}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
}
