import './Footer.scss';

function Footer() {
    return (
        <footer className="neo-footer">
            {/* CINTA DE PRECAUCIÓN SUPERIOR */}
            <div className="caution-tape">
                <span>/// END_OF_LINE /// RESTRICTED_AREA /// END_OF_LINE /// RESTRICTED_AREA /// END_OF_LINE ///</span>
            </div>

            <div className="footer-container">
                <div className="footer-grid">
                    {/* COLUMNA 1: BRANDING Y SYSTEM INFO */}
                    <div className="footer-brand">
                        <h2>TECH_STORE<span className="cursor">_</span></h2>
                        <p className="mono-text text-dim">&gt; Equipando a la resistencia desde 2026.</p>

                        <div className="sys-info">
                            <p><span className="text-cyan">SYS_IP:</span> 192.168.0.UNKNOWN</p>
                            <p><span className="text-cyan">UPTIME:</span> 99.999%</p>
                            <p><span className="text-cyan">LOC:</span> CL_NODE_01</p>
                        </div>
                    </div>

                    {/* COLUMNA 2: NAVEGACIÓN TIPO CONSOLA */}
                    <div className="footer-links">
                        <span className="mono-title">_SISTEMAS_ACTIVOS</span>
                        <a href="#">&gt; cd /laptops_pro</a>
                        <a href="#">&gt; cd /componentes</a>
                        <a href="#">&gt; cd /perifericos</a>
                        <a href="#">&gt; cd /energia</a>
                    </div>

                    {/* COLUMNA 3: LEGALES BRUTALISTAS */}
                    <div className="footer-links">
                        <span className="mono-title">_PROTOCOLOS_LEGALES</span>
                        <a href="#">[ TÉRMINOS_DE_USO ]</a>
                        <a href="#">[ PRIVACIDAD_ABSOLUTA ]</a>
                        <a href="#">[ COOKIES_DE_RASTREO ]</a>
                    </div>

                    {/* COLUMNA 4: NEWSLETTER (INTERCEPTACIÓN) */}
                    <div className="footer-comms">
                        <span className="mono-title text-accent">_CANAL_SEGURO</span>
                        <p className="mono-text text-dim">Recibe transmisiones encriptadas sobre nuevo hardware y caídas de precio.</p>
                        <form className="cyber-input-group" onSubmit={(e) => e.preventDefault()}>
                            <span className="prompt text-accent">&gt;</span>
                            <input type="email" placeholder="ingresa_tu_email..." required />
                            <button type="submit">[ ENVIAR ]</button>
                        </form>
                    </div>
                </div>

                {/* BARRA INFERIOR DE ESTADO */}
                <div className="footer-bottom">
                    <div className="tech-bar">
                        <div className="tech-segment"></div>
                        <div className="tech-segment long"></div>
                        <div className="tech-segment"></div>
                    </div>
                    <div className="bottom-content">
                        <p className="mono-text blink text-green">STATUS: NETWORK_ONLINE</p>
                        <p className="mono-text text-dim">COPYRIGHT &copy; 2026 TECH_STORE_INC // ALL RIGHTS RESERVED.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;