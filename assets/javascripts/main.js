var menuItems = document.querySelectorAll('#sidebar li');

// Get vendor transition property
var docElemStyle = document.documentElement.style;
var transitionProp = typeof docElemStyle.transition == 'string' ?
    'transition' : 'WebkitTransition';

// Animate sidebar menu items
function animateMenuItems() {
  for ( var i=0; i < menuItems.length; i++ ) {
    var item = menuItems[i];
    // Stagger transition with transitionDelay
    item.style[ transitionProp + 'Delay' ] = ( i * 75 ) + 'ms';
    item.classList.toggle('is--moved');
  }
};

var myWrapper = document.querySelector('.wrapper');
var myMenu = document.querySelector('.sidebar');
var myToggle = document.querySelector('.toggle');
var myInitialContent = document.querySelector('.initial-content');
var mySearchContent = document.querySelector('.search-content');
var mySearchToggle = document.querySelector('.search-toggle');

// Toggle sidebar visibility
function toggleClassMenu() {
  myMenu.classList.add('is--animatable');
  if(!myMenu.classList.contains('is--visible')) {
    myMenu.classList.add('is--visible');
    myToggle.classList.add('open');
    myWrapper.classList.add('is--pushed');
  } else {
    myMenu.classList.remove('is--visible');
    myToggle.classList.remove('open');
    myWrapper.classList.remove('is--pushed');
  }
}

// Animation smoother
function OnTransitionEnd() {
  myMenu.classList.remove('is--animatable');
}

myMenu.addEventListener('transitionend', OnTransitionEnd, false);
myToggle.addEventListener('click', function() {
  toggleClassMenu();
  animateMenuItems();
}, false);
myMenu.addEventListener('click', function() {
  toggleClassMenu();
  animateMenuItems();
}, false);
mySearchToggle.addEventListener('click', function() {
  toggleClassSearch();
}, false);

// Toggle search input and content visibility
function toggleClassSearch() {
  mySearchContent.classList.toggle("is--visible");
  myInitialContent.classList.toggle("is--hidden");
  setTimeout(function() {
    document.querySelector(".search-content input").focus();
  }, 400);
}
//ls.bgset.js
(function(){
    'use strict';
    if(!window.addEventListener){return;}

    var regWhite = /\s+/g;
    var regSplitSet = /\s*\|\s+|\s+\|\s*/g;
    var regSource = /^(.+?)(?:\s+\[\s*(.+?)\s*\])?$/;
    var regBgUrlEscape = /\(|\)|'/;
    var allowedBackgroundSize = {contain: 1, cover: 1};
    var proxyWidth = function(elem){
        var width = lazySizes.gW(elem, elem.parentNode);

        if(!elem._lazysizesWidth || width > elem._lazysizesWidth){
            elem._lazysizesWidth = width;
        }
        return elem._lazysizesWidth;
    };
    var getBgSize = function(elem){
        var bgSize;

        bgSize = (getComputedStyle(elem) || {getPropertyValue: function(){}}).getPropertyValue('background-size');

        if(!allowedBackgroundSize[bgSize] && allowedBackgroundSize[elem.style.backgroundSize]){
            bgSize = elem.style.backgroundSize;
        }

        return bgSize;
    };
    var createPicture = function(sets, elem, img){
        var picture = document.createElement('picture');
        var sizes = elem.getAttribute(lazySizesConfig.sizesAttr);
        var ratio = elem.getAttribute('data-ratio');
        var optimumx = elem.getAttribute('data-optimumx');

        if(elem._lazybgset && elem._lazybgset.parentNode == elem){
            elem.removeChild(elem._lazybgset);
        }

        Object.defineProperty(img, '_lazybgset', {
            value: elem,
            writable: true
        });
        Object.defineProperty(elem, '_lazybgset', {
            value: picture,
            writable: true
        });

        sets = sets.replace(regWhite, ' ').split(regSplitSet);

        picture.style.display = 'none';
        img.className = lazySizesConfig.lazyClass;

        if(sets.length == 1 && !sizes){
            sizes = 'auto';
        }

        sets.forEach(function(set){
            var source = document.createElement('source');

            if(sizes && sizes != 'auto'){
                source.setAttribute('sizes', sizes);
            }

            if(set.match(regSource)){
                source.setAttribute(lazySizesConfig.srcsetAttr, RegExp.$1);
                if(RegExp.$2){
                    source.setAttribute('media', lazySizesConfig.customMedia[RegExp.$2] || RegExp.$2);
                }
            }
            picture.appendChild(source);
        });

        if(sizes){
            img.setAttribute(lazySizesConfig.sizesAttr, sizes);
            elem.removeAttribute(lazySizesConfig.sizesAttr);
            elem.removeAttribute('sizes');
        }
        if(optimumx){
            img.setAttribute('data-optimumx', optimumx);
        }
        if(ratio) {
            img.setAttribute('data-ratio', ratio);
        }

        picture.appendChild(img);

        elem.appendChild(picture);
    };

    var proxyLoad = function(e){
        if(!e.target._lazybgset){return;}

        var image = e.target;
        var elem = image._lazybgset;
        var bg = image.currentSrc || image.src;

        if(bg){
            elem.style.backgroundImage = 'url(' + (regBgUrlEscape.test(bg) ? JSON.stringify(bg) : bg ) + ')';
        }

        if(image._lazybgsetLoading){
            lazySizes.fire(elem, '_lazyloaded', {}, false, true);
            delete image._lazybgsetLoading;
        }
    };

    addEventListener('lazybeforeunveil', function(e){
        var set, image, elem;

        if(e.defaultPrevented || !(set = e.target.getAttribute('data-bgset'))){return;}

        elem = e.target;
        image = document.createElement('img');

        image.alt = '';

        image._lazybgsetLoading = true;
        e.detail.firesLoad = true;

        createPicture(set, elem, image);

        setTimeout(function(){
            lazySizes.loader.unveil(image);

            lazySizes.rAF(function(){
                lazySizes.fire(image, '_lazyloaded', {}, true, true);
                if(image.complete) {
                    proxyLoad({target: image});
                }
            });
        });

    });

    document.addEventListener('load', proxyLoad, true);

    window.addEventListener('lazybeforesizes', function(e){
        if(e.target._lazybgset && e.detail.dataAttr){
            var elem = e.target._lazybgset;
            var bgSize = getBgSize(elem);

            if(allowedBackgroundSize[bgSize]){
                e.target._lazysizesParentFit = bgSize;

                lazySizes.rAF(function(){
                    e.target.setAttribute('data-parent-fit', bgSize);
                    if(e.target._lazysizesParentFit){
                        delete e.target._lazysizesParentFit;
                    }
                });
            }
        }
    }, true);

    document.documentElement.addEventListener('lazybeforesizes', function(e){
        if(e.defaultPrevented || !e.target._lazybgset){return;}
        e.detail.width = proxyWidth(e.target._lazybgset);
    });
})();
//ls.object-fit.js
(function(window, factory) {
    var globalInstall = function(initialEvent){
        factory(window.lazySizes, initialEvent);
        window.removeEventListener('lazyunveilread', globalInstall, true);
    };

    factory = factory.bind(null, window, window.document);

    if(typeof module == 'object' && module.exports){
        factory(require('lazysizes'));
    } else if(window.lazySizes) {
        globalInstall();
    } else {
        window.addEventListener('lazyunveilread', globalInstall, true);
    }
}(window, function(window, document, lazySizes, initialEvent) {
    'use strict';
    var style = document.createElement('a').style;
    var fitSupport = 'objectFit' in style;
    var positionSupport = fitSupport && 'objectPosition' in style;
    var regCssFit = /object-fit["']*\s*:\s*["']*(contain|cover)/;
    var regCssPosition = /object-position["']*\s*:\s*["']*(.+?)(?=($|,|'|"|;))/;
    var blankSrc = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
    var regBgUrlEscape = /\(|\)|'/;
    var positionDefaults = {
        center: 'center',
        '50% 50%': 'center',
    };

    function getObject(element){
        var css = (getComputedStyle(element, null) || {});
        var content = css.fontFamily || '';
        var objectFit = content.match(regCssFit) || '';
        var objectPosition = objectFit && content.match(regCssPosition) || '';

        if(objectPosition){
            objectPosition = objectPosition[1];
        }

        return {
            fit: objectFit && objectFit[1] || '',
            position: positionDefaults[objectPosition] || objectPosition || 'center',
        };
    }

    function initFix(element, config){
        var switchClassesAdded, addedSrc;
        var lazysizesCfg = lazySizes.cfg;
        var styleElement = element.cloneNode(false);
        var styleElementStyle = styleElement.style;

        var onChange = function(){
            var src = element.currentSrc || element.src;

            if(src && addedSrc !== src){
                addedSrc = src;
                styleElementStyle.backgroundImage = 'url(' + (regBgUrlEscape.test(src) ? JSON.stringify(src) : src ) + ')';

                if(!switchClassesAdded){
                    switchClassesAdded = true;
                    lazySizes.rC(styleElement, lazysizesCfg.loadingClass);
                    lazySizes.aC(styleElement, lazysizesCfg.loadedClass);
                }
            }
        };
        var rafedOnChange = function(){
            lazySizes.rAF(onChange);
        };

        element._lazysizesParentFit = config.fit;

        element.addEventListener('lazyloaded', rafedOnChange, true);
        element.addEventListener('load', rafedOnChange, true);

        styleElement.addEventListener('load', function(){
            var curSrc = styleElement.currentSrc || styleElement.src;

            if(curSrc && curSrc != blankSrc){
                styleElement.src = blankSrc;
                styleElement.srcset = '';
            }
        });

        lazySizes.rAF(function(){

            var hideElement = element;
            var container = element.parentNode;

            if(container.nodeName.toUpperCase() == 'PICTURE'){
                hideElement = container;
                container = container.parentNode;
            }

            lazySizes.rC(styleElement, lazysizesCfg.loadedClass);
            lazySizes.rC(styleElement, lazysizesCfg.lazyClass);
            lazySizes.aC(styleElement, lazysizesCfg.loadingClass);
            lazySizes.aC(styleElement, lazysizesCfg.objectFitClass || 'lazysizes-display-clone');

            if(styleElement.getAttribute(lazysizesCfg.srcsetAttr)){
                styleElement.setAttribute(lazysizesCfg.srcsetAttr, '');
            }

            if(styleElement.getAttribute(lazysizesCfg.srcAttr)){
                styleElement.setAttribute(lazysizesCfg.srcAttr, '');
            }

            styleElement.src = blankSrc;
            styleElement.srcset = '';

            styleElementStyle.backgroundRepeat = 'no-repeat';
            styleElementStyle.backgroundPosition = config.position;
            styleElementStyle.backgroundSize = config.fit;

            hideElement.style.display = 'none';

            element.setAttribute('data-parent-fit', config.fit);
            element.setAttribute('data-parent-container', 'prev');

            container.insertBefore(styleElement, hideElement);

            if(element._lazysizesParentFit){
                delete element._lazysizesParentFit;
            }

            if(element.complete){
                onChange();
            }
        });
    }

    if(!fitSupport || !positionSupport){
        var onRead = function(e){
            if(e.detail.instance != lazySizes){return;}

            var element = e.target;
            var obj = getObject(element);

            if(obj.fit && (!fitSupport || (obj.position != 'center'))){
                initFix(element, obj);
            }
        };

        window.addEventListener('lazyunveilread', onRead, true);

        if(initialEvent && initialEvent.detail){
            onRead(initialEvent);
        }
    }
}));
//ls.respimg.js
(function(window, document, undefined){
    /*jshint eqnull:true */
    'use strict';
    var polyfill;
    var config = (window.lazySizes && lazySizes.cfg) || window.lazySizesConfig;
    var img = document.createElement('img');
    var supportSrcset = ('sizes' in img) && ('srcset' in img);
    var regHDesc = /\s+\d+h/g;
    var fixEdgeHDescriptor = (function(){
        var regDescriptors = /\s+(\d+)(w|h)\s+(\d+)(w|h)/;
        var forEach = Array.prototype.forEach;

        return function(edgeMatch){
            var img = document.createElement('img');
            var removeHDescriptors = function(source){
                var ratio;
                var srcset = source.getAttribute(lazySizesConfig.srcsetAttr);
                if(srcset){
                    if(srcset.match(regDescriptors)){
                        if(RegExp.$2 == 'w'){
                            ratio = RegExp.$1 / RegExp.$3;
                        } else {
                            ratio = RegExp.$3 / RegExp.$1;
                        }

                        if(ratio){
                            source.setAttribute('data-aspectratio', ratio);
                        }
                    }
                    source.setAttribute(lazySizesConfig.srcsetAttr, srcset.replace(regHDesc, ''));
                }
            };
            var handler = function(e){
                var picture = e.target.parentNode;

                if(picture && picture.nodeName == 'PICTURE'){
                    forEach.call(picture.getElementsByTagName('source'), removeHDescriptors);
                }
                removeHDescriptors(e.target);
            };

            var test = function(){
                if(!!img.currentSrc){
                    document.removeEventListener('lazybeforeunveil', handler);
                }
            };

            if(edgeMatch[1]){
                document.addEventListener('lazybeforeunveil', handler);

                if(true || edgeMatch[1] > 14){
                    img.onload = test;
                    img.onerror = test;

                    img.srcset = 'data:,a 1w 1h';

                    if(img.complete){
                        test();
                    }
                }
            }
        };
    })();


    if(!config){
        config = {};
        window.lazySizesConfig = config;
    }

    if(!config.supportsType){
        config.supportsType = function(type/*, elem*/){
            return !type;
        };
    }

    if(window.picturefill || config.pf){return;}

    if(window.HTMLPictureElement && supportSrcset){

        if(document.msElementsFromPoint){
            fixEdgeHDescriptor(navigator.userAgent.match(/Edge\/(\d+)/));
        }

        config.pf = function(){};
        return;
    }

    config.pf = function(options){
        var i, len;
        if(window.picturefill){return;}
        for(i = 0, len = options.elements.length; i < len; i++){
            polyfill(options.elements[i]);
        }
    };

    // partial polyfill
    polyfill = (function(){
        var ascendingSort = function( a, b ) {
            return a.w - b.w;
        };
        var regPxLength = /^\s*\d+\.*\d*px\s*$/;
        var reduceCandidate = function (srces) {
            var lowerCandidate, bonusFactor;
            var len = srces.length;
            var candidate = srces[len -1];
            var i = 0;

            for(i; i < len;i++){
                candidate = srces[i];
                candidate.d = candidate.w / srces.w;

                if(candidate.d >= srces.d){
                    if(!candidate.cached && (lowerCandidate = srces[i - 1]) &&
                        lowerCandidate.d > srces.d - (0.13 * Math.pow(srces.d, 2.2))){

                        bonusFactor = Math.pow(lowerCandidate.d - 0.6, 1.6);

                        if(lowerCandidate.cached) {
                            lowerCandidate.d += 0.15 * bonusFactor;
                        }

                        if(lowerCandidate.d + ((candidate.d - srces.d) * bonusFactor) > srces.d){
                            candidate = lowerCandidate;
                        }
                    }
                    break;
                }
            }
            return candidate;
        };

        var parseWsrcset = (function(){
            var candidates;
            var regWCandidates = /(([^,\s].[^\s]+)\s+(\d+)w)/g;
            var regMultiple = /\s/;
            var addCandidate = function(match, candidate, url, wDescriptor){
                candidates.push({
                    c: candidate,
                    u: url,
                    w: wDescriptor * 1
                });
            };

            return function(input){
                candidates = [];
                input = input.trim();
                input
                    .replace(regHDesc, '')
                    .replace(regWCandidates, addCandidate)
                ;

                if(!candidates.length && input && !regMultiple.test(input)){
                    candidates.push({
                        c: input,
                        u: input,
                        w: 99
                    });
                }

                return candidates;
            };
        })();

        var runMatchMedia = function(){
            if(runMatchMedia.init){return;}

            runMatchMedia.init = true;
            addEventListener('resize', (function(){
                var timer;
                var matchMediaElems = document.getElementsByClassName('lazymatchmedia');
                var run = function(){
                    var i, len;
                    for(i = 0, len = matchMediaElems.length; i < len; i++){
                        polyfill(matchMediaElems[i]);
                    }
                };

                return function(){
                    clearTimeout(timer);
                    timer = setTimeout(run, 66);
                };
            })());
        };

        var createSrcset = function(elem, isImage){
            var parsedSet;
            var srcSet = elem.getAttribute('srcset') || elem.getAttribute(config.srcsetAttr);

            if(!srcSet && isImage){
                srcSet = !elem._lazypolyfill ?
                    (elem.getAttribute(config.srcAttr) || elem.getAttribute('src')) :
                    elem._lazypolyfill._set
                ;
            }

            if(!elem._lazypolyfill || elem._lazypolyfill._set != srcSet){

                parsedSet = parseWsrcset( srcSet || '' );
                if(isImage && elem.parentNode){
                    parsedSet.isPicture = elem.parentNode.nodeName.toUpperCase() == 'PICTURE';

                    if(parsedSet.isPicture){
                        if(window.matchMedia){
                            lazySizes.aC(elem, 'lazymatchmedia');
                            runMatchMedia();
                        }
                    }
                }

                parsedSet._set = srcSet;
                Object.defineProperty(elem, '_lazypolyfill', {
                    value: parsedSet,
                    writable: true
                });
            }
        };

        var getX = function(elem){
            var dpr = window.devicePixelRatio || 1;
            var optimum = lazySizes.getX && lazySizes.getX(elem);
            return Math.min(optimum || dpr, 2.5, dpr);
        };

        var matchesMedia = function(media){
            if(window.matchMedia){
                matchesMedia = function(media){
                    return !media || (matchMedia(media) || {}).matches;
                };
            } else {
                return !media;
            }

            return matchesMedia(media);
        };

        var getCandidate = function(elem){
            var sources, i, len, media, source, srces, src, width;

            source = elem;
            createSrcset(source, true);
            srces = source._lazypolyfill;

            if(srces.isPicture){
                for(i = 0, sources = elem.parentNode.getElementsByTagName('source'), len = sources.length; i < len; i++){
                    if( config.supportsType(sources[i].getAttribute('type'), elem) && matchesMedia( sources[i].getAttribute('media')) ){
                        source = sources[i];
                        createSrcset(source);
                        srces = source._lazypolyfill;
                        break;
                    }
                }
            }

            if(srces.length > 1){
                width = source.getAttribute('sizes') || '';
                width = regPxLength.test(width) && parseInt(width, 10) || lazySizes.gW(elem, elem.parentNode);
                srces.d = getX(elem);
                if(!srces.src || !srces.w || srces.w < width){
                    srces.w = width;
                    src = reduceCandidate(srces.sort(ascendingSort));
                    srces.src = src;
                } else {
                    src = srces.src;
                }
            } else {
                src = srces[0];
            }

            return src;
        };

        var p = function(elem){
            if(supportSrcset && elem.parentNode && elem.parentNode.nodeName.toUpperCase() != 'PICTURE'){return;}
            var candidate = getCandidate(elem);

            if(candidate && candidate.u && elem._lazypolyfill.cur != candidate.u){
                elem._lazypolyfill.cur = candidate.u;
                candidate.cached = true;
                elem.setAttribute(config.srcAttr, candidate.u);
                elem.setAttribute('src', candidate.u);
            }
        };

        p.parse = parseWsrcset;

        return p;
    })();

    if(config.loadedClass && config.loadingClass){
        (function(){
            var sels = [];
            ['img[sizes$="px"][srcset].', 'picture > img:not([srcset]).'].forEach(function(sel){
                sels.push(sel + config.loadedClass);
                sels.push(sel + config.loadingClass);
            });
            config.pf({
                elements: document.querySelectorAll(sels.join(', '))
            });
        })();

    }
})(window, document);

/**
 * Some versions of iOS (8.1-) do load the first candidate of a srcset candidate list, if width descriptors with the sizes attribute is used.
 * This tiny extension prevents this wasted download by creating a picture structure around the image.
 * Note: This extension is already included in the ls.respimg.js file.
 *
 * Usage:
 *
 * <img
 * 	class="lazyload"
 * 	data-sizes="auto"
 * 	data-srcset="small.jpg 640px,
 * 		medium.jpg 980w,
 * 		large.jpg 1280w"
 * 	/>
 */

(function(document){
    'use strict';
    var regPicture;
    var img = document.createElement('img');

    if(('srcset' in img) && !('sizes' in img) && !window.HTMLPictureElement){
        regPicture = /^picture$/i;
        document.addEventListener('lazybeforeunveil', function(e){
            var elem, parent, srcset, sizes, isPicture;
            var picture, source;
            if(e.defaultPrevented ||
                lazySizesConfig.noIOSFix ||
                !(elem = e.target) ||
                !(srcset = elem.getAttribute(lazySizesConfig.srcsetAttr)) ||
                !(parent = elem.parentNode) ||
                (
                    !(isPicture = regPicture.test(parent.nodeName || '')) &&
                    !(sizes = elem.getAttribute('sizes') || elem.getAttribute(lazySizesConfig.sizesAttr))
                )
            ){return;}

            picture = isPicture ? parent : document.createElement('picture');

            if(!elem._lazyImgSrc){
                Object.defineProperty(elem, '_lazyImgSrc', {
                    value: document.createElement('source'),
                    writable: true
                });
            }
            source = elem._lazyImgSrc;

            if(sizes){
                source.setAttribute('sizes', sizes);
            }

            source.setAttribute(lazySizesConfig.srcsetAttr, srcset);
            elem.setAttribute('data-pfsrcset', srcset);
            elem.removeAttribute(lazySizesConfig.srcsetAttr);

            if(!isPicture){
                parent.insertBefore(picture, elem);
                picture.appendChild(elem);
            }
            picture.insertBefore(source, elem);
        });
    }
})(document);
