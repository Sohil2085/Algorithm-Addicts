import React, { useEffect, useRef } from 'react';

const DotSphere = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Configuration
        const radius = 180;
        const dotCount = 280; // Reduced for cleaner look
        const dots = [];
        let rotationX = 0;
        let rotationY = 0;
        const baseSpeed = 0.002;

        // Resize handler
        const resize = () => {
            const parent = canvas.parentElement;
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        // Initialize dots
        for (let i = 0; i < dotCount; i++) {
            // Golden angle distribution for even spacing on sphere
            const phi = Math.acos(-1 + (2 * i) / dotCount);
            const theta = Math.sqrt(dotCount * Math.PI) * phi;

            dots.push({
                x: radius * Math.cos(theta) * Math.sin(phi),
                y: radius * Math.sin(theta) * Math.sin(phi),
                z: radius * Math.cos(phi),
                size: Math.random() < 0.1 ? 2.5 : 1.5, // Occasional larger dots
                alpha: Math.random() * 0.5 + 0.2
            });
        }

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Center of canvas
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            // Rotate sphere
            rotationY += baseSpeed;
            rotationX += baseSpeed * 0.5;

            // Sort dots by Z depth for correct occlusion
            const projectedDots = dots.map(dot => {
                // Rotation
                let x = dot.x;
                let y = dot.y;
                let z = dot.z;

                // Rotate around Y
                const ny = y;
                const nz = z * Math.cos(rotationY) - x * Math.sin(rotationY);
                const nx = z * Math.sin(rotationY) + x * Math.cos(rotationY);

                // Rotate around X
                const finalY = ny * Math.cos(rotationX) - nz * Math.sin(rotationX);
                const finalZ = ny * Math.sin(rotationX) + nz * Math.cos(rotationX);
                const finalX = nx;

                // Projection
                const scale = 400 / (400 + finalZ); // Perspective
                const screenX = cx + finalX * scale;
                const screenY = cy + finalY * scale;

                return {
                    x: screenX,
                    y: screenY,
                    scale: scale,
                    z: finalZ,
                    alpha: dot.alpha,
                    size: dot.size
                };
            }).sort((a, b) => b.z - a.z); // Draw back to front

            // Draw connections
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)'; // Deep blue low opacity
            ctx.lineWidth = 0.5;

            // Only connect nearby dots (optimization)
            for (let i = 0; i < projectedDots.length; i++) {
                const p1 = projectedDots[i];
                if (p1.z < -50) continue; // Don't draw connections too far back

                let connections = 0;
                for (let j = i + 1; j < projectedDots.length; j++) {
                    const p2 = projectedDots[j];
                    if (connections > 2) break; // Limit connections

                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 40) { // Connection threshold
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                        connections++;
                    }
                }
            }

            // Draw dots
            projectedDots.forEach(p => {
                const alpha = Math.max(0.1, (p.scale - 0.5) * p.alpha); // Fade distant dots

                ctx.fillStyle = `rgba(96, 165, 250, ${alpha})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * p.scale, 0, Math.PI * 2);
                ctx.fill();

                // Glow effect for larger dots
                if (p.size > 2) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="w-full h-[500px] flex items-center justify-center relative z-0">
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
            />
            {/* Radial gradient overlay for depth integration */}
            <div className="absolute inset-0 bg-radial-gradient pointer-events-none"
                style={{ background: 'radial-gradient(circle at center, transparent 30%, #0B1220 70%)' }}>
            </div>
        </div>
    );
};

export default DotSphere;
