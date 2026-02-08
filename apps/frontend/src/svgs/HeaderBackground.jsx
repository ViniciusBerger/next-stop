import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const ASPECT_RATIO = 345 / 412;

const HeaderBackground = ({ width = "100%", height = screenWidth * ASPECT_RATIO }) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 412 345"
      fill="none"
      preserveAspectRatio="none" // This ensures it covers the width without distortion
    >
      <Circle
        cx="195.5"
        cy="43.5"
        r="291.5"
        fill="url(#paint0_linear)"
      />

      <Path
        d="M487 43.5C486.211 74.0726 480.687 104.32 470.637 132.906C431.413 248.478 314.644 329.365 195.5 326C45.0641 327.395 -87.5227 192.172 -84 43.5C-84 43.5 -84 43.5 -84 43.5C-87.5227 -105.172 45.064 -240.395 195.5 -239C314.644 -242.365 431.413 -161.478 470.637 -45.9058C480.687 -17.3196 486.211 12.9274 487 43.5C487.811 12.9299 483.804 -17.8232 474.974 -47.3142C441.006 -166.485 322.53 -257.273 195.5 -257C35.3943 -263.156 -112.028 -118.37 -108 43.5C-112.028 205.37 35.3943 350.156 195.5 344C322.53 344.273 441.006 253.485 474.974 134.314C483.804 104.823 487.811 74.0702 487 43.5Z"
        fill="#2EE6A8"
      />

      <Defs>
        <LinearGradient
          id="paint0_linear"
          x1="195.5"
          y1="-248"
          x2="195.5"
          y2="335"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0.495192" stopColor="#4C6EF5" />
          <Stop offset="1" stopColor="#9775FA" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
};

export default HeaderBackground;
