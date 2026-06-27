// JavaScript para la Interactividad del Prototipo Biocen S.A.

document.addEventListener('DOMContentLoaded', () => {
    // 1. Manejo de Vistas (SPA Simulation)
    const views = {
        portal: document.getElementById('view-portal'),
        productos: document.getElementById('view-productos'),
        laboratorio: document.getElementById('view-laboratorio'),
        nosotros: document.getElementById('view-nosotros'),
        contacto: document.getElementById('view-contacto')
    };

    const header = document.getElementById('main-header');
    const headerLogo = document.getElementById('header-logo');
    const navItems = document.querySelectorAll('.nav-item');
    const btnPortalBack = document.getElementById('btn-portal-back');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    // Hamburger toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('open');
            hamburger.classList.toggle('open', isOpen);
            hamburger.setAttribute('aria-expanded', isOpen);
        });
    }

    // Close mobile nav when a nav item is clicked
    navItems.forEach(item => {
        item.querySelector('a').addEventListener('click', () => {
            navMenu.classList.remove('open');
            if (hamburger) { hamburger.classList.remove('open'); hamburger.setAttribute('aria-expanded', 'false'); }
        });
    });

    // Rutas relativas a los logotipos reales
    const logos = {
        corporate: 'assets/logo2.png',
        productos: 'assets/logo_biocen_prod.jpeg',
        laboratorio: 'assets/logo_biocen_lab.jpeg'
    };

    function switchView(viewName) {
        // Ocultar todas las vistas
        Object.values(views).forEach(view => {
            if (view) {
                view.classList.remove('active');
                view.style.display = 'none';
            }
        });

        // Mostrar la vista seleccionada
        const targetView = views[viewName];
        if (targetView) {
            targetView.style.display = viewName === 'portal' ? 'flex' : 'block';
            // Pequeño delay para permitir transición de opacidad
            setTimeout(() => {
                targetView.classList.add('active');
            }, 50);
        }

        // Actualizar el header e items de menú
        if (viewName === 'portal') {
            header.style.display = 'none'; // Esconder cabecera en el portal de entrada
        } else {
            header.style.display = 'block';
            
            // Cambiar logotipo dinámicamente basado en la sección
            if (viewName === 'productos') {
                headerLogo.src = logos.productos;
                headerLogo.alt = 'Biocen Productos';
                // Cambiar variables CSS dinámicamente para el tema de Productos
                document.documentElement.style.setProperty('--color-prod-primary', '#005922');
            } else if (viewName === 'laboratorio') {
                headerLogo.src = logos.laboratorio;
                headerLogo.alt = 'Biocen Laboratorio';
                // Usar color primario del laboratorio
                document.documentElement.style.setProperty('--color-prod-primary', '#23643d');
            } else {
                // Corporativo / Quiénes Somos / Contacto
                headerLogo.src = logos.corporate;
                headerLogo.alt = 'Biocen S.A.';
                document.documentElement.style.setProperty('--color-prod-primary', '#005922');
            }
        }

        // Actualizar estado activo en la navegación
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-view') === viewName) {
                item.classList.add('active');
            }
        });

        // Scroll al inicio de la página
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Eventos de Navegación del Header
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = item.getAttribute('data-view');
            switchView(viewName);
        });
    });

    // Botón para volver al portal principal
    if (btnPortalBack) {
        btnPortalBack.addEventListener('click', () => {
            switchView('portal');
        });
    }

    // Enlaces del footer
    document.querySelectorAll('.footer-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = link.getAttribute('data-view');
            if (viewName) switchView(viewName);
        });
    });

    // Botones del Portal Central
    const btnGoProducts = document.getElementById('btn-go-products');
    const btnGoLab = document.getElementById('btn-go-lab');

    if (btnGoProducts) {
        btnGoProducts.addEventListener('click', () => switchView('productos'));
    }
    if (btnGoLab) {
        btnGoLab.addEventListener('click', () => switchView('laboratorio'));
    }

    // Inicializar en la vista de Portal
    switchView('portal');


    // 2. Manejo de Scroll en Header
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });


    // 3. Pestañas de Ficha Técnica de Producto (Tabs)
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.product-card');
            const targetTab = button.getAttribute('data-tab');

            // Quitar clase activa de botones en esta tarjeta
            card.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            // Quitar clase activa de paneles en esta tarjeta
            card.querySelectorAll('.tab-content-panel').forEach(panel => panel.classList.remove('active'));

            // Activar botón seleccionado
            button.classList.add('active');
            // Activar panel seleccionado
            card.querySelector(`.panel-${targetTab}`).classList.add('active');
        });
    });


    // 4. Simulador / Calculadora de Acondicionamiento de Agua
    const btnCalculate = document.getElementById('btn-calculate');
    const resultBox = document.getElementById('result-box');

    if (btnCalculate) {
        btnCalculate.addEventListener('click', () => {
            const hardness = parseFloat(document.getElementById('input-hardness').value);
            const ph = parseFloat(document.getElementById('input-ph').value);
            const volume = parseFloat(document.getElementById('input-volume').value);

            if (isNaN(hardness) || isNaN(ph) || isNaN(volume) || volume <= 0) {
                alert('Por favor, complete todos los campos con valores válidos.');
                return;
            }

            // Lógica agronómica de recomendación
            let domoMaxDose = 0;
            let domoControlDose = 0;
            let recomendacionClave = '';

            // Cálculo Domo Max (Sulfato de amonio líquido) para secuestro de sales duras (calcio y magnesio)
            if (hardness > 100) {
                // Dosis típica: 0.5% a 1.5% del volumen del tanque de acuerdo a dureza.
                // 100-250 ppm -> 0.75%. > 250 ppm -> 1.25%.
                const percentage = hardness > 250 ? 0.0125 : 0.0075;
                domoMaxDose = volume * percentage;
            }

            // Cálculo Domo Control (Acidificante/Humectante) para corrección de pH
            if (ph > 5.5) {
                // Dosis típica: 75 ml a 150 ml por cada 100 L de agua.
                // Si el pH es muy alto (>7.5), dosis alta. Si es intermedio, dosis intermedia.
                const mlPer100L = ph > 7.5 ? 120 : 80;
                domoControlDose = (volume / 100) * (mlPer100L / 1000); // convertido a litros
            } else {
                // Solo humectante básico: 50 ml por cada 100 L de agua
                domoControlDose = (volume / 100) * (50 / 1000);
            }

            // Redacción de la recomendación técnica personalizada
            if (hardness > 250 && ph > 7.5) {
                recomendacionClave = 'Agua extremadamente dura y alcalina. Requiere dosis máxima de Domo Max para prevenir la inactivación del Glifosato y Domo Control para estabilizar la mezcla.';
            } else if (hardness > 100) {
                recomendacionClave = 'Calidad de agua moderada. Se aconseja acondicionar primero con Domo Max antes de agregar fitosanitarios.';
            } else {
                recomendacionClave = 'Agua blanda. El uso de Domo Control se enfoca principalmente en la humectación foliar y penetración óptima.';
            }

            // Renderizar resultados en pantalla
            document.getElementById('res-hardness').textContent = `${hardness} ppm (CaCO3)`;
            document.getElementById('res-ph').textContent = `${ph}`;
            document.getElementById('res-volume').textContent = `${volume} Litros`;
            document.getElementById('res-domo-max').textContent = domoMaxDose > 0 ? `${domoMaxDose.toFixed(2)} Litros` : 'No requiere (Agua blanda)';
            document.getElementById('res-domo-control').textContent = `${domoControlDose.toFixed(2)} Litros (${(domoControlDose * 1000).toFixed(0)} ml)`;
            document.getElementById('res-text').textContent = recomendacionClave;

            // Mostrar caja de resultados
            resultBox.classList.add('active');
            
            // Scroll suave hacia los resultados
            resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }

    // 5. Simulación de Envío de Formulario
    const contactForm = document.getElementById('prototype-contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const area = document.getElementById('form-area').value;
            const name = document.getElementById('form-name').value;
            
            alert(`¡Muchas gracias, ${name}! Tu consulta ha sido dirigida exitosamente al departamento de ${area}. Nos contactaremos a la brevedad.`);
            contactForm.reset();
        });
    }

    // Ajustar color de formulario dinámicamente al cambiar el área seleccionada
    const formAreaSelect = document.getElementById('form-area');
    if (formAreaSelect) {
        formAreaSelect.addEventListener('change', () => {
            const selectedArea = formAreaSelect.value;
            const btnSend = document.querySelector('.btn-send');
            if (selectedArea === 'Laboratorio') {
                btnSend.style.backgroundColor = 'var(--color-lab-primary)';
            } else {
                btnSend.style.backgroundColor = 'var(--color-prod-primary)';
            }
        });
    }
});
