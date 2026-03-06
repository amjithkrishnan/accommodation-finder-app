function PropertyDetails({ onBack, onSignIn }) {
    const { Box, Container, Grid, Card, CardContent, CardMedia, Typography, Button, Avatar, Tabs, Tab, Chip, useMediaQuery, useTheme } = MaterialUI;
    
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [mainImage, setMainImage] = React.useState('https://via.placeholder.com/800x500?text=Main+Property');
    const [mainMediaType, setMainMediaType] = React.useState('image');
    const [activeTab, setActiveTab] = React.useState(0);
    
    const media = [
        { url: 'https://via.placeholder.com/800x500?text=Image+1', type: 'image' },
        { url: 'https://via.placeholder.com/800x500?text=Image+2', type: 'image' },
        { url: 'https://via.placeholder.com/800x500?text=Image+3', type: 'image' },
        { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', type: 'video' },
        { url: 'https://via.placeholder.com/800x500?text=Image+4', type: 'image' },
        { url: 'https://via.placeholder.com/800x500?text=Image+5', type: 'image' },
        { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', type: 'video' },
        { url: 'https://via.placeholder.com/800x500?text=Image+6', type: 'image' }
    ];

    const similarListings = [
        { id: 1, name: 'Cozy Studio', price: '€950', beds: 1, bath: 1, city: 'Dublin', image: 'https://via.placeholder.com/300x200?text=Studio' },
        { id: 2, name: '3-Bed House', price: '€1,800', beds: 3, bath: 2, city: 'Cork', image: 'https://via.placeholder.com/300x200?text=House' }
    ];

    const amenities = ['Balcony', 'Fully Furnished', 'Modern Kitchen', 'High-Speed Internet', 'In-Unit Laundry', 'Parking Available'];

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
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
                <Button onClick={onBack} sx={{ mb: 3, color: '#169B62', fontWeight: 'bold' }}>
                    ← Back to Listings
                </Button>

                <Grid container spacing={3}>
                    {/* LEFT - Image Gallery */}
                    <Grid item xs={12} md={8}>
                        <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 3 }}>
                            {mainMediaType === 'image' ? (
                                <CardMedia
                                    component="img"
                                    image={mainImage}
                                    alt="Property"
                                    sx={{ height: isMobile ? 300 : 500, objectFit: 'cover' }}
                                />
                            ) : (
                                <Box sx={{ height: isMobile ? 300 : 500, bgcolor: '#000' }}>
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={mainImage}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </Box>
                            )}
                        </Card>
                        
                        <Box sx={{ 
                            display: 'flex', 
                            gap: 2, 
                            overflowX: 'auto',
                            pb: 2,
                            mb: 3,
                            '&::-webkit-scrollbar': { height: 8 },
                            '&::-webkit-scrollbar-thumb': { bgcolor: '#169B62', borderRadius: 4 }
                        }}>
                            {media.map((item, idx) => (
                                <Box
                                    key={idx}
                                    onClick={() => { setMainImage(item.url); setMainMediaType(item.type); }}
                                    sx={{
                                        minWidth: isMobile ? 80 : 120,
                                        width: isMobile ? 80 : 120,
                                        height: isMobile ? 60 : 90,
                                        borderRadius: 2,
                                        cursor: 'pointer',
                                        border: mainImage === item.url ? '3px solid #169B62' : '3px solid #e0e0e0',
                                        transition: 'all 0.2s',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&:hover': { opacity: 0.8 }
                                    }}
                                >
                                    {item.type === 'image' ? (
                                        <Box
                                            component="img"
                                            src={item.url}
                                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <Box sx={{ 
                                            width: '100%', 
                                            height: '100%', 
                                            bgcolor: '#000',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '32px'
                                        }}>
                                            ▶
                                        </Box>
                                    )}
                                </Box>
                            ))}
                        </Box>

                        {/* Tabs Section */}
                        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                            <Tabs 
                                value={activeTab} 
                                onChange={(e, val) => setActiveTab(val)}
                                sx={{ 
                                    borderBottom: '1px solid #e0e0e0',
                                    '& .MuiTab-root': { fontWeight: 'bold', color: '#666' },
                                    '& .Mui-selected': { color: '#169B62' },
                                    '& .MuiTabs-indicator': { bgcolor: '#169B62' }
                                }}
                            >
                                <Tab label="Property Details" />
                                <Tab label="Description" />
                                <Tab label="Amenities" />
                            </Tabs>

                            <Box sx={{ p: 3 }}>
                                {activeTab === 0 && (
                                    <Grid container spacing={2}>
                                        {[
                                            { label: 'Beds', value: '2', icon: '🛏' },
                                            { label: 'Bath', value: '1', icon: '🚿' },
                                            { label: 'Property Type', value: 'Apartment', icon: '🏢' },
                                            { label: 'Size', value: '820 sq.ft', icon: '📏' },
                                            { label: 'Available From', value: 'May 1, 2024', icon: '📅' },
                                            { label: 'Listing ID', value: 'DB-123456', icon: '🔖' }
                                        ].map((item, idx) => (
                                            <Grid item xs={12} sm={6} key={idx}>
                                                <Card sx={{ p: 2, bgcolor: '#f0f9f5', boxShadow: 1 }}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                        {item.icon} {item.label}
                                                    </Typography>
                                                    <Typography sx={{ fontWeight: 'bold' }}>{item.value}</Typography>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                )}

                                {activeTab === 1 && (
                                    <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#555' }}>
                                        This modern furnished apartment in Dublin offers a perfect blend of comfort and style. 
                                        Located in the heart of the city, it features a spacious balcony with stunning city views, 
                                        an open-concept kitchen with modern appliances, and a bright living area filled with natural light. 
                                        The apartment is ideal for professionals or small families looking for a convenient and stylish 
                                        living space in Dublin's vibrant city center. Close to public transport, shopping, and dining options.
                                    </Typography>
                                )}

                                {activeTab === 2 && (
                                    <Grid container spacing={2}>
                                        {amenities.map((amenity, idx) => (
                                            <Grid item xs={12} sm={6} key={idx}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box sx={{ 
                                                        width: 24, 
                                                        height: 24, 
                                                        borderRadius: '50%', 
                                                        bgcolor: '#169B62', 
                                                        color: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '14px',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        ✓
                                                    </Box>
                                                    <Typography>{amenity}</Typography>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                )}
                            </Box>
                        </Card>

                        {/* Similar Listings */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#169B62' }}>Similar Listings</Typography>
                            <Box sx={{ 
                                display: 'flex', 
                                gap: 2, 
                                overflowX: 'auto',
                                pb: 2,
                                '&::-webkit-scrollbar': { height: 8 },
                                '&::-webkit-scrollbar-thumb': { bgcolor: '#169B62', borderRadius: 4 }
                            }}>
                                {similarListings.map(listing => (
                                    <Card 
                                        key={listing.id} 
                                        sx={{ 
                                            minWidth: 280, 
                                            boxShadow: 2,
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                                        }}
                                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                    >
                                        <CardMedia component="img" height="160" image={listing.image} alt={listing.name} />
                                        <CardContent sx={{ p: 2 }}>
                                            <Typography sx={{ fontWeight: 'bold', color: '#169B62', mb: 1 }}>
                                                {listing.price} / month
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                {listing.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                🛏 {listing.beds} • 🚿 {listing.bath} • {listing.city}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>
                        </Box>
                    </Grid>

                    {/* RIGHT - Property Summary (Sticky) */}
                    <Grid item xs={12} md={4}>
                        <Box sx={{ position: isMobile ? 'relative' : 'sticky', top: isMobile ? 0 : 80 }}>
                            <Card sx={{ borderRadius: 3, boxShadow: 3, p: 3 }}>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#169B62', mb: 1 }}>
                                    €1,200 / month
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                    Modern 2-Bed Apartment in Dublin
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                                    <Chip icon={<span>🛏</span>} label="2 Beds" sx={{ bgcolor: '#f0f9f5' }} />
                                    <Chip icon={<span>🚿</span>} label="1 Bath" sx={{ bgcolor: '#f0f9f5' }} />
                                    <Chip icon={<span>🏢</span>} label="Apartment" sx={{ bgcolor: '#f0f9f5' }} />
                                    <Chip icon={<span>📍</span>} label="Dublin" sx={{ bgcolor: '#f0f9f5' }} />
                                </Box>

                                <Typography variant="body2" sx={{ mb: 2, color: '#555' }}>
                                    📍 Dublin, Ireland
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, pb: 3, borderBottom: '1px solid #e0e0e0' }}>
                                    <Typography sx={{ color: '#FF6600', fontWeight: 'bold' }}>⭐ 4.9</Typography>
                                    <Typography variant="body2" color="text.secondary">(18 Reviews)</Typography>
                                </Box>

                                {/* Agent Contact */}
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Contact Agent</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Avatar sx={{ width: 56, height: 56, bgcolor: '#169B62' }}>SN</Avatar>
                                    <Box>
                                        <Typography sx={{ fontWeight: 'bold' }}>Sarah Nolan</Typography>
                                        <Typography variant="body2" color="text.secondary">Leasing Agent</Typography>
                                    </Box>
                                </Box>
                                <Typography variant="body2" sx={{ mb: 1 }}>📞 +353 01 234 5678</Typography>
                                <Typography variant="body2" sx={{ mb: 2 }}>✉️ sarah.nolan@findyouraccommodation.ie</Typography>
                                <Button 
                                    fullWidth 
                                    variant="contained" 
                                    sx={{ 
                                        bgcolor: '#FF6600', 
                                        fontWeight: 'bold',
                                        py: 1.5,
                                        '&:hover': { bgcolor: '#E55A00' }
                                    }}
                                >
                                    Contact Agent
                                </Button>
                            </Card>
                        </Box>
                    </Grid>

                </Grid>
            </Container>
        </Box>
    );
}
