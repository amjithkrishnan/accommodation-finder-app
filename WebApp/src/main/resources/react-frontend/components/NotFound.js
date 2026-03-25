function NotFound() {
    const { Box, Typography, Button, Container } = MaterialUI;
    const { navigate } = useRouter();

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F5F6F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
                <Typography variant="h1" sx={{ fontSize: '120px', fontWeight: 'bold', color: '#169B62', mb: 2 }}>
                    404
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#12321A', mb: 2 }}>
                    Page Not Found
                </Typography>
                <Typography variant="body1" sx={{ color: '#6B7280', mb: 4 }}>
                    The page you're looking for doesn't exist or has been moved.
                </Typography>
                <Button 
                    variant="contained" 
                    onClick={() => navigate('/')}
                    sx={{ 
                        bgcolor: '#169B62', 
                        color: 'white', 
                        fontWeight: 600,
                        textTransform: 'none',
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        '&:hover': { bgcolor: '#0F7A4D' }
                    }}
                >
                    Go Home
                </Button>
            </Container>
        </Box>
    );
}
