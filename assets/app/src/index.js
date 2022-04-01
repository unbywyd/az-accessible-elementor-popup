import "./style.scss";

(function ($) {
    let app = function (instance) {
        this.i = instance;
    }
    app.prototype.show = function () {
        this.$trigger = document.activeElement;
        this.$el = this.i.$element;
        let $widget = this.$el.closest('.dialog-widget');
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
            $closeBtn.find('i').attr('aria-label', az_i18n.close);
            $closeBtn.prependTo($widget.find('.dialog-widget-content'));
            $closeBtn.focus();
            $closeBtn.addClass('az-popup-close-btn');
            this.$firstEl = $closeBtn;
            this.closeHandler = function (e) {
                if (!$closeBtn.length) return
                if (e.keyCode == 27) {
                    e.preventDefault();
                    $closeBtn.click();
                }

                if ((e.keyCode == 13 || e.keyCode == 32) && e.target == $closeBtn[0]) {
                    e.preventDefault();
                    $closeBtn.click();
                }
            }
        } else {
            $widget.attr('tabindex', -1);
            $widget.focus();
            this.$firstEl = $widget;
        }


        this.hideDOM();
        this.focusTrap();
        this.subscribeEvents();
    }
    app.prototype.subscribeEvents = function () {
        if (this.closeHandler) {
            $(document).on('keydown', this.closeHandler);
        }
        if (this.tabHandler) {
            $(document).on('keydown', this.tabHandler);
        }
        if (this.tabHandler2) {
            $(document).on('focus', '*', this.tabHandler2);
        }
    }
    app.prototype.unsubscribeEvents = function () {
        if (this.closeHandler) {
            $(document).off('keydown', this.closeHandler);
        }
        if (this.tabHandler) {
            $(document).off('keydown', this.tabHandler);
        }
        if (this.tabHandler2) {
            $(document).off('focus', '*', this.tabHandler2);
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
        this.tabHandler2 = function (e) {
            if (!$widget[0].contains(document.activeElement)) {
                e.preventDefault();
                firstEl.focus();
            }
        }
        this.tabHandler = function (e) {
            if (e.keyCode == 9) {
                let activeEl = document.activeElement;

                if (!$widget[0].contains(activeEl)) {
                    e.preventDefault();
                    firstEl.focus();
                } else {
                    if (activeEl == firstEl && e.shiftKey) {
                        e.preventDefault();
                        lastEl.focus();
                    } else if (activeEl == lastEl && !e.shiftKey) {
                        e.preventDefault();
                        firstEl.focus();
                    }
                }
            }
        }
    }
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
    app.prototype.restoreDOM = function () {
        $('[data-az-sr-hidden-el]').each(function () {
            $(this).removeAttr('aria-hidden').removeAttr('data-az-sr-hidden-el');
        });
    }
    app.prototype.hide = function () {
        this.restoreDOM();
        this.unsubscribeEvents();
        if (this.$trigger) {
            this.$trigger.focus();
        }
    }
    $(document).on('elementor/popup/show', (e, id, instance) => {
        if (!instance.az_instance) {
            instance.az_instance = new app(instance);
        }
        instance.az_instance.show();
    });
    $(document).on('elementor/popup/hide', (e, id, instance) => {
        if (instance.az_instance) {
            instance.az_instance.hide();
        }
    });

})(jQuery);