const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

async function bootMotion() {
  const { animate, inView, stagger } = await import("https://cdn.jsdelivr.net/npm/motion@12.23.24/+esm");

  animate(
    "[data-motion='rise']",
    { opacity: [0, 1], y: [28, 0] },
    { duration: 0.72, delay: stagger(0.09), ease: [0.22, 1, 0.36, 1] }
  );

  animate(
    "[data-motion='console']",
    { opacity: [0, 1], scale: [0.94, 1], y: [24, 0] },
    { duration: 0.9, delay: 0.22, ease: [0.22, 1, 0.36, 1] }
  );

  animate(
    ".pipeline-step.active",
    { x: [-14, 0], opacity: [0, 1] },
    { duration: 0.55, delay: stagger(0.12, { start: 0.65 }), ease: "ease-out" }
  );

  animate(
    ".kinetic-tags span",
    { opacity: [0, 1], y: [18, 0] },
    { duration: 0.5, delay: stagger(0.08, { start: 1 }), ease: "ease-out" }
  );

  inView("[data-motion='card']", (element) => {
    animate(
      element,
      { opacity: [0, 1], y: [38, 0] },
      { duration: 0.55, ease: "ease-out" }
    );
  });

  inView("[data-motion='line']", (element) => {
    animate(
      element,
      { opacity: [0, 1], x: [-28, 0] },
      { duration: 0.52, ease: "ease-out" }
    );
  });

  animate(
    ".record-left",
    { x: [-18, 0], opacity: [0.68, 1] },
    { duration: 1.8, repeat: Infinity, repeatType: "mirror", ease: "ease-in-out" }
  );

  animate(
    ".record-right",
    { x: [18, 0], opacity: [0.68, 1] },
    { duration: 1.8, repeat: Infinity, repeatType: "mirror", ease: "ease-in-out" }
  );

  animate(
    ".record-center",
    { scale: [0.98, 1.025] },
    { duration: 1.6, repeat: Infinity, repeatType: "mirror", ease: "ease-in-out" }
  );
}

if (!prefersReducedMotion) {
  bootMotion().catch((error) => {
    console.warn("Motion animations unavailable", error);
  });
}
