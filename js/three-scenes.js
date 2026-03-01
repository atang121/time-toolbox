/**
 * Three.js 场景管理器
 * 封装了场景初始化、销毁和各页面特有的 3D 效果
 */

class SceneManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        this.camera.position.z = 5;
        this.objects = [];
        this.frameId = null;

        this.initLights();
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    initLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xd4af37, 1);
        pointLight.position.set(5, 5, 5);
        this.scene.add(pointLight);

        const blueLight = new THREE.PointLight(0x3a86ff, 1);
        blueLight.position.set(-5, -5, 5);
        this.scene.add(blueLight);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        this.frameId = requestAnimationFrame(this.animate.bind(this));
        
        // 缓慢自动旋转
        this.objects.forEach(obj => {
            obj.rotation.y += 0.005;
            obj.rotation.x += 0.002;
        });

        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
        }
        window.removeEventListener('resize', this.onWindowResize);
        if (this.renderer) {
            this.renderer.dispose();
            this.container.removeChild(this.renderer.domElement);
        }
    }

    // --- 页面特定场景创建 ---

    createHomeScene() {
        const geometry = new THREE.TorusKnotGeometry(1.5, 0.4, 100, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            metalness: 0.7,
            roughness: 0.2,
            wireframe: true
        });
        const knot = new THREE.Mesh(geometry, material);
        this.scene.add(knot);
        this.objects.push(knot);

        // 添加粒子背景
        const particlesGeometry = new THREE.BufferGeometry();
        const count = 2000;
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 20;
        }
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particlesMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.02, transparent: true, opacity: 0.5 });
        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(particles);
        this.objects.push(particles);
    }

    createDaysDiffScene() {
        const geo1 = new THREE.SphereGeometry(1, 32, 32);
        const mat1 = new THREE.MeshStandardMaterial({ color: 0x3a86ff, emissive: 0x112244 });
        const orb1 = new THREE.Mesh(geo1, mat1);
        orb1.position.x = -2;
        this.scene.add(orb1);
        
        const geo2 = new THREE.SphereGeometry(1, 32, 32);
        const mat2 = new THREE.MeshStandardMaterial({ color: 0xd4af37, emissive: 0x443311 });
        const orb2 = new THREE.Mesh(geo2, mat2);
        orb2.position.x = 2;
        this.scene.add(orb2);

        this.objects.push(orb1, orb2);
    }

    createDateCalcScene() {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-4, -2, 0),
            new THREE.Vector3(-2, 2, 0),
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(2, -2, 0),
            new THREE.Vector3(4, 2, 0),
        ]);
        const geometry = new THREE.TubeGeometry(curve, 64, 0.1, 8, false);
        const material = new THREE.MeshStandardMaterial({ color: 0x00ffcc, emissive: 0x003322 });
        const tube = new THREE.Mesh(geometry, material);
        this.scene.add(tube);
        this.objects.push(tube);
    }

    createAgeCalcScene() {
        const group = new THREE.Group();
        for (let i = 0; i < 50; i++) {
            const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
            const material = new THREE.MeshStandardMaterial({ color: 0xffffff * Math.random() });
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 2
            );
            group.add(cube);
        }
        this.scene.add(group);
        this.objects.push(group);
    }

    createRmbScene() {
        const geometry = new THREE.IcosahedronGeometry(2, 1);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xffd700, 
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        const core = new THREE.Mesh(geometry, material);
        this.scene.add(core);
        this.objects.push(core);

        // 浮动的小方块代表硬币
        for(let i=0; i<20; i++) {
            const coinGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 32);
            const coinMat = new THREE.MeshStandardMaterial({ color: 0xaa8412 });
            const coin = new THREE.Mesh(coinGeo, coinMat);
            coin.position.set(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 5
            );
            coin.rotation.x = Math.PI / 2;
            this.scene.add(coin);
            this.objects.push(coin);
        }
    }

    createUrlScene() {
        const group = new THREE.Group();
        
        const ringGeometry = new THREE.TorusGeometry(2, 0.1, 16, 100);
        const ringMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x3a86ff, 
            emissive: 0x112244 
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        group.add(ring);

        const innerRing = new THREE.TorusGeometry(1.5, 0.08, 16, 80);
        const innerRingMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xd4af37, 
            emissive: 0x443311 
        });
        const innerRingMesh = new THREE.Mesh(innerRing, innerRingMaterial);
        innerRingMesh.rotation.x = Math.PI / 4;
        group.add(innerRingMesh);

        const coreGeometry = new THREE.OctahedronGeometry(0.8, 0);
        const coreMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x00ffcc, 
            wireframe: true,
            transparent: true,
            opacity: 0.6
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        group.add(core);

        for (let i = 0; i < 30; i++) {
            const dotGeometry = new THREE.SphereGeometry(0.05, 8, 8);
            const dotMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xffffff,
                emissive: 0x444444
            });
            const dot = new THREE.Mesh(dotGeometry, dotMaterial);
            const angle = (i / 30) * Math.PI * 2;
            const radius = 2.5 + Math.random() * 0.5;
            dot.position.set(
                Math.cos(angle) * radius,
                (Math.random() - 0.5) * 2,
                Math.sin(angle) * radius
            );
            group.add(dot);
        }

        this.scene.add(group);
        this.objects.push(group);
    }

    createShortUrlScene() {
        const group = new THREE.Group();
        
        // 长条形状代表长链接
        const longBarGeo = new THREE.BoxGeometry(4, 0.3, 0.3);
        const longBarMat = new THREE.MeshStandardMaterial({ 
            color: 0x3a86ff, 
            emissive: 0x112244 
        });
        const longBar = new THREE.Mesh(longBarGeo, longBarMat);
        longBar.position.y = 1;
        group.add(longBar);

        // 短条形状代表短链接
        const shortBarGeo = new THREE.BoxGeometry(1.5, 0.4, 0.4);
        const shortBarMat = new THREE.MeshStandardMaterial({ 
            color: 0xd4af37, 
            emissive: 0x443311 
        });
        const shortBar = new THREE.Mesh(shortBarGeo, shortBarMat);
        shortBar.position.y = -1;
        group.add(shortBar);

        // 箭头连接
        const arrowGeo = new THREE.ConeGeometry(0.3, 0.8, 8);
        const arrowMat = new THREE.MeshStandardMaterial({ color: 0x00ffcc });
        const arrow = new THREE.Mesh(arrowGeo, arrowMat);
        arrow.rotation.z = Math.PI;
        group.add(arrow);

        // 粒子效果
        for (let i = 0; i < 40; i++) {
            const dotGeo = new THREE.SphereGeometry(0.05, 8, 8);
            const dotMat = new THREE.MeshStandardMaterial({ 
                color: 0xffffff,
                emissive: 0x333333
            });
            const dot = new THREE.Mesh(dotGeo, dotMat);
            dot.position.set(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 3
            );
            group.add(dot);
        }

        this.scene.add(group);
        this.objects.push(group);
    }

    createQrcodeScene() {
        const group = new THREE.Group();
        
        // 创建二维码格子效果
        const gridSize = 5;
        const cellSize = 0.3;
        const gap = 0.35;
        
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                if (Math.random() > 0.4) {
                    const cellGeo = new THREE.BoxGeometry(cellSize, cellSize, cellSize);
                    const cellMat = new THREE.MeshStandardMaterial({ 
                        color: Math.random() > 0.5 ? 0xd4af37 : 0x1a1a2e,
                        emissive: 0x111111
                    });
                    const cell = new THREE.Mesh(cellGeo, cellMat);
                    cell.position.set(
                        (x - gridSize / 2) * gap,
                        (y - gridSize / 2) * gap,
                        0
                    );
                    group.add(cell);
                }
            }
        }

        // 外框
        const frameGeo = new THREE.TorusGeometry(1.8, 0.08, 8, 4);
        const frameMat = new THREE.MeshStandardMaterial({ 
            color: 0x3a86ff,
            emissive: 0x112244
        });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.rotation.z = Math.PI / 4;
        group.add(frame);

        // 扫描线效果
        const lineGeo = new THREE.BoxGeometry(2, 0.05, 0.05);
        const lineMat = new THREE.MeshStandardMaterial({ 
            color: 0x00ffcc,
            emissive: 0x00ffcc,
            transparent: true,
            opacity: 0.8
        });
        const scanLine = new THREE.Mesh(lineGeo, lineMat);
        scanLine.position.z = 0.2;
        group.add(scanLine);

        this.scene.add(group);
        this.objects.push(group);
    }

    createImageConvertScene() {
        const group = new THREE.Group();
        
        // 图片框架
        const frame1Geo = new THREE.BoxGeometry(1.5, 2, 0.1);
        const frame1Mat = new THREE.MeshStandardMaterial({ color: 0x3a86ff, emissive: 0x112244 });
        const frame1 = new THREE.Mesh(frame1Geo, frame1Mat);
        frame1.position.x = -1.5;
        group.add(frame1);

        const frame2Geo = new THREE.BoxGeometry(1.5, 2, 0.1);
        const frame2Mat = new THREE.MeshStandardMaterial({ color: 0xd4af37, emissive: 0x443311 });
        const frame2 = new THREE.Mesh(frame2Geo, frame2Mat);
        frame2.position.x = 1.5;
        group.add(frame2);

        // 转换箭头
        const arrowGeo = new THREE.ConeGeometry(0.3, 0.6, 8);
        const arrowMat = new THREE.MeshStandardMaterial({ color: 0x00ffcc, emissive: 0x003322 });
        const arrow = new THREE.Mesh(arrowGeo, arrowMat);
        arrow.rotation.z = -Math.PI / 2;
        group.add(arrow);

        // 粒子
        for (let i = 0; i < 30; i++) {
            const dotGeo = new THREE.SphereGeometry(0.05, 8, 8);
            const dotMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x333333 });
            const dot = new THREE.Mesh(dotGeo, dotMat);
            dot.position.set(
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 2
            );
            group.add(dot);
        }

        this.scene.add(group);
        this.objects.push(group);
    }

    createBatchRenameScene() {
        const group = new THREE.Group();
        
        // 文件图标堆叠
        for (let i = 0; i < 5; i++) {
            const fileGeo = new THREE.BoxGeometry(1.2, 1.5, 0.08);
            const fileMat = new THREE.MeshStandardMaterial({ 
                color: 0xd4af37,
                emissive: 0x222211,
                transparent: true,
                opacity: 0.8 - i * 0.1
            });
            const file = new THREE.Mesh(fileGeo, fileMat);
            file.position.set(i * 0.15, -i * 0.1, -i * 0.2);
            file.rotation.z = (Math.random() - 0.5) * 0.1;
            group.add(file);
        }

        // 编辑笔形状
        const penGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.5, 8);
        const penMat = new THREE.MeshStandardMaterial({ color: 0x3a86ff, emissive: 0x112244 });
        const pen = new THREE.Mesh(penGeo, penMat);
        pen.position.set(1.5, 0.5, 0.5);
        pen.rotation.z = Math.PI / 4;
        group.add(pen);

        const tipGeo = new THREE.ConeGeometry(0.08, 0.3, 8);
        const tipMat = new THREE.MeshStandardMaterial({ color: 0x00ffcc });
        const tip = new THREE.Mesh(tipGeo, tipMat);
        tip.position.set(1.1, 0.1, 0.5);
        tip.rotation.z = Math.PI / 4 + Math.PI;
        group.add(tip);

        this.scene.add(group);
        this.objects.push(group);
    }
}
