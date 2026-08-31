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


        function initialiseCardStarfield(card) {

    const canvas =
        card.querySelector(
            ".featured-star-canvas"
        );

    const visual =
        card.querySelector(
            ".featured-event-visual"
        );

    if (!canvas || !visual) {
        return;
    }

    const context =
        canvas.getContext("2d");

    if (!context) {
        return;
    }


    const stars = [];
    const shootingStars = [];

    let width = 0;
    let height = 0;

    let targetX = 0.5;
    let targetY = 0.5;

    let currentX = 0.5;
    let currentY = 0.5;

    let isHovered = false;

    let animationFrame = null;
    let shootingStarTimer = null;


    function resizeCanvas() {

        width = visual.clientWidth;
        height = visual.clientHeight;

        const pixelRatio =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );

        canvas.width =
            Math.round(
                width * pixelRatio
            );

        canvas.height =
            Math.round(
                height * pixelRatio
            );

        canvas.style.width =
            `${width}px`;

        canvas.style.height =
            `${height}px`;

        context.setTransform(
            pixelRatio,
            0,
            0,
            pixelRatio,
            0,
            0
        );

        createStars();

        drawScene();
    }


    function createStars() {

        stars.length = 0;

        const starCount =
            window.innerWidth <= 700
                ? 18
                : 26;

        for (
            let index = 0;
            index < starCount;
            index++
        ) {

            stars.push({
                x:
                    Math.random() *
                    width,

                y:
                    Math.random() *
                    height,

                size:
                    Math.random() *
                    1.4 +
                    0.4,

                brightness:
                    Math.random() *
                    0.45 +
                    0.35,

                depth:
                    Math.random() *
                    0.9 +
                    0.1
            });
        }
    }


    function createShootingStar() {

        if (
            !card.classList.contains(
                "active"
            )
        ) {
            return;
        }

        const startsFromTop =
            Math.random() > 0.35;

        let startX;
        let startY;

        if (startsFromTop) {

            startX =
                Math.random() *
                width *
                0.82;

            startY = -20;

        } else {

            startX = -35;

            startY =
                Math.random() *
                height *
                0.55;
        }


        const speed =
            Math.random() *
            2.5 +
            4.5;

        const angle =
            (
                Math.random() *
                10 +
                28
            )
            *
            Math.PI /
            180;


        shootingStars.push({
            x: startX,
            y: startY,

            velocityX:
                Math.cos(angle) *
                speed,

            velocityY:
                Math.sin(angle) *
                speed,

            length:
                Math.random() *
                55 +
                55,

            lineWidth:
                Math.random() *
                0.8 +
                0.7,

            opacity:
                Math.random() *
                0.25 +
                0.7,

            age: 0,

            maximumAge:
                Math.random() *
                30 +
                70
        });

        requestStarAnimation();
    }


    function startShootingStars() {

        stopShootingStars();

        if (
            !isHovered ||
            !card.classList.contains(
                "active"
            )
        ) {
            return;
        }

        createShootingStar();

        window.setTimeout(
            () => {

                if (
                    isHovered &&
                    card.classList.contains(
                        "active"
                    )
                ) {
                    createShootingStar();
                }

            },
            130
        );


        shootingStarTimer =
            window.setInterval(
                () => {

                    if (
                        !isHovered ||
                        !card.classList.contains(
                            "active"
                        )
                    ) {
                        stopShootingStars();
                        return;
                    }

                    createShootingStar();

                    if (
                        Math.random() >
                        0.58
                    ) {

                        window.setTimeout(
                            () => {

                                if (
                                    isHovered &&
                                    card.classList.contains(
                                        "active"
                                    )
                                ) {
                                    createShootingStar();
                                }

                            },
                            Math.random() *
                            150 +
                            70
                        );
                    }

                },
                430
            );
    }


    function stopShootingStars() {

        if (
            shootingStarTimer !==
            null
        ) {

            window.clearInterval(
                shootingStarTimer
            );

            shootingStarTimer = null;
        }
    }


    function clearCanvas() {

        context.save();

        context.setTransform(
            1,
            0,
            0,
            1,
            0,
            0
        );

        context.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        context.restore();
    }


    function drawBackgroundStars() {

        stars.forEach(star => {

            const offsetX =
                (
                    currentX -
                    0.5
                )
                *
                16
                *
                star.depth;

            const offsetY =
                (
                    currentY -
                    0.5
                )
                *
                12
                *
                star.depth;

            const alpha =
                isHovered &&
                card.classList.contains(
                    "active"
                )
                    ? Math.min(
                        star.brightness +
                        0.22,
                        1
                    )
                    : star.brightness;


            context.beginPath();

            context.fillStyle =
                `rgba(
                    220,
                    242,
                    255,
                    ${alpha}
                )`;

            context.arc(
                star.x + offsetX,
                star.y + offsetY,
                star.size,
                0,
                Math.PI * 2
            );

            context.fill();
        });
    }


    function updateShootingStars() {

        for (
            let index =
                shootingStars.length - 1;

            index >= 0;

            index--
        ) {

            const shootingStar =
                shootingStars[index];

            shootingStar.x +=
                shootingStar.velocityX;

            shootingStar.y +=
                shootingStar.velocityY;

            shootingStar.age++;


            const outsideCanvas =
                shootingStar.x >
                    width +
                    shootingStar.length
                ||
                shootingStar.y >
                    height +
                    shootingStar.length;

            const expired =
                shootingStar.age >
                shootingStar.maximumAge;


            if (
                outsideCanvas ||
                expired
            ) {

                shootingStars.splice(
                    index,
                    1
                );
            }
        }
    }


    function drawShootingStars() {

        shootingStars.forEach(
            shootingStar => {

                const speedMagnitude =
                    Math.hypot(
                        shootingStar.velocityX,
                        shootingStar.velocityY
                    );

                const directionX =
                    shootingStar.velocityX /
                    speedMagnitude;

                const directionY =
                    shootingStar.velocityY /
                    speedMagnitude;


                const tailX =
                    shootingStar.x -
                    directionX *
                    shootingStar.length;

                const tailY =
                    shootingStar.y -
                    directionY *
                    shootingStar.length;


                const lifeProgress =
                    shootingStar.age /
                    shootingStar.maximumAge;

                const fade =
                    lifeProgress > 0.72
                        ? 1 -
                          (
                              lifeProgress -
                              0.72
                          )
                          /
                          0.28
                        : 1;


                const gradient =
                    context.createLinearGradient(
                        tailX,
                        tailY,
                        shootingStar.x,
                        shootingStar.y
                    );

                gradient.addColorStop(
                    0,
                    "rgba(90, 170, 255, 0)"
                );

                gradient.addColorStop(
                    0.55,
                    `rgba(
                        125,
                        205,
                        255,
                        ${
                            shootingStar.opacity *
                            fade *
                            0.35
                        }
                    )`
                );

                gradient.addColorStop(
                    1,
                    `rgba(
                        245,
                        252,
                        255,
                        ${
                            shootingStar.opacity *
                            fade
                        }
                    )`
                );


                context.beginPath();

                context.moveTo(
                    tailX,
                    tailY
                );

                context.lineTo(
                    shootingStar.x,
                    shootingStar.y
                );

                context.strokeStyle =
                    gradient;

                context.lineWidth =
                    shootingStar.lineWidth;

                context.lineCap =
                    "round";

                context.shadowColor =
                    "rgba(100, 190, 255, 0.72)";

                context.shadowBlur = 8;

                context.stroke();


                context.beginPath();

                context.arc(
                    shootingStar.x,
                    shootingStar.y,
                    shootingStar.lineWidth *
                    1.25,
                    0,
                    Math.PI * 2
                );

                context.fillStyle =
                    `rgba(
                        245,
                        252,
                        255,
                        ${
                            shootingStar.opacity *
                            fade
                        }
                    )`;

                context.shadowBlur = 12;

                context.fill();

                context.shadowBlur = 0;
            }
        );
    }


    function drawScene() {

        clearCanvas();

        drawBackgroundStars();

        drawShootingStars();
    }


    function animateScene() {

        if (
            isHovered &&
            !card.classList.contains(
                "active"
            )
        ) {

            isHovered = false;

            stopShootingStars();

            targetX = 0.5;
            targetY = 0.5;

            card.classList.remove(
                "stars-active"
            );
        }


        currentX +=
            (
                targetX -
                currentX
            )
            *
            0.08;

        currentY +=
            (
                targetY -
                currentY
            )
            *
            0.08;


        updateShootingStars();

        drawScene();


        const movementRemaining =
            Math.abs(
                targetX -
                currentX
            )
            +
            Math.abs(
                targetY -
                currentY
            );


        const shouldContinue =
            isHovered
            ||
            shootingStars.length > 0
            ||
            movementRemaining > 0.001;


        if (shouldContinue) {

            animationFrame =
                requestAnimationFrame(
                    animateScene
                );

        } else {

            currentX = targetX;
            currentY = targetY;

            drawScene();

            animationFrame = null;
        }
    }


    function requestStarAnimation() {

        if (
            animationFrame !==
            null
        ) {
            return;
        }

        animationFrame =
            requestAnimationFrame(
                animateScene
            );
    }


    card.addEventListener(
        "mouseenter",
        () => {

            if (
                !card.classList.contains(
                    "active"
                )
            ) {
                return;
            }

            isHovered = true;

            card.classList.add(
                "stars-active"
            );

            startShootingStars();

            requestStarAnimation();
        }
    );


    card.addEventListener(
        "mousemove",
        event => {

            if (
                !card.classList.contains(
                    "active"
                )
            ) {

                isHovered = false;

                stopShootingStars();

                return;
            }


            if (!isHovered) {

                isHovered = true;

                card.classList.add(
                    "stars-active"
                );

                startShootingStars();
            }


            const cardRectangle =
                card.getBoundingClientRect();

            targetX =
                (
                    event.clientX -
                    cardRectangle.left
                )
                /
                cardRectangle.width;

            targetY =
                (
                    event.clientY -
                    cardRectangle.top
                )
                /
                cardRectangle.height;


            targetX =
                Math.max(
                    0,
                    Math.min(
                        1,
                        targetX
                    )
                );

            targetY =
                Math.max(
                    0,
                    Math.min(
                        1,
                        targetY
                    )
                );


            visual.style.setProperty(
                "--glow-x",
                `${targetX * 100}%`
            );

            visual.style.setProperty(
                "--glow-y",
                `${targetY * 100}%`
            );

            requestStarAnimation();
        }
    );


    card.addEventListener(
        "mouseleave",
        () => {

            isHovered = false;

            stopShootingStars();

            targetX = 0.5;
            targetY = 0.5;

            card.classList.remove(
                "stars-active"
            );

            visual.style.setProperty(
                "--glow-x",
                "50%"
            );

            visual.style.setProperty(
                "--glow-y",
                "50%"
            );

            requestStarAnimation();
        }
    );


    if (
        typeof ResizeObserver !==
        "undefined"
    ) {

        const resizeObserver =
            new ResizeObserver(
                resizeCanvas
            );

        resizeObserver.observe(
            visual
        );

    } else {

        window.addEventListener(
            "resize",
            resizeCanvas
        );
    }


    resizeCanvas();
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

        <canvas
            class="featured-star-canvas"
            aria-hidden="true"
        ></canvas>

        <div
            class="featured-hover-glow"
            aria-hidden="true"
        ></div>

        <span class="featured-event-type">
            ${escapeHTML(
                event.type
            )}
        </span>

    </div>

    <div class="featured-event-content">

        <p class="featured-event-category">
            ${escapeHTML(
                event.category
            )}
        </p>

        <h3 class="featured-event-name">
            ${escapeHTML(
                event.eventName ||
                event.title
            )}
        </h3>

        <p class="featured-event-title">
            ${escapeHTML(
                event.title
            )}
        </p>

        <p class="featured-event-summary">
            ${escapeHTML(
                event.summary
            )}
        </p>

        <span class="featured-event-link">
            View Event
        </span>

    </div>
`;

                    track.appendChild(card);
                    initialiseCardStarfield(card);                

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