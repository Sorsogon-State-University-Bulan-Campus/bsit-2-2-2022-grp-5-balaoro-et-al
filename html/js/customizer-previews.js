/**
 * Theme Customizer enhancements for a better user experience.
 * Contains handlers to make Theme Customizer preview reload changes asynchronously.
 */

( function( $ ) {
	$('#mastmenu .menu-item > a,#primary-menu-right .menu-item > a,#primary-menu-left .menu-item > a').click(function() {
		$('body').removeClass('site-navigation-active');
		$('.main-navigation.active').removeClass('active');
		$('.menu-toggle.active').removeClass('active');
	});	
	
	$('.nav-tabs.visible-mobile li a').click(function() {
		$('.nav-tabs.visible-mobile li a').removeClass('active');
		$('.nav-tabs.visible-mobile li .tab-pane').removeClass('show active');
		$(this).addClass('active');
		$(this).next('.tab-pane').addClass('show active');
	});


	$('.gallery-images').slickLightbox({
		itemSelector        : 'a',
		navigateByKeyboard  : true
	});
	
  // Loadmore menu item
  var numberMenu = parseInt($('.menu-section .menu-load-container .btn-loadmore').attr('data-number-item'));
  var numberTotal = parseInt($('.menu-section .menu-load-container .btn-loadmore').attr('data-total-item'));
  $('.menu-section .menu-load-container .btn-loadmore').click(function(){
      numberMenu = numberMenu + parseInt($(this).attr('data-item-load'));
      if(numberTotal<=numberMenu){
        $(this).fadeOut();
      }else{
        $('.section-list-menu .menu-entry-col:lt('+numberMenu+')').removeClass('hide');
      }
      return false;
  });

  


  var chefsPostNum=$('.chefs-grid').attr('data-post-num');
  $('.chefs-grid').owlCarousel({
      loop: true,
      nav:true,
      dots:false,
      items:chefsPostNum,
      navContainer:'.section-content-chefs .chefs-nav',
      responsive:{
          0:{
              items:1
          },
          768:{
              items:3
          },
		  1024:{
              items:4
          },
          1400:{
              items:chefsPostNum
          }
      }
  });

    $('.articles-slider').slick({
        infinite: true,
        arrows: true,
        slidesToShow: 3,
		prevArrow: $('.articles-slider-prev'),
		nextArrow: $('.articles-slider-next'),
        responsive: [
            {
              breakpoint: 992,
              settings: {
                slidesToShow: 2
              }
            },
            {
              breakpoint: 768,
              settings: {
                slidesToShow:1
              }
            },
            {
              breakpoint: 480,
              settings: {
                slidesToShow: 1
              }
            }
        ],
        slidesToScroll: 1
    });
    $('.project-slider').slick({
        infinite: true,
        arrows: true,
        slidesToShow: 2,
		prevArrow: $('.project-slider-prev'),
		nextArrow: $('.project-slider-next'),
        responsive: [
            {
              breakpoint: 992,
              settings: {
                slidesToShow: 2
              }
            },
            {
              breakpoint: 768,
              settings: {
                slidesToShow:1
              }
            },
            {
              breakpoint: 480,
              settings: {
                slidesToShow: 1
              }
            }
        ],
        slidesToScroll: 1
    }); 
  //   $('.testimonial-slider').slick({
  //       infinite: true,
  //       arrows: true,
  //       slidesToShow: 2,
		// prevArrow: $('.testimonial-slider-prev'),
		// nextArrow: $('.testimonial-slider-next'),
  //       responsive: [
  //           {
  //             breakpoint: 992,
  //             settings: {
  //               slidesToShow: 2
  //             }
  //           },
  //           {
  //             breakpoint: 768,
  //             settings: {
  //               slidesToShow:1
  //             }
  //           },
  //           {
  //             breakpoint: 480,
  //             settings: {
  //               slidesToShow: 1
  //             }
  //           }
  //       ],
  //       slidesToScroll: 1
  //   }); 
	$('.experienced-slider').slick({
        infinite: true,
        dots: true,
        slidesToShow: 2,
        responsive: [
            {
              breakpoint: 992,
              settings: {
                slidesToShow: 1
              }
            },
            {
              breakpoint: 767,
              settings: {
                slidesToShow: 1
              }
            },
            {
              breakpoint: 480,
              settings: {
                slidesToShow: 1
              }
            }
        ],
        slidesToScroll: 1
    }); 
    $("a[href^='#']").click(function(e) {
        e.preventDefault();
        
        var position = $($(this).attr("href")).offset().top;

        $("body, html").animate({
            scrollTop: position
        }, 1500 );
    });
	
	
    $('.section-video .play-button').click(function(e) {
		e.preventDefault();
        $(this).next('.bkg-img').toggleClass('hidden');
		$("#team-video")[0].src += "?autoplay=1";
		$(this).hide();
        $('#team-video').toggleClass('open');
    });
    $('#team-video').click(function(e) {
		e.preventDefault();
        $(this).next('.bkg-img').toggleClass('hidden');
		$("#team-video")[0].src += "?autoplay=0";
        $('#team-video').toggleClass('open');
    });
} )( jQuery );
