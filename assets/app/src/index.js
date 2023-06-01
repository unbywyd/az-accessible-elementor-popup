import "./style.scss";

(function ($) {
    let az_i18n = 'az_i18n' in window ? window['az_i18n'] : {
        close: 'close'
    }
    /**
     * @typedef {string} PopupId
     */

    /**
     * @type {Map<PopupId, Object>}
     */
    let popups = new Map();

    /**
     * @constructor
     * @param {PopupId} id 
     */
    let app = function (id) {
        this.$el = $('#' + 'elementor-popup-modal-' + id);
        this.id = id;
    }

    /**
     * trigger when popup is shown
     */
    app.prototype.show = function () {
        /**
         * @type {Element}
         */
        this.$trigger = document.activeElement;

        let $widget = this.$el;
        $widget.attr('role', 'dialog');
        $widget.attr('aria-modal', true);
        this.$widget = $widget;
        let $headings = this.$el.find('.az-popup-heading, .az-popup-hidden-heading, h1, h2, h3, h4, h5, h6');
        if ($headings.length) {
            let headingElm = $headings[0];
            let id = headingElm.id ? headingElm.id : '_' + Math.random().toString(36).substr(2, 9);
            headingElm.id = id;
            $widget.attr('aria-labelledby', id);
        }
        let $closeBtn = $widget.find('.dialog-close-button');
        if ($closeBtn.length) {
            $closeBtn.attr('tabindex', 0).attr('role', 'button');
            $closeBtn.find('i').attr('aria-label', az_i18n.close).removeAttr('aria-hidden');
            $closeBtn.find('i').attr('aria-hidden', true);
            $closeBtn.prependTo($widget.find('.dialog-widget-content'));
            $closeBtn.focus();
            $closeBtn.addClass('az-popup-close-btn');
            this.$firstEl = $closeBtn;
            /**
             *  
             * @param {KeyboardEvent} event 
             */
            this.onCloseHandler = function (event) {
                if (!$closeBtn.length) return
                if (event.code === 'Escape' || ((event.code === "Enter" || event.code === "Space") && event.target == $closeBtn[0])) {
                    event.preventDefault();
                    $closeBtn.click();
                }
            }
        } else {
            $widget.attr('tabindex', -1);
            $widget.focus();
            this.$firstEl = $widget;
        }
        $('body').css({
            height: '100vh',
            overflow: 'hidden'
        });
        this.hideDOM();
        this.focusTrap();
        this.subscribeEvents();
    }
    /**
     * Subscripe events
     */
    app.prototype.subscribeEvents = function () {
        if ('function' === typeof this.onCloseHandler) {
            $(document).on('keydown', this.onCloseHandler);
        }
        if ('function' === typeof this.onKeyboardTabTrapEvent) {
            $(document).on('keydown', this.onKeyboardTabTrapEvent);
        }
        if ('function' === typeof this.onFocusEvent) {
            $(document).on('focus', '*', this.onFocusEvent);
        }
    }
    /**
     * Unsubscribe events
     */
    app.prototype.unsubscribeEvents = function () {
        if ('function' === typeof this.onCloseHandler) {
            $(document).off('keydown', this.onCloseHandler);
        }
        if ('function' === typeof this.onKeyboardTabTrapEvent) {
            $(document).off('keydown', this.onKeyboardTabTrapEvent);
        }
        if ('function' === typeof this.onFocusEvent) {
            $(document).off('focus', '*', this.onFocusEvent);
        }
    }

    app.prototype.focusTrap = function () {
        if (!this.$widget.length) return
        let $clickabledEls = this.$widget.find('input:not([disabled]), area[href], select:not([disabled]), button:not([disabled]), a[href], textarea:not([disabled]), [tabindex], iframe, [contenteditable="true"]');
        if ($clickabledEls.length) {
            this.$lastEl = $($clickabledEls[$clickabledEls.length - 1]);
        } else {
            this.$lastEl = this.$firstEl;
        }

        let firstEl = this.$firstEl[0], lastEl = this.$lastEl[0];
        let $widget = this.$widget;

        /**
         * If the active focus is outside the popup then return focus to first element
         * @param {FocusEvent} event
         */
        this.onFocusEvent = function (event) {
            if (!$widget[0].contains(document.activeElement)) {
                event.preventDefault();
                firstEl.focus();
            }
        }
        /**
         * 
         * @param {KeyboardEvent}  event
         */
        this.onKeyboardTabTrapEvent = function (event) {
            if (event.code === "Tab") {
                let activeEl = document.activeElement;
                if (!$widget[0].contains(activeEl)) {
                    event.preventDefault();
                    firstEl.focus();
                } else {
                    if (activeEl == firstEl && event.shiftKey) {
                        event.preventDefault();
                        lastEl.focus();
                    } else if (activeEl == lastEl && !event.shiftKey) {
                        event.preventDefault();
                        firstEl.focus();
                    }
                }
            }
        }
    }
    /**
     * Hide DOM method when popup is shown
     */
    app.prototype.hideDOM = function () {
        let self = this;
        $('body > *').each(function () {
            let skipElms = ['script', 'link', 'style', 'template'];
            if (!$(this).find(self.$widget[0]).length && this != self.$widget[0] && !skipElms.includes(this.tagName.toLowerCase())) {
                if ($(this).attr('aria-hidden') != 'true') {
                    $(this).attr('data-az-sr-hidden-el', true);
                    $(this).attr('aria-hidden', true);
                }
            }
        });
    }
    /**
     * Restore DOM when the popup is closed
     */
    app.prototype.restoreDOM = function () {
        $('[data-az-sr-hidden-el]').each(function () {
            $(this).removeAttr('aria-hidden').removeAttr('data-az-sr-hidden-el');
        });
    }

    app.prototype.hide = function () {
        this.restoreDOM();
        this.unsubscribeEvents();
        if (this.$trigger instanceof HTMLElement) {
            this.$trigger.focus();
        }
        $('body').css({
            height: '',
            overflow: ''
        });
    }

    /**
     * @param {*} event
     * @param {PopupId} id
     */

    let debounce = function (func, wait) {
        let timeoutId;

        return function () {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, arguments);
            }, wait);
        };
    };

    const onDebounceShowPopup = debounce(onShowPopup, 100);
    const onDebounceHidePopup = debounce(onHidePopup, 100);


    function onShowPopup(event, id) {
        if (!popups.has(id)) {
            popups.set(id, new app(id));
        }
        popups.get(id).show();
    }
    $(document).on('elementor/popup/show', onDebounceShowPopup);


    /**
     * @param {*} event - Event
     * @param {PopupId} id - Popup ID
     */
    function onHidePopup(event, id) {
        if (popups.has(id)) {
            popups.get(id).hide();
        }
    }
    $(document).on('elementor/popup/hide', onDebounceHidePopup);


    $(window).on('elementor/frontend/init', () => {
        if (window.elementorFrontend) {
            window.elementorFrontend.elements.$window.on('elementor/popup/show', (event) => {
                if (event?.originalEvent?.detail?.id) {
                    let id = event.originalEvent.detail.id;
                    onDebounceShowPopup(null, id);
                }
            });

            window.elementorFrontend.elements.$window.on('elementor/popup/hide', (event) => {
                if (event?.originalEvent?.detail?.id) {
                    let id = event.originalEvent.detail.id;
                    onDebounceHidePopup(null, id);
                }
            });
        }
    });

})(window['jQuery'] || {});



