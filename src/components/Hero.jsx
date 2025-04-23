import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import OrderNowButton from "./OrderNowButton";
import About from "./About";

const Hero = () => {
  // References and state
  const heroRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);
  const [meteors, setMeteors] = useState([]);

  // Generate meteor shower effect
  useEffect(() => {
    const generateMeteor = () => {
      const startX = Math.random() * 100;
      const startY = -10;
      const endX = startX - 25 - Math.random() * 50;
      const endY = 110;
      const size = 1 + Math.random() * 3;
      const duration = 0.8 + Math.random() * 1.2;
      const delay = Math.random() * 15;
      const brightness = 0.7 + Math.random() * 0.3;

      return {
        id: Date.now() + Math.random(),
        startX,
        startY,
        endX,
        endY,
        size,
        duration,
        delay,
        brightness,
      };
    };

    // Create initial meteors
    const initialMeteors = Array(15).fill().map(generateMeteor);
    setMeteors(initialMeteors);

    // Add new meteors periodically
    const interval = setInterval(() => {
      setMeteors((prevMeteors) => {
        const newMeteor = generateMeteor();
        return [...prevMeteors.slice(-20), newMeteor];
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Track scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Text animation variants - refined for smoother motion
  const headingVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1],
        delayChildren: 0.15,
        staggerChildren: 0.18,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const lineVariants = {
    hidden: { scaleX: 0, originX: 0.5 },
    visible: {
      scaleX: 1,
      transition: {
        duration: 1.1,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.5,
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.8,
        duration: 0.85,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    hover: {
      scale: 1.03,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.2 },
    },
  };

  return (
    <>
      <section
        ref={heroRef}
        id="home"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Font imports */}
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&family=Yesteryear&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
          `}
        </style>

        {/* Simplified animated background */}
        <div className="absolute inset-0 -z-10">
          {/* Rich black base */}
          <div className="absolute inset-0 bg-black"></div>

          {/* Dynamic gradient overlays - now with deep orange tones */}
          <motion.div
            className="absolute inset-0 opacity-25"
            animate={{
              background: [
                "radial-gradient(circle at 30% 20%, rgba(255, 87, 34, 0.7) 0%, transparent 60%)",
                "radial-gradient(circle at 70% 60%, rgba(255, 111, 0, 0.7) 0%, transparent 60%)",
                "radial-gradient(circle at 40% 80%, rgba(255, 87, 34, 0.7) 0%, transparent 60%)",
                "radial-gradient(circle at 30% 20%, rgba(255, 87, 34, 0.7) 0%, transparent 60%)",
              ],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Meteor shower effect */}
          {meteors.map((meteor) => (
            <motion.div
              key={meteor.id}
              className="absolute z-0"
              style={{
                left: `${meteor.startX}%`,
                top: `${meteor.startY}%`,
                width: `${meteor.size}px`,
                height: `${meteor.size * 40}px`,
                background: `linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, ${meteor.brightness}))`,
                borderRadius: "50%",
                transformOrigin: "top",
                transform: "rotate(225deg)",
              }}
              animate={{
                left: [`${meteor.startX}%`, `${meteor.endX}%`],
                top: [`${meteor.startY}%`, `${meteor.endY}%`],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: meteor.duration,
                delay: meteor.delay,
                repeat: Infinity,
                repeatDelay: 15 + Math.random() * 20,
                ease: "easeIn",
              }}
            />
          ))}

          {/* Enhanced grain texture overlay */}
          <div
            className="absolute inset-0 opacity-30 mix-blend-soft-light"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundSize: "200px 200px",
            }}
          />
        </div>

        {/* Content container with scroll effect - mouse tracking removed */}
        <motion.div
          className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center"
          animate={{
            y: scrollY * 0.12,
            opacity: 1 - scrollY * 0.0015,
          }}
        >
          {/* Enhanced glowing accent lights */}
          <div
            className="absolute w-72 h-72 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255, 87, 34, 0.18) 0%, transparent 70%)",
              filter: "blur(60px)",
              top: "-10%",
              left: "15%",
            }}
          />
          <div
            className="absolute w-96 h-96 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255, 111, 0, 0.15) 0%, transparent 70%)",
              filter: "blur(70px)",
              bottom: "-15%",
              right: "10%",
            }}
          />

          {/* Main content */}
          <div className="max-w-3xl mx-auto">
            {/* Heading with refined typography */}
            <motion.div
              variants={headingVariants}
              initial="hidden"
              animate="visible"
              className="mb-6 md:mb-12"
            >
              <motion.div
                className="overflow-hidden mb-2"
                variants={childVariants}
              >
                <h1
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-tight text-white"
                  style={{ fontFamily: "'Yesteryear', cursive" }}
                >
                  Order Online,
                </h1>
              </motion.div>

              <motion.div className="overflow-hidden" variants={childVariants}>
                <h1
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-tight text-orange-500"
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                  }}
                >
                  PICK UP HASSLE-FREE
                </h1>
              </motion.div>

              {/* Enhanced animated divider */}
              <motion.div
                className="h-1.5 w-24 sm:w-32 md:w-40 mx-auto bg-gradient-to-r from-orange-600 to-orange-400 rounded-full my-6 md:my-10 lg:my-12"
                variants={lineVariants}
              />

              {/* Refined subtitle */}
              <motion.p
                className="text-base sm:text-lg md:text-xl text-gray-300 max-w-xl mx-auto leading-relaxed px-4"
                variants={childVariants}
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 300,
                  letterSpacing: "0.01em",
                }}
              >
                Enjoy your order experience with secure payments and
                convenient pickup. Your meal will be ready to collect with your
                unique token number.
              </motion.p>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap="tap"
              className="mt-8 md:mt-12 flex justify-center"
            >
              <OrderNowButton />
            </motion.div>
          </div>
        </motion.div>
      </section>
      <About />
    </>
  );
};

export default Hero;
