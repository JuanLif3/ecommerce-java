import './Footer.scss';

function Footer() {
    return (
        <footer className="neo-footer">
            <div className="footer-grid">
                <div className="footer-brand">
                    <h2>TECH_STORE<span className="cursor">_</span></h2>
                    <p className="mono-text">// Equipando a la resistencia desde 2026.</p>
                </div>

                <div className="footer-links">
                    <span className="mono-title">_SISTEMAS</span>
                    <a href="#">[01] Laptops</a>
                    <a href="#">[02] Componentes</a>
                    <a href="#">[03] Accesorios</a>
                </div>

                <div className="footer-links">
                    <span className="mono-title">_LEGALES</span>
                    <a href="#">[ TÉRMINOS_DE_USO ]</a>
                    <a href="#">[ PRIVACIDAD ]</a>
                </div>
            </div>

            <div className="footer-bottom">
                <p className="mono-text">STATUS: ONLINE | COPYRIGHT &copy; 2026 TECH_STORE_INC</p>
            </div>
        </footer>
    );
}

export default Footer;