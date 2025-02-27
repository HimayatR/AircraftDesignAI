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
    fuselage.rotation.z = Math.PI / 2;
    group.add(fuselage);

    // Nose cone
    const noseGeometry = new THREE.ConeGeometry(fuselageRadius, noseLength, 32);
    const nose = new THREE.Mesh(noseGeometry, fuselageMaterial);
    nose.rotation.z = Math.PI / 2;
    nose.position.set(fuselageLength / 2 + noseLength / 2, 0, 0);
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
    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.position.set(-fuselageRadius, wingPosition, 0);
    leftWing.rotation.y = (wingShape === "swept") ? Math.PI / 6 : 0;
    group.add(leftWing);

    const rightWing = leftWing.clone();
    rightWing.position.x *= -1;
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
        engine.rotation.z = Math.PI / 2;

        if (enginePlacement === "wing" && aircraftType === "airliner") {
            engine.position.set(-engineOffset + (i * engineOffset * 2), wingPosition - 1, -wingDepth / 2);
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
    tail.position.set(0, tailHeight / 2, tailPosition);
    group.add(tail);

    if (tailType === "twin") {
        const twinTailLeft = tail.clone();
        const twinTailRight = tail.clone();
        twinTailLeft.position.x = -tailWidth;
        twinTailRight.position.x = tailWidth;
        twinTailLeft.rotation.z = Math.PI / 12;
        twinTailRight.rotation.z = -Math.PI / 12;
        group.add(twinTailLeft);
        group.add(twinTailRight);
    }

    console.log("Tail created");

    /*** HORIZONTAL STABILIZERS ***/
    let stabSpan = (aircraftType === "fighter") ? 2 : 8;
    let stabDepth = 0.6;
    let stabThickness = 0.1;

    const stabGeometry = new THREE.BoxGeometry(stabSpan, stabThickness, stabDepth);
    const leftStab = new THREE.Mesh(stabGeometry, fuselageMaterial);
    leftStab.position.set(-stabSpan / 2, tailHeight / 3, tailPosition);
    group.add(leftStab);

    const rightStab = leftStab.clone();
    rightStab.position.x *= -1;
    group.add(rightStab);

    console.log("Horizontal stabilizers created");

    /*** LANDING GEAR ***/
    if (aircraftType === "airliner") {
        const gearMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

        const noseGear = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1), gearMaterial);
        noseGear.position.set(fuselageLength / 2 - 2, -fuselageRadius - 0.5, 0);
        group.add(noseGear);

        for (let i = -1; i <= 1; i += 2) {
            const mainGear = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.5), gearMaterial);
            mainGear.position.set(i * fuselageRadius * 2, -fuselageRadius - 1, wingPosition);
            group.add(mainGear);
        }
    }

    console.log("Landing gear added");

    /*** FINALIZE ***/
    group.position.set(0, 0, 0);
    return group;
}
