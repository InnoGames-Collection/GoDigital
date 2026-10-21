/**
 * Hill Climb 3D - High-Precision 3D Rally Off-Road Buggy & SUV Model
 * 
 * 3D Mesh Hierarchy:
 * - Root Vehicle Group
 *   - Chassis & Bodywork:
 *     - Lower chassis tub & skid plate
 *     - Sculpted rally body panels (metallic royal blue + lime accents)
 *     - Hood air scoop & roof ventilation intake
 *     - Tinted windshield & side windows
 *     - Heavy-duty roll cage structure
 *     - Cockpit interior (bucket seat, steering wheel, dashboard)
 *     - Heavy-duty front bull-bar bumper with skid plate
 *     - Rear rally spoiler & dual chrome exhaust pipes
 *     - High-intensity LED headlights & red taillights
 *     - Real-time contact shadow plane
 *   - 4 Dynamic Suspension Struts (coiled springs + damper shafts)
 *   - 4 Independent 3D Wheels (knobby tires, tread lugs, alloy rims, center caps)
 */

import * as THREE from 'three';

export const CHASSIS_LENGTH = 3.6;
export const CHASSIS_WIDTH = 2.1;
export const CHASSIS_HEIGHT = 1.4;
export const WHEEL_RADIUS = 0.68;
export const WHEEL_WIDTH = 0.48;
export const WHEEL_BASE = 2.5; // Distance between front & rear axles
export const TRACK_WIDTH = 2.2; // Distance between left & right wheels

export interface VehicleMeshRig {
  rootGroup: THREE.Group;
  chassisGroup: THREE.Group;
  wheels: {
    rearLeft: THREE.Group;
    rearRight: THREE.Group;
    frontLeft: THREE.Group;
    frontRight: THREE.Group;
  };
  suspensionCoils: {
    rearLeft: THREE.Mesh;
    rearRight: THREE.Mesh;
    frontLeft: THREE.Mesh;
    frontRight: THREE.Mesh;
  };
  suspensionShafts: {
    rearLeft: THREE.Mesh;
    rearRight: THREE.Mesh;
    frontLeft: THREE.Mesh;
    frontRight: THREE.Mesh;
  };
  headlights: THREE.Mesh[];
  exhaustPipes: THREE.Mesh[];
  shadowMesh: THREE.Mesh;
}

/**
 * Creates the high-detail 3D Rally Off-Road Vehicle Rig
 */
export function createVehicle3D(): VehicleMeshRig {
  const rootGroup = new THREE.Group();
  const chassisGroup = new THREE.Group();
  rootGroup.add(chassisGroup);

  // High-Quality Metallic & Matte Automotive Materials
  const metallicBlueMat = new THREE.MeshStandardMaterial({
    color: 0x1688C9, // TelePlus Royal Sky Blue
    metalness: 0.8,
    roughness: 0.2,
  });

  const vibrantLimeMat = new THREE.MeshStandardMaterial({
    color: 0x8BCB3D, // TelePlus Vibrant Lime
    metalness: 0.65,
    roughness: 0.25,
  });

  const carbonChassisMat = new THREE.MeshStandardMaterial({
    color: 0x1c2028,
    metalness: 0.5,
    roughness: 0.7,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    metalness: 0.95,
    roughness: 0.12,
  });

  const rollCageMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.85,
    roughness: 0.25,
  });

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.9,
    roughness: 0.1,
    transparent: true,
    opacity: 0.85,
  });

  const tireRubberMat = new THREE.MeshStandardMaterial({
    color: 0x14181f,
    roughness: 0.92,
    metalness: 0.08,
  });

  const springCoilMat = new THREE.MeshStandardMaterial({
    color: 0xef4444, // Red Racing Springs
    metalness: 0.75,
    roughness: 0.25,
  });

  const headlightEmissiveMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 1.2,
  });

  const taillightEmissiveMat = new THREE.MeshStandardMaterial({
    color: 0xff2222,
    emissive: 0xff1111,
    emissiveIntensity: 1.0,
  });

  // ==========================================
  // 1. SCULPTED CHASSIS & BODYWORK
  // ==========================================
  // Lower Tub Chassis
  const lowerTubGeo = new THREE.BoxGeometry(CHASSIS_LENGTH, 0.42, CHASSIS_WIDTH - 0.35);
  const lowerTubMesh = new THREE.Mesh(lowerTubGeo, carbonChassisMat);
  lowerTubMesh.position.set(0, 0.22, 0);
  lowerTubMesh.castShadow = true;
  chassisGroup.add(lowerTubMesh);

  // Main Slanted Hood
  const hoodGeo = new THREE.BoxGeometry(1.4, 0.38, CHASSIS_WIDTH - 0.45);
  const hoodMesh = new THREE.Mesh(hoodGeo, metallicBlueMat);
  hoodMesh.position.set(1.0, 0.52, 0);
  hoodMesh.rotation.z = -0.1;
  hoodMesh.castShadow = true;
  chassisGroup.add(hoodMesh);

  // Hood Power Bulge / Air Scoop
  const scoopGeo = new THREE.BoxGeometry(0.7, 0.12, 0.65);
  const scoopMesh = new THREE.Mesh(scoopGeo, vibrantLimeMat);
  scoopMesh.position.set(1.0, 0.74, 0);
  scoopMesh.rotation.z = -0.1;
  scoopMesh.castShadow = true;
  chassisGroup.add(scoopMesh);

  // Rear Engine Deck
  const rearDeckGeo = new THREE.BoxGeometry(1.1, 0.45, CHASSIS_WIDTH - 0.45);
  const rearDeckMesh = new THREE.Mesh(rearDeckGeo, metallicBlueMat);
  rearDeckMesh.position.set(-1.15, 0.58, 0);
  rearDeckMesh.castShadow = true;
  chassisGroup.add(rearDeckMesh);

  // Rear Rally Wing Spoiler
  const wingGeo = new THREE.BoxGeometry(0.5, 0.08, CHASSIS_WIDTH - 0.1);
  const wingMesh = new THREE.Mesh(wingGeo, vibrantLimeMat);
  wingMesh.position.set(-1.6, 1.25, 0);
  wingMesh.rotation.z = 0.15;
  wingMesh.castShadow = true;
  chassisGroup.add(wingMesh);

  // Spoiler Struts
  const strutGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 6);
  [-0.6, 0.6].forEach((zOffset) => {
    const s = new THREE.Mesh(strutGeo, rollCageMat);
    s.position.set(-1.55, 1.0, zOffset);
    s.rotation.z = -0.2;
    chassisGroup.add(s);
  });

  // ==========================================
  // 1B. FRONT WINCH, SHACKLES & RALLY FOG PODS
  // ==========================================
  // Front Heavy-Duty Winch Housing & Cable Drum
  const winchBodyGeo = new THREE.BoxGeometry(0.32, 0.22, 0.48);
  const winchBody = new THREE.Mesh(winchBodyGeo, carbonChassisMat);
  winchBody.position.set(CHASSIS_LENGTH / 2 + 0.16, 0.28, 0);
  chassisGroup.add(winchBody);

  const winchDrumGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.28, 12);
  winchDrumGeo.rotateX(Math.PI / 2);
  const winchDrum = new THREE.Mesh(winchDrumGeo, chromeMat);
  winchDrum.position.set(CHASSIS_LENGTH / 2 + 0.20, 0.28, 0);
  chassisGroup.add(winchDrum);

  // Recovery D-Rings (Orange Powdercoated)
  const shackleMat = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    metalness: 0.8,
    roughness: 0.2,
  });
  const shackleGeo = new THREE.TorusGeometry(0.07, 0.022, 6, 12);
  [-0.32, 0.32].forEach((zOff) => {
    const shackle = new THREE.Mesh(shackleGeo, shackleMat);
    shackle.position.set(CHASSIS_LENGTH / 2 + 0.22, 0.16, zOff);
    shackle.rotation.y = Math.PI / 2;
    chassisGroup.add(shackle);
  });

  // Dual Amber Rally Fog Light Pods on Bull-Bar
  const fogLensMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.85,
    roughness: 0.1,
  });
  const fogHousingGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.10, 10);
  fogHousingGeo.rotateZ(Math.PI / 2);
  [-0.32, 0.32].forEach((zOff) => {
    const fogPod = new THREE.Mesh(fogHousingGeo, carbonChassisMat);
    fogPod.position.set(CHASSIS_LENGTH / 2 + 0.16, 0.44, zOff);
    chassisGroup.add(fogPod);

    const fogLens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.10, 0.10, 0.04, 10).rotateZ(Math.PI / 2),
      fogLensMat
    );
    fogLens.position.set(CHASSIS_LENGTH / 2 + 0.21, 0.44, zOff);
    chassisGroup.add(fogLens);
  });

  // ==========================================
  // 2. CABIN, ROLL CAGE & WINDSHIELD
  // ==========================================
  // Slanted Windshield
  const windshieldGeo = new THREE.BoxGeometry(0.8, 0.65, CHASSIS_WIDTH - 0.55);
  const windshield = new THREE.Mesh(windshieldGeo, glassMat);
  windshield.position.set(0.18, 0.95, 0);
  windshield.rotation.z = -0.55;
  windshield.castShadow = true;
  chassisGroup.add(windshield);

  // Cabin Roof
  const roofGeo = new THREE.BoxGeometry(1.0, 0.1, CHASSIS_WIDTH - 0.55);
  const roofMesh = new THREE.Mesh(roofGeo, metallicBlueMat);
  roofMesh.position.set(-0.35, 1.25, 0);
  roofMesh.castShadow = true;
  chassisGroup.add(roofMesh);

  // Safari Roof Rack Basket
  const rackMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.9,
    roughness: 0.2,
  });
  const rackFrameGeo = new THREE.BoxGeometry(0.92, 0.10, CHASSIS_WIDTH - 0.52);
  const rackFrame = new THREE.Mesh(rackFrameGeo, rackMat);
  rackFrame.position.set(-0.35, 1.34, 0);
  chassisGroup.add(rackFrame);

  // Roof Mounted Full-Size Spare Off-Road Wheel
  const spareWheelGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.30, 14);
  const spareWheel = new THREE.Mesh(spareWheelGeo, tireRubberMat);
  spareWheel.position.set(-0.38, 1.46, 0);
  spareWheel.rotation.x = Math.PI / 2;
  spareWheel.rotation.z = -0.15;
  spareWheel.castShadow = true;
  chassisGroup.add(spareWheel);

  const spareRimGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.32, 10);
  const spareRim = new THREE.Mesh(spareRimGeo, chromeMat);
  spareRim.position.set(-0.38, 1.46, 0);
  spareRim.rotation.x = Math.PI / 2;
  spareRim.rotation.z = -0.15;
  chassisGroup.add(spareRim);

  // Spare Wheel Tie-Down Ratchet Straps (Yellow)
  const strapMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.7 });
  const strapGeo = new THREE.BoxGeometry(0.04, 0.04, 1.12);
  const strap = new THREE.Mesh(strapGeo, strapMat);
  strap.position.set(-0.38, 1.63, 0);
  chassisGroup.add(strap);

  // Roof Front 5-Pod High-Intensity LED Light Bar
  const lightBarMountGeo = new THREE.BoxGeometry(0.08, 0.08, CHASSIS_WIDTH - 0.55);
  const lightBarMount = new THREE.Mesh(lightBarMountGeo, carbonChassisMat);
  lightBarMount.position.set(0.12, 1.38, 0);
  chassisGroup.add(lightBarMount);

  const podGeo = new THREE.BoxGeometry(0.08, 0.07, 0.16);
  const podLensMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 1.5,
  });
  [-0.48, -0.24, 0, 0.24, 0.48].forEach((zOff) => {
    const pod = new THREE.Mesh(podGeo, podLensMat);
    pod.position.set(0.16, 1.38, zOff);
    chassisGroup.add(pod);
  });

  // Cockpit Bucket Seat & Driver Figure with Helmet
  const seatGeo = new THREE.BoxGeometry(0.5, 0.65, 0.5);
  const seatMesh = new THREE.Mesh(seatGeo, rollCageMat);
  seatMesh.position.set(-0.25, 0.65, 0);
  chassisGroup.add(seatMesh);

  // Driver Helmet & Visor
  const helmetMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    metalness: 0.35,
    roughness: 0.2,
  });
  const helmetGeo = new THREE.SphereGeometry(0.17, 12, 10);
  const helmet = new THREE.Mesh(helmetGeo, helmetMat);
  helmet.position.set(-0.16, 1.05, 0);
  chassisGroup.add(helmet);

  const visorMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    metalness: 0.95,
    roughness: 0.05,
  });
  const visorGeo = new THREE.BoxGeometry(0.13, 0.08, 0.22);
  const visor = new THREE.Mesh(visorGeo, visorMat);
  visor.position.set(-0.08, 1.05, 0);
  chassisGroup.add(visor);

  const wheelGeo = new THREE.TorusGeometry(0.14, 0.03, 6, 12);
  const steeringWheel = new THREE.Mesh(wheelGeo, vibrantLimeMat);
  steeringWheel.position.set(0.2, 0.82, 0);
  steeringWheel.rotation.y = Math.PI / 2;
  steeringWheel.rotation.z = -0.3;
  chassisGroup.add(steeringWheel);

  // ==========================================
  // 3. LIGHTS & DUAL EXHAUST
  // ==========================================
  const headlights: THREE.Mesh[] = [];
  const headlightGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 8);
  headlightGeo.rotateZ(Math.PI / 2);

  [-0.65, 0.65].forEach((zOffset) => {
    const hl = new THREE.Mesh(headlightGeo, headlightEmissiveMat);
    hl.position.set(CHASSIS_LENGTH / 2 - 0.05, 0.48, zOffset);
    chassisGroup.add(hl);
    headlights.push(hl);
  });

  // Rear LED Taillights
  const taillightGeo = new THREE.BoxGeometry(0.08, 0.12, 0.3);
  [-0.7, 0.7].forEach((zOffset) => {
    const tl = new THREE.Mesh(taillightGeo, taillightEmissiveMat);
    tl.position.set(-CHASSIS_LENGTH / 2 + 0.05, 0.55, zOffset);
    chassisGroup.add(tl);
  });

  // Dual Chrome Exhaust Pipes
  const exhaustPipes: THREE.Mesh[] = [];
  const exhaustGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.3, 8);
  exhaustGeo.rotateZ(Math.PI / 2);

  [-0.3, 0.3].forEach((zOffset) => {
    const pipe = new THREE.Mesh(exhaustGeo, chromeMat);
    pipe.position.set(-CHASSIS_LENGTH / 2 - 0.12, 0.25, zOffset);
    chassisGroup.add(pipe);
    exhaustPipes.push(pipe);
  });

  // Heavy-Duty Rally Mud Flaps behind Rear Wheels
  const mudflapMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.95 });
  const mudflapTrimMat = new THREE.MeshStandardMaterial({ color: 0x8BCB3D, roughness: 0.35 });
  const mudflapGeo = new THREE.BoxGeometry(0.04, 0.36, 0.30);
  [-0.92, 0.92].forEach((zOffset) => {
    const flap = new THREE.Mesh(mudflapGeo, mudflapMat);
    flap.position.set(-CHASSIS_LENGTH / 2 - 0.04, 0.12, zOffset);
    flap.rotation.z = 0.08;
    chassisGroup.add(flap);

    const trim = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.06, 0.30), mudflapTrimMat);
    trim.position.set(-CHASSIS_LENGTH / 2 - 0.04, -0.03, zOffset);
    chassisGroup.add(trim);
  });

  // ==========================================
  // 4. SUSPENSION STRUTS (4 DYNAMIC COILS)
  // ==========================================
  const suspensionCoils = {
    rearLeft: createSpringMesh(springCoilMat),
    rearRight: createSpringMesh(springCoilMat),
    frontLeft: createSpringMesh(springCoilMat),
    frontRight: createSpringMesh(springCoilMat),
  };

  const suspensionShafts = {
    rearLeft: createShaftMesh(chromeMat),
    rearRight: createShaftMesh(chromeMat),
    frontLeft: createShaftMesh(chromeMat),
    frontRight: createShaftMesh(chromeMat),
  };

  const halfWB = WHEEL_BASE / 2;
  const halfTW = TRACK_WIDTH / 2;

  // Mount suspension to chassis
  suspensionCoils.rearLeft.position.set(-halfWB, -0.15, -halfTW);
  suspensionCoils.rearRight.position.set(-halfWB, -0.15, halfTW);
  suspensionCoils.frontLeft.position.set(halfWB, -0.15, -halfTW);
  suspensionCoils.frontRight.position.set(halfWB, -0.15, halfTW);

  chassisGroup.add(suspensionCoils.rearLeft);
  chassisGroup.add(suspensionCoils.rearRight);
  chassisGroup.add(suspensionCoils.frontLeft);
  chassisGroup.add(suspensionCoils.frontRight);

  suspensionShafts.rearLeft.position.set(-halfWB, -0.15, -halfTW);
  suspensionShafts.rearRight.position.set(-halfWB, -0.15, halfTW);
  suspensionShafts.frontLeft.position.set(halfWB, -0.15, -halfTW);
  suspensionShafts.frontRight.position.set(halfWB, -0.15, halfTW);

  chassisGroup.add(suspensionShafts.rearLeft);
  chassisGroup.add(suspensionShafts.rearRight);
  chassisGroup.add(suspensionShafts.frontLeft);
  chassisGroup.add(suspensionShafts.frontRight);

  // ==========================================
  // 5. 4 INDEPENDENT OFF-ROAD WHEELS
  // ==========================================
  const wheels = {
    rearLeft: createOffRoadWheel(tireRubberMat, chromeMat, vibrantLimeMat),
    rearRight: createOffRoadWheel(tireRubberMat, chromeMat, vibrantLimeMat),
    frontLeft: createOffRoadWheel(tireRubberMat, chromeMat, vibrantLimeMat),
    frontRight: createOffRoadWheel(tireRubberMat, chromeMat, vibrantLimeMat),
  };

  // Attach wheel groups directly to root so they stay physically positioned
  rootGroup.add(wheels.rearLeft);
  rootGroup.add(wheels.rearRight);
  rootGroup.add(wheels.frontLeft);
  rootGroup.add(wheels.frontRight);

  // ==========================================
  // 6. REALISTIC SOFT GROUND CONTACT SHADOW
  // ==========================================
  const shadowGeo = new THREE.PlaneGeometry(CHASSIS_LENGTH + 0.8, TRACK_WIDTH + 0.6);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const sCtx = shadowCanvas.getContext('2d');
  if (sCtx) {
    const sGrad = sCtx.createRadialGradient(64, 64, 10, 64, 64, 60);
    sGrad.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
    sGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.35)');
    sGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 128, 128);
  }
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    depthWrite: false,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.position.y = 0.05;
  rootGroup.add(shadowMesh);

  return {
    rootGroup,
    chassisGroup,
    wheels,
    suspensionCoils,
    suspensionShafts,
    headlights,
    exhaustPipes,
    shadowMesh,
  };
}

/**
 * Creates 3D Knobby Off-Road Wheel with vented brake disc, red caliper, sculpted 5-spoke alloy rim, and tread lugs
 */
function createOffRoadWheel(
  tireMat: THREE.Material,
  rimMat: THREE.Material,
  accentMat: THREE.Material
): THREE.Group {
  const wheelGroup = new THREE.Group();

  // 1. Main Tire Cylinder (oriented along Z-axis)
  const tireGeo = new THREE.CylinderGeometry(WHEEL_RADIUS, WHEEL_RADIUS, WHEEL_WIDTH, 18);
  tireGeo.rotateX(Math.PI / 2);
  const tireMesh = new THREE.Mesh(tireGeo, tireMat);
  tireMesh.castShadow = true;
  wheelGroup.add(tireMesh);

  // 2. Aggressive Knobby Tire Tread Lugs (14 alternating blocks)
  const lugGeo = new THREE.BoxGeometry(0.16, 0.08, WHEEL_WIDTH - 0.04);
  const numLugs = 14;
  for (let i = 0; i < numLugs; i++) {
    const angle = (i / numLugs) * Math.PI * 2;
    const lug = new THREE.Mesh(lugGeo, tireMat);
    lug.position.set(
      Math.cos(angle) * (WHEEL_RADIUS + 0.02),
      Math.sin(angle) * (WHEEL_RADIUS + 0.02),
      0
    );
    lug.rotation.z = angle;
    lug.castShadow = true;
    wheelGroup.add(lug);
  }

  // 3. Vented Steel Brake Rotor Disc
  const brakeMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.9,
    roughness: 0.25,
  });
  const discGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.04, 16);
  discGeo.rotateX(Math.PI / 2);
  const discMesh = new THREE.Mesh(discGeo, brakeMat);
  wheelGroup.add(discMesh);

  // 4. Red Racing Brake Caliper
  const caliperMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    metalness: 0.6,
    roughness: 0.3,
  });
  const caliperGeo = new THREE.BoxGeometry(0.12, 0.20, 0.08);
  const caliper = new THREE.Mesh(caliperGeo, caliperMat);
  caliper.position.set(0.20, 0.16, 0);
  wheelGroup.add(caliper);

  // 5. Outer Alloy Rim Barrel
  const rimGeo = new THREE.CylinderGeometry(0.42, 0.42, WHEEL_WIDTH + 0.02, 16);
  rimGeo.rotateX(Math.PI / 2);
  const rimMesh = new THREE.Mesh(rimGeo, rimMat);
  rimMesh.castShadow = true;
  wheelGroup.add(rimMesh);

  // 6. 5-Spoke Alloy Wheel Star Pattern
  const spokeGeo = new THREE.BoxGeometry(0.07, 0.24, 0.05);
  for (let s = 0; s < 5; s++) {
    const spokeAngle = (s / 5) * Math.PI * 2;
    const spoke = new THREE.Mesh(spokeGeo, rimMat);
    spoke.position.set(Math.cos(spokeAngle) * 0.22, Math.sin(spokeAngle) * 0.22, WHEEL_WIDTH / 2 - 0.02);
    spoke.rotation.z = spokeAngle - Math.PI / 2;
    wheelGroup.add(spoke);
  }

  // 7. Center Hub Cap (Vibrant Lime Accent with Silver Lug Nuts)
  const hubGeo = new THREE.CylinderGeometry(0.16, 0.16, WHEEL_WIDTH + 0.06, 10);
  hubGeo.rotateX(Math.PI / 2);
  const hubMesh = new THREE.Mesh(hubGeo, accentMat);
  wheelGroup.add(hubMesh);

  return wheelGroup;
}

/**
 * Creates 3D Suspension Spring Coil Mesh
 */
function createSpringMesh(mat: THREE.Material): THREE.Mesh {
  const springGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.7, 8);
  const springMesh = new THREE.Mesh(springGeo, mat);
  springMesh.castShadow = true;
  return springMesh;
}

/**
 * Creates 3D Damper Shaft Mesh
 */
function createShaftMesh(mat: THREE.Material): THREE.Mesh {
  const shaftGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.85, 6);
  const shaftMesh = new THREE.Mesh(shaftGeo, mat);
  return shaftMesh;
}

/**
 * Updates 3D Vehicle Transformations, Wheel Rotation, and Dynamic Suspension Travel
 */
export function updateVehicleMeshTransform(
  rig: VehicleMeshRig,
  x: number,
  y: number,
  z: number,
  pitch: number,
  roll: number,
  yaw: number,
  wheelRotation: number,
  rearComp: number,
  frontComp: number,
  flComp?: number,
  frComp?: number,
  rlComp?: number,
  rrComp?: number
) {
  // 1. Position and Orient Root Group
  rig.rootGroup.position.set(x, y, z);
  rig.rootGroup.rotation.set(roll, yaw, pitch);

  // 4-Wheel individual compressions with fallbacks
  const cFL = flComp !== undefined ? flComp : frontComp;
  const cFR = frComp !== undefined ? frComp : frontComp;
  const cRL = rlComp !== undefined ? rlComp : rearComp;
  const cRR = rrComp !== undefined ? rrComp : rearComp;

  // 2. Adjust Suspension Travel Scale on Individual Coils
  rig.suspensionCoils.rearLeft.scale.y = Math.max(0.30, 1.0 - cRL * 0.55);
  rig.suspensionCoils.rearRight.scale.y = Math.max(0.30, 1.0 - cRR * 0.55);
  rig.suspensionCoils.frontLeft.scale.y = Math.max(0.30, 1.0 - cFL * 0.55);
  rig.suspensionCoils.frontRight.scale.y = Math.max(0.30, 1.0 - cFR * 0.55);

  // 3. Update Wheel Physical Offsets Relative to Chassis
  const halfWB = WHEEL_BASE / 2;
  const halfTW = TRACK_WIDTH / 2;
  const restY = -0.55;

  const rlY = restY + cRL * 0.35;
  const rrY = restY + cRR * 0.35;
  const flY = restY + cFL * 0.35;
  const frY = restY + cFR * 0.35;

  // Rear Wheels
  rig.wheels.rearLeft.position.set(-halfWB, rlY, -halfTW);
  rig.wheels.rearRight.position.set(-halfWB, rrY, halfTW);

  // Front Wheels
  rig.wheels.frontLeft.position.set(halfWB, flY, -halfTW);
  rig.wheels.frontRight.position.set(halfWB, frY, halfTW);

  // 4. Spin Wheels around Axle (Z-axis rotation)
  rig.wheels.rearLeft.rotation.z = wheelRotation;
  rig.wheels.rearRight.rotation.z = wheelRotation;
  rig.wheels.frontLeft.rotation.z = wheelRotation;
  rig.wheels.frontRight.rotation.z = wheelRotation;

  // 5. Dynamic Ground Contact Shadow (Softens & expands when airborne)
  const avgComp = (cFL + cFR + cRL + cRR) / 4;
  const droopAmount = Math.max(0, 0.28 - avgComp);
  rig.shadowMesh.scale.set(1.0 + droopAmount * 0.75, 1.0 + droopAmount * 0.75, 1.0);
  if (rig.shadowMesh.material && 'opacity' in rig.shadowMesh.material) {
    (rig.shadowMesh.material as THREE.Material & { opacity: number }).opacity = Math.max(
      0.18,
      0.75 - droopAmount * 1.4
    );
  }
  rig.shadowMesh.position.y = -0.58;
}
