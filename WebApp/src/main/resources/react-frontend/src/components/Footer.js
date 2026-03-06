function Footer() {
    const [openSection, setOpenSection] = React.useState(null);
    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSection = (section) => {
        setOpenSection(openSection === section ? null : section);
    };

    const FooterSection = ({ title, children, sectionKey }) => {
        if (isMobile) {
            return (
                <div style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                    <div 
                        onClick={() => toggleSection(sectionKey)}
                        style={{
                            padding: '15px 0',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontWeight: '600',
                            color: '#2d5016'
                        }}
                    >
                        {title}
                        <span style={{ fontSize: '20px' }}>{openSection === sectionKey ? '−' : '+'}</span>
                    </div>
                    {openSection === sectionKey && (
                        <div style={{ paddingBottom: '15px' }}>{children}</div>
                    )}
                </div>
            );
        }
        return (
            <div>
                <h3 style={{ marginBottom: '20px', color: '#2d5016', fontSize: '18px', fontWeight: '600' }}>{title}</h3>
                {children}
            </div>
        );
    };

    return (
        <footer style={{
            background: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
            marginTop: 'auto'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: isMobile ? '30px 20px' : '50px 40px 30px',
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
                gap: isMobile ? '0' : '40px'
            }}>
                <FooterSection title="Find Your Accommodation" sectionKey="brand">
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                        <span style={{ fontSize: '32px', marginRight: '10px' }}>🏠</span>
                        <span style={{ fontWeight: '700', fontSize: '16px', color: '#2d5016' }}>Find Your Accommodation</span>
                    </div>
                    <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.6' }}>
                        Helping people in Ireland find homes, rooms and shared accommodation quickly and safely.
                    </p>
                </FooterSection>

                <FooterSection title="Company" sectionKey="company">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {['About Us', 'Contact Us', 'Careers', 'Blog'].map(link => (
                            <a key={link} href="#" style={{
                                color: '#4a7c2c',
                                textDecoration: 'none',
                                fontSize: '14px',
                                transition: 'color 0.2s'
                            }} onMouseEnter={e => e.target.style.color = '#d4af37'}
                               onMouseLeave={e => e.target.style.color = '#4a7c2c'}>
                                {link}
                            </a>
                        ))}
                    </div>
                </FooterSection>

                <FooterSection title="Support & Legal" sectionKey="legal">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {['Privacy Policy', 'Terms & Conditions', 'Cookie Settings', 'Safety Tips'].map(link => (
                            <a key={link} href="#" style={{
                                color: '#4a7c2c',
                                textDecoration: 'none',
                                fontSize: '14px',
                                transition: 'color 0.2s'
                            }} onMouseEnter={e => e.target.style.color = '#d4af37'}
                               onMouseLeave={e => e.target.style.color = '#4a7c2c'}>
                                {link}
                            </a>
                        ))}
                    </div>
                </FooterSection>

                <FooterSection title="Contact" sectionKey="contact">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ fontSize: '14px', color: '#555' }}>
                            <strong style={{ color: '#2d5016' }}>Email:</strong><br />
                            <a href="mailto:support@findyouraccommodation.ie" style={{ color: '#4a7c2c', textDecoration: 'none' }}>
                                support@findyouraccommodation.ie
                            </a>
                        </div>
                        <div style={{ fontSize: '14px', color: '#555' }}>
                            <strong style={{ color: '#2d5016' }}>Phone:</strong><br />
                            <a href="tel:+35301234567" style={{ color: '#4a7c2c', textDecoration: 'none' }}>
                                +353 01 234 5678
                            </a>
                        </div>
                        <div style={{ fontSize: '14px', color: '#555' }}>
                            <strong style={{ color: '#2d5016' }}>Location:</strong><br />
                            Dublin, Ireland
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        {[
                            { icon: 'f', label: 'Facebook' },
                            { icon: '📷', label: 'Instagram' },
                            { icon: 'in', label: 'LinkedIn' },
                            { icon: '𝕏', label: 'Twitter' }
                        ].map(social => (
                            <a key={social.label} href="#" aria-label={social.label} style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: '#4a7c2c',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textDecoration: 'none',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                transition: 'background 0.2s'
                            }} onMouseEnter={e => e.target.style.background = '#d4af37'}
                               onMouseLeave={e => e.target.style.background = '#4a7c2c'}>
                                {social.icon}
                            </a>
                        ))}
                    </div>
                </FooterSection>
            </div>

            <div style={{
                borderTop: '1px solid rgba(0,0,0,0.1)',
                padding: '20px 40px',
                background: 'rgba(245, 245, 245, 0.95)'
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '15px',
                    fontSize: '14px',
                    color: '#666'
                }}>
                    <div>© 2026 Find Your Accommodation. All rights reserved.</div>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {['Privacy', 'Cookies', 'Terms'].map((link, idx) => (
                            <React.Fragment key={link}>
                                {idx > 0 && <span>•</span>}
                                <a href="#" style={{
                                    color: '#4a7c2c',
                                    textDecoration: 'none',
                                    transition: 'color 0.2s'
                                }} onMouseEnter={e => e.target.style.color = '#d4af37'}
                                   onMouseLeave={e => e.target.style.color = '#4a7c2c'}>
                                    {link}
                                </a>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
