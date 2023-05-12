vec3 coords = normal;
coords.y += uTime / 1.5;
vec3 noisePattern = vec3(noise(coords));
float pattern = wave(noisePattern + uTime / 1000.0);

vDisplacement = pattern;

float displacement = vDisplacement / 3.0;

    transformed += normalize(objectNormal) * displacement;