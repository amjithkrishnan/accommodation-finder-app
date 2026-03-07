function AddProperty({ onBack }) {
    const { Typography, Box, Button, TextField, MenuItem, Container, Grid, Tabs, Tab, IconButton } = MaterialUI;
    const { navigate, params } = useRouter();
    const isEditMode = !!params.id;
    
    const [form, setForm] = React.useState({
        title: '',
        location: '',
        propertyType: '',
        price: '',
        bedrooms: '',
        bathrooms: '',
        availableFrom: '',
        description: '',
        amenities: []
    });
    
    const [images, setImages] = React.useState([]);
    const [videos, setVideos] = React.useState([]);
    const [mediaTab, setMediaTab] = React.useState(0);
    const [errors, setErrors] = React.useState({});
    const [loading, setLoading] = React.useState(false);

    const [propertyTypes, setPropertyTypes] = React.useState([]);
    const [amenitiesList, setAmenitiesList] = React.useState([]);

    React.useEffect(() => {
        fetchMasterData();
    }, []);

    const fetchMasterData = async () => {
        try {
            const [typesRes, amenitiesRes] = await Promise.all([
                masterDataService.getPropertyTypes(),
                masterDataService.getAmenities()
            ]);
            if (typesRes.status && typesRes.response) setPropertyTypes(typesRes.response.propertyTypes || []);
            if (amenitiesRes.status && amenitiesRes.response) setAmenitiesList(amenitiesRes.response.amenities || []);
        } catch (error) {
            console.error('Failed to fetch master data:', error);
        }
    };

    React.useEffect(() => {
        if (isEditMode && params.id) {
            const propertyData = JSON.parse(decodeURIComponent(params.data || '{}'));
            setForm({
                title: propertyData.name || '',
                location: propertyData.location || '',
                propertyType: propertyData.propertyType || '',
                price: propertyData.price?.replace('€', '').replace(',', '').trim() || '',
                bedrooms: propertyData.beds || '',
                bathrooms: propertyData.bath || '',
                availableFrom: propertyData.availableFrom || '',
                description: propertyData.description || '',
                amenities: propertyData.amenities || []
            });
            if (propertyData.image) {
                setImages([{ id: 1, preview: propertyData.image, existing: true }]);
            }
        }
    }, [isEditMode, params.id, params.data]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleAmenityToggle = (amenity) => {
        setForm(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            id: Date.now() + Math.random()
        }));
        setImages(prev => [...prev, ...newImages]);
    };

    const handleVideoSelect = (e) => {
        const files = Array.from(e.target.files);
        const newVideos = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            id: Date.now() + Math.random()
        }));
        setVideos(prev => [...prev, ...newVideos]);
    };

    const removeImage = (id) => {
        setImages(prev => prev.filter(img => img.id !== id));
    };

    const removeVideo = (id) => {
        setVideos(prev => prev.filter(vid => vid.id !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('location', form.location);
            formData.append('city', form.location);
            formData.append('propertyType', form.propertyType);
            formData.append('price', parseFloat(form.price));
            formData.append('bedrooms', parseInt(form.bedrooms));
            formData.append('bathrooms', parseInt(form.bathrooms));
            formData.append('availableFrom', form.availableFrom);
            formData.append('description', form.description);
            
            form.amenities.forEach(amenity => formData.append('amenities', amenity));
            
            images.forEach(img => {
                if (img.file && !img.existing) {
                    formData.append('images', img.file);
                }
            });
            
            videos.forEach(vid => {
                if (vid.file && !vid.existing) {
                    formData.append('videos', vid.file);
                }
            });

            if (isEditMode && params.id) {
                await propertyService.updateProperty(params.id, formData);
            } else {
                await propertyService.createProperty(formData);
            }
            
            navigate('/my-properties');
        } catch (error) {
            console.error('Failed to save property:', error);
            setErrors({ submit: error.response?.data?.message || 'Failed to save property' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F5F6F7' }}>
            <Header />
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Breadcrumb items={[
                    { label: 'My Properties', path: '/my-properties' },
                    { label: isEditMode ? 'Edit Property' : 'Add New Property' }
                ]} />
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#12321A', mb: 1 }}>
                        {isEditMode ? 'Edit Property' : 'Add New Property'}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#6B7280' }}>
                        {isEditMode ? 'Update your property details' : 'List your accommodation for tenants'}
                    </Typography>
                </Box>

                <Box component="form" onSubmit={handleSubmit} sx={{ bgcolor: 'white', borderRadius: 3, boxShadow: 2, p: 4 }}>
                    {/* Basic Info */}
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#169B62', mb: 2 }}>Basic Information</Typography>
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Property Title" name="title" value={form.title} onChange={handleChange} required error={!!errors.title} helperText={errors.title} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Location" name="location" value={form.location} onChange={handleChange} required error={!!errors.location} helperText={errors.location} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth select label="Property Type" name="propertyType" value={form.propertyType} onChange={handleChange} required error={!!errors.propertyType} helperText={errors.propertyType}>
                                {propertyTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Price (€/month)" name="price" type="number" value={form.price} onChange={handleChange} required error={!!errors.price} helperText={errors.price} />
                        </Grid>
                    </Grid>

                    {/* Details */}
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#169B62', mb: 2 }}>Details</Typography>
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Bedrooms" name="bedrooms" type="number" value={form.bedrooms} onChange={handleChange} required />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Bathrooms" name="bathrooms" type="number" value={form.bathrooms} onChange={handleChange} required />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Available From" name="availableFrom" type="date" value={form.availableFrom} onChange={handleChange} InputLabelProps={{ shrink: true }} required />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth multiline rows={4} label="Description" name="description" value={form.description} onChange={handleChange} required />
                        </Grid>
                    </Grid>

                    {/* Amenities */}
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#169B62', mb: 2 }}>Amenities</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
                        {amenitiesList.map(amenity => (
                            <Button
                                key={amenity}
                                onClick={() => handleAmenityToggle(amenity)}
                                variant={form.amenities.includes(amenity) ? 'contained' : 'outlined'}
                                sx={{
                                    textTransform: 'none',
                                    borderRadius: 2,
                                    bgcolor: form.amenities.includes(amenity) ? '#169B62' : 'transparent',
                                    color: form.amenities.includes(amenity) ? 'white' : '#169B62',
                                    borderColor: '#169B62',
                                    '&:hover': { bgcolor: form.amenities.includes(amenity) ? '#0F7A4D' : '#E8F5F0' }
                                }}
                            >
                                {amenity}
                            </Button>
                        ))}
                    </Box>

                    {/* Media Upload */}
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#169B62', mb: 2 }}>Media Upload</Typography>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                        <Tabs value={mediaTab} onChange={(e, v) => setMediaTab(v)} sx={{ '& .MuiTab-root.Mui-selected': { color: '#169B62' }, '& .MuiTabs-indicator': { bgcolor: '#169B62' } }}>
                            <Tab label={`Images (${images.length})`} sx={{ textTransform: 'none', fontWeight: 600 }} />
                            <Tab label={`Videos (${videos.length})`} sx={{ textTransform: 'none', fontWeight: 600 }} />
                        </Tabs>
                    </Box>

                    {mediaTab === 0 && (
                        <Box>
                            <Box sx={{ border: '2px dashed #169B62', borderRadius: 2, p: { xs: 2, sm: 3 }, textAlign: 'center', bgcolor: '#E8F5F0', mb: 2, cursor: 'pointer' }} onClick={() => document.getElementById('image-input').click()}>
                                <Typography variant="body1" sx={{ fontSize: { xs: '1.5rem', sm: '1rem' }, color: '#169B62', fontWeight: 600, mb: 1 }}>📷 Click to upload images</Typography>
                                <Typography variant="body2" sx={{ color: '#6B7280' }}>PNG, JPG, JPEG (Max 5MB each)</Typography>
                                <input id="image-input" type="file" accept="image/*" multiple onChange={handleImageSelect} style={{ display: 'none' }} />
                            </Box>
                            {images.length === 0 ? (
                                <Typography variant="body2" sx={{ color: '#9CA3AF', textAlign: 'center', py: 2 }}>No images uploaded yet</Typography>
                            ) : (
                                <Grid container spacing={2}>
                                    {images.map(img => (
                                        <Grid item xs={6} sm={4} md={3} key={img.id}>
                                            <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', boxShadow: 1 }}>
                                                <img src={img.preview} alt="Preview" style={{ width: '100%', height: 150, objectFit: 'cover' }} />
                                                <IconButton onClick={() => removeImage(img.id)} aria-label="Remove image" sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(239, 68, 68, 0.9)', color: 'white', '&:hover': { bgcolor: '#DC2626' }, width: 32, height: 32 }}>
                                                    <span style={{ fontSize: 18 }}>✕</span>
                                                </IconButton>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Box>
                    )}

                    {mediaTab === 1 && (
                        <Box>
                            <Box sx={{ border: '2px dashed #FF883E', borderRadius: 2, p: { xs: 2, sm: 3 }, textAlign: 'center', bgcolor: '#FFF4ED', mb: 2, cursor: 'pointer' }} onClick={() => document.getElementById('video-input').click()}>
                                <Typography variant="body1" sx={{ fontSize: { xs: '1.5rem', sm: '1rem' }, color: '#FF883E', fontWeight: 600, mb: 1 }}>🎥 Click to upload videos</Typography>
                                <Typography variant="body2" sx={{ color: '#6B7280' }}>MP4, MOV, AVI (Max 50MB each)</Typography>
                                <input id="video-input" type="file" accept="video/*" multiple onChange={handleVideoSelect} style={{ display: 'none' }} />
                            </Box>
                            {videos.length === 0 ? (
                                <Typography variant="body2" sx={{ color: '#9CA3AF', textAlign: 'center', py: 2 }}>No videos uploaded yet</Typography>
                            ) : (
                                <Grid container spacing={2}>
                                    {videos.map(vid => (
                                        <Grid item xs={6} sm={4} md={3} key={vid.id}>
                                            <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', boxShadow: 1 }}>
                                                <video src={vid.preview} style={{ width: '100%', height: 150, objectFit: 'cover' }} muted />
                                                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'rgba(0,0,0,0.6)', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <span style={{ color: 'white', fontSize: 20 }}>▶</span>
                                                </Box>
                                                <IconButton onClick={() => removeVideo(vid.id)} aria-label="Remove video" sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(239, 68, 68, 0.9)', color: 'white', '&:hover': { bgcolor: '#DC2626' }, width: 32, height: 32 }}>
                                                    <span style={{ fontSize: 18 }}>✕</span>
                                                </IconButton>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Box>
                    )}

                    {/* Actions */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
                        <Button onClick={() => navigate('/my-properties')} variant="outlined" sx={{ textTransform: 'none', fontWeight: 600, px: { xs: 2, sm: 4 }, py: { xs: 1, sm: 1.5 }, borderRadius: 2, borderColor: '#D1D5DB', color: '#6B7280', '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F9FAFB' } }}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} variant="contained" sx={{ textTransform: 'none', fontWeight: 600, px: { xs: 2, sm: 4 }, py: { xs: 1, sm: 1.5 }, borderRadius: 2, bgcolor: '#169B62', color: 'white', boxShadow: '0 4px 12px rgba(22, 155, 98, 0.3)', '&:hover': { bgcolor: '#0F7A4D' }, '&:disabled': { bgcolor: '#D1D5DB' } }}>
                            {loading ? 'Saving...' : (isEditMode ? 'Update Property' : 'Save Property')}
                        </Button>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
