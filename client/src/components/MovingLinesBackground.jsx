import { useEffect, useRef } from 'react';

const MovingLinesBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width, height;
        let lines = [];
        let animationFrameId;

        // Configuration
        const config = {
            lineCount: 80,
            lineColor: 'rgba(96, 165, 250, 0.12)', // Light blue
            brightLineColor: 'rgba(59, 130, 246, 0.18)', // Brighter blue
            speed: 0.2, // Movement speed
            waveAmplitude: 20, // Reduced amplitude for subtlety
            waveFrequency: 0.005, // Lower frequency for gentle waves
        };

        // Initialize/Resizing
        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;

            // Optimize for high DPI displays
            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            initLines();
        };

        const initLines = () => {
            lines = [];
            // Calculate how much extra width/height we need to cover rotation
            // Diagonal length calculation isn't strictly necessary if we generate enough lines
            // We'll generate lines across a larger area to allow for movement

            const diagonal = Math.sqrt(width * width + height * height);

            for (let i = 0; i < config.lineCount; i++) {
                lines.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    length: Math.random() * 200 + 100, // Varying lengths
                    angle: -Math.PI / 4, // 45 degrees
                    speed: Math.random() * config.speed + 0.1,
                    offset: Math.random() * 1000, // Phase offset for wave
                    isBright: Math.random() > 0.9, // 10% bright lines
                });
            }
        };

        // Animation Loop
        const animate = (time) => {
            // Clear canvas
            ctx.clearRect(0, 0, width, height);

            // Check for reduced motion preference inside the loop to react dynamically if needed, 
            // or just return early. 
            // Better to check once outside, but for simplicity/robustness:
            const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            lines.forEach((line) => {
                // Update position
                if (!reducedMotion) {
                    line.offset += config.speed * 0.1;
                    // Slowly move diagonally
                    line.x -= Math.cos(line.angle) * line.speed;
                    line.y -= Math.sin(line.angle) * line.speed;

                    // Wrap around screen
                    if (line.x < -100) line.x = width + 100;
                    if (line.y < -100) line.y = height + 100;
                }

                // Draw Line
                ctx.beginPath();

                // Calculate wave distortion
                const wave = !reducedMotion
                    ? Math.sin(time * 0.001 + line.offset * config.waveFrequency) * config.waveAmplitude
                    : 0;

                // Start point
                const startX = line.x + wave;
                const startY = line.y + wave;

                // End point (based on angle)
                const endX = startX + Math.cos(line.angle) * line.length;
                const endY = startY + Math.sin(line.angle) * line.length;

                // Draw gradient for fading tails
                const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
                const color = line.isBright ? config.brightLineColor : config.lineColor;

                gradient.addColorStop(0, 'transparent');
                gradient.addColorStop(0.5, color);
                gradient.addColorStop(1, 'transparent');

                ctx.strokeStyle = gradient;
                ctx.lineWidth = line.isBright ? 2 : 1;
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        // Init
        resize();
        window.addEventListener('resize', resize);
        animationFrameId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -2,
                pointerEvents: 'none',
            }}
        />
    );
};

export default MovingLinesBackground;
