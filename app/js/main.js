document.addEventListener('DOMContentLoaded', () => {
	const MENU_BREAKPOINT = 768;

	watchWindowHeight();
	watchHeaderHeight();
	initMenu();
	initPossibilitiesSlider();
	initTableAccordions();
	initTabs('.nft__tab-btn', '.nft__content-item');
	initAccordions('.faq__item', '.faq__head', '.faq__content');

	// Аккордионы в таблицах
	function initTableAccordions() {
		const table = document.querySelector('.table');

		if (!table) return;

		table.addEventListener('click', (e) => {
			const accordion = e.target.closest('.table__accordion');
			
			if (!accordion) return;

			const content = accordion.nextElementSibling;

			if (content.classList.contains('table__accordion-content')) {
				accordion.classList.toggle('is-active');
			}
		})


	}

	function initPossibilitiesSlider() {
		const navTabsContainer = document.querySelector('.possibilities__nav');
		const navTabs = document.querySelectorAll('.possibilities__tab');

		if (!navTabsContainer) return;

		const mainSlider = initSlider('.possibilities__main', {
			perMove: 1,
			perPage: 1,
			gap: 30,
			speed: 1500,
			pagination: true,
			flickMaxPages: 1,
			flickPower: 30,
			rewindByDrag: false,
			rewind: false,
		});
		const infoSlider = initSlider('.possibilities__info', {
			perMove: 1,
			perPage: 1,
			gap: 30,
			speed: 1400,
			pagination: false,
			arrows: false,
			drag: false,
			flickMaxPages: 1,
			flickPower: 30,
			rewindByDrag: false,
			rewind: false,
		});

		mainSlider.on('move', (newIndex) => {
			const prevActiveTab = document.querySelector(
				'.possibilities__tab.is-active'
			);
			const newActiveTab = document.querySelector(
				`.possibilities__tab:nth-child(${newIndex + 1})`
			);

			if (!navTabsContainer.classList.contains('is-nav-clicked')) {
				if (prevActiveTab) prevActiveTab.classList.remove('is-active');
				if (newActiveTab) newActiveTab.classList.add('is-active');
			}

			navTabsContainer.scrollLeft = newActiveTab.offsetWidth * (newIndex - 1);

			infoSlider.go(newIndex);
		});

		navTabs.forEach((item, index) => {
			item.addEventListener('click', (e) => {
				const prevActiveTab = document.querySelector(
					'.possibilities__tab.is-active'
				);
				if (prevActiveTab) prevActiveTab.classList.remove('is-active');

				navTabsContainer.classList.add('is-nav-clicked');
				item.classList.add('is-active');

				mainSlider.go(index);
				infoSlider.go(index);

				setTimeout(() => {
					navTabsContainer.classList.remove('is-nav-clicked');
				}, 10);
			});
		});
	}

	// Меню
	function initMenu() {
		const menu = new Menu({
			menu: document.querySelector('.header__menu'),
			burger: document.querySelector('.header__burger'),
			overlay: document.querySelector('.header-overlay'),
			burgerCaption: 'Открыть меню',
			close: document.querySelector('.menu__close'),
			display: 'flex',
			burgerActiveCaption: 'Закрыть меню',
			transitionDelay: 400,
			breakpoint: MENU_BREAKPOINT,
			onOpen: () =>
				document.querySelector('.header').classList.add('is-active'),
			onClose: () =>
				document.querySelector('.header').classList.remove('is-active'),
		});

		window.menu = menu;

		// Мобильное меню
		const menuLinks = document.querySelectorAll('.header__menu a');
		const submenuLinks = document.querySelectorAll('.header-submenu > a');

		// Открытие подменю
		submenuLinks.forEach((link) => {
			link.addEventListener('click', (e) => {
				e.preventDefault();
				const submenu = link.closest('.header-submenu');
				submenu.classList.toggle('is-active');
			});
		});

		document.body.addEventListener('click', (e) => {
			const submenu = e.target.closest('.header-submenu');

			if (!submenu) {
				document.querySelectorAll('.header-submenu').forEach((item) => {
					item.classList.remove('is-active');
				});
			}
		});

		// Закрытие меню при навигации по ссылкам
		menuLinks.forEach((link) => {
			link.addEventListener('click', (e) => {
				if (
					window.innerWidth > MENU_BREAKPOINT ||
					link.parentElement.classList.contains('header-submenu')
				)
					return;

				menu.close();
			});
		});

		// Смена языка
		const languagesNode = document.querySelector('.header-languages');
		const currentLanguageNode = document.querySelector(
			'.header-languages__current-text'
		);

		document.body.addEventListener('click', (e) => {
			if (!e.target.closest('.header-languages')) {
				languagesNode.classList.remove('is-active');
			} else {
				languagesNode.classList.toggle('is-active');
			}
			const languageBtn = e.target.closest('.header-languages__btn');

			if (languageBtn) {
				currentLanguageNode.textContent = languageBtn.dataset.label;
			}
		});

		// Смена темы
		const themeChangeBtn = document.querySelector('.header-theme');

		themeChangeBtn.addEventListener('click', (e) => {
			document.body.classList.toggle('dark-theme');
			document.body.classList.toggle('light-theme');
		});
	}

	// Слайдеры
	function initSlider(selector, options) {
		const slider = document.querySelector(selector);

		if (!slider) return;

		const splide = new Splide(slider, options);

		splide.mount();

		return splide;
	}
});
