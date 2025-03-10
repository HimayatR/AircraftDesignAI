import * as THREE from 'three';

export function generateAircraft(params) {
    const { aircraftType, wingShape, engineCount, enginePlacement, tailType } = params;

    console.log("Generating aircraft with params:", params);

    const group = new THREE.Group();

    /*** FUSELAGE ***/
    let fuselageRadius, fuselageLength, noseLength;
    if (aircraftType === "fighter") {
        fuselageRadius = 0.4;
        fuselageLength = 6;
        noseLength = 1.2;
    } else { // Airliner
        fuselageRadius = 1.2;
        fuselageLength = 30;
        noseLength = 3;
    }

    const fuselageGeometry = new THREE.CylinderGeometry(fuselageRadius, fuselageRadius, fuselageLength, 32);
    const fuselageMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);

    // Using Euler angles for rotation
    fuselage.rotation.set(0, Math.PI / 2, Math.PI / 2);
    group.add(fuselage);

    // Nose cone
    const noseGeometry = new THREE.ConeGeometry(fuselageRadius, noseLength, 32);
    const nose = new THREE.Mesh(noseGeometry, fuselageMaterial);
    nose.rotation.set(0, Math.PI / 2, Math.PI / 2); // Match fuselage rotation
    nose.position.set(0, 0, fuselageLength / 2 + noseLength / 2); // In front along Z-axis
    group.add(nose);

    console.log("Fuselage and nose created");

    /*** WINGS ***/
    let wingSpan, wingDepth, wingThickness, wingPosition;
    if (aircraftType === "fighter") {
        wingSpan = 5;
        wingDepth = 1.5;
        wingThickness = 0.1;
        wingPosition = 0;
    } else { // Airliner
        wingSpan = 20;
        wingDepth = 2;
        wingThickness = 0.15;
        wingPosition = -5;
    }

    const wingGeometry = new THREE.BoxGeometry(wingSpan, wingThickness, wingDepth);
    const wingMaterial = new THREE.MeshStandardMaterial({ color: 0x404040 });

    // Left Wing
    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    //  leftWing.position.set(-wingSpan / 2 - fuselageRadius, wingPosition, 0);
    leftWing.position.set((wingShape === "swept") ? -wingSpan / 3 - fuselageRadius : -wingSpan / 2 - fuselageRadius, 0, wingPosition);

    leftWing.rotation.set(0, (wingShape === "swept") ? -Math.PI / 6 : 0, 0);
    group.add(leftWing);

    // Right Wing
    const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    // rightWing.position.set(wingSpan / 2 + fuselageRadius, wingPosition, 0);
    rightWing.position.set((wingShape === "swept") ? wingSpan / 3 + fuselageRadius : wingSpan / 2 + fuselageRadius, 0, wingPosition);
    rightWing.rotation.set(0, (wingShape === "swept") ? Math.PI / 6 : 0, 0);
    group.add(rightWing);

    console.log("Wings created");

    /*** ENGINES ***/
    let engineRadius, engineLength, engineOffset;
    if (aircraftType === "fighter") {
        engineRadius = 0.3;
        engineLength = 1;
        engineOffset = fuselageLength / 2 - 0.5;
    } else { // Airliner
        engineRadius = 1;
        engineLength = 3;
        engineOffset = wingSpan / 4;
    }

    for (let i = 0; i < engineCount; i++) {
        const engineGeometry = new THREE.CylinderGeometry(engineRadius, engineRadius, engineLength, 32);
        const engineMaterial = new THREE.MeshStandardMaterial({ color: 0x202020 });
        const engine = new THREE.Mesh(engineGeometry, engineMaterial);

        // Using Euler angles for rotation
        engine.rotation.set(0, Math.PI / 2, Math.PI / 2);

        if (enginePlacement === "wing" && aircraftType === "airliner") {
            engine.position.set(
                (i === 0 ? -wingSpan / 4 : wingSpan / 4), // Left and right engines
                -fuselageRadius - engineRadius,           // Under the wings
                wingPosition                              // Aligned with wing's position
            );
        } else {
            engine.position.set(0, -0.3, engineOffset - (i * 1.2));
        }
        group.add(engine);
    }

    console.log("Engines created");

    /*** TAIL FIN ***/
    let tailWidth = (aircraftType === "fighter") ? 0.6 : 2;
    let tailHeight = (aircraftType === "fighter") ? 1.5 : 5;
    let tailPosition = -fuselageLength / 2 - 0.2;

    const tailGeometry = new THREE.BoxGeometry(tailWidth, tailHeight, 0.1);
    const tail = new THREE.Mesh(tailGeometry, fuselageMaterial);
    tail.position.set(0, (wingShape === "swept") ? tailHeight / 3 : tailHeight / 2, tailPosition);

    // Tail rotation using Euler angles
    tail.rotation.set((wingShape === "swept") ? -Math.PI / 4 : 0, Math.PI / 2, 0);
    group.add(tail);

    if (tailType === "twin") {
        const twinTailLeft = tail.clone();
        const twinTailRight = tail.clone();
        twinTailLeft.position.x = -tailWidth - fuselageRadius;
        twinTailRight.position.x = tailWidth + fuselageRadius;
        twinTailLeft.rotation.set(0, Math.PI / 12, 0);
        twinTailRight.rotation.set(0, -Math.PI / 12, 0);
        group.add(twinTailLeft);
        group.add(twinTailRight);
    }

    console.log("Tail created");

    /*** HORIZONTAL STABILIZERS ***/
    let stabSpan = (aircraftType === "fighter") ? 2 : 8;
    let stabDepth = 0.6;
    let stabThickness = 0.1;

    const stabGeometry = new THREE.BoxGeometry(stabSpan, stabThickness, stabDepth);

    // Left Stabilizer
    const leftStab = new THREE.Mesh(stabGeometry, fuselageMaterial);
    leftStab.position.set((wingShape === "swept") ? -stabSpan / 3 - fuselageRadius : -stabSpan / 2 - fuselageRadius, tailHeight / 3, tailPosition);

    leftStab.rotation.set(0, (wingShape === "swept") ? -Math.PI / 6 : 0, 0);

    group.add(leftStab);

    // Right Stabilizer
    const rightStab = leftStab.clone();
    rightStab.position.x *= -1;
    rightStab.rotation.set(0, (wingShape === "swept") ? Math.PI / 6 : 0, 0);
    group.add(rightStab);

    console.log("Horizontal stabilizers created");

    /*** LANDING GEAR ***/
    if (aircraftType === "airliner") {
        const gearMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

        const noseGear = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1), gearMaterial);
        noseGear.position.set(0, -fuselageRadius - 1, fuselageLength / 2 - 2);
        noseGear.rotation.set(Math.PI / 2, 0, 0);
        group.add(noseGear);

        for (let i = -1; i <= 1; i += 2) {
            const mainGear = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.5), gearMaterial);
            mainGear.position.set(i * fuselageRadius * 2, -fuselageRadius - 1, wingPosition);
            mainGear.rotation.set(Math.PI / 2, 0, 0);
            group.add(mainGear);
        }
    }

    console.log("Landing gear added");

    /*** FINALIZE ***/
    group.position.set(0, 0, 0);
    return group;