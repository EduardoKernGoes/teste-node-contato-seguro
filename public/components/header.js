class Header extends HTMLElement {
    connectedCallback() {
        const username = localStorage.getItem('name');
        const isLogged = username !== null;

        const authMenu = isLogged 
            ? `
                <li class="nav-items">
                    <!-- Podemos até mostrar o nome da pessoa no menu! -->
                    <a href="/pages/profile.html">Ver Perfil</a>
                </li>
                <li class="nav-items">
                    <a href="#" id="btn-sair">Sair</a>
                </li>
              ` 
            : `
                <li class="nav-items">
                    <a href="/pages/login.html">Login</a>
                </li>
              `
        ;

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
                        ${authMenu}
                    </ul>
                </nav>
            </header>
        `;

        if (isLogged) {
            const btnSair = this.querySelector('#btn-sair');
            btnSair.addEventListener('click', (event) => {
                event.preventDefault();
                
                localStorage.removeItem('id');
                localStorage.removeItem('name');
                localStorage.removeItem('email');
                localStorage.removeItem('role');
                
                window.location.href = '/pages/login.html';
            });
        }
    }
}

customElements.define('site-header', Header);