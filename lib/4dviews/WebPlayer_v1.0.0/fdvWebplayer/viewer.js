/* CONSTRUCTORS */
var canvas = document.createElement('canvas');
var container = document.getElementById('container4D');

var renderer;// = new THREE.WebGLRenderer();
var scene;// = new THREE.Scene();
var camera;// = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
var controls;// = new THREE.TrackballControls(camera);

var geometry;// = new THREE.BufferGeometry();
var mesh;
var texture;
var material;
var textureSize;
    
var initialized = false;

var stats;

// var backgroundColor ;

/* EVENT LISTENER */
/* RESET CAMERA: Double click */
canvas.addEventListener('dblclick', function(){ 
	resetCamera();
});
/* PAUSE AUTOROTATE: Mousedown & up */
canvas.addEventListener('mousedown', function(){ 
	if(autoRotate == true && isPlaying == true)
		autoRotatePause = true;
});
canvas.addEventListener('mouseup', function(){ 
	if(autoRotate == true && isPlaying == true)
		autoRotatePause = false;
});

/* RESET CAMERA: Double tap */
var timeout;
var lastTap = 0;
canvas.addEventListener('touchend', function(event) {
	
	console.log('Tapping');
    var currentTime = new Date().getTime();
    var tapLength = currentTime - lastTap;
    clearTimeout(timeout);
    if (tapLength < 500 && tapLength > 0) {
        console.log('Double Tap');
		resetCamera();
        event.preventDefault();
    } else {
        console.log('Single Tap');
        timeout = setTimeout(function() {
            clearTimeout(timeout);
        }, 500);
    }
    lastTap = currentTime;
});


/* Get DOM element container where the player will be displayed */
function createViewer()
{
	if(renderer != null)
		return;
	
    // console.log("INIT RENDERER");
	
    /* Render Engine initialization */
    if (WEBGL.isWebGL2Available()) {
       
        var context;
		
		canvas.setAttribute("id", "canvas4D");
        //if (isWebGL2Available())
            context = canvas.getContext('webgl2');
        //else
            //context = canvas.getContext('webgl');
        renderer = new THREE.WebGLRenderer({ canvas: canvas, context: context });
    }
    else
        renderer = new THREE.WebGLRenderer();

    if(screen.orientation = "landscape-primary"){
		renderer.setSize(screen.width*window.devicePixelRatio, screen.height*window.devicePixelRatio);
	} else{
		renderer.setSize(container.offsetWidth, container.offsetHeight);
	}
	
	renderer.shadowMapEnabled = true;
    container.appendChild(renderer.domElement);

    // backgroundColor = new THREE.Color(0x333333);
}

function init(nbFrames, nbBlocs, framerate, maxVertices, maxTriangles, textureEncoding, textureSizeX, textureSizeY)
{
    if (!initialized)
	{
		/* Scene initialization */
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 0.1, 100);
		geometry = new THREE.BufferGeometry();

		/* Adding lighting */ 
		var light = new THREE.DirectionalLight(0x777788);
		light.position.set(0, 1, 1).normalize();
		scene.add(light);
		
		var light2 = new THREE.DirectionalLight(0x666655);
		light2.position.set(0, -1, -1).normalize();
		scene.add(light2);

		/* Adding camera */
		camera.position.set(0, 1, 3);
		controls = new THREE.OrbitControls(camera, container);
		// camera.lookAt(new THREE.Vector3(0, 2, 0));
		controls.target = new THREE.Vector3(0, 1, 0);
		scene.add(camera);
	}

    /* Mesh initialization */
    /* creating geometry */
    var vertices = new Float32Array(maxVertices * 3);
    var uvs = new Float32Array(maxVertices * 2);
    var indices = new Uint32Array(maxTriangles * 3);

    // itemSize = 3 because there are 3 values (components) per vertex
    geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.addAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    //geometry.attributes.position.needsUpdate = true;
    geometry.dynamic = true;

    //var material = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x555555, shininess: 30 });

    if (textureEncoding == 164) {
        texture = new THREE.CompressedTexture(null, textureSizeX, textureSizeY,
            THREE.RGBA_ASTC_8x8_Format , THREE.UnsignedByteType, THREE.UVMapping,
            THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping,
            THREE.LinearFilter, THREE.LinearFilter);
    } else {
        texture = new THREE.CompressedTexture(null, textureSizeX, textureSizeY,
            THREE.RGB_S3TC_DXT1_Format, THREE.UnsignedByteType, THREE.UVMapping,
            THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping,
            THREE.LinearFilter, THREE.LinearFilter);
    }
    material = new THREE.MeshBasicMaterial({ map: texture })

	/* Adding the 3D model */
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    textureSize = textureSizeX;

    /* display debug stats info */
    // stats = new Stats();
    // stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    // document.body.appendChild(stats.dom);

    /* 3D viewer floor grid */
    var helper = new THREE.PolarGridHelper(4, 8, 8, 48, new THREE.Color(0xaaaaaa), new THREE.Color(0xcccccc));
	
    scene.add(helper);


    initialized = true;
}

function updateMesh(Verts, Faces, UVs, Texture, nbVerts, nbFaces)
{
    // stats.begin();

	
    /* update the buffers */
    geometry.attributes.position.array = Verts;
    geometry.attributes.uv.array = UVs
    mesh.geometry.index.array = Faces;

    /* flags */
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.uv.needsUpdate = true;
    mesh.geometry.index.needsUpdate = true;

    /* to use only part of the buffer */
    geometry.setDrawRange(0, nbFaces * 3);
    mesh.rotation.x = -1.57;

    /* update the texture */
    var mipmap = { "data": Texture, "width": textureSize, "height": textureSize };
    var mipmaps = [];
    mipmaps.push(mipmap);

    texture.mipmaps = mipmaps;
    texture.needsUpdate = true
    material.needsUpdate = true;

    // stats.end();

}

function resetCamera(){
	controls.reset();
	controls.target = new THREE.Vector3(0, 1, 0);
	camera.position.set(0, 1, 3);
}

function animate()
{
	//requestAnimationFrame( animate );
    controls.update();

    // scene.background = backgroundColor;


	// camera.lookAt(scene.position); //0,0,0
    renderer.render(scene, camera);
}

/* Set Autorotate to the camera */
function autoRotateCamera() {
    if (autoRotate == true) {
        if (autoRotatePause == false) {
            var speed = Date.now() * 0.00025;


            camera.position.x = Math.cos(speed) * 5;
            camera.position.z = Math.sin(speed) * 5;
        }
    }
}