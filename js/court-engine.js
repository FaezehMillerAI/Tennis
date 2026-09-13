/**
 * Interactive Tennis Court Engine
 * Canvas-based high-performance tactical board with:
 * - 5 Court Surfaces (Wimbledon Grass, Roland Garros Clay, US Open Hard, Aus Open, Indoor)
 * - LTA Court Stages (Full Court, Red 36ft, Orange 60ft, Half Court)
 * - Drag & Drop Players, Coaches, Hoppers, Cones, Agility Ladders, Targets
 * - Tactical Vector Drawing (Ball paths, Player movement, Coach feeds, Target zones)
 * - Touch & Mouse Support, Undo/Redo, PNG Export, and Phase Animation
 */

class TennisCourtEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');

        // State
        this.surface = 'hard_blue'; // grass, clay, hard_blue, hard_aus, carpet
        this.courtFormat = 'full'; // full, red_stage, orange_stage, half
        this.tool = 'select'; // select, draw_ball, draw_move, draw_feed, draw_target_zone, eraser
        this.ballPathStyle = 'solid'; // solid, loop, slice

        this.elements = [];
        this.drawings = [];
        this.history = [];
        this.historyIndex = -1;

        // Interaction state
        this.selectedElement = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.isDrawing = false;
        this.drawStart = null;
        this.currentDrawing = null;

        // Animation state
        this.isAnimating = false;
        this.animPhase = 0;
        this.animProgress = 0;

        this.initCanvasSize();
        this.attachEvents();
        this.saveState();
        this.render();

        window.addEventListener('resize', () => {
            this.initCanvasSize();
            this.render();
        });
    }

    initCanvasSize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        // Maintain standard tennis court aspect ratio (around 1:1.6 to 1:1.8 with surrounds)
        const width = Math.min(rect.width, 920);
        const height = Math.min(width * 1.35, 780);

        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;

        this.ctx.resetTransform?.();
        this.ctx.scale(dpr, dpr);
        this.cssWidth = width;
        this.cssHeight = height;
    }

    setSurface(surfaceKey) {
        if (LTA_FRAMEWORK.surfaces[surfaceKey]) {
            this.surface = surfaceKey;
            window.tennisAudio?.playSurfaceChange();
            this.render();
        }
    }

    setCourtFormat(format) {
        this.courtFormat = format;
        this.render();
    }

    setTool(toolName) {
        this.tool = toolName;
        this.selectedElement = null;
        this.render();
    }

    setBallPathStyle(style) {
        this.ballPathStyle = style;
    }

    // Load elements and drawings from a session phase
    loadPhase(phaseData) {
        if (!phaseData) return;
        this.elements = JSON.parse(JSON.stringify(phaseData.elements || []));
        this.drawings = JSON.parse(JSON.stringify(phaseData.drawings || []));
        this.selectedElement = null;
        this.saveState();
        this.render();
    }

    getCurrentPhaseData() {
        return {
            elements: JSON.parse(JSON.stringify(this.elements)),
            drawings: JSON.parse(JSON.stringify(this.drawings))
        };
    }

    saveState() {
        // Truncate redo history
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
            this.selectedElement = null;
            this.render();
            window.tennisAudio?.playClick();
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const state = this.history[this.historyIndex];
            this.elements = JSON.parse(JSON.stringify(state.elements));
            this.drawings = JSON.parse(JSON.stringify(state.drawings));
            this.selectedElement = null;
            this.render();
            window.tennisAudio?.playClick();
        }
    }

    clearCourt() {
        this.elements = [];
        this.drawings = [];
        this.selectedElement = null;
        this.saveState();
        this.render();
        window.tennisAudio?.playClick();
    }

    // Add item from toolbox onto canvas
    addItem(type, extra = {}) {
        const id = `${type}_${Date.now()}`;
        // Place in center or random offset
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
            const playerCount = this.elements.filter(e => e.type === 'player').length;
            newItem.label = `بازیکن ${playerCount + 1}`;
        } else if (type === 'coach' && !newItem.label) {
            newItem.label = 'مربی';
        } else if (type === 'target' && !newItem.points) {
            newItem.points = 5;
        } else if (type === 'cone' && !newItem.color) {
            newItem.color = '#f97316';
        }

        this.elements.push(newItem);
        this.selectedElement = newItem;
        this.saveState();
        this.render();
        window.tennisAudio?.playBounce();
    }

    // Geometry Calculation
    getCourtBounds() {
        const w = this.cssWidth;
        const h = this.cssHeight;
        const padX = w * 0.12;
        const padY = h * 0.08;

        const courtW = w - padX * 2;
        const courtH = h - padY * 2;

        return {
            x: padX,
            y: padY,
            width: courtW,
            height: courtH,
            netY: padY + courtH / 2,
            left: padX,
            right: padX + courtW,
            top: padY,
            bottom: padY + courtH
        };
    }

    // Convert relative coordinates [0..1] to canvas pixel coordinates
    relToPixel(p) {
        const bounds = this.getCourtBounds();
        return {
            x: bounds.x + p.x * bounds.width,
            y: bounds.y + p.y * bounds.height
        };
    }

    pixelToRel(p) {
        const bounds = this.getCourtBounds();
        return {
            x: Math.max(0, Math.min(1, (p.x - bounds.x) / bounds.width)),
            y: Math.max(0, Math.min(1, (p.y - bounds.y) / bounds.height))
        };
    }

    // Rendering Engine
    render() {
        const ctx = this.ctx;
        const w = this.cssWidth;
        const h = this.cssHeight;
        const bounds = this.getCourtBounds();

        ctx.clearRect(0, 0, w, h);

        // 1. Draw Surface Surround
        this.renderSurround(ctx, w, h);

        // 2. Draw Court Surface Inside
        this.renderInnerCourt(ctx, bounds);

        // 3. Draw Court Lines according to Format
        this.renderCourtLines(ctx, bounds);

        // 4. Draw Net
        this.renderNet(ctx, bounds);

        // 5. Draw Tactical Drawings (Ball Paths, Movements, Feeds, Zones)
        this.renderDrawings(ctx);

        // 6. Draw Interactive Elements (Players, Coaches, Cones, Targets, Balls)
        this.renderElements(ctx);

        // 7. Draw Current In-Progress Vector Drawing
        if (this.isDrawing && this.currentDrawing) {
            this.renderSingleDrawing(ctx, this.currentDrawing, true);
        }

        // 8. Surface Badge Label
        this.renderSurfaceBadge(ctx);
    }

    renderSurround(ctx, w, h) {
        const s = LTA_FRAMEWORK.surfaces[this.surface] || LTA_FRAMEWORK.surfaces.hard_blue;

        // Base surround color
        ctx.fillStyle = s.surroundColor;
        ctx.fillRect(0, 0, w, h);

        // Textures based on surface
        if (this.surface === 'grass') {
            // Grass lawn mower stripes on surround
            ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
            const stripeH = h / 24;
            for (let i = 0; i < 24; i += 2) {
                ctx.fillRect(0, i * stripeH, w, stripeH);
            }
        } else if (this.surface === 'clay') {
            // Clay subtle red speckle
            ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
            for (let i = 0; i < 60; i++) {
                const rx = (i * 73) % w;
                const ry = (i * 97) % h;
                ctx.fillRect(rx, ry, 2, 2);
            }
        }
    }

    renderInnerCourt(ctx, b) {
        const s = LTA_FRAMEWORK.surfaces[this.surface] || LTA_FRAMEWORK.surfaces.hard_blue;

        // Shadow under inner court
        ctx.shadowColor = 'rgba(0,0,0,0.35)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 4;

        ctx.fillStyle = s.courtColor;
        ctx.fillRect(b.x, b.y, b.width, b.height);

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Surface texture overlays
        if (this.surface === 'grass') {
            // Beautiful Wimbledon mower stripes (alternating greens)
            const stripes = 18;
            const stripeH = b.height / stripes;
            for (let i = 0; i < stripes; i++) {
                if (i % 2 === 0) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
                    ctx.fillRect(b.x, b.y + i * stripeH, b.width, stripeH);
                }
            }
        } else if (this.surface === 'clay') {
            // Clay slide marks
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(b.x + b.width * 0.3, b.y + b.height * 0.8, 40, 0.2, 1.2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(b.x + b.width * 0.7, b.y + b.height * 0.2, 45, 2.5, 3.8);
            ctx.stroke();
        }
    }

    renderCourtLines(ctx, b) {
        const s = LTA_FRAMEWORK.surfaces[this.surface] || LTA_FRAMEWORK.surfaces.hard_blue;
        const lineCol = s.lineColor;

        ctx.strokeStyle = lineCol;
        ctx.lineWidth = 2.5;

        // 1. Doubles Sidelines (Outer bounds)
        ctx.strokeRect(b.x, b.y, b.width, b.height);

        // 2. Singles Sidelines (Alley width ~ 12.5% on each side)
        const alleyW = b.width * 0.125;
        const singlesLeft = b.x + alleyW;
        const singlesRight = b.x + b.width - alleyW;
        const singlesW = singlesRight - singlesLeft;

        ctx.beginPath();
        ctx.moveTo(singlesLeft, b.y);
        ctx.lineTo(singlesLeft, b.y + b.height);
        ctx.moveTo(singlesRight, b.y);
        ctx.lineTo(singlesRight, b.y + b.height);
        ctx.stroke();

        // 3. Service Lines (21ft from net, approx 27% from baseline)
        const serviceDistY = b.height * 0.27;
        const topServiceY = b.y + serviceDistY;
        const bottomServiceY = b.y + b.height - serviceDistY;

        ctx.beginPath();
        ctx.moveTo(singlesLeft, topServiceY);
        ctx.lineTo(singlesRight, topServiceY);
        ctx.moveTo(singlesLeft, bottomServiceY);
        ctx.lineTo(singlesRight, bottomServiceY);
        ctx.stroke();

        // 4. Center Service Line (between top and bottom service lines)
        const centerX = b.x + b.width / 2;
        ctx.beginPath();
        ctx.moveTo(centerX, topServiceY);
        ctx.lineTo(centerX, bottomServiceY);
        ctx.stroke();

        // 5. Center Marks (Center ticks on baselines)
        const tickH = 9;
        ctx.beginPath();
        ctx.moveTo(centerX, b.y);
        ctx.lineTo(centerX, b.y + tickH);
        ctx.moveTo(centerX, b.y + b.height);
        ctx.lineTo(centerX, b.y + b.height - tickH);
        ctx.stroke();

        // LTA Youth Stage Overlays
        if (this.courtFormat === 'red_stage') {
            // LTA Red 36ft mini-court lines in bright red dashed
            ctx.save();
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);

            // Mini court across the full court
            const redW = singlesW;
            const redH = b.height * 0.46;
            const redY = b.netY - redH / 2;
            ctx.strokeRect(singlesLeft, redY, redW, redH);

            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 10px Vazirmatn, sans-serif';
            ctx.fillText('زمین LTA Red (۳۶ فوت)', singlesLeft + 8, redY + 16);
            ctx.restore();
        } else if (this.courtFormat === 'orange_stage') {
            // LTA Orange 60ft court lines in bright orange dashed
            ctx.save();
            ctx.strokeStyle = '#f97316';
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 4]);

            const orangeY1 = b.y + b.height * 0.12;
            const orangeY2 = b.y + b.height * 0.88;
            ctx.beginPath();
            ctx.moveTo(singlesLeft, orangeY1);
            ctx.lineTo(singlesRight, orangeY1);
            ctx.moveTo(singlesLeft, orangeY2);
            ctx.lineTo(singlesRight, orangeY2);
            ctx.stroke();

            ctx.fillStyle = '#f97316';
            ctx.font = 'bold 10px Vazirmatn, sans-serif';
            ctx.fillText('خط بیس‌لاین LTA Orange (۶۰ فوت)', singlesLeft + 8, orangeY1 - 6);
            ctx.restore();
        }
    }

    renderNet(ctx, b) {
        const netExtend = 16;
        const netY = b.netY;
        const netLeft = b.x - netExtend;
        const netRight = b.x + b.width + netExtend;

        // Net posts
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(netLeft, netY, 4, 0, Math.PI * 2);
        ctx.arc(netRight, netY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Net cord (dark mesh + white band)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(netLeft, netY);
        ctx.lineTo(netRight, netY);
        ctx.stroke();

        // Net white top strap
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(netLeft, netY);
        ctx.lineTo(netRight, netY);
        ctx.stroke();

        // Center strap
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(b.x + b.width / 2 - 2.5, netY - 5, 5, 10);
    }

    renderSurfaceBadge(ctx) {
        const s = LTA_FRAMEWORK.surfaces[this.surface] || LTA_FRAMEWORK.surfaces.hard_blue;
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;

        const badgeW = 200;
        const badgeH = 26;
        const x = this.cssWidth - badgeW - 14;
        const y = 12;

        this.roundRect(ctx, x, y, badgeW, badgeH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = s.accentColor;
        ctx.beginPath();
        ctx.arc(x + 14, y + 13, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f8fafc';
        ctx.font = '11px Vazirmatn, sans-serif';
        ctx.textAlign = 'right';
        ctx.direction = 'rtl';
        ctx.fillText(s.nameFa.split('(')[0].trim(), x + badgeW - 10, y + 17);
        ctx.restore();
    }

    renderDrawings(ctx) {
        for (const draw of this.drawings) {
            this.renderSingleDrawing(ctx, draw);
        }
    }

    renderSingleDrawing(ctx, d, isPreview = false) {
        const from = this.relToPixel(d.from);
        const to = this.relToPixel(d.to);

        ctx.save();
        if (isPreview) {
            ctx.globalAlpha = 0.75;
        }

        if (d.type === 'ball_path') {
            // Neon tennis yellow trajectory
            const color = d.color || '#CCFF00';
            ctx.strokeStyle = color;
            ctx.lineWidth = 3.5;
            ctx.shadowColor = 'rgba(204, 255, 0, 0.5)';
            ctx.shadowBlur = 6;

            if (d.style === 'loop') {
                // Topspin arched trajectory
                const midX = (from.x + to.x) / 2 - 30;
                const midY = (from.y + to.y) / 2;
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.quadraticCurveTo(midX, midY, to.x, to.y);
                ctx.stroke();
                this.drawArrowhead(ctx, midX, midY, to.x, to.y, color, 12);
            } else {
                // Straight / flat path
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.stroke();
                this.drawArrowhead(ctx, from.x, from.y, to.x, to.y, color, 12);
            }

            // Optional label
            if (d.label) {
                this.drawPathLabel(ctx, (from.x + to.x) / 2, (from.y + to.y) / 2, d.label, '#CCFF00');
            }
        } else if (d.type === 'move_path') {
            // Player sprint/recovery path (dashed blue/cyan)
            const color = d.color || '#38bdf8';
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.setLineDash([6, 5]);

            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();

            ctx.setLineDash([]);
            this.drawArrowhead(ctx, from.x, from.y, to.x, to.y, color, 10);

            if (d.label) {
                this.drawPathLabel(ctx, (from.x + to.x) / 2, (from.y + to.y) / 2, d.label, '#38bdf8');
            }
        } else if (d.type === 'feed_path') {
            // Coach feed (dotted golden with small ball icon at start)
            const color = d.color || '#facc15';
            ctx.strokeStyle = color;
            ctx.lineWidth = 2.5;
            ctx.setLineDash([3, 4]);

            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();

            ctx.setLineDash([]);
            this.drawArrowhead(ctx, from.x, from.y, to.x, to.y, color, 9);

            // Ball at feed origin
            ctx.fillStyle = '#CCFF00';
            ctx.beginPath();
            ctx.arc(from.x, from.y, 4, 0, Math.PI * 2);
            ctx.fill();

            if (d.label) {
                this.drawPathLabel(ctx, (from.x + to.x) / 2, (from.y + to.y) / 2, d.label, '#facc15');
            }
        } else if (d.type === 'target_zone') {
            // Shaded target zone
            const minX = Math.min(from.x, to.x);
            const minY = Math.min(from.y, to.y);
            const zw = Math.abs(to.x - from.x);
            const zh = Math.abs(to.y - from.y);

            ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
            ctx.fillRect(minX, minY, zw, zh);

            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 4]);
            ctx.strokeRect(minX, minY, zw, zh);
            ctx.setLineDash([]);

            ctx.fillStyle = '#10b981';
            ctx.font = 'bold 11px Vazirmatn, sans-serif';
            ctx.fillText('منطقه هدف (Target)', minX + 6, minY + 15);
        }

        ctx.restore();
    }

    drawArrowhead(ctx, fromX, fromY, toX, toY, color, size = 10) {
        const angle = Math.atan2(toY - fromY, toX - fromX);
        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - size * Math.cos(angle - Math.PI / 6), toY - size * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(toX - size * Math.cos(angle + Math.PI / 6), toY - size * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    drawPathLabel(ctx, x, y, text, color) {
        ctx.save();
        ctx.font = 'bold 10px Vazirmatn, sans-serif';
        const txtMetrics = ctx.measureText(text);
        const pad = 4;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        this.roundRect(ctx, x - txtMetrics.width / 2 - pad, y - 9 - pad, txtMetrics.width + pad * 2, 18, 4);
        ctx.fill();

        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.fillText(text, x, y + 3);
        ctx.restore();
    }

    renderElements(ctx) {
        for (const el of this.elements) {
            const p = this.relToPixel(el);
            const isSelected = this.selectedElement && this.selectedElement.id === el.id;

            ctx.save();

            // Selected outline glow
            if (isSelected) {
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 22, 0, Math.PI * 2);
                ctx.stroke();
            }

            switch (el.type) {
                case 'player':
                    this.drawPlayer(ctx, p.x, p.y, el);
                    break;
                case 'coach':
                    this.drawCoach(ctx, p.x, p.y, el);
                    break;
                case 'ball':
                    this.drawBall(ctx, p.x, p.y);
                    break;
                case 'hopper':
                    this.drawHopper(ctx, p.x, p.y);
                    break;
                case 'cone':
                    this.drawCone(ctx, p.x, p.y, el.color);
                    break;
                case 'target':
                    this.drawTarget(ctx, p.x, p.y, el.points, el.color);
                    break;
                case 'ladder':
                    this.drawLadder(ctx, p.x, p.y);
                    break;
            }

            ctx.restore();
        }
    }

    drawPlayer(ctx, x, y, el) {
        // Player circle with jersey color
        const radius = 15;
        const color = el.color || '#2563EB';

        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Tennis racket icon representation
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + 13, y - 8, 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 10, y - 5);
        ctx.lineTo(x + 7, y - 2);
        ctx.stroke();

        // Player Label
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px Vazirmatn, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(el.label || 'P', x, y + 3.5);

        if (el.label && el.label.length > 2) {
            ctx.fillStyle = '#0f172a';
            const w = ctx.measureText(el.label).width + 8;
            this.roundRect(ctx, x - w / 2, y + 17, w, 16, 4);
            ctx.fill();

            ctx.fillStyle = '#f8fafc';
            ctx.font = '10px Vazirmatn, sans-serif';
            ctx.fillText(el.label, x, y + 29);
        }
    }

    drawCoach(ctx, x, y, el) {
        const radius = 17;
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;

        // Coach distinct Gold & Dark Navy look
        ctx.fillStyle = '#0F766E';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Coach icon C
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 12px Vazirmatn, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('مربی', x, y + 4.5);

        // Name Tag
        ctx.fillStyle = '#0f172a';
        const label = el.label || 'مربی LTA';
        const w = ctx.measureText(label).width + 10;
        this.roundRect(ctx, x - w / 2, y + 20, w, 16, 4);
        ctx.fill();

        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 10px Vazirmatn, sans-serif';
        ctx.fillText(label, x, y + 32);
    }

    drawBall(ctx, x, y) {
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 1;

        // Tennis ball yellow
        ctx.fillStyle = '#CCFF00';
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = 'transparent';
        // Tennis ball seam
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x - 2, y, 4, 0.4, 2.7);
        ctx.stroke();
    }

    drawHopper(ctx, x, y) {
        const w = 22;
        const h = 26;

        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 5;

        // Hopper basket body
        ctx.fillStyle = '#334155';
        this.roundRect(ctx, x - w / 2, y - h / 2, w, h, 3);
        ctx.fill();

        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Basket grid
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - w / 2, y);
        ctx.lineTo(x + w / 2, y);
        ctx.moveTo(x, y - h / 2);
        ctx.lineTo(x, y + h / 2);
        ctx.stroke();

        // Balls inside hopper
        ctx.fillStyle = '#CCFF00';
        ctx.beginPath();
        ctx.arc(x - 4, y - 5, 3.5, 0, Math.PI * 2);
        ctx.arc(x + 4, y - 5, 3.5, 0, Math.PI * 2);
        ctx.arc(x, y + 4, 3.5, 0, Math.PI * 2);
        ctx.fill();
    }

    drawCone(ctx, x, y, color = '#f97316') {
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 4;

        // Base ring
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x, y + 4, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cone triangle
        ctx.beginPath();
        ctx.moveTo(x - 7, y + 3);
        ctx.lineTo(x, y - 12);
        ctx.lineTo(x + 7, y + 3);
        ctx.closePath();
        ctx.fill();

        // White stripe
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 3.5, y - 3);
        ctx.lineTo(x + 3.5, y - 3);
        ctx.stroke();
    }

    drawTarget(ctx, x, y, points = 5, color = '#10b981') {
        // Target concentric rings
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 4;

        // Outer ring
        ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
        ctx.beginPath();
        ctx.arc(x, y, 22, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner bullseye
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 11, 0, Math.PI * 2);
        ctx.fill();

        // Points
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px Vazirmatn, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`+${points}`, x, y + 3.5);
    }

    drawLadder(ctx, x, y) {
        const ladderW = 20;
        const ladderH = 46;

        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;

        // Side rails
        ctx.beginPath();
        ctx.moveTo(x - ladderW / 2, y - ladderH / 2);
        ctx.lineTo(x - ladderW / 2, y + ladderH / 2);
        ctx.moveTo(x + ladderW / 2, y - ladderH / 2);
        ctx.lineTo(x + ladderW / 2, y + ladderH / 2);
        ctx.stroke();

        // Rungs
        const rungs = 5;
        const step = ladderH / (rungs + 1);
        ctx.lineWidth = 1.5;
        for (let i = 1; i <= rungs; i++) {
            const ry = y - ladderH / 2 + i * step;
            ctx.beginPath();
            ctx.moveTo(x - ladderW / 2, ry);
            ctx.lineTo(x + ladderW / 2, ry);
            ctx.stroke();
        }
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

    // Event Handling
    attachEvents() {
        const getPos = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        };

        const onDown = (e) => {
            const pos = getPos(e);
            const relPos = this.pixelToRel(pos);

            if (this.tool === 'select') {
                // Find clicked element
                const hit = this.findElementAt(pos);
                if (hit) {
                    this.selectedElement = hit;
                    this.isDragging = true;
                    const elPixel = this.relToPixel(hit);
                    this.dragOffset = {
                        x: pos.x - elPixel.x,
                        y: pos.y - elPixel.y
                    };
                    window.tennisAudio?.playHit();
                    this.render();
                } else {
                    this.selectedElement = null;
                    this.render();
                }
            } else if (this.tool === 'eraser') {
                // Erase hit item or drawing
                const hitEl = this.findElementAt(pos);
                if (hitEl) {
                    this.elements = this.elements.filter(el => el.id !== hitEl.id);
                    this.selectedElement = null;
                    this.saveState();
                    this.render();
                    window.tennisAudio?.playClick();
                    return;
                }
                const hitDrawIndex = this.findDrawingAt(pos);
                if (hitDrawIndex !== -1) {
                    this.drawings.splice(hitDrawIndex, 1);
                    this.saveState();
                    this.render();
                    window.tennisAudio?.playClick();
                }
            } else if (this.tool.startsWith('draw_')) {
                // Start tactical drawing
                this.isDrawing = true;
                this.drawStart = relPos;
                const type = this.tool.replace('draw_', '');
                this.currentDrawing = {
                    type: type === 'target_zone' ? 'target_zone' : `${type}_path`,
                    from: relPos,
                    to: relPos,
                    style: this.ballPathStyle
                };
            }
        };

        const onMove = (e) => {
            const pos = getPos(e);

            if (this.isDragging && this.selectedElement) {
                const targetPixel = {
                    x: pos.x - this.dragOffset.x,
                    y: pos.y - this.dragOffset.y
                };
                const rel = this.pixelToRel(targetPixel);
                this.selectedElement.x = rel.x;
                this.selectedElement.y = rel.y;
                this.render();
            } else if (this.isDrawing && this.currentDrawing) {
                this.currentDrawing.to = this.pixelToRel(pos);
                this.render();
            }
        };

        const onUp = (e) => {
            if (this.isDragging) {
                this.isDragging = false;
                this.saveState();
            } else if (this.isDrawing && this.currentDrawing) {
                // Verify drawing has minimal length
                const p1 = this.relToPixel(this.currentDrawing.from);
                const p2 = this.relToPixel(this.currentDrawing.to);
                const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

                if (dist > 15) {
                    this.drawings.push(this.currentDrawing);
                    this.saveState();
                    window.tennisAudio?.playHit();
                }
                this.isDrawing = false;
                this.currentDrawing = null;
                this.render();
            }
        };

        this.canvas.addEventListener('mousedown', onDown);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);

        this.canvas.addEventListener('touchstart', onDown, { passive: true });
        window.addEventListener('touchmove', onMove, { passive: true });
        window.addEventListener('touchend', onUp);

        // Keyboard delete key
        window.addEventListener('keydown', (e) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedElement) {
                // Avoid deleting when in text input
                if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
                this.elements = this.elements.filter(el => el.id !== this.selectedElement.id);
                this.selectedElement = null;
                this.saveState();
                this.render();
                window.tennisAudio?.playClick();
            }
        });
    }

    findElementAt(pos) {
        for (let i = this.elements.length - 1; i >= 0; i--) {
            const el = this.elements[i];
            const p = this.relToPixel(el);
            const dist = Math.hypot(pos.x - p.x, pos.y - p.y);
            const radius = el.type === 'coach' || el.type === 'target' ? 24 : 18;
            if (dist <= radius) {
                return el;
            }
        }
        return null;
    }

    findDrawingAt(pos) {
        for (let i = this.drawings.length - 1; i >= 0; i--) {
            const d = this.drawings[i];
            const from = this.relToPixel(d.from);
            const to = this.relToPixel(d.to);
            const dist = this.distToSegment(pos, from, to);
            if (dist < 12) {
                return i;
            }
        }
        return -1;
    }

    distToSegment(p, v, w) {
        const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
        if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
        let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
    }

    // Export high-res PNG
    exportPNG() {
        window.tennisAudio?.playWhistle();
        const dataUrl = this.canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `lta_court_diagram_${this.surface}_${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
    }
}

window.TennisCourtEngine = TennisCourtEngine;
