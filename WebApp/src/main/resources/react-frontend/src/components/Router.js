const Router = {
    routes: {},
    currentRoute: '',

    init: function() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    },

    register: function(path, component) {
        this.routes[path] = component;
    },

    navigate: function(path) {
        window.location.hash = path;
    },

    handleRoute: function() {
        const hash = window.location.hash.slice(1) || '/';
        this.currentRoute = hash;
        const event = new CustomEvent('routechange', { detail: { route: hash } });
        window.dispatchEvent(event);
    },

    getRoute: function() {
        return window.location.hash.slice(1) || '/';
    },

    getParams: function() {
        const hash = window.location.hash.slice(1);
        const [path, query] = hash.split('?');
        const params = {};
        if (query) {
            query.split('&').forEach(param => {
                const [key, value] = param.split('=');
                params[key] = decodeURIComponent(value);
            });
        }
        return params;
    }
};

function useRouter() {
    const [route, setRoute] = React.useState(Router.getRoute());
    const [params, setParams] = React.useState(Router.getParams());

    React.useEffect(() => {
        const handleRouteChange = (e) => {
            const fullRoute = e.detail.route;
            const [path] = fullRoute.split('?');
            setRoute(path);
            setParams(Router.getParams());
        };
        window.addEventListener('routechange', handleRouteChange);
        return () => window.removeEventListener('routechange', handleRouteChange);
    }, []);

    return {
        route,
        params,
        navigate: (path) => Router.navigate(path)
    };
}
