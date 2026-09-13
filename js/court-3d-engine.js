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

        if (typeof THREE === 'undefined') {
            console.warn('Three.js is not loaded yet or unavailable.');
            return;
        }

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
        this.dragAttachedEnds = [];
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

        try {
            this.initThree();
            this.buildCourt();
            this.setupLighting();
            this.setupRaycasting();
            this.initSimulation();
            this.saveState();
            this.animate();
        } catch (err) {
            console.error('TennisCourt3DEngine setup error:', err);
        }

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
        try {
            this.renderer = new THREE.WebGLRenderer({
                antialias: true,
                preserveDrawingBuffer: true,
                powerPreference: 'high-performance'
            });
        } catch (e) {
            console.warn('Standard WebGLRenderer failed, trying basic fallback:', e);
            try {
                this.renderer = new THREE.WebGLRenderer({ antialias: false });
            } catch (e2) {
                console.error('WebGL not available:', e2);
                return;
            }
        }
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
            // Surface changes ball pace and bounce, so re-time the simulation
            if (this.simScript) this.rebuildSimulationScript();
            window.tennisAudio?.playSurfaceChange();
        }
    }

    setCourtFormat(format) {
        this.courtFormat = format;
        this.buildCourt();
        if (this.simScript) this.rebuildSimulationScript();
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

    // Every drawn path endpoint currently sitting on this element, so that
    // moving the element keeps the diagram (and the simulation) consistent.
    findAttachedPathEnds(itemData) {
        if (!itemData) return [];
        const refs = [];
        const onItem = (pt) => pt && Math.abs(pt.x - itemData.x) < 0.012 && Math.abs(pt.y - itemData.y) < 0.012;
        (this.drawings || []).forEach(d => {
            if (onItem(d.from)) refs.push({ drawing: d, end: 'from' });
            if (onItem(d.to)) refs.push({ drawing: d, end: 'to' });
        });
        return refs;
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
                    // Remember which drawn path endpoints are attached to this
                    // item so the arrows (and the simulation) follow the drag.
                    this.dragAttachedEnds = this.findAttachedPathEnds(rootGroup.userData.itemData);
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
                        // Drag the attached ball / feed / movement arrows with it
                        (this.dragAttachedEnds || []).forEach(ref => {
                            ref.drawing[ref.end] = { x: rel.x, y: rel.y };
                        });
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
                if ((this.dragAttachedEnds || []).length) this.rebuildDrawings();
                this.dragAttachedEnds = [];
                this.saveState();
                // The simulation follows the diagram, so re-script it after a move
                this.rebuildSimulationScript();
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
                        this.rebuildSimulationScript();
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

        // Tennis ball curved seam for visible spin rotation
        const seamGeo = new THREE.TorusGeometry(0.121, 0.007, 8, 32);
        const seamMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.liveBallSeam = new THREE.Mesh(seamGeo, seamMat);
        this.liveBallSeam.rotation.y = Math.PI / 2;
        this.liveBallMesh.add(this.liveBallSeam);

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

        // Broadcast Hawk-Eye ball flight trail (dynamic motion ribbon)
        this.maxTrailPoints = 35;
        this.trailPositions = new Float32Array(this.maxTrailPoints * 3);
        const trailGeo = new THREE.BufferGeometry();
        trailGeo.setAttribute('position', new THREE.BufferAttribute(this.trailPositions, 3));
        const trailMat = new THREE.LineBasicMaterial({
            color: 0xCCFF00,
            transparent: true,
            opacity: 0.75,
            linewidth: 2
        });
        this.ballTrailMesh = new THREE.Line(trailGeo, trailMat);
        this.ballTrailMesh.visible = false;
        this.simGroup.add(this.ballTrailMesh);
        this.trailHistory = [];

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

    setScenarioMetadata(meta) {
        this.scenarioMetadata = Object.assign(this.scenarioMetadata || {}, meta || {});
        this.rebuildSimulationScript();
    }

    // =====================================================================
    // LAYOUT-DRIVEN LIVE SIMULATION
    // ---------------------------------------------------------------------
    // The animation is derived from the tactical diagram that is actually on
    // court right now - the player/coach/target elements and the feed, shot
    // and movement paths generated by the LTA Tactical Matrix (or drawn and
    // dragged by the coach). Every selected option therefore plays back
    // exactly as it is drawn: the ball leaves the drawn feeder, is struck
    // from the drawn contact position and lands on the drawn target disc.
    // =====================================================================

    // LTA Youth Stage -> ball pace & bounce (red/orange/green balls are
    // deliberately slower and lower than a standard yellow ball).
    getLevelProfile(level) {
        switch (level) {
            case 'BLUE':       return { paceScale: 0.45, bounceScale: 0.55, format: 'red_stage' };
            case 'RED':        return { paceScale: 0.55, bounceScale: 0.62, format: 'red_stage' };
            case 'ORANGE':     return { paceScale: 0.72, bounceScale: 0.78, format: 'orange_stage' };
            case 'GREEN':      return { paceScale: 0.86, bounceScale: 0.90, format: 'full' };
            case 'YELLOW_BEG': return { paceScale: 0.92, bounceScale: 1.00, format: 'full' };
            case 'YELLOW_ADV': return { paceScale: 1.15, bounceScale: 1.05, format: 'full' };
            default:           return { paceScale: 1.00, bounceScale: 1.00, format: 'full' };
        }
    }

    // Surface -> pace through the court and bounce behaviour
    getSurfaceProfile(surfaceKey) {
        switch (surfaceKey) {
            case 'grass':  return { paceScale: 1.15, bounceScale: 0.70 }; // Fast, low skid
            case 'clay':   return { paceScale: 0.82, bounceScale: 1.35 }; // Slow, high kick
            case 'carpet': return { paceScale: 1.12, bounceScale: 0.80 }; // Fast indoor
            case 'hard_aus': return { paceScale: 0.96, bounceScale: 1.05 };
            default:       return { paceScale: 1.00, bounceScale: 1.00 }; // DecoTurf: true bounce
        }
    }

    // Reads the current diagram into 3D anchor points for the simulation
    getLayoutAnchors() {
        const els = this.elements || [];
        const drs = this.drawings || [];
        const toVec = (p) => this.relTo3D({ x: p.x, y: p.y });

        const playerEls = els.filter(e => e.type === 'player');
        const p1El = playerEls.find(e => e.id === 'p1')
            || playerEls.find(e => e.y > 0.5)
            || playerEls[0] || null;
        const p2El = playerEls.find(e => e !== p1El) || null;
        const coachEl = els.find(e => e.type === 'coach') || null;

        const ballPaths = drs
            .filter(d => (d.type === 'feed_path' || d.type === 'ball_path') && d.from && d.to)
            .map(d => ({
                from: toVec(d.from),
                to: toVec(d.to),
                style: d.style || 'solid',
                label: d.label || '',
                kind: d.type
            }));

        const movePaths = drs
            .filter(d => d.type === 'move_path' && d.from && d.to)
            .map(d => ({
                from: toVec(d.from),
                to: toVec(d.to),
                color: (d.color || '').toLowerCase(),
                label: d.label || ''
            }));

        return {
            p1: p1El ? toVec(p1El) : null,
            p2: p2El ? toVec(p2El) : null,
            coach: coachEl ? toVec(coachEl) : null,
            targets: els.filter(e => e.type === 'target').map(e => ({ pos: toVec(e), points: e.points || 0 })),
            cones: els.filter(e => e.type === 'cone').map(e => toVec(e)),
            ballPaths,
            movePaths
        };
    }

    // Raises a trajectory apex until the ball genuinely clears the net cord
    // (1.07m at the posts sagging to 0.914m at the centre strap).
    ensureNetClearance(start, end, apex) {
        if ((start.z > 0) === (end.z > 0)) return apex; // Never crosses the net
        const span = Math.abs(start.z) + Math.abs(end.z);
        if (span < 0.01) return apex;
        const u = Math.abs(start.z) / span;
        const w = 4 * u * (1 - u);
        if (w < 0.05) return apex;

        const xCross = THREE.MathUtils.lerp(start.x, end.x, u);
        const netH = 0.914 + Math.min(1, Math.abs(xCross) / 5.485) * 0.156;
        const required = netH + 0.22; // Ball radius + realistic margin

        const midY = (start.y + end.y) / 2;
        const linear = THREE.MathUtils.lerp(start.y, end.y, u);
        return Math.max(apex, midY + (required - linear) / w);
    }

    rebuildSimulationScript() {
        const players = this.itemsGroup.children.filter(c => c.userData?.itemData?.type === 'player');
        const coach = this.itemsGroup.children.find(c => c.userData?.itemData?.type === 'coach');

        this.simP1 = players.find(p => p.userData?.itemData?.id === 'p1')
            || players.find(p => (p.userData?.basePos?.z || 0) > 0)
            || players[0];
        this.simP2 = players.find(p => p !== this.simP1);
        this.simCoach = coach;

        // Reset player positions to base coordinates, strictly clamped to their half
        if (this.simP1 && this.simP1.userData?.basePos) {
            this.simP1.position.copy(this.simP1.userData.basePos);
            this.simP1.position.z = Math.max(1.5, Math.min(11.0, this.simP1.position.z));
            if (this.simP1.userData.body) this.simP1.userData.body.rotation.y = 0;
            if (this.simP1.userData.racketGroup) this.simP1.userData.racketGroup.rotation.set(0, 0, 0);
        }
        if (this.simP2 && this.simP2.userData?.basePos) {
            this.simP2.position.copy(this.simP2.userData.basePos);
            this.simP2.position.z = Math.min(-1.5, Math.max(-11.0, this.simP2.position.z));
            if (this.simP2.userData.body) this.simP2.userData.body.rotation.y = 0;
            if (this.simP2.userData.racketGroup) this.simP2.userData.racketGroup.rotation.set(0, 0, 0);
        }
        if (this.simCoach && this.simCoach.userData?.basePos) {
            this.simCoach.position.copy(this.simCoach.userData.basePos);
            this.simCoach.position.z = Math.min(6.0, Math.max(-6.0, this.simCoach.position.z));
            if (this.simCoach.userData.body) this.simCoach.userData.body.rotation.y = 0;
        }

        // ---------------------------------------------------------------
        // Selected options
        // ---------------------------------------------------------------
        const meta = this.scenarioMetadata || {};
        const situation = meta.situation || 'BOTH_BACK';
        const phase = meta.phaseOfPlay || 'RALLY';
        const stageKey = meta.stageKey || 'GAME_ASSESSMENT';
        const tactic = meta.tactic || 'CONTROL_SPACE';
        const level = meta.level || 'YELLOW_INT';
        const surfaceKey = this.surface || meta.surface; // The court actually rendered wins
        const ballChars = Array.isArray(meta.ballCharacteristics) ? meta.ballCharacteristics : ['DEPTH', 'DIRECTION'];
        const shotDir = meta.shotDirection || 'CROSSCOURT';

        const isClosed = (stageKey === 'DEMO_CLOSED');
        const hasSpeed = ballChars.includes('SPEED');
        const hasHeight = ballChars.includes('HEIGHT');
        const hasSpin = ballChars.includes('SPIN');

        const tacticProfile = (window.LTA_FRAMEWORK?.tacticProfiles?.[tactic]) || { apexScale: 1, paceScale: 1 };
        const levelProfile = this.getLevelProfile(level);
        const surfaceProfile = this.getSurfaceProfile(surfaceKey);

        // ---------------------------------------------------------------
        // Read the diagram currently on court
        // ---------------------------------------------------------------
        const a = this.getLayoutAnchors();
        const p1Pos = a.p1 || new THREE.Vector3(2.0, 0, 8.6);
        const p2Pos = a.p2 || new THREE.Vector3(-1.8, 0, -8.8);
        const coachPos = a.coach || new THREE.Vector3(-1.5, 0, -2.0);

        const flat = (v) => new THREE.Vector3(v.x, 0, v.z);
        const dist2D = (v1, v2) => Math.hypot(v1.x - v2.x, v1.z - v2.z);

        // Fallback target if the diagram has no drawn shot path
        const fallbackTarget = new THREE.Vector3(
            shotDir === 'DOWN_THE_LINE' ? 3.2 : (shotDir === 'DOWN_THE_MIDDLE' ? 0.0 : -3.2),
            0.08,
            ballChars.includes('DEPTH') ? -10.5 : -7.5
        );

        let feedPath = a.ballPaths[0] || null;
        let shotPath = a.ballPaths[1] || null;

        // A single drawn ball path means the striker starts with the ball in
        // hand (closed serve practice): there is no incoming feed to return.
        const serveOnly = !!feedPath && !shotPath;

        if (!feedPath) {
            feedPath = { from: flat(p2Pos), to: flat(p1Pos), style: 'solid', label: 'Feed' };
        }
        if (!shotPath && !serveOnly) {
            shotPath = { from: flat(p1Pos), to: fallbackTarget.clone(), style: 'solid', label: 'Shot' };
        }

        // ---------------------------------------------------------------
        // Who feeds, who strikes
        // ---------------------------------------------------------------
        const candidates = [
            { key: 'p2', pos: p2Pos, obj: this.simP2 },
            { key: 'coach', pos: coachPos, obj: this.simCoach },
            { key: 'p1', pos: p1Pos, obj: this.simP1 }
        ].filter(c => c.obj);

        const nearestTo = (point, pool) => {
            let best = null, bestD = Infinity;
            (pool || candidates).forEach(c => {
                const d = dist2D(c.pos, point);
                if (d < bestD) { bestD = d; best = c; }
            });
            return best;
        };

        const feeder = nearestTo(feedPath.from) || candidates[0] || { key: 'p2', pos: p2Pos };
        const strikerPool = candidates.filter(c => c.key !== 'coach');
        const striker = serveOnly
            ? (feeder.key === 'coach' ? (strikerPool[0] || feeder) : feeder)
            : (nearestTo(shotPath.from, strikerPool) || { key: 'p1', pos: p1Pos });

        const isCoachFeeder = feeder.key === 'coach';
        const isP2Feeder = feeder.key === 'p2';
        const strikerPos = striker.pos;
        const strikerAtNet = Math.abs(strikerPos.z) < 5.0;

        // A serve is fed from the baseline with an overhead contact point
        const isServeFeed = (situation === 'SERVE' && feeder.key === 'p1')
            || (situation === 'RETURN' && feeder.key === 'p2')
            || (isClosed && situation === 'SERVE')
            || /serve/i.test(feedPath.label || '');

        // ---------------------------------------------------------------
        // Feed trajectory
        // ---------------------------------------------------------------
        const feedStartY = isServeFeed ? 2.25 : (isCoachFeeder ? 1.15 : 0.95);
        const feedStart = new THREE.Vector3(feedPath.from.x, feedStartY, feedPath.from.z);

        // If the feed path simply points at the striker, land it in their
        // strike zone rather than on top of them.
        const feedAimsAtStriker = dist2D(feedPath.to, strikerPos) < 1.6;
        let feedBounce;
        if (feedAimsAtStriker) {
            const towardsFeeder = new THREE.Vector3(feedStart.x - strikerPos.x, 0, feedStart.z - strikerPos.z);
            if (towardsFeeder.lengthSq() < 0.001) towardsFeeder.set(0, 0, -1);
            towardsFeeder.normalize().multiplyScalar(strikerAtNet ? 0.9 : 1.15);
            feedBounce = new THREE.Vector3(
                strikerPos.x + towardsFeeder.x,
                strikerAtNet ? 0.95 : 0.08,
                strikerPos.z + towardsFeeder.z
            );
        } else {
            feedBounce = new THREE.Vector3(feedPath.to.x, strikerAtNet && !isServeFeed ? 0.95 : 0.08, feedPath.to.z);
        }

        // ---------------------------------------------------------------
        // Contact point & shot trajectory
        // ---------------------------------------------------------------
        let shotStart, shotBounce, shotTargetLabel;
        if (serveOnly) {
            // Serve practice: the drawn path IS the serve, it simply runs on
            // to the back of the court after it lands.
            shotStart = feedBounce.clone();
            const run = new THREE.Vector3(feedBounce.x - feedStart.x, 0, feedBounce.z - feedStart.z).normalize();
            shotBounce = new THREE.Vector3(
                THREE.MathUtils.clamp(feedBounce.x + run.x * 3.4, -5.2, 5.2),
                0.08,
                THREE.MathUtils.clamp(feedBounce.z + run.z * 3.4, -11.4, 11.4)
            );
            shotTargetLabel = feedPath.label;
        } else if (strikerAtNet) {
            // Volley: struck out of the air where the feed arrives
            shotStart = new THREE.Vector3(feedBounce.x, Math.max(0.95, feedBounce.y), feedBounce.z);
            shotBounce = new THREE.Vector3(shotPath.to.x, 0.08, shotPath.to.z);
            shotTargetLabel = shotPath.label;
        } else {
            // Groundstroke: contact just in front of the striker, on the
            // side the ball is arriving from.
            const toBounce = new THREE.Vector3(feedBounce.x - strikerPos.x, 0, feedBounce.z - strikerPos.z);
            const reach = Math.min(1.1, toBounce.length() * 0.55);
            if (toBounce.lengthSq() > 0.001) toBounce.normalize().multiplyScalar(reach);
            shotStart = new THREE.Vector3(strikerPos.x + toBounce.x, 0.88, strikerPos.z + toBounce.z);
            shotBounce = new THREE.Vector3(shotPath.to.x, 0.08, shotPath.to.z);
            shotTargetLabel = shotPath.label;
        }

        // ---------------------------------------------------------------
        // Ball physics from Ball Characteristics + Tactic + Level + Surface
        // ---------------------------------------------------------------
        // The tactic scales the base trajectory; the drawn arc shape, the
        // HEIGHT characteristic and the phase then set a floor/ceiling, so the
        // two never multiply into an unrealistic moonball.
        let shotApex = 1.85 * (tacticProfile.apexScale || 1);
        if (shotPath && shotPath.style === 'loop') shotApex = Math.max(shotApex, 3.2);
        if (hasHeight) shotApex = Math.max(shotApex, 3.3);
        if (phase === 'DEFEND') shotApex = Math.max(shotApex, 4.0);
        if (phase === 'ATTACK') shotApex = Math.min(shotApex, hasSpeed ? 1.35 : 1.6);
        if (strikerAtNet) shotApex = Math.min(shotApex, 1.3);
        if (serveOnly) shotApex = Math.min(shotApex, 1.6); // Run-on after the bounce
        shotApex = this.ensureNetClearance(shotStart, shotBounce, shotApex);

        let feedApex = isServeFeed ? 2.6 : (isCoachFeeder ? 1.6 : 1.55);
        if (phase === 'DEFEND' && !isServeFeed) feedApex = 2.4; // Heavy deep feed
        feedApex = this.ensureNetClearance(feedStart, feedBounce, feedApex);

        // Each option contributes its own deviation from standard pace, so the
        // scalars stay readable side by side instead of compounding into the
        // clamp and washing the differences out.
        const deviation = (v, weight) => ((v || 1) - 1) * weight;
        const paceScale = THREE.MathUtils.clamp(
            1
            + deviation(levelProfile.paceScale, 0.70)     // Red/orange/green ball speed
            + deviation(surfaceProfile.paceScale, 0.60)   // Grass skids, clay grips
            + deviation(tacticProfile.paceScale, 0.80)    // Control Time vs Consistency
            + (hasSpeed ? 0.22 : 0)                       // "Speed" ball characteristic
            + (phase === 'ATTACK' ? 0.12 : 0)
            - (phase === 'DEFEND' ? 0.18 : 0),
            0.45, 1.9
        );

        const flightTime = (from, to, lift) => THREE.MathUtils.clamp(
            (0.22 + dist2D(from, to) * 0.048 + lift * 0.05) / paceScale, 0.40, 3.0
        );

        const feedFlight = flightTime(feedStart, feedBounce, feedApex);
        const shotFlight = flightTime(shotStart, shotBounce, shotApex);
        const carry = THREE.MathUtils.clamp(dist2D(feedBounce, shotStart) * 0.075 + 0.06, 0.06, 0.55);

        let bounceRebound = 0.75;
        if (shotApex > 3.0) bounceRebound = 1.55;          // High looping ball kicks up
        else if (hasSpin && phase === 'DEFEND') bounceRebound = 0.40; // Slice skids low
        else if (hasSpin) bounceRebound = 1.30;            // Topspin kick
        bounceRebound *= surfaceProfile.bounceScale * levelProfile.bounceScale;

        const ballSpinSpeed = (hasSpin ? 0.55 : 0.22) * (hasSpeed ? 1.3 : 1);

        // ---------------------------------------------------------------
        // Player movement, read from the drawn movement arrows
        // ---------------------------------------------------------------
        const usedMoves = new Set();
        const findMove = (fromPos, opts = {}) => {
            let best = null, bestD = opts.radius || 3.0;
            a.movePaths.forEach((m, i) => {
                if (usedMoves.has(i)) return;
                if (opts.color && m.color !== opts.color) return;
                const d = dist2D(m.from, fromPos);
                if (d < bestD) { bestD = d; best = { move: m, index: i }; }
            });
            if (best) usedMoves.add(best.index);
            return best ? best.move : null;
        };

        // P2 first: a red arrow is explicitly the opponent's movement
        const p2Move = findMove(p2Pos, { color: '#dc2626' }) || findMove(p2Pos);
        const p1Move = findMove(p1Pos);

        // Does the opponent rush the net during the feed?
        const isNetRush = !!(p2Move && Math.abs(p2Move.to.z) < 4.2 && Math.abs(p2Move.to.z) < Math.abs(p2Move.from.z) - 0.8);
        const isLob = isNetRush && shotApex > 3.0;

        const p2FeedPos = isNetRush ? flat(p2Move.to) : flat(p2Pos);
        let p2PlayPos;
        if (isNetRush) {
            p2PlayPos = isLob
                ? new THREE.Vector3(THREE.MathUtils.clamp(shotBounce.x * 0.6, -4.0, 4.0), 0, Math.max(-9.5, shotBounce.z + 1.2))
                : new THREE.Vector3(THREE.MathUtils.clamp(p2FeedPos.x + (shotBounce.x > p2FeedPos.x ? 1.6 : -1.6), -4.6, 4.6), 0, p2FeedPos.z);
        } else if (p2Move) {
            p2PlayPos = flat(p2Move.to);
        } else {
            // Chases the ball it has to play next
            p2PlayPos = new THREE.Vector3(
                THREE.MathUtils.clamp(shotBounce.x * 0.8, -4.6, 4.6),
                0,
                THREE.MathUtils.clamp(shotBounce.z + 1.0, -11.0, -1.6)
            );
        }

        const p1FeedPos = (striker.key === 'p1')
            ? flat(shotStart)
            : flat(p1Pos).lerp(p1Move ? flat(p1Move.to) : flat(p1Pos), 0.5);

        let p1PlayPos;
        if (p1Move) {
            p1PlayPos = flat(p1Move.to);
        } else if (a.cones.length) {
            const cone = a.cones
                .filter(c => c.z > 0)
                .sort((c1, c2) => dist2D(c1, p1Pos) - dist2D(c2, p1Pos))[0];
            p1PlayPos = cone ? flat(cone) : flat(p1FeedPos);
        } else {
            p1PlayPos = new THREE.Vector3(0.5, 0, Math.max(2.0, p1Pos.z));
        }

        this.simScript = {
            mode: isClosed ? 'COACH_FEED' : situation,
            situation: situation,
            stageKey: stageKey,
            phase: phase,
            tactic: tactic,
            shotDirection: shotDir,
            shotLabel: shotTargetLabel,

            tWindup: 0.35,
            tFeedBounce: 0.35 + feedFlight,
            tStrike: 0.35 + feedFlight + carry,
            tShotBounce: 0.35 + feedFlight + carry + shotFlight,
            duration: 0.35 + feedFlight + carry + shotFlight + 1.35,

            feedStart: feedStart,
            feedBounce: feedBounce,
            feedApex: feedApex,
            feedIsVolley: feedBounce.y > 0.5,

            shotStart: shotStart,
            shotBounce: shotBounce,
            shotApex: shotApex,
            bounceRebound: bounceRebound,
            ballSpinSpeed: ballSpinSpeed,

            p1Start: flat(p1Pos),
            p1FeedPos: p1FeedPos,
            p1PlayPos: p1PlayPos,
            p2Start: flat(p2Pos),
            p2FeedPos: p2FeedPos,
            p2PlayPos: p2PlayPos,

            strikerKey: striker.key,
            isCoachFeeder: isCoachFeeder,
            isP2Feeder: isP2Feeder,
            isP1Server: feeder.key === 'p1',
            isNetRush: isNetRush,
            isLob: isLob,
            serveOnly: serveOnly
        };

        this.simDuration = this.simScript.duration;
        this.simTime = 0.0;
        this.lastAudioTriggerTime = -1;
        this.currentSimPhase = 'FEED';
        this.trailHistory = [];

        if (this.liveBallMesh) {
            this.liveBallMesh.position.copy(this.simScript.feedStart);
            this.liveBallMesh.visible = this.simRunning;
            if (this.liveBallShadowMesh) this.liveBallShadowMesh.visible = this.simRunning;
        }

        // Snap players to start positions immediately
        this.updateSimulation(0);
    }

    // Quadratic flight helper shared by every ball segment
    arcPoint(start, end, apex, u) {
        const midY = (start.y + end.y) / 2;
        return new THREE.Vector3(
            THREE.MathUtils.lerp(start.x, end.x, u),
            THREE.MathUtils.lerp(start.y, end.y, u) + 4 * u * (1 - u) * (apex - midY),
            THREE.MathUtils.lerp(start.z, end.z, u)
        );
    }

    updateSimulation(dt) {
        if (!this.simScript) return;
        if (this.simRunning) {
            this.simTime += dt * this.simSpeed;
            if (this.simTime >= this.simDuration) {
                if (this.simLoop) {
                    this.simTime = 0.0;
                    this.lastAudioTriggerTime = -1;
                    this.trailHistory = [];
                } else {
                    this.simTime = this.simDuration;
                    this.pauseSimulation();
                    return;
                }
            }
        }

        const t = this.simTime;
        const s = this.simScript;
        const p1 = this.simP1;
        const p2 = this.simP2;
        const coach = this.simCoach;
        const ball = this.liveBallMesh;
        const shadow = this.liveBallShadowMesh;

        const striker = (s.strikerKey === 'p2') ? p2 : p1;
        const nonStriker = (s.strikerKey === 'p2') ? p1 : p2;

        if (ball) ball.visible = this.simRunning || t > 0;
        if (shadow) shadow.visible = this.simRunning || t > 0;

        // Determine active FSP Phase
        let currentPhase = 'FEED';
        if (t >= s.tFeedBounce && t < s.tShotBounce) currentPhase = 'SHOT';
        else if (t >= s.tShotBounce) currentPhase = 'PLAY';

        if (this.currentSimPhase !== currentPhase) {
            this.currentSimPhase = currentPhase;
            if (this.onSimPhaseChange) this.onSimPhaseChange(currentPhase);
        }

        const placeBall = (pos) => {
            if (ball) ball.position.copy(pos);
            if (shadow) {
                shadow.position.set(pos.x, 0.012, pos.z);
                shadow.scale.setScalar(Math.max(0.4, 1.2 - pos.y * 0.25));
            }
        };

        // =====================================================================
        // UNIFIED 3D CHOREOGRAPHY (FEED -> CARRY -> STRIKE -> PLAY)
        // =====================================================================

        if (t < s.tWindup) {
            // -------------------------------------------------------------
            // SUBPHASE 1: Feeder Windup & Coil
            // -------------------------------------------------------------
            const u = t / s.tWindup;
            placeBall(s.feedStart);

            if (s.isP2Feeder && p2?.userData?.body) {
                p2.userData.body.rotation.y = -Math.PI / 4 * u;
                if (p2.userData.racketGroup) p2.userData.racketGroup.rotation.z = Math.PI / 4 * u;
            } else if (s.isCoachFeeder && coach?.userData?.body) {
                coach.userData.body.rotation.y = -Math.PI / 6 * u;
            } else if (p1?.userData?.body) {
                // P1 Serve windup
                p1.userData.body.rotation.y = Math.PI / 4 * u;
                if (p1.userData.racketGroup) p1.userData.racketGroup.rotation.z = -Math.PI / 4 * u;
            }

            if (p1) p1.position.copy(s.p1Start);
            if (p2) p2.position.copy(s.p2Start);

        } else if (t < s.tFeedBounce) {
            // -------------------------------------------------------------
            // SUBPHASE 2: FEED FLIGHT (racket contact -> first bounce)
            // -------------------------------------------------------------
            if (this.lastAudioTriggerTime < s.tWindup) {
                window.tennisAudio?.playHit();
                this.lastAudioTriggerTime = s.tWindup;
            }

            const u = (t - s.tWindup) / Math.max(0.001, s.tFeedBounce - s.tWindup);
            placeBall(this.arcPoint(s.feedStart, s.feedBounce, s.feedApex, u));
            if (ball) ball.rotation.x += s.ballSpinSpeed;

            // Feeder Follow-Through
            if (s.isP2Feeder && p2?.userData?.body) {
                p2.userData.body.rotation.y = THREE.MathUtils.lerp(-Math.PI / 4, 0, u);
            } else if (s.isCoachFeeder && coach?.userData?.body) {
                coach.userData.body.rotation.y = THREE.MathUtils.lerp(-Math.PI / 6, 0, u);
            } else if (s.isP1Server && p1?.userData?.racketGroup) {
                p1.userData.racketGroup.rotation.z = THREE.MathUtils.lerp(-Math.PI / 4, Math.PI / 5, Math.min(1, u * 2));
            }

            // NET RUSHER APPROACH (P2 sprints forward behind the approach)
            if (s.isNetRush && p2) {
                p2.position.x = THREE.MathUtils.lerp(s.p2Start.x, s.p2FeedPos.x, u);
                p2.position.z = THREE.MathUtils.lerp(s.p2Start.z, s.p2FeedPos.z, u);
                p2.position.y = Math.abs(Math.sin(u * Math.PI * 4)) * 0.06;
                if (p2.userData.body) p2.userData.body.rotation.y = 0;
            } else if (p2 && !s.isCoachFeeder) {
                p2.position.x = THREE.MathUtils.lerp(s.p2Start.x, s.p2FeedPos.x, u);
                p2.position.z = THREE.MathUtils.lerp(s.p2Start.z, s.p2FeedPos.z, u);
            }

            // P1 footwork into the strike zone (or recovery after serving)
            if (p1) {
                p1.position.x = THREE.MathUtils.lerp(s.p1Start.x, s.p1FeedPos.x, u);
                p1.position.z = THREE.MathUtils.lerp(s.p1Start.z, s.p1FeedPos.z, u);
                p1.position.y = Math.abs(Math.sin(u * Math.PI * 4)) * 0.05;
                if (striker === p1) {
                    if (p1.userData.body) p1.userData.body.rotation.y = -Math.PI / 4 * u;
                    if (p1.userData.racketGroup) p1.userData.racketGroup.rotation.z = Math.PI / 4 * u;
                }
            }

        } else if (t < s.tStrike) {
            // -------------------------------------------------------------
            // SUBPHASE 3: BOUNCE -> CONTACT (ball rises into the strike zone)
            // -------------------------------------------------------------
            if (this.lastAudioTriggerTime < s.tFeedBounce) {
                if (!s.feedIsVolley) {
                    window.tennisAudio?.playBounce();
                    this.triggerRipple(s.feedBounce.x, s.feedBounce.z);
                }
                this.lastAudioTriggerTime = s.tFeedBounce;
            }

            const u = (t - s.tFeedBounce) / Math.max(0.001, s.tStrike - s.tFeedBounce);
            const riseApex = Math.max(s.feedBounce.y, s.shotStart.y) + 0.45;
            placeBall(this.arcPoint(s.feedBounce, s.shotStart, riseApex, u));
            if (ball) ball.rotation.x += s.ballSpinSpeed * 0.6;

            // Striker completes the take-back as the ball comes up
            if (striker) {
                if (striker.userData.body) striker.userData.body.rotation.y = -Math.PI / 4;
                if (striker.userData.racketGroup) striker.userData.racketGroup.rotation.z = THREE.MathUtils.lerp(Math.PI / 4, Math.PI / 2.6, u);
            }

        } else if (t < s.tShotBounce) {
            // -------------------------------------------------------------
            // SUBPHASE 4: STRUCK SHOT FLIGHT TO THE DRAWN TARGET
            // -------------------------------------------------------------
            if (this.lastAudioTriggerTime < s.tStrike) {
                window.tennisAudio?.playHit();
                this.lastAudioTriggerTime = s.tStrike;
            }

            const u = (t - s.tStrike) / Math.max(0.001, s.tShotBounce - s.tStrike);
            placeBall(this.arcPoint(s.shotStart, s.shotBounce, s.shotApex, u));
            if (ball) ball.rotation.x -= s.ballSpinSpeed;

            // Striker follow-through and transition movement
            if (striker) {
                if (striker.userData.body) striker.userData.body.rotation.y = THREE.MathUtils.lerp(-Math.PI / 4, 0, u);
                if (striker.userData.racketGroup) {
                    striker.userData.racketGroup.rotation.z = THREE.MathUtils.lerp(Math.PI / 2.6, -Math.PI / 4, Math.min(1, u * 2));
                }
            }

            if (p1) {
                p1.position.x = THREE.MathUtils.lerp(s.p1FeedPos.x, s.p1PlayPos.x, u);
                p1.position.z = THREE.MathUtils.lerp(s.p1FeedPos.z, s.p1PlayPos.z, u);
                p1.position.y = Math.abs(Math.sin(u * Math.PI * 4)) * 0.05;
            }

            // Opponent anticipation / split step
            if (p2) {
                if (s.isNetRush) {
                    // Holds the net position, split-steps and tracks the ball
                    p2.position.set(s.p2FeedPos.x, 0, s.p2FeedPos.z);
                    if (p2.userData.body) p2.userData.body.rotation.y = THREE.MathUtils.lerp(0, (s.shotBounce.x > s.p2FeedPos.x ? 0.3 : -0.3), u);
                } else if (striker !== p2) {
                    p2.position.x = THREE.MathUtils.lerp(s.p2FeedPos.x, s.p2PlayPos.x, u * 0.6);
                    p2.position.z = THREE.MathUtils.lerp(s.p2FeedPos.z, s.p2PlayPos.z, u * 0.6);
                    p2.position.y = Math.abs(Math.sin(u * Math.PI * 3)) * 0.04;
                }
            }

        } else {
            // -------------------------------------------------------------
            // SUBPHASE 5: PLAY (bounce impact, reaction & recovery)
            // -------------------------------------------------------------
            if (this.lastAudioTriggerTime < s.tShotBounce) {
                window.tennisAudio?.playBounce();
                this.triggerRipple(s.shotBounce.x, s.shotBounce.z);
                this.lastAudioTriggerTime = s.tShotBounce;
            }

            const playDur = Math.max(0.8, s.duration - s.tShotBounce);
            const u = Math.min(1, (t - s.tShotBounce) / playDur);

            if (ball) {
                const rebY = 0.08 + Math.sin(u * Math.PI) * s.bounceRebound;
                const driftX = THREE.MathUtils.lerp(s.shotBounce.x, s.shotBounce.x + (s.shotBounce.x > 0 ? 0.4 : -0.4), u);
                const driftZ = THREE.MathUtils.lerp(s.shotBounce.z, s.shotBounce.z + (s.shotBounce.z < 0 ? -1.0 : 1.0), u);
                placeBall(new THREE.Vector3(driftX, rebY, driftZ));
                ball.rotation.x -= s.ballSpinSpeed * 0.5;
            }

            // Opponent reaction at the net or on the baseline
            if (p2) {
                if (s.isNetRush) {
                    if (s.isLob) {
                        // Turns and sprints back to chase the lob
                        if (p2.userData.body) p2.userData.body.rotation.y = Math.PI * Math.min(1, u * 2);
                        p2.position.x = THREE.MathUtils.lerp(s.p2FeedPos.x, s.p2PlayPos.x, u);
                        p2.position.z = THREE.MathUtils.lerp(s.p2FeedPos.z, s.p2PlayPos.z, u);
                        p2.position.y = Math.abs(Math.sin(u * Math.PI * 4)) * 0.05;
                    } else {
                        // Lunges sideways at the net with the racket outstretched
                        p2.position.x = THREE.MathUtils.lerp(s.p2FeedPos.x, s.p2PlayPos.x, Math.min(1, u * 2.5));
                        p2.position.z = s.p2FeedPos.z;
                        if (p2.userData.racketGroup) {
                            const lungeDir = (s.p2PlayPos.x > s.p2FeedPos.x) ? -1 : 1;
                            p2.userData.racketGroup.rotation.z = lungeDir * (Math.PI / 3) * Math.min(1, u * 2);
                        }
                    }
                } else if (!s.isCoachFeeder || striker === p2) {
                    // Sprints to the ball it now has to play
                    p2.position.x = THREE.MathUtils.lerp(s.p2FeedPos.x, s.p2PlayPos.x, u);
                    p2.position.z = THREE.MathUtils.lerp(s.p2FeedPos.z, s.p2PlayPos.z, u);
                    p2.position.y = Math.abs(Math.sin(u * Math.PI * 3)) * 0.04;
                }
            }

            // P1 completes the recovery drawn on the diagram
            if (p1) {
                p1.position.x = THREE.MathUtils.lerp(s.p1FeedPos.x, s.p1PlayPos.x, Math.min(1, 0.5 + u * 0.5));
                p1.position.z = THREE.MathUtils.lerp(s.p1FeedPos.z, s.p1PlayPos.z, Math.min(1, 0.5 + u * 0.5));
                if (p1.userData.body) p1.userData.body.rotation.y = 0;
                if (p1.userData.racketGroup) p1.userData.racketGroup.rotation.set(0, 0, 0);
            }
            if (nonStriker && nonStriker.userData?.racketGroup && nonStriker !== p2) {
                nonStriker.userData.racketGroup.rotation.set(0, 0, 0);
            }
        }

        // =====================================================================
        // COACH OBSERVER ANIMATION (In Open / Game Stages)
        // =====================================================================
        if (coach && !s.isCoachFeeder) {
            // Coach stands by the sideline observing the rally
            if (coach.userData.body) {
                coach.userData.body.rotation.y = Math.sin(t * 2.0) * 0.25; // Turns head tracking ball
            }
        }

        // =====================================================================
        // BROADCAST HAWK-EYE BALL FLIGHT TRAIL
        // =====================================================================
        if (this.ballTrailMesh && ball && (this.simRunning || t > 0)) {
            this.trailHistory.push(ball.position.clone());
            if (this.trailHistory.length > this.maxTrailPoints) {
                this.trailHistory.shift();
            }
            const count = this.trailHistory.length;
            const posAttr = this.ballTrailMesh.geometry.attributes.position;
            for (let i = 0; i < count; i++) {
                const pt = this.trailHistory[i];
                posAttr.setXYZ(i, pt.x, pt.y, pt.z);
            }
            posAttr.needsUpdate = true;
            this.ballTrailMesh.geometry.setDrawRange(0, count);
            this.ballTrailMesh.visible = (count > 2);
        } else if (this.ballTrailMesh) {
            this.ballTrailMesh.visible = false;
        }

        // =====================================================================
        // ABSOLUTE SAFETY CLAMPING (GUARANTEES NO PLAYER EVER CROSSES THE NET)
        // =====================================================================
        if (p1) {
            p1.position.z = Math.max(1.4, Math.min(11.2, p1.position.z));
            p1.position.x = Math.max(-4.8, Math.min(4.8, p1.position.x));
        }
        if (p2) {
            p2.position.z = Math.min(-1.4, Math.max(-11.2, p2.position.z));
            p2.position.x = Math.max(-4.8, Math.min(4.8, p2.position.x));
        }
        if (coach) {
            coach.position.z = Math.min(6.0, Math.max(-6.0, coach.position.z));
            coach.position.x = Math.max(-5.0, Math.min(5.0, coach.position.x));
        }

        // Contact Ripple Animation
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

        // Broadcast Tracking Camera
        if (this.trackingCam && this.controls && ball) {
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
