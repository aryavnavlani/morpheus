document.addEventListener(
    "DOMContentLoaded",
    () => {

        const eventsSection =
            document.getElementById(
                "featuredEventsGrid"
            );

        if (
            !eventsSection ||
            typeof window.PUBLIC_EVENTS
                === "undefined"
        ) {
            return;
        }

        const events =
            window.PUBLIC_EVENTS;

        let activeIndex = 0;

        let autoRotateTimer = null;


        function escapeHTML(value) {

            return String(value ?? "")
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")
                .replaceAll('"', "&quot;")
                .replaceAll("'", "&#039;");
        }


        function getEventNumber(index) {

            return String(index + 1)
                .padStart(2, "0");
        }


        function getRelativePosition(index) {

            const total = events.length;

            let difference =
                index - activeIndex;

            if (
                difference >
                total / 2
            ) {
                difference -= total;
            }

            if (
                difference <
                -total / 2
            ) {
                difference += total;
            }

            return difference;
        }


        function buildCarousel() {

            eventsSection.innerHTML = `
                <div class="featured-carousel">

                    <button
                        type="button"
                        class="featured-carousel-arrow featured-carousel-prev"
                        aria-label="Previous event"
                    >
                        ←
                    </button>

                    <div
                        class="featured-carousel-track"
                        id="featuredCarouselTrack"
                    ></div>

                    <button
                        type="button"
                        class="featured-carousel-arrow featured-carousel-next"
                        aria-label="Next event"
                    >
                        →
                    </button>

                </div>

                <div
                    class="featured-carousel-dots"
                    id="featuredCarouselDots"
                ></div>
            `;


            const track =
                document.getElementById(
                    "featuredCarouselTrack"
                );

            const dots =
                document.getElementById(
                    "featuredCarouselDots"
                );


            events.forEach(
                (event, index) => {

                    const card =
                        document.createElement(
                            "a"
                        );

                    card.href =
                        `events.html#${encodeURIComponent(
                            event.id
                        )}`;

                    card.className =
                        "featured-event-card";

                    card.dataset.index =
                        index;

                    card.innerHTML = `
                        <div class="featured-event-visual">

                            <div class="featured-orbit orbit-one"></div>

                            <div class="featured-orbit orbit-two"></div>

                            <div class="featured-orbit orbit-three"></div>

                            <div class="featured-energy-core"></div>

                            <div class="featured-event-number">
                                ${getEventNumber(index)}
                            </div>

                            <span class="featured-event-type">
                                ${escapeHTML(
                                    event.type
                                )}
                            </span>

                        </div>

                        <div class="featured-event-content">

                            <p>
                                ${escapeHTML(
                                    event.category
                                )}
                            </p>

                            <h3>
                                ${escapeHTML(
                                    event.title
                                )}
                            </h3>

                            <div class="featured-event-summary">
                                ${escapeHTML(
                                    event.summary
                                )}
                            </div>

                            <span>
                                Explore Event →
                            </span>

                        </div>
                    `;

                    track.appendChild(card);


                    const dot =
                        document.createElement(
                            "button"
                        );

                    dot.type = "button";

                    dot.className =
                        "featured-carousel-dot";

                    dot.setAttribute(
                        "aria-label",
                        `Go to ${event.title}`
                    );

                    dot.addEventListener(
                        "click",
                        () => {

                            activeIndex = index;

                            updateCarousel();

                            restartAutoRotation();
                        }
                    );

                    dots.appendChild(dot);
                }
            );


            document
                .querySelector(
                    ".featured-carousel-prev"
                )
                .addEventListener(
                    "click",
                    previousEvent
                );


            document
                .querySelector(
                    ".featured-carousel-next"
                )
                .addEventListener(
                    "click",
                    nextEvent
                );


            addSwipeSupport(track);

            updateCarousel();

            startAutoRotation();
        }


        function updateCarousel() {

            const cards =
                document.querySelectorAll(
                    ".featured-event-card"
                );

            const dots =
                document.querySelectorAll(
                    ".featured-carousel-dot"
                );


            cards.forEach(
                (card, index) => {

                    const relativePosition =
                        getRelativePosition(
                            index
                        );

                    card.classList.remove(
                        "active",
                        "previous",
                        "next",
                        "far",
                        "hidden-card"
                    );


                    if (
                        relativePosition === 0
                    ) {

                        card.classList.add(
                            "active"
                        );

                        card.style.setProperty(
                            "--card-position",
                            "0"
                        );

                    } else if (
                        relativePosition === -1
                    ) {

                        card.classList.add(
                            "previous"
                        );

                        card.style.setProperty(
                            "--card-position",
                            "-1"
                        );

                    } else if (
                        relativePosition === 1
                    ) {

                        card.classList.add(
                            "next"
                        );

                        card.style.setProperty(
                            "--card-position",
                            "1"
                        );

                    } else {

                        card.classList.add(
                            "far"
                        );

                        card.style.setProperty(
                            "--card-position",
                            relativePosition
                        );
                    }
                }
            );


            dots.forEach(
                (dot, index) => {

                    dot.classList.toggle(
                        "active",
                        index === activeIndex
                    );
                }
            );
        }


        function nextEvent() {

            activeIndex =
                (
                    activeIndex + 1
                )
                %
                events.length;

            updateCarousel();

            restartAutoRotation();
        }


        function previousEvent() {

            activeIndex =
                (
                    activeIndex -
                    1 +
                    events.length
                )
                %
                events.length;

            updateCarousel();

            restartAutoRotation();
        }


        function startAutoRotation() {

            stopAutoRotation();

            autoRotateTimer =
                window.setInterval(
                    () => {

                        activeIndex =
                            (
                                activeIndex + 1
                            )
                            %
                            events.length;

                        updateCarousel();

                    },
                    6000
                );
        }


        function stopAutoRotation() {

            if (autoRotateTimer) {

                window.clearInterval(
                    autoRotateTimer
                );

                autoRotateTimer = null;
            }
        }


        function restartAutoRotation() {

            startAutoRotation();
        }


        function addSwipeSupport(track) {

            let touchStartX = 0;

            let touchEndX = 0;


            track.addEventListener(
                "touchstart",
                event => {

                    touchStartX =
                        event.changedTouches[0]
                            .screenX;
                },
                {
                    passive: true
                }
            );


            track.addEventListener(
                "touchend",
                event => {

                    touchEndX =
                        event.changedTouches[0]
                            .screenX;

                    const swipeDistance =
                        touchEndX -
                        touchStartX;

                    if (
                        Math.abs(
                            swipeDistance
                        ) < 45
                    ) { 
                        return;
                    }

                    if (
                        swipeDistance < 0
                    ) {

                        nextEvent();

                    } else {

                        previousEvent();
                    }
                },
                {
                    passive: true
                }
            );


            track.addEventListener(
                "mouseenter",
                stopAutoRotation
            );


            track.addEventListener(
                "mouseleave",
                startAutoRotation
            );
        }


        buildCarousel();
    }
);