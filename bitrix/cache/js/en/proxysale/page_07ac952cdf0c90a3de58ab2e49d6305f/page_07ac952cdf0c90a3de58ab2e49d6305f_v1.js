;
const ProxyPicker = function(params) {
    this.params = params;
    this.section = document.querySelector('[data-proxy-picker]');
    this.form = this.section.querySelector('form');
    this.selects = {
        proxyType: this.form.querySelector('[data-proxy-type-slct]'),
        countries: this.form.querySelector('[data-countries-slct]'),
        terms: this.form.querySelector('[data-terms-slct]'),
        packages: this.section.querySelector('[data-packages-slct]')
    };
    this.inputs = {
        proxyTypeID: this.form.querySelector('input[name=proxy_type_id]'),
        countryID: this.form.querySelector('input[name=country_id]'),
        quantity: this.form.querySelector('input[name=quantity'),
        quantityRange: this.form.querySelector('input[name=quantity_range'),
        countrySearch: this.form.querySelector('input[type=search'),
        termID: this.form.querySelector('input[name=term_id')
    };
    this.priceTag = {
        tooltip: this.form.querySelector('[data-pricetag-tooltip]'),
        perItem: this.form.querySelector('[data-pricetag-peritem]'),
        discount: this.form.querySelector('[data-pricetag-discount]'),
        total: this.form.querySelector('[data-pricetag-total]'),
        discountTooltip: this.form.querySelector('[data-pricetag-disc-tooltip]')
    };
    this.btns = {
        showInfo: this.form.querySelector('button.more'),
        cotactUs: this.section.querySelector('[data-contact-us-btn]')
    };
};
ProxyPicker.prototype = {
    run() {
        this.selects.proxyType.addEventListener('click', event => {
            if (event.target.tagName === 'INPUT')
                this.onProxyTypeSelect(event);
        });
        this.inputs.quantity.addEventListener('input', event => {
            this.onInputQauntity(event);
        });
        this.inputs.quantity.addEventListener('focus', event => {
            this.onFocusQuantity(event);
        });
        this.inputs.quantity.addEventListener('focusout', event => {
            this.onFocusOutQuantity(event);
        });
        this.inputs.countrySearch.addEventListener('input', event => {
            this.onInputCountrySearch(event);
        });
        this.inputs.quantityRange.addEventListener('input', event => {
            this.onInputQauntityRange(event);
        });
        this.inputs.quantityRange.addEventListener('change', event => {
            this.onChangeQauntityRange(event);
        });
        this.selects.countries.querySelector('ul').addEventListener('click', e => {
            if (e.target.tagName === 'LI' || e.target.tagName === 'SPAN')
                this.onSelectCountry(e);
        });
        this.selects.terms.querySelector('ul').addEventListener('click', e => {
            if (e.target.tagName === 'LI' || e.target.tagName === 'SPAN')
                this.onSelectTerm(e);
        });
        this.selects.packages.querySelector('ul').addEventListener('click', e => {
            if (e.target.tagName !== 'UL')
                this.onSelectPackage(e);
        });
        this.btns.showInfo.addEventListener('click', e => this.onClickShowInfoBtn(e));
        this.btns.cotactUs.addEventListener('click', e => this.onClickCotactUsBtn(e));
        document.addEventListener('DOMContentLoaded', () => this.onDocReady());
        this.form.addEventListener('submit', event => this.onSubmitForm(event));
    },
    onProxyTypeSelect(e) {
        this.inputs.proxyTypeID.value = e.target.id;
        this.skipPriceCalc = true;
        this.loadTypeInfo();
        this.loadCountries();
        this.loadTerms();
        this.loadPackages();
        this.skipPriceCalc = false;
        this.calcPrice();
    },
    onInputQauntity(e) {
        if (e.target.delay)
            e.target.delay = clearTimeout(e.target.delay);
        let value = e.target.value.replace(/\D/g, '');
        let ID = this.inputs.proxyTypeID.value;
        let maxQty = parseInt(this.params.items[ID].max_order_qty);
        let minQty = parseInt(this.params.items[ID].min_order_qty);
        if (value !== '') {
            value = parseInt(value);
            if (value > maxQty)
                value = maxQty;
            else if (value < minQty) {
                e.target.delay = setTimeout(() => {
                    [e.target.value, e.target.delay] = [minQty, false];
                    e.target.dispatchEvent(new Event('input'));
                }, 400);
            }
        }
        this.inputs.quantityRange.value = (value === '' ? 0 : value);
        value += ' ' + BX.message('_PC' + (value > 1 ? 'S' : ''));
        e.target.value = value;
        this.adjustQuantiyCursorPosition();
        this.calcPrice();
    },
    onFocusOutQuantity(e) {
        let value = e.target.value.replace(/\D/g, '');
        let ID = this.inputs.proxyTypeID.value;
        let minQty = parseInt(this.params.items[ID].min_order_qty);
        let maxQty = parseInt(this.params.items[ID].max_order_qty);
        if (value === '' || parseInt(value) < minQty)
            value = minQty;
        else if (parseInt(value) > maxQty)
            value = maxQty;
        else
            value = parseInt(value);
        this.inputs.quantityRange.value = value;
        value += ' ' + BX.message('_PC' + (value > 1 ? 'S' : ''));
        e.target.value = value;
        this.calcPrice();
    },
    onInputCountrySearch(e) {
        let query = e.target.value.toLowerCase().trim(),
            slctr1, slctr2;
        slctr1 = 'li[data-name]', slctr2 = `${slctr1}[style*="display: none"]`;
        this.selects.countries.querySelectorAll(slctr2).forEach(country => {
            country.style.display = '';
        });
        if (!query)
            return;
        this.selects.countries.querySelectorAll(slctr1).forEach(country => {
            if (!country.dataset.name.toLowerCase().match(query))
                country.style.display = 'none';
        });
    },
    onFocusQuantity(e) {
        setTimeout(() => this.adjustQuantiyCursorPosition(), 1);
    },
    onInputQauntityRange(e) {
        let value = e.target.value.replace(/\D/g, '');
        let pcs = BX.message((value > 1 ? '_PCS' : '_PC'));
        this.inputs.quantity.value = value + ' ' + pcs;
        e.target.value = value;
    },
    onChangeQauntityRange(e) {
        this.inputs.quantity.dispatchEvent(new Event('focusout'));
    },
    onSelectCountry(e) {
        let target = e.target.tagName === 'LI' ? e.target : e.target.parentNode;
        this.inputs.countryID.value = target.dataset.value;
        this.loadPackages();
        this.calcPrice();
    },
    onSelectTerm(e) {
        let target = e.target.tagName === 'LI' ? e.target : e.target.parentNode;
        this.inputs.termID.value = target.dataset.value;
        this.loadPackages();
        this.calcPrice();
    },
    onSelectPackage(e) {
        let typeID = this.inputs.proxyTypeID.value;
        if (!typeID || !this.params.items[typeID])
            return;
        let target = e.target;
        while (target && target.tagName !== 'LI')
            target = target.parentNode;
        let packID = target.dataset.value,
            qty;
        for (let key in this.params.items[typeID].packages) {
            if (this.params.items[typeID].packages[key].ID === packID) {
                qty = this.params.items[typeID].packages[key].COUNT;
                break;
            }
        }
        if (!qty)
            return;
        this.inputs.quantity.value = qty;
        this.inputs.quantity.dispatchEvent(new Event('input'));
    },
    onClickShowInfoBtn(e) {
        [e.preventDefault(), e.stopPropagation()];
        $.magnificPopup.open({
            items: {
                src: '#proxy-type-info'
            },
            type: 'inline',
            mainClass: 'mfp-zoom-in',
            removalDelay: 200,
            closeOnBgClick: true,
            closeOnContentClick: false,
            tClose: BX.message('MFP_CLOSE'),
            closeMarkup: `
                <button title="%title%" type="button" class="mfp-close">
                    <i><i class="fas fa-times"></i></i>
                </button>`.trim()
        });
    },
    onClickCotactUsBtn(e) {
        [e.preventDefault(), e.stopPropagation()];
        location.href = this.params.siteDir + 'contacts/';
    },
    onDocReady() {
        this.orderPopups = {
            ipv4: IPv4OrderForm,
            ipv6: IPv6OrderForm,
            isp: ISPOrderForm,
            mobile: MobileProxyOrderForm
        };
        setTimeout(() => {
            let $tolltip = $(this.priceTag.discountTooltip);
            $tolltip.tooltipster('option', 'contentAsHTML', true);
        }, 1000);
    },
    onSubmitForm(e) {
        [e.preventDefault(), e.stopPropagation()];
        let typeID = this.inputs.proxyTypeID.value;
        let proxyType = this.params.items[typeID].type.toLowerCase();
        let OrderPopup = this.orderPopups[proxyType];
        let countryID = this.inputs.countryID.value,
            mainTargetID, targetID;
        let quantity = parseInt(this.inputs.quantity.value.replace(/\D/g, ''));
        if (OrderPopup.targets !== undefined) {
            mainTargetID = OrderPopup.targets[0].ITEM.ID;
            targetID = OrderPopup.targets[0].ITEMS[0].ID;
        }
        OrderPopup.reset();
        if (mainTargetID)
            OrderPopup.setMainTarget(mainTargetID);
        if (targetID)
            OrderPopup.setTarget(targetID);
        OrderPopup.setCountry(countryID);
        OrderPopup.setTerm(this.inputs.termID.value);
        OrderPopup.setQuantity(quantity);
        if (proxyType === 'mobile') {
            OrderPopup.loadOperators();
            OrderPopup.form.find('[data-operator-select] li').first().click();
            OrderPopup.loadRotations();
            OrderPopup.form.find('[data-rotation-select] li').first().click();
            OrderPopup.calc();
        }
        OrderPopup.open();
    },
    loadTypeInfo() {
        let id = this.inputs.proxyTypeID.value;
        if (!id || !this.params.items[id])
            return;
        let discounts = Object.values(this.params.items[id].qty_discounts);
        let $tooltip = $(this.priceTag.discountTooltip);
        $tooltip.tooltipster('content', discounts.join('<br>'));
        if (this.params.items[id].type === 'Mobile')
            this.priceTag.discountTooltip.style.display = 'none';
        else
            this.priceTag.discountTooltip.style.display = '';
        let charcs = this.form.querySelector('[data-type-characteristics]');
        let mobCharcs = this.form.querySelector('[data-mob-characteristics]');
        charcs.innerHTML = this.params.items[id].characteristics;
        mobCharcs.innerHTML = this.params.items[id].characteristics;
        let info = this.form.querySelector('[data-type-additional-info]');
        let mobInfo = this.form.querySelector('[data-mob-additional-info]');
        info.innerHTML = this.params.items[id].additional_info;
        mobInfo.innerHTML = this.params.items[id].additional_info;
        let minQty = this.params.items[id].min_order_qty;
        let maxQty = this.params.items[id].max_order_qty;
        this.section.querySelector('[data-min-qty]').textContent = minQty;
        this.section.querySelector('[data-max-qty]').textContent = maxQty;
        this.inputs.quantityRange.min = minQty;
        this.inputs.quantityRange.max = maxQty;
        this.inputs.quantity.value = minQty;
        this.inputs.quantity.dispatchEvent(new Event('focusout'));
    },
    loadCountries() {
        let id = this.inputs.proxyTypeID.value;
        let titleElm = this.selects.countries.querySelector('.slct span');
        let html = '',
            title = BX.message('SELECT_COUNTRY'),
            countryID = '';
        if (id && this.params.items[id]) {
            this.params.items[id].countries.forEach(country => {
                let name = country.NAME,
                    value = country.ID;
                let dataset = `data-name="${name}" data-value="${value}"`;
                html += `<li ${dataset} ><span>${name}</span></li>`;
            });
            title = this.params.items[id].countries[0].NAME;
            countryID = this.params.items[id].countries[0].ID;
        }
        titleElm.textContent = title;
        this.inputs.countrySearch.value = '';
        this.inputs.countrySearch.dispatchEvent(new Event('input'));
        let countryList = this.selects.countries.querySelector('ul');
        let countrySearch = countryList.querySelector('.drop-search');
        [(countryList.innerHTML = html), countryList.prepend(countrySearch)];
        this.inputs.countryID.value = countryID;
    },
    loadTerms() {
        let id = this.inputs.proxyTypeID.value;
        let titleElm = this.selects.terms.querySelector('.slct span');
        let html = '',
            title = BX.message('SELECT_RENTAL_PERIOD'),
            termID = '';
        if (id && this.params.items[id]) {
            this.params.items[id].terms.forEach(term => {
                let span = '<span>' + term.NAME + '</span>';
                html += '<li data-value="' + term.ID + '">' + span + '</li>';
            });
            title = this.params.items[id].base_term.NAME;
            termID = this.params.items[id].base_term.ID;
        }
        titleElm.textContent = title;
        this.selects.terms.querySelector('ul').innerHTML = html;
        this.inputs.termID.value = termID;
    },
    loadPackages() {
        this.loadPrices().then(prices => {
            let id = this.inputs.proxyTypeID.value;
            let tmpl = `<li class="offer-list__item" data-value="#ID#">
                <button>
                    <div>#COUNT#<span>#_PCS#</span></div>
                    <div>#PRICE#<span>#PRICE_PER_IP# 1 IP</span></div>
                </button>
             </li>`,
                html = '';
            this.params.items[id].packages.forEach(pack => {
                let price = parseFloat(prices[pack.COUNT].price);
                let packPrice = (price * parseInt(pack.COUNT));
                pack._PCS = BX.message('_PCS');
                pack.PRICE = BX.Currency.currencyFormat(packPrice, this.params.currency, true);
                pack.PRICE_PER_IP = prices[pack.COUNT].print_price;
                html += tmpl.replace(/#\w+#/g, m => pack[m.replaceAll('#', '')]);
            });
            this.selects.packages.querySelector('ul').innerHTML = html;
            return prices;
        });
    },
    showPriceTooltip() {
        let tooltip = this.priceTag.tooltip.parentNode;
        if (tooltip.hideTimeout)
            clearTimeout(tooltip.hideTimeout);
        tooltip.hideTimeout = setTimeout(() => this.hidePriceTooltip(), 3000);
        if (tooltip.showInterval || tooltip.shown)
            return;
        tooltip.style.opacity = 0;
        tooltip.style.display = '';
        tooltip.showInterval = setInterval(() => {
            let curVal = parseFloat(tooltip.style.opacity);
            tooltip.style.opacity = curVal + 0.1;
            if (curVal + 0.1 >= 1) {
                clearInterval(tooltip.showInterval);
                tooltip.shown = true;
                tooltip.showInterval = false;
            }
        }, 30);
    },
    hidePriceTooltip() {
        let tooltip = this.priceTag.tooltip.parentNode;
        if (tooltip.hideInterval || !tooltip.shown)
            return;
        tooltip.style.opacity = 1;
        tooltip.hideTimeout = false;
        tooltip.hideInterval = setInterval(() => {
            let curVal = parseFloat(tooltip.style.opacity);
            tooltip.style.opacity = curVal - 0.1;
            if (curVal - 0.1 <= 0) {
                clearInterval(tooltip.hideInterval);
                tooltip.shown = false;
                tooltip.hideInterval = false;
                tooltip.style.display = 'none';
            }
        }, 50);
    },
    adjustQuantiyCursorPosition() {
        let value = this.inputs.quantity.value.replace(/\D/g, '');
        let start = this.inputs.quantity.selectionStart;
        if (start > value.length)
            this.inputs.quantity.setSelectionRange(value.length, value.length);
    },
    loadPrices() {
        if (this.loader)
            return this.loader;
        this.loader = new Promise((resolve, reject) => {
            let data = this.getData();
            let item = this.params.items[data.typeID];
            if (!item.prices[data.countryID])
                item.prices[data.countryID] = {};
            if (item.prices[data.countryID][data.termID])
                return resolve(item.prices[data.countryID][data.termID]);
            let params = {
                method: 'POST',
                body: this.getFormData()
            };
            let promise = fetch(this.params.ajaxUrl, params);
            promise.then(res => res.json()).then(response => {
                if (response.status === 'ok') {
                    item.prices[data.countryID][data.termID] = response.prices;
                    resolve(response.prices);
                } else
                    reject(new Error(response.message));
            });
        });
        this.loader.finally(() => this.loader = false);
        return this.loader;
    },
    getData() {
        return {
            typeID: this.inputs.proxyTypeID.value,
            countryID: this.inputs.countryID.value,
            termID: this.inputs.termID.value,
            qty: parseInt(this.inputs.quantity.value.replace(/\D/g, ''))
        };
    },
    getFormData() {
        let data = this.getData();
        let formData = new FormData();
        for (let key in data)
            formData.set(key, data[key]);
        formData.set('sessid', BX.bitrix_sessid());
        formData.set('type', this.params.items[data.typeID].type);
        formData.set('getPrices', 'Y');
        return formData;
    },
    calcPrice() {
        if (this.skipPriceCalc)
            return;
        if (!this.getData().qty)
            return this.fillPriceTag(0, 0, 0);
        this.loadPrices().then(prices => {
            let data = this.getData(),
                qtyFrom;
            for (let quantytyFrom in prices) {
                if (data.qty < quantytyFrom)
                    break;
                qtyFrom = quantytyFrom;
            }
            let price = prices[qtyFrom].price,
                total = price * data.qty;
            let baseTotal = prices[1].price * data.qty;
            let discount = Math.round(100 - (total / (baseTotal / 100)));
            this.fillPriceTag(price, total, discount);
            return prices;
        }).catch(e => this.handleError(e));
    },
    fillPriceTag(price, total, discount) {
        let curr = this.params.currency;
        let printPrice = BX.Currency.currencyFormat(price, curr, true);
        let printTotal = BX.Currency.currencyFormat(total, curr, true);
        this.priceTag.tooltip.textContent = printPrice;
        this.priceTag.perItem.textContent = printPrice;
        this.priceTag.discount.textContent = discount + '%';
        this.priceTag.total.textContent = printTotal;
    },
    handleError(e) {
        let localeMessage = BX.message(e.message);
        if (localeMessage === '')
            localeMessage = BX.message('SOMETHING_WRONG');
        notificate(localeMessage);
        setTimeout(() => location.reload(), 3000);
    }
};;;
const MainReviews = function(params) {
    this.params = params;
    this.section = document.querySelector('[data-main-reviews]');
    this.tabs = this.section.querySelector('[data-reviews-tabs]');
    this.tabsMobile = this.section.querySelector('[data-reviews-tabs-mob]');
    this.items = this.section.querySelector('[data-reviews-items]');
    this.loader = new Loader(this.items);
};
MainReviews.prototype = {
    run() {
        this.loader.on('show', e => this.onShowLoader(e));
        this.loader.on('hide', e => this.onHideLoader(e));
        this.tabs.querySelectorAll('li').forEach(tab => tab.addEventListener('click', e => this.onClickTab(e)));
        this.tabsMobile.addEventListener('click', e => this.onClickTab(e));
        if (this.params.scrollIntoView)
            this.section.scrollIntoView();
    },
    onShowLoader(e) {
        this.section.style.pointerEvents = 'none';
    },
    onHideLoader(e) {
        this.section.style.pointerEvents = '';
    },
    onClickTab(e) {
        let tab = e.target.closest('li');
        let activeTab = this.tabs.querySelector('li.active');
        if (activeTab) {
            activeTab.classList.remove('active');
            tab.classList.add('active');
        }
        if (this.params.editMode)
            this.submitForm(tab.dataset.value);
        else
            this.ajax(tab.dataset.value);
    },
    submitForm(sectionID) {
        let form = document.createElement('FORM');
        let input = document.createElement('INPUT');
        form.action = location.href;
        form.method = 'POST';
        input.type = 'hidden';
        input.name = 'reviewsSectionID';
        input.value = sectionID;
        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
    },
    ajax(sectionID) {
        let data = new FormData();
        data.set('ajax', 'Y');
        data.set('sessid', BX.bitrix_sessid());
        data.set('sectionID', sectionID);
        this.loader.show();
        let promise = fetch(this.params.ajaxUrl, {
            method: 'POST',
            body: data
        });
        promise.then(res => res.text()).then(html => {
            this.loader.hide();
            this.items.innerHTML = html;
            this.resetSwiper();
        });
    },
    resetSwiper() {
        let container = this.section.querySelector('.swiper-container');
        if (!container || !container.swiper)
            return;
        let passedParams = container.swiper.passedParams;
        container.swiper.destroy(true, true);
        new Swiper(container, passedParams);
    }
};;;
const MainArticles = function(params) {
    this.params = params;
    this.section = document.querySelector('[data-main-articles]');
    this.tabs = this.section.querySelector('[data-articles-tabs]');
    this.tabsMobile = this.section.querySelector('[data-articles-tabs-mob]');
    this.items = this.section.querySelector('[data-articles-items]');
    this.loader = new Loader(this.items);
};
MainArticles.prototype = {
    run() {
        this.loader.on('show', e => this.onShowLoader(e));
        this.loader.on('hide', e => this.onHideLoader(e));
        this.tabs.querySelectorAll('li').forEach(tab => tab.addEventListener('click', e => this.onClickTab(e)));
        this.tabsMobile.addEventListener('click', e => this.onClickTab(e));
        if (this.params.scrollIntoView)
            this.section.scrollIntoView();
    },
    onShowLoader(e) {
        this.section.style.pointerEvents = 'none';
    },
    onHideLoader(e) {
        this.section.style.pointerEvents = '';
    },
    onClickTab(e) {
        let tab = e.target.closest('li');
        let activeTab = this.tabs.querySelector('li.active');
        if (activeTab) {
            activeTab.classList.remove('active');
            tab.classList.add('active');
        }
        if (this.params.editMode)
            this.submitForm(tab.dataset.value);
        else
            this.ajax(tab.dataset.value);
    },
    submitForm(sectionID) {
        let form = document.createElement('FORM');
        let input = document.createElement('INPUT');
        form.action = location.href;
        form.method = 'POST';
        input.type = 'hidden';
        input.name = 'articlesSectionID';
        input.value = sectionID;
        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
    },
    ajax(sectionID) {
        let data = new FormData();
        data.set('ajax', 'Y');
        data.set('sessid', BX.bitrix_sessid());
        data.set('sectionID', sectionID);
        let promise = fetch(this.params.ajaxUrl, {
            method: 'POST',
            body: data
        });
        this.loader.show();
        promise.then(res => res.text()).then(html => {
            this.loader.hide();
            this.items.innerHTML = html;
            this.resetSwiper();
            YoutubePlayer.run();
        });
    },
    resetSwiper() {
        let container = this.section.querySelector('.swiper-container');
        if (!container || !container.swiper)
            return;
        let passedParams = container.swiper.passedParams;
        container.swiper.destroy(true, true);
        new Swiper(container, passedParams);
    }
};;;
class YoutubePlayer {
    static _loadAPI() {
        if (this._api_tag)
            return window.onYouTubePlayerAPIReady();
        this._api_tag = document.createElement('script');
        this._api_tag.src = "https://www.youtube.com/player_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(this._api_tag, firstScriptTag);
    }
    static _createPopup() {
        if (this._popup)
            return;
        this._id = this.name.toLowerCase();
        this._popup = document.createElement('div');
        this._popup.style.maxWidth = '100%';
        this._popup.style.padding = '5px';
        let dimensions = this._getDimensions();
        this._popup.style.width = (dimensions.width + 10) + 'px';
        this._popup.style.height = (dimensions.height + 10) + 'px';
        this._popup.id = this._id + '_popup';
        let container = document.createElement('div');
        container.id = this._id;
        this._popup.classList.add('mfp-hide', 'white-popup', 'mfp-with-anim');
        this._popup.appendChild(container);
        document.body.appendChild(this._popup);
    }
    static _getDimensions() {
        let width = ((window.innerWidth / 100) * 90);
        let height = ((width / 100) * 56.25);
        if (width > 1280)
            [width, height] = [1280, 720];
        let maxHeight = ((window.innerHeight / 100) * 90);
        if (height > maxHeight) {
            height = maxHeight;
            width = ((height / 56.25) * 100);
        }
        return {
            width,
            height
        };
    }
    static _createPlayer() {
        if (this._player)
            return;
        let dimensions = this._getDimensions();
        this._player = new YT.Player(this._id, {
            height: dimensions.height,
            width: dimensions.width,
            autoplay: true,
            events: {
                onReady: e => this._onPlayerReady(e)
            }
        });
    }
    static _openPopup() {
        if (!this._popup)
            return;
        $.magnificPopup.open({
            items: {
                src: `#${this._popup.id}`
            },
            type: 'inline',
            mainClass: 'mfp-zoom-in',
            removalDelay: 200,
            closeOnBgClick: true,
            callbacks: {},
            closeOnContentClick: false,
            tClose: BX.message('MFP_CLOSE'),
            closeMarkup: `
                <button title="%title%" type="button" class="mfp-close">
                    <i><i class="fas fa-times"></i></i>
                </button>`.trim()
        });
    }
    static _runResizeController() {
        if (this._resizeController)
            return;
        window.addEventListener('resize', () => this._onWindowResize());
        this._resizeController = true;
    }
    static _onWindowResize() {
        let dimensions = this._getDimensions();
        this._popup.style.width = (dimensions.width + 10) + 'px';
        this._popup.style.height = (dimensions.height + 10) + 'px';
        let iframe = this._popup.querySelector('#' + this._id);
        iframe.style.width = dimensions.width + 'px';
        iframe.style.height = dimensions.height + 'px';
    }
    static _onPlayerReady() {
        if (!$.magnificPopup.instance.isOpen)
            return;
        if (this._videoId)
            this._player.loadVideoById(this._videoId);
    }
    static _onClickVideo(e) {
        [e.preventDefault(), e.stopPropagation()];
        let video = e.target.closest('[data-youtube-url]'),
            url, id;
        if ((url = video.dataset.youtubeUrl)) {
            if ((id = this._extractVideoId(url)))
                this.playVideo(id);
        }
    }
    static _extractVideoId(url) {
        let videoId = null;
        const pattern = /(?:\/|%3D|v=|vi=)([0-9A-Za-z_-]{11})(?:[%#?&]|$)/;
        const match = url.match(pattern);
        if (match)
            videoId = match[1];
        return videoId;
    }
    static playVideo(id) {
        this._videoId = id;
        this._openPopup();
    }
    static run() {
        this._videos = document.querySelectorAll('[data-youtube-url]');
        if (!this._videos.length)
            return;
        this._loadAPI();
        window.onYouTubePlayerAPIReady = () => {
            this._createPopup();
            this._createPlayer();
            this._runResizeController();
            this._videos.forEach(video => {
                if (!video.youtubePlayerEvent)
                    video.addEventListener('click', e => this._onClickVideo(e));
                else
                    video.youtubePlayerEvent = true;
            });
        };
    }
};;
var IPv4OrderForm = function(baseParams) {
    this.countries = baseParams['countries'];
    this.targets = baseParams['targets'];
    this.packages = baseParams['packages'];
    this.terms = baseParams['terms'];
    this.items = [];
    this.productsIds = [];
    this.formSelector = '#ipv4-popup-automatic-payment [data-order-form]';
    this.form = $(this.formSelector);
    this.openPopupBtn = $('[data-mfp-src="#ipv4-popup-automatic-payment"]');
    this.ajaxUrl = baseParams.ajaxUrl;
    this.proxyType = baseParams.proxyType;
    this.countrySearch = this.form[0].querySelector('li.drop-search');
};
IPv4OrderForm.prototype.init = function(initParams) {
    this.initHandlers();
    this.setMainTarget(initParams['main_target_id']).setTarget(initParams['target_id']).setCountry(initParams['country_id']);
    var $form = this.form;
    this.targetHint($form.find('[data-item]').first());
    this.autoSelect($form.find('[data-item]').first());
    this.items = IPv4OrderItems;
    return;
};
IPv4OrderForm.prototype.initHandlers = function() {
    var self = this;
    var formSelector = this.formSelector;
    $(document).ready(function() {
        $(document).on('change', `${formSelector} [name="email"]`, function() {
            var coupon = self.form.find('[data-coupon-inp]').val();
            if (!coupon) {
                return;
            }
            self.couponApply(coupon);
        });
        $(document).on('click', 'body', function() {
            self.form.find('[data-coupon-error]').parent().hide();
        });
        $(document).on('change', `${formSelector} [data-coupon-inp]`, function() {
            var coupon = $(this).val();
            self.couponApply(coupon);
        });
        $(document).on('click', `${formSelector} [data-coupon-clear]`, function() {
            self.couponClear();
        });
        $(document).on('click', `${formSelector} [data-paymethod-slct] li`, function() {
            self.calc();
        });
        $(document).on('click', `${formSelector} .popup-automatic-payment__add-another-inner.del a`, function() {
            self.calc();
        });
        $(document).on('click', `${formSelector} .error, ${formSelector} .error-lbl`, function() {
            $(this).removeClass('error');
            $(this).removeClass('error-lbl');
        });
        $(document).on('click', `${formSelector} [data-country-select] li:not(.drop-search)`, function() {
            var $block = $(this).closest('[data-item]');
            self.loadMainTargets($block);
            self.loadTargets($block);
            self.calc();
            self.targetHint($block);
        });
        self.countrySearch.querySelector('input').addEventListener('input', event => self.onInputCountrySearch(event));
        $(document).on('click', `${formSelector} [data-main-target-select] li`, function() {
            self.resetTarget(this);
            var $block = $(this).closest('[data-item]');
            self.loadTargets($block);
            self.calc();
            self.targetHint($block);
            self.autoSelect($block);
        });
        $(document).on('click', `${formSelector} [data-target-select] li`, function() {
            var $block = $(this).closest('[data-item]');
            self.calc($block);
            self.targetHint($block);
        });
        $(document).on('change', `${formSelector} [name="quantity[]"]`, function() {
            self.calc();
        });
        $(document).on('click', `${formSelector} [data-term-select] li`, function() {
            self.calc();
        });
        new IpInput(`${formSelector} .ip[name=ip]`);
        $(document).on('submit', formSelector, function() {
            if (!self.checkFields()) {
                return false;
            }
            var $form = $(this);
            let gtm_data = GTMDataManager.getData();
            $form.css('opacity', '0.5');
            $.ajax({
                url: self.ajaxUrl,
                type: 'post',
                data: $form.serialize() + `&orderAjax=Y&gtm_data=${gtm_data}`,
                dataType: 'json',
                error: function() {
                    console.log("ajax error");
                    notificate(BX.message('SALE_ORDER_AJAX_ERROR'));
                    $form.css('opacity', '1');
                },
                success: function(response) {
                    if (response['status'] != 'ok') {
                        $form.css('opacity', '1');
                        notificate(response['mess']);
                        return;
                    }
                    if (typeof gtag === 'function') {
                        console.log('sending analytics data...');
                        gtag('event', 'ipv4_zakaz', {
                            'event_category': 'form'
                        });
                    }
                    ym(37232415, 'reachGoal', 'oplata');
                    if (response['qiwi.custom']) {
                        $form.css('opacity', '1');
                        window.QiwiCustomVar = new QiwiCustom(response);
                        window.QiwiCustomVar.checkPopup();
                        return;
                    }
                    location.href = response['url'];
                }
            });
            return false;
        });
    });
};
IPv4OrderForm.prototype.onInputCountrySearch = function(e) {
    let query = e.target.value.toLowerCase().trim(),
        slctr1, slctr2;
    let countryList = this.form[0].querySelector('[data-country-select] ul');
    slctr1 = 'li[data-name]', slctr2 = `${slctr1}[style*="display: none"]`;
    countryList.querySelectorAll(slctr2).forEach(country => {
        country.style.display = '';
    });
    if (query) {
        countryList.querySelectorAll(slctr1).forEach(country => {
            if (!country.dataset.name.toLowerCase().match(query))
                country.style.display = 'none';
        });
    }
};
IPv4OrderForm.prototype.couponApply = function(coupon) {
    var self = this,
        email = self.form.find('[name="email"]').val();
    this.wait();
    $.ajax({
        url: self.ajaxUrl,
        type: 'post',
        data: {
            'orderAjax': 'Y',
            'applyCoupon': 'Y',
            'coupon': coupon,
            'email': email,
            proxyType: self.proxyType,
            sessid: BX.bitrix_sessid()
        },
        dataType: 'json',
        error: function() {
            notificate(BX.message('SALE_ORDER_COUPON_AJAX_ERROR'));
            console.log("ajax error");
        },
        success: function(response) {
            if (response['status'] != 'ok') {
                self.couponError(response['mess']);
                self.form.find('[data-coupon-inp]').val('');
            }
            self.productsIds = [];
            self.calc();
            var $resBtn = self.form.find('[data-res-price]').prev();
            $resBtn.text(BX.message('SALE_ORDER_PAY'));
        }
    });
};
IPv4OrderForm.prototype.couponClear = function() {
    var self = this;
    this.wait();
    $.ajax({
        url: self.ajaxUrl,
        type: 'post',
        data: {
            'orderAjax': 'Y',
            'deleteCoupon': 'Y',
            'coupon': self.form.find('[data-coupon-inp]').val(),
            proxyType: self.proxyType,
            sessid: BX.bitrix_sessid()
        },
        dataType: 'json',
        error: function() {
            notificate(BX.message('SALE_ORDER_COUPON_AJAX_ERROR'));
            console.log("ajax error");
        },
        success: function(response) {
            if (response['status'] != 'ok') {
                self.couponError(response['mess']);
            }
            self.form.find('[data-coupon-inp]').val('');
            self.productsIds = [];
            self.calc();
            var $resBtn = self.form.find('[data-res-price]').prev();
            $resBtn.text(BX.message('SALE_ORDER_PAY'));
        }
    });
}
IPv4OrderForm.prototype.couponError = function(error) {
    $(`${this.formSelector} [data-coupon-error]`).text(error);
    $(`${this.formSelector} [data-coupon-error]`).parent().show();
};
IPv4OrderForm.prototype.reset = function() {
    var $form = this.form,
        $mainTargetSelect = $form.find('[data-main-target-select]');
    $form.find('.error').removeClass('error');
    $form.find('.error-lbl').removeClass('error-lbl');
    $form.find('.target-hint').html('');
    let del = $form.find('.popup-automatic-payment__add-another-inner.del a');
    if (del.length) {
        del.click();
    }
    $.each($form.find('[data-country-select]'), function() {
        $(this).find('.slct').text(BX.message('SELECT_COUNTRY'));
        $(this).find('input[type=hidden]').val('');
    });
    $.each($form.find('[data-main-target-select]'), function() {
        $(this).find('.slct').text(BX.message('SELECT_TARGET'));
        $(this).find('input').val('');
    });
    $.each($form.find('[data-target-select]'), function() {
        $(this).find('.slct').text(BX.message('SPECIFY_TARGET'));
        $(this).find('input').val('');
    });
    $.each($form.find('[data-term-select]'), function() {
        $(this).find('.slct').text(BX.message('SELECT_TERM'));
        $(this).find('input').val('');
    });
    $.each($form.find('.authorization-method-hidden-block'), function() {
        $(this).hide();
        $(this).parent().find(".select").show();
    });
    $form.find('[name="quantity[]"]').val('');
    var $sel = $form.find('[data-auth-method-select]'),
        ipSelVal = $sel.find('.authorization-method-by-main-IP').data('value');
    $form.find('[name="ip"]').val('');
    if ($sel.find('input').val() == ipSelVal) {
        $form.find('[name="ip"]').prev().click();
    }
    $sel.find('input').val('');
    $sel.find('.slct span').text($sel.data('default'));
    var $sel = $form.find('[data-paymethod-slct]');
    $sel.find('input').val('');
    $sel.find('.slct span').text($sel.data('default'));
    $form.find('[name="email"]').val($form.find('[name="email"]').data('value'));
    if ($form.find('[data-coupon-inp]').val()) {
        $form.find('[data-coupon-clear]').click();
    }
    $form.find('[data-result]').html('');
    this.productsIds = [];
    $form.find('[data-res-price]').text('');
    this.calc();
    return this;
};
IPv4OrderForm.prototype.resetTarget = function(elm, event = false) {
    let form = this.form[0],
        targetSelect = false;
    let isLi = (elm.tagName === 'LI');
    let selector = isLi ? '[data-main-target-select]' : '.target-wrap';
    let arSelects = form.querySelectorAll(selector);
    for (let select of arSelects) {
        if (select.contains(elm)) {
            targetSelect = isLi ? select.parentNode.nextElementSibling : select;
            break;
        }
    }
    if (event)
        event.stopPropagation();
    $(targetSelect).find('.slct').text(BX.message('SPECIFY_TARGET'));
    targetSelect.querySelectorAll('input').forEach(input => input.value = '');
    targetSelect.querySelector('[data-clarification-item]').style = 'display: none;';
    targetSelect.querySelector('.select').style = 'display: block;';
    if (!this.calc()) {
        form.querySelector('[data-result]').innerHTML = '';
        form.querySelector('[data-res-price]').textContent = '';
    }
};
IPv4OrderForm.prototype.setCountry = function(id) {
    var $form = this.form,
        $select = $form.find('[data-country-select]').first(),
        country = [];
    $select.find('input[type=hidden]').val('');
    $select.find('.slct').text(BX.message('SELECT_COUNTRY'));
    if (!id) {
        return this;
    }
    for (var t in this.countries) {
        var tmpCountry = this.countries[t];
        if (id == tmpCountry['ID']) {
            country = tmpCountry;
            break;
        }
    }
    if (!country) {
        return this;
    }
    $select.find('input[type=hidden]').val(country['ID']);
    $select.find('.slct').html('<img src="' + country['PICTURE'] + '" alt="' + country['NAME'] + '"><span>' + country['NAME'] + '</span>');
    this.loadMainTargets($form.find('[data-item]').first());
    this.loadTargets($form.find('[data-item]').first());
    this.calc();
    return this;
};
IPv4OrderForm.prototype.setMainTarget = function(id) {
    var $form = this.form,
        $select = $form.find('[data-main-target-select]').first(),
        mainTarget = [];
    $select.find('input').val('');
    $select.find('.slct').text(BX.message('SELECT_TARGET'));
    if (!id) {
        return this;
    }
    for (var t in this.targets) {
        var tmpTarget = this.targets[t];
        if (id == tmpTarget['ITEM']['ID']) {
            mainTarget = tmpTarget;
            break;
        }
    }
    if (!mainTarget) {
        return this;
    }
    $select.find('input').val(mainTarget['ID']);
    $select.find('.slct').text(mainTarget['NAME']);
    this.loadTargets();
    this.calc();
    return this;
};
IPv4OrderForm.prototype.setTarget = function(id) {
    var $form = this.form,
        $mainTargetSelect = $form.find('[data-main-target-select]').first(),
        mainTargetId = $mainTargetSelect.find('input').val(),
        mainTarget = [],
        $select = $form.find('[data-target-select]').first(),
        target = [];
    $select.find('input').val('');
    $select.find('.slct').text(BX.message('SPECIFY_TARGET'));
    if (!id || !mainTargetId) {
        return this;
    }
    for (var t in this.targets) {
        var tmpTarget = this.targets[t];
        if (mainTargetId == tmpTarget['ID']) {
            mainTarget = tmpTarget;
            break;
        }
    }
    for (var t in mainTarget['ITEMS']) {
        var tmpTarget = mainTarget['ITEMS'][t];
        if (id == tmpTarget['ID']) {
            target = tmpTarget;
            break;
        }
    }
    if (!target) {
        return this;
    }
    $select.find('input').val(target['ID']);
    $select.find('.slct').text(target['NAME']);
    if (target['USE_CLARIFICATION']) {
        $select.hide();
        $select.closest('.popup-automatic-payment__top-block-select').find('.authorization-method-hidden-block').show();
    }
    this.calc();
    return this;
};
IPv4OrderForm.prototype.setTerm = function(id) {
    var $form = this.form,
        $select = $form.find('[data-term-select]').first(),
        term = [];
    $select.find('input').val('');
    $select.find('.slct').text(BX.message('SELECT_TERM'));
    if (!id) {
        return this;
    }
    for (var t in this.terms) {
        var tmpTerm = this.terms[t];
        if (id == tmpTerm['ID']) {
            term = tmpTerm;
            break;
        }
    }
    if (!term) {
        return this;
    }
    $select.find('input').val(term['ID']);
    $select.find('.slct').text(term['NAME']);
    this.calc();
    return this;
};
IPv4OrderForm.prototype.setQuantity = function(quantity) {
    var $form = this.form,
        $inp = $form.find('[name="quantity[]"]').first();
    var $inpClosest = $inp.closest(".quantity-block");
    if ($inpClosest.find("li[data-value='" + quantity + "']").length) {
        $inpClosest.find(".slct span").html(quantity + ' ' + BX.message('PCS'));
    } else {
        $inpClosest.find(".authorization-method-by-main-IP").click();
    }
    $inp.val(parseInt(quantity) + ' ' + BX.message('PCS'));
    this.calc();
    return this;
};
IPv4OrderForm.prototype.loadMainTargets = function($block) {
    var $blocks = (typeof($block) == 'undefined' ? this.form.find('[data-item]') : [$block]),
        items = this.items,
        targets = this.targets;
    $.each($blocks, function() {
        var $block = $(this),
            country_id = $block.find('[name="country_id[]"]').val(),
            targetsIds = [],
            subTargetsIds = [],
            $select = $block.find('[data-main-target-select]');
        if (!country_id) {
            $select.find('.slct').html(BX.message('SELECT_TARGET'));
            $select.find('input').val('');
            return;
        }
        for (var i in items) {
            var item = items[i];
            if (country_id == item['country_id']) {
                subTargetsIds.push(item['target_id']);
            }
        }
        $select.find('.drop').html('');
        for (var t in targets) {
            var target = targets[t],
                show = false;
            for (var st in target['ITEMS']) {
                var subTarget = target['ITEMS'][st];
                if (subTargetsIds.indexOf(subTarget['ID']) != -1) {
                    show = true;
                    break;
                }
            }
            if (show) {
                $select.find('.drop').append('<li data-value="' + target['ID'] + '"><span>' + target['NAME'] + '</span></li>');
                targetsIds.push(target['ID']);
            }
        }
        if (!$select.find('.drop').find('li').length) {
            $select.find('.slct').html(BX.message('SELECT_TARGET'));
            $select.find('input').val('');
            return;
        }
        var curTarget = $select.find('input').val();
        if (curTarget && targetsIds.indexOf(curTarget) == -1) {
            var $first = $select.find('li').first();
            $select.find('.slct').html($first.html());
            $select.find('input').val($first.attr('data-value'));
        }
    });
    return true;
};
IPv4OrderForm.prototype.loadTargets = function($block) {
    var $blocks = (typeof($block) == 'undefined' ? this.form.find('[data-item]') : [$block]),
        items = this.items,
        targets = this.targets;
    $.each($blocks, function() {
        var $block = $(this),
            country_id = $block.find('[name="country_id[]"]').val(),
            main_target_id = $block.find('[name="main_target_id[]"]').val(),
            mainTarget = [],
            availableTargetsIds = [],
            targetsIds = [],
            $select = $block.find('[data-target-select]');
        if (!main_target_id) {
            $select.find('.slct').html(BX.message('SPECIFY_TARGET'));
            $select.find('input').val('');
            if ($select.find('.drop')[0].children.length <= 1) {
                $select.find('.drop').append('<li data-value="" class="disabled">' + BX.message('SELECT_TARGET_FIRST') + '</span></li>');
            }
            return;
        }
        for (var t in targets) {
            var target = targets[t];
            if (main_target_id == target['ID']) {
                mainTarget = target;
                for (var st in target['ITEMS']) {
                    var subTarget = target['ITEMS'][st];
                    availableTargetsIds.push(subTarget['ID']);
                }
                break;
            }
        }
        for (var i in items) {
            var item = items[i];
            if (availableTargetsIds.indexOf(item['target_id']) != -1 && country_id == item['country_id']) {
                targetsIds.push(item['target_id']);
            }
        }
        $select.find('.drop').html('');
        for (var t in mainTarget['ITEMS']) {
            var target = mainTarget['ITEMS'][t];
            if (targetsIds.indexOf(target['ID']) != -1) {
                $select.find('.drop').append('' +
                    '<li data-value="' + target['ID'] + '"' + (target['USE_CLARIFICATION'] ? ' class="authorization-method-by-main-IP"' : '') + '>' +
                    '<span>' + target['NAME'] + '</span>' +
                    '</li>' +
                    '');
            }
        }
        if (!$select.find('.drop').find('li').length) {
            $select.find('.slct').html(BX.message('SPECIFY_TARGET'));
            $select.find('input').val('');
            $select.find('.drop').append('<li data-value="" class="disabled">' + BX.message('MAIN_TARGET_NO_PROXY') + '</span></li>');
            return;
        }
        var curTarget = $select.find('input').val();
        if (curTarget && targetsIds.indexOf(curTarget) == -1) {
            var $first = $select.find('li').first();
            $select.find('.slct').html($first.html());
            $select.find('input').val($first.attr('data-value'));
        }
    });
    return true;
};
IPv4OrderForm.prototype.targetHint = function($block) {
    var $wrap = $block.find('.target-wrap'),
        $hint = $wrap.find('.target-hint'),
        targetId = $wrap.find('[name="target_id[]"]').val(),
        target = this.getTarget(targetId),
        targetMainId = $block.find('[name="main_target_id[]"]').val(),
        targetMain = this.getTarget(targetMainId, true);
    let placeholder = BX.message('SPECIFY_TARGET');
    if (target["CLARIFICATION_TEXT"]) {
        placeholder = target["CLARIFICATION_TEXT"];
    } else if (targetMain["CLARIFICATION_TEXT"]) {
        placeholder = targetMain["CLARIFICATION_TEXT"];
    }
    $block.find('[name="target_clarification[]"]').attr("placeholder", placeholder);
    $hint.html(target['ORDER_HINT']);
};
IPv4OrderForm.prototype.autoSelect = function($block) {
    var $wrap = $block.find('.target-wrap');
    var targets = this.targets,
        availableTargetsIds = [],
        main_target_id = $block.find('[name="main_target_id[]"]').val();
    for (var t in targets) {
        var target = targets[t];
        if (main_target_id == target['ID']) {
            mainTarget = target;
            for (var st in target['ITEMS']) {
                var subTarget = target['ITEMS'][st];
                availableTargetsIds.push(subTarget['ID']);
            }
            break;
        }
    }
    if (availableTargetsIds.length == 1) {
        $wrap.find('[data-value=' + availableTargetsIds[0] + ']').click();
    }
};
IPv4OrderForm.prototype.calc = function() {
    var self = this,
        paySysId = this.form.find('[name=pay_method]').val(),
        $items = this.form.find('[data-item]'),
        $resPrice = this.form.find('[data-res-price]'),
        $resBtn = this.form.find('[data-res-price]').prev(),
        $orderDetail = this.form.find('[data-order-detail]'),
        products = [];
    productsIds = [];
    for (var i = 0; i < $items.length; i++) {
        var $item = $($items[i]);
        var country_id = $item.find('[name="country_id[]"]').val();
        if (!country_id || typeof(country_id) == 'undefined') {
            continue;
        }
        var target_id = $item.find('[name="target_id[]"]').val();
        if (!target_id || typeof(target_id) == 'undefined') {
            continue;
        }
        var term_id = $item.find('[name="term_id[]"]').val();
        if (!term_id || typeof(term_id) == 'undefined') {
            continue;
        }
        var quantity = parseInt($item.find('[name="quantity[]"]').val());
        if (!quantity || isNaN(quantity)) {
            continue;
        }
        for (var ii in this.items) {
            var item = this.items[ii];
            if (item['country_id'] == country_id && item['target_id'] == target_id) {
                break;
            }
        }
        products.push({
            'id': item['id'],
            'quantity': quantity,
            'country_id': item['country_id'],
            'target_id': item['target_id'],
            'term_id': term_id,
        });
        productsIds.push(item['id'] + '-' + quantity + '-' + term_id);
    }
    productsIds.push(paySysId);
    if (products.length && !this.compareArray(this.productsIds, productsIds)) {
        this.productsIds = productsIds;
        this.wait();
        $.ajax({
            url: this.ajaxUrl,
            type: 'post',
            data: {
                'orderAjax': 'Y',
                'getBasket': 'Y',
                'products': products,
                'paySysId': paySysId,
                proxyType: this.proxyType,
                sessid: BX.bitrix_sessid()
            },
            dataType: 'json',
            error: function() {
                console.log("ajax error");
                $resBtn.text(BX.message('SALE_ORDER_PAY'));
            },
            success: function(response) {
                $orderDetail.html('');
                var sumPrice = 0,
                    printPrice = '',
                    curr = ProxyCurrency.currency;
                let text, input, html;
                for (var i in response['products']) {
                    let item = response['products'][i];
                    let country = self.getCountry(item['country_id']);
                    let target = self.getTarget(item['target_id']);
                    sumPrice = sumPrice + item['price']['SUM']['PRICE'];
                    let price = item.price.PRINT_PRICE,
                        pc = BX.message('PCS');
                    text = `${country.NAME} - ${target.NAME} ${price}/${pc}`;
                    input = `<input type="hidden" name="product_id[]" value="${item.id}">`;
                    html = `<div class="order-detail">${text+input}</div>`;
                    $orderDetail.append(html);
                }
                if (sumPrice) {
                    if (typeof(response['comission']) == 'number') {
                        sumPrice = sumPrice + response['comission'];
                        printPrice = BX.Currency.currencyFormat(sumPrice, curr, true);
                        text = BX.message('SALE_ORDER_SUM_COMISSION') + ' ';
                        html = `<div class="order-detail">${text+printPrice}</div>`;
                        $orderDetail.append(html);
                    } else
                        printPrice = BX.Currency.currencyFormat(sumPrice, curr, true);
                }
                $resPrice.html(printPrice);
                $resBtn.text(BX.message('SALE_ORDER_PAY'));
            }
        });
    }
    return (products.length > 0);
};
IPv4OrderForm.prototype.getCountry = function(id) {
    for (var c in this.countries) {
        var country = this.countries[c];
        if (country['ID'] == id) {
            return country;
        }
    }
    return [];
};
IPv4OrderForm.prototype.getTarget = function(id, mainTarget = null) {
    for (var t in this.targets) {
        var target = this.targets[t];
        if (target["ID"] == id && mainTarget) {
            return target["ITEM"];
        }
        for (var tt in target['ITEMS']) {
            var subTarget = target['ITEMS'][tt];
            if (subTarget['ID'] == id) {
                return subTarget;
            }
        }
    }
    return [];
};
IPv4OrderForm.prototype.checkFields = function() {
    var $form = this.form,
        $items = $form.find('[data-item]:visible'),
        valid = true;
    for (var i = 0; i < $items.length; i++) {
        var $item = $($items[i]);
        var $slc = $item.find('[data-main-target-select] .slct');
        $slc.removeClass('error');
        if (!$item.find('[name="main_target_id[]"]').val()) {
            $slc.addClass('error');
            valid = false;
        }
        var $slc = $item.find('[data-country-select] .slct');
        $slc.removeClass('error');
        if (!$item.find('[name="country_id[]"]').val()) {
            $slc.addClass('error');
            valid = false;
        }
        var $slc = $item.find('[data-target-select] .slct');
        $slc.removeClass('error');
        if (!$item.find('[name="target_id[]"]').val()) {
            $slc.addClass('error');
            $slc.addClass('active');
            $slc.prev().addClass('active');
            $slc.next().show();
            valid = false;
            return false;
        }
        var $clarify = $item.find('[name="target_clarification[]"]');
        $clarify.removeClass('error');
        if ($clarify.is(':visible') && !$clarify.val()) {
            $clarify.addClass('error');
            valid = false;
        }
        var $slc = $item.find('[data-term-select] .slct');
        $slc.removeClass('error');
        if (!$item.find('[name="term_id[]"]').val()) {
            $slc.addClass('error');
            valid = false;
        }
        var $inp = $item.find('[name="quantity[]"]');
        $inp.removeClass('error');
        if (!$inp.val()) {
            $inp.addClass('error');
            valid = false;
        }
    }
    var $slc = $form.find('[data-auth-method-select] .slct');
    $slc.removeClass('error');
    if (!$form.find('[name=auth_method]').val()) {
        $slc.addClass('error');
        $slc.addClass('active');
        $slc.prev().addClass('active');
        $slc.next().show();
        valid = false;
        return false;
    }
    var $slc = $form.find('[data-paymethod-slct] .slct');
    $slc.removeClass('error');
    if (!$form.find('[name=pay_method]').val()) {
        $slc.addClass('error');
        $slc.addClass('active');
        $slc.prev().addClass('active');
        $slc.next().show();
        valid = false;
        return false;
    }
    var $inp = $form.find('[name="email"]');
    $inp.removeClass('error');
    if (!$inp.val()) {
        $inp.addClass('error');
        valid = false;
    }
    var $inp = $form.find('[name="ip"]');
    $inp.removeClass('error');
    if ($inp.is(':visible')) {
        var val = $inp.val();
        if (val) {
            var arIp = val.split(','),
                ipPattern = /^(([0-9]|[0-9][0-9]|1[0-9]{2}|0[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[0-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
            for (var i in arIp) {
                var ip = arIp[i];
                if (!ip || !ipPattern.test(ip)) {
                    $inp.addClass('error');
                    valid = false;
                    break;
                }
            }
        } else {
            $inp.addClass('error');
            valid = false;
        }
    }
    var $check = $form.find('[name="conditions"]').parent();
    $check.removeClass('error-lbl');
    if (!$check.find('input').is(':checked')) {
        $check.addClass('error-lbl');
        valid = false;
    }
    return valid;
};
IPv4OrderForm.prototype.compareArray = function(a1, a2) {
    return a1.length == a2.length && a1.every((v, i) => v === a2[i])
};
IPv4OrderForm.prototype.wait = function() {
    this.form.find('[data-result]').css('opacity', '0.5');
    this.form.find('[data-res-price]').text('');
    this.form.find('[data-res-price]').prev().text(BX.message('SALE_ORDER_WAIT'));
};
IPv4OrderForm.prototype.open = function() {
    this.openPopupBtn.click();
};;;
var IPv6OrderForm = function(baseParams) {
    this.countries = baseParams['countries'];
    this.packages = baseParams['packages'];
    this.terms = baseParams['terms'];
    this.items = [];
    this.productsIds = [];
    this.formSelector = '#ipv6-popup-automatic-payment [data-order-form]';
    this.form = $(this.formSelector);
    this.openPopupBtn = $('[data-mfp-src="#ipv6-popup-automatic-payment"]');
    this.ajaxUrl = baseParams.ajaxUrl;
    this.proxyType = baseParams.proxyType;
    this.countrySearch = this.form[0].querySelector('li.drop-search');
};
IPv6OrderForm.prototype.init = function() {
    this.initHandlers();
    this.items = IPv6OrderItems;
    return;
};
IPv6OrderForm.prototype.initHandlers = function() {
    var self = this,
        formSelector = this.formSelector;
    $(document).ready(function() {
        $(document).on('change', `${formSelector} [name="email"]`, function() {
            var coupon = $(`${formSelector} [data-coupon-inp]`).val();
            if (!coupon) {
                return;
            }
            self.couponApply(coupon);
        });
        $(document).on('click', 'body', function() {
            $(`${formSelector} [data-coupon-error]`).parent().hide();
        });
        $(document).on('change', `${formSelector} [data-coupon-inp]`, function() {
            var coupon = $(this).val();
            self.couponApply(coupon);
        });
        $(document).on('click', `${formSelector} [data-coupon-clear]`, function() {
            self.couponClear();
        });
        $(document).on('click', `${formSelector} [data-paymethod-slct] li`, function() {
            self.calc();
        });
        $(document).on('click', `${formSelector} .popup-automatic-payment__add-another-inner.del a`, function() {
            self.calc();
        });
        $(document).on('click', `${formSelector} .error, ${formSelector} .error-lbl`, function() {
            $(this).removeClass('error');
            $(this).removeClass('error-lbl');
        });
        self.countrySearch.querySelector('input').addEventListener('input', event => self.onInputCountrySearch(event));
        $(document).on('click', `${formSelector} [data-country-select] li:not(.drop-search)`, function() {
            self.calc();
        });
        $(document).on('change', `${formSelector} [name="quantity[]"]`, function() {
            self.calc();
        });
        $(document).on('click', `${formSelector} [data-term-select] li`, function() {
            self.calc();
        });
        new IpInput(`${formSelector} .ip[name=ip]`);
        $(document).on('submit', formSelector, function() {
            if (!self.checkFields()) {
                return false;
            }
            var $form = $(this);
            let gtm_data = GTMDataManager.getData();
            $form.css('opacity', '0.5');
            $.ajax({
                url: self.ajaxUrl,
                type: 'post',
                data: $form.serialize() + `&orderAjax=Y&gtm_data=${gtm_data}`,
                dataType: 'json',
                error: function() {
                    console.log("ajax error");
                    notificate(BX.message('SALE_ORDER_AJAX_ERROR'));
                    $form.css('opacity', '1');
                },
                success: function(response) {
                    if (response['status'] != 'ok') {
                        $form.css('opacity', '1');
                        notificate(response['mess']);
                        return;
                    }
                    if (typeof gtag === 'function') {
                        gtag('event', 'ipv6_zakaz', {
                            'event_category': 'form'
                        });
                        console.log('sending analytics data... ipv6');
                    }
                    setTimeout(() => {
                        if (response['qiwi.custom']) {
                            $form.css('opacity', '1');
                            window.QiwiCustomVar = new QiwiCustom(response);
                            window.QiwiCustomVar.checkPopup();
                            return;
                        }
                        location.href = response['url'];
                    }, 500);
                }
            });
            return false;
        });
    });
};
IPv6OrderForm.prototype.onInputCountrySearch = function(e) {
    let query = e.target.value.toLowerCase().trim(),
        slctr1, slctr2;
    let countryList = this.form[0].querySelector('[data-country-select] ul');
    slctr1 = 'li[data-name]', slctr2 = `${slctr1}[style*="display: none"]`;
    countryList.querySelectorAll(slctr2).forEach(country => {
        country.style.display = '';
    });
    if (query) {
        countryList.querySelectorAll(slctr1).forEach(country => {
            if (!country.dataset.name.toLowerCase().match(query))
                country.style.display = 'none';
        });
    }
};
IPv6OrderForm.prototype.couponApply = function(coupon) {
    var self = this,
        email = this.form.find('[name="email"]').val();
    this.wait();
    $.ajax({
        url: self.ajaxUrl,
        type: 'post',
        data: {
            'orderAjax': 'Y',
            'applyCoupon': 'Y',
            'coupon': coupon,
            'email': email,
            proxyType: self.proxyType,
            sessid: BX.bitrix_sessid()
        },
        dataType: 'json',
        error: function() {
            notificate(BX.message('SALE_ORDER_COUPON_AJAX_ERROR'));
            console.log("ajax error");
        },
        success: function(response) {
            if (response['status'] != 'ok') {
                self.couponError(response['mess']);
                self.form.find('[data-coupon-inp]').val('');
            }
            self.productsIds = [];
            self.calc();
            var $resBtn = self.form.find('[data-res-price]').prev();
            $resBtn.text(BX.message('SALE_ORDER_PAY'));
        }
    });
};
IPv6OrderForm.prototype.couponClear = function() {
    var self = this;
    this.wait();
    $.ajax({
        url: self.ajaxUrl,
        type: 'post',
        data: {
            'orderAjax': 'Y',
            'deleteCoupon': 'Y',
            'coupon': self.form.find('[data-coupon-inp]').val(),
            proxyType: self.proxyType,
            sessid: BX.bitrix_sessid()
        },
        dataType: 'json',
        error: function() {
            notificate(BX.message('SALE_ORDER_COUPON_AJAX_ERROR'));
            console.log("ajax error");
        },
        success: function(response) {
            if (response['status'] != 'ok') {
                self.couponError(response['mess']);
            }
            self.form.find('[data-coupon-inp]').val('');
            self.productsIds = [];
            self.calc();
            var $resBtn = self.form.find('[data-res-price]').prev();
            $resBtn.text(BX.message('SALE_ORDER_PAY'));
        }
    });
};
IPv6OrderForm.prototype.couponError = function(error) {
    $(`${this.formSelector} [data-coupon-error]`).text(error);
    $(`${this.formSelector} [data-coupon-error]`).parent().show();
};
IPv6OrderForm.prototype.reset = function() {
    var $form = this.form;
    let $del = $form.find('.popup-automatic-payment__add-another-inner.del a');
    if ($del.length) {
        $del.click();
    }
    $form.find('.error').removeClass('error');
    $form.find('.error-lbl').removeClass('error-lbl');
    $.each($form.find('[data-term-select]'), function() {
        $(this).find('.slct').text(BX.message('RENT_TERM'));
        $(this).find('input').val('');
    });
    $.each($form.find('[data-country-select]'), function() {
        $(this).find('.slct').text(BX.message('COUNTRY'));
        $(this).find('input[type=hidden]').val('');
    });
    $form.find('[name="quantity[]"]').val('');
    $form.find('[name="target[]"]').val('');
    var $sel = $form.find('[data-auth-method-select]'),
        ipSelVal = $sel.find('.authorization-method-by-main-IP').data('value');
    $form.find('[name="ip"]').val('');
    if ($sel.find('input').val() == ipSelVal) {
        $form.find('[name="ip"]').prev().click();
    }
    $sel.find('input').val('');
    $sel.find('.slct span').text($sel.data('default'));
    var $sel = $form.find('[data-paymethod-slct]');
    $sel.find('input').val('');
    $sel.find('.slct span').text($sel.data('default'));
    $form.find('[name="email"]').val($form.find('[name="email"]').data('value'));
    if ($form.find('[data-coupon-inp]').val()) {
        $form.find('[data-coupon-clear]').click();
    }
    $form.find('[data-result]').html('');
    this.productsIds = [];
    $form.find('[data-res-price]').text('');
    this.calc();
    return this;
};
IPv6OrderForm.prototype.setCountry = function(id) {
    var $form = this.form,
        $select = $form.find('[data-country-select]').first(),
        country = [];
    $select.find('input[type=hidden]').val('');
    $select.find('.slct').text(BX.message('RENT_TERM'));
    if (!id) {
        return this;
    }
    for (var t in this.countries) {
        var tmpCountry = this.countries[t];
        if (id == tmpCountry['ID']) {
            country = tmpCountry;
            break;
        }
    }
    if (!country) {
        return this;
    }
    $select.find('input[type=hidden]').val(country['ID']);
    $select.find('.slct').html('<img src="' + country['PICTURE'] + '" alt="' + country['NAME'] + '"><span>' + country['NAME'] + '</span>');
    this.calc();
    return this;
};
IPv6OrderForm.prototype.setTerm = function(id) {
    var $form = this.form,
        $select = $form.find('[data-term-select]').first(),
        term = [];
    $select.find('input').val('');
    $select.find('.slct').text(BX.message('RENT_TERM'));
    if (!id) {
        return this;
    }
    for (var t in this.terms) {
        var tmpTerm = this.terms[t];
        if (id == tmpTerm['ID']) {
            term = tmpTerm;
            break;
        }
    }
    if (!term) {
        return this;
    }
    $select.find('input').val(term['ID']);
    $select.find('.slct').text(term['NAME']);
    this.calc();
    return this;
};
IPv6OrderForm.prototype.setQuantity = function(quantity) {
    var $form = this.form,
        $inp = $form.find('[name="quantity[]"]').first();
    var $inpClosest = $inp.closest(".quantity-block");
    if ($inpClosest.find("li[data-value='" + quantity + "']").length) {
        $inpClosest.find(".slct span").html(quantity + ' ' + BX.message('PCS'));
    } else {
        $inpClosest.find(".authorization-method-by-main-IP").click();
    }
    $inp.val(parseInt(quantity) + ' ' + BX.message('PCS'));
    this.calc();
    return this;
};
IPv6OrderForm.prototype.calc = function() {
    var self = this,
        paySysId = this.form.find('[name=pay_method]').val(),
        $items = this.form.find('[data-item]'),
        $resPrice = this.form.find('[data-res-price]'),
        $resBtn = this.form.find('[data-res-price]').prev(),
        $orderDetail = this.form.find('[data-order-detail]'),
        products = [];
    productsIds = [];
    for (var i = 0; i < $items.length; i++) {
        var $item = $($items[i]);
        var country_id = $item.find('[name="country_id[]"]').val();
        if (!country_id || typeof(country_id) == 'uindefined') {
            continue;
        }
        var term_id = $item.find('[name="term_id[]"]').val();
        if (!term_id || typeof(term_id) == 'uindefined') {
            continue;
        }
        var quantity = parseInt($item.find('[name="quantity[]"]').val());
        if (!quantity || isNaN(quantity)) {
            continue;
        }
        for (var ii in this.items) {
            var item = this.items[ii];
            if (item['country_id'] == country_id) {
                break;
            }
        }
        products.push({
            'id': item['id'],
            'quantity': quantity,
            'country_id': item['country_id'],
            'term_id': term_id,
        });
        productsIds.push(item['id'] + '-' + quantity + '-' + term_id);
    }
    productsIds.push(paySysId);
    if (products.length && !this.compareArray(this.productsIds, productsIds)) {
        this.productsIds = productsIds;
        this.wait();
        $.ajax({
            url: this.ajaxUrl,
            type: 'post',
            data: {
                'orderAjax': 'Y',
                'getBasket': 'Y',
                'products': products,
                'paySysId': paySysId,
                proxyType: this.proxyType,
                sessid: BX.bitrix_sessid()
            },
            dataType: 'json',
            error: function() {
                console.log("ajax error");
                $resBtn.text(BX.message('SALE_ORDER_PAY'));
            },
            success: function(response) {
                $orderDetail.html('');
                var sumPrice = 0,
                    printPrice = '',
                    curr = ProxyCurrency.currency;
                let text, input, html;
                for (var i in response['products']) {
                    let item = response['products'][i];
                    let country = self.getCountry(item['country_id']);
                    sumPrice = sumPrice + item['price']['SUM']['PRICE'];
                    let price = item.price.PRINT_PRICE,
                        pc = BX.message('PCS');
                    text = `${country.NAME} ${price}/${pc}`;
                    input = `<input type="hidden" name="product_id[]" value="${item.id}">`;
                    html = `<div class="order-detail">${text+input}</div>`;
                    $orderDetail.append(html);
                }
                if (sumPrice) {
                    if (typeof(response['comission']) == 'number') {
                        sumPrice = sumPrice + response['comission'];
                        printPrice = BX.Currency.currencyFormat(sumPrice, curr, true);
                        text = BX.message('SALE_ORDER_SUM_COMISSION') + ' ';
                        html = `<div class="order-detail">${text+printPrice}</div>`;
                        $orderDetail.append(html);
                    } else
                        printPrice = BX.Currency.currencyFormat(sumPrice, curr, true);
                }
                $resPrice.html(printPrice);
                $resBtn.text(BX.message('SALE_ORDER_PAY'));
            }
        });
    }
    return true;
};
IPv6OrderForm.prototype.getCountry = function(id) {
    for (var c in this.countries) {
        var country = this.countries[c];
        if (country['ID'] == id) {
            return country;
        }
    }
    return [];
};
IPv6OrderForm.prototype.calcPackacge = function(price, quantity) {
    for (var p in this.packages) {
        var package = this.packages[p];
        if (package['COUNT'] == quantity) {
            return price - (price / 100 * package['PERCENT']);
        }
    }
    return price;
};
IPv6OrderForm.prototype.checkFields = function() {
    var $form = this.form,
        $items = $form.find('[data-item]:visible'),
        valid = true;
    count = 0;
    for (var i = 0; i < $items.length; i++) {
        var $item = $($items[i]);
        var $slc = $item.find('[data-country-select] .slct');
        $slc.removeClass('error');
        if (!$item.find('[name="country_id[]"]').val()) {
            $slc.addClass('error');
            valid = false;
        }
        var $inp = $item.find('[name="target[]"]');
        $inp.removeClass('error');
        if (!$inp.val()) {
            $inp.addClass('error');
            valid = false;
        }
        var $slc = $item.find('[data-term-select] .slct');
        $slc.removeClass('error');
        if (!$item.find('[name="term_id[]"]').val()) {
            $slc.addClass('error');
            valid = false;
        }
        var $inp = $item.find('[name="quantity[]"]');
        $inp.removeClass('error');
        if (!$inp.val()) {
            $inp.addClass('error');
            valid = false;
        }
        count = count + parseInt($inp.val());
    }
    if (count < 10) {
        $form.find('[name="quantity[]"]').addClass('error');
        valid = false;
    }
    var $slc = $form.find('[data-auth-method-select] .slct');
    $slc.removeClass('error');
    if (!$form.find('[name=auth_method]').val()) {
        console.log($slc.prev());
        $slc.addClass('error');
        $slc.addClass('active');
        $slc.prev().addClass('active');
        $slc.next().show();
        valid = false;
    }
    var $slc = $form.find('[data-paymethod-slct] .slct');
    $slc.removeClass('error');
    if (!$form.find('[name=pay_method]').val()) {
        $slc.addClass('error');
        valid = false;
    }
    var $slc = $form.find('[data-proxy-protocol-select] .slct');
    $slc.removeClass('error');
    if (!$form.find('[name=proxy_protocol]').val()) {
        $slc.addClass('error');
        valid = false;
    }
    var $inp = $form.find('[name="email"]');
    $inp.removeClass('error');
    if (!$inp.val()) {
        $inp.addClass('error');
        valid = false;
    }
    console.log($inp);
    console.log(valid);
    var $inp = $form.find('[name="ip"]');
    $inp.removeClass('error');
    if ($inp.is(':visible')) {
        var val = $inp.val();
        if (val) {
            var arIp = val.split(','),
                ipPattern = /^(([0-9]|[0-9][0-9]|1[0-9]{2}|0[0-9]|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[0-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
            for (var i in arIp) {
                var ip = arIp[i];
                if (!ip || !ipPattern.test(ip)) {
                    $inp.addClass('error');
                    valid = false;
                    break;
                }
            }
        } else {
            $inp.addClass('error');
            valid = false;
        }
    }
    var $check = $form.find('[name="conditions"]').parent();
    $check.removeClass('error-lbl');
    if (!$check.find('input').is(':checked')) {
        $check.addClass('error-lbl');
        valid = false;
    }
    return valid;
};
IPv6OrderForm.prototype.compareArray = function(a1, a2) {
    return a1.length == a2.length && a1.every((v, i) => v === a2[i])
};
IPv6OrderForm.prototype.wait = function() {
    this.form.find('[data-result]').css('opacity', '0.5');
    this.form.find('[data-res-price]').text('');
    this.form.find('[data-res-price]').prev().text(BX.message('SALE_ORDER_WAIT'));
};
IPv6OrderForm.prototype.open = function() {
    this.openPopupBtn.click();
};;;
var ISPOrderForm = function(baseParams) {
    this.countries = baseParams['countries'];
    this.targets = baseParams['targets'];
    this.packages = baseParams['packages'];
    this.terms = baseParams['terms'];
    this.items = [];
    this.productsIds = [];
    this.formSelector = '#isp-popup-automatic-payment [data-order-form]';
    this.form = $(this.formSelector);
    this.openPopupBtn = $('[data-mfp-src="#isp-popup-automatic-payment"]');
    this.ajaxUrl = baseParams.ajaxUrl;
    this.proxyType = baseParams.proxyType;
    this.countrySearch = this.form[0].querySelector('li.drop-search');
};
ISPOrderForm.prototype.init = function(initParams) {
    this.initHandlers();
    this.setMainTarget(initParams['main_target_id']).setTarget(initParams['target_id']).setCountry(initParams['country_id']);
    var $form = this.form;
    this.targetHint($form.find('[data-item]').first());
    this.autoSelect($form.find('[data-item]').first());
    this.items = ISPOrderItems;
    return;
};
ISPOrderForm.prototype.initHandlers = function() {
    var self = this;
    var formSelector = this.formSelector;
    $(document).ready(function() {
        $(document).on('change', `${formSelector} [name="email"]`, function() {
            var coupon = self.form.find('[data-coupon-inp]').val();
            if (!coupon) {
                return;
            }
            self.couponApply(coupon);
        });
        $(document).on('click', 'body', function() {
            self.form.find('[data-coupon-error]').parent().hide();
        });
        $(document).on('change', `${formSelector} [data-coupon-inp]`, function() {
            var coupon = $(this).val();
            self.couponApply(coupon);
        });
        $(document).on('click', `${formSelector} [data-coupon-clear]`, function() {
            self.couponClear();
        });
        $(document).on('click', `${formSelector} [data-paymethod-slct] li`, function() {
            self.calc();
        });
        $(document).on('click', `${formSelector} .popup-automatic-payment__add-another-inner.del a`, function() {
            self.calc();
        });
        $(document).on('click', `${formSelector} .error, ${formSelector} .error-lbl`, function() {
            $(this).removeClass('error');
            $(this).removeClass('error-lbl');
        });
        $(document).on('click', `${formSelector} [data-country-select] li:not(.drop-search)`, function() {
            var $block = $(this).closest('[data-item]');
            self.loadMainTargets($block);
            self.loadTargets($block);
            self.calc();
            self.targetHint($block);
        });
        self.countrySearch.querySelector('input').addEventListener('input', event => self.onInputCountrySearch(event));
        $(document).on('click', `${formSelector} [data-main-target-select] li`, function() {
            self.resetTarget(this);
            var $block = $(this).closest('[data-item]');
            self.loadTargets($block);
            self.calc();
            self.targetHint($block);
            self.autoSelect($block);
        });
        $(document).on('click', `${formSelector} [data-target-select] li`, function() {
            var $block = $(this).closest('[data-item]');
            self.calc($block);
            self.targetHint($block);
        });
        $(document).on('change', `${formSelector} [name="quantity[]"]`, function() {
            self.calc();
        });
        $(document).on('click', `${formSelector} [data-term-select] li`, function() {
            self.calc();
        });
        new IpInput(`${formSelector} .ip[name=ip]`);
        $(document).on('submit', formSelector, function() {
            if (!self.checkFields()) {
                return false;
            }
            var $form = $(this);
            let gtm_data = GTMDataManager.getData();
            $form.css('opacity', '0.5');
            $.ajax({
                url: self.ajaxUrl,
                type: 'post',
                data: $form.serialize() + `&orderAjax=Y&gtm_data=${gtm_data}`,
                dataType: 'json',
                error: function() {
                    console.log("ajax error");
                    notificate(BX.message('SALE_ORDER_AJAX_ERROR'));
                    $form.css('opacity', '1');
                },
                success: function(response) {
                    if (response['status'] != 'ok') {
                        $form.css('opacity', '1');
                        notificate(response['mess']);
                        return;
                    }
                    if (typeof gtag === 'function') {
                        console.log('sending analytics data...');
                        gtag('event', 'isp_zakaz', {
                            'event_category': 'form'
                        });
                    }
                    ym(37232415, 'reachGoal', 'oplata');
                    if (response['qiwi.custom']) {
                        $form.css('opacity', '1');
                        window.QiwiCustomVar = new QiwiCustom(response);
                        window.QiwiCustomVar.checkPopup();
                        return;
                    }
                    location.href = response['url'];
                }
            });
            return false;
        });
    });
};
ISPOrderForm.prototype.selectFirstTarget = function() {
    let $block = this.form.find('[data-item]').first();
    let selector = '[data-main-target-select] ul li';
    let $firstMainTarget = $block.find(selector).first();
    if ($firstMainTarget.length === 0)
        return this;
    let mainTargetId = $firstMainTarget.data('value');
    for (let key in this.targets) {
        if (this.targets[key].ID == mainTargetId) {
            this.setMainTarget(this.targets[key].ITEM.ID);
            this.setTarget(this.targets[key].ITEMS[0].ID);
            break;
        }
    }
    return this;
};
ISPOrderForm.prototype.onInputCountrySearch = function(e) {
    let query = e.target.value.toLowerCase().trim(),
        slctr1, slctr2;
    let countryList = this.form[0].querySelector('[data-country-select] ul');
    slctr1 = 'li[data-name]', slctr2 = `${slctr1}[style*="display: none"]`;
    countryList.querySelectorAll(slctr2).forEach(country => {
        country.style.display = '';
    });
    if (query) {
        countryList.querySelectorAll(slctr1).forEach(country => {
            if (!country.dataset.name.toLowerCase().match(query))
                country.style.display = 'none';
        });
    }
};
ISPOrderForm.prototype.couponApply = function(coupon) {
    var self = this,
        email = self.form.find('[name="email"]').val();
    this.wait();
    $.ajax({
        url: self.ajaxUrl,
        type: 'post',
        data: {
            'orderAjax': 'Y',
            'applyCoupon': 'Y',
            'coupon': coupon,
            'email': email,
            proxyType: self.proxyType,
            sessid: BX.bitrix_sessid()
        },
        dataType: 'json',
        error: function() {
            notificate(BX.message('SALE_ORDER_COUPON_AJAX_ERROR'));
            console.log("ajax error");
        },
        success: function(response) {
            if (response['status'] != 'ok') {
                self.couponError(response['mess']);
                self.form.find('[data-coupon-inp]').val('');
            }
            self.productsIds = [];
            self.calc();
            var $resBtn = self.form.find('[data-res-price]').prev();
            $resBtn.text(BX.message('SALE_ORDER_PAY'));
        }
    });
};
ISPOrderForm.prototype.couponClear = function() {
    var self = this;
    this.wait();
    $.ajax({
        url: self.ajaxUrl,
        type: 'post',
        data: {
            'orderAjax': 'Y',
            'deleteCoupon': 'Y',
            'coupon': self.form.find('[data-coupon-inp]').val(),
            proxyType: self.proxyType,
            sessid: BX.bitrix_sessid()
        },
        dataType: 'json',
        error: function() {
            notificate(BX.message('SALE_ORDER_COUPON_AJAX_ERROR'));
            console.log("ajax error");
        },
        success: function(response) {
            if (response['status'] != 'ok') {
                self.couponError(response['mess']);
            }
            self.form.find('[data-coupon-inp]').val('');
            self.productsIds = [];
            self.calc();
            var $resBtn = self.form.find('[data-res-price]').prev();
            $resBtn.text(BX.message('SALE_ORDER_PAY'));
        }
    });
}
ISPOrderForm.prototype.couponError = function(error) {
    $(`${this.formSelector} [data-coupon-error]`).text(error);
    $(`${this.formSelector} [data-coupon-error]`).parent().show();
};
ISPOrderForm.prototype.reset = function() {
    var $form = this.form,
        $mainTargetSelect = $form.find('[data-main-target-select]');
    $form.find('.error').removeClass('error');
    $form.find('.error-lbl').removeClass('error-lbl');
    $form.find('.target-hint').html('');
    let del = $form.find('.popup-automatic-payment__add-another-inner.del a');
    if (del.length) {
        del.click();
    }
    $.each($form.find('[data-country-select]'), function() {
        $(this).find('.slct').text(BX.message('SELECT_COUNTRY'));
        $(this).find('input[type=hidden]').val('');
    });
    $.each($form.find('[data-main-target-select]'), function() {
        $(this).find('.slct').text(BX.message('SELECT_TARGET'));
        $(this).find('input').val('');
    });
    $.each($form.find('[data-target-select]'), function() {
        $(this).find('.slct').text(BX.message('SPECIFY_TARGET'));
        $(this).find('input').val('');
    });
    $.each($form.find('[data-term-select]'), function() {
        $(this).find('.slct').text(BX.message('SELECT_TERM'));
        $(this).find('input').val('');
    });
    $.each($form.find('.authorization-method-hidden-block'), function() {
        $(this).hide();
        $(this).parent().find(".select").show();
    });
    $form.find('[name="quantity[]"]').val('');
    var $sel = $form.find('[data-auth-method-select]'),
        ipSelVal = $sel.find('.authorization-method-by-main-IP').data('value');
    $form.find('[name="ip"]').val('');
    if ($sel.find('input').val() == ipSelVal) {
        $form.find('[name="ip"]').prev().click();
    }
    $sel.find('input').val('');
    $sel.find('.slct span').text($sel.data('default'));
    var $sel = $form.find('[data-paymethod-slct]');
    $sel.find('input').val('');
    $sel.find('.slct span').text($sel.data('default'));
    $form.find('[name="email"]').val($form.find('[name="email"]').data('value'));
    if ($form.find('[data-coupon-inp]').val()) {
        $form.find('[data-coupon-clear]').click();
    }
    $form.find('[data-result]').html('');
    this.productsIds = [];
    $form.find('[data-res-price]').text('');
    this.calc();
    return this;
};
ISPOrderForm.prototype.resetTarget = function(elm, event = false) {
    let form = this.form[0],
        targetSelect = false;
    let isLi = (elm.tagName === 'LI');
    let selector = isLi ? '[data-main-target-select]' : '.target-wrap';
    let arSelects = form.querySelectorAll(selector);
    for (let select of arSelects) {
        if (select.contains(elm)) {
            targetSelect = isLi ? select.parentNode.nextElementSibling : select;
            break;
        }
    }
    if (event)
        event.stopPropagation();
    $(targetSelect).find('.slct').text(BX.message('SPECIFY_TARGET'));
    targetSelect.querySelectorAll('input').forEach(input => input.value = '');
    targetSelect.querySelector('[data-clarification-item]').style = 'display: none;';
    targetSelect.querySelector('.select').style = 'display: block;';
    if (!this.calc()) {
        form.querySelector('[data-result]').innerHTML = '';
        form.querySelector('[data-res-price]').textContent = '';
    }
};
ISPOrderForm.prototype.setCountry = function(id) {
    var $form = this.form,
        $select = $form.find('[data-country-select]').first(),
        country = [];
    $select.find('input[type=hidden]').val('');
    $select.find('.slct').text(BX.message('SELECT_COUNTRY'));
    if (!id) {
        return this;
    }
    for (var t in this.countries) {
        var tmpCountry = this.countries[t];
        if (id == tmpCountry['ID']) {
            country = tmpCountry;
            break;
        }
    }
    if (!country) {
        return this;
    }
    $select.find('input[type=hidden]').val(country['ID']);
    $select.find('.slct').html('<img src="' + country['PICTURE'] + '" alt="' + country['NAME'] + '"><span>' + country['NAME'] + '</span>');
    this.loadMainTargets($form.find('[data-item]').first());
    this.loadTargets($form.find('[data-item]').first());
    this.calc();
    return this;
};
ISPOrderForm.prototype.setMainTarget = function(id) {
    var $form = this.form,
        $select = $form.find('[data-main-target-select]').first(),
        mainTarget = [];
    $select.find('input').val('');
    $select.find('.slct').text(BX.message('SELECT_TARGET'));
    if (!id) {
        return this;
    }
    for (var t in this.targets) {
        var tmpTarget = this.targets[t];
        if (id == tmpTarget['ITEM']['ID']) {
            mainTarget = tmpTarget;
            break;
        }
    }
    if (!mainTarget) {
        return this;
    }
    $select.find('input').val(mainTarget['ID']);
    $select.find('.slct').text(mainTarget['NAME']);
    this.loadTargets();
    this.calc();
    return this;
};
ISPOrderForm.prototype.setTarget = function(id) {
    var $form = this.form,
        $mainTargetSelect = $form.find('[data-main-target-select]').first(),
        mainTargetId = $mainTargetSelect.find('input').val(),
        mainTarget = [],
        $select = $form.find('[data-target-select]').first(),
        target = [];
    $select.find('input').val('');
    $select.find('.slct').text(BX.message('SPECIFY_TARGET'));
    if (!id || !mainTargetId) {
        return this;
    }
    for (var t in this.targets) {
        var tmpTarget = this.targets[t];
        if (mainTargetId == tmpTarget['ID']) {
            mainTarget = tmpTarget;
            break;
        }
    }
    for (var t in mainTarget['ITEMS']) {
        var tmpTarget = mainTarget['ITEMS'][t];
        if (id == tmpTarget['ID']) {
            target = tmpTarget;
            break;
        }
    }
    if (!target) {
        return this;
    }
    $select.find('input').val(target['ID']);
    $select.find('.slct').text(target['NAME']);
    if (target['USE_CLARIFICATION']) {
        $select.hide();
        $select.closest('.popup-automatic-payment__top-block-select').find('.authorization-method-hidden-block').show();
    }
    this.calc();
    return this;
};
ISPOrderForm.prototype.setTerm = function(id) {
    var $form = this.form,
        $select = $form.find('[data-term-select]').first(),
        term = [];
    $select.find('input').val('');
    $select.find('.slct').text(BX.message('SELECT_TERM'));
    if (!id) {
        return this;
    }
    for (var t in this.terms) {
        var tmpTerm = this.terms[t];
        if (id == tmpTerm['ID']) {
            term = tmpTerm;
            break;
        }
    }
    if (!term) {
        return this;
    }
    $select.find('input').val(term['ID']);
    $select.find('.slct').text(term['NAME']);
    this.calc();
    return this;
};
ISPOrderForm.prototype.setQuantity = function(quantity) {
    var $form = this.form,
        $inp = $form.find('[name="quantity[]"]').first();
    var $inpClosest = $inp.closest(".quantity-block");
    if ($inpClosest.find("li[data-value='" + quantity + "']").length) {
        $inpClosest.find(".slct span").html(quantity + ' ' + BX.message('PCS'));
    } else {
        $inpClosest.find(".authorization-method-by-main-IP").click();
    }
    $inp.val(parseInt(quantity) + ' ' + BX.message('PCS'));
    this.calc();
    return this;
};
ISPOrderForm.prototype.loadMainTargets = function($block) {
    var $blocks = (typeof($block) == 'undefined' ? this.form.find('[data-item]') : [$block]),
        items = this.items,
        targets = this.targets;
    $.each($blocks, function() {
        var $block = $(this),
            country_id = $block.find('[name="country_id[]"]').val(),
            targetsIds = [],
            subTargetsIds = [],
            $select = $block.find('[data-main-target-select]');
        if (!country_id) {
            $select.find('.slct').html(BX.message('SELECT_TARGET'));
            $select.find('input').val('');
            return;
        }
        for (var i in items) {
            var item = items[i];
            if (country_id == item['country_id']) {
                subTargetsIds.push(item['target_id']);
            }
        }
        $select.find('.drop').html('');
        for (var t in targets) {
            var target = targets[t],
                show = false,
                html = '';
            for (var st in target['ITEMS']) {
                var subTarget = target['ITEMS'][st];
                if (subTargetsIds.indexOf(subTarget['ID']) != -1) {
                    show = true;
                    break;
                }
            }
            if (show) {
                html = `<li data-value="${target['ID']}"><span>${target['NAME']}</span></li>`;
                $select.find('.drop').append(html);
                targetsIds.push(target['ID']);
            }
        }
        if (!$select.find('.drop').find('li').length) {
            $select.find('.slct').html(BX.message('SELECT_TARGET'));
            $select.find('input').val('');
            return;
        }
        var curTarget = $select.find('input').val();
        if (curTarget && targetsIds.indexOf(curTarget) == -1) {
            var $first = $select.find('li').first();
            $select.find('.slct').html($first.html());
            $select.find('input').val($first.attr('data-value'));
        }
    });
    return true;
};
ISPOrderForm.prototype.loadTargets = function($block) {
    var $blocks = (typeof($block) == 'undefined' ? this.form.find('[data-item]') : [$block]),
        items = this.items,
        targets = this.targets;
    $.each($blocks, function() {
        var $block = $(this),
            country_id = $block.find('[name="country_id[]"]').val(),
            main_target_id = $block.find('[name="main_target_id[]"]').val(),
            mainTarget = [],
            availableTargetsIds = [],
            targetsIds = [],
            $select = $block.find('[data-target-select]');
        if (!main_target_id) {
            $select.find('.slct').html(BX.message('SPECIFY_TARGET'));
            $select.find('input').val('');
            if ($select.find('.drop')[0].children.length <= 1) {
                $select.find('.drop').append('<li data-value="" class="disabled">' + BX.message('SELECT_TARGET_FIRST') + '</span></li>');
            }
            return;
        }
        for (var t in targets) {
            var target = targets[t];
            if (main_target_id == target['ID']) {
                mainTarget = target;
                for (var st in target['ITEMS']) {
                    var subTarget = target['ITEMS'][st];
                    availableTargetsIds.push(subTarget['ID']);
                }
                break;
            }
        }
        for (var i in items) {
            var item = items[i];
            if (availableTargetsIds.indexOf(item['target_id']) != -1 && country_id == item['country_id']) {
                targetsIds.push(item['target_id']);
            }
        }
        $select.find('.drop').html('');
        for (var t in mainTarget['ITEMS']) {
            var target = mainTarget['ITEMS'][t];
            if (targetsIds.indexOf(target['ID']) != -1) {
                $select.find('.drop').append('' +
                    '<li data-value="' + target['ID'] + '"' + (target['USE_CLARIFICATION'] ? ' class="authorization-method-by-main-IP"' : '') + '>' +
                    '<span>' + target['NAME'] + '</span>' +
                    '</li>' +
                    '');
            }
        }
        if (!$select.find('.drop').find('li').length) {
            $select.find('.slct').html(BX.message('SPECIFY_TARGET'));
            $select.find('input').val('');
            $select.find('.drop').append('<li data-value="" class="disabled">' + BX.message('MAIN_TARGET_NO_PROXY') + '</span></li>');
            return;
        }
        var curTarget = $select.find('input').val();
        if (curTarget && targetsIds.indexOf(curTarget) == -1) {
            var $first = $select.find('li').first();
            $select.find('.slct').html($first.html());
            $select.find('input').val($first.attr('data-value'));
        }
    });
    return true;
};
ISPOrderForm.prototype.targetHint = function($block) {
    var $wrap = $block.find('.target-wrap'),
        $hint = $wrap.find('.target-hint'),
        targetId = $wrap.find('[name="target_id[]"]').val(),
        target = this.getTarget(targetId),
        targetMainId = $block.find('[name="main_target_id[]"]').val(),
        targetMain = this.getTarget(targetMainId, true);
    let placeholder = BX.message('SPECIFY_TARGET');
    if (target["CLARIFICATION_TEXT"]) {
        placeholder = target["CLARIFICATION_TEXT"];
    } else if (targetMain["CLARIFICATION_TEXT"]) {
        placeholder = targetMain["CLARIFICATION_TEXT"];
    }
    $block.find('[name="target_clarification[]"]').attr("placeholder", placeholder);
    $hint.html(target['ORDER_HINT']);
};
ISPOrderForm.prototype.autoSelect = function($block) {
    var $wrap = $block.find('.target-wrap');
    var targets = this.targets,
        availableTargetsIds = [],
        main_target_id = $block.find('[name="main_target_id[]"]').val();
    for (var t in targets) {
        var target = targets[t];
        if (main_target_id == target['ID']) {
            mainTarget = target;
            for (var st in target['ITEMS']) {
                var subTarget = target['ITEMS'][st];
                availableTargetsIds.push(subTarget['ID']);
            }
            break;
        }
    }
    if (availableTargetsIds.length == 1) {
        $wrap.find('[data-value=' + availableTargetsIds[0] + ']').click();
    }
};
ISPOrderForm.prototype.calc = function() {
    var self = this,
        paySysId = this.form.find('[name=pay_method]').val(),
        $items = this.form.find('[data-item]'),
        $resPrice = this.form.find('[data-res-price]'),
        $resBtn = this.form.find('[data-res-price]').prev(),
        $orderDetail = this.form.find('[data-order-detail]'),
        products = [];
    productsIds = [];
    for (var i = 0; i < $items.length; i++) {
        var $item = $($items[i]);
        var country_id = $item.find('[name="country_id[]"]').val();
        if (!country_id || typeof(country_id) == 'undefined') {
            continue;
        }
        var target_id = $item.find('[name="target_id[]"]').val();
        if (!target_id || typeof(target_id) == 'undefined') {
            continue;
        }
        var term_id = $item.find('[name="term_id[]"]').val();
        if (!term_id || typeof(term_id) == 'undefined') {
            continue;
        }
        var quantity = parseInt($item.find('[name="quantity[]"]').val());
        if (!quantity || isNaN(quantity)) {
            continue;
        }
        for (var ii in this.items) {
            var item = this.items[ii];
            if (item['country_id'] == country_id && item['target_id'] == target_id) {
                break;
            }
        }
        products.push({
            'id': item['id'],
            'quantity': quantity,
            'country_id': item['country_id'],
            'target_id': item['target_id'],
            'term_id': term_id,
        });
        productsIds.push(item['id'] + '-' + quantity + '-' + term_id);
    }
    productsIds.push(paySysId);
    if (products.length && !this.compareArray(this.productsIds, productsIds)) {
        this.productsIds = productsIds;
        this.wait();
        $.ajax({
            url: this.ajaxUrl,
            type: 'post',
            data: {
                'orderAjax': 'Y',
                'getBasket': 'Y',
                'products': products,
                'paySysId': paySysId,
                proxyType: this.proxyType,
                sessid: BX.bitrix_sessid()
            },
            dataType: 'json',
            error: function() {
                console.log("ajax error");
                $resBtn.text(BX.message('SALE_ORDER_PAY'));
            },
            success: function(response) {
                $orderDetail.html('');
                var sumPrice = 0,
                    printPrice = '',
                    curr = ProxyCurrency.currency;
                let text, input, html;
                for (var i in response['products']) {
                    let item = response['products'][i];
                    let country = self.getCountry(item['country_id']);
                    let target = self.getTarget(item['target_id']);
                    sumPrice = sumPrice + item['price']['SUM']['PRICE'];
                    let price = item.price.PRINT_PRICE,
                        pc = BX.message('PCS');
                    text = `${country.NAME} - ${target.NAME} ${price}/${pc}`;
                    input = `<input type="hidden" name="product_id[]" value="${item.id}">`;
                    html = `<div class="order-detail">${text+input}</div>`;
                    $orderDetail.append(html);
                }
                if (sumPrice) {
                    if (typeof(response['comission']) == 'number') {
                        sumPrice = sumPrice + response['comission'];
                        printPrice = BX.Currency.currencyFormat(sumPrice, curr, true);
                        text = BX.message('SALE_ORDER_SUM_COMISSION') + ' ';
                        html = `<div class="order-detail">${text+printPrice}</div>`;
                        $orderDetail.append(html);
                    } else
                        printPrice = BX.Currency.currencyFormat(sumPrice, curr, true);
                }
                $resPrice.html(printPrice);
                $resBtn.text(BX.message('SALE_ORDER_PAY'));
            }
        });
    }
    return (products.length > 0);
};
ISPOrderForm.prototype.getCountry = function(id) {
    for (var c in this.countries) {
        var country = this.countries[c];
        if (country['ID'] == id) {
            return country;
        }
    }
    return [];
};
ISPOrderForm.prototype.getTarget = function(id, mainTarget = null) {
    for (var t in this.targets) {
        var target = this.targets[t];
        if (target["ID"] == id && mainTarget) {
            return target["ITEM"];
        }
        for (var tt in target['ITEMS']) {
            var subTarget = target['ITEMS'][tt];
            if (subTarget['ID'] == id) {
                return subTarget;
            }
        }
    }
    return [];
};
ISPOrderForm.prototype.checkFields = function() {
    var $form = this.form,
        $items = $form.find('[data-item]:visible'),
        valid = true;
    for (var i = 0; i < $items.length; i++) {
        var $item = $($items[i]);
        var $slc = $item.find('[data-main-target-select] .slct');
        $slc.removeClass('error');
        if (!$item.find('[name="main_target_id[]"]').val()) {
            $slc.addClass('error');
            valid = false;
        }
        var $slc = $item.find('[data-country-select] .slct');
        $slc.removeClass('error');
        if (!$item.find('[name="country_id[]"]').val()) {
            $slc.addClass('error');
            valid = false;
        }
        var $slc = $item.find('[data-target-select] .slct');
        $slc.removeClass('error');
        if (!$item.find('[name="target_id[]"]').val()) {
            $slc.addClass('error');
            $slc.addClass('active');
            $slc.prev().addClass('active');
            $slc.next().show();
            valid = false;
            return false;
        }
        var $clarify = $item.find('[name="target_clarification[]"]');
        $clarify.removeClass('error');
        if ($clarify.is(':visible') && !$clarify.val()) {
            $clarify.addClass('error');
            valid = false;
        }
        var $slc = $item.find('[data-term-select] .slct');
        $slc.removeClass('error');
        if (!$item.find('[name="term_id[]"]').val()) {
            $slc.addClass('error');
            valid = false;
        }
        var $inp = $item.find('[name="quantity[]"]');
        $inp.removeClass('error');
        if (!$inp.val()) {
            $inp.addClass('error');
            valid = false;
        }
    }
    var $slc = $form.find('[data-auth-method-select] .slct');
    $slc.removeClass('error');
    if (!$form.find('[name=auth_method]').val()) {
        $slc.addClass('error');
        $slc.addClass('active');
        $slc.prev().addClass('active');
        $slc.next().show();
        valid = false;
        return false;
    }
    var $slc = $form.find('[data-paymethod-slct] .slct');
    $slc.removeClass('error');
    if (!$form.find('[name=pay_method]').val()) {
        $slc.addClass('error');
        $slc.addClass('active');
        $slc.prev().addClass('active');
        $slc.next().show();
        valid = false;
        return false;
    }
    var $inp = $form.find('[name="email"]');
    $inp.removeClass('error');
    if (!$inp.val()) {
        $inp.addClass('error');
        valid = false;
    }
    var $inp = $form.find('[name="ip"]');
    $inp.removeClass('error');
    if ($inp.is(':visible')) {
        var val = $inp.val();
        if (val) {
            var arIp = val.split(','),
                ipPattern = /^(([0-9]|[0-9][0-9]|1[0-9]{2}|0[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[0-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
            for (var i in arIp) {
                var ip = arIp[i];
                if (!ip || !ipPattern.test(ip)) {
                    $inp.addClass('error');
                    valid = false;
                    break;
                }
            }
        } else {
            $inp.addClass('error');
            valid = false;
        }
    }
    var $check = $form.find('[name="conditions"]').parent();
    $check.removeClass('error-lbl');
    if (!$check.find('input').is(':checked')) {
        $check.addClass('error-lbl');
        valid = false;
    }
    return valid;
};
ISPOrderForm.prototype.compareArray = function(a1, a2) {
    return a1.length == a2.length && a1.every((v, i) => v === a2[i])
};
ISPOrderForm.prototype.wait = function() {
    this.form.find('[data-result]').css('opacity', '0.5');
    this.form.find('[data-res-price]').text('');
    this.form.find('[data-res-price]').prev().text(BX.message('SALE_ORDER_WAIT'));
};
ISPOrderForm.prototype.open = function() {
    this.openPopupBtn.click();
};;;
var MobileProxyOrderForm = function(params) {
    this.baseProxies = params['base_proxies'];
    this.countries = params['countries'];
    this.operators = params['operators'];
    this.rotations = params['rotations'];
    this.terms = params['terms'];
    this.items = [];
    this.productsIds = [];
    this.formSelector = '#mobile-popup-automatic-payment [data-order-form]';
    this.form = $(this.formSelector);
    this.openPopupBtn = $('[data-mfp-src="#mobile-popup-automatic-payment"]');
    this.ajaxUrl = params.ajaxUrl;
    this.proxyType = params.proxyType;
};
MobileProxyOrderForm.prototype.init = function() {
    this.initHandlers();
    this.items = MobileProxyOrderItems;
    this.countrySearch = this.form[0].querySelector('li.drop-search');
    return;
};
MobileProxyOrderForm.prototype.initHandlers = function() {
    var self = this;
    var formSelector = this.formSelector;
    $(document).ready(function() {
        $(document).on('change', `${formSelector} [name="email"]`, function() {
            var coupon = $(`${formSelector} [data-coupon-inp]`).val();
            if (!coupon) {
                return;
            }
            self.couponApply(coupon);
        });
        $(document).on('click', 'body', function() {
            $(`${formSelector} [data-coupon-error]`).parent().hide();
        });
        $(document).on('change', `${formSelector} [data-coupon-inp]`, function() {
            var coupon = $(this).val();
            self.couponApply(coupon);
        });
        $(document).on('click', `${formSelector} [data-coupon-clear]`, function() {
            self.couponClear();
        });
        $(document).on('click', `${formSelector} [data-paymethod-slct] li`, function() {
            self.calc();
        });
        $(document).on('click', `${formSelector} .popup-automatic-payment__add-another-inner.del a`, function() {
            self.calc();
        });
        $(document).on('click', `${formSelector} .error, ${formSelector} .error-lbl`, function() {
            $(this).removeClass('error');
            $(this).removeClass('error-lbl');
        });
        $(document).on('click', `${formSelector} [data-country-select] li:not(.drop-search)`, function() {
            var $block = $(this).closest('[data-item]');
            self.loadOperators($block);
            self.setOperator(false, $block);
            self.loadRotations($block);
            self.setRotation(false, $block);
            self.calc();
        });
        self.countrySearch.querySelector('input').addEventListener('input', event => self.onInputCountrySearch(event));
        $(document).on('click', `${formSelector} [data-operator-select] li`, function() {
            var $block = $(this).closest('[data-item]');
            self.loadRotations($block);
            self.setRotation(false, $block);
            self.calc();
        });
        $(document).on('click', `${formSelector} [data-rotation-select] li`, function() {
            var $block = $(this).closest('[data-item]');
            self.calc($block);
        });
        $(document).on('change', `${formSelector} [name="quantity[]"]`, function() {
            self.calc();
        });
        $(document).on('click', `${formSelector} [data-term-select] li`, function() {
            self.calc();
        });
        new IpInput(`${formSelector} .ip[name=ip]`);
        $(document).on('submit', formSelector, function() {
            if (!self.checkFields()) {
                return false;
            }
            var $form = $(this);
            let gtm_data = GTMDataManager.getData();
            $form.css('opacity', '0.5');
            $.ajax({
                url: self.ajaxUrl,
                type: 'post',
                data: $form.serialize() + `&orderAjax=Y&gtm_data=${gtm_data}`,
                dataType: 'json',
                error: function() {
                    console.log("ajax error");
                    notificate(BX.message('SALE_ORDER_AJAX_ERROR'));
                    $form.css('opacity', '1');
                },
                success: function(response) {
                    if (response['status'] != 'ok') {
                        $form.css('opacity', '1');
                        notificate(response['mess']);
                        return;
                    }
                    if (typeof gtag === 'function') {
                        console.log('sending analytics data...');
                        gtag('event', 'ipv4_zakaz', {
                            'event_category': 'form'
                        });
                    }
                    ym(37232415, 'reachGoal', 'oplata');
                    if (response['qiwi.custom']) {
                        $form.css('opacity', '1');
                        window.QiwiCustomVar = new QiwiCustom(response);
                        window.QiwiCustomVar.checkPopup();
                        return;
                    }
                    location.href = response['url'];
                }
            });
            return false;
        });
    });
};
MobileProxyOrderForm.prototype.onInputCountrySearch = function(e) {
    let query = e.target.value.toLowerCase().trim(),
        slctr1, slctr2;
    let countryList = this.form[0].querySelector('[data-country-select] ul');
    slctr1 = 'li[data-name]', slctr2 = `${slctr1}[style*="display: none"]`;
    countryList.querySelectorAll(slctr2).forEach(country => {
        country.style.display = '';
    });
    if (query) {
        countryList.querySelectorAll(slctr1).forEach(country => {
            if (!country.dataset.name.toLowerCase().match(query))
                country.style.display = 'none';
        });
    }
};
MobileProxyOrderForm.prototype.couponApply = function(coupon) {
    var self = this,
        email = self.form.find('[name="email"]').val();
    this.wait();
    $.ajax({
        url: self.ajaxUrl,
        type: 'post',
        data: {
            'orderAjax': 'Y',
            'applyCoupon': 'Y',
            'coupon': coupon,
            'email': email,
            proxyType: self.proxyType,
            sessid: BX.bitrix_sessid()
        },
        dataType: 'json',
        error: function() {
            notificate(BX.message('SALE_ORDER_COUPON_AJAX_ERROR'));
            console.log("ajax error");
        },
        success: function(response) {
            if (response['status'] != 'ok') {
                self.couponError(response['mess']);
                self.form.find('[data-coupon-inp]').val('');
            }
            self.productsIds = [];
            self.calc();
            var $resBtn = self.form.find('[data-res-price]').prev();
            $resBtn.text(BX.message('SALE_ORDER_PAY'));
        }
    });
}
MobileProxyOrderForm.prototype.couponClear = function() {
    var self = this;
    this.wait();
    $.ajax({
        url: self.ajaxUrl,
        type: 'post',
        data: {
            'orderAjax': 'Y',
            'deleteCoupon': 'Y',
            'coupon': $(`${this.formSelector} [data-coupon-inp]`).val(),
            proxyType: self.proxyType,
            sessid: BX.bitrix_sessid()
        },
        dataType: 'json',
        error: function() {
            notificate(BX.message('SALE_ORDER_COUPON_AJAX_ERROR'));
            console.log("ajax error");
        },
        success: function(response) {
            if (response['status'] != 'ok') {
                self.couponError(response['mess']);
            }
            $('[data-coupon-inp]').val('');
            self.productsIds = [];
            self.calc();
            var $resBtn = self.form.find('[data-res-price]').prev();
            $resBtn.text(BX.message('SALE_ORDER_PAY'));
        }
    });
}
MobileProxyOrderForm.prototype.couponError = function(error) {
    $(`${this.formSelector} [data-coupon-error]`).text(error);
    $(`${this.formSelector} [data-coupon-error]`).parent().show();
}
MobileProxyOrderForm.prototype.reset = function() {
    var $form = this.form,
        $mainTargetSelect = $form.find('[data-operator-select]'),
        del;
    $form.find('.error').removeClass('error');
    $form.find('.error-lbl').removeClass('error-lbl');
    $form.find('.target-hint').html('');
    del = $(`${this.formSelector} .popup-automatic-payment__add-another-inner.del a`);
    if (del.length) {
        del.click();
    }
    $.each($form.find('[data-country-select]'), function() {
        $(this).find('.slct').text(BX.message('SELECT_COUNTRY'));
        $(this).find('input[type=hidden]').val('');
    });
    $.each($form.find('[data-operator-select]'), function() {
        $(this).find('.slct').text(BX.message('MOBILE_OPERATORS'));
        $(this).find('input').val('');
    });
    $.each($form.find('[data-rotation-select]'), function() {
        $(this).find('.slct').text(BX.message('ROTATION'));
        $(this).find('input').val('');
    });
    $.each($form.find('[data-term-select]'), function() {
        $(this).find('.slct').text(BX.message('SELECT_TERM'));
        $(this).find('input').val('');
    });
    $.each($form.find('.authorization-method-hidden-block'), function() {
        $(this).hide();
        $(this).parent().find(".select").show();
    });
    $form.find('[name="quantity[]"]').val('');
    var $sel = $form.find('[data-auth-method-select]'),
        ipSelVal = $sel.find('.authorization-method-by-main-IP').data('value');
    $form.find('[name="ip"]').val('');
    if ($sel.find('input').val() == ipSelVal) {
        $form.find('[name="ip"]').prev().click();
    }
    $sel.find('input').val('');
    $sel.find('.slct span').text($sel.data('default'));
    var $sel = $form.find('[data-paymethod-slct]');
    $sel.find('input').val('');
    $sel.find('.slct span').text($sel.data('default'));
    $form.find('[name="email"]').val($form.find('[name="email"]').data('value'));
    if ($form.find('[data-coupon-inp]').val()) {
        $form.find('[data-coupon-clear]').click();
    }
    this.productsIds = [];
    $form.find('[data-res-price]').text('');
    this.calc();
    return this;
};
MobileProxyOrderForm.prototype.resetRotation = function(elm, event = false) {
    let form = this.form[0],
        rotationSelect = false;
    let isLi = (elm.tagName === 'LI');
    let selector = isLi ? '[data-operator-select]' : '.target-wrap';
    let arSelects = form.querySelectorAll(selector);
    for (let select of arSelects) {
        if (select.contains(elm)) {
            rotationSelect = isLi ? select.parentNode.nextElementSibling : select;
            break;
        }
    }
    if (event)
        event.stopPropagation();
    $(rotationSelect).find('.slct').text(BX.message('ROTATION'));
    rotationSelect.querySelectorAll('input').forEach(input => input.value = '');
    rotationSelect.querySelector('[data-clarification-item]').style = 'display: none;';
    rotationSelect.querySelector('.select').style = 'display: block;';
    if (!this.calc()) {
        form.querySelector('[data-res-price]').textContent = '';
    }
};
MobileProxyOrderForm.prototype.setCountry = function(id) {
    let $select = this.form.find('[data-country-select]').first();
    let html = BX.message('SELECT_COUNTRY'),
        value = '';
    if (id && this.countries[id]) {
        let name, src, img, span;
        name = this.countries[id].NAME;
        src = this.countries[id].PICTURE;
        img = '<img src="' + src + '" alt="' + name + '">';
        span = '<span>' + name + '</span>';
        html = img + span, value = id;
    }
    $select.find('.slct').html(html);
    $select.find('input[type=hidden]').val(value);
    return this;
};
MobileProxyOrderForm.prototype.setRotation = function(id, $block) {
    if (!$block)
        $block = this.form.find('[data-item]').first();
    let select = $block.find('[data-rotation-select]').first(),
        term = [];
    if (!id)
        id = $(select).find('li[data-value]').data('value');
    if (!id || !this.rotations[id]) {
        select.find('input').val('');
        select.find('.slct').text(BX.message('SELECT_OPERATOR_FIRST'));
        return this;
    }
    select.find('input').val(id);
    select.find('.slct').text(this.rotations[id].NAME);
    this.calc();
    return this;
};
MobileProxyOrderForm.prototype.setTerm = function(id) {
    var $form = this.form,
        $select = $form.find('[data-term-select]').first(),
        term = [];
    $select.find('input').val('');
    $select.find('.slct').text(BX.message('SELECT_TERM'));
    if (!id) {
        return this;
    }
    for (var t in this.terms) {
        var tmpTerm = this.terms[t];
        if (id == tmpTerm['ID']) {
            term = tmpTerm;
            break;
        }
    }
    if (!term) {
        return this;
    }
    $select.find('input').val(term['ID']);
    $select.find('.slct').text(term['NAME']);
    this.calc();
    return this;
}
MobileProxyOrderForm.prototype.setQuantity = function(quantity, $block = false) {
    if (!$block)
        $block = this.form.find('[data-item]');
    let $input = $block.find('[name="quantity[]"]').first();
    let $quantityBlock = $input.closest(".quantity-block");
    if ($quantityBlock.find("li[data-value='" + quantity + "']").length)
        $quantityBlock.find(".slct span").html(quantity + ' ' + BX.message('PCS'));
    else
        $quantityBlock.find(".authorization-method-by-main-IP").click();
    $input.val(parseInt(quantity) + ' ' + BX.message('PCS'));
    return this;
};
MobileProxyOrderForm.prototype.loadOperators = function($block = false) {
    if (!$block)
        $block = this.form.find('[data-item]').first();
    let countryID, operatorIDs = [],
        html = '',
        $select;
    if ((countryID = $block.find('[name="country_id[]"]').val())) {
        for (let key in this.baseProxies) {
            let baseProxy = this.baseProxies[key];
            if (baseProxy.COUNTRY_ID === countryID) {
                if (operatorIDs.indexOf(baseProxy.OPERATOR_ID) < 0)
                    operatorIDs.push(baseProxy.OPERATOR_ID);
            }
        }
    }
    operatorIDs.sort((aID, bID) => {
        let aSort = this.operators[aID]['SORT'];
        let bSort = this.operators[bID]['SORT'];
        if (aSort === bSort)
            return 0;
        return aSort < bSort ? -1 : 1;
    });
    operatorIDs.forEach(ID => {
        let span = '<span>' + this.operators[ID].NAME + '</span>';
        let li = '<li data-value="' + ID + '">' + span + '</li>';
        html += li;
    });
    $select = $block.find('[data-operator-select]');
    $select.find('ul').html(html);
    $select.find(".slct span").html(BX.message('MOBILE_OPERATORS'));
    $select.find('[name="operator_id[]"]').val('');
    return this;
};
MobileProxyOrderForm.prototype.setOperator = function(operatorID = false, block = false) {
    let operator = false;
    if (!block)
        block = this.form.find('[data-item]').first();
    var select = block.find('[data-operator-select]');
    if (!operatorID)
        operatorID = $(select).find('li[data-value]').data('value');
    if (operatorID)
        operator = this.operators[operatorID];
    if (operator) {
        $(select).find('.slct').text(operator.NAME);
        $(select).find('[name="operator_id[]"]').val(operator.ID);
    }
    return this;
};
MobileProxyOrderForm.prototype.loadRotations = function($block = false) {
    if (!$block)
        $block = this.form.find('[data-item]').first();
    let countryID, operatorID, rotationIDs = [],
        html = '';
    countryID = $block.find('[name="country_id[]"]').val();
    operatorID = $block.find('[name="operator_id[]"]').val();
    if (countryID && operatorID) {
        Object.keys(this.baseProxies).forEach(key => {
            let arIDs = key.split('_');
            if (arIDs[0] === countryID && arIDs[1] === operatorID) {
                if (rotationIDs.indexOf(arIDs[2]) < 0)
                    rotationIDs.push(arIDs[2]);
            }
        });
    }
    rotationIDs.sort((aID, bID) => {
        let aSort = this.rotations[aID]['SORT'];
        let bSort = this.rotations[bID]['SORT'];
        if (aSort === bSort)
            return 0;
        return aSort < bSort ? -1 : 1;
    });
    rotationIDs.forEach(ID => {
        let span = '<span>' + this.rotations[ID].NAME + '</span>';
        let li = '<li data-value="' + ID + '">' + span + '</li>';
        html += li;
    });
    var $select = $block.find('[data-rotation-select]');
    $select.find('ul').html(html);
    $select.find(".slct span").html(BX.message('ROTATION'));
    return this;
};
MobileProxyOrderForm.prototype.calc = function() {
    var self = this,
        paySysId = this.form.find('[name=pay_method]').val(),
        $items = this.form.find('[data-item]'),
        $resPrice = this.form.find('[data-res-price]'),
        $resBtn = this.form.find('[data-res-price]').prev(),
        $orderDetail = this.form.find('[data-order-detail]'),
        products = [];
    productsIds = [];
    for (var i = 0; i < $items.length; i++) {
        var $item = $($items[i]);
        var country_id = $item.find('[name="country_id[]"]').val();
        if (!country_id || typeof(country_id) == 'undefined') {
            continue;
        }
        var operator_id = $item.find('[name="operator_id[]"]').val();
        if (!operator_id || typeof(operator_id) == 'undefined') {
            continue;
        }
        var rotation_id = $item.find('[name="rotation_id[]"]').val();
        if (!rotation_id || typeof(rotation_id) == 'undefined') {
            continue;
        }
        var term_id = $item.find('[name="term_id[]"]').val();
        if (!term_id || typeof(term_id) == 'undefined') {
            continue;
        }
        var quantity = parseInt($item.find('[name="quantity[]"]').val());
        if (!quantity || isNaN(quantity)) {
            continue;
        }
        for (var ii in this.items) {
            if (this.items[ii]['country_id'] !== country_id)
                continue;
            if (this.items[ii]['operator_id'] !== operator_id)
                continue;
            if (this.items[ii]['rotation_id'] !== rotation_id)
                continue;
            var item = this.items[ii];
            break;
        }
        let product = false;
        for (let key in products) {
            if (products[key].id === item['id'] && products[key].rotation_id === rotation_id && products[key].term_id === term_id) {
                product = products[key];
            }
        }
        if (!product) {
            product = {
                'id': item['id'],
                'quantity': quantity,
                'country_id': item['country_id'],
                'operator_id': item['operator_id'],
                'rotation_id': rotation_id,
                'term_id': term_id,
                'tag': [item['id'], rotation_id, term_id, quantity].join('_')
            };
            products.push(product);
            productsIds.push(product.tag);
        } else {
            product.quantity += quantity;
            let index = productsIds.indexOf(product.tag),
                tag;
            if (index >= 0) {
                tag = [item['id'], rotation_id, term_id, product.quantity].join('_');
                productsIds[index] = tag;
                product.tag = tag;
            }
        }
    }
    productsIds.push(paySysId);
    if (products.length && !this.compareArray(this.productsIds, productsIds)) {
        this.productsIds = productsIds;
        this.wait();
        $.ajax({
            url: this.ajaxUrl,
            type: 'post',
            data: {
                'orderAjax': 'Y',
                'getBasket': 'Y',
                'products': products,
                'paySysId': paySysId,
                proxyType: this.proxyType,
                sessid: BX.bitrix_sessid()
            },
            dataType: 'json',
            error: function() {
                console.log("ajax error");
                $resBtn.text(BX.message('SALE_ORDER_PAY'));
            },
            success: function(response) {
                $orderDetail.html('');
                var sumPrice = 0,
                    printPrice = '',
                    curr = ProxyCurrency.currency;
                let text, input, html;
                for (var i in response['products']) {
                    let item = response['products'][i];
                    let operator = self.operators[item['operator_id']];
                    let country = self.getCountry(item['country_id']);
                    sumPrice = sumPrice + item['price']['SUM']['PRICE'];
                    let price = item.price.PRINT_PRICE,
                        pc = BX.message('PCS');
                    text = `${country.NAME} - ${operator.NAME} ${price}/${pc}`;
                    input = `<input type="hidden" name="product_id[]" value="${item.id}">`;
                    html = `<div class="order-detail">${text+input}</div>`;
                    $orderDetail.append(html);
                }
                if (sumPrice) {
                    if (typeof(response['comission']) == 'number') {
                        sumPrice = sumPrice + response['comission'];
                        printPrice = BX.Currency.currencyFormat(sumPrice, curr, true);
                        text = BX.message('SALE_ORDER_SUM_COMISSION') + ' ';
                        html = `<div class="order-detail">${text+printPrice}</div>`;
                        $orderDetail.append(html);
                    } else
                        printPrice = BX.Currency.currencyFormat(sumPrice, curr, true);
                }
                $resPrice.html(printPrice);
                $resBtn.text(BX.message('SALE_ORDER_PAY'));
            }
        });
    }
    return (products.length > 0);
};
MobileProxyOrderForm.prototype.getCountry = function(id) {
    for (var c in this.countries) {
        var country = this.countries[c];
        if (country['ID'] == id) {
            return country;
        }
    }
    return [];
};
MobileProxyOrderForm.prototype.getTarget = function(id, mainTarget = null) {
    for (var t in this.targets) {
        var target = this.targets[t];
        if (target["ID"] == id && mainTarget) {
            return target["ITEM"];
        }
        for (var tt in target['ITEMS']) {
            var subTarget = target['ITEMS'][tt];
            if (subTarget['ID'] == id) {
                return subTarget;
            }
        }
    }
    return [];
}
MobileProxyOrderForm.prototype.checkFields = function() {
    var $form = this.form,
        $items = $form.find('[data-item]:visible'),
        valid = true;
    for (var i = 0; i < $items.length; i++) {
        var $item = $($items[i]);
        var $slc = $item.find('[data-operator-select] .slct');
        $slc.removeClass('error');
        if (!$item.find('[name="operator_id[]"]').val()) {
            $slc.addClass('error');
            valid = false;
        }
        var $slc = $item.find('[data-country-select] .slct');
        $slc.removeClass('error');
        if (!$item.find('[name="country_id[]"]').val()) {
            $slc.addClass('error');
            valid = false;
        }
        var $slc = $item.find('[data-rotation-select] .slct');
        $slc.removeClass('error');
        if (!$item.find('[name="rotation_id[]"]').val()) {
            $slc.addClass('error');
            $slc.addClass('active');
            $slc.prev().addClass('active');
            $slc.next().show();
            valid = false;
            return false;
        }
        var $slc = $item.find('[data-term-select] .slct');
        $slc.removeClass('error');
        if (!$item.find('[name="term_id[]"]').val()) {
            $slc.addClass('error');
            valid = false;
        }
        var $inp = $item.find('[name="quantity[]"]');
        $inp.removeClass('error');
        if (!$inp.val()) {
            $inp.addClass('error');
            valid = false;
        }
    }
    var $slc = $form.find('[data-auth-method-select] .slct');
    $slc.removeClass('error');
    if (!$form.find('[name=auth_method]').val()) {
        $slc.addClass('error');
        $slc.addClass('active');
        $slc.prev().addClass('active');
        $slc.next().show();
        valid = false;
        return false;
    }
    var $slc = $form.find('[data-paymethod-slct] .slct');
    $slc.removeClass('error');
    if (!$form.find('[name=pay_method]').val()) {
        $slc.addClass('error');
        $slc.addClass('active');
        $slc.prev().addClass('active');
        $slc.next().show();
        valid = false;
        return false;
    }
    var $inp = $form.find('[name="email"]');
    $inp.removeClass('error');
    if (!$inp.val()) {
        $inp.addClass('error');
        valid = false;
    }
    var $inp = $form.find('[name="ip"]');
    $inp.removeClass('error');
    if ($inp.is(':visible')) {
        var val = $inp.val();
        if (val) {
            var arIp = val.split(','),
                ipPattern = /^(([0-9]|[0-9][0-9]|1[0-9]{2}|0[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[0-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
            for (var i in arIp) {
                var ip = arIp[i];
                if (!ip || !ipPattern.test(ip)) {
                    $inp.addClass('error');
                    valid = false;
                    break;
                }
            }
        } else {
            $inp.addClass('error');
            valid = false;
        }
    }
    var $check = $form.find('[name="conditions"]').parent();
    $check.removeClass('error-lbl');
    if (!$check.find('input').is(':checked')) {
        $check.addClass('error-lbl');
        valid = false;
    }
    return valid;
}
MobileProxyOrderForm.prototype.compareArray = function(a1, a2) {
    return a1.length == a2.length && a1.every((v, i) => v === a2[i]);
};
MobileProxyOrderForm.prototype.wait = function() {
    this.form.find('[data-res-price]').text('');
    this.form.find('[data-res-price]').prev().text(BX.message('SALE_ORDER_WAIT'));
};
MobileProxyOrderForm.prototype.open = function() {
    this.openPopupBtn.click();
};;;;;;;;;;