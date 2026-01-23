document.addEventListener('DOMContentLoaded', () => {
    const scene = document.getElementById('scene-3d');
    const sections = document.querySelectorAll('.scene-section');
    let currentIdx = 0;
    let isTransitioning = false;

    // Camera Smoothing State
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;
    let flightStaggerX = 0;
    let flightStaggerY = 0;
    const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

    // HUD Elements
    const sysTime = document.getElementById('sys-time');
    const sysLatency = document.getElementById('sys-latency');
    const depthIndicator = document.getElementById('depth-indicator');
    const hudLogs = document.getElementById('hud-logs');
    const progressFill = document.querySelector('.hud-progress-fill');
    const statusFill = document.querySelector('.node-fill');

    // Live Data Updates
    setInterval(() => {
        const now = new Date();
        if (sysTime) sysTime.innerText = now.toTimeString().split(' ')[0];
        if (sysLatency) sysLatency.innerText = Math.floor(Math.random() * 15 + 10) + 'ms';
        if (statusFill) statusFill.style.width = `${Math.floor(Math.random() * 30 + 50)}%`;
    }, 1000);

    const logs = [
        "KERNEL_BOOT: SUCCESS",
        "SYNCING_NODE_04...",
        "ENCRYPTING_BUFFER...",
        "DECODING_PHASE_2...",
        "RELIABILITY_CHECK: 100%",
        "IO_LATENCY_STABLE",
        "UPTIME_VERIFIED",
        "CORE_TEMP_OPTIMAL"
    ];

    const initBitstream = () => {
        const vContainer = document.querySelector('.layer-bitstream');
        const hContainer = document.querySelector('.layer-bitstream-h');
        const chars = '01ABCDEF';

        // Vertical columns
        if (vContainer) {
            for (let i = 0; i < 20; i++) {
                const col = document.createElement('div');
                col.className = 'bitstream-column';
                col.style.left = `${Math.random() * 100}%`;
                col.style.animationDuration = `${5 + Math.random() * 10}s`;
                col.style.animationDelay = `${-Math.random() * 20}s`;
                col.style.opacity = 0.05 + Math.random() * 0.15;

                let characters = '';
                for (let j = 0; j < 40; j++) characters += chars[Math.floor(Math.random() * chars.length)] + '\n';
                col.innerText = characters;
                vContainer.appendChild(col);
            }
        }

        // Horizontal rows
        if (hContainer) {
            for (let i = 0; i < 15; i++) {
                const row = document.createElement('div');
                row.className = 'bitstream-row';
                row.style.top = `${Math.random() * 100}%`;
                row.style.animationDuration = `${8 + Math.random() * 15}s`;
                row.style.animationDelay = `${-Math.random() * 20}s`;
                row.style.opacity = 0.03 + Math.random() * 0.1;

                let characters = '';
                for (let j = 0; j < 50; j++) characters += chars[Math.floor(Math.random() * chars.length)];
                row.innerText = characters;
                hContainer.appendChild(row);
            }
        }
    };
    initBitstream();

    // Mini-graph Animation Logic
    const initMiniGraphs = () => {
        const graphs = document.querySelectorAll('.rack-mini-graph');
        graphs.forEach(graph => {
            for (let i = 0; i < 15; i++) {
                const bar = document.createElement('div');
                bar.className = 'graph-bar';
                bar.style.height = `${20 + Math.random() * 60}%`;
                graph.appendChild(bar);
            }
        });

        setInterval(() => {
            document.querySelectorAll('.graph-bar').forEach(bar => {
                if (Math.random() > 0.8) {
                    const h = parseFloat(bar.style.height);
                    const delta = (Math.random() - 0.5) * 20;
                    bar.style.height = `${Math.min(100, Math.max(10, h + delta))}%`;
                }
            });
        }, 100);
    };
    initMiniGraphs();

    setInterval(() => {
        if (hudLogs) {
            const log = logs[Math.floor(Math.random() * logs.length)];
            hudLogs.innerHTML = `<span class="text-accent">></span> ${log}`;
        }
    }, 2500);

    // Simplified Parallax tracking
    let mouseXPercent = 0.5;
    let mouseYPercent = 0.5;

    document.addEventListener('mousemove', (e) => {
        // Calculate mouse position as percentage for parallax (used for perspective tilt)
        mouseXPercent = e.clientX / window.innerWidth;
        mouseYPercent = e.clientY / window.innerHeight;

        // Apply parallax
        applyParallax();
    });

    // Parallax function - Optimized
    function applyParallax() {
        const parallaxElements = document.querySelectorAll('.section-content');

        parallaxElements.forEach((element) => {
            const xOffset = (mouseXPercent - 0.5) * 10;
            const yOffset = (mouseYPercent - 0.5) * 10;

            element.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
        });
    }

    // Date/Time Display
    function updateDateTime() {
        const now = new Date();
        const options = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        const dateTimeString = now.toLocaleString('en-US', options);
        const dateTimeDisplay = document.getElementById('datetime-display');
        if (dateTimeDisplay) {
            dateTimeDisplay.textContent = dateTimeString;
        }
    }

    // Update date/time every second
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Theme Toggle with Ripple Effect
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', (e) => {
            // Create ripple element
            const ripple = document.createElement('div');
            ripple.className = 'theme-ripple';

            // Get button position
            const rect = themeToggle.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;

            // Set ripple position
            ripple.style.setProperty('--ripple-x', `${x}px`);
            ripple.style.setProperty('--ripple-y', `${y}px`);

            document.body.appendChild(ripple);

            // Trigger animation
            setTimeout(() => ripple.classList.add('active'), 10);

            // Toggle theme
            document.body.classList.toggle('light-theme');

            // Save preference
            const isLight = document.body.classList.contains('light-theme');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');

            // Remove ripple after animation
            setTimeout(() => ripple.remove(), 1200);
        });
    }

    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }



    // Scroll-based Section Reveals
    const revealSections = () => {
        const sections = document.querySelectorAll('.scene-section');
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight * 0.75 && rect.bottom > 0;

            if (isVisible) {
                section.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealSections);
    revealSections(); // Initial check

    // Animation Loop for Smoothing (simplified for continuous scroll)
    const animate = () => {
        const time = Date.now() * 0.001;
        flightStaggerX = Math.sin(time * 0.5) * 0.02;
        flightStaggerY = Math.cos(time * 0.3) * 0.02;

        currentRotX = lerp(currentRotX, targetRotX + flightStaggerX, 0.08);
        currentRotY = lerp(currentRotY, targetRotY + flightStaggerY, 0.08);

        const pContainer = document.querySelector('.perspective-container');
        if (pContainer) {
            const tiltX = 50 + currentRotX * 4;
            const tiltY = 50 + currentRotY * 4;
            pContainer.style.perspectiveOrigin = `${tiltX}% ${tiltY}%`;
        }

        requestAnimationFrame(animate);
    };
    animate();

    // Mouse Parallax Logic
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        targetRotX = (x / window.innerWidth) * 2 - 1;
        targetRotY = (y / window.innerHeight) * 2 - 1;

        // Multi-layered Parallax for Floating Elements
        const floatingElements = document.querySelectorAll('.scene-section.active .float-node, .scene-section.active .server-rack');
        floatingElements.forEach((node, i) => {
            const isRack = node.classList.contains('server-rack');
            const depthFactor = isRack ? 1.2 : 1.8;
            const moveX = targetRotX * (i % 2 === 0 ? 30 : -30) * depthFactor;
            const moveY = targetRotY * (i % 3 === 0 ? 30 : -30) * depthFactor;

            node.style.transform = `translateZ(${150 + i * 40}px) translateX(${moveX}px) translateY(${moveY}px)`;
        });
    });






});


