    (function(){
        /**
         * Methods related to INPUT's behavior
         */

        var methods = {

            bindElementEvents: function () {
                var that = this;

                that.el.on('keydown' + eventNS, $.proxy(that.onElementKeyDown, that));
                that.el.on('keyup' + eventNS, $.proxy(that.onElementKeyUp, that));
                that.el.on('blur' + eventNS, $.proxy(that.onElementBlur, that));
                that.el.on('focus' + eventNS, $.proxy(that.onElementFocus, that));
                that.el.on('change' + eventNS, $.proxy(that.onElementKeyUp, that));
            },

            unbindElementEvents: function () {
                this.el.off(eventNS);
            },

            onElementBlur: function () {
                var that = this;
                // suggestion was clicked, blur should be ignored
                // see container mousedown handler
                if (that.cancelBlur) {
                    delete that.cancelBlur;
                    return;
                }
                that.selectCurrentValue({noSpace: true});
            },

            onElementFocus: function () {
                var that = this;
                if (!that.cancelFocus) {
                    that.fixPosition();
                    if (that.options.minChars <= that.el.val().length) {
                        that.onValueChange();
                    }
                }
                that.cancelFocus = false;
            },

            onElementKeyDown: function (e) {
                var that = this,
                    index;

                that._lastPressedKeyCode = e.which;

                // If suggestions are hidden and user presses arrow down, display suggestions:
                if (!that.disabled && !that.visible && e.which === keys.DOWN && that.currentValue) {
                    that.suggest();
                    return;
                }

                if (that.disabled || !that.visible) {
                    return;
                }

                switch (e.which) {
                    case keys.ESC:
                        that.el.val(that.currentValue);
                        that.hide();
                        break;

                    case keys.RIGHT:
                        return;

                    case keys.TAB:
                        if (that.selectedIndex === -1) {
                            that.hide();
                            return;
                        }
                        that.select(that.selectedIndex, {noSpace: true});
                        if (that.options.tabDisabled === false) {
                            return;
                        }
                        break;

                    case keys.RETURN:
                        that.selectCurrentValue();
                        break;

                    case keys.SPACE:
                        if (that.options.triggerSelectOnSpace && that.isCursorAtEnd()) {
                            index = that.selectCurrentValue({noHide: true, noSpace: true});
                            that._waitingForTriggerSelectOnSpace = index !== -1;
                        }
                        return;
                    case keys.UP:
                        that.moveUp();
                        break;
                    case keys.DOWN:
                        that.moveDown();
                        break;
                    default:
                        return;
                }

                // Cancel event if function did not return:
                e.stopImmediatePropagation();
                e.preventDefault();
            },

            onElementKeyUp: function (e) {
                var that = this;

                if (that.disabled) {
                    return;
                }

                switch (e.which) {
                    case keys.UP:
                    case keys.DOWN:
                        return;
                }

                clearTimeout(that.onChangeTimeout);

                if (that.currentValue !== that.el.val()) {
                    if (that.options.deferRequestBy > 0) {
                        // Defer lookup in case when value changes very quickly:
                        that.onChangeTimeout = utils.delay(function () {
                            that.onValueChange();
                        }, that.options.deferRequestBy);
                    } else {
                        that.onValueChange();
                    }
                }
            },

            onValueChange: function () {
                var that = this,
                    options = that.options,
                    value = that.el.val(),
                    query = that.getQuery(value);

                if (that.selection) {
                    (options.onInvalidateSelection || $.noop).call(that.element, that.selection);
                    that.selection = null;
                }

                clearTimeout(that.onChangeTimeout);
                that.currentValue = value;
                that.selectedIndex = -1;

                if (query.length < options.minChars) {
                    that.hide();
                } else {
                    that.getSuggestions(query);
                }
            },

            isCursorAtEnd: function () {
                var that = this,
                    valLength = that.el.val().length,
                    selectionStart = that.element.selectionStart,
                    range;

                if (typeof selectionStart === 'number') {
                    return selectionStart === valLength;
                }
                if (document.selection) {
                    range = document.selection.createRange();
                    range.moveStart('character', -valLength);
                    return valLength === range.text.length;
                }
                return true;
            }

        };

        $.extend(Suggestions.prototype, methods);

        initializeHooks.push(methods.bindElementEvents);

        disposeHooks.push(methods.unbindElementEvents);

    }());