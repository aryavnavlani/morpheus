/* ==========================================
   MORPHEUS 2026
   FINAL SCRIPT
========================================== */

document.addEventListener("DOMContentLoaded", () => {





  /* ==========================================
     COUNTDOWN
  ========================================== */

  const EVENT_DATE = new Date(
    "August 7, 2026 00:00:00"
  ).getTime();

  function updateCountdown(){

    const now = Date.now();

    const distance =
  Math.max(
    EVENT_DATE - now,
    0
  );

    const days =
      Math.floor(
        distance /
        (1000*60*60*24)
      );

    const hours =
      Math.floor(
        (distance %
        (1000*60*60*24))
        /
        (1000*60*60)
      );

    const minutes =
      Math.floor(
        (distance %
        (1000*60*60))
        /
        (1000*60)
      );

    const seconds =
      Math.floor(
        (distance %
        (1000*60))
        /
        1000
      );

    document.getElementById(
      "cd-days"
    ).textContent =
      String(days).padStart(2,"0");

    document.getElementById(
      "cd-hours"
    ).textContent =
      String(hours).padStart(2,"0");

    document.getElementById(
      "cd-minutes"
    ).textContent =
      String(minutes).padStart(2,"0");

    document.getElementById(
      "cd-seconds"
    ).textContent =
      String(seconds).padStart(2,"0");
  }

  updateCountdown();

  setInterval(
    updateCountdown,
    1000
  );

  /* ==========================================
     FOOTER YEAR
  ========================================== */

  document.getElementById("year")
    .textContent =
      new Date().getFullYear();

  /* ==========================================
     ABOUT STATS
  ========================================== */

  const statNumbers =
    document.querySelectorAll(
      ".stat-number"
    );

  let statsAnimated = false;

  function animateStats(){

    if(statsAnimated) return;

    statsAnimated = true;

    statNumbers.forEach(stat => {

      const target =
        parseInt(
          stat.dataset.target
        );

      let current = 0;

      const increment =
        target / 80;

      const timer =
        setInterval(() => {

          current += increment;

          if(current >= target){

            stat.textContent =
              target.toLocaleString();

            clearInterval(timer);

          }else{

            stat.textContent =
              Math.floor(current)
              .toLocaleString();
          }

        },20);

    });

  }

  const aboutSection =
    document.getElementById(
      "about"
    );

  const observer =
    new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if(entry.isIntersecting){

            animateStats();

          }

        });

      },
      {
        threshold:0.08
        
      }
    );

  observer.observe(
    aboutSection
  );

  /* ==========================================
     EVENTS DATA
  ========================================== */

  

  /* ==========================================
     TEAM
  ========================================== */

  const teamMembers = [
  {
    name: "Core Team",
    role: "Profiles coming soon",
    image: null
  }
];

  const teamGrid =
  document.getElementById("teamGrid");

if (teamGrid) {
  teamGrid.innerHTML = "";

  teamMembers.forEach(member => {

    const card =
      document.createElement("div");

    card.className =
      member.image
        ? "member"
        : "member member-placeholder";

    card.innerHTML = `

      <div class="avatar">

        ${
          member.image
            ? `
              <img
                src="${member.image}"
                alt="${member.name}"
              >
            `
            : `
              <div class="team-placeholder-icon">
                ✦
              </div>
            `
        }

      </div>

      <div class="member-name">
        ${member.name}
      </div>

      <div class="member-role">
        ${member.role}
      </div>

      ${
        !member.image
          ? `
            <p class="team-placeholder-text">
              Meet the organising team behind
              MORPHEUS 2026. Profiles will be
              revealed shortly.
            </p>
          `
          : ""
      }

    `;

    teamGrid.appendChild(card);

  });
}

  /* ==========================================
     SPONSORS
========================================== */


const sponsorsGrid =
  document.getElementById(
    "sponsorsGrid"
  );



});
/* ==========================================
   SPONSORS
========================================== */

const sponsorsGrid =
  document.getElementById(
    "sponsorsGrid"
  );


function escapeSponsorHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function renderSponsors() {

  if (!sponsorsGrid) {
    return;
  }

  const sponsorTiers =
    Array.isArray(
      window.SPONSOR_TIERS
    )
      ? [...window.SPONSOR_TIERS]
      : [];

    
  const sponsors =
    Array.isArray(
      window.SPONSORS
    )
      ? window.SPONSORS
      : [];


  sponsorsGrid.innerHTML = "";

  


  sponsorTiers
    .sort(
      (firstTier, secondTier) =>
        firstTier.rank -
        secondTier.rank
    )
    .forEach(tier => {

      const tierSponsors =
        sponsors.filter(
          sponsor =>
            sponsor.tier === tier.id
        );

      /*
         Empty tiers are not displayed.
      */

      if (
        tierSponsors.length === 0
      ) {
        return;
      }


      const tierSection =
        document.createElement(
          "section"
        );

      tierSection.className =
        `sponsor-tier sponsor-tier-${tier.id}`;

      tierSection.innerHTML = `
        <div class="sponsor-tier-heading">

  <h3>
    ${escapeSponsorHTML(
      tier.label
    )}
  </h3>

</div>

        <div class="sponsor-tier-grid"></div>
      `;


      const tierGrid =
        tierSection.querySelector(
          ".sponsor-tier-grid"
        );
        
        if (tierSponsors.length === 1) {

  tierGrid.classList.add(
    "single-sponsor-tier"
  );
}



      tierSponsors.forEach(
        sponsor => {

          const card =
            document.createElement(
              "article"
            );

          card.className =
            "sponsor-card";
          card.dataset.sponsorId =
  sponsor.id;

          if (sponsor.event) {

            card.classList.add(
              "sponsor-card-event"
            );
          }


          const hasLogo =
            typeof sponsor.logo ===
              "string"
            &&
            sponsor.logo.trim() !== "";


          card.innerHTML = `
            <div class="sponsor-card-visual">

              ${
                hasLogo
                  ? `
                    <img
                      src="${escapeSponsorHTML(
                        sponsor.logo
                      )}"
                      class="sponsor-logo"
                      alt="${escapeSponsorHTML(
                        sponsor.name
                      )} logo"
                    >
                  `
                  : `
                    <div
                      class="sponsor-text-logo"
                      aria-hidden="true"
                    >
                      ${escapeSponsorHTML(
                        sponsor.name
                      )}
                    </div>
                  `
              }

            </div>

            <div class="sponsor-card-content">

              ${
                sponsor.event
                  ? `
                    <p class="sponsored-event-name">
                      ${escapeSponsorHTML(
                        sponsor.event
                      )}
                    </p>
                  `
                  : ""
              }

              <h4 class="sponsor-name">
                ${escapeSponsorHTML(
                  sponsor.name
                )}
              </h4>

            </div>
          `;


          const logo =
            card.querySelector(
              ".sponsor-logo"
            );


          /*
             If a logo path is wrong or the image
             cannot be loaded, automatically replace
             it with a text version of the name.
          */

          if (logo) {

            logo.addEventListener(
              "error",
              () => {

                const visual =
                  card.querySelector(
                    ".sponsor-card-visual"
                  );

                visual.innerHTML = `
                  <div
                    class="sponsor-text-logo"
                    aria-hidden="true"
                  >
                    ${escapeSponsorHTML(
                      sponsor.name
                    )}
                  </div>
                `;
              },
              {
                once: true
              }
            );
          }


          tierGrid.appendChild(
            card
          );
        }
      );


      sponsorsGrid.appendChild(
        tierSection
      );
    });


  if (
    sponsorsGrid.children.length ===
    0
  ) {

    sponsorsGrid.innerHTML = `
      <div class="sponsors-empty-state">
        Sponsor announcements coming soon.
      </div>
    `;
  }
}


function initialiseSponsors() {

  if (
    !Array.isArray(window.SPONSOR_TIERS) ||
    !Array.isArray(window.SPONSORS)
  ) {
    console.error(
      "Sponsor data failed to load."
    );

    return;
  }

  renderSponsors();
}

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initialiseSponsors
  );

} else {

  initialiseSponsors();
}


console.log(
    "Sponsor debug:",
    {
        gridFound: Boolean(sponsorsGrid),

        tiersLoaded:
            Array.isArray(
                window.SPONSOR_TIERS
            )
                ? window.SPONSOR_TIERS.length
                : "not loaded",

        sponsorsLoaded:
            Array.isArray(
                window.SPONSORS
            )
                ? window.SPONSORS.length
                : "not loaded",

        renderedTiers:
            sponsorsGrid
                ? sponsorsGrid.children.length
                : 0,

        renderedCards:
            document.querySelectorAll(
                ".sponsor-card"
            ).length
    }
);

/* ==========================================
   PARTICLE STARFIELD
========================================== */

const canvas =
  document.getElementById(
    "bgCanvas"
  );

const ctx =
  canvas.getContext("2d");

let stars = [];
let shootingStar = null;

function resize(){

  canvas.width =
    window.innerWidth;

  canvas.height =
    window.innerHeight;
}

resize();

window.addEventListener(
  "resize",
  resize
);

const isMobile =
    window.innerWidth <= 768;

const STAR_COUNT =
    isMobile ? 60 : 200;
console.log(
    "Stars:",
    STAR_COUNT,
    "Mobile:",
    isMobile
);
for(let i=0;i<STAR_COUNT;i++){

    const depth = Math.random();

stars.push({

    x:
        Math.random() *
        window.innerWidth,

    y:
        Math.random() *
        window.innerHeight,

    depth: depth,

   r:
depth > 0.97
    ? 2.5
    : depth * 1.8 + 0.2,

    speed:
        depth * 1.2 + 0.15,

    opacity:
    depth > 0.98
        ? 1
        : depth * 0.6 + 0.25,
    twinkle:
        (Math.random() * 0.008 + 0.002) *
        (Math.random() > 0.5 ? 1 : -1)

});

}

function animate(){

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    stars.forEach(star=>{

        ctx.fillStyle =
            `rgba(255,255,255,${star.opacity})`;

        if(star.r < 0.8){

            ctx.fillRect(
                star.x,
                star.y,
                1,
                1
            );

        }else if(star.r < 2.5){

            ctx.fillStyle =
                `rgba(255,255,255,${Math.min(star.opacity + 0.2,1)})`;

            ctx.fillRect(
                star.x,
                star.y,
                2,
                2
            );

        }else{

            ctx.fillRect(
                star.x,
                star.y,
                2,
                2
            );

            if(star.opacity > 0.9){

                ctx.fillStyle =
                    "rgba(255,255,255,1)";

                ctx.fillRect(
                    star.x - 6,
                    star.y,
                    13,
                    1
                );

                ctx.fillRect(
                    star.x,
                    star.y - 6,
                    1,
                    13
                );
            }
        }

        star.x -= star.speed * 0.35;
        star.y += star.speed * 0.05;

        star.opacity += star.twinkle;

        if(star.opacity > 1){

            star.opacity = 1;
            star.twinkle *= -1;
        }

        if(star.opacity < 0.2){

            star.opacity = 0.2;
            star.twinkle *= -1;
        }

        if(
            star.x < -10 ||
            star.y > canvas.height + 10
        ){

            star.x =
                canvas.width + 10;

            star.y =
                Math.random() *
                canvas.height;
        }

    });

    if(shootingStar){

        ctx.strokeStyle =
`rgba(245,250,255,${shootingStar.opacity})`;

ctx.lineWidth =
shootingStar.width;

ctx.shadowBlur = 26;

ctx.shadowColor =
"rgba(170,230,255,1)";

ctx.beginPath();

ctx.moveTo(
    shootingStar.x,
    shootingStar.y
);

ctx.lineTo(

    shootingStar.x -
    shootingStar.dx *
    shootingStar.length,

    shootingStar.y -
    shootingStar.dy *
    shootingStar.length

);

ctx.stroke();

ctx.shadowBlur = 0;

shootingStar.x +=
shootingStar.dx *
shootingStar.speed;

shootingStar.y +=
shootingStar.dy *
shootingStar.speed;

shootingStar.opacity -=
0.006;

if(

    shootingStar.opacity <= 0 ||

    shootingStar.x > canvas.width + 300 ||

    shootingStar.y > canvas.height + 300 ||

    shootingStar.x < -300 ||

    shootingStar.y < -300

){

    shootingStar = null;

}

       
    }

    requestAnimationFrame(
        animate
    );
}
/*setInterval(()=>{

    if(!shootingStar){

        createShootingStar();
    }

},20000);*/
function scheduleMeteor(){

    const delay =
        6000 + Math.random() * 18000;

    setTimeout(() => {

        if(!shootingStar){

            createShootingStar();

        }

        scheduleMeteor();

    }, delay);

}

if(!isMobile){

    scheduleMeteor();

}






const sections = document.querySelectorAll("section[id]");


const header = document.querySelector(".site-header");


function createShootingStar(){

    // Mostly appear in the upper half
    const startX =
        Math.random() * canvas.width;

    const startY =
        Math.random() * canvas.height * 0.45;

    // Random direction
   const angle =
    (Math.random() * 20 + 25) * Math.PI / 180;

    // Random speed
    const speed =
        8 + Math.random() * 7;

    // Random length
    const length =
        80 + Math.random() * 90;

    shootingStar = {

        x:startX,

        y:startY,

        dx:Math.cos(angle),

        dy:Math.sin(angle),

        length:length,

        speed:speed,

        opacity:0.95 + Math.random() * 0.05,

        width:1.5 + Math.random() * 2

    };

}


const menuBtn =
    document.querySelector(".menu-toggle");

const mobileNav =
    document.querySelector(".main-nav");

menuBtn.addEventListener("click", () => {

    mobileNav.classList.toggle("show");
});
const navLinks =
    document.querySelectorAll(".main-nav a");

navLinks.forEach(link => {

    link.addEventListener("click", () => {

        mobileNav.classList.remove("show");

    });

});
animate();

/* ==========================================
   SECTION REVEAL
========================================== */

const revealElements =

    document.querySelectorAll(

        ".content-section"

    );

const revealObserver =

    new IntersectionObserver(

        entries=>{

            entries.forEach(entry=>{

                if(entry.isIntersecting){

                    entry.target.classList.add(

                        "visible"

                    );
                    const children =

    entry.target.querySelectorAll(

        ".member,.stat-card,.sponsor-card"

    );

children.forEach((child,index)=>{

    child.style.transitionDelay =

        `${index*80}ms`;

});

                }

            });

        },

        {

            threshold:.15,
            rootMargin:"0px 0px -80px 0px"

        }

    );

revealElements.forEach(section=>{

    section.classList.add("reveal");

    revealObserver.observe(section);

});



/* ==========================================
   EXPERIMENTAL CURSOR
========================================== */

if (window.innerWidth > 768) {

  const ring =
    document.createElement("div");

  ring.className =
    "cursor-ring";

  document.body.appendChild(ring);

  document.addEventListener(
    "mousemove",
    event => {
      ring.style.left =
        event.clientX + "px";

      ring.style.top =
        event.clientY + "px";
    }
  );

  document
    .querySelectorAll(
      "a, button, .count-item, .member, .sponsor-card"
    )
    .forEach(element => {

      element.addEventListener(
        "mouseenter",
        () => ring.classList.add("active")
      );

      element.addEventListener(
        "mouseleave",
        () => ring.classList.remove("active")
      );

    });

} // desktop cursor block ends here


/* ==========================================
   PAGE LOADER
========================================== */

const pageLoader =
  document.getElementById("pageLoader");

function hidePageLoader() {

  if (!pageLoader) {
    return;
  }

  pageLoader.classList.add("hidden");

  setTimeout(() => {
    pageLoader.style.display = "none";
  }, 600);

}

window.addEventListener("load", () => {

  setTimeout(
    hidePageLoader,
    350
  );

});

/* Emergency fallback */
setTimeout(
  hidePageLoader,
  3000
);
