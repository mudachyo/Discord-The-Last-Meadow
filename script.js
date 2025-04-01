(function() {
    'use strict';
    
    console.log('The Last Meadow autoclicker script started');
    
    // Языковые настройки
    const translations = {
        'ru': {
            title: 'Настройки автокликера',
            clickerOn: 'Включить автокликер',
            weeds: 'Собирать сорняки',
            lawnmowers: 'Активировать газонокосилки',
            lootboxes: 'Открывать лутбоксы',
            autoBuy: 'Автопокупка улучшений',
            clickInterval: 'Интервал кликов (мс)',
            bonusInterval: 'Интервал проверки бонусов (мс)',
            buyInterval: 'Интервал проверки покупок (мс)',
            darkMode: 'Темная тема',
            language: 'Язык',
            currentCoins: 'Текущее количество монет',
            foundWeeds: 'Найдено сорняков',
            foundLawnmowers: 'Найдено газонокосилок', 
            foundLootboxes: 'Найдено лутбоксов',
            noUpgrades: 'Доступных улучшений не найдено',
            buying: 'Покупаем',
            autoClickerStarted: 'Автокликер запущен с интервалом',
            autoClickerStopped: 'Автокликер остановлен',
            bonusCollectionStarted: 'Сбор бонусов активирован с интервалом',
            autoBuyStarted: 'Автопокупка активирована с интервалом',
            ms: 'мс',
            coins: 'монет'
        },
        'en': {
            title: 'Autoclicker Settings',
            clickerOn: 'Enable autoclicker',
            weeds: 'Collect weeds',
            lawnmowers: 'Activate lawnmowers',
            lootboxes: 'Open lootboxes',
            autoBuy: 'Auto-buy upgrades',
            clickInterval: 'Click interval (ms)',
            bonusInterval: 'Bonus check interval (ms)',
            buyInterval: 'Purchase check interval (ms)',
            darkMode: 'Dark mode',
            language: 'Language',
            currentCoins: 'Current coins',
            foundWeeds: 'Found weeds',
            foundLawnmowers: 'Found lawnmowers',
            foundLootboxes: 'Found lootboxes',
            noUpgrades: 'No available upgrades found',
            buying: 'Buying',
            autoClickerStarted: 'Autoclicker started with interval',
            autoClickerStopped: 'Autoclicker stopped',
            bonusCollectionStarted: 'Bonus collection activated with interval',
            autoBuyStarted: 'Auto-buy activated with interval',
            ms: 'ms',
            coins: 'coins'
        }
    };
    
    // Настройки по умолчанию
    const config = {
        clickInterval: 200,
        enabled: false,
        collectWeeds: true,
        autoBuy: true,
        buyInterval: 2000,
        collectLawnmowers: true,
        collectLootboxes: true,
        collectInterval: 1000,
        darkMode: true,
        language: 'en'
    };
    
    // Функция для получения текста в зависимости от выбранного языка
    function t(key) {
        return translations[config.language][key] || key;
    }
    
    // Функция для проверки наличия элементов игры на странице
    function isGamePage() {
        const grassElement = document.querySelector('.default__9026a.logo_cf3f70, div[class*="logo_cf3f70"]');
        return !!grassElement;
    }
    
    // Функция для клика в случайную точку элемента
    function clickRandomly() {
        const grassElement = document.querySelector('.default__9026a.logo_cf3f70, div[class*="logo_cf3f70"]');
        
        if (grassElement) {
            const rect = grassElement.getBoundingClientRect();
            
            // Генерируем случайные координаты внутри элемента
            const x = rect.left + Math.random() * rect.width;
            const y = rect.top + Math.random() * rect.height;
            
            // Создаем и отправляем клик
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: x,
                clientY: y
            });
            
            grassElement.dispatchEvent(clickEvent);
        }
    }

    // Функция для поиска и сбора сорняков
    function findAndCollectWeeds() {
        if (!config.collectWeeds) return;
        
        const weeds = document.querySelectorAll('.weed_fa03d7, img[class*="weed_"]');
        
        if (weeds.length > 0) {
            console.log(`${t('foundWeeds')}: ${weeds.length}`);
            weeds.forEach(weed => {
                weed.click();
            });
        }
    }
    
    // Функция для поиска и активации газонокосилок
    function findAndClickLawnmowers() {
        if (!config.collectLawnmowers) return;
        
        const lawnmowers = document.querySelectorAll('.lawnmower__78658, [class*="lawnmower_"]');
        
        if (lawnmowers.length > 0) {
            console.log(`${t('foundLawnmowers')}: ${lawnmowers.length}`);
            lawnmowers.forEach(lawnmower => {
                lawnmower.click();
            });
        }
    }
    
    // Функция для поиска и открытия лутбоксов
    function findAndClickLootboxes() {
        if (!config.collectLootboxes) return;
        
        const lootboxes = document.querySelectorAll('.lootbox_cb9930 .cat__9026a, [class*="lootbox_"] [role="button"]');
        
        if (lootboxes.length > 0) {
            console.log(`${t('foundLootboxes')}: ${lootboxes.length}`);
            lootboxes.forEach(lootbox => {
                lootbox.click();
            });
        }
    }
    
    // Функция для получения текущего количества монет
    function getCurrentCoins() {
        const pointsElement = document.querySelector('.pointsValue__7a0c3, [class*="pointsValue_"]');
        if (pointsElement) {
            const coins = parseInt(pointsElement.textContent.trim().replace(/\D/g, ''));
            return isNaN(coins) ? 0 : coins;
        }
        return 0;
    }
    
    // Функция для поиска и покупки самого дешевого улучшения
    function buyUpgrades() {
        if (!config.autoBuy) return;
        
        const currentCoins = getCurrentCoins();
        console.log(`${t('currentCoins')}: ${currentCoins}`);
        
        // Если монет меньше, чем потенциально может стоить улучшение, выходим
        if (currentCoins < 100) return;
        
        // Собираем все доступные улучшения
        const items = [];
        
        // Ищем все возможные улучшения (основной магазин и специальные улучшения)
        const allUpgrades = document.querySelectorAll(
            '.clickerButton_e9638b.enabled_e9638b, ' + 
            '[class*="clickerButton_"][class*="enabled_"]'
        );
        
        allUpgrades.forEach(item => {
            // Получаем стоимость улучшения
            const costElement = item.querySelector('.text__73a39, [class*="text_"]');
            if (costElement) {
                const cost = parseInt(costElement.textContent.trim());
                if (!isNaN(cost)) {
                    const name = item.getAttribute('aria-label') || 'Улучшение';
                    items.push({
                        element: item,
                        name: name,
                        cost: cost
                    });
                }
            }
        });
        
        // Если улучшений нет, выходим
        if (items.length === 0) {
            console.log(t('noUpgrades'));
            return;
        }
        
        // Сортируем по цене (от дешевых к дорогим)
        items.sort((a, b) => a.cost - b.cost);
        
        // Покупаем самое дешевое улучшение, которое можем себе позволить
        for (const item of items) {
            if (item.cost <= currentCoins) {
                console.log(`${t('buying')}: ${item.name} (${item.cost} ${t('coins')})`);
                item.element.click();
                break;
            }
        }
    }

    // Создание стилей для темной темы
    function createStyles() {
        const style = document.createElement('style');
        style.id = 'grass-clicker-styles';
        style.textContent = `
            #clicker-settings-btn {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 10px;
                border: none;
                border-radius: 50%;
                font-size: 20px;
                width: 50px;
                height: 50px;
                cursor: pointer;
                z-index: 10000;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                transition: all 0.3s ease;
            }
            
            #clicker-settings-btn.light {
                background: #4CAF50;
                color: white;
            }
            
            #clicker-settings-btn.dark {
                background: #388E3C;
                color: #F5F5F5;
            }
            
            #clicker-settings-panel {
                position: fixed;
                bottom: 80px;
                right: 20px;
                width: 280px;
                padding: 15px;
                border-radius: 10px;
                z-index: 10000;
                display: none;
                font-family: Arial, sans-serif;
                max-height: 80vh;
                overflow-y: auto;
                transition: all 0.3s ease;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            }
            
            #clicker-settings-panel.light {
                background: white;
                color: #333;
            }
            
            #clicker-settings-panel.dark {
                background: #1E1E1E;
                color: #E0E0E0;
                box-shadow: 0 2px 10px rgba(0,0,0,0.5);
            }
            
            #clicker-settings-panel h3 {
                margin-top: 0;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid;
            }
            
            #clicker-settings-panel.light h3 {
                color: #4CAF50;
                border-color: #E0E0E0;
            }
            
            #clicker-settings-panel.dark h3 {
                color: #81C784;
                border-color: #424242;
            }
            
            .setting-group {
                margin-bottom: 15px;
                padding-bottom: 15px;
                border-bottom: 1px solid;
            }
            
            #clicker-settings-panel.light .setting-group {
                border-color: #E0E0E0;
            }
            
            #clicker-settings-panel.dark .setting-group {
                border-color: #424242;
            }
            
            .setting-item {
                margin-top: 10px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .slider-container {
                width: 100%;
            }
            
            .slider-container label {
                display: block;
                margin-bottom: 5px;
            }
            
            .slider-row {
                display: flex;
                align-items: center;
            }
            
            input[type="range"] {
                flex-grow: 1;
                margin-right: 10px;
            }
            
            .slider-value {
                min-width: 40px;
                text-align: right;
            }
            
            select {
                padding: 5px;
                border-radius: 5px;
            }
            
            #clicker-settings-panel.light select {
                background: white;
                color: #333;
                border: 1px solid #CCCCCC;
            }
            
            #clicker-settings-panel.dark select {
                background: #2D2D2D;
                color: #E0E0E0;
                border: 1px solid #555555;
            }
            
            input[type="checkbox"] {
                margin-right: 10px;
            }
            
            .telegram-link {
                text-align: center;
                margin-top: 15px;
                font-size: 14px;
            }
            
            .telegram-link a {
                color: #0088cc;
                text-decoration: none;
                transition: color 0.3s ease;
            }
            
            .telegram-link a:hover {
                color: #005580;
                text-decoration: underline;
            }
            
            #clicker-settings-panel.dark .telegram-link a {
                color: #62B0E8;
            }
            
            #clicker-settings-panel.dark .telegram-link a:hover {
                color: #9CCEF0;
            }
        `;
        document.head.appendChild(style);
    }

    // Создание интерфейса настроек
    function createSettingsUI() {
        // Проверяем, нет ли уже кнопки настроек
        if (document.getElementById('clicker-settings-btn')) {
            return;
        }
        
        console.log('Создаю интерфейс настроек');
        
        // Создаем стили
        createStyles();
        
        const settingsButton = document.createElement('button');
        settingsButton.id = 'clicker-settings-btn';
        settingsButton.className = config.darkMode ? 'dark' : 'light';
        settingsButton.textContent = '⚙️';
        
        const settingsPanel = document.createElement('div');
        settingsPanel.id = 'clicker-settings-panel';
        settingsPanel.className = config.darkMode ? 'dark' : 'light';
        
        settingsPanel.innerHTML = `
            <h3>${t('title')}</h3>
            
            <div class="setting-group">
                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="script-enabled" ${config.enabled ? 'checked' : ''}>
                        ${t('clickerOn')}
                    </label>
                </div>
                
                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="collect-weeds" ${config.collectWeeds ? 'checked' : ''}>
                        ${t('weeds')}
                    </label>
                </div>
                
                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="collect-lawnmowers" ${config.collectLawnmowers ? 'checked' : ''}>
                        ${t('lawnmowers')}
                    </label>
                </div>
                
                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="collect-lootboxes" ${config.collectLootboxes ? 'checked' : ''}>
                        ${t('lootboxes')}
                    </label>
                </div>
                
                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="auto-buy" ${config.autoBuy ? 'checked' : ''}>
                        ${t('autoBuy')}
                    </label>
                </div>
            </div>
            
            <div class="setting-group">
                <div class="setting-item">
                    <div class="slider-container">
                        <label>${t('clickInterval')}</label>
                        <div class="slider-row">
                            <input type="range" id="click-interval" min="50" max="1000" value="${config.clickInterval}">
                            <span id="interval-value" class="slider-value">${config.clickInterval}</span>
                        </div>
                    </div>
                </div>
                
                <div class="setting-item">
                    <div class="slider-container">
                        <label>${t('bonusInterval')}</label>
                        <div class="slider-row">
                            <input type="range" id="collect-interval" min="500" max="3000" step="100" value="${config.collectInterval}">
                            <span id="collect-interval-value" class="slider-value">${config.collectInterval}</span>
                        </div>
                    </div>
                </div>
                
                <div class="setting-item">
                    <div class="slider-container">
                        <label>${t('buyInterval')}</label>
                        <div class="slider-row">
                            <input type="range" id="buy-interval" min="500" max="5000" step="500" value="${config.buyInterval}">
                            <span id="buy-interval-value" class="slider-value">${config.buyInterval}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="setting-group">
                <div class="setting-item">
                    <label>${t('darkMode')}</label>
                    <input type="checkbox" id="dark-mode" ${config.darkMode ? 'checked' : ''}>
                </div>
                
                <div class="setting-item">
                    <label>${t('language')}</label>
                    <select id="language-select">
                        <option value="ru" ${config.language === 'ru' ? 'selected' : ''}>Русский</option>
                        <option value="en" ${config.language === 'en' ? 'selected' : ''}>English</option>
                    </select>
                </div>
            </div>
            
            <div class="telegram-link">
                <a href="https://t.me/mudachyo" target="_blank">@mudachyo</a>
            </div>
        `;
        
        // Добавляем элементы в body
        document.body.appendChild(settingsButton);
        document.body.appendChild(settingsPanel);
        
        // Обработчики событий для настроек
        settingsButton.addEventListener('click', () => {
            settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
        });
        
        // Обработчики для чекбоксов
        document.getElementById('script-enabled').addEventListener('change', (e) => {
            config.enabled = e.target.checked;
            startScripts();
        });
        
        document.getElementById('collect-weeds').addEventListener('change', (e) => {
            config.collectWeeds = e.target.checked;
            startScripts();
        });
        
        document.getElementById('collect-lawnmowers').addEventListener('change', (e) => {
            config.collectLawnmowers = e.target.checked;
            startScripts();
        });
        
        document.getElementById('collect-lootboxes').addEventListener('change', (e) => {
            config.collectLootboxes = e.target.checked;
            startScripts();
        });
        
        document.getElementById('auto-buy').addEventListener('change', (e) => {
            config.autoBuy = e.target.checked;
            startScripts();
        });
        
        // Обработчики для слайдеров
        const intervalSlider = document.getElementById('click-interval');
        const intervalDisplay = document.getElementById('interval-value');
        
        intervalSlider.addEventListener('input', (e) => {
            config.clickInterval = parseInt(e.target.value);
            intervalDisplay.textContent = config.clickInterval;
            startScripts();
        });
        
        const collectIntervalSlider = document.getElementById('collect-interval');
        const collectIntervalDisplay = document.getElementById('collect-interval-value');
        
        collectIntervalSlider.addEventListener('input', (e) => {
            config.collectInterval = parseInt(e.target.value);
            collectIntervalDisplay.textContent = config.collectInterval;
            startScripts();
        });
        
        const buyIntervalSlider = document.getElementById('buy-interval');
        const buyIntervalDisplay = document.getElementById('buy-interval-value');
        
        buyIntervalSlider.addEventListener('input', (e) => {
            config.buyInterval = parseInt(e.target.value);
            buyIntervalDisplay.textContent = config.buyInterval;
            startScripts();
        });
        
        // Обработчики для темы и языка
        document.getElementById('dark-mode').addEventListener('change', (e) => {
            config.darkMode = e.target.checked;
            updateTheme();
        });
        
        document.getElementById('language-select').addEventListener('change', (e) => {
            config.language = e.target.value;
            updateLanguage();
        });
        
        console.log('Интерфейс настроек создан');
    }
    
    // Обновление темы
    function updateTheme() {
        const settingsBtn = document.getElementById('clicker-settings-btn');
        const settingsPanel = document.getElementById('clicker-settings-panel');
        
        if (config.darkMode) {
            settingsBtn.className = 'dark';
            settingsPanel.className = 'dark';
        } else {
            settingsBtn.className = 'light';
            settingsPanel.className = 'light';
        }
    }
    
    // Обновление языка
    function updateLanguage() {
        // Полностью обновляем UI с новым языком
        const settingsPanel = document.getElementById('clicker-settings-panel');
        if (settingsPanel) {
            settingsPanel.remove();
            document.getElementById('clicker-settings-btn').remove();
            createSettingsUI();
        }
    }

    // Функция для сбора всех бонусов
    function collectAllBonuses() {
        findAndCollectWeeds();
        findAndClickLawnmowers();
        findAndClickLootboxes();
    }

    // Запуск основных функций
    let clickIntervalId = null;
    let collectIntervalId = null;
    let buyIntervalId = null;
    
    function startScripts() {
        // Останавливаем предыдущие интервалы
        if (clickIntervalId) clearInterval(clickIntervalId);
        if (collectIntervalId) clearInterval(collectIntervalId);
        if (buyIntervalId) clearInterval(buyIntervalId);
        
        if (config.enabled) {
            console.log(`${t('autoClickerStarted')} ${config.clickInterval}${t('ms')}`);
            clickIntervalId = setInterval(clickRandomly, config.clickInterval);
        } else {
            console.log(t('autoClickerStopped'));
        }
        
        // Объединяем все бонусы в один интервал
        if (config.collectWeeds || config.collectLawnmowers || config.collectLootboxes) {
            console.log(`${t('bonusCollectionStarted')} ${config.collectInterval}${t('ms')}`);
            collectIntervalId = setInterval(collectAllBonuses, config.collectInterval);
        }
        
        if (config.autoBuy) {
            console.log(`${t('autoBuyStarted')} ${config.buyInterval}${t('ms')}`);
            buyIntervalId = setInterval(buyUpgrades, config.buyInterval);
        }
    }
    
    // Инициализация скрипта
    function init() {
        if (!isGamePage()) {
            console.log('Это не страница игры, скрипт не активирован');
            return;
        }
        
        console.log('Обнаружена страница игры, инициализирую скрипт');
        createSettingsUI();
    }
    
    // Запускаем инициализацию с небольшой задержкой
    setTimeout(init, 1000);
    
    // Наблюдатель за изменениями DOM для повторной инициализации при необходимости
    const observer = new MutationObserver((mutations) => {
        if (!document.getElementById('clicker-settings-btn') && isGamePage()) {
            console.log('Страница изменилась, перезапускаю инициализацию');
            init();
        }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Повторная проверка каждые 5 секунд для надежности
    setInterval(() => {
        if (!document.getElementById('clicker-settings-btn') && isGamePage()) {
            init();
        }
    }, 5000);
})();