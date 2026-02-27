import React, { useEffect, useRef } from 'react';

const Fake3DSphere = () => {
    const canvasRef = useRef(null);
    const pointsRef = useRef([]);
    const rotationRef = useRef({ y: 0, x: 0.3 });
    const animationRef = useRef(null);
    const isScrollingRef = useRef(false);
    const scrollTimeoutRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: false });
        const dpr = window.devicePixelRatio || 1;

        // Detect when user is scrolling to pause expensive animations
        const handleScroll = () => {
            isScrollingRef.current = true;
            clearTimeout(scrollTimeoutRef.current);
            scrollTimeoutRef.current = setTimeout(() => {
                isScrollingRef.current = false;
            }, 150);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        // Set canvas size based on container
        const setCanvasSize = () => {
            const rect = canvas.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;

            canvas.width = width * dpr;
            canvas.height = height * dpr;

            ctx.scale(dpr, dpr);

            return { width, height };
        };

        let { width, height } = setCanvasSize();

        // Generate sphere points using spherical coordinates
        const generateSphere = () => {
            const points = [];
            const radius = 200;
            const pointCount = 320;

            for (let i = 0; i < pointCount; i++) {
                // Random point on sphere surface
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(Math.random() * 2 - 1);

                // Convert spherical to Cartesian
                const x = radius * Math.sin(phi) * Math.cos(theta);
                const y = radius * Math.sin(phi) * Math.sin(theta);
                const z = radius * Math.cos(phi);

                points.push({
                    ox: x,  // original x
                    oy: y,  // original y
                    oz: z,  // original z
                    radius: radius
                });
            }

            return points;
        };

        pointsRef.current = generateSphere();

        // 3D rotation around Y axis
        const rotateY = (x, y, z, angle) => {
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            return {
                x: x * cos - z * sin,
                y: y,
                z: x * sin + z * cos
            };
        };

        // 3D rotation around X axis
        const rotateX = (x, y, z, angle) => {
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            return {
                x: x,
                y: y * cos - z * sin,
                z: y * sin + z * cos
            };
        };

        // Perspective projection (2D screen coordinates from 3D point)
        const project = (x, y, z, width, height) => {
            const perspective = 400;
            const scale = perspective / (perspective + z);

            return {
                x: x * scale + width / 2,
                y: y * scale + height / 2,
                z: z,
                scale: scale
            };
        };

        // Map value from one range to another
        const map = (value, inMin, inMax, outMin, outMax) => {
            return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
        };

        // Main animation loop
        const animate = () => {
            // Get current canvas dimensions
            const rect = canvas.getBoundingClientRect();
            width = rect.width;
            height = rect.height;

            // Clear canvas
            ctx.clearRect(0, 0, width, height);

            // Read current theme from HTML element
            const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

            // Pause rotation update during scroll for better performance
            if (!isScrollingRef.current) {
                // Update rotation angles (very slow for premium feel)
                rotationRef.current.y += 0.002;
                // Slight wobble on X axis
                rotationRef.current.x = 0.3 + Math.sin(rotationRef.current.y * 0.5) * 0.08;
            }

            // Transform all points and project to 2D
            const projectedPoints = pointsRef.current.map(point => {
                // Apply Y rotation
                let p = rotateY(point.ox, point.oy, point.oz, rotationRef.current.y);

                // Apply X rotation
                p = rotateX(p.x, p.y, p.z, rotationRef.current.x);

                // Project to 2D
                const proj = project(p.x, p.y, p.z, width, height);

                return {
                    x: proj.x,
                    y: proj.y,
                    depth: p.z,
                    radius: point.radius
                };
            });

            // Sort by depth (draw back to front)
            projectedPoints.sort((a, b) => a.depth - b.depth);

            // Draw connecting lines between nearby points (subtle)
            ctx.lineWidth = 1;
            ctx.strokeStyle = isDark ? 'rgba(59, 130, 246, 0.06)' : 'rgba(59, 130, 246, 0.25)';

            // Sparse line drawing for performance (every 4th point)
            for (let i = 0; i < projectedPoints.length; i += 4) {
                const p1 = projectedPoints[i];

                for (let j = i + 1; j < projectedPoints.length; j += 4) {
                    const p2 = projectedPoints[j];

                    const dx = p2.x - p1.x;
                    const dy = p2.y - p1.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // Only connect if points are close enough
                    if (distance < 80 && distance > 0) {
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }

            // Draw dots with depth-based sizing and opacity
            projectedPoints.forEach(point => {
                // Map depth to opacity (back darker, front brighter)
                const opacity = map(
                    point.depth,
                    -point.radius,
                    point.radius,
                    0.2,    // min opacity
                    1.0     // max opacity
                );

                // Map depth to size (back smaller, front larger)
                const dotSize = map(
                    point.depth,
                    -point.radius,
                    point.radius,
                    1.2,    // min size
                    3.5     // max size
                );

                // Draw dot with blue color
                const r = isDark ? 96 : 37;
                const g = isDark ? 165 : 99;
                const b = isDark ? 250 : 235;
                const finalOpacity = isDark ? opacity : Math.min(opacity * 1.5, 1);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${finalOpacity.toFixed(3)})`;
                ctx.beginPath();
                ctx.arc(point.x, point.y, dotSize, 0, Math.PI * 2);
                ctx.fill();
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        // Handle window/container resize
        const handleResize = () => {
            const dims = setCanvasSize();
            width = dims.width;
            height = dims.height;
        };

        window.addEventListener('resize', handleResize);
        animate();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeoutRef.current);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                width: '100%',
                height: '100%',
                display: 'block',
                willChange: 'contents'
            }}
        />
    );
};

export default Fake3DSphere;
