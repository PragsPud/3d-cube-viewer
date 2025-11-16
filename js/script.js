const faces = ['front', 'back', 'top', 'bottom', 'right', 'left'];
const uploadedImages = {};
let scene, camera, renderer, cube, controls;

// Handle file uploads
faces.forEach(face => {
    const input = document.getElementById(face);
    const preview = document.getElementById(`preview-${face}`);
    
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                uploadedImages[face] = event.target.result;
                preview.src = event.target.result;
                preview.classList.add('show');
                checkAllImagesUploaded();
            };
            reader.readAsDataURL(file);
        }
    });
});

function checkAllImagesUploaded() {
    const allUploaded = faces.every(face => uploadedImages[face]);
    document.getElementById('generateBtn').disabled = !allUploaded;
}

// Generate 3D cube
document.getElementById('generateBtn').addEventListener('click', () => {
    document.querySelector('.upload-section').style.display = 'none';
    document.getElementById('viewerSection').classList.add('show');
    init3DScene();
});

// Reset button
document.getElementById('resetBtn').addEventListener('click', () => {
    location.reload();
});

function init3DScene() {
    const container = document.getElementById('canvas-container');
    
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.z = 5;
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    // Create materials for each face
    const materials = [
        createMaterial(uploadedImages.right),  // Right
        createMaterial(uploadedImages.left),   // Left
        createMaterial(uploadedImages.top),    // Top
        createMaterial(uploadedImages.bottom), // Bottom
        createMaterial(uploadedImages.front),  // Front
        createMaterial(uploadedImages.back)    // Back
    ];
    
    // Create cube
    const geometry = new THREE.BoxGeometry(3, 3, 3);
    cube = new THREE.Mesh(geometry, materials);
    scene.add(cube);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    // Add orbit controls
    addOrbitControls();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Start animation loop
    animate();
}

function createMaterial(imageDataUrl) {
    const texture = new THREE.TextureLoader().load(imageDataUrl);
    return new THREE.MeshLambertMaterial({ map: texture });
}

function addOrbitControls() {
    // Manual orbit controls implementation
    let isDragging = false;
    let isPanning = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    renderer.domElement.addEventListener('mousedown', (e) => {
        if (e.button === 0) isDragging = true;
        if (e.button === 2) isPanning = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    renderer.domElement.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;
            
            cube.rotation.y += deltaX * 0.01;
            cube.rotation.x += deltaY * 0.01;
        }
        
        if (isPanning) {
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;
            
            camera.position.x -= deltaX * 0.01;
            camera.position.y += deltaY * 0.01;
        }
        
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    renderer.domElement.addEventListener('mouseup', () => {
        isDragging = false;
        isPanning = false;
    });
    
    renderer.domElement.addEventListener('wheel', (e) => {
        e.preventDefault();
        camera.position.z += e.deltaY * 0.01;
        camera.position.z = Math.max(2, Math.min(10, camera.position.z));
    });
    
    renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Touch controls for mobile
    let touchStart = null;
    
    renderer.domElement.addEventListener('touchstart', (e) => {
        touchStart = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    });
    
    renderer.domElement.addEventListener('touchmove', (e) => {
        if (touchStart) {
            const deltaX = e.touches[0].clientX - touchStart.x;
            const deltaY = e.touches[0].clientY - touchStart.y;
            
            cube.rotation.y += deltaX * 0.01;
            cube.rotation.x += deltaY * 0.01;
            
            touchStart = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        }
    });
    
    renderer.domElement.addEventListener('touchend', () => {
        touchStart = null;
    });
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
