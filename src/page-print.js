/**
 * Copyright (C) 2011 by Serban Stancu
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE. 
 */

if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        'use strict';
        // optionally move this outside the declaration and 
        // into a closure if you need more speed.
        function F() {}
        F.prototype = o;
        return new F();
    };
}

(function ($) {
    'use strict';

    /**
     * Main Class
     */
    var PagePrint = {

        /**
         * The selector reference. 
         * @var JQueryRef
         */
        $elem: null,

        /**
         * The document body reference. 
         * @var JQueryRef
         */
        $body: null,

        /**
         * The modal window reference.
         * @var JQueryRef 
         */
        $modal: null,

        /**
         * The preview controls container.
         * @var JQueryRef 
         */
        $controls: null,

        /**
         * The modal mask reference.
         * @var JQueryRef 
         */
        $mask: null,

        /**
         * The frame reference.
         * @var JQueryRef 
         */
        $frame: null,

        /**
         * The frame document reference.
         * @var JQueryRef 
         */
        $frameDocument: null,

        /**
         * The frame body reference.
         * @var JQueryRef 
         */
        $frameBody: null,

        /**
         * The option config object.
         * @var Object
         */
        options: {
            /**
             * Modal frame background color. 
             * @var string
             */
            backgroundColor: '#fff',

            /**
             *  The base CSS class to apply to this widget elements.
             *  @var string
             */
            baseCls: 'page-print',

            /**
             * If set to true all the elements and events are destroyed 
             * when the modal is closed.
             * @var boolean
             */
            destroyOnHide: false,

            /**
             * The modal mask opacity.
             * @var number
             */
            opacity: 0.75,

            /**
             * The margin that will be added to the print frame body.
             * @var string
             */
            paperMargin: '1cm',

            /**
             * Print frame body width.
             */
            paperWidth: '19cm',

            /**
             * The z-index property that will be set on the modal and modal mask. 
             * @var number
             */
            zIndex: 10000
        },

        /**
         * The init function.
         * @return Object
         */
        init: function (options, elem) {
            var that = this;

            // Mix in the passed in options with the default options.
            this.options = $.extend({}, this.options, options);

            // Save the target element and the document body as jQuery references.
            this.$elem = $(elem);
            this.$body = $('body');

            // Open the print dialog for IE6.
            if (this.isIE(6) === true) {
                this.$elem.click(function () {
                    window.print();
                });

                return this;
            }

            // Open the modal window when the DOM element is clicked.
            this.$elem.click(function () {
                that.showModal();
                return false;
            });

            this.initKeyBindings();

            // Hide the plugin elements when printing the document.
            $('head').append(
                '<style type="text/css">' +
                    '@media print {' +
                        '/* -- Print Preview --*/' +
                        '.' + this.options.baseCls + '-mask,' +
                        '.' + this.options.baseCls + '-modal {' +
                            'display: none !important;' +
                        '}' +
                    '}' +
                    '</style>'
            );

            // Return this so we can chain/use the bridge with less code.
            return this;
        },

        /**
         * Overwrite browser default functionality. 
         * Capture the CTRL + P keys and show the modal. 
         * @return void
         */
        initKeyBindings: function () {
            var that = this, isCtrl = false;

            $(document).keydown(function (e) {
                // Run the default browser behaviour,
                // if the modal is already opened.
                if (that.$modal && that.$modal.is(':visible') === true) {
                    return true;
                }

                if (e.ctrlKey) {
                    isCtrl = true;
                }

                if (e.keyCode === 80 && isCtrl === true) {
                    e.preventDefault();
                    e.stopPropagation();

                    // For IE the original event keycode must be overwritten.
                    if (that.isIE() === true) {
                        event.keyCode = 0;
                    }

                    that.showModal();
                    return false;
                }
            }).keyup(function (e) {
                if (e.ctrlKey) {
                    isCtrl = false;
                }
            });

        },

        /**
         * Show the modal that contains the preview. 
         * @return void
         */
        showModal: function () {
            var that = this;

            // Build the modal if this is the first time when you try to show it.
            if (!this.$modal) {
                this.build();
            }

            // Disable body scrolling.
            this.$body.css({overflow: 'hidden', height: '100%', width: '100%'});

            // Do the same thing to the html tag (because IE7).
            if (this.isIE(7) === true) {
                $('html').css({overflow: 'hidden', height: '100%', width: '100%'});
            }

            // Show the modal mask first.
            this.$mask.stop().fadeTo('400', this.options.opacity, function () {
                // Determine the height of the iframe.
                var height = that.$frameBody.height();
                if (height > 0) {
                    that.$frame.height(height);
                }

                // Now show the modal window.
                that.$modal
                    .css({
                        top: $(window).height(),
                        display: 'block'
                    })
                    .animate({top: 0}, 400, 'linear', function () {
                        that.$controls.fadeIn('slow');
                        that.$modalAnchor.focus();
                    });
            });
        },

        /**
         * Hide the modal window.
         * @return void.
         */
        hideModal: function () {
            var that = this, topPos = -$(window).height() + 100;

            this.$controls.fadeOut('slow');
            this.$modal
                .animate({top: topPos}, 400, 'linear', function () {
                    that.$modal.hide();
                    that.$mask.stop().fadeOut(function () {
                        if (that.isIE(7) === true) {
                            $('html').attr('style', '');
                        }
                        that.$body.attr('style', '');

                        if (that.options.destroyOnHide) {
                            that.destroy();
                        }
                    });
                });
        },

        /**
         * Build the plugin elements 
         * before showing the modal for the first time.
         * @return void
         */
        build: function () {
            var that = this;

            // Build the plugin elements.
            this.buildModal();
            this.buildMask();
            this.buildControlContainer();
            this.buildIFrame();

            // Append the elements to the body.
            this.$modal
                .append(this.$controls)
                .append(this.$frame)
                .appendTo(this.$body);

            // Add the current page to the iframe.
            this.populateIframe();
            
            // Add focus handler to the document.
            if ($.browser.opera === true) {
                this.$frameBody.prepend(this.$modalAnchor);
            } else {
                this.$modal.prepend(this.$modalAnchor);
            }

            // Hide the modal when the ESC key is pressed.
            $(document).add(this.$frameDocument).bind('keydown.pp', function (e) {
                if (!that.$modal.is(':visible')) {
                    return true;
                }

                if (e.keyCode === 27) {
                    that.hideModal();
                }
            });

        },

        /**
         * Build the modal DOM elements (including the anchor that will help us 
         * to scroll the frame with the arrows keys. 
         * @return void
         */
        buildModal: function () {
            var css = {
                background: this.options.backgroundColor,
                height: '100%',
                left: '50%',
                marginLeft: -377,
                overflowX: 'hidden',
                overflowY: 'auto',
                padding: '0 ' + this.options.paperMargin,
                position: 'fixed',
                top: -10000,
                width: this.options.paperWidth,
                zIndex: this.options.zIndex
            };

            this.$modal = $(
                '<div class="' + this.options.baseCls + '-modal"></div>'
            ).css(css);

            css = {
                left: -1000,
                position: 'absolute'
            };
            this.$modalAnchor = $('<a href="#" class="anchor">&nbsp;</a>').css(css);
        },

        /**
         * Build the modal controls container 
         * that will float above the modal window.
         * @return void
         */
        buildControlContainer: function () {
            var that = this,
                css = {
                    position: 'fixed',
                    top: 15
                };

            this.$controls = $(
                '<div class="' + this.options.baseCls + '-controls">' +
                    '<a href="#" class="print" title="Print page">Print page</a>' +
                    '<a href="#" class="close"' +
                        'title="Close print preview">Close</a>' +
                    '</div>'
            ).hide().css(css);

            // Add the icons events.
            $('a', this.$controls).bind('click.ppCtrls', function (e) {
                e.preventDefault();
                if ($(this).hasClass('print')) {
                    window.print();
                } else {
                    that.hideModal();
                }
            });

        },

        /**
         * Build the modal mask.
         * @return void
         */
        buildMask: function () {
            var that = this,
                css = {
                    height: '100%',
                    width: '100%',
                    zIndex: this.options.zIndex - 1,
                    position: 'fixed',
                    top: 0,
                    backgroundColor: '#000',
                    display: 'block'
                };

            this.$mask = $(
                '<div class="' + this.options.baseCls + '-mask"></div>'
            ).css(css);
            this.$mask.hide().appendTo(this.$body);

            this.$mask.bind("click.ppMask", function () {
                that.hideModal();
            });

        },

        /**
         * Build the Iframe that will show the preview.
         * @return void
         */
        buildIFrame: function () {
            var frame,
                css = {
                    height: '100%',
                    margin: this.options.paperMargin + ' 0',
                    width: '100%'
                };

            frame = $(
                '<iframe class="' + this.options.baseCls + '-content" ' +
                    'border="0" scrolling="no" frameborder="0"' +
                    'name="paper-print-frame" />'
            ).css(css);

            this.$frame = frame;
        },

        /**
         * Clone the page content and append it to the iframe.
         * @return void
         */
        populateIframe: function () {
            var content, frame, frameDocument, styles, stylesSelector;

            frame = this.$frame.get(0);
            frameDocument = frame.contentWindow || frame.contentDocument;
            this.$frameDocument = $(frameDocument.document);

            frameDocument.document.open();
            frameDocument.document.write(
                '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" ' +
                    '"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">' +
                    '<html xmlns="http://www.w3.org/1999/xhtml"' +
                        'xml:lang="en" lang="en">' +
                        '<head><title>' + document.title + '</title></head>' +
                        '<body></body>' +
                    '</html>'
            );
            frameDocument.document.close();

            this.$frameBody = $('body', this.$frameDocument).css('height', 'auto');
            content = this.$body.children().not('script');
            this.$frameBody.append(content.clone());

            // Append the styles in the iframe. Change their media type to all.
            stylesSelector = 'head link[rel="stylesheet"][media="all"]';
            stylesSelector += ', head link[rel="stylesheet"][media*="print"]';
            stylesSelector += ', head link[rel="stylesheet"]:not([media])';
            styles = $(stylesSelector).clone().each(function () {
                $(this).attr('media', 'all');
            });
            $('head', this.$frameDocument).append(styles);

            // Disable all links in the iframe.
            $('a', this.$frameDocument).click(function (e) {
                e.preventDefault();
            });

        },

        /**
         * Called if the flag destroyOnHide was set to true.
         * Removes the elements & events created by this plugin.
         * @return void
         */
        destroy: function () {
            $(document).unbind('keydown.pp');
            $('a', this.$controls).unbind('click.ppCtrls');

            this.$modal.remove();
            this.$modal = null;

            this.$mask.unbind('click.ppMask');
            this.$mask.remove();
        },

        /**
         * Check the IE version.
         * @param number version The IE version to check.
         * @return boolean
         */
        isIE: function (version) {
            if ($.browser.msie && !version) {
                return true;
            }

            if ($.browser.msie && $.browser.version === version + '.0') {
                return true;
            }

            return false;
        }
    };

    // Start the plugin.
    $.fn.pagePrint = function (options) {
        // Don't act on absent elements -via Paul Irish's advice.
        if (this.length) {
            return this.each(function () {
                // Create a new object via the Prototypal Object.create.
                var obj = Object.create(PagePrint);

                // Run the initialization function of the object.
                // `this` refers to the element.
                obj.init(options, this);

                // Save the instance of the object in the element's data store.
                $.data(this, 'page-print', obj);
            });
        }
    };
}(jQuery));
