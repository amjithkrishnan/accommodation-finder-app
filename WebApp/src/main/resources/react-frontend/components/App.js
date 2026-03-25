function App() {
    const { route, navigate } = useRouter();
    const { user, loading } = useAuth();

    console.log('[App] route:', route, 'user:', user, 'loading:', loading);

    React.useEffect(() => {
        Router.init();
    }, []);

    React.useEffect(() => {
        console.log('[App useEffect] route:', route, 'user:', user, 'loading:', loading);
        if (loading) {
            console.log('[App] Still loading, skipping redirect');
            return;
        }
        
        const validRoutes = ['/', '/explore', '/property', '/signin', '/signup', '/dashboard', '/my-properties', '/add-property', '/profile'];
        const protectedRoutes = ['/dashboard', '/my-properties', '/add-property', '/profile'];
        
        if (!validRoutes.includes(route)) {
            console.log('[App] Invalid route:', route, 'redirecting to /404');
            navigate('/404');
            return;
        }
        
        if (user && (route === '/signin' || route === '/signup')) {
            console.log('[App] User logged in, redirecting from', route, 'to /explore');
            navigate('/explore');
            return;
        }
        
        if (!user && protectedRoutes.includes(route)) {
            console.log('[App] No user, redirecting from', route, 'to /signin');
            navigate('/signin');
        }
    }, [route, user, loading, navigate]);

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
                    {route === '/404' && <NotFound />}
                    {(route === '/' || route === '/explore') && <AccommodationList onSignIn={() => navigate('/signin')} onSignUp={() => navigate('/signup')} onViewDetails={() => navigate('/property')} />}
                    {route === '/property' && <PropertyDetails onBack={() => window.history.back()} onSignIn={() => navigate('/signin')} />}
                    {route === '/signin' && <SignIn onSignUp={() => navigate('/signup')} onForgotPassword={() => alert('Password reset link sent to your email')} onSuccess={() => navigate('/explore')} onBack={() => navigate('/')} />}
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
