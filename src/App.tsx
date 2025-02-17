import { useState, useEffect } from "react";
import moment from "moment-timezone";
import confetti from "canvas-confetti";
import logo from "./logo.png";

const YC_RESPONSE_DATE = "2025-03-12T23:59:00-08:00"; // Pacific Time
const SF_TIMEZONE = "America/Los_Angeles";

const fireConfetti = () => {
  // First burst
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 1000,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  // Colorful burst with YC colors
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ["#ff6b00", "#ff9a3d", "#ffbc7d"],
  });

  fire(0.2, {
    spread: 60,
    colors: ["#ff6b00", "#ff9a3d", "#ffbc7d"],
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ["#ff6b00", "#ff9a3d", "#ffbc7d"],
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors: ["#ff6b00", "#ff9a3d", "#ffbc7d"],
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ["#ff6b00", "#ff9a3d", "#ffbc7d"],
  });

  // Set up continuous celebratory effect
  setTimeout(() => {
    const interval = setInterval(() => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#ff6b00", "#ff9a3d", "#ffbc7d"],
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#ff6b00", "#ff9a3d", "#ffbc7d"],
      });
    }, 40);

    // Stop after 3 seconds
    setTimeout(() => {
      clearInterval(interval);
    }, 3000);
  }, 1500);
};

const CountdownApp = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [userTimeZone, setUserTimeZone] = useState("UTC");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Get user's timezone with fallback
    try {
      const timeZone = moment.tz.guess();
      setUserTimeZone(timeZone);
    } catch (error) {
      console.warn("Failed to detect timezone, using UTC:", error);
      setUserTimeZone("UTC");
    }

    const calculateTimeLeft = () => {
      const now = new Date();
      setCurrentTime(now);
      const targetDate = moment.tz(YC_RESPONSE_DATE, SF_TIMEZONE);
      const difference = targetDate.diff(moment());

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        if (!showConfetti) {
          setShowConfetti(true);
          fireConfetti();
        }
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [showConfetti]);

  // Format the date with error handling
  let formattedLocalDate = "";
  try {
    formattedLocalDate = moment
      .tz(YC_RESPONSE_DATE, userTimeZone)
      .format("MMM D, YYYY h:mm A z");
  } catch (error) {
    console.warn("Error formatting date:", error);
    formattedLocalDate = new Date(YC_RESPONSE_DATE).toLocaleString();
  }

  // Format SF time
  const formattedSFTime = moment
    .tz(currentTime, SF_TIMEZONE)
    .format("MMM Do hh:mm");

  const timeUnits = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <main className="min-h-screen text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto text-center space-y-8">
        <div>
          <img src={logo} alt="" className="h-12 mx-auto" />
        </div>

        <div className="grid grid-cols-4 gap-3">
          {timeUnits.map(({ label, value }) => (
            <div key={label} className="bg-gray-100 rounded-lg p-3">
              <div className="text-2xl font-mono font-bold text-orange-500">
                {typeof value === "number" ? value : 0}
              </div>
              <div className="text-xs text-gray-400 uppercase font-mono">
                {label}
              </div>
            </div>
          ))}
        </div>

        <div className="text-sm text-gray-400 space-y-1">
          <p>Decisions by: {formattedLocalDate}</p>
          <p className="text-xs space-y-1">
            <span className="block">Your timezone: {userTimeZone}</span>
            <span className="block">
              Current time in SF: {formattedSFTime} PT
            </span>
          </p>
        </div>

        <p className="text-sm font-medium text-orange-500">
          {showConfetti ? "Decisions are out!" : "Keep building until then!"}
        </p>
      </div>
    </main>
  );
};

export default CountdownApp;
