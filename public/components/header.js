class Header extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <header>
                <nav>
                    <h1>Contato Seguro</h1>
                    <ul>
                        <li class="nav-items">
                            <a href="/index.html">Ver Chamados</a>
                        </li>
                        <li class="nav-items">
                            <a href="/pages/open-ticket.html">Abrir Chamado</a>
                        </li>
                    </ul>
                </nav>
            </header>
        `
    }
}

customElements.define('site-header', Header);