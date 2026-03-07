function Dashboard({ onLogout }) {
    const { Typography, Box, Button, Chip, Card, CardMedia, CardContent, Grid, Container, useMediaQuery, useTheme } = MaterialUI;
    const { navigate } = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [properties, setProperties] = React.useState([]);
    const [deleteModal, setDeleteModal] = React.useState({ open: false, propertyId: null, propertyName: '' });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const response = await propertyService.getUserProperties();
            console.log('Properties response:', response);
            console.log('status', response.status);
            if (response.status && response.response && response.response.properties) {
                setProperties(response.response.properties);
            }
        } catch (error) {
            console.error('Failed to fetch properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNew = () => {
        navigate('/add-property');
    };

    const handleEdit = (property) => {
        const propertyData = encodeURIComponent(JSON.stringify(property));
        navigate(`/add-property?id=${property.id}&data=${propertyData}`);
    };

    const handleDeleteClick = (property) => {
        setDeleteModal({ open: true, propertyId: property.id, propertyName: property.name });
    };

    const handleDeleteConfirm = async () => {
        try {
            await propertyService.deleteProperty(deleteModal.propertyId);
            setProperties(properties.filter(p => p.id !== deleteModal.propertyId));
            setDeleteModal({ open: false, propertyId: null, propertyName: '' });
        } catch (error) {
            console.error('Failed to delete property:', error);
        }
    };
    
    return (
        <Box sx={{ 
            minHeight: '100vh',
            backgroundImage: 'url(app-bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            position: 'relative',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(255, 255, 255, 0.92)',
                zIndex: 0
            }
        }}>
            <Header onSignIn={() => {}} />
            
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, mt: 4, pb: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 'bold', color: '#111827', mb: 1 }}>
                        My Properties
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#6B7280' }}>
                        Manage all your property listings
                    </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ color: '#4B5563', fontWeight: '600' }}>
                        {properties.length} {properties.length === 1 ? 'property' : 'properties'}
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {/* Add New Property Card */}
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                        <Card 
                            onClick={handleAddNew}
                            sx={{ 
                                borderRadius: 3, 
                                boxShadow: 2,
                                cursor: 'pointer',
                                height: '100%',
                                minHeight: { xs: 125, sm: 400 },
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '3px dashed #169B62',
                                bgcolor: '#F0F9F5',
                                transition: 'all 0.3s',
                                '&:hover': { 
                                    transform: 'translateY(-4px)', 
                                    boxShadow: '0 8px 24px rgba(22, 155, 98, 0.2)',
                                    bgcolor: '#E8F5F0'
                                }
                            }}
                        >
                            <Box sx={{ textAlign: 'center' }}>
                                <Box sx={{ 
                                    fontSize: { xs: '60px', sm: '80px' },
                                    color: '#169B62',
                                    fontWeight: 'bold',
                                    mb: 2,
                                    textShadow: '2px 2px 4px rgba(22, 155, 98, 0.2)'
                                }}>
                                    +
                                </Box>
                                <Typography variant="h6" sx={{ color: '#169B62', fontWeight: 'bold' }}>
                                    Add New Property
                                </Typography>
                            </Box>
                        </Card>
                    </Grid>

                    {/* Existing Properties */}
                    {properties.map((property) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={property.id}>
                            <Card 
                                sx={{ 
                                    borderRadius: 3, 
                                    boxShadow: 2,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                                }}
                            >
                                <CardMedia component="img" height="200" image={property.image || 'https://via.placeholder.com/400x250?text=Property'} alt={property.name} />
                                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#169B62' }}>
                                            {property.price} / month
                                        </Typography>
                                        <Chip 
                                            label={property.status} 
                                            size="small"
                                            role="status"
                                            aria-label={`Property status: ${property.status}`}
                                            sx={{ 
                                                bgcolor: property.status === 'Active' ? '#E8F5F0' : '#FFF4ED',
                                                color: property.status === 'Active' ? '#169B62' : '#FF883E',
                                                fontWeight: 'bold'
                                            }} 
                                        />
                                    </Box>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        {property.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        🛏 {property.beds} Beds • 🚿 {property.bath} Bath
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        📍 {property.location}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                                        <Button 
                                            fullWidth
                                            variant="outlined"
                                            onClick={() => handleEdit(property)}
                                            aria-label={`Edit ${property.name}`}
                                            sx={{ 
                                                borderColor: '#169B62',
                                                color: '#169B62',
                                                textTransform: 'none',
                                                fontWeight: '600',
                                                '&:hover': { bgcolor: '#E8F5F0', borderColor: '#169B62' }
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Button 
                                            fullWidth
                                            variant="outlined"
                                            onClick={() => handleDeleteClick(property)}
                                            aria-label={`Delete ${property.name}`}
                                            sx={{ 
                                                borderColor: '#EF4444',
                                                color: '#EF4444',
                                                textTransform: 'none',
                                                fontWeight: '600',
                                                '&:hover': { bgcolor: '#FEE2E2', borderColor: '#EF4444' }
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            <ConfirmModal
                open={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, propertyId: null, propertyName: '' })}
                onConfirm={handleDeleteConfirm}
                title="Delete Property"
                message={`Are you sure you want to delete "${deleteModal.propertyName}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </Box>
    );
}
