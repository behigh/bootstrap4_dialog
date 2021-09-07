'use strict'
import Modal from 'bootstrap/js/src/modal'

const Dialog = (($) => {

    /**
     * ------------------------------------------------------------------------
     * Constants
     * ------------------------------------------------------------------------
     */

    const NAME = 'dialog'
    const VERSION = '1.0.0-beta'
    const DATA_KEY = 'bh.dialog'
    const EVENT_KEY = `.${DATA_KEY}`
    const MODAL_DATA_KEY = 'bs.modal'
    const DATA_API_KEY = '.data-api'
    const JQUERY_NO_CONFLICT = $.fn[NAME]
    const CLASS_PREFIX = 'modal'
    const MODAL_EVENT_KEY = '.bs.modal'
    const ESCAPE_KEYCODE = 27 // KeyboardEvent.which value for Escape (Esc) key


    const CLASSES = {
        MODAL: CLASS_PREFIX,
        DIALOG: `${CLASS_PREFIX}-dialog`,
        CONTENT: `${CLASS_PREFIX}-content`,
        BODY: `${CLASS_PREFIX}-body`,
        HEADER: `${CLASS_PREFIX}-header`,
        TITLE: `${CLASS_PREFIX}-title`,
        FOOTER: `${CLASS_PREFIX}-footer`,
        OPEN: `${CLASS_PREFIX}-open`,
        CLOSE: 'close',
        ANIMATE: 'fade',
        INPUT: 'form-control',
        FIX_B: 'fixed-bottom',
    }

    const $CONTAINER = $(document.body)
    const $window = $(window)

    const Defaults = {
        backdrop: 'static',
        close: true,
        show: true,
        animate: true,
        classes: null,
        btnClasses: 'btn',
        btnExtraClasses: 'btn-secondary',
    }

    const templates = {
        dialog: `<div class="${CLASSES.MODAL}" tabindex="-1" role="dialog" aria-hidden="true">
  					<div class="${CLASSES.DIALOG}">
    					<div class="${CLASSES.CONTENT}">
							<div class="${CLASSES.BODY}"></div>
    					</div>
    				</div>
    			</div>
    			`,
        close: `<button type="button" class="${CLASSES.CLOSE}" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>`,
        header: `<div class="${CLASSES.HEADER}">
					<h5 class="${CLASSES.TITLE}"></h5>
				</div>
				`,
        footer: `<div class="${CLASSES.FOOTER}"/>`,
    }

    const isDomElement = element => (typeof element === 'object' && element !== null && element.nodeType === 1)

    let i18n = (phrase, def) => def

    class Dialog {
        constructor(options) {
            this._options = Dialog.sanitize(options)
            this._elements = {
                $modal: $(templates.dialog).appendTo($CONTAINER).data(DATA_KEY, this),
                $dialog: null,
                $content: null,
                $body: null,
                $header: null,
                $footer: null,
                $close: null,
            }

            this._elements.$dialog = this._elements.$modal.find(`.${CLASSES.DIALOG}`)
            this._elements.$content = this._elements.$modal.find(`.${CLASSES.CONTENT}`)
            this._elements.$body = this._elements.$content.find(`.${CLASSES.BODY}`)

            let $modal = this._elements.$modal

            let classes = this._options.classes || ''
            let dialogClasses = this._options.dialogClasses || ''

            if (this._options.size) {
                switch (this._options.size) {
                    case 'xl':
                    case 'lg':
                    case 'md':
                    case 'sm':
                        dialogClasses += `${CLASS_PREFIX}-${this._options.size}`
                        break
                }
            }

            (this._options.animate && $modal.addClass(CLASSES.ANIMATE));
            (classes && $modal.addClass(classes));
            (dialogClasses && this._elements.$dialog.addClass(dialogClasses))

            this.title()
            this.message()
            this.closeButton()
            this.buttons()

            this.modal = new Modal(this._elements.$modal[0], {
                backdrop: this._options.backdrop ? 'static' : false,
                keyboard: false,
                show: false,
            })

            this._bindEvents()

            if (this._options.show) {
                this.show()
            }
        }

        on(events, callback) {
            this._elements.$modal.on(events, callback)
        }

        off(events, callback) {
            this._elements.$modal.off(events, callback)
        }

        /**
         * Set dialog title
         * @returns {Dialog}
         */
        title() {
            if (arguments.length) {
                this._options.title = arguments[0]
            }

            let elements = this._elements

            if (this._options.title) {
                if (!elements.$header) {
                    elements.$header = $(templates.header).prependTo(elements.$content)
                }
                elements.$header.find(`.${CLASSES.TITLE}`).empty().append(this._options.title)
            } else if (elements.$header) {
                elements.$header.remove()
                elements.$header = null
            }
            return this
        }

        /**
         * Set close button
         * @returns {Dialog}
         */
        closeButton() {
            if (arguments.length) {
                this._options.close = arguments[0]
            }

            (this._elements.$close && this._elements.$close.remove())

            if (this._options.close) {
                if (!this._elements.$close) {
                    this._elements.$close = $(templates.close)
                }

                let $header = this._elements.$header
                let $close = this._elements.$close;

                ($header && $header.append($close) || $close.prependTo(this._elements.$body))
            } else {
                this._elements.$close = null
            }
            return this
        }

        /**
         * Set message
         * @returns {Dialog}
         */
        message() {
            if (arguments.length) {
                this._options.message = arguments[0]
            }
            this._elements.$body.empty().append(this._options.message)
            return this
        }

        buttons() {
            let buttons = this._options.buttons
            if (arguments.length) {
                buttons = arguments[0]
            }

            if (!buttons || (Array.isArray(buttons) && !buttons.length) || ($.isEmptyObject(buttons))) {
                buttons = null
            }

            let elements = this._elements

            if (!buttons) {
                this._options.buttons = null
                if (elements.$footer) {
                    elements.$footer.remove()
                    elements.$footer = null
                }
                return
            }

            if (!elements.$footer) {
                elements.$footer = $(templates.footer)
                elements.$body.after(elements.$footer)
            } else {
                elements.$footer.empty()
            }

            if (!Array.isArray(buttons)) {
                buttons = [buttons]
            }

            buttons.map(button => {
                button = this._createButton(button);
                (button && elements.$footer.append(button))
            })
        }

        _createButton(button) {
            if (typeof button === 'string') {
                button = {
                    text: button,
                }
            }

            if (!button || typeof button !== 'object') {
                return null
            }

            if (button instanceof $ || isDomElement(button)) {
                return button
            }

            let $button = button.button ? $(button.button) : $(`<button type="button" class="${Defaults.btnClasses}"/>`).html(button.text);
            (button.classes && $button.addClass(button.classes)) || $button.addClass(Defaults.btnExtraClasses)
            button.prop && $button.prop(button.prop)
            button.attr && $button.attr(button.attr)

            const action = button.action || 'destroy'

            $button.click(e => {
                e.relatedTarget = this

                if ($.isFunction(action)) {
                    action.apply($button, [e])
                }

                if (e.isDefaultPrevented()) {
                    return
                }

                switch (action) {
                    case 'submit':
                    case 'reset':
                        this._elements.$body.find('form').trigger(action)
                        break
                    case 'hide':
                    case 'cancel':
                    case 'destroy':
                    case 'remove':
                    case 'close':
                    default:
                        this.hide()
                        break
                }
            })

            return $button
        }

        _upFooterPosition() {
            if (!this._elements.$footer) {
                return
            }
            let offset = this._elements.$dialog.height() + (this._elements.$dialog.offset().top - $window.scrollTop()) - this._elements.$modal.height()
            let footerHeight = this._elements.$footer.height()

            if (offset > 0) {
                if (this._elements.$footer[0].getAttribute('class').indexOf(CLASSES.FIX_B) === -1) {
                    if (!this._footer_spacer) {
                        this._footer_spacer = $('<div/>').height(footerHeight).insertAfter(this._elements.$footer)
                    }
                    this._elements.$footer.addClass(CLASSES.FIX_B)
                    offset = this._elements.$dialog.height() + (this._elements.$dialog.offset().top - $window.scrollTop()) - this._elements.$modal.height()
                }
                this._elements.$footer.css('bottom', offset)
            } else {
                (this._footer_spacer && this._footer_spacer.remove())
                this._elements.$footer.removeClass(CLASSES.FIX_B).css('bottom', '')
                this._footer_spacer = null
            }
        }

        stickFooter() {
            if (this._options.stickFooter && this._elements.$footer) {
                let diff = this._elements.$modal.height() - this._elements.$dialog.height()

                if (diff > 0) {
                    this.unstickFooter()
                    return
                }

                if (!this._is_footer_sticked) {
                    this._is_footer_sticked = true
                    this._elements.$modal.on(`scroll${MODAL_EVENT_KEY}`, this._upFooterPosition.bind(this))
                }
                this._upFooterPosition()
            }
        }

        unstickFooter() {
            this._elements.$modal.off(`scroll${MODAL_EVENT_KEY}`)
            this._is_footer_sticked = false;
            (this._elements.$footer && this._elements.$footer.removeClass(CLASSES.FIX_B))
        }

        /**
         * Show dialog
         * @returns {Dialog}
         */
        show() {
            this.modal.show()
            return this
        }

        /**
         * Hide dialog
         */
        hide(e) {
            this.modal && this.modal.hide(e)
        }

        destroy() {
            if (this.modal && this.modal._isShown) {
                this._elements.$modal.off(MODAL_EVENT_KEY)
                this.modal.hide()
            }
            this._elements.$modal.remove()
            this.modal = null
            this._elements = null

            const modals = $(`.${CLASSES.MODAL}:visible`)

            if (modals.length) {
                $(document.body).addClass(CLASSES.OPEN)
            } else {
                $window.off(MODAL_EVENT_KEY)
            }
        }

        /**
         * @private
         */
        _bindEvents() {
            this._elements.$modal.on(`keydown${MODAL_EVENT_KEY}`, (e) => {
                if (e.which === ESCAPE_KEYCODE) {
                    this._elements.$modal.trigger(`escape${EVENT_KEY}`)
                }
            })
            this._elements.$modal.on(`hidden${MODAL_EVENT_KEY}`, (e) => {
                if (e.target === this._elements.$modal[0]) {
                    this.destroy()
                }
            })

            this._elements.$modal.on(`escape${EVENT_KEY}`, (e) => {
                this.hide(e)
            })


            this._elements.$modal.on(`shown${MODAL_EVENT_KEY}`, (e) => {
                let zIndex = 0
                $(`.${CLASSES.MODAL}`).each((index, item) => {
                    if (item === this._elements.$modal[0]) {
                        return
                    }
                    zIndex = Math.max(zIndex, parseInt($(item).css('zIndex')))
                })

                if (zIndex) {
                    this._elements.$modal.css('zIndex', zIndex + 2);
                    (this.modal._backdrop && $(this.modal._backdrop).css('zIndex', zIndex + 1))
                }
                this.stickFooter()

            })
        }

        /**
         * Make a options object
         * @param {*} options
         * @public
         */
        static sanitize(options) {
            if (typeof options === 'string' || (typeof options === 'object' && (options instanceof $ || options.nodeType))) {
                options = {
                    message: options,
                }
            }

            return $.extend({}, Defaults, options || {})
        }

        /**
         * Set i18n function
         * @param {Function} func
         */
        static setI18n(func) {
            i18n = func
        }
    }

    function _public(options) {
        return new Dialog(options)
    }

    _public.alert = function (message) {
        let options = Dialog.sanitize(message)

        options.buttons = [
            i18n('ok', 'Ok'),
        ]

        return new Dialog(options)
    }

    _public.confirm = function (message, callback) {
        let options = Dialog.sanitize(message)

        if (!$.isFunction(callback)) {
            callback = () => null
        }

        let buttonClicked = false

        let buttons = options.buttons
        delete options.buttons

        options.buttons = [
            {
                text: i18n('ok', 'Ok'),
                classes: 'btn-primary',
                action: () => {
                    buttonClicked = true
                },
            }, {
                text: i18n('cancel', 'Cancel'),
                classes: 'btn-secondary',
                action: () => {
                    buttonClicked = false
                },
            },
        ]

        if (buttons && typeof buttons === 'object') {
            ['ok', 'cancel'].forEach((item, index) => {
                if (buttons[item]) {
                    let btn = typeof buttons[item] === 'object' ? buttons[item] : {text: buttons[item]}
                    $.extend(options.buttons[index], btn)
                }
            })
        }

        const dialog = new Dialog(options)
        dialog._elements.$modal.on(`hide${MODAL_EVENT_KEY}`, (e) => {
            callback(buttonClicked)
        })
        return dialog
    }

    /**
     *
     * @param {Object|String} message
     * @param {String} def
     * @param {Function} callback
     */
    _public.prompt = function (message, def, callback) {
        let options = Dialog.sanitize(message)
        if ($.isFunction(def)) {
            callback = def
            def = null
        }

        const inputOptions = (message.input && typeof message.input === 'object') ? message.input : {}

        let $input = (inputOptions instanceof $ || isDomElement(inputOptions)) ? $(inputOptions) : $('<input/>').attr({
            type: inputOptions.type || 'text',
            class: CLASSES.INPUT,
            value: def || inputOptions.value || '',
        })
        options.message = $('<div/>').append(options.message)

        options.message.append($input)

        let buttonClicked = false


        options.buttons = [
            {
                text: i18n('ok', 'Ok'),
                classes: 'btn-primary',
                action: () => {
                    buttonClicked = true
                },
            }, {
                text: i18n('cancel', 'Cancel'),
                classes: 'btn-secondary',
            },
        ]

        const dialog = new Dialog(options)
        dialog._elements.$modal.on(`hide${MODAL_EVENT_KEY}`, (e) => {
            callback(buttonClicked ? $input.val() : null)
        })
        return dialog
    }

    _public.closeAll = e => {
        (e && e.preventDefault && e.preventDefault())

        $(`.${CLASSES.MODAL}:visible`).each((index, item) => {
            const api = $.data(item, DATA_KEY);
            (api && api.hide())
        })
    }


    // Map to jquery
    $[NAME] = _public


    return _public
})(jQuery)

export default Dialog
