const LoadingContext = React.createContext();

function LoadingProvider({ children }) {
    const [loading, setLoading] = React.useState(false);

    if (!window.MaterialUI) {
        return <>{children}</>;
    }

    const { Backdrop, CircularProgress } = MaterialUI;

    return (
        <LoadingContext.Provider value={{ setLoading }}>
            {children}
            <Backdrop open={loading} sx={{ color: '#f4d03f', zIndex: 9999, bgcolor: 'rgba(45, 80, 22, 0.7)' }}>
                <CircularProgress color="inherit" size={60} />
            </Backdrop>
        </LoadingContext.Provider>
    );
}

const useLoading = () => {
    const context = React.useContext(LoadingContext);
    if (!context) {
        return { setLoading: () => {} };
    }
    return context;
};
