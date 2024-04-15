(function ($) {
    "use strict";
// Função Spinner: remove a classe 'show' do elemento com ID 'spinner' após 1 milissegundo
var spinner = function () {
    setTimeout(function () {
        if ($('#spinner').length > 0) {
            $('#spinner').removeClass('show');
        }
    }, 1);
};
spinner();


// Inicia a biblioteca wow.js
new WOW().init();


// Sticky Navbar: adiciona a classe 'shadow-sm' e define a propriedade 'top' para '0px' quando a rolagem ultrapassa 300 pixels. Caso contrário, remove a classe 'shadow-sm' e define a propriedade 'top' para '-100px'.
$(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
        $('.sticky-top').addClass('shadow-sm').css('top', '0px');
    } else {
        $('.sticky-top').removeClass('shadow-sm').css('top', '-100px');
    }
});


// Back to top button: exibe o botão com um efeito de fade quando a rolagem ultrapassa 300 pixels. Caso contrário, oculta o botão com um efeito de fade. Quando o botão é clicado, a página é rolada suavemente até o topo.
$(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
        $('.back-to-top').fadeIn('slow');
    } else {
        $('.back-to-top').fadeOut('slow');
    }
});
$('.back-to-to').click(function () {
    $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
    return false;
});


// Testimonials carousel: inicializa um carrossel de depoimentos usando a biblioteca Owl Carousel. As opções configuradas incluem autoplay: true, smartSpeed: 1000, loop: true, nav: false, dots: true, items: 1, e dotsData: true.
$('.testimonial-carousel').owlCarousel({
    autoplay: true,
    smartSpeed: 1000,
    loop: true,
    nav: false,
    dots: true,
    items: 1,
    dotsData: true,
});
    
})(jQuery);

