import React from 'react';

const AnimatedBackground = () => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="absolute inset-0 bg-[#0B1220]"></div>

            {/* Subtle Dot Grid */}
            <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                    backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    animation: 'backgroundMove 100s linear infinite',
                    willChange: 'background-position'
                }}
            ></div>

            {/* Floating Micro Dots */}
            {[...Array(15)].map((_, i) => (
                <div
                    key={i}
                    className="absolute rounded-full bg-blue-500"
                    style={{
                        width: Math.random() * 3 + 1 + 'px',
                        height: Math.random() * 3 + 1 + 'px',
                        left: Math.random() * 100 + '%',
                        top: Math.random() * 100 + '%',
                        opacity: 0.2,
                        animation: `float ${Math.random() * 10 + 20}s linear infinite`,
                        animationDelay: `-${Math.random() * 20}s`,
                        willChange: 'transform'
                    }}
                />
            ))}

            <style>{`
        @keyframes backgroundMove {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        @keyframes float {
          0% { transform: translateY(0) translateX(0) translateZ(0); opacity: 0.1; }
          50% { transform: translateY(-50px) translateX(20px) translateZ(0); opacity: 0.3; }
          100% { transform: translateY(0) translateX(0) translateZ(0); opacity: 0.1; }
        }
      `}</style>
        </div>
    );
};

export default AnimatedBackground;
