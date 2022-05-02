/**
 * Element.matches and Element.closest polyfill
 * Jonathan Neal <https://github.com/jonathantneal/closest>
 */
( function( ElementProto ) {
    if ( typeof ElementProto.matches !== 'function' ) {
        ElementProto.matches = ElementProto.msMatchesSelector || ElementProto.mozMatchesSelector || ElementProto.webkitMatchesSelector || function matches( selector ) {
            var element = this;
            var elements = ( element.document || element.ownerDocument ).querySelectorAll( selector );
            var index = 0;

            while ( elements[ index ] && elements[ index ] !== element ) {
                ++index;
            }

            return Boolean( elements[ index ] );
        };
    }

    if ( typeof ElementProto.closest !== 'function' ) {
        ElementProto.closest = function closest( selector ) {
            var element = this;

            while ( element && element.nodeType === 1 ) {
                if ( element.matches( selector ) ) {
                    return element;
                }

                element = element.parentNode;
            }

            return null;
        };
    }
})( window.Element.prototype );

/**
 * Helps with accessibility for keyboard only users.
 * Learn more: https://git.io/vWdr2
 */
( function() {
    var isIe = /(trident|msie)/i.test( navigator.userAgent );

    if ( isIe && document.getElementById && window.addEventListener ) {
        window.addEventListener( 'hashchange', function() {
            var id = location.hash.substring( 1 ),
                element;

            if ( ! ( /^[A-z0-9_-]+$/.test( id ) ) ) {
                return;
            }

            element = document.getElementById( id );

            if ( element ) {
                if ( ! ( /^(?:a|select|input|button|textarea)$/i.test( element.tagName ) ) ) {
                    element.tabIndex = -1;
                }

                element.focus();
            }
        }, false );
    }
} )();

/*!
 * aTouchClick, touchend or click event callback fires only once.
 * by: Stev Ngo <https://twitter.com/stevngodesign>
 * usage: aTouchClick( Element, Fn )
 */
(function() {
    var _gTouchEnabled = false,
        _gTapFired = false,
        _gTouchStartPos = { x: 0, y: 0 };

    /**
     * If browser has touch support then we simulate tap events.
     */
    if ( 'ontouchstart' in document && 'ontouchmove' in document && 'ontouchend' in document ) {
        _gTouchEnabled = true;
        document.addEventListener( 'touchstart', function( e ) {
            _gTapFired = false;
            _gTouchStartPos.x = e.touches[0].pageX;
            _gTouchStartPos.y = e.touches[0].pageY;
        });

        document.addEventListener( 'touchmove', function( e ) {
            if ( Math.abs( e.touches[0].pageX - _gTouchStartPos.x ) < 5 && Math.abs( e.touches[0].pageY - _gTouchStartPos.y ) < 5 ) {
                _gTapFired = true;
            }
        });
    }

    /**
     * Prevent click event on element if it also have touchend event.
     * @param {Function} callback
     */
    function TouchEndOrClick( el, callback ) {
        this.el = el;
        this.callback = callback;
        this.fired = false;

        if ( _gTouchEnabled ) {
            this.el.addEventListener( 'touchend', this._touchEndHandler.bind( this ), false );
        }

        this.el.addEventListener( 'click', this._clickEventHandler.bind( this ), false );
    }

    TouchEndOrClick.prototype = {
        _touchEndHandler: function( e ) {
            this.callback.apply( this.el, arguments );
            this.fired = true;
        },
        _clickEventHandler: function( e ) {
            if ( ! this.fired ) {
                this.callback.apply( this.el, arguments );
            }
            this.fired = false;
        }
    }

    window.aTouchClick = function( el, callback ) {
        return new TouchEndOrClick( el, callback );
    }
})();

/**
 * The main scripts
 * @param  {jQuery} $
 */
;( function( $ ) {
    "use strict";

    /**
     * forEach support for any array-like object.
     * This is, by far, faster than Array.prototype.call(list).forEach
     * https://jsperf.com/array-prototype-slice-vs-for-loop/
     */
    function fnForEach( list, fn, scope ) {
        for ( var i = 0; i < list.length; i++ ) {
            fn.call( scope, list[ i ], i );
        }
    }

    /**
     * dispatch custom events
     *
     * @param  {element} el         slideshow element
     * @param  {string}  type       custom event name
     * @param  {object}  detail     custom detail information
     */
    function fnDispatchEvent( target, type, detail ) {
        var event = new CustomEvent(
            type,
            {
                bubbles: true,
                cancelable: true,
                detail: detail
            }
        );
        target.dispatchEvent( event );
    }

    /**
     * Check if element is in current viewport or not
     * @param  {Element} el
     * @return {Boolean}
     */
    function fnIsInView( el ) {
        var win    = $( window ),
            view   = {},
            bounds = {};

        view.top = win.scrollTop();
        view.left = win.scrollLeft();
        view.right = view.left + window.innerWidth;
        view.bottom = view.top + window.innerHeight;

        bounds = $( el ).offset();
        bounds.right = bounds.left + $( el ).outerWidth();
        bounds.bottom = bounds.top + $( el ).outerHeight();
        return (
            view.left < bounds.right &&
            view.right > bounds.left &&
            view.top < bounds.bottom - 100 &&
            view.bottom > bounds.top + 100
        );
    };

    /**
     * Animated scroll to element
     * @param  {Element}  $el
     * @param  {integer}         offset
     * @param  {object}          jQuery animate() options
     */
    function fnAnimatedScrollTo( el, offset, hash, options ) {

        if ( ! el ) {
            return false;
        }

        var settings = {
            duration: 800,
            easing: "swing"
        };

        if ( ! offset ) {
            offset = 0;
        }

        settings.complete = function() {
            if ( hash ) {
                window.location.hash = hash;
                hash = '';
            }
        };

        if ( options ) {
            settings = $.extend( true, {}, settings, options );
        }

        $( 'html, body' ).animate({
            scrollTop: ( $( el ).offset().top - offset ) + 'px'
        }, settings.duration, settings.easing, settings.complete );
    }

    /**
     * Site loading animation
     * @param  {boolean} init
     */
    function fnSiteLoading( init ) {
        var el = document.querySelector( '#siteloader' ),
            timeOut = 50;

        if ( ! el ) {
            return;
        }

        if ( init ) {
            el.addEventListener( fnWhichTransitionEvent(), function() {
                el.style.display = 'none';
                el.remove();
            });
        }
        else {
            el.classList.remove( 'loading' );
            el.style.display = '';
        }
    }

    /**
     * All aria controls elements.
     */
    function fnAriaControls() {
        var controls = document.querySelectorAll( '[data-el="aria"]' );
        fnForEach( controls, fnAriaControl );
    }

    /**
     * Single aria control progress
     * @param  {Element} c
     */
    function fnAriaControl( c ) {
        var target = document.getElementById( c.getAttribute( 'aria-controls' ) ),
            sameTargetControls,
            closeParent;

        if ( ! target ) {
            return;
        }

        sameTargetControls = document.querySelectorAll( '[data-el="aria"][aria-controls="' + target.id + '"]' );
        closeParent = 'true' === c.getAttribute( 'data-parent-close' );

        aTouchClick( c, function( e ) {
            if ( 'true' === c.getAttribute( 'data-close-others' ) ) {
                var otherActiveArias = document.querySelectorAll( '[data-el="aria"][aria-expanded="true"]' );
                fnForEach( otherActiveArias, function( otherActiveAria ) {
                    if ( otherActiveAria != c ) {
                        otherActiveAria.setAttribute( 'aria-expanded', false );
                        otherActiveAria.classList.remove( 'active' );
                        if ( otherActiveAria.getAttribute( 'id' ) ) {
                            document.body.classList.remove( otherActiveAria.id + '-active' );
                        }
                    }
                });
            }

            if ( 'false' === c.getAttribute( 'aria-expanded' ) ) {
                if ( closeParent ) {
                    var maybeActiveParent = c.closest( '[aria-expanded="true"]' ),
                        parentControlFroms;
                    if ( maybeActiveParent ) {
                        maybeActiveParent.setAttribute( 'aria-expanded', false );
                        maybeActiveParent.classList.remove( 'active' );
                        document.body.classList.remove( maybeActiveParent.id + '-active' );
                        parentControlFroms = document.querySelectorAll( '[data-el="aria"][aria-controls="' + maybeActiveParent.id + '"]' );
                        fnForEach( parentControlFroms, function( from ) {
                            from.setAttribute( 'aria-expanded', false );
                            from.classList.remove( 'active' );
                        });
                    }
                }
                else {
                    c.setAttribute( 'aria-expanded', true );
                    c.classList.add( 'active' );
                }

                target.setAttribute( 'aria-expanded', true );
                target.classList.add( 'active' );
                fnForEach( sameTargetControls, function( stc ) {
                    if ( stc !== c ) {
                        stc.setAttribute( 'aria-expanded', true );
                        stc.classList.add( 'active' );
                    }
                });
                document.body.classList.add( target.id + '-active' );
            } else {
                c.setAttribute( 'aria-expanded', false );
                c.classList.remove( 'active' );
                target.setAttribute( 'aria-expanded', false );
                target.classList.remove( 'active' );
                fnForEach( sameTargetControls, function( stc ) {
                    if ( stc !== c ) {
                        stc.setAttribute( 'aria-expanded', false );
                        stc.classList.remove( 'active' );
                    }
                });
                document.body.classList.remove( target.id + '-active' );
            }

            if ( 'true' === c.getAttribute( 'data-parent-close' ) ) {
                var maybeActiveParent = c.closest( '[aria-expanded="true"]' );
                if ( maybeActiveParent ) {
                    c.setAttribute( 'aria-expanded', false );
                    c.classList.remove( 'active' );
                }
            }
        });
    }

    /**
     * Maybe close aria controls, used for document click/tap events
     * @param  {Element} el event.target
     */
    function fnMaybeCloseAriaControls( el ) {
        // Let it do its event
        if ( "aria" === el.getAttribute( 'data-el' ) ) {
            return false;
        }
        // Let the active one remains active
        if ( el.closest( '[data-el="aria"][aria-expanded="true"]' ) ) {
            return false;
        }
        // Maybe, but we have to make sure that the aria acfive elements
        // are our elements.
        var maybeActiveParent = el.closest( '[aria-expanded="true"]' );
        if ( maybeActiveParent ) {
            return false;
        }

        var activeControls = document.querySelectorAll( '[data-el="aria"][aria-expanded="true"]' );
        // This was activated by our controls.
        fnForEach( activeControls, function( activeControl ) {
            var isControlTarget = activeControl.getAttribute( 'aria-controls' ) ? false : true;
            activeControl.setAttribute( 'aria-expanded', false );
            activeControl.classList.remove( 'active' );
            if ( isControlTarget ) {
                document.body.classList.remove( activeControl.id + '-active' );
            }
        });
    }

    function fnHeader() {
        var header = document.getElementById( 'masthead' ),
            lastScroll = $( window ).scrollTop(),
            fnScroll = void 0;
        if ( ! header ) {
            return;
        }
        fnScroll = function( e ) {
            var winSrcoll = $( window ).scrollTop();
            if ( winSrcoll <= 0 ) {
                if ( header.classList.contains( 'sticked' ) ) {
                    header.classList.remove( 'sticked' );
                }
            } else {
                if ( ! header.classList.contains( 'sticked' ) ) {
                    header.classList.add( 'sticked' );
                }
            }
        }
        window.addEventListener( 'scroll', fnScroll );
        fnScroll();
    }

    function fnHeaderAnchorLinks() {
        var links = document.querySelectorAll( '#mastmenu .menu-item > a' ),
            sections = [],
            sectionHashes = [];

        // Add proper anchor jumps and get sections
        fnForEach( links, function( link ) {
            if ( '' === link.href || '' === link.hash ) {
                return;
            }
            // If it's frontpage links
            if ( MinimalRestaurantLocalize.isfront && MinimalRestaurantLocalize.homeurl.length === link.href.indexOf( '#' ) ) {
                link.setAttribute( 'href', link.href.substring( MinimalRestaurantLocalize.homeurl.length ) );
                if ( link.parentNode.classList.contains( 'current_page_item' ) ) {
                    link.parentNode.classList.remove( 'current_page_item' )
                }
                if ( link.parentNode.classList.contains( 'current-menu-item' ) ) {
                    link.parentNode.classList.remove( 'current-menu-item' )
                }
            }
            var el = null;
            try {
                el = document.querySelector( link.hash );
            } catch ( e ) {
                el = null;
            }

            if ( ! el ) {
                return;
            }

            if ( sectionHashes.indexOf( link.hash ) < 0 ) {
                sectionHashes.push( link.hash );
            }

            link.addEventListener( 'click', function( e ) {
                e.preventDefault();
                fnAnimatedScrollTo( el, 0, link.hash );
                // $( '.menu-toggle[aria-controls="site-navigation"]' ).trigger( 'click' );
            });
        });

        fnForEach( sectionHashes, function( sectionHash ) {
            sections.push( document.querySelector( sectionHash ) );
        });

        var currentSection = null,
            lastWinPos = $( window ).scrollTop() - 10,
            fnScroll;

        fnScroll = function() {
            var winPos = $( window ).scrollTop(),
                activeItems = document.querySelectorAll( '.main-navigation .nav li.active > a' ),
                inviewSections = [];

            fnForEach( sections, function( section ) {
                var sid = section.getAttribute( 'id' ),
                    lastSectionOffset = void 0,
                    curSectionOffset = void 0;

                if ( ! sid ) {
                    return;
                }

                if ( fnIsInView( section ) ) {
                    if ( inviewSections.length ) {
                        if ( $( section ).offset().top > $( inviewSections[ inviewSections.length -1 ] ).offset().top ) {
                            inviewSections.push( section );
                        }
                        else {
                            inviewSections.unshift( section );
                        }
                    }
                    else {
                        inviewSections.push( section );
                    }
                }
            });

            if ( inviewSections.length ) {
                // if ( winPos > lastWinPos ) {
                //     currentSection = '#' + inviewSections[ inviewSections.length - 1 ].id;
                // }
                // else {
                    currentSection = '#' + inviewSections[ 0 ].id;
                // }

                var item = document.querySelector( 'a[href*="' + currentSection + '"]' );

                fnForEach( activeItems, function( oe ) {
                    if ( oe !== item ) {
                        oe.parentNode.classList.remove( 'active' );
                    }
                });

                if ( item ) {
                    item.parentNode.classList.add( 'active' );
                }
            } else {
                fnForEach( activeItems, function( oe ) {
                    if ( oe !== item ) {
                        oe.parentNode.classList.remove( 'active' );
                    }
                });
            }

            lastWinPos = $( window ).scrollTop();
        }

        fnScroll();
        window.addEventListener( 'scroll', fnScroll );
    }

    function fnPrimaryMenu() {
        if ( ! ( 'ontouchstart' in window ) ) {
            return false;
        }
        var touchStartFn,
            menu = document.getElementById( 'mastmenu' ),
            menuLinks = menu.querySelectorAll( '.menu-item-has-children > a, .page_item_has_children > a' ),

        touchStartFn = function( e ) {
            var menuItem = this.parentNode,
                siblingsItems = menuItem.parentNode.children,
                focusedOnSiblingItems;

            if ( ! menuItem.classList.contains( 'focus' ) ) {
                e.preventDefault();
                fnForEach( siblingsItems, function( siblingsItem ) {
                    if ( ! siblingsItem.classList.contains( 'focus' ) ) {
                        return;
                    }
                    if ( menuItem === siblingsItem ) {
                        return;
                    }
                    siblingsItem.classList.remove( 'focus' );
                    focusedOnSiblingItems = siblingsItem.querySelectorAll( 'li.focus' );
                    fnForEach( focusedOnSiblingItems, function( focusedOnSiblingItem ) {
                        focusedOnSiblingItem.classList.remove( 'focus' );
                    });
                });
                menuItem.classList.add( 'focus' );
            } else {
                menuItem.classList.remove( 'focus' );
            }
        };

        fnForEach( menuLinks, function( menuLink ) {
            menuLink.addEventListener( 'touchstart', touchStartFn, false );
        });
    }

    function fnToTop() {
        var backToTopLink = document.querySelector( '[data-eltype="totopbtn"]' ),
            lastWinPos = $( window ).scrollTop(),
            timeOut,
            TIMEOUT = 50;

        timeOut = TIMEOUT;

        if ( ! backToTopLink )
        {
            return;
        }

        backToTopLink.addEventListener( 'click', function( event )
        {
            event.stopPropagation();
            $( this ).blur();
            $( 'html, body' ).stop().animate( { scrollTop: 0 }, 1500, 'swing' );
        });

        window.addEventListener( 'scroll', function()
        {
            var winPos = $( window ).scrollTop();

            clearTimeout( timeOut );

            timeOut = setTimeout( function()
            {
                if ( winPos > 480 )
                {
                    if ( ! backToTopLink.classList.contains( 'active' ) )
                    {
                        backToTopLink.classList.add( 'active' );
                    }
                }
                else
                {
                    backToTopLink.classList.remove( 'active' );
                }

                lastWinPos = $( window ).scrollTop();

            }, TIMEOUT );
        });
    }

    function fnTestimoniasCarousel() {
        var $carousels = $( '[data-el="footer-testimonials"]' );
        if ( ! $carousels.length ) {
            return;
        }
        $carousels.each( function() {
            $( this ).owlCarousel({
                'items': 1,
                'margin': 0,
                'nav' : false,
                'dots' : true,
                'loop' : true
            });
        });
    }

    /**
     * Maybe close openned sub menus, used for document click/tap events
     * @param  {Element} el event.target
     */
    function fnMaybeClosePrimaryMenuFocused( el ) {
        if ( el.closest( '#mastmenu' ) ) {
            return false;
        }
        var maybeFocusedItems = document.querySelectorAll( '#mastmenu li.focus' );
        fnForEach( maybeFocusedItems, function( focusedItem ) {
            focusedItem.classList.remove( 'focus' );
        });
    }

    function fnBodyClick() {
        document.body.addEventListener( 'click', function( e ) {
            fnMaybeCloseAriaControls( e.target );
            fnMaybeClosePrimaryMenuFocused( e.target );
        }, false );
    }

    document.addEventListener( 'DOMContentLoaded', function() {
        fnHeader();
        fnHeaderAnchorLinks();
        fnPrimaryMenu();
        fnAriaControls();
        fnBodyClick();
        fnTestimoniasCarousel();
        fnToTop();
    }, false );
})( jQuery );