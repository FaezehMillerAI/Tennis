/**
 * Photorealistic Interactive 3D Tennis Court Engine
 * Built with Three.js WebGL & OrbitControls
 * - 5 Procedural Grand Slam Surfaces (Wimbledon Grass, Roland Garros Clay, US Open Blue, Aus Open, Indoor)
 * - Authentic 3D Net with Regulation Sag (3.5ft at posts, 3.0ft at center strap)
 * - 3D Camera Presets (Broadcast, Behind Baseline, Top-Down Tactical, Net Approach)
 * - 3D Parabolic Ball Trajectories with True Net Clearance
 * - Raycast Drag & Drop for 3D Players, Coaches, Hoppers, Cones, and Targets
 * - Day / Night Stadium Lighting Modes
 */

class TennisCourt3DEngine {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        // Configuration
        this.surface = 'hard_blue';
        this.courtFormat = 'full'; // full, red_stage, orange_stage
        this.lightingMode = 'day'; // day, night
        this.tool = 'select'; // select, draw_ball, draw_move, draw_feed, draw_target_zone, eraser
        this.ballPathStyle = 'solid'; // solid, loop

        // Scene, Camera, Renderer
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // 3D Objects & State
        this.courtMesh = null;
        this.linesMesh = null;
        this.netGroup = null;
        this.lightsGroup = new THREE.Group();
        this.itemsGroup = new THREE.Group();
        this.drawingsGroup = new THREE.Group();
        this.groundPlane = null; // Invisible plane for raycast dragging

        this.elements = [];
        this.drawings = [];
        this.history = [];
        this.historyIndex = -1;

        // Interaction State
        this.selectedObject = null;
        this.isDragging = false;
        this.dragPlanePoint = new THREE.Vector3();
        this.isDrawing = false;
        this.drawStartPoint = null;
        this.previewDrawingMesh = null;

        // Camera animation
        this.targetCameraPos = null;
        this.targetCameraLookAt = null;

        // 3D Live Play Simulation & Video Replay Engine
        this.simRunning = false;
        this.simTime = 0.0;
        this.simDuration = 4.4;
        this.simSpeed = 1.0;
        this.simLoop = true;
        this.trackingCam = true;
        this.lastAudioTriggerTime = -1;
        this.simScript = null;
        this.lastTimestamp = performance.now();
        this.simP1 = null;
        this.simP2 = null;
        this.simCoach = null;
        this.onSimProgress = null;
        this.onSimStateChange = null;

        this.initThree();
        this.buildCourt();
        this.setupLighting();
        this.setupRaycasting();
        this.initSimulation();
        this.saveState();
        this.animate();

        window.addEventListener('resize', () => this.onWindowResize());
    }

    initThree() {
        const width = this.container.clientWidth || 900;
        const height = this.container.clientHeight || 580;

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0f1d);
        this.scene.fog = new THREE.FogExp2(0x0a0f1d, 0.012);

        // Camera
        this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
        this.setCameraPreset('broadcast', false);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            preserveDrawingBuffer: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;

        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);

        // OrbitControls
        if (window.THREE && THREE.OrbitControls) {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't go below ground
            this.controls.minDistance = 6;
            this.controls.maxDistance = 65;
            this.controls.target.set(0, 0, 0);
        }

        // Add Groups
        this.scene.add(this.lightsGroup);
        this.scene.add(this.itemsGroup);
        this.scene.add(this.drawingsGroup);

        // Ground reference plane for math (Y = 0)
        const planeGeo = new THREE.PlaneGeometry(100, 100);
        const planeMat = new THREE.MeshBasicMaterial({ visible: false });
        this.groundPlane = new THREE.Mesh(planeGeo, planeMat);
        this.groundPlane.rotation.x = -Math.PI / 2;
        this.scene.add(this.groundPlane);
    }

    // Camera Views
    setCameraPreset(presetName, animate = true) {
        let pos, lookAt;
        switch (presetName) {
            case 'broadcast':
                // Classic Grand Slam TV Broadcast View
                pos = new THREE.Vector3(18, 17, 24);
                lookAt = new THREE.Vector3(0, 0.5, 0);
                break;
            case 'baseline':
                // Player's perspective looking over the net
                pos = new THREE.Vector3(0, 5.5, 23.5);
                lookAt = new THREE.Vector3(0, 1.2, -6);
                break;
            case 'topdown':
                // Tactical Bird's Eye 2D Diagram View
                pos = new THREE.Vector3(0, 36, 0.01);
                lookAt = new THREE.Vector3(0, 0, 0);
                break;
            case 'net':
                // Close-up at net for volleys and approaches
                pos = new THREE.Vector3(7, 3.5, 7);
                lookAt = new THREE.Vector3(0, 1, 0);
                break;
            default:
                pos = new THREE.Vector3(18, 17, 24);
                lookAt = new THREE.Vector3(0, 0.5, 0);
        }

        if (!animate) {
            this.camera.position.copy(pos);
            this.camera.lookAt(lookAt);
            if (this.controls) {
                this.controls.target.copy(lookAt);
                this.controls.update();
            }
        } else {
            this.targetCameraPos = pos;
            this.targetCameraLookAt = lookAt;
        }

        window.tennisAudio?.playClick();
    }

    // Lighting (Day Sun vs. Grand Slam Night Floodlights)
    setupLighting() {
        // Clear existing lights
        while (this.lightsGroup.children.length > 0) {
            this.lightsGroup.remove(this.lightsGroup.children[0]);
        }

        if (this.lightingMode === 'day') {
            // Soft sky ambient light
            const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x1e3a2b, 0.7);
            this.lightsGroup.add(hemiLight);

            // Sunlight directional
            const sunLight = new THREE.DirectionalLight(0xfffaed, 1.25);
            sunLight.position.set(16, 28, 18);
            sunLight.castShadow = true;
            sunLight.shadow.mapSize.width = 2048;
            sunLight.shadow.mapSize.height = 2048;
            sunLight.shadow.camera.near = 0.5;
            sunLight.shadow.camera.far = 70;
            sunLight.shadow.camera.left = -20;
            sunLight.shadow.camera.right = 20;
            sunLight.shadow.camera.top = 20;
            sunLight.shadow.camera.bottom = -20;
            sunLight.shadow.bias = -0.0005;
            this.lightsGroup.add(sunLight);

            // Subtle fill light
            const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.35);
            fillLight.position.set(-14, 18, -14);
            this.lightsGroup.add(fillLight);
        } else {
            // Night Stadium Session
            const hemiLight = new THREE.HemisphereLight(0x1e293b, 0x0a0f1d, 0.4);
            this.lightsGroup.add(hemiLight);

            // 4 Stadium Floodlight Towers
            const towerPositions = [
                [-14, 18, 16],
                [14, 18, 16],
                [-14, 18, -16],
                [14, 18, -16]
            ];

            towerPositions.forEach((pos, idx) => {
                const spot = new THREE.SpotLight(0xffffff, 0.85);
                spot.position.set(pos[0], pos[1], pos[2]);
                spot.target.position.set(0, 0, 0);
                spot.angle = Math.PI / 4;
                spot.penumbra = 0.4;
                spot.castShadow = idx === 0 || idx === 1;
                spot.shadow.mapSize.width = 1024;
                spot.shadow.mapSize.height = 1024;
                this.lightsGroup.add(spot);
                this.lightsGroup.add(spot.target);
            });
        }
    }

    toggleLighting() {
        this.lightingMode = this.lightingMode === 'day' ? 'night' : 'day';
        this.setupLighting();
        window.tennisAudio?.playClick();
        return this.lightingMode;
    }

    // Build Court Geometry & Materials
    buildCourt() {
        if (this.courtMesh) this.scene.remove(this.courtMesh);
        if (this.netGroup) this.scene.remove(this.netGroup);

        // Regulation Court Proportions (in standard meters/units)
        // Length: 23.77m (Z from -11.885 to +11.885)
        // Doubles Width: 10.97m (X from -5.485 to +5.485)
        // Singles Width: 8.23m (X from -4.115 to +4.115)
        // Surround: 36m length x 20m width
        const surroundW = 20;
        const surroundL = 36;

        // 1. Generate Procedural Canvas Texture for Court Surface
        const courtTexture = this.generateCourtTexture();
        courtTexture.anisotropy = 16;

        const surfaceDef = LTA_FRAMEWORK.surfaces[this.surface] || LTA_FRAMEWORK.surfaces.hard_blue;

        // Ground Plane Mesh
        const courtGeo = new THREE.PlaneGeometry(surroundW, surroundL, 64, 64);
        const courtMat = new THREE.MeshStandardMaterial({
            map: courtTexture,
            roughness: surfaceDef.roughness || 0.7,
            metalness: 0.05
        });

        this.courtMesh = new THREE.Mesh(courtGeo, courtMat);
        this.courtMesh.rotation.x = -Math.PI / 2;
        this.courtMesh.receiveShadow = true;
        this.scene.add(this.courtMesh);

        // 2. Build 3D Realistic Tennis Net with Regulation Sag
        this.buildRealisticNet();
    }

    // Procedural High-Res Canvas Texture for Court Lines & Surfaces
    generateCourtTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 3686; // Ratio ~ 20:36
        const ctx = canvas.getContext('2d');

        const s = LTA_FRAMEWORK.surfaces[this.surface] || LTA_FRAMEWORK.surfaces.hard_blue;

        // 1. Fill Surround Background
        ctx.fillStyle = s.surroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Textures for grass/clay
        if (this.surface === 'grass') {
            // Lawn mower alternating stripes
            const stripes = 28;
            const sh = canvas.height / stripes;
            for (let i = 0; i < stripes; i += 2) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
                ctx.fillRect(0, i * sh, canvas.width, sh);
            }
        } else if (this.surface === 'clay') {
            // Subtle terracotta noise
            ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
            for (let i = 0; i < 400; i++) {
                ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 3, 3);
            }
        }

        // 2. Inner Court Box (10.97m x 23.77m)
        const scaleX = canvas.width / 20; // pixels per metre
        const scaleY = canvas.height / 36;

        const courtW = 10.97 * scaleX;
        const courtL = 23.77 * scaleY;
        const courtX = (canvas.width - courtW) / 2;
        const courtY = (canvas.height - courtL) / 2;

        ctx.fillStyle = s.courtColor;
        ctx.fillRect(courtX, courtY, courtW, courtL);

        // Grass lawn stripes inside court
        if (this.surface === 'grass') {
            const stripes = 24;
            const sh = courtL / stripes;
            for (let i = 0; i < stripes; i++) {
                if (i % 2 === 0) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                    ctx.fillRect(courtX, courtY + i * sh, courtW, sh);
                }
            }
        } else if (this.surface === 'clay') {
            // Sliding clay mark
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.arc(courtX + courtW * 0.3, courtY + courtL * 0.85, 120, 0, 1.4);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(courtX + courtW * 0.7, courtY + courtL * 0.15, 130, 2.5, 3.8);
            ctx.stroke();
        }

        // 3. Draw Regulation White Lines
        ctx.strokeStyle = s.lineColor || '#FFFFFF';
        ctx.lineWidth = 9; // ~5cm in scale

        // Doubles Outer Boundary
        ctx.strokeRect(courtX, courtY, courtW, courtL);

        // Singles Sidelines (8.23m wide)
        const singlesW = 8.23 * scaleX;
        const singlesX = (canvas.width - singlesW) / 2;

        ctx.beginPath();
        ctx.moveTo(singlesX, courtY);
        ctx.lineTo(singlesX, courtY + courtL);
        ctx.moveTo(singlesX + singlesW, courtY);
        ctx.lineTo(singlesX + singlesW, courtY + courtL);
        ctx.stroke();

        // Service Lines (6.4m from net on each side)
        const netY = canvas.height / 2;
        const serviceDist = 6.4 * scaleY;

        ctx.beginPath();
        ctx.moveTo(singlesX, netY - serviceDist);
        ctx.lineTo(singlesX + singlesW, netY - serviceDist);
        ctx.moveTo(singlesX, netY + serviceDist);
        ctx.lineTo(singlesX + singlesW, netY + serviceDist);
        ctx.stroke();

        // Centre Service Line
        const centerX = canvas.width / 2;
        ctx.beginPath();
        ctx.moveTo(centerX, netY - serviceDist);
        ctx.lineTo(centerX, netY + serviceDist);
        ctx.stroke();

        // Centre Mark Ticks on Baselines
        const tickLen = 0.5 * scaleY;
        ctx.beginPath();
        ctx.moveTo(centerX, courtY);
        ctx.lineTo(centerX, courtY + tickLen);
        ctx.moveTo(centerX, courtY + courtL);
        ctx.lineTo(centerX, courtY + courtL - tickLen);
        ctx.stroke();

        // LTA Youth Stage Line Overlays
        if (this.courtFormat === 'red_stage') {
            ctx.save();
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 7;
            ctx.setLineDash([20, 15]);

            const redL = 11.0 * scaleY;
            const redY = netY - redL / 2;
            ctx.strokeRect(singlesX, redY, singlesW, redL);
            ctx.restore();
        } else if (this.courtFormat === 'orange_stage') {
            ctx.save();
            ctx.strokeStyle = '#f97316';
            ctx.lineWidth = 7;
            ctx.setLineDash([25, 15]);

            const orangeL = 18.0 * scaleY;
            const orangeY1 = netY - orangeL / 2;
            const orangeY2 = netY + orangeL / 2;

            ctx.beginPath();
            ctx.moveTo(singlesX, orangeY1);
            ctx.lineTo(singlesX + singlesW, orangeY1);
            ctx.moveTo(singlesX, orangeY2);
            ctx.lineTo(singlesX + singlesW, orangeY2);
            ctx.stroke();
            ctx.restore();
        }

        return new THREE.CanvasTexture(canvas);
    }

    // 3D Realistic Tennis Net with Center Sag & Metal Posts
    buildRealisticNet() {
        this.netGroup = new THREE.Group();

        const netPostX = 6.0; // 0.914m outside doubles line (5.08m)
        const postHeight = 1.07; // 3.5 feet regulation
        const centerHeight = 0.914; // 3.0 feet regulation center strap

        // 1. Net Posts (Dark metal/green cylinders with winding mechanism)
        const postGeo = new THREE.CylinderGeometry(0.06, 0.06, postHeight, 16);
        const postMat = new THREE.MeshStandardMaterial({
            color: this.surface === 'grass' ? 0x1b432e : 0x22262b,
            metalness: 0.8,
            roughness: 0.3
        });

        const postLeft = new THREE.Mesh(postGeo, postMat);
        postLeft.position.set(-netPostX, postHeight / 2, 0);
        postLeft.castShadow = true;
        this.netGroup.add(postLeft);

        const postRight = new THREE.Mesh(postGeo, postMat);
        postRight.position.set(netPostX, postHeight / 2, 0);
        postRight.castShadow = true;
        this.netGroup.add(postRight);

        // 2. Net Mesh Surface (Curved grid geometry sag in center)
        const segments = 32;
        const netWidth = netPostX * 2;
        const netGeo = new THREE.PlaneGeometry(netWidth, postHeight, segments, 1);
        const pos = netGeo.attributes.position;

        // Apply parabolic dip to top vertices
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            // Parabola: dip at x = 0
            const factor = Math.abs(x) / netPostX; // 0 at center, 1 at post
            const topY = centerHeight + (postHeight - centerHeight) * (factor ** 2);
            const bottomY = 0;

            if (y > 0) {
                pos.setY(i, topY);
            } else {
                pos.setY(i, bottomY);
            }
        }
        netGeo.computeVertexNormals();

        // Semi-transparent net mesh material
        const netMat = new THREE.MeshStandardMaterial({
            color: 0x111827,
            transparent: true,
            opacity: 0.65,
            wireframe: true,
            side: THREE.DoubleSide
        });

        const netMesh = new THREE.Mesh(netGeo, netMat);
        netMesh.position.set(0, 0, 0);
        netMesh.castShadow = true;
        this.netGroup.add(netMesh);

        // 3. White Top Cord Tape
        const tapePoints = [];
        for (let i = 0; i <= segments; i++) {
            const x = -netPostX + (i / segments) * (netPostX * 2);
            const factor = Math.abs(x) / netPostX;
            const y = centerHeight + (postHeight - centerHeight) * (factor ** 2);
            tapePoints.push(new THREE.Vector3(x, y, 0));
        }

        const tapeCurve = new THREE.CatmullRomCurve3(tapePoints);
        const tapeGeo = new THREE.TubeGeometry(tapeCurve, 32, 0.025, 8, false);
        const tapeMat = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            roughness: 0.4
        });

        const tapeMesh = new THREE.Mesh(tapeGeo, tapeMat);
        this.netGroup.add(tapeMesh);

        // 4. Center Anchor Strap (White vertical strip pulling down to 0.914m)
        const strapGeo = new THREE.BoxGeometry(0.06, centerHeight, 0.04);
        const strapMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
        const strapMesh = new THREE.Mesh(strapGeo, strapMat);
        strapMesh.position.set(0, centerHeight / 2, 0);
        this.netGroup.add(strapMesh);

        this.scene.add(this.netGroup);
    }

    setSurface(surfaceKey) {
        if (LTA_FRAMEWORK.surfaces[surfaceKey]) {
            this.surface = surfaceKey;
            this.buildCourt();
            window.tennisAudio?.playSurfaceChange();
        }
    }

    setCourtFormat(format) {
        this.courtFormat = format;
        this.buildCourt();
    }

    setTool(toolName) {
        this.tool = toolName;
        this.selectedObject = null;
        if (this.controls) {
            // Disable orbit rotation while drawing or moving items
            this.controls.enabled = (toolName === 'select' && !this.isDragging);
        }
    }

    setBallPathStyle(style) {
        this.ballPathStyle = style;
    }

    // Coordinate Conversion: Relative [0..1] on 2D court to 3D Court Position
    // 2D: x: 0 (left) to 1 (right), y: 0 (top) to 1 (bottom)
    // 3D: X from -5.485 to +5.485, Z from -11.885 to +11.885
    relTo3D(p) {
        const courtW = 10.97;
        const courtL = 23.77;
        return new THREE.Vector3(
            (p.x - 0.5) * courtW,
            p.z || 0,
            (p.y - 0.5) * courtL
        );
    }

    threeDToRel(vec) {
        const courtW = 10.97;
        const courtL = 23.77;
        return {
            x: Math.max(0, Math.min(1, vec.x / courtW + 0.5)),
            y: Math.max(0, Math.min(1, vec.z / courtL + 0.5))
        };
    }

    // Load elements and drawings from session phase
    loadPhase(phaseData) {
        if (!phaseData) return;
        this.elements = JSON.parse(JSON.stringify(phaseData.elements || []));
        this.drawings = JSON.parse(JSON.stringify(phaseData.drawings || []));
        this.rebuildItems();
        this.rebuildDrawings();
        this.rebuildSimulationScript();
        this.saveState();
    }

    getCurrentPhaseData() {
        return {
            elements: JSON.parse(JSON.stringify(this.elements)),
            drawings: JSON.parse(JSON.stringify(this.drawings))
        };
    }

    // Rebuild 3D Meshes from elements list
    rebuildItems() {
        while (this.itemsGroup.children.length > 0) {
            this.itemsGroup.remove(this.itemsGroup.children[0]);
        }

        this.elements.forEach(el => {
            const mesh = this.create3DItemMesh(el);
            if (mesh) {
                mesh.userData.itemData = el;
                this.itemsGroup.add(mesh);
            }
        });
    }

    create3DItemMesh(el) {
        const pos = this.relTo3D(el);
        const group = new THREE.Group();
        group.position.set(pos.x, 0, pos.z);

        if (el.type === 'player') {
            // 3D Tennis Player Model
            const color = new THREE.Color(el.color || 0x2563EB);

            // Ground Contact Shadow
            const shadowGeo = new THREE.CircleGeometry(0.55, 24);
            const shadowMat = new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.35
            });
            const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
            shadowMesh.rotation.x = -Math.PI / 2;
            shadowMesh.position.y = 0.01;
            group.add(shadowMesh);

            // Player Body Cylinder (Torso)
            const bodyGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.9, 16);
            const bodyMat = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.4
            });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.y = 0.85;
            body.castShadow = true;
            group.add(body);

            // Player Head
            const headGeo = new THREE.SphereGeometry(0.18, 16, 16);
            const headMat = new THREE.MeshStandardMaterial({ color: 0xffd1b3 });
            const head = new THREE.Mesh(headGeo, headMat);
            head.position.y = 1.45;
            head.castShadow = true;
            group.add(head);

            // White Headband
            const bandGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.05, 16);
            const bandMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
            const band = new THREE.Mesh(bandGeo, bandMat);
            band.position.y = 1.48;
            group.add(band);

            // Tennis Racket in hand
            const racketGroup = new THREE.Group();
            const racketHeadGeo = new THREE.TorusGeometry(0.18, 0.02, 8, 24);
            const racketHeadMat = new THREE.MeshStandardMaterial({ color: 0xCCFF00, metalness: 0.8 });
            const racketHead = new THREE.Mesh(racketHeadGeo, racketHeadMat);
            racketHead.position.set(0.45, 0.95, 0.2);
            racketHead.rotation.y = Math.PI / 4;
            racketGroup.add(racketHead);

            const shaftGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.35, 8);
            const shaft = new THREE.Mesh(shaftGeo, bodyMat);
            shaft.position.set(0.35, 0.75, 0.15);
            shaft.rotation.z = Math.PI / 4;
            racketGroup.add(shaft);
            group.add(racketGroup);

            // Floating 2D Billboard Label Sprite
            const labelSprite = this.createTextSprite(el.label || 'Player', '#FFFFFF', el.color || '#2563EB');
            labelSprite.position.set(0, 1.95, 0);
            group.add(labelSprite);

            // References for simulation animations
            group.userData.racketGroup = racketGroup;
            group.userData.body = body;
            group.userData.shadow = shadowMesh;
            group.userData.basePos = new THREE.Vector3(pos.x, 0, pos.z);

        } else if (el.type === 'coach') {
            // 3D LTA Coach (Teal / Gold jacket)
            const shadowGeo = new THREE.CircleGeometry(0.6, 24);
            const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 });
            const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
            shadowMesh.rotation.x = -Math.PI / 2;
            shadowMesh.position.y = 0.01;
            group.add(shadowMesh);

            const bodyGeo = new THREE.CylinderGeometry(0.26, 0.3, 0.95, 16);
            const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0F766E, roughness: 0.3 });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.y = 0.88;
            body.castShadow = true;
            group.add(body);

            const headGeo = new THREE.SphereGeometry(0.19, 16, 16);
            const headMat = new THREE.MeshStandardMaterial({ color: 0xffd1b3 });
            const head = new THREE.Mesh(headGeo, headMat);
            head.position.y = 1.5;
            head.castShadow = true;
            group.add(head);

            // Gold Coach Cap
            const capGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.08, 16);
            const capMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 });
            const cap = new THREE.Mesh(capGeo, capMat);
            cap.position.y = 1.56;
            group.add(cap);

            const labelSprite = this.createTextSprite(el.label || 'Coach', '#000000', '#facc15');
            labelSprite.position.set(0, 2.05, 0);
            group.add(labelSprite);

            // References for simulation animations
            group.userData.body = body;
            group.userData.shadow = shadowMesh;
            group.userData.basePos = new THREE.Vector3(pos.x, 0, pos.z);

        } else if (el.type === 'ball') {
            // 3D Tennis Ball (Optic Yellow with Seam)
            const ballGeo = new THREE.SphereGeometry(0.12, 24, 24);
            const ballMat = new THREE.MeshStandardMaterial({
                color: 0xCCFF00,
                roughness: 0.3,
                emissive: 0x223300
            });
            const ball = new THREE.Mesh(ballGeo, ballMat);
            ball.position.y = 0.12;
            ball.castShadow = true;
            group.add(ball);

        } else if (el.type === 'hopper') {
            // 3D Ball Hopper / Basket
            const basketGeo = new THREE.BoxGeometry(0.5, 0.55, 0.45);
            const basketMat = new THREE.MeshStandardMaterial({
                color: 0x475569,
                metalness: 0.7,
                roughness: 0.3,
                wireframe: true
            });
            const basket = new THREE.Mesh(basketGeo, basketMat);
            basket.position.y = 0.75;
            basket.castShadow = true;
            group.add(basket);

            // Hopper Stand Legs
            const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.75, 8);
            const legMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
            [-0.2, 0.2].forEach(x => {
                [-0.18, 0.18].forEach(z => {
                    const leg = new THREE.Mesh(legGeo, legMat);
                    leg.position.set(x, 0.375, z);
                    group.add(leg);
                });
            });

            // Tennis balls inside
            for (let i = 0; i < 4; i++) {
                const bGeo = new THREE.SphereGeometry(0.07, 12, 12);
                const bMat = new THREE.MeshStandardMaterial({ color: 0xCCFF00 });
                const b = new THREE.Mesh(bGeo, bMat);
                b.position.set((Math.random() - 0.5) * 0.3, 0.65 + Math.random() * 0.2, (Math.random() - 0.5) * 0.25);
                group.add(b);
            }

        } else if (el.type === 'cone') {
            // 3D Training Cone
            const coneGeo = new THREE.ConeGeometry(0.18, 0.4, 16);
            const coneMat = new THREE.MeshStandardMaterial({
                color: el.color ? new THREE.Color(el.color) : 0xf97316,
                roughness: 0.4
            });
            const cone = new THREE.Mesh(coneGeo, coneMat);
            cone.position.y = 0.2;
            cone.castShadow = true;
            group.add(cone);

            // White reflective stripe around cone
            const stripeGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.08, 16);
            const stripeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
            const stripe = new THREE.Mesh(stripeGeo, stripeMat);
            stripe.position.y = 0.16;
            group.add(stripe);

        } else if (el.type === 'target') {
            // 3D Target Disc on Ground
            const targetGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.02, 32);
            const targetMat = new THREE.MeshStandardMaterial({
                color: el.color ? new THREE.Color(el.color) : 0x10b981,
                transparent: true,
                opacity: 0.75
            });
            const target = new THREE.Mesh(targetGeo, targetMat);
            target.position.y = 0.01;
            group.add(target);

            // Inner bullseye
            const bullGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.025, 32);
            const bullMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
            const bull = new THREE.Mesh(bullGeo, bullMat);
            bull.position.y = 0.015;
            group.add(bull);

            const labelSprite = this.createTextSprite(`+${el.points || 5}`, '#FFFFFF', el.color || '#10b981');
            labelSprite.position.set(0, 0.6, 0);
            labelSprite.scale.set(1.5, 0.75, 1);
            group.add(labelSprite);

        } else if (el.type === 'ladder') {
            // 3D Agility Footwork Ladder on ground
            const ladderGroup = new THREE.Group();
            const sideGeo = new THREE.BoxGeometry(0.04, 0.01, 3.2);
            const sideMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 });
            [-0.3, 0.3].forEach(x => {
                const side = new THREE.Mesh(sideGeo, sideMat);
                side.position.set(x, 0.01, 0);
                ladderGroup.add(side);
            });
            // Rungs
            const rungGeo = new THREE.BoxGeometry(0.6, 0.015, 0.05);
            for (let i = -1.4; i <= 1.4; i += 0.45) {
                const rung = new THREE.Mesh(rungGeo, sideMat);
                rung.position.set(0, 0.015, i);
                ladderGroup.add(rung);
            }
            group.add(ladderGroup);
        }

        return group;
    }

    // Floating 2D text billboard sprite
    createTextSprite(text, textColor = '#FFFFFF', bgColor = '#2563EB') {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        // Rounded pill background
        ctx.fillStyle = bgColor;
        this.roundRect(ctx, 16, 24, 224, 80, 20);
        ctx.fill();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = textColor;
        ctx.font = 'bold 36px Outfit, Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 128, 64);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(1.8, 0.9, 1);
        return sprite;
    }

    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    // Rebuild 3D Trajectory Vectors
    rebuildDrawings() {
        while (this.drawingsGroup.children.length > 0) {
            this.drawingsGroup.remove(this.drawingsGroup.children[0]);
        }

        this.drawings.forEach(d => {
            const mesh = this.create3DDrawingMesh(d);
            if (mesh) {
                mesh.userData.drawingData = d;
                this.drawingsGroup.add(mesh);
            }
        });
    }

    create3DDrawingMesh(d, isPreview = false) {
        const from = this.relTo3D(d.from);
        const to = this.relTo3D(d.to);
        const group = new THREE.Group();

        if (d.type === 'ball_path') {
            // 3D Parabolic Ball Trajectory clearing the net!
            // Start at contact height (0.9m) -> Net apex (1.8m - 2.8m) -> Ground bounce (0.05m)
            const netYClearance = d.style === 'loop' ? 2.7 : 1.8;
            const mid = new THREE.Vector3(
                (from.x + to.x) / 2,
                netYClearance,
                (from.z + to.z) / 2
            );
            from.y = 0.9;
            to.y = 0.05;

            const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
            const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.045, 8, false);
            const tubeMat = new THREE.MeshStandardMaterial({
                color: 0xCCFF00,
                emissive: 0x668800,
                roughness: 0.3,
                transparent: isPreview,
                opacity: isPreview ? 0.65 : 1.0
            });
            const tube = new THREE.Mesh(tubeGeo, tubeMat);
            group.add(tube);

            // Arrowhead at destination
            const arrowGeo = new THREE.ConeGeometry(0.16, 0.45, 16);
            const arrowMesh = new THREE.Mesh(arrowGeo, tubeMat);
            arrowMesh.position.copy(to);
            // Orient along end tangent
            const tangent = curve.getTangent(1).normalize();
            arrowMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
            group.add(arrowMesh);

            // Tennis ball at peak
            const apexBallGeo = new THREE.SphereGeometry(0.09, 16, 16);
            const apexBall = new THREE.Mesh(apexBallGeo, tubeMat);
            apexBall.position.copy(mid);
            group.add(apexBall);

        } else if (d.type === 'move_path') {
            // 3D Player Movement Vector (Dashed ribbon along the court surface)
            from.y = 0.03;
            to.y = 0.03;

            const dist = from.distanceTo(to);
            const dir = new THREE.Vector3().subVectors(to, from).normalize();

            const arrowHelper = new THREE.ArrowHelper(dir, from, dist, 0x38bdf8, 0.5, 0.3);
            arrowHelper.line.material.linewidth = 3;
            group.add(arrowHelper);

        } else if (d.type === 'feed_path') {
            // 3D Coach Feed Arc (Dotted Golden trajectory)
            from.y = 1.0;
            to.y = 0.1;
            const mid = new THREE.Vector3((from.x + to.x) / 2, 1.6, (from.z + to.z) / 2);

            const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
            const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.035, 8, false);
            const tubeMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0x886600 });
            const tube = new THREE.Mesh(tubeGeo, tubeMat);
            group.add(tube);

            // Feed origin tennis ball
            const bGeo = new THREE.SphereGeometry(0.1, 16, 16);
            const b = new THREE.Mesh(bGeo, tubeMat);
            b.position.copy(from);
            group.add(b);

        } else if (d.type === 'target_zone') {
            // 3D Shaded Target Floor Zone
            const minX = Math.min(from.x, to.x);
            const maxX = Math.max(from.x, to.x);
            const minZ = Math.min(from.z, to.z);
            const maxZ = Math.max(from.z, to.z);

            const width = Math.max(0.5, maxX - minX);
            const length = Math.max(0.5, maxZ - minZ);

            const zoneGeo = new THREE.PlaneGeometry(width, length);
            const zoneMat = new THREE.MeshBasicMaterial({
                color: 0x10b981,
                transparent: true,
                opacity: 0.35,
                side: THREE.DoubleSide
            });
            const zoneMesh = new THREE.Mesh(zoneGeo, zoneMat);
            zoneMesh.rotation.x = -Math.PI / 2;
            zoneMesh.position.set((minX + maxX) / 2, 0.02, (minZ + maxZ) / 2);
            group.add(zoneMesh);
        }

        return group;
    }

    // Add item from palette
    addItem(type, extra = {}) {
        const id = `${type}_${Date.now()}`;
        const x = 0.45 + (Math.random() * 0.1 - 0.05);
        const y = 0.50 + (Math.random() * 0.1 - 0.05);

        const newItem = {
            id,
            type,
            x,
            y,
            ...extra
        };

        if (type === 'player' && !newItem.label) {
            const count = this.elements.filter(e => e.type === 'player').length;
            newItem.label = `Player ${count + 1}`;
        } else if (type === 'coach' && !newItem.label) {
            newItem.label = 'Coach';
        } else if (type === 'target' && !newItem.points) {
            newItem.points = 5;
        } else if (type === 'cone' && !newItem.color) {
            newItem.color = '#f97316';
        }

        this.elements.push(newItem);
        this.rebuildItems();
        this.saveState();
        window.tennisAudio?.playBounce();
    }

    // Raycasting & Mouse Interaction
    setupRaycasting() {
        const canvas = this.renderer.domElement;

        const getPointer = (e) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: ((clientX - rect.left) / rect.width) * 2 - 1,
                y: -((clientY - rect.top) / rect.height) * 2 + 1
            };
        };

        const onDown = (e) => {
            const p = getPointer(e);
            this.mouse.set(p.x, p.y);
            this.raycaster.setFromCamera(this.mouse, this.camera);

            if (this.tool === 'select') {
                // Check if an item was clicked
                const intersects = this.raycaster.intersectObjects(this.itemsGroup.children, true);
                if (intersects.length > 0) {
                    let rootGroup = intersects[0].object;
                    while (rootGroup.parent && rootGroup.parent !== this.itemsGroup) {
                        rootGroup = rootGroup.parent;
                    }
                    this.selectedObject = rootGroup;
                    this.isDragging = true;
                    if (this.controls) this.controls.enabled = false;
                    window.tennisAudio?.playHit();
                } else {
                    this.selectedObject = null;
                }
            } else if (this.tool === 'eraser') {
                // Erase hit item
                const hitItem = this.raycaster.intersectObjects(this.itemsGroup.children, true);
                if (hitItem.length > 0) {
                    let root = hitItem[0].object;
                    while (root.parent && root.parent !== this.itemsGroup) root = root.parent;
                    if (root.userData.itemData) {
                        this.elements = this.elements.filter(el => el.id !== root.userData.itemData.id);
                        this.rebuildItems();
                        this.saveState();
                        window.tennisAudio?.playClick();
                        return;
                    }
                }
                // Erase drawing
                const hitDraw = this.raycaster.intersectObjects(this.drawingsGroup.children, true);
                if (hitDraw.length > 0) {
                    let root = hitDraw[0].object;
                    while (root.parent && root.parent !== this.drawingsGroup) root = root.parent;
                    if (root.userData.drawingData) {
                        this.drawings = this.drawings.filter(d => d !== root.userData.drawingData);
                        this.rebuildDrawings();
                        this.saveState();
                        window.tennisAudio?.playClick();
                    }
                }
            } else if (this.tool.startsWith('draw_')) {
                // Start drawing on ground plane
                const groundHits = this.raycaster.intersectObject(this.groundPlane);
                if (groundHits.length > 0) {
                    this.isDrawing = true;
                    if (this.controls) this.controls.enabled = false;
                    const hitPoint = groundHits[0].point;
                    this.drawStartPoint = this.threeDToRel(hitPoint);
                }
            }
        };

        const onMove = (e) => {
            const p = getPointer(e);
            this.mouse.set(p.x, p.y);
            this.raycaster.setFromCamera(this.mouse, this.camera);

            if (this.isDragging && this.selectedObject) {
                const groundHits = this.raycaster.intersectObject(this.groundPlane);
                if (groundHits.length > 0) {
                    const pt = groundHits[0].point;
                    this.selectedObject.position.x = pt.x;
                    this.selectedObject.position.z = pt.z;

                    // Sync item data
                    if (this.selectedObject.userData.itemData) {
                        const rel = this.threeDToRel(pt);
                        this.selectedObject.userData.itemData.x = rel.x;
                        this.selectedObject.userData.itemData.y = rel.y;
                    }
                }
            } else if (this.isDrawing && this.drawStartPoint) {
                const groundHits = this.raycaster.intersectObject(this.groundPlane);
                if (groundHits.length > 0) {
                    const currentRel = this.threeDToRel(groundHits[0].point);
                    if (this.previewDrawingMesh) {
                        this.scene.remove(this.previewDrawingMesh);
                    }
                    const type = this.tool.replace('draw_', '');
                    const tempDrawing = {
                        type: type === 'target_zone' ? 'target_zone' : `${type}_path`,
                        from: this.drawStartPoint,
                        to: currentRel,
                        style: this.ballPathStyle
                    };
                    this.previewDrawingMesh = this.create3DDrawingMesh(tempDrawing, true);
                    this.scene.add(this.previewDrawingMesh);
                }
            }
        };

        const onUp = () => {
            if (this.isDragging) {
                this.isDragging = false;
                if (this.controls) this.controls.enabled = (this.tool === 'select');
                this.saveState();
            } else if (this.isDrawing) {
                if (this.previewDrawingMesh) {
                    this.scene.remove(this.previewDrawingMesh);
                    this.previewDrawingMesh = null;
                }
                const groundHits = this.raycaster.intersectObject(this.groundPlane);
                if (groundHits.length > 0 && this.drawStartPoint) {
                    const endRel = this.threeDToRel(groundHits[0].point);
                    const p1 = this.relTo3D(this.drawStartPoint);
                    const p2 = this.relTo3D(endRel);
                    if (p1.distanceTo(p2) > 0.8) {
                        const type = this.tool.replace('draw_', '');
                        this.drawings.push({
                            type: type === 'target_zone' ? 'target_zone' : `${type}_path`,
                            from: this.drawStartPoint,
                            to: endRel,
                            style: this.ballPathStyle
                        });
                        this.rebuildDrawings();
                        this.saveState();
                        window.tennisAudio?.playHit();
                    }
                }
                this.isDrawing = false;
                this.drawStartPoint = null;
                if (this.controls) this.controls.enabled = (this.tool === 'select');
            }
        };

        canvas.addEventListener('mousedown', onDown);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);

        canvas.addEventListener('touchstart', onDown, { passive: true });
        window.addEventListener('touchmove', onMove, { passive: true });
        window.addEventListener('touchend', onUp);
    }

    // State History
    saveState() {
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        this.history.push({
            elements: JSON.parse(JSON.stringify(this.elements)),
            drawings: JSON.parse(JSON.stringify(this.drawings))
        });
        if (this.history.length > 25) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const state = this.history[this.historyIndex];
            this.elements = JSON.parse(JSON.stringify(state.elements));
            this.drawings = JSON.parse(JSON.stringify(state.drawings));
            this.rebuildItems();
            this.rebuildDrawings();
            window.tennisAudio?.playClick();
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const state = this.history[this.historyIndex];
            this.elements = JSON.parse(JSON.stringify(state.elements));
            this.drawings = JSON.parse(JSON.stringify(state.drawings));
            this.rebuildItems();
            this.rebuildDrawings();
            window.tennisAudio?.playClick();
        }
    }

    clearCourt() {
        this.elements = [];
        this.drawings = [];
        this.rebuildItems();
        this.rebuildDrawings();
        this.saveState();
        window.tennisAudio?.playClick();
    }

    exportPNG() {
        window.tennisAudio?.playWhistle();
        this.renderer.render(this.scene, this.camera);
        const dataUrl = this.renderer.domElement.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `lta_3d_court_${this.surface}_${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
    }

    onWindowResize() {
        if (!this.container || !this.renderer || !this.camera) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    // =========================================================================
    // 3D LIVE PLAY SIMULATION & VIDEO REPLAY ENGINE
    // =========================================================================

    initSimulation() {
        this.simGroup = new THREE.Group();
        this.scene.add(this.simGroup);

        // Active 3D Tennis Ball in Live Simulation (Optic Yellow Felt)
        const ballGeo = new THREE.SphereGeometry(0.12, 32, 32);
        const ballMat = new THREE.MeshStandardMaterial({
            color: 0xCCFF00,
            emissive: 0x446600,
            roughness: 0.35,
            metalness: 0.1
        });
        this.liveBallMesh = new THREE.Mesh(ballGeo, ballMat);
        this.liveBallMesh.castShadow = true;
        this.liveBallMesh.visible = false;
        this.simGroup.add(this.liveBallMesh);

        // Ground shadow beneath live ball
        const shadowGeo = new THREE.CircleGeometry(0.35, 24);
        const shadowMat = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.4
        });
        this.liveBallShadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
        this.liveBallShadowMesh.rotation.x = -Math.PI / 2;
        this.liveBallShadowMesh.position.y = 0.012;
        this.liveBallShadowMesh.visible = false;
        this.simGroup.add(this.liveBallShadowMesh);

        // Bounce impact contact ripple ring on court
        const ripGeo = new THREE.RingGeometry(0.06, 0.28, 32);
        const ripMat = new THREE.MeshBasicMaterial({
            color: 0xCCFF00,
            transparent: true,
            opacity: 0.0,
            side: THREE.DoubleSide
        });
        this.rippleMesh = new THREE.Mesh(ripGeo, ripMat);
        this.rippleMesh.rotation.x = -Math.PI / 2;
        this.rippleMesh.position.y = 0.015;
        this.rippleMesh.visible = false;
        this.simGroup.add(this.rippleMesh);

        this.rippleActive = false;
        this.rippleStartTime = 0;
    }

    rebuildSimulationScript() {
        const players = this.itemsGroup.children.filter(c => c.userData?.itemData?.type === 'player');
        const coach = this.itemsGroup.children.find(c => c.userData?.itemData?.type === 'coach');

        this.simP1 = players.find(p => p.userData?.itemData?.id === 'p1' || (p.userData?.itemData?.label && p.userData.itemData.label.includes('1'))) || players[0];
        this.simP2 = players.find(p => p !== this.simP1);
        this.simCoach = coach;

        // Reset player positions to base coordinates
        players.forEach(p => {
            if (p.userData?.basePos) {
                p.position.copy(p.userData.basePos);
                if (p.userData.body) p.userData.body.rotation.y = 0;
                if (p.userData.racketGroup) p.userData.racketGroup.rotation.set(0, 0, 0);
            }
        });

        // Determine Shot 1 and Shot 2 coordinates from drawings or elements
        const ballPaths = this.drawings.filter(d => d.type === 'ball_path');
        const feedPaths = this.drawings.filter(d => d.type === 'feed_path');
        
        let start1, bounce1, start2, bounce2;
        const isCoachFeed = (feedPaths.length > 0 && this.simCoach);

        if (isCoachFeed) {
            start1 = this.relTo3D(feedPaths[0].from);
            bounce1 = this.relTo3D(feedPaths[0].to);
        } else if (ballPaths.length > 0) {
            start1 = this.relTo3D(ballPaths[0].from);
            bounce1 = this.relTo3D(ballPaths[0].to);
        } else {
            start1 = this.simP1?.userData?.basePos 
                ? { x: this.simP1.userData.basePos.x, z: this.simP1.userData.basePos.z }
                : { x: 0.5, z: 8.5 };
            bounce1 = this.simP2?.userData?.basePos
                ? { x: this.simP2.userData.basePos.x, z: this.simP2.userData.basePos.z + 1.2 }
                : { x: 1.5, z: -8.0 };
        }

        if (ballPaths.length > 1) {
            bounce2 = this.relTo3D(ballPaths[1].to);
        } else {
            bounce2 = { x: -start1.x * 0.7 + (Math.random() - 0.5), z: 8.0 };
        }

        start2 = { x: bounce1.x, z: bounce1.z };

        const isHighLoop = (ballPaths[0]?.style === 'loop');
        const apex1 = isHighLoop ? 3.0 : 1.9;
        const apex2 = 1.85;

        this.simScript = {
            duration: 4.4,
            isCoachFeed: isCoachFeed,
            start1: new THREE.Vector3(start1.x, 0.9, start1.z),
            bounce1: new THREE.Vector3(bounce1.x, 0.08, bounce1.z),
            start2: new THREE.Vector3(start2.x, 0.85, start2.z),
            bounce2: new THREE.Vector3(bounce2.x, 0.08, bounce2.z),
            apex1: apex1,
            apex2: apex2,
            p1Start: this.simP1 ? this.simP1.userData.basePos.clone() : new THREE.Vector3(0, 0, 8.5),
            p2Start: this.simP2 ? this.simP2.userData.basePos.clone() : new THREE.Vector3(0, 0, -8.5),
            p1Rec: this.simP1 ? new THREE.Vector3(0, 0, Math.min(this.simP1.userData.basePos.z, 8.8)) : new THREE.Vector3(0, 0, 8.5),
            p2Rec: this.simP2 ? new THREE.Vector3(0, 0, Math.max(this.simP2.userData.basePos.z, -8.8)) : new THREE.Vector3(0, 0, -8.5)
        };

        this.simDuration = this.simScript.duration;
        this.simTime = 0.0;
        this.lastAudioTriggerTime = -1;

        if (this.liveBallMesh) {
            this.liveBallMesh.position.copy(this.simScript.start1);
            this.liveBallMesh.visible = this.simRunning;
            this.liveBallShadowMesh.visible = this.simRunning;
        }
    }

    updateSimulation(dt) {
        if (!this.simRunning || !this.simScript) return;

        this.simTime += dt * this.simSpeed;
        if (this.simTime >= this.simDuration) {
            if (this.simLoop) {
                this.simTime = 0.0;
                this.lastAudioTriggerTime = -1;
            } else {
                this.simTime = this.simDuration;
                this.pauseSimulation();
                return;
            }
        }

        const t = this.simTime;
        const s = this.simScript;
        const p1 = this.simP1;
        const p2 = this.simP2;
        const coach = this.simCoach;
        const ball = this.liveBallMesh;
        const shadow = this.liveBallShadowMesh;

        ball.visible = true;
        shadow.visible = true;

        // --- PHASE 1: Shot 1 Windup & Flight (0.0s to 1.8s) ---
        if (t < 0.4) {
            const prepU = t / 0.4;
            ball.position.copy(s.start1);
            ball.position.y = 0.9 + Math.sin(prepU * Math.PI) * 0.1;
            shadow.position.set(ball.position.x, 0.012, ball.position.z);
            shadow.scale.setScalar(1);

            if (s.isCoachFeed && coach?.userData?.body) {
                coach.userData.body.rotation.y = -Math.PI / 6 * prepU;
            } else if (p1?.userData?.body) {
                p1.userData.body.rotation.y = -Math.PI / 4 * prepU;
                if (p1.userData.racketGroup) {
                    p1.userData.racketGroup.rotation.z = Math.PI / 5 * prepU;
                }
            }
        } else if (t >= 0.4 && t < 1.8) {
            if (this.lastAudioTriggerTime < 0.4) {
                window.tennisAudio?.playHit();
                this.lastAudioTriggerTime = 0.4;
            }

            const flightU = (t - 0.4) / 1.4;
            const x = THREE.MathUtils.lerp(s.start1.x, s.bounce1.x, flightU);
            const z = THREE.MathUtils.lerp(s.start1.z, s.bounce1.z, flightU);
            const midY = (s.start1.y + s.bounce1.y) / 2;
            const y = THREE.MathUtils.lerp(s.start1.y, s.bounce1.y, flightU) + 4 * flightU * (1 - flightU) * (s.apex1 - midY);

            ball.position.set(x, y, z);
            ball.rotation.x += 0.25;
            ball.rotation.z += 0.1;

            shadow.position.set(x, 0.012, z);
            const shadowScale = Math.max(0.4, 1.2 - y * 0.25);
            shadow.scale.setScalar(shadowScale);
            shadow.material.opacity = Math.max(0.15, 0.5 - y * 0.1);

            // Hitter recovery shuffle
            if (p1) {
                const recU = Math.min(1, Math.max(0, (t - 0.7) / 1.0));
                p1.position.x = THREE.MathUtils.lerp(s.p1Start.x, s.p1Rec.x, recU);
                p1.position.z = THREE.MathUtils.lerp(s.p1Start.z, s.p1Rec.z, recU);
                p1.position.y = Math.abs(Math.sin(recU * Math.PI * 4)) * 0.06;
                if (p1.userData.body) p1.userData.body.rotation.y = THREE.MathUtils.lerp(-Math.PI / 4, 0, recU);
            }

            // Receiver runs toward bounce1
            if (p2) {
                const runU = Math.min(1, Math.max(0, (t - 0.6) / 1.1));
                p2.position.x = THREE.MathUtils.lerp(s.p2Start.x, s.bounce1.x - 0.35, runU);
                p2.position.z = THREE.MathUtils.lerp(s.p2Start.z, s.bounce1.z - 0.75, runU);
                p2.position.y = Math.abs(Math.sin(runU * Math.PI * 4)) * 0.06;
                if (p2.userData.body) p2.userData.body.rotation.y = Math.PI / 4 * runU;
            }
        }
        // --- PHASE 2: Bounce 1, Strike 2 & Return Flight (1.8s to 3.4s) ---
        else if (t >= 1.8 && t < 2.2) {
            if (this.lastAudioTriggerTime < 1.8) {
                window.tennisAudio?.playBounce();
                this.triggerRipple(s.bounce1.x, s.bounce1.z);
                this.lastAudioTriggerTime = 1.8;
            }

            const rebU = (t - 1.8) / 0.4;
            const x = THREE.MathUtils.lerp(s.bounce1.x, s.start2.x, rebU);
            const z = THREE.MathUtils.lerp(s.bounce1.z, s.start2.z, rebU);
            const y = 0.08 + Math.sin(rebU * Math.PI) * 0.85;

            ball.position.set(x, y, z);
            shadow.position.set(x, 0.012, z);
            shadow.scale.setScalar(1);

            if (p2?.userData?.racketGroup) {
                p2.userData.racketGroup.rotation.z = Math.PI / 4 * rebU;
            }
        } else if (t >= 2.2 && t < 3.6) {
            if (this.lastAudioTriggerTime < 2.2) {
                window.tennisAudio?.playHit();
                this.lastAudioTriggerTime = 2.2;
            }

            const flightU2 = (t - 2.2) / 1.4;
            const x = THREE.MathUtils.lerp(s.start2.x, s.bounce2.x, flightU2);
            const z = THREE.MathUtils.lerp(s.start2.z, s.bounce2.z, flightU2);
            const midY = (s.start2.y + s.bounce2.y) / 2;
            const y = THREE.MathUtils.lerp(s.start2.y, s.bounce2.y, flightU2) + 4 * flightU2 * (1 - flightU2) * (s.apex2 - midY);

            ball.position.set(x, y, z);
            ball.rotation.x -= 0.25;
            shadow.position.set(x, 0.012, z);
            const shadowScale = Math.max(0.4, 1.2 - y * 0.25);
            shadow.scale.setScalar(shadowScale);
            shadow.material.opacity = Math.max(0.15, 0.5 - y * 0.1);

            if (p2) {
                const recU2 = Math.min(1, Math.max(0, (t - 2.4) / 1.0));
                p2.position.x = THREE.MathUtils.lerp(s.bounce1.x - 0.35, s.p2Rec.x, recU2);
                p2.position.z = THREE.MathUtils.lerp(s.bounce1.z - 0.75, s.p2Rec.z, recU2);
                p2.position.y = Math.abs(Math.sin(recU2 * Math.PI * 4)) * 0.06;
                if (p2.userData.body) p2.userData.body.rotation.y = THREE.MathUtils.lerp(Math.PI / 4, 0, recU2);
            }

            if (p1) {
                const moveU2 = Math.min(1, Math.max(0, (t - 2.5) / 1.0));
                p1.position.x = THREE.MathUtils.lerp(s.p1Rec.x, s.bounce2.x + 0.35, moveU2);
                p1.position.z = THREE.MathUtils.lerp(s.p1Rec.z, s.bounce2.z + 0.75, moveU2);
                p1.position.y = Math.abs(Math.sin(moveU2 * Math.PI * 4)) * 0.06;
            }
        }
        // --- PHASE 3: Bounce 2 & Loop Reset (3.6s to 4.4s) ---
        else {
            if (this.lastAudioTriggerTime < 3.6) {
                window.tennisAudio?.playBounce();
                this.triggerRipple(s.bounce2.x, s.bounce2.z);
                this.lastAudioTriggerTime = 3.6;
            }

            const rebU2 = Math.min(1, (t - 3.6) / 0.8);
            const y = 0.08 + Math.sin(rebU2 * Math.PI) * 0.8;
            ball.position.y = y;
            shadow.position.set(ball.position.x, 0.012, ball.position.z);

            if (p1) {
                p1.position.x = THREE.MathUtils.lerp(p1.position.x, s.p1Start.x, rebU2 * 0.15);
                p1.position.z = THREE.MathUtils.lerp(p1.position.z, s.p1Start.z, rebU2 * 0.15);
            }
        }

        // Animate contact ripple ring
        if (this.rippleActive) {
            const ripAge = t - this.rippleStartTime;
            if (ripAge >= 0 && ripAge <= 0.45) {
                this.rippleMesh.visible = true;
                const ripScale = 1 + ripAge * 5;
                this.rippleMesh.scale.setScalar(ripScale);
                this.rippleMesh.material.opacity = (1 - ripAge / 0.45) * 0.75;
            } else {
                this.rippleMesh.visible = false;
                this.rippleActive = false;
            }
        }

        // Broadcast Tracking Camera (Cinematic video feel following the rally)
        if (this.trackingCam && this.controls) {
            const targetX = ball.position.x * 0.35;
            const targetZ = ball.position.z * 0.15;
            this.controls.target.x = THREE.MathUtils.lerp(this.controls.target.x, targetX, 0.05);
            this.controls.target.z = THREE.MathUtils.lerp(this.controls.target.z, targetZ, 0.05);
            this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetX * 0.3, 0.04);
            this.controls.update();
        }

        if (this.onSimProgress) {
            this.onSimProgress(this.simTime, this.simDuration, this.simTime / this.simDuration);
        }
    }

    triggerRipple(x, z) {
        if (!this.rippleMesh) return;
        this.rippleMesh.position.set(x, 0.015, z);
        this.rippleMesh.scale.setScalar(1);
        this.rippleMesh.material.opacity = 0.75;
        this.rippleMesh.visible = true;
        this.rippleActive = true;
        this.rippleStartTime = this.simTime;
    }

    playSimulation() {
        this.simRunning = true;
        if (this.liveBallMesh) this.liveBallMesh.visible = true;
        if (this.liveBallShadowMesh) this.liveBallShadowMesh.visible = true;
        if (this.onSimStateChange) this.onSimStateChange(true);
    }

    pauseSimulation() {
        this.simRunning = false;
        if (this.onSimStateChange) this.onSimStateChange(false);
    }

    toggleSimulation() {
        if (this.simRunning) this.pauseSimulation();
        else this.playSimulation();
    }

    restartSimulation() {
        this.simTime = 0.0;
        this.lastAudioTriggerTime = -1;
        this.rebuildSimulationScript();
        this.playSimulation();
    }

    seekSimulation(fraction) {
        this.simTime = Math.max(0, Math.min(this.simDuration, fraction * this.simDuration));
        this.lastAudioTriggerTime = this.simTime - 0.05;
        if (this.simScript) {
            this.updateSimulation(0);
        }
    }

    setSimulationSpeed(speed) {
        this.simSpeed = parseFloat(speed) || 1.0;
    }

    setTrackingCam(enabled) {
        this.trackingCam = !!enabled;
    }

    setSimulationLoop(enabled) {
        this.simLoop = !!enabled;
    }

    // Animation Loop
    animate() {
        requestAnimationFrame(() => this.animate());

        const now = performance.now();
        const delta = Math.min((now - this.lastTimestamp) / 1000, 0.1);
        this.lastTimestamp = now;

        // Advance 3D Live Simulation
        this.updateSimulation(delta);

        // Smooth camera movement towards preset
        if (this.targetCameraPos && this.targetCameraLookAt) {
            this.camera.position.lerp(this.targetCameraPos, 0.08);
            if (this.controls) {
                this.controls.target.lerp(this.targetCameraLookAt, 0.08);
                this.controls.update();
            } else {
                this.camera.lookAt(this.targetCameraLookAt);
            }

            if (this.camera.position.distanceTo(this.targetCameraPos) < 0.1) {
                this.targetCameraPos = null;
                this.targetCameraLookAt = null;
            }
        } else if (this.controls && !this.simRunning) {
            this.controls.update();
        }

        this.renderer.render(this.scene, this.camera);
    }
}

window.TennisCourt3DEngine = TennisCourt3DEngine;
