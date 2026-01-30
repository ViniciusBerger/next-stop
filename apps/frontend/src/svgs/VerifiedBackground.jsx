import React from 'react';
import Svg, { Rect, Path, Defs, LinearGradient, Stop, G } from 'react-native-svg';

const VerifiedBackground = ({ 
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

      {/* The Email Icon (Centered) */}
      <G transform="translate(165, 45) scale(2.0)"> 
        <Path
          d="M2 4C0.895431 4 0 4.89543 0 6V34C0 35.1046 0.895431 36 2 36H38C39.1046 36 40 35.1046 40 34V6C40 4.89543 39.1046 4 38 4H2ZM36 8V8.36987L20 21.1462L4 8.36987V8H36ZM36 13.2519V32H4V13.2519L18.7454 25.0298C19.4851 25.6206 20.5149 25.6206 21.2546 25.0298L36 13.2519Z"
          fill="black"
        />
      </G>
    </Svg>
  );
};

export default VerifiedBackground;