function ConfirmModal({ open, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel' }) {
    const { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } = MaterialUI;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
                }
            }}
        >
            <DialogTitle sx={{ 
                color: '#EF4444', 
                fontWeight: 'bold',
                pb: 1
            }}>
                {title}
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1" sx={{ color: '#6B7280' }}>
                    {message}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 2 }}>
                <Button 
                    onClick={onClose}
                    sx={{ 
                        color: '#6B7280',
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': { bgcolor: '#F3F4F6' }
                    }}
                    aria-label="Cancel deletion"
                >
                    {cancelText}
                </Button>
                <Button 
                    onClick={handleConfirm}
                    variant="contained"
                    sx={{ 
                        bgcolor: '#EF4444',
                        color: 'white',
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': { bgcolor: '#DC2626' }
                    }}
                    aria-label="Confirm deletion"
                    autoFocus
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
