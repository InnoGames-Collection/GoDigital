import React from 'react';

/**
 * CinematicPortalBackground
 * Renders the rich, cinematic adventure-gaming sunset environment:
 * - Golden-orange sky illumination (#FFAA24, #FFD35A, #F47B20)
 * - Layered mountain silhouettes and fantasy spires with bronze/amber rim lighting
 * - Warm atmospheric environmental haze and radial sunburst
 * - Deep warm-brown depth (#24170F, #352316) for readable game surfaces
 * - Zero external image dependencies: 100% local, scalable vector + CSS gradients
 */
export const CinematicPortalBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
    >
      {/* 1. Base Sky Radiance & Sunset Horizon Lighting */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 90% 45% at 50% 12%, rgba(255, 211, 90, 0.45) 0%, rgba(255, 170, 36, 0.35) 30%, rgba(244, 123, 32, 0.22) 55%, transparent 80%),
            radial-gradient(circle 600px at 80% 15%, rgba(255, 170, 36, 0.25) 0%, transparent 60%),
            radial-gradient(circle 500px at 20% 18%, rgba(201, 106, 34, 0.22) 0%, transparent 60%),
            linear-gradient(180deg, #3D2214 0%, #352316 28%, #2A1A10 52%, #24170F 75%, #190F0A 100%)
          `,
        }}
      />

      {/* 2. Atmospheric Sunset Sunburst Rays */}
      <svg
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[550px] opacity-25"
        viewBox="0 0 1400 550"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g opacity="0.6">
          <polygon points="700,40 250,550 320,550" fill="url(#sunrayGrad)" />
          <polygon points="700,40 450,550 510,550" fill="url(#sunrayGrad)" />
          <polygon points="700,40 640,550 680,550" fill="url(#sunrayGrad)" />
          <polygon points="700,40 720,550 760,550" fill="url(#sunrayGrad)" />
          <polygon points="700,40 890,550 950,550" fill="url(#sunrayGrad)" />
          <polygon points="700,40 1080,550 1150,550" fill="url(#sunrayGrad)" />
        </g>
        <defs>
          <linearGradient id="sunrayGrad" x1="700" y1="40" x2="700" y2="550" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFD35A" stopOpacity="0.8" />
            <stop offset="0.4" stopColor="#FFAA24" stopOpacity="0.3" />
            <stop offset="1" stopColor="#F47B20" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* 3. Layered Fantasy Scenery & Mountain Silhouettes */}
      <svg
        className="absolute top-6 left-0 right-0 w-full h-[320px] sm:h-[400px] md:h-[480px] object-cover"
        viewBox="0 0 1920 480"
        preserveAspectRatio="xMidYMin slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Distant Mountain Peaks with Golden Sunset Highlights */}
        <path
          d="M0 320 L120 280 L260 310 L410 240 L540 290 L680 220 L790 265 L940 190 L1070 250 L1210 205 L1350 270 L1490 215 L1640 285 L1780 230 L1920 300 L1920 480 L0 480 Z"
          fill="url(#distantMountainGrad)"
        />

        {/* Fantasy Spires & Castle Silhouettes in Horizon (Inspired by Reference) */}
        {/* Left Spire */}
        <path
          d="M380 240 L395 160 L402 110 L408 160 L425 240 Z"
          fill="#53311E"
          opacity="0.85"
        />
        <path
          d="M400 110 L402 85 L404 110 Z"
          fill="#FFAA24"
          opacity="0.9"
        />
        {/* Center-Right Grand Spire Peak */}
        <path
          d="M1170 220 L1190 140 L1200 95 L1206 140 L1225 220 Z"
          fill="#4A2B1A"
          opacity="0.8"
        />
        <path
          d="M1199 95 L1201 75 L1203 95 Z"
          fill="#FFD35A"
          opacity="0.8"
        />

        {/* Mid-Ground Mountain Silhouette */}
        <path
          d="M0 360 L180 320 L340 350 L510 300 L660 345 L820 280 L990 330 L1150 290 L1310 350 L1480 305 L1680 360 L1830 315 L1920 350 L1920 480 L0 480 Z"
          fill="url(#midMountainGrad)"
        />

        {/* Mid-Ground Ridge Highlight Rim */}
        <path
          d="M0 360 L180 320 L340 350 L510 300 L660 345 L820 280 L990 330 L1150 290 L1310 350 L1480 305 L1680 360 L1830 315 L1920 350"
          stroke="url(#rimHighlightGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Foreground Side Silhouettes (Left & Right Rocks / Foliage) */}
        <path
          d="M0 380 Q90 370 160 410 Q220 445 280 480 L0 480 Z"
          fill="url(#foreRockLeft)"
        />
        <path
          d="M1920 370 Q1830 365 1760 405 Q1700 440 1640 480 L1920 480 Z"
          fill="url(#foreRockRight)"
        />

        <defs>
          <linearGradient id="distantMountainGrad" x1="960" y1="180" x2="960" y2="480" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6C3E24" stopOpacity="0.75" />
            <stop offset="0.4" stopColor="#532F1A" stopOpacity="0.88" />
            <stop offset="1" stopColor="#352316" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="midMountainGrad" x1="960" y1="280" x2="960" y2="480" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4A2B1A" stopOpacity="0.9" />
            <stop offset="0.5" stopColor="#352316" />
            <stop offset="1" stopColor="#24170F" />
          </linearGradient>

          <linearGradient id="rimHighlightGrad" x1="0" y1="320" x2="1920" y2="320" gradientUnits="userSpaceOnUse">
            <stop stopColor="#C96A22" stopOpacity="0.4" />
            <stop offset="0.25" stopColor="#FFAA24" stopOpacity="0.85" />
            <stop offset="0.5" stopColor="#FFD35A" stopOpacity="0.95" />
            <stop offset="0.75" stopColor="#FFAA24" stopOpacity="0.85" />
            <stop offset="1" stopColor="#C96A22" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="foreRockLeft" x1="0" y1="380" x2="280" y2="480" gradientUnits="userSpaceOnUse">
            <stop stopColor="#352316" />
            <stop offset="1" stopColor="#24170F" />
          </linearGradient>

          <linearGradient id="foreRockRight" x1="1920" y1="370" x2="1640" y2="480" gradientUnits="userSpaceOnUse">
            <stop stopColor="#352316" />
            <stop offset="1" stopColor="#24170F" />
          </linearGradient>
        </defs>
      </svg>

      {/* 4. Golden Horizon Ambient Fog & Depth Scrim */}
      <div 
        className="absolute top-48 left-0 right-0 h-48 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255, 170, 36, 0.12) 0%, rgba(201, 106, 34, 0.08) 40%, transparent 100%)',
        }}
      />

      {/* 5. Deep Warm-Brown Content Scrim (protects text and game card readability) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(180deg, rgba(36, 23, 15, 0.15) 0%, rgba(36, 23, 15, 0.45) 280px, rgba(36, 23, 15, 0.8) 550px, #24170F 900px),
            radial-gradient(ellipse at 50% 100%, rgba(255, 170, 36, 0.06) 0%, transparent 60%)
          `,
        }}
      />
    </div>
  );
};

export default CinematicPortalBackground;
