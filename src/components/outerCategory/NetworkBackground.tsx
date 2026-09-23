import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
};

export default function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    let animationFrame: number;

    let particles: Particle[] = [];

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();

      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      createParticles(rect.width, rect.height);
    };

    const createParticles = (width: number, height: number) => {
      const count = Math.min(
        75,
        Math.max(35, Math.floor((width * height) / 18000))
      );

      particles = [];

      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,

          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,

          radius: Math.random() * 1.8 + 0.7,
        });
      }
    };

    const animate = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      ctx.clearRect(0, 0, width, height);

      // Move particles
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce from edges
        if (particle.x <= 0 || particle.x >= width) {
          particle.vx *= -1;
        }

        if (particle.y <= 0 || particle.y >= height) {
          particle.vy *= -1;
        }
      });

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;

          const distance = Math.sqrt(dx * dx + dy * dy);

          const maxDistance = 170;

          if (distance < maxDistance) {
            const opacity =
              (1 - distance / maxDistance) * 0.28;

            ctx.beginPath();

            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);

            // Gold constellation lines
            ctx.strokeStyle = `rgba(212, 175, 55, ${opacity})`;

            ctx.lineWidth = 0.7;

            ctx.stroke();
          }
        }
      }

      // Draw nodes
      particles.forEach((particle, index) => {
        const isBlue = index % 5 === 0;

        ctx.beginPath();

        ctx.arc(
          particle.x,
          particle.y,
          particle.radius,
          0,
          Math.PI * 2
        );

        ctx.fillStyle = isBlue
          ? "rgba(80, 170, 255, 0.75)"
          : "rgba(212, 175, 55, 0.75)";

        ctx.fill();

        // Small glow
        ctx.beginPath();

        ctx.arc(
          particle.x,
          particle.y,
          particle.radius * 2.5,
          0,
          Math.PI * 2
        );

        ctx.fillStyle = isBlue
          ? "rgba(80, 170, 255, 0.08)"
          : "rgba(212, 175, 55, 0.08)";

        ctx.fill();
      });

      animationFrame = requestAnimationFrame(animate);
    };

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);

      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}