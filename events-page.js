document.addEventListener(
    "DOMContentLoaded",
    () => {

        const categories = [
            "All",
            "On Stage",
            "Off Stage",
            "Sporting",
            "Online"
        ];

        let activeCategory = "All";

        const filtersContainer =
            document.getElementById(
                "eventCategoryFilters"
            );

        const searchInput =                               
            document.getElementById(
                "eventSearch"
            );

        const eventsGrid =
            document.getElementById(
                "publicEventsGrid"
            );

        const detailsPanel =
            document.getElementById(
                "eventDetailsPanel"
            );


        document.getElementById(
            "year"
        ).textContent =
            new Date().getFullYear();


        function escapeHTML(value) {

            return String(value ?? "")
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")
                .replaceAll('"', "&quot;")
                .replaceAll("'", "&#039;");
        }

        function initialisePublicEventStarfield(card) {

    const visual =
        card.querySelector(
            ".public-event-visual"
        );

    const canvas =
        card.querySelector(
            ".public-event-stars"
        );

    if (!visual || !canvas) {
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
                ? 24
                : 34;

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
                    1.25 +
                    0.35,

                brightness:
                    Math.random() *
                    0.45 +
                    0.3,

                depth:
                    Math.random() *
                    0.8 +
                    0.2
            });
        }
    }


    function createShootingStar() {

        /*
           Most shooting stars begin slightly
           outside the top or left edge.
        */

        const startsFromTop =
            Math.random() > 0.35;

        let startX;
        let startY;

        if (startsFromTop) {

            startX =
                Math.random() *
                width *
                0.82;

            startY =
                -20;

        } else {

            startX =
                -35;

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

            width:
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

        /*
           Add a couple immediately so the
           hover does not initially feel empty.
        */

        createShootingStar();

        window.setTimeout(
            () => {

                if (isHovered) {
                    createShootingStar();
                }

            },
            130
        );


        shootingStarTimer =
            window.setInterval(
                () => {

                    if (!isHovered) {
                        return;
                    }

                    createShootingStar();


                    /*
                       Occasionally create a second
                       shooting star close behind.
                    */

                    if (
                        Math.random() >
                        0.58
                    ) {

                        window.setTimeout(
                            () => {

                                if (
                                    isHovered
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
                isHovered
                    ? Math.min(
                        star.brightness +
                        0.2,
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


                /*
                   Fade slightly near the end
                   of the shooting star's life.
                */

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
                    shootingStar.width;

                context.lineCap =
                    "round";

                context.shadowColor =
                    "rgba(100, 190, 255, 0.72)";

                context.shadowBlur =
                    8;

                context.stroke();


                /*
                   Bright head of the shooting star.
                */

                context.beginPath();

                context.arc(
                    shootingStar.x,
                    shootingStar.y,
                    shootingStar.width *
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

                context.shadowBlur =
                    12;

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

        currentX +=
            (
                targetX -
                currentX
            )
            *
            0.09;

        currentY +=
            (
                targetY -
                currentY
            )
            *
            0.09;


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
                "--cursor-x",
                `${targetX * 100}%`
            );

            visual.style.setProperty(
                "--cursor-y",
                `${targetY * 100}%`
            );

            requestStarAnimation();
        }
    );


    card.addEventListener(
        "mouseleave",
        () => {

            isHovered = false;

            /*
               Stop producing new shooting stars,
               but do not remove the existing ones.
            */

            stopShootingStars();

            targetX = 0.5;
            targetY = 0.5;

            card.classList.remove(
                "stars-active"
            );

            visual.style.setProperty(
                "--cursor-x",
                "50%"
            );

            visual.style.setProperty(
                "--cursor-y",
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


        function buildFilters() {

            filtersContainer.innerHTML = "";

            categories.forEach(category => {

                const button =
                    document.createElement(
                        "button"
                    );

                button.type = "button";

                button.className =
                    "event-filter-btn";

                button.textContent =
                    category;

                if (
                    category ===
                    activeCategory
                ) {

                    button.classList.add(
                        "active"
                    );
                }

                button.addEventListener(
                    "click",
                    () => {

                        activeCategory =
                            category;

                        buildFilters();

                        renderEvents();
                    }
                );

                filtersContainer.appendChild(
                    button
                );
            });
        }


        function getFilteredEvents() {

            const searchTerm =
                searchInput.value
                    .trim()
                    .toLowerCase();

            return PUBLIC_EVENTS.filter(
                event => {

                    const categoryMatches =
                        activeCategory === "All"
                        ||
                        event.category ===
                            activeCategory;

                    const searchableText = [
    event.eventName,
    event.title,
    event.shortTitle,
    event.summary,
    event.type,
    event.category
]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const searchMatches =
    !searchTerm
    ||
    searchableText.includes(
        searchTerm
    );

                    return (
                        categoryMatches &&
                        searchMatches
                    );
                }
            );
        }


        function renderEvents() {

            const filteredEvents =
                getFilteredEvents();

            eventsGrid.innerHTML = "";

            if (
                filteredEvents.length === 0
            ) {

                eventsGrid.innerHTML = `
                    <div class="events-empty-state">

                        <h2>
                            No events found
                        </h2>

                        <p>
                            Try another category or search term.
                        </p>

                    </div>
                `;

                return;
            }

            filteredEvents.forEach(event => {

                const card =
                    document.createElement(
                        "article"
                    );

                card.className =
                    "public-event-card";

                card.dataset.eventId =
                    event.id;

                card.innerHTML = `
    <div class="public-event-visual">

        <canvas
            class="public-event-stars"
            aria-hidden="true"
        ></canvas>

        <div
            class="public-event-cursor-glow"
            aria-hidden="true"
        ></div>

        <div
            class="public-event-horizon"
            aria-hidden="true"
        ></div>

        <span class="public-event-type">
            ${escapeHTML(
                event.type
            )}
        </span>

    </div>

                    <div class="public-event-content">

                        <p class="public-event-category">
                            ${escapeHTML(
                                event.category
                            )}
                        </p>

                        <p class="public-event-name">
    ${escapeHTML(
        event.eventName || event.title
    )}
</p>

<h2 class="public-event-title">
    ${escapeHTML(
        event.title
    )}
</h2>

                        <p>
                            ${escapeHTML(
                                event.summary
                            )}
                        </p>

                        <button
                            type="button"
                            class="public-event-open"
                        >
                            View Details
                        </button>

                    </div>
                `;

                card.addEventListener(
                    "click",
                    () => {

                        openEventDetails(
                            event.id,
                            true
                        );
                    }
                );

                eventsGrid.appendChild(
                    card
                );

                initialisePublicEventStarfield(
    card
);
            });
        }


        function buildList(items) {

    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {
        return "";
    }

    return items
        .filter(Boolean)
        .map(
            item =>
                `<li>${escapeHTML(
                    item
                )}</li>`
        )
        .join("");
}


        function openEventDetails(
            eventId,
            updateHash = false
        ) {

            const event =
                PUBLIC_EVENTS.find(
                    item =>
                        item.id === eventId
                );

            if (!event) {
                return;
            }

            const rules =
    Array.isArray(event.rules)
        ? event.rules.filter(Boolean)
        : [];

const judging =
    Array.isArray(event.judging)
        ? event.judging.filter(Boolean)
        : [];

const additionalInfo =
    Array.isArray(event.additionalInfo)
        ? event.additionalInfo.filter(Boolean)
        : [];

        const detailSections = [

    rules.length > 0
        ? `
            <div class="event-details-section">

                <p class="event-details-section-label">
                    Event Guidelines
                </p>

                <h3>
                    Rules
                </h3>

                <ol class="event-rules-list">
                    ${buildList(rules)}
                </ol>

            </div>
        `
        : "",

    judging.length > 0
        ? `
            <div class="event-details-section">

                <p class="event-details-section-label">
                    Evaluation
                </p>

                <h3>
                    Judging Criteria
                </h3>

                <ul class="event-judging-list">
                    ${buildList(judging)}
                </ul>

            </div>
        `
        : "",

    additionalInfo.length > 0
        ? `
            <div class="event-details-section">

                <p class="event-details-section-label">
                    Important Details
                </p>

                <h3>
                    Additional Information
                </h3>

                <ul class="event-additional-list">
                    ${buildList(additionalInfo)}
                </ul>

            </div>
        `
        : ""

]
.filter(Boolean)
.join("");

            detailsPanel.hidden = false;

            detailsPanel.innerHTML = `
    <button
        type="button"
        class="event-details-close"
        aria-label="Close event details"
    >
        ×
    </button>

    <div class="event-details-hero">

        <div
            class="event-details-stars"
            aria-hidden="true"
        ></div>

        <div class="event-details-heading">

            <p class="event-details-category">
    ${escapeHTML(
        event.category
    )}
</p>

<p class="event-details-name">
    ${escapeHTML(
        event.eventName || event.title
    )}
</p>

<h2 class="event-details-title">
    ${escapeHTML(
        event.title
    )}
</h2>

<span class="event-details-type">
    ${escapeHTML(
        event.type
    )}
</span>

        </div>

        <p class="event-details-summary">
            ${escapeHTML(
                event.summary
            )}
        </p>

    </div>

    <div class="event-details-body">

        <p class="event-details-description">
            ${escapeHTML(
                event.description
            )}
        </p>

        <div class="event-details-info">

    <div>
        <span>Category</span>

        <strong>
            ${escapeHTML(
                event.category
            )}
        </strong>
    </div>

    <div>
        <span>Event Type</span>

        <strong>
            ${escapeHTML(
                event.type
            )}
        </strong>
    </div>

</div>

        ${
    detailSections
        ? `
            <div class="event-details-columns">
                ${detailSections}
            </div>
        `
        : ""
}

        <div class="event-details-actions">

            <button
                type="button"
                class="event-details-back"
            >
                Back to Events
            </button>

            <a
                href="register/login.html"
                class="register-btn"
            >
                Register
            </a>

        </div>

    </div>
`;

            detailsPanel
                .querySelector(
                    ".event-details-close"
                )
                .addEventListener(
                    "click",
                    closeEventDetails
                );

                detailsPanel
    .querySelector(
        ".event-details-back"
    )
    .addEventListener(
        "click",
        closeEventDetails
    );

            if (updateHash) {

                history.replaceState(
                    null,
                    "",
                    `#${event.id}`
                );
            }

            detailsPanel.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }


        function closeEventDetails() {

            detailsPanel.hidden = true;

            detailsPanel.innerHTML = "";

            history.replaceState(
                null,
                "",
                window.location.pathname
            );
        }


        searchInput.addEventListener(               
            "input",
            renderEvents
        );


        const menuButton =
            document.querySelector(
                ".menu-toggle"
            );

        const navigation =
            document.querySelector(
                ".main-nav"
            );

        menuButton.addEventListener(
            "click",
            () => {

                navigation.classList.toggle(
                    "show"
                );
            }
        );


        document
            .querySelectorAll(
                ".main-nav a"
            )
            .forEach(link => {

                link.addEventListener(
                    "click",
                    () => {

                        navigation.classList.remove(
                            "show"
                        );
                    }
                );
            });


        buildFilters();

        renderEvents();


        const requestedEventId =
            window.location.hash
                .replace("#", "")
                .trim();

        if (requestedEventId) {

            openEventDetails(
                requestedEventId
            );
        }
    }
);