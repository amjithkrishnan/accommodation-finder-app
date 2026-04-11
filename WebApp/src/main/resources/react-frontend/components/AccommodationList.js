function AccommodationList({ onSignIn, onSignUp, onViewDetails }) {
    const { Box, Typography, TextField, Button, Card, CardMedia, CardContent, Grid, Container, Chip, Avatar, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Pagination, Menu, MenuItem, useMediaQuery, useTheme } = MaterialUI;
    const { navigate } = useRouter();
    
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [searchLocation, setSearchLocation] = React.useState('');
    const [filterOpen, setFilterOpen] = React.useState(false);
    const [sortBy, setSortBy] = React.useState('newest');
    const [sortMenuAnchor, setSortMenuAnchor] = React.useState(null);
    const [filters, setFilters] = React.useState({
        propertyType: '',
        minPrice: '',
        maxPrice: '',
        bedrooms: '',
        moveInDate: ''
    });
    const [page, setPage] = React.useState(1);
    const [accommodations, setAccommodations] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [totalPages, setTotalPages] = React.useState(0);
    const [totalCount, setTotalCount] = React.useState(0);
    const [propertyTypes, setPropertyTypes] = React.useState([]);
    const pageSize = 12;

    React.useEffect(() => {
        masterDataService.getAllMasterData().then(res => {
            if (res.status && res.response) setPropertyTypes(res.response.propertyTypes || []);
        }).catch(() => {});
    }, []);

    React.useEffect(() => {
        fetchProperties(page);
    }, [page, sortBy]);

    const fetchProperties = async (currentPage = 1, currentSearch = searchLocation, currentFilters = filters) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (currentSearch) params.append('location', currentSearch);
            if (currentFilters.propertyType) params.append('propertyType', currentFilters.propertyType);
            if (currentFilters.minPrice) params.append('minPrice', currentFilters.minPrice);
            if (currentFilters.maxPrice) params.append('maxPrice', currentFilters.maxPrice);
            if (currentFilters.bedrooms) params.append('bedrooms', currentFilters.bedrooms);
            if (currentFilters.moveInDate) params.append('availableFrom', currentFilters.moveInDate);
            if (sortBy === 'price-low') params.append('sortBy', 'price');
            if (sortBy === 'price-high') { params.append('sortBy', 'price'); params.append('sortDir', 'desc'); }
            params.append('page', currentPage - 1);
            params.append('size', pageSize);

            const response = await propertyService.searchProperties(params.toString());
            if (response.status && response.response?.properties) {
                let results = response.response.properties.content || response.response.properties;
                // Client-side sort fallback
                if (sortBy === 'price-low') results = [...results].sort((a, b) => parseFloat(a.price?.replace(/[^0-9.]/g, '') || 0) - parseFloat(b.price?.replace(/[^0-9.]/g, '') || 0));
                if (sortBy === 'price-high') results = [...results].sort((a, b) => parseFloat(b.price?.replace(/[^0-9.]/g, '') || 0) - parseFloat(a.price?.replace(/[^0-9.]/g, '') || 0));
                setAccommodations(results);
                setTotalCount(response.response.properties.totalElements || results.length);
                setTotalPages(response.response.properties.totalPages || Math.ceil((response.response.properties.totalElements || results.length) / pageSize));
            }
        } catch (error) {
            console.error('Failed to fetch properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPage(1);
        fetchProperties(1, searchLocation, filters);
    };

    const handleFilterApply = () => {
        setFilterOpen(false);
        setPage(1);
        fetchProperties(1, searchLocation, filters);
    };

    const handleFilterReset = () => {
        const reset = { propertyType: '', minPrice: '', maxPrice: '', bedrooms: '', moveInDate: '' };
        setFilters(reset);
        setPage(1);
        fetchProperties(1, searchLocation, reset);
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
            <Header onSignIn={onSignIn} />

            {/* Search Bar */}
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, mt: 4 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'stretch' }}>
                    <Box sx={{ 
                        bgcolor: 'white', 
                        borderRadius: 3, 
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                        display: 'flex',
                        gap: 0,
                        alignItems: 'stretch',
                        border: '2px solid #E5E7EB',
                        flex: 1,
                        '&:focus-within': {
                            borderColor: '#169B62',
                            boxShadow: '0 4px 20px rgba(22, 155, 98, 0.15)'
                        }
                    }}>
                        <TextField
                            fullWidth
                            placeholder="Search by location, city, or area..."
                            value={searchLocation}
                            onChange={(e) => setSearchLocation(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            size={isMobile ? 'small' : 'medium'}
                            sx={{ 
                                '& .MuiOutlinedInput-root': { 
                                    '& fieldset': { border: 'none' },
                                    borderRadius: 0
                                }
                            }}
                        />
                        <Button 
                            variant="text" 
                            onClick={() => setFilterOpen(true)}
                            sx={{ 
                                minWidth: isMobile ? 70 : 100,
                                borderLeft: '2px solid #E5E7EB',
                                borderRadius: 0,
                                color: '#6B7280',
                                fontWeight: '600',
                                textTransform: 'none',
                                fontSize: '15px',
                                '&:hover': { bgcolor: '#E8F5F0', color: '#169B62' }
                            }}
                        >
                            Filter
                        </Button>
                    </Box>
                    <Button 
                        variant="contained"
                        onClick={handleSearch}
                        sx={{ 
                            minWidth: isMobile ? 80 : 120,
                            bgcolor: '#169B62',
                            fontWeight: '600',
                            textTransform: 'none',
                            borderRadius: 3,
                            border: '2px solid white',
                            boxShadow: '0 4px 12px rgba(22, 155, 98, 0.3)',
                            py: isMobile ? 1.5 : 2,
                            '&:hover': { bgcolor: '#0F7A4D', boxShadow: '0 6px 16px rgba(22, 155, 98, 0.4)' }
                        }}
                    >
                        Search
                    </Button>
                </Box>

                {/* Filter Dialog */}
                <Dialog open={filterOpen} onClose={() => setFilterOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ bgcolor: '#169B62', color: 'white', fontWeight: 'bold' }}>Filters</DialogTitle>
                    <DialogContent sx={{ mt: 2 }}>
                        <TextField select fullWidth label="Property Type" margin="normal" value={filters.propertyType} onChange={(e) => setFilters({...filters, propertyType: e.target.value})} SelectProps={{ native: true }}>
                            <option value="">All</option>
                            {propertyTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </TextField>
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <TextField fullWidth label="Min Price" type="number" value={filters.minPrice} onChange={(e) => setFilters({...filters, minPrice: e.target.value})} />
                            <TextField fullWidth label="Max Price" type="number" value={filters.maxPrice} onChange={(e) => setFilters({...filters, maxPrice: e.target.value})} />
                        </Box>
                        <TextField fullWidth label="Bedrooms" type="number" margin="normal" value={filters.bedrooms} onChange={(e) => setFilters({...filters, bedrooms: e.target.value})} />
                        <TextField fullWidth label="Move-in Date" type="date" margin="normal" InputLabelProps={{ shrink: true }} value={filters.moveInDate} onChange={(e) => setFilters({...filters, moveInDate: e.target.value})} />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={handleFilterReset} sx={{ color: '#6B7280' }}>Reset</Button>
                        <Button variant="contained" onClick={handleFilterApply} sx={{ bgcolor: '#169B62', '&:hover': { bgcolor: '#0F7A4D' } }}>Apply Filters</Button>
                    </DialogActions>
                </Dialog>

                {/* Listings Section */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    gap: 2,
                    mt: 5, 
                    mb: 3 
                }}>
                    <Typography variant="body1" sx={{ color: '#4B5563', fontWeight: '600' }}>
                        {totalCount} properties available
                    </Typography>
                    <Box
                        onClick={(e) => setSortMenuAnchor(e.currentTarget)}
                        sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            cursor: 'pointer',
                            color: '#169B62',
                            fontWeight: '600',
                            '&:hover': { color: '#0F7A4D' }
                        }}
                    >
                        <Typography sx={{ fontSize: '14px', fontWeight: '600' }}>
                            {sortBy === 'price-low' ? 'Price: Low to High' : sortBy === 'price-high' ? 'Price: High to Low' : 'Newest First'}
                        </Typography>
                        <span style={{ fontSize: '12px' }}>▼</span>
                    </Box>
                    <Menu
                        anchorEl={sortMenuAnchor}
                        open={Boolean(sortMenuAnchor)}
                        onClose={() => setSortMenuAnchor(null)}
                        PaperProps={{
                            sx: {
                                borderRadius: 3,
                                boxShadow: 3,
                                mt: 1
                            }
                        }}
                    >
                        <MenuItem 
                            onClick={() => { setSortBy('newest'); setSortMenuAnchor(null); }}
                            sx={{ '&:hover': { bgcolor: '#f0f9f5' }, color: sortBy === 'newest' ? '#169B62' : 'inherit', fontWeight: sortBy === 'newest' ? 'bold' : 'normal' }}
                        >
                            Newest First
                        </MenuItem>
                        <MenuItem 
                            onClick={() => { setSortBy('price-low'); setSortMenuAnchor(null); }}
                            sx={{ '&:hover': { bgcolor: '#f0f9f5' }, color: sortBy === 'price-low' ? '#169B62' : 'inherit', fontWeight: sortBy === 'price-low' ? 'bold' : 'normal' }}
                        >
                            Price: Low to High
                        </MenuItem>
                        <MenuItem 
                            onClick={() => { setSortBy('price-high'); setSortMenuAnchor(null); }}
                            sx={{ '&:hover': { bgcolor: '#f0f9f5' }, color: sortBy === 'price-high' ? '#169B62' : 'inherit', fontWeight: sortBy === 'price-high' ? 'bold' : 'normal' }}
                        >
                            Price: High to Low
                        </MenuItem>
                    </Menu>
                </Box>

                <Grid container spacing={3}>
                    {loading ? (
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                <Typography>Loading properties...</Typography>
                            </Box>
                        </Grid>
                    ) : !accommodations || accommodations.length === 0 ? (
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                <Typography>No properties found</Typography>
                            </Box>
                        </Grid>
                    ) : (
                        accommodations.map((acc) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={acc.id}>
                            <Card 
                                sx={{ 
                                    borderRadius: 3, 
                                    boxShadow: 2,
                                    cursor: 'pointer',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                                }}
                                onClick={() => {
                                    navigate(`/property?id=${acc.id}`);
                                }}
                            >
                                <CardMedia component="img" height="200" image={acc.image || 'https://via.placeholder.com/400x250?text=No+Image'} alt={acc.name} />
                                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#169B62' }}>
                                            {acc.price} / month
                                        </Typography>
                                        <Chip label="For Rent" size="small" sx={{ bgcolor: '#FF883E', color: 'white', fontWeight: 'bold' }} />
                                    </Box>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        {acc.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        🛏 {acc.beds} Beds • 🚿 {acc.bath} Bath
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {acc.propertyType} • {acc.location}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {acc.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        ))
                    )}
                </Grid>

                {/* Pagination */}
                {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '150px', mt: 5, mb: 0 }}>
                    <Pagination count={totalPages} page={page} onChange={(e, value) => setPage(value)} color="primary" sx={{ '& .MuiPaginationItem-root': { color: '#169B62' } }} />
                </Box>
                )}
            </Container>
        </Box>
    );
}
