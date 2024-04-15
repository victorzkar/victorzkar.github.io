/*
 * WOW.js
 * Biblioteca para animações quando os elementos entram no viewport.
 * https://wowjs.uk
 */

// Função de inicialização do módulo WOW
(function (global, factory) {
  // Verifica se o ambiente suporta AMD (RequireJS) e define o módulo
  if (typeof define === "function" && define.amd) {
    define(['module', 'exports'], factory);
  // Verifica se o ambiente suporta CommonJS (Node.js) e exporta o módulo
  } else if (typeof exports !== "undefined") {
    factory(module, exports);
  // Caso contrário, define o módulo como uma propriedade global
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, mod.exports);
    global.WOW = mod.exports;
  }
})(this, function (module, exports) {
  'use strict';

  // Define que as exportações do módulo são válidas
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  // Define a classe principal WOW
  var _class, _temp;

  // Função para verificar se um item está presente em uma lista
  function isIn(needle, haystack) {
    return haystack.indexOf(needle) >= 0;
  }

  // Função para mesclar objetos personalizados com objetos padrão
  function extend(custom, defaults) {
    for (var key in defaults) {
      if (custom[key] == null) {
        var value = defaults[key];
        custom[key] = value;
      }
    }
    return custom;
  }

  // Função para verificar se o agente do usuário é um dispositivo móvel
  function isMobile(agent) {
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(agent)
    );
  }

  // Função para criar um evento personalizado
  function createEvent(event) {
    var bubble = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
    var cancel = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
    var detail = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

    var customEvent = void 0;
    if (document.createEvent != null) {
      // DOM W3C
      customEvent = document.createEvent('CustomEvent');
      customEvent.initCustomEvent(event, bubble, cancel, detail);
    } else if (document.createEventObject != null) {
      // DOM IE < 9
      customEvent = document.createEventObject();
      customEvent.eventType = event;
    } else {
      // Outros navegadores
      customEvent.eventName = event;
    }

    return customEvent;
  }

  // Função para emitir um evento
  function emitEvent(elem, event) {
    if (elem.dispatchEvent != null) {
      // DOM W3C
      elem.dispatchEvent(event);
    } else if (event in (elem != null)) {
      elem[event]();
    } else if ('on' + event in (elem != null)) {
      elem['on' + event]();
    }
  }

  // Função para adicionar um ouvinte de evento
  function addEvent(elem, event, fn) {
    if (elem.addEventListener != null) {
      // DOM W3C
      elem.addEventListener(event, fn, false);
    } else if (elem.attachEvent != null) {
      // DOM IE
      elem.attachEvent('on' + event, fn);
    } else {
      // Fallback
      elem[event] = fn;
    }
  }

  // Função para remover um ouvinte de evento
  function removeEvent(elem, event, fn) {
    if (elem.removeEventListener != null) {
      // DOM W3C
      elem.removeEventListener(event, fn, false);
    } else if (elem.detachEvent != null) {
      // DOM IE
      elem.detachEvent('on' + event, fn);
    } else {
      // Fallback
      delete elem[event];
    }
  }

  // Função para obter a altura interna da janela
  function getInnerHeight() {
    if ('innerHeight' in window) {
      return window.innerHeight;
    }

    return document.documentElement.clientHeight;
  }

  // Shim WeakMap mínimo, apenas por precaução
  var WeakMap = window.WeakMap || window.MozWeakMap || function () {
    function WeakMap() {
      _classCallCheck(this, WeakMap);

      this.keys = [];
      this.values = [];
    }

    _createClass(WeakMap, [{
      key: 'get',
      value: function get(key) {
        for (var i = 0; i < this.keys.length; i++) {
          var item = this.keys[i];
          if (item === key) {
            return this.values[i];
          }
        }
        return undefined;
      }
    }, {
      key: 'set',
      value: function set(key, value) {
        for (var i = 0; i < this.keys.length; i++) {
          var item = this.keys[i];
          if (item === key) {
            this.values[i] = value;
            return this;
          }
        }
        this.keys.push(key);
        this.values.push(value);
        return this;
      }
    }]);

    return WeakMap;
  }();

  // Dummy MutationObserver, para evitar exceções
  var MutationObserver = window.MutationObserver || window.WebkitMutationObserver || window.MozMutationObserver || (_temp = _class = function () {
    function MutationObserver() {
      _classCallCheck(this, MutationObserver);

      if (typeof console !== 'undefined' && console !== null) {
        console.warn('MutationObserver is not supported by your browser.');
        console.warn('WOW.js cannot detect dom mutations, please call .sync() after loading new content.');
      }
    }

    _createClass(MutationObserver, [{
      key: 'observe',
      value: function observe() {}
    }]);

    return MutationObserver;
  }(), _class.notSupported = true, _temp);

  // Shim getComputedStyle, de http://stackoverflow.com/a/21797294
  var getComputedStyle = window.getComputedStyle || function getComputedStyle(el) {
    var getComputedStyleRX = /(\-([a-z]){1})/g;
    return {
      getPropertyValue: function getPropertyValue(prop) {
        if (prop === 'float') {
          prop = 'styleFloat';
        }
        if (getComputedStyleRX.test(prop)) {
          prop.replace(getComputedStyleRX, function (_, _char) {
            return _char.toUpperCase();
          });
        }
        var currentStyle = el.currentStyle;

        return (currentStyle != null ? currentStyle[prop] : void 0) || null;
      }
    };
  };

  // Classe WOW
  var WOW = function () {
    // Construtor
    function WOW() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      _classCallCheck(this, WOW);

      // Opções padrão
      this.defaults = {
        boxClass: 'wow',
        animateClass: 'animated',
        offset: 0,
        mobile: true,
        live: true,
        callback: null,
        scrollContainer: null,
        resetAnimation: true
      };

      // Função para obter o método de animação a ser usado
      this.animate = function animateFactory() {
        if ('requestAnimationFrame' in window) {
          return function (callback) {
            return window.requestAnimationFrame(callback);
          };
        }
        return function (callback) {
          return callback();
        };
      }();

      // Prefixos de animação
      this.vendors = ['moz', 'webkit'];

      // Vincula os métodos de instância ao objeto atual
      this.start = this.start.bind(this);
      this.resetAnimation = this.resetAnimation.bind(this);
      this.scrollHandler = this.scrollHandler.bind(this);
      this.scrollCallback = this.scrollCallback.bind(this);

      // Define a flag de rolagem como verdadeira
      this.scrolled = true;

      // Mescla as opções fornecidas com as opções padrão
      this.config = extend(options, this.defaults);

      // Se uma área de rolagem específica foi definida, obtém seu elemento DOM
      if (options.scrollContainer != null) {
        this.config.scrollContainer = document.querySelector(options.scrollContainer);
      }

      // Cria um evento personalizado para animações WOW
      this.wowEvent = createEvent(this.config.boxClass);
    }

    // Método de inicialização


    _createClass(WOW, [{
      key: 'init',
      value: function init() {
        // Obtém o elemento HTML raiz
        this.element = window.document.documentElement;

        // Verifica se o DOM já está interativo ou completo
        if (isIn(document.readyState, ['interactive', 'complete'])) {
          // Se estiver, inicia imediatamente
          this.start();
        } else {
          // Caso contrário, aguarda o evento DOMContentLoaded
          addEvent(document, 'DOMContentLoaded', this.start);
        }

        // Inicializa a lista de elementos animados
        this.finished = [];
      }
    }, {
      key: 'start',
      value: function start() {
        var _this = this;

        // Define a flag de parada como falsa
        this.stopped = false;

        // Obtém todos os elementos com a classe 'wow'
        this.boxes = [].slice.call(this.element.querySelectorAll('.' + this.config.boxClass));

        // Copia a lista de todos os elementos para uma lista de elementos 'ativos'
        this.all = this.boxes.slice(0);

        // Se houver elementos 'wow'
        if (this.boxes.length) {
          // Se as animações estiverem desabilitadas, redefine os estilos para todos os elementos
          if (this.disabled()) {
            this.resetStyle();
          } else {
            // Caso contrário, aplica os estilos iniciais aos elementos 'wow'
            for (var i = 0; i < this.boxes.length; i++) {
              var box = this.boxes[i];
              this.applyStyle(box, true);
            }
          }
        }

        // Se as animações não estiverem desabilitadas
        if (!this.disabled()) {
          // Adiciona ouvintes de eventos de rolagem e redimensionamento
          addEvent(this.config.scrollContainer || window, 'scroll', this.scrollHandler);
          addEvent(window, 'resize', this.scrollHandler);

          // Inicia um intervalo de verificação de rolagem
          this.interval = setInterval(this.scrollCallback, 50);
        }

        // Se as animações ao vivo estiverem habilitadas
        if (this.config.live) {
          // Observa mutações no DOM e sincroniza
          var mut = new MutationObserver(function (records) {
            for (var j = 0; j < records.length; j++) {
              var record = records[j];
              for (var k = 0; k < record.addedNodes.length; k++) {
                var node = record.addedNodes[k];
                _this.doSync(node);
              }
            }
            return undefined;
          });
          mut.observe(document.body, {
            childList: true,
            subtree: true
          });
        }
      }
    }, {
      key: 'stop',
      value: function stop() {
        // Define a flag de parada como verdadeira
        this.stopped = true;

        // Remove os ouvintes de eventos de rolagem e redimensionamento
        removeEvent(this.config.scrollContainer || window, 'scroll', this.scrollHandler);
        removeEvent(window, 'resize', this.scrollHandler);

        // Limpa o intervalo de verificação de rolagem, se houver
        if (this.interval != null) {
          clearInterval(this.interval);
        }
      }
    }, {
      key: 'sync',
      value: function sync() {
        // Sincroniza os elementos 'wow'
        if (MutationObserver.notSupported) {
          this.doSync(this.element);
        }
      }
    }, {
      key: 'doSync',
      value: function doSync(element) {
        // Sincroniza os elementos 'wow'
        if (typeof element === 'undefined' || element === null) {
          element = this.element;
        }
        if (element.nodeType !== 1) {
          return;
        }
        element = element.parentNode || element;
        var iterable = element.querySelectorAll('.' + this.config.boxClass);
        for (var i = 0; i < iterable.length; i++) {
          var box = iterable[i];
          if (!isIn(box, this.all)) {
            this.boxes.push(box);
            this.all.push(box);
            if (this.stopped || this.disabled()) {
              this.resetStyle();
            } else {
              this.applyStyle(box, true);
            }
            this.scrolled = true;
          }
        }
      }
    }, {
      key: 'show',
      value: function show(box) {
        // Exibe o elemento animado
        this.applyStyle(box);
        box.className = box.className + ' ' + this.config.animateClass;
        if (this.config.callback != null) {
          this.config.callback(box);
        }
        emitEvent(box, this.wowEvent);

        // Se a opção de redefinição de animação estiver ativada, adiciona ouvintes de evento de animação
        if (this.config.resetAnimation) {
          addEvent(box, 'animationend', this.resetAnimation);
          addEvent(box, 'oanimationend', this.resetAnimation);
          addEvent(box, 'webkitAnimationEnd', this.resetAnimation);
          addEvent(box, 'MSAnimationEnd', this.resetAnimation);
        }

        return box;
      }
    }, {
      key: 'applyStyle',
      value: function applyStyle(box, hidden) {
        var _this2 = this;

        var duration = box.getAttribute('data-wow-duration');
        var delay = box.getAttribute('data-wow-delay');
        var iteration = box.getAttribute('data-wow-iteration');

        return this.animate(function () {
          return _this2.customStyle(box, hidden, duration, delay, iteration);
        });
      }
    }, {
      key: 'resetStyle',
      value: function resetStyle() {
        // Redefine os estilos de todos os elementos 'wow' visíveis
        for (var i = 0; i < this.boxes.length; i++) {
          var box = this.boxes[i];
          box.style.visibility = 'visible';
        }
        return undefined;
      }
    }, {
      key: 'resetAnimation',
      value: function resetAnimation(event) {
        // Redefine a animação quando termina
        if (event.type.toLowerCase().indexOf('animationend') >= 0) {
          var target = event.target || event.srcElement;
          target.className = target.className.replace(this.config.animateClass, '').trim();
        }
      }
    }, {
      key: 'customStyle',
      value: function customStyle(box, hidden, duration, delay, iteration) {
        // Aplica estilos personalizados ao elemento 'wow'
        if (hidden) {
          this.cacheAnimationName(box);
        }
        box.style.visibility = hidden ? 'hidden' : 'visible';

        if (duration) {
          this.vendorSet(box.style, { animationDuration: duration });
        }
        if (delay) {
          this.vendorSet(box.style, { animationDelay: delay });
        }
        if (iteration) {
          this.vendorSet(box.style, { animationIterationCount: iteration });
        }
        this.vendorSet(box.style, { animationName: hidden ? 'none' : this.cachedAnimationName(box) });

        return box;
      }
    }, {
      key: 'vendorSet',
      value: function vendorSet(elem, properties) {
        // Define propriedades de estilo com prefixos de fornecedor
        for (var name in properties) {
          if (properties.hasOwnProperty(name)) {
            var value = properties[name];
            elem['' + name] = value;
            for (var i = 0; i < this.vendors.length; i++) {
              var vendor = this.vendors[i];
              elem['' + vendor + name.charAt(0).toUpperCase() + name.substr(1)] = value;
            }
          }
        }
      }
    }, {
      key: 'vendorCSS',
      value: function vendorCSS(elem, property) {
        // Obtém propriedades de estilo com prefixos de fornecedor
        var style = getComputedStyle(elem);
        var result = style.getPropertyCSSValue(property);
        for (var i = 0; i < this.vendors.length; i++) {
          var vendor = this.vendors[i];
          result = result || style.getPropertyCSSValue('-' + vendor + '-' + property);
        }
        return result;
      }
    }, {
      key: 'animationName',
      value: function animationName(box) {
        // Obtém o nome da animação aplicada ao elemento
        var aName = void 0;
        try {
          aName = this.vendorCSS(box, 'animation-name').cssText;
        } catch (error) {
          // Opera, usa o valor da propriedade simples
          aName = getComputedStyle(box).getPropertyValue('animation-name');
        }

        if (aName === 'none') {
          return ''; // SVG/Firefox, incapaz de obter o nome da animação?
        }

        return aName;
      }
    }, {
      key: 'cacheAnimationName',
      value: function cacheAnimationName(box) {
        // Cache para o nome da animação
        return this.animationNameCache.set(box, this.animationName(box));
      }
    }, {
      key: 'cachedAnimationName',
      value: function cachedAnimationName(box) {
        // Obtém o nome da animação do cache
        return this.animationNameCache.get(box);
      }
    }, {
      key: 'scrollHandler',
      value: function scrollHandler() {
        // Manipulador de evento de rolagem
        this.scrolled = true;
      }
    }, {
      key: 'scrollCallback',
      value: function scrollCallback() {
        // Callback de rolagem
        if (this.scrolled) {
          this.scrolled = false;
          var results = [];
          for (var i = 0; i < this.boxes.length; i++) {
            var box = this.boxes[i];
            if (box) {
              if (this.isVisible(box)) {
                this.show(box);
                continue;
              }
              results.push(box);
            }
          }
          this.boxes = results;
          if (!this.boxes.length && !this.config.live) {
            this.stop();
          }
        }
      }
    }, {
      key: 'offsetTop',
      value: function offsetTop(element) {
        // Obtém a posição superior de um elemento
        while (element.offsetTop === undefined) {
          element = element.parentNode;
        }
        var top = element.offsetTop;
        while (element.offsetParent) {
          element = element.offsetParent;
          top += element.offsetTop;
        }
        return top;
      }
    }, {
      key: 'isVisible',
      value: function isVisible(box) {
        // Verifica se o elemento está visível na janela de visualização
        var offset = box.getAttribute('data-wow-offset') || this.config.offset;
        var viewTop = this.config.scrollContainer && this.config.scrollContainer.scrollTop || window.pageYOffset;
        var viewBottom = viewTop + Math.min(this.element.clientHeight, getInnerHeight()) - offset;
        var top = this.offsetTop(box);
        var bottom = top + box.clientHeight;

        return top <= viewBottom && bottom >= viewTop;
      }
    }, {
      key: 'disabled',
      value: function disabled() {
        // Verifica se as animações estão desabilitadas
        return !this.config.mobile && isMobile(navigator.userAgent);
      }
    }]);

    return WOW;
  }();

  // Exporta a classe WOW
  exports.default = WOW;
  module.exports = exports['default'];
});
