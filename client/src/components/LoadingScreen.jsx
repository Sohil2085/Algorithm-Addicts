import { AnimatePresence, motion } from 'framer-motion';

const LoadingScreen = ({ isLoading }) => {
    return (
        <AnimatePresence mode="wait">
            {isLoading && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#0B1220',
                        zIndex: 9999,
                        pointerEvents: 'all'
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="text-center"
                    >
                        {/* Title - Text Only */}
                        <h1 className="text-6xl font-extrabold text-white tracking-tight mb-4" style={{ letterSpacing: '-0.02em' }}>
                            FinBridge
                        </h1>

                        {/* Subtext */}
                        <p className="text-blue-400/80 text-sm font-medium tracking-widest uppercase">
                            Premium Invoice Financing
                        </p>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default LoadingScreen;
