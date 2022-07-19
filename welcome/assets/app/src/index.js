// @ts-check

import "./style.scss";

import { h, render } from 'preact'

import { useEffect, useRef, useState } from "preact/hooks";

(function ($) {

    let rootEl = document.createElement('div');

    function hideDom() {
        $('body > *').each(function () {
            let skipElms = ['script', 'link', 'style', 'template'];
            if (!$(this).find(rootEl).length && this != rootEl && !skipElms.includes(this.tagName.toLowerCase())) {
                if ($(this).attr('aria-hidden') != 'true') {
                    $(this).attr('data-az-sr-hidden-el', true);
                    $(this).attr('aria-hidden', true);
                }
            }
        });
    }
    function restoreDOM() {
        $('[data-az-sr-hidden-el]').each(function () {
            $(this).removeAttr('aria-hidden').removeAttr('data-az-sr-hidden-el');
        });
    }
    function closePopup(state) {
        if (Object.keys(state).length) {
            sendData(state);
        }
        rootEl.remove();
        restoreDOM();
        az_welcome.show = false;
        var ajaxdata = {
            action: 'az_welcome_popup_trigger',
            nonce_code: az_welcome.nonce
        }
        $.post(az_welcome.ajax_url, ajaxdata);
    }
    function sendData(state) {
        return fetch('https://v1.accessibility.zone/api/collector', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-app-id': '5e8b1e093ddfd972517cf2fe',
                'x-language': document.documentElement.getAttribute('lang').split('-')[0] || 'en'
            },
            body: JSON.stringify(state)
        });
    }
    let Popup = function () {
        /**
         * @type {[any, function]} dir
         */
        let [dir, setDir] = useState(document.dir || 'ltr');
        let [stepNumber, setStep] = useState(0);
        let textareaEl = useRef();
        let textInputEl = useRef();
        let [completed, setCompleted] = useState(false);

        let containerEl = useRef();

        useEffect(() => {

            hideDom();
            let clr = setTimeout(() => {
                containerEl.current.focus();
            }, 100);
            let focusTrap = e => {
                if (!(rootEl).contains(document.activeElement)) {
                    event.preventDefault();
                    containerEl.current.focus();
                }
            }
            $(document).on('focus', '*', focusTrap);

            return () => {
                clearTimeout(clr);
                restoreDOM();
                $(document).off('focus', '*', focusTrap);
            }
        }, []);

        useEffect(() => {
            if (stepNumber === 1) {
                textareaEl.current.focus();
            }
            if (stepNumber === 2) {
                textInputEl.current.focus();
            }
        }, [stepNumber]);

        let [state, setState] = useState({});
        /**
         * 
         * @param {MouseEvent} e 
         */
        let onClose = (e) => {
            e.preventDefault();
            closePopup(completed ? {} : state);
        }

        let submitName = () => {
            if (stepNumber === 0) {
                return az_welcome.t.next
            }
            if (stepNumber === 1) {
                if (state.message) {
                    return az_welcome.t.next
                } else {
                    return az_welcome.t.skip
                }
            } else if (stepNumber === 2) {
                if (state.email) {
                    return az_welcome.t.send
                } else {
                    return az_welcome.t.skip_and_finish
                }
            } else {
                return az_welcome.t.send
            }
        }

        /**
         * 
         * @param {*} e 
         */
        let onPersoneStatus = (e) => {
            setState({
                ...state,
                user_is_dev: !!parseInt(e.target.value)
            })
        }
        let onMessageChange = e => {
            setState({
                ...state,
                message: e.target.value
            });
        }
        let onEmailChange = e => {
            setState({
                ...state,
                email: e.target.value
            });
        }
        let btnDisabled = (e) => {
            if (stepNumber === 0 && state.user_is_dev === undefined) {
                return true
            }
            return false
        }

        let onPrevStep = e => {
            e.preventDefault();
            setStep(stepNumber - 1);
        }

        /**
         * 
         * @param {Event} e 
         */
        let onNextStep = e => {
            e.preventDefault();
            if (stepNumber === 0 && state.user_is_dev !== undefined) {
                setStep(1);
            } else if (stepNumber === 1) {
                setStep(2);
            } else if (stepNumber === 2) {
                setCompleted(true);
                sendData(state).finally(() => {
                    setState({});
                });
                setStep(3);
            }
        }

        let onKeyPress = (e) => {
            if (e.code == 'Escape') {
                closePopup(completed ? {} : state);
            }
        }

        return <div dir={dir}>
            <div className="az-welcome">
                <div className="az-welcome-popup" style={`background-image: url(${az_welcome.url}assets/app/img/bg.png);`} role="dialog" aria-modal={true} onKeyDown={onKeyPress} ref={containerEl} tabIndex={0} aria-label="Accessibility Zone questionnaire">
                    <div className="az-welcome-popup-box">
                        <a onClick={onClose} href="#" className="az-welcome-popup-close-btn"><span className="sr-only">{az_welcome.t.close}</span>
                            <svg style="enable-background:new 0 0 24 24;" version="1.1" viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M5.3,18.7C5.5,18.9,5.7,19,6,19s0.5-0.1,0.7-0.3l5.3-5.3l5.3,5.3c0.2,0.2,0.5,0.3,0.7,0.3s0.5-0.1,0.7-0.3   c0.4-0.4,0.4-1,0-1.4L13.4,12l5.3-5.3c0.4-0.4,0.4-1,0-1.4s-1-0.4-1.4,0L12,10.6L6.7,5.3c-0.4-0.4-1-0.4-1.4,0s-0.4,1,0,1.4   l5.3,5.3l-5.3,5.3C4.9,17.7,4.9,18.3,5.3,18.7z" />
                            </svg>
                        </a>
                        <h1 className="az-welcome-popup-title">
                            <img className="az-welcome-popup-logo" src={`${az_welcome.url}assets/app/img/az-logo.png`} alt="" />
                            <span dangerouslySetInnerHTML={{__html: az_welcome.t.hero }}></span>
                        </h1>
                        <div className="az-welcome-popup-content">
                            {stepNumber === 0 && <h2 className="az-welcome-popup-h2" dangerouslySetInnerHTML={{__html: az_welcome.t.h2 }}></h2>}

                            {
                                stepNumber === 3 && <div className="az-welcome-finish">
                                    <h2>{az_welcome.t.thank_you}</h2>
                                    <p>{az_welcome.t.thank_you_sub}</p>
                                    <p dangerouslySetInnerHTML={{__html: az_welcome.t.contact_us }}></p>
                                    <div className="text-center">
                                        <a target="_blank" className="az-welcome-popup-submit success" href="https://accessibility.zone/contact-us">{az_welcome.t.contact_us_btn}</a>
                                        <br />
                                        <a href="#" class="az-welcome-close-link" onClick={onClose}>{az_welcome.t.close}</a>
                                    </div>
                                </div>
                            }
                            {stepNumber !== 3 && <form action="" onSubmit={onNextStep}>
                                {
                                    stepNumber === 2 && <fieldset>
                                        <legend>{az_welcome.t.callback}</legend>
                                        <p>{az_welcome.t.callback_message}</p>
                                        <label className="az-welcome-popup-label sr-only" for="az-welcome-email">{az_welcome.t.your_email}</label>
                                        <input onChange={onEmailChange} ref={textInputEl} type="email" className="az-welcome-popup-field" id="az-welcome-email" placeholder={az_welcome.t.your_email2} />
                                    </fieldset>
                                }
                                {stepNumber === 1 && <fieldset>
                                    <legend>{az_welcome.t.tellus}</legend>
                                    <label className="az-welcome-popup-label sr-only" for="az-welcome-inaccessible-plugins">{az_welcome.t.about_plugins}</label>
                                    <textarea onInput={onMessageChange} ref={textareaEl} className="az-welcome-popup-field" name="" placeholder={az_welcome.t.textarea_plr} id="az-welcome-inaccessible-plugins" cols="30" rows="5"></textarea>
                                </fieldset>}
                                {stepNumber == 0 && <fieldset>
                                    <legend id="az-welcome-legend-1">
                                    {az_welcome.t.qst}
                                    </legend>
                                    <div role="radiogroup" aria-labelledby="az-welcome-legend-1">
                                        <label for="az-welcome-rbtn-1">
                                            <input type="radio" value="1" onChange={onPersoneStatus} name="az-welcome-rbtns" id="az-welcome-rbtn-1" />
                                            <span>
                                            {az_welcome.t.yes}
                                            </span>
                                        </label>
                                        <label for="az-welcome-rbtn-2">
                                            <input type="radio" value="0" onChange={onPersoneStatus} name="az-welcome-rbtns" id="az-welcome-rbtn-2" />
                                            <span>
                                            {az_welcome.t.no}
                                            </span>
                                        </label>
                                    </div>
                                </fieldset>}
                                <div className="az-welcome-row">
                                    <div>
                                        {stepNumber !== 0 && <button className="az-welcome-popup-submit" onClick={onPrevStep} type="button">{az_welcome.t.to_back}</button>}
                                    </div>
                                    <button disabled={btnDisabled()} className="az-welcome-popup-submit" type="submit" >{submitName()}</button>
                                </div>

                            </form>
                            }
                            {
                                stepNumber === 0 && <div className="az-welcome-popup-skip">
                                    <a href="#skip-close" onClick={onClose}>{az_welcome.t.close_popup}</a>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div >
    }

    render(<Popup />, rootEl);

    $(document).ready(function () {
        // Check is need to show popup
        if(az_welcome.show) {
            $('body').append(rootEl);
        }
    });

})(window['jQuery'] || {});
