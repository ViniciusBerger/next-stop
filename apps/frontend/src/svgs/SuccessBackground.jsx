import React from 'react';
import Svg, { Rect, Circle, Path, Defs, LinearGradient, Stop, G } from 'react-native-svg';

const SuccessBackground = ({ 
  width = "100%", 
  height = 200 
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 412 120"
      fill="none"
    >
      <Defs>
        <LinearGradient
          id="paint0_linear"
          x1="206"
          y1="10"
          x2="206"
          y2="110"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#aa8ffa" />
          <Stop offset="1" stopColor="#7b93f5" />
        </LinearGradient>
      </Defs>

      {/* The Straight Bar */}
      <Rect
        x="-10"
        y="10"
        width="500"
        height="140"
        rx="0" 
        fill="url(#paint0_linear)"
        stroke="#42E8A8"
        strokeWidth="10"
      />

      {/* Centered Group for the Circle and Checkmark */}
      <G transform="translate(206, 80) scale(1.5)">
        {/* Green Circle */}
        <Circle
          cx="0"
          cy="0"
          r="35"
          fill="#30d25e"
        />

        {/* White Checkmark */}
        {/* Scaled and shifted to center inside the 35r circle */}
        <Path
          d="M-15 0 L-5 10 L 15 -12"
          fill="none"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
};

export default SuccessBackground;