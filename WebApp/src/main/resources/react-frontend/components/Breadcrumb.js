function Breadcrumb({ items }) {
    const { Box, Typography, Link } = MaterialUI;
    const { navigate } = useRouter();

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, flexWrap: 'wrap' }}>
            {items.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {item.path ? (
                        <Link
                            component="button"
                            onClick={() => navigate(item.path)}
                            sx={{
                                color: '#6B7280',
                                textDecoration: 'none',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                '&:hover': { color: '#169B62', textDecoration: 'underline' }
                            }}
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <Typography sx={{ color: '#169B62', fontSize: '0.875rem', fontWeight: 600 }}>
                            {item.label}
                        </Typography>
                    )}
                    {index < items.length - 1 && (
                        <Typography sx={{ color: '#D1D5DB', fontSize: '0.875rem' }}>›</Typography>
                    )}
                </Box>
            ))}
        </Box>
    );
}
