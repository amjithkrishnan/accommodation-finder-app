function App() {
    const { route, navigate } = useRouter();
    const { user, loading } = useAuth();

    React.useEffect(() => {
        Router.init();
    }, []);

    React.useEffect(() => {
        if (loading) return;
        
        // GuestOnly routes: redirect to /listings if logged in
        if (user && (route === '/signin' || route === '/signup')) {
            navigate('/listings');
        }
        
        // RequireAuth routes: redirect to /signin if not logged in
        if (!user && route === '/listings') {
            navigate('/signin');
        }
    }, [route, user, loading]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <LoadingProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <div style={{ flex: 1 }}>
                    {(route === '/' || route === '/listings') && <AccommodationList onSignIn={() => navigate('/signin')} onSignUp={() => navigate('/signup')} onViewDetails={() => navigate('/property')} />}
                    {route === '/property' && <PropertyDetails onBack={() => navigate('/listings')} onSignIn={() => navigate('/signin')} />}
                    {route === '/signin' && <SignIn onSignUp={() => navigate('/signup')} onForgotPassword={() => alert('Password reset link sent to your email')} onSuccess={() => navigate('/listings')} onBack={() => navigate('/')} />}
                    {route === '/signup' && <SignUp onSuccess={() => navigate('/signin')} onSignIn={() => navigate('/signin')} onBack={() => navigate('/')} />}
                    {(route === '/dashboard' || route === '/my-properties') && <Dashboard onLogout={() => navigate('/')} />}
                    {route === '/add-property' && <AddProperty onBack={() => navigate('/my-properties')} />}
                    {route === '/profile' && <Profile />}
                </div>
                <Footer />
            </div>
        </LoadingProvider>
    );
}
