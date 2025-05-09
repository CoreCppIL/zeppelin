(function($) {
    $(document).ready(function() {
        $(window).load(function() {
            $('#st-container').removeClass('disable-scrolling');
            $('#loading-animation').fadeOut();
            $('#preloader').delay(350).fadeOut(800);
            initGooglePlus();
            equalheight('.same-height');
        });

        if ($(window).width() > 1500) {
            $('.effect-wrapper').addClass('col-lg-3');
        }
        if ($(window).width() < 768) {
            $('.animated').removeClass('animated').removeClass('hiding');
            $('.stat span').removeClass('timer');
            $('.timeslot-label').addClass('stick-label');
        }
        if ($(window).height() < 512) {
            $('#bottom-navlinks').removeClass('bottom-navlinks').addClass('bottom-navlinks-small');
        }
        if ($(window).scrollTop() >= 100) {
            $('#top-header').addClass('after-scroll');
            $('#logo-header .logo').removeClass('logo-light').addClass('logo-dark');
        }

        $(window).scroll(function() {
            var scroll = $(this).scrollTop();
            var header = $('#top-header');
            var logo = $('#logo-header .logo');
            var buyButton = $('.right-nav-button');
            var topOffset = header.height() + $('.track-header').height();

            if (scroll >= 100) {
                header.addClass('after-scroll');
                logo.removeClass('logo-light').addClass('logo-dark');
            } else {
                header.removeClass('after-scroll');
                logo.removeClass('logo-dark').addClass('logo-light');
            }

            if (scroll >= $('.top-section').height() && $(window).width() > 767) {
                buyButton.removeClass('right-nav-button-hidden');
            } else if (scroll < $('.top-section').height() && $(window).width() > 767){
                buyButton.addClass('right-nav-button-hidden');
            }

            $('.slot').each(function() {
                var currentPosition = $(this).offset().top - scroll;
                var offsetActivator = topOffset + $(this).find('.slot-title').height();
                if (currentPosition <= offsetActivator && currentPosition >= 0) {
                    $('.track-header.sticky').find('.slot-detail').html($(this).data('slotDetail'));
                }
            });
        });

        $(window).resize(function() {
            if ($(window).width() > 1500) {
                $('.effect-wrapper').addClass('col-lg-3');
            } else {
                $('.effect-wrapper').removeClass('col-lg-3');
            }
            if ($(window).width() < 768) {
                $('.same-height').css('height', '100%');
                $('.timeslot-label').addClass('stick-label');
            } else {
                $('.timeslot-label').removeClass('stick-label');
                if (container.hasClass('st-menu-open')) {
                    container.removeClass('st-menu-open');
                    $('body').css('overflow', 'auto');
                }
                equalheight('.same-height');
            }
            if ($(window).height() < 512) {
                $('.st-menu').addClass('scrollable');
                $('#bottom-navlinks').removeClass('bottom-navlinks').addClass('bottom-navlinks-small');
            } else {
                $('.st-menu').removeClass('scrollable');
                $('#bottom-navlinks').removeClass('bottom-navlinks-small').addClass('bottom-navlinks');
            }
        });

        $(function() {
            $('a[href*=#]:not([href=#])').click(function() {
                if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
                    var target = $(this.hash);
                    target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                    if (target.length) {
                        $('html,body').animate({
                            scrollTop: target.offset().top
                        }, 1000);
                        return false;
                    }
                }
            });
        });
        $(function() {
            $('a[href=#]').click(function() {
                event.preventDefault();
            });
        });
        $(function() {
            if(window.location.href.indexOf("schedule") > -1 && window.location.hash) {
                var hash = window.location.hash;
                $(hash).click();
            } 
        });

        $(function() {
            var appear, delay, i, offset, _i, _len, _ref;
            _ref = $(".appear-animation");
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                i = _ref[_i];
                offset = i.offsetLeft + i.offsetTop;
                delay = offset / 1000;
                $(i).css('transition-delay', '' + (delay * 0.47) + 's');
                $(i).css('transition-duration', '' + 0.2 + 's');
            }
        });
        $('.appear-animation-trigger').appear(function() {
            setTimeout(function() {
                $('.appear-animation-trigger').parent('div').find('.appear-animation').addClass('visible');
            }, 1000);
        });

        $('.animated').appear(function() {
            var element = $(this);
            var animation = element.data('animation');
            var animationDelay = element.data('delay');
            if (animationDelay) {
                setTimeout(function() {
                    element.addClass(animation + " visible");
                    element.removeClass('hiding');
                    if (element.hasClass('counter')) {
                        element.find('.timer').countTo();
                    }
                }, animationDelay);
            } else {
                element.addClass(animation + " visible");
                element.removeClass('hiding');
                if (element.hasClass('counter')) {
                    element.find('.timer').countTo();
                }
            }
        }, {
            accY: -150
        });

        equalheight = function(container) {
            var currentTallest = 0,
                currentRowStart = 0,
                rowDivs = new Array(),
                $el,
                topPosition = 0;
            $(container).each(function() {
                $el = $(this);
                $($el).height('auto')
                topPostion = $el.position().top;
                if (currentRowStart != topPostion) {
                    for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) {
                        rowDivs[currentDiv].height(currentTallest);
                    }
                    rowDivs.length = 0; // empty the array
                    currentRowStart = topPostion;
                    currentTallest = $el.height();
                    rowDivs.push($el);
                } else {
                    rowDivs.push($el);
                    currentTallest = (currentTallest < $el.height()) ? ($el.height()) : (currentTallest);
                }
                for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) {
                    rowDivs[currentDiv].height(currentTallest);
                }
            });
        }


        //Side menu
        var container = $('.st-container');
        $('#menu-trigger').click(function(event) {
            event.stopPropagation();
            container.toggleClass('st-menu-open');
        });
        $('.st-pusher').click(function() {
            if (container.hasClass('st-menu-open')) {
                container.removeClass('st-menu-open');
            }
        });

        $('.track-header').each(function() {
            var slot = $(this).closest('.schedule-table').find('.slot').first();
            var scheduleFirstSlotText;
            while (scheduleFirstSlotText === undefined) {
                scheduleFirstSlotText = slot.data('slotDetail');
                slot = slot.next();
            }
            $(this).find('.slot-detail').html(scheduleFirstSlotText);
        });

        $('#post-section .post-body p').each(function() {
            if ($(this).find('.feature-image').length) {
                var url = $(this).find('.feature-image').prop('src');
                $('#top-section').css('background-image', 'url(' + url + ')').addClass('enable-overlay');
            }
        });

        $('.slider').each(function() {
            $(this).find('.slider-item').first().addClass('slider-current-item').removeClass('hidden');
            if ($(this).find('.slider-item').length > 1) {
                $(this).closest('.speaker-item').find('.slider-next-item').removeClass('hidden');
            }
        });
        $('.slider-next-item').click(function() {
            var slider = $(this).closest('div');
            var elem = slider.find('.slider-current-item').next();
            if (elem.length) {
                elem.addClass('slider-current-item').removeClass('hidden');
                slider.find('.slider-current-item').first().removeClass('slider-current-item').addClass('hidden');
            } else {
                slider.find('.slider-item').first().addClass('slider-current-item').removeClass('hidden');
                slider.find('.slider-current-item').last().removeClass('slider-current-item').addClass('hidden');
            }
        });
        $('.modal').on('hidden.bs.modal', function () {
            var iframe = $(this).find('iframe');
            iframe.attr('src', iframe.attr('src'));
        });
        $('.slot').click(function() {
            location.hash = $(this).attr('id');
        });


        if (typeof twitterFeedUrl !== 'undefined') {
            $.getJSON(twitterFeedUrl, function(data) {
                $.each(data, function(i, gist) {
                    var tweetElement = '<div class="tweet animated fadeInUp hidden"><p class="tweet-text">' + linkify(gist.text) + '</p><p class="tweet-meta">by <a href="https://twitter.com/' + gist.user.screen_name + '" target="_blank">@' + gist.user.screen_name + '</a></p></div>';
                    $('#tweets').append(tweetElement);
                });
                animateTweets();
            });

            function linkify(inputText) {
                var replacedText, links1, links2, hashtags, profileLinks;
                links1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
                replacedText = inputText.replace(links1, '<a href="$1" target="_blank">$1</a>');
                links2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
                replacedText = replacedText.replace(links2, '$1<a href="http://$2" target="_blank">$2</a>');
                hashtags = /#(\S*)/g;
                replacedText = replacedText.replace(hashtags, '<a href="https://twitter.com/search?q=%23$1" target="_blank">#$1</a>');
                profileLinks = /\B@([\w-]+)/gm;
                replacedText = replacedText.replace(profileLinks, '<a href="https://twitter.com/$1" target="_blank">@$1</a>');
                return replacedText;
            }

            function animateTweets() {
                var $tweets = $('#tweets').find('.tweet'),
                    i = 0;
                $($tweets.get(0)).removeClass('hidden');
                function changeTweets() {
                    var next = (++i % $tweets.length);
                    $($tweets.get(next - 1)).addClass('hidden');
                    $($tweets.get(next)).removeClass('hidden');
                }
                var interval = setInterval(changeTweets, 5000);
            }
        }
    });

    //Google plus
    function initGooglePlus() {
        var po = document.createElement('script');
        po.type = 'text/javascript';
        po.async = true;
        po.src = 'https://apis.google.com/js/platform.js';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(po, s);
    }

    // Static map
    if (typeof staticGoogleMaps !== "undefined") {
        $('#canvas-map').addClass('image-section').css('background-image', 'url(https://maps.googleapis.com/maps/api/staticmap?zoom=17&center=' + mobileCenterMapCoordinates + '&size=' + $(window).width() + 'x700&scale=2&language=en&markers=icon:' + icon + '|' + eventPlaceCoordinates + '&maptype=roadmap&style=visibility:on|lightness:40|gamma:1.1|weight:0.9&style=element:labels|visibility:off&style=feature:water|hue:0x0066ff&style=feature:road|visibility:on&style=feature:road|element:labels|saturation:-30)');
    }

    //Google maps
    if (typeof googleMaps !== "undefined") {
        var map,
            directionsDisplay,
            geocoder,
            polyline,
            directionsService, // Declare here, initialize inside event listener
            markersArray = [];

        var MY_MAPTYPE_ID = 'custom_style'; // Re-added this variable

        // Listen for our custom event that signals Google Maps API is loaded
        document.addEventListener('google-maps-loaded', initialize);

        function initialize() {
            // Initialize these now that we know google.maps is available
            directionsService = new google.maps.DirectionsService();
            directionsDisplay = new google.maps.DirectionsRenderer({
                suppressMarkers: true
            });
            geocoder = new google.maps.Geocoder();
            polyline = new google.maps.Polyline({
                strokeColor: '#03a9f4',
                strokeOpacity: 1.0,
                strokeWeight: 2
            });

            var mapOptions = {
                zoom: 17,
                minZoom: 2,
                scrollwheel: false,
                panControl: false,
                draggable: true,
                zoomControl: false,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_TOP
                },
                scaleControl: false,
                mapTypeControl: false,
                streetViewControl: false,
                center: centerMap, // Initial center, might be updated
                mapTypeControlOptions: {
                    mapTypeIds: [google.maps.MapTypeId.ROADMAP, MY_MAPTYPE_ID]
                },
                mapTypeId: MY_MAPTYPE_ID
            };

            if ($(window).width() < 768) {
                mapOptions.center = mobileCenterMap;
            }
            if (googleMaps == 'logistics') {
                mapOptions.zoom = 5;
                mapOptions.zoomControl = true;
            }

            map = new google.maps.Map(document.getElementById('canvas-map'), mapOptions);
            
            var customMapStyle = [{
                stylers: [{
                    lightness: 40
                }, {
                    visibility: 'on'
                }, {
                    gamma: 0.90
                }, {
                    weight: 0.4
                }]
            }, {
                elementType: 'labels',
                stylers: [{
                    visibility: 'on' // Changed from off to on for default labels if desired, or keep off
                }]
            }, {
                featureType: 'water',
                stylers: [{
                    color: '#5dc7ff'
                }]
            }, {
                featureType: 'road',
                stylers: [{
                    visibility: 'off' // Roads initially off for the 'custom_style' (default view)
                }]
            }];

            var zoomedMapStyle = [{
                stylers: [{
                    lightness: 40
                }, {
                    visibility: 'on'
                }, {
                    gamma: 1.1
                }, {
                    weight: 0.9
                }]
            }, {
                elementType: 'labels',
                stylers: [{
                    visibility: 'off' // Labels off for the 'zoomed' (directions) view
                }]
            }, {
                featureType: 'water',
                stylers: [{
                    color: '#5dc7ff' // Consistent water color
                }]
            }, {
                featureType: 'road',
                stylers: [{
                    visibility: 'on' // Roads on for the 'zoomed' (directions) view
                }]
            }, {
                featureType: 'road',
                elementType: 'labels',
                stylers: [{
                    saturation: -30
                }]
            }];


            var styledMap = new google.maps.StyledMapType(customMapStyle, {
                name: 'Custom Style' // This name is not strictly necessary if mapTypeControl is false
            });
            var zoomedStyledMap = new google.maps.StyledMapType(zoomedMapStyle, {
                name: 'Zoomed Style' // Likewise
            });

            map.mapTypes.set(MY_MAPTYPE_ID, styledMap);
            map.mapTypes.set('zoomed_style', zoomedStyledMap); // Use a different ID for the zoomed style

            // Set initial marker
            addMarker(eventPlace); // Use addMarker to create and track the initial marker

            if (googleMaps == 'logistics') {
                map.setMapTypeId(MY_MAPTYPE_ID); // Default to custom style for logistics
                var input = document.getElementById('location-input');
                var autocomplete = new google.maps.places.Autocomplete(input);
                google.maps.event.addListener(autocomplete, 'place_changed', function() {
                    // marker.setVisible(false); // The initial marker is managed by addMarker/deleteMarkers
                    deleteMarkers(); // Clear previous markers before adding new ones
                    var place = autocomplete.getPlace();
                    if (!place.geometry) {
                        return;
                    }
                    var address = '';
                    if (place.address_components) {
                        address = [
                            (place.address_components[0] && place.address_components[0].short_name || ''), (place.address_components[1] && place.address_components[1].short_name || ''), (place.address_components[2] && place.address_components[2].short_name || '')
                        ].join(' ');
                    }
                    geocoder.geocode({
                        'address': address
                    }, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            originGlobal = results[0].geometry.location;
                            calcRoute(originGlobal, "TRANSIT");
                        } else {
                            alert("Geocode was not successful for the following reason: " + status);
                        }
                    });
                });
            } else { // For other maps (index, hackathon)
                map.setMapTypeId('zoomed_style'); // Default to zoomed style (roads visible)
            }

            $('#mode-select').change(function() {
                var selectedMode = $(this).val();
                calcRoute(originGlobal, selectedMode);
            });
            $('#direction-locate').click(calcRouteFromMyLocation);
            $('#direction-cancel').click(function() {
                $('#find-way').removeClass('location-active');
                $('#location-input').val("");
                $('#find-flight').addClass('hidden');
                deleteMarkers();
                directionsDisplay.setMap(null);
                polyline.setMap(null);
                // map.setMapTypeId(MY_MAPTYPE_ID); // Revert to the initial style for the page type
                 if (googleMaps == 'logistics') {
                    map.setMapTypeId(MY_MAPTYPE_ID);
                } else {
                    map.setMapTypeId('zoomed_style');
                }
                map.panTo(eventPlace);
                if ($(window).width() < 768) {
                    map.setCenter(mobileCenterMap);
                } else {
                    map.setCenter(centerMap);
                }
                addMarker(eventPlace); // Re-add the main event place marker
                smoothZoom(5); // Or appropriate zoom level
                $('#find-way h3').removeClass('fadeOutDown').addClass('fadeInUp');
            });

            if (typeof autoDirectionEnabled !== 'undefined' && autoDirectionEnabled == true) {
                calcRouteFromMyLocation();
            }
        } // End initialize function

        var originGlobal; // To store origin from geolocation or autocomplete for calcRoute

        function calcRoute(origin, selectedMode) {
            if (!origin) return; // Don't calculate if origin is not set
            originGlobal = origin; // Store for re-calculation on mode change
            var request = {
                origin: origin,
                destination: eventPlace,
                travelMode: google.maps.TravelMode[selectedMode.toUpperCase()]
            };
            directionsService.route(request, function(response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    map.setMapTypeId('zoomed_style'); // Switch to a style that shows roads
                    directionsDisplay.setMap(map);
                    directionsDisplay.setDirections(response);
                    var leg = response.routes[0].legs[0];
                    addMarker(leg.start_location); // Add marker for start
                    addMarker(leg.end_location);   // Add marker for end (eventPlace is already marked by initial addMarker)
                    $('#distance').text(leg.distance.text);
                    $('#estimateTime').text(leg.duration.text);
                    $('#mode-select').val(selectedMode);
                    $('#mode').removeClass('hidden');
                    var modeIcon = $('#mode-icon use').attr('xlink:href');
                    modeIcon = modeIcon.substring(0, modeIcon.indexOf('#') + 1) + 'icon-' + selectedMode.toLowerCase();
                    $('#mode-icon use').attr('xlink:href', modeIcon);
                } else {
                    if (selectedMode.toUpperCase() !== "DRIVING") { // Fallback to driving if current mode fails
                        calcRoute(origin, "DRIVING");
                    } else { // If driving also fails
                        polyline.getPath().push(origin);
                        polyline.getPath().push(eventPlace);
                        addMarker(origin); // Mark origin
                        // eventPlace marker is already there
                        var bounds = new google.maps.LatLngBounds();
                        bounds.extend(origin);
                        bounds.extend(eventPlace);
                        map.fitBounds(bounds);
                        polyline.setMap(map);
                        var distance = Math.round(google.maps.geometry.spherical.computeDistanceBetween(origin, eventPlace) / 1000);
                        $('#distance').text(distance + " km");
                        $('#estimateTime').text("");
                        $('#find-flight').removeClass('hidden');
                        $('#mode').addClass('hidden');
                    }
                }
            });
            setDirectionInput(origin);
            $('#find-way').addClass('location-active');
            $('#find-way h3').removeClass('fadeInUp').addClass('fadeOutDown');
        }

        function calcRouteFromMyLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var myLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    calcRoute(myLocation, "TRANSIT"); // Default to transit
                });
            }
        }

        function addMarker(location) {
            var marker = new google.maps.Marker({
                position: location,
                map: map,
                icon: icon // Ensure 'icon' is globally available from default.html or defined here
            });
            markersArray.push(marker);
        }

        function deleteMarkers() {
            for (var i = 0; i < markersArray.length; i++) {
                markersArray[i].setMap(null);
            }
            markersArray = [];
        }

        function smoothZoom(level) {
            var currentZoom = map.getZoom();
            var step = (level > currentZoom) ? 1 : -1;
            var diff = Math.abs(level - currentZoom);
            for (var i = 0; i < diff; i++) {
                setTimeout(function() {
                    currentZoom += step;
                    map.setZoom(currentZoom);
                }, 50 * (i + 1));
            }
        }

        function setDirectionInput(origin) {
            geocoder.geocode({
                'latLng': origin
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                        $.each(results[1].address_components, function(i, component) {
                            if (component.types[0] == "locality") {
                                $('#result-name').text(component.long_name);
                                return false;
                            }
                        });
                    }
                }
            });
        }
    } // End of "if (typeof googleMaps !== 'undefined')"

})(jQuery);
