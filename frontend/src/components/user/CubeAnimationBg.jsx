import React from "react";
import "./cube-animation.css";

const CubeAnimationBg = () => (
  <div className="cube-bg-container" style={{ opacity: 0.10, filter: 'blur(2px) drop-shadow(0 0 32px #a5b4fc88)' }}>
    <div className="cube-bg cube-bg-glow">
      <div className="face front"></div>
      <div className="face back"></div>
      <div className="face right"></div>
      <div className="face left"></div>
      <div className="face top"></div>
      <div className="face bottom"></div>
    </div>
  </div>
);

export default CubeAnimationBg; 