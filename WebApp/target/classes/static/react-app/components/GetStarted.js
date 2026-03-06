function GetStarted({ onNext }) {
    const { Box, Typography, Fab } = MaterialUI;
    
    return (
        <div className="gradient-bg">
            <Box sx={{ textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h2" sx={{ color: 'white', fontWeight: 'bold', mb: 3, textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                    🌴 Kerala App
                </Typography>
                <Typography variant="h5" sx={{ color: 'white', mb: 2, textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                    Experience the beauty of God's Own Country
                </Typography>
                <Typography variant="h6" sx={{ color: 'white', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                    Manage your Kerala journey with ease
                </Typography>
            </Box>
            <Fab 
                sx={{ position: 'fixed', bottom: 40, right: 40, bgcolor: '#f4d03f', '&:hover': { bgcolor: '#e0c030' } }} 
                onClick={onNext}
            >
                →
            </Fab>
        </div>
    );
}
