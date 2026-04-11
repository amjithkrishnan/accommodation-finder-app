function AddProperty({ onBack }) {
    const { Typography, Box, Button, TextField, MenuItem, Container, Grid, Tabs, Tab, IconButton } = MaterialUI;
    const { navigate, params } = useRouter();
    const isEditMode = !!params.id;
    
    const [form, setForm] = React.useState({
        address: '',
        eircode: '',
        city: '',
        county: '',
        propertyType: '',
        furnishType: '',
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
    const [counties, setCounties] = React.useState([]);

    React.useEffect(() => {
        fetchMasterData();
    }, []);

    const fetchMasterData = async () => {
        try {
            const res = await masterDataService.getAllMasterData();
            if (res.status && res.response) {
                setPropertyTypes(res.response.propertyTypes || []);
                setAmenitiesList(res.response.amenities || []);
                setCounties(res.response.counties || []);
            }
        } catch (error) {
            console.error('Failed to fetch master data:', error);
        }
    };

    React.useEffect(() => {
        if (isEditMode && params.id) {
            const propertyData = JSON.parse(decodeURIComponent(params.data || '{}'));
            console.log('Edit mode property data:', propertyData);
            const furnishTypeMap = {
                'FURNISHED': 'Furnished',
                'UNFURNISHED': 'Unfurnished',
                'PART_FURNISHED': 'Part Furnished'
            };
            const flatAmenities = Array.isArray(propertyData.amenities) ? propertyData.amenities.flat(Infinity) : [];
            setForm({
                address: propertyData.address || propertyData.location || '',
                eircode: propertyData.eircode || '',
                city: propertyData.city || '',
                county: propertyData.county || '',
                propertyType: propertyData.propertyType || '',
                furnishType: furnishTypeMap[propertyData.furnishType] || propertyData.furnishType || '',
                price: propertyData.price?.toString().replace('€', '').replace(',', '').trim() || '',
                bedrooms: propertyData.beds?.toString() || propertyData.bedrooms?.toString() || '',
                bathrooms: propertyData.bath?.toString() || propertyData.bathrooms?.toString() || '',
                availableFrom: propertyData.availableFrom || '',
                description: propertyData.description || '',
                amenities: flatAmenities
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
        setForm(prev => {
            // Always flatten to prevent nesting
            let currentAmenities = [];
            if (Array.isArray(prev.amenities)) {
                currentAmenities = prev.amenities.flat(Infinity).filter(a => typeof a === 'string');
            }
            
            const amenityExists = currentAmenities.includes(amenity);
            const newAmenities = amenityExists
                ? currentAmenities.filter(a => a !== amenity)
                : [...currentAmenities, amenity];
            
            console.log('Amenities after toggle:', newAmenities);
            
            return {
                ...prev,
                amenities: newAmenities
            };
        });
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
            const flatAmenities = Array.isArray(form.amenities) ? form.amenities.flat(Infinity).filter(a => typeof a === 'string') : [];
            const sanitized = InputSanitizer.sanitizeForm(form);
            
            const furnishTypeToEnum = {
                'Furnished': 'FURNISHED',
                'Unfurnished': 'UNFURNISHED',
                'Part Furnished': 'PART_FURNISHED'
            };

            // Upload new images first
            const uploadedMedia = [];
            for (const img of images.filter(i => !i.existing)) {
                const formData = new FormData();
                formData.append('file', img.file);
                const res = await axios.post(`${API_CONFIG.BASE_URL}/api/uploads/image`, formData, {
                    withCredentials: true,
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (res.data.status) uploadedMedia.push({ ...res.data.response, mediaType: 'IMAGE' });
            }
            for (const vid of videos.filter(v => !v.existing)) {
                const formData = new FormData();
                formData.append('file', vid.file);
                const res = await axios.post(`${API_CONFIG.BASE_URL}/api/uploads/video`, formData, {
                    withCredentials: true,
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (res.data.status) uploadedMedia.push({ ...res.data.response, mediaType: 'VIDEO' });
            }

            const propertyData = {
                title: sanitized.address,
                location: sanitized.address,
                city: sanitized.city,
                eircode: sanitized.eircode,
                county: sanitized.county,
                furnishType: furnishTypeToEnum[sanitized.furnishType] || sanitized.furnishType,
                propertyType: sanitized.propertyType,
                price: parseFloat(form.price),
                bedrooms: parseInt(form.bedrooms),
                bathrooms: parseInt(form.bathrooms),
                availableFrom: form.availableFrom,
                description: sanitized.description,
                amenities: flatAmenities,
                media: uploadedMedia
            };

            if (isEditMode && params.id) {
                await propertyService.updateProperty(params.id, propertyData);
            } else {
                await propertyService.createProperty(propertyData);
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
            <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 64, zIndex: 9 }}>
                <Container maxWidth="lg" sx={{ py: 1.5 }}>
                    <Breadcrumb items={[
                        { label: 'My Properties', path: '/my-properties' },
                        { label: isEditMode ? 'Edit Property' : 'Add New Property' }
                    ]} />
                </Container>
            </Box>
            <Container maxWidth="lg" sx={{ py: 4 }}>
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
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#169B62', mb: 2 }}>Property Address</Typography>
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Address" name="address" value={form.address} onChange={handleChange} required error={!!errors.address} helperText={errors.address} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Eircode" name="eircode" value={form.eircode} onChange={handleChange} required error={!!errors.eircode} helperText={errors.eircode} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="City" name="city" value={form.city} onChange={handleChange} required error={!!errors.city} helperText={errors.city} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth select label="County" name="county" value={form.county} onChange={handleChange} required error={!!errors.county} helperText={errors.county}>
                                {counties.map(county => <MenuItem key={county} value={county}>{county}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth select label="Property Type" name="propertyType" value={form.propertyType} onChange={handleChange} required error={!!errors.propertyType} helperText={errors.propertyType}>
                                {propertyTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth select label="Furnish Type" name="furnishType" value={form.furnishType} onChange={handleChange} required error={!!errors.furnishType} helperText={errors.furnishType}>
                                <MenuItem value="Furnished">Furnished</MenuItem>
                                <MenuItem value="Unfurnished">Unfurnished</MenuItem>
                                <MenuItem value="Part Furnished">Part Furnished</MenuItem>
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
                        {amenitiesList.map(amenity => {
                            const flatAmenities = Array.isArray(form.amenities) ? form.amenities.flat(Infinity) : [];
                            const isSelected = flatAmenities.includes(amenity);
                            return (
                                <Button
                                    key={amenity}
                                    onClick={() => handleAmenityToggle(amenity)}
                                    variant={isSelected ? 'contained' : 'outlined'}
                                    sx={{
                                        textTransform: 'none',
                                        borderRadius: 2,
                                        bgcolor: isSelected ? '#169B62' : 'transparent',
                                        color: isSelected ? 'white' : '#169B62',
                                        borderColor: '#169B62',
                                        '&:hover': { bgcolor: isSelected ? '#0F7A4D' : '#E8F5F0' }
                                    }}
                                >
                                    {amenity}
                                </Button>
                            );
                        })}
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
