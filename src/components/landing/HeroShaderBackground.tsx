'use client';

import { ShaderGradientCanvas, ShaderGradient } from 'shadergradient';

export function HeroShaderBackground() {
  return (
    <ShaderGradientCanvas pixelDensity={0.6} fov={45}>
      <ShaderGradient
        control="props"
        color1="#1a1230"
        color2="#4A0E0E"
        color3="#D4AF37"
        animate="on"
        uSpeed={0.3}
        uStrength={2.0}
        uDensity={1.5}
      />
    </ShaderGradientCanvas>
  );
}
