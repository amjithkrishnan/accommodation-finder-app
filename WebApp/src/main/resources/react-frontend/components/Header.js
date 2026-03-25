function Header({ onSignIn }) {
    const { AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, List, ListItem, ListItemText, Avatar, Popover, useMediaQuery, useTheme } = MaterialUI;
    const { user, logout } = useAuth();
    
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [userMenuAnchor, setUserMenuAnchor] = React.useState(null);

    const handleLogout = async () => {
        await logout();
        setUserMenuAnchor(null);
        window.location.hash = '/';
    };

    const getUserInitial = () => {
        return user?.email ? user.email.charAt(0).toUpperCase() : 'U';
    };

    return (
        <>
            <AppBar position="sticky" sx={{ 
                bgcolor: 'white', 
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                borderBottom: '3px solid',
                borderImage: 'linear-gradient(to right, #169B62 33%, #FFFFFF 33%, #FFFFFF 66%, #FF883E 66%) 1',
                zIndex: 10 
            }}>
                <Toolbar sx={{ py: 1.5 }}>
                    <Typography variant="h5" sx={{ 
                        fontWeight: 'bold', 
                        color: '#169B62',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}>
                        🏡 AccommodateMe
                    </Typography>
                    
                    <Box sx={{ flexGrow: 1 }} />
                    
                    {!isMobile ? (
                        user ? (
                        <>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Button 
                                onClick={() => window.location.hash = '/explore'}
                                sx={{ 
                                    color: '#4B5563',
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    '&:hover': { color: '#169B62', bgcolor: '#E8F5F0' }
                                }}
                            >
                                Explore Stays
                            </Button>
                            <Button 
                                onClick={() => window.location.hash = '/my-properties'}
                                sx={{ 
                                    color: '#4B5563',
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    '&:hover': { color: '#169B62', bgcolor: '#E8F5F0' }
                                }}
                            >
                                Manage Properties
                            </Button>
                            <Button 
                                onClick={() => window.location.hash = '/profile'}
                                sx={{ 
                                    color: '#4B5563',
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    '&:hover': { color: '#169B62', bgcolor: '#E8F5F0' }
                                }}
                            >
                                Profile
                            </Button>
                            <Button 
                                onClick={handleLogout}
                                sx={{ 
                                    bgcolor: '#FEE2E2',
                                    color: '#EF4444',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 2.5,
                                    py: 0.75,
                                    borderRadius: 2,
                                    '&:hover': { bgcolor: '#FECACA', color: '#DC2626' }
                                }}
                            >
                                Logout
                            </Button>
                            <IconButton onClick={(e) => setUserMenuAnchor(e.currentTarget)}>
                                <Avatar sx={{ bgcolor: '#169B62', width: 40, height: 40, fontSize: '18px' }}>
                                    {getUserInitial()}
                                </Avatar>
                            </IconButton>
                        </Box>
                        <Popover
                            open={Boolean(userMenuAnchor)}
                            anchorEl={userMenuAnchor}
                            onClose={() => setUserMenuAnchor(null)}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            PaperProps={{
                                sx: {
                                    mt: 1,
                                    borderRadius: 2,
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                                    minWidth: 220,
                                    p: 2
                                }
                            }}
                        >
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                                    Logged in as
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#169B62', fontWeight: 600 }}>
                                    {user?.name || user?.email}
                                </Typography>
                            </Box>
                        </Popover>
                        </>
                        ) : (
                            <Button 
                                variant="contained" 
                                onClick={onSignIn}
                                sx={{ 
                                    bgcolor: '#169B62', 
                                    color: 'white', 
                                    fontWeight: '600',
                                    textTransform: 'none',
                                    px: 3,
                                    py: 1,
                                    borderRadius: 2,
                                    boxShadow: 'none',
                                    '&:hover': { bgcolor: '#0F7A4D', boxShadow: 'none' }
                                }}
                            >
                                Sign In
                            </Button>
                        )
                    ) : (
                        <>
                            <Box sx={{ flexGrow: 1 }} />
                            <IconButton sx={{ color: '#169B62' }} onClick={() => setMobileMenuOpen(true)}>
                                ☰
                            </IconButton>
                        </>
                    )}
                </Toolbar>
            </AppBar>

            <Drawer anchor="right" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
                <Box sx={{ width: 250, pt: 2 }}>
                    <List>
                        {user && (
                            <>
                                <ListItem button onClick={() => { window.location.hash = '/explore'; setMobileMenuOpen(false); }}><ListItemText primary="Explore Stays" /></ListItem>
                                <ListItem button onClick={() => { window.location.hash = '/my-properties'; setMobileMenuOpen(false); }}><ListItemText primary="My Properties" /></ListItem>
                                <ListItem button onClick={() => { window.location.hash = '/profile'; setMobileMenuOpen(false); }}><ListItemText primary="Profile" /></ListItem>
                                <ListItem button onClick={handleLogout}>
                                    <ListItemText primary="Logout" sx={{ color: '#EF4444' }} />
                                </ListItem>
                            </>
                        )}
                    </List>
                </Box>
            </Drawer>
        </>
    );
}
