class TubesCursor {
    constructor(config = {}) {
        this.canvas = document.getElementById('tubes-canvas');
        if (!this.canvas) return;

        // Disable cursor on mobile and tablet devices (≤1024px)
        this.isMobileOrTablet = window.innerWidth <= 1024 || window.matchMedia("(pointer: coarse)").matches;

        if (this.isMobileOrTablet) {
            console.log("3D Cursor disabled on mobile/tablet device");
            this.canvas.style.display = 'none';
            // Add resize listener to re-enable if viewport becomes desktop size
            this.handleViewportChange = this.onViewportChange.bind(this);
            window.addEventListener('resize', this.handleViewportChange);
            return;
        }

        this.config = {
            tubeCount: 3,
            pointsCount: 20,
            colors: ["#00f2ff", "#7000ff", "#ff00c1"],
            ...config
        };

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.mouse = new THREE.Vector2(0, 0);
        this.targetMouse = new THREE.Vector2(0, 0);

        this.tubes = [];
        this.colors = [...this.config.colors];

        this.initTubes();
        this.initLights();

        this.handleMouseMove = this.onMouseMove.bind(this);
        this.handleMouseDown = this.onMouseDown.bind(this);
        this.handleResize = this.debounce(this.onResize.bind(this), 100);

        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mousedown', this.handleMouseDown);
        window.addEventListener('resize', this.handleResize);

        this.animate = this.animate.bind(this);
        this.animationId = requestAnimationFrame(this.animate);
    }

    initTubes() {
        for (let i = 0; i < this.config.tubeCount; i++) {
            const points = [];
            for (let j = 0; j < this.config.pointsCount; j++) {
                points.push(new THREE.Vector3(0, 0, 0));
            }

            const curve = new THREE.CatmullRomCurve3(points);
            const geometry = new THREE.TubeGeometry(curve, 32, 0.05 + (i * 0.02), 8, false);
            const material = new THREE.MeshPhongMaterial({
                color: new THREE.Color(this.colors[i]),
                transparent: true,
                opacity: 0.6 - (i * 0.15),
                emissive: new THREE.Color(this.colors[i]),
                emissiveIntensity: 0.5
            });

            const mesh = new THREE.Mesh(geometry, material);
            this.scene.add(mesh);

            this.tubes.push({
                mesh,
                points,
                lerp: 0.1 - (i * 0.02)
            });
        }
    }

    initLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 2);
        pointLight.position.set(2, 2, 5);
        this.scene.add(pointLight);
    }

    onMouseMove(e) {
        this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        const vector = new THREE.Vector3(this.targetMouse.x, this.targetMouse.y, 0.5);
        vector.unproject(this.camera);
        const dir = vector.sub(this.camera.position).normalize();
        const distance = -this.camera.position.z / dir.z;
        const pos = this.camera.position.clone().add(dir.multiplyScalar(distance));

        this.mouse.set(pos.x, pos.y);
    }

    onMouseDown() {
        this.regenerateColors();
    }

    regenerateColors() {
        this.colors = this.colors.map(() => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));
        this.tubes.forEach((tube, i) => {
            tube.mesh.material.color.set(this.colors[i]);
            tube.mesh.material.emissive.set(this.colors[i]);
        });
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onViewportChange() {
        const wasMobileOrTablet = this.isMobileOrTablet;
        this.isMobileOrTablet = window.innerWidth <= 1024 || window.matchMedia("(pointer: coarse)").matches;

        // If viewport changed from mobile to desktop, reload page to re-initialize cursor
        if (wasMobileOrTablet && !this.isMobileOrTablet) {
            window.location.reload();
        }
        // If viewport changed from desktop to mobile, hide canvas
        else if (!wasMobileOrTablet && this.isMobileOrTablet && this.canvas) {
            this.canvas.style.display = 'none';
        }
    }

    animate() {
        this.animationId = requestAnimationFrame(this.animate);

        this.tubes.forEach(tube => {
            const head = tube.points[0];
            head.x += (this.mouse.x - head.x) * tube.lerp;
            head.y += (this.mouse.y - head.y) * tube.lerp;

            for (let i = tube.points.length - 1; i > 0; i--) {
                tube.points[i].lerp(tube.points[i - 1], 0.85);
            }

            tube.mesh.geometry.dispose();
            const curve = new THREE.CatmullRomCurve3(tube.points);
            tube.mesh.geometry = new THREE.TubeGeometry(curve, 32, tube.mesh.geometry.parameters.radius, 8, false);
        });

        this.renderer.render(this.scene, this.camera);
    }

    debounce(func, wait) {
        let timeout;
        return function (...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    destroy() {
        // Clean up viewport change listener if it exists
        if (this.handleViewportChange) {
            window.removeEventListener('resize', this.handleViewportChange);
        }

        // Only clean up if cursor was initialized
        if (!this.isMobileOrTablet && this.handleMouseMove) {
            window.removeEventListener('mousemove', this.handleMouseMove);
            window.removeEventListener('mousedown', this.handleMouseDown);
            window.removeEventListener('resize', this.handleResize);
            cancelAnimationFrame(this.animationId);

            this.tubes.forEach(tube => {
                if (tube.mesh.geometry) tube.mesh.geometry.dispose();
                if (tube.mesh.material) tube.mesh.material.dispose();
                this.scene.remove(tube.mesh);
            });

            this.renderer.dispose();
        }
    }
}

// Initialize automatically
window.addEventListener('DOMContentLoaded', () => {
    if (window.THREE) {
        new TubesCursor();
    } else {
        console.error("Three.js not loaded");
    }
});
