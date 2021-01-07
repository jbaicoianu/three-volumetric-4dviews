importScripts('resource_manager.js', 'CODEC.js');

var firstChunks = false;
var keepChunksInCache = false;

let meshMap = {};
var meshesCache = [];
var maxCacheSize = 30;
var currentMesh = null;
var currentFrame = -1;
var resourceManager = new ResourceManagerXHR();

var isDecoding = false;
var isLoaded = false;

function Init3D() {
	var si = resourceManager._sequenceInfo;
  isLoaded = true;
  postMessage({type: 'loaded', sequenceInfo: si});
  Decode();
}
/* start decoding loop */
function Decode() {
  console.log('[4dviews-worker] start decoding');

	var dt = 0; //1000.0 / (resourceManager._sequenceInfo.FrameRate * 10);

	/* Download a first pack of chunks at sequence init, bigger than the next ones */
	if (firstChunks == false){
		if ((keepChunksInCache==false && chunks4D.length < resourceManager._sequenceInfo.NbFrames*2)){
			resourceManager._internalCacheSize = 20000000; //20 Mo
			resourceManager.getBunchOfChunks();
		
			console.log('[4dviews-worker] downloading first chunks');
		} else {}
		 
		firstChunks = true;
	}

	/* Decoding loop, 3*fps */
	decodeLoop = setInterval(function () {
		/* Do not decode if enough meshes in cache */
		if (meshesCache.length >= maxCacheSize)
			return;

		/* Decode chunk */
		var mesh4D = Module.DecodeChunk();
		
/*
    if (mesh4D) {
      console.log('decoded frame', mesh4D.frame, chunks4D.length);
    }
*/
		/* If a few chunks, download more */
		if (chunks4D.length < 1000 || (keepChunksInCache==true && chunks4D.length < resourceManager._sequenceInfo.NbFrames*2)){
      //console.log('download more chunks', chunks4D.length, resourceManager._sequenceInfo.NbFrames*2);
			resourceManager._internalCacheSize = 20000000; //8 Mo
			resourceManager.getBunchOfChunks();
		}

		/* If mesh is decoded, we stock it */
		if (mesh4D){
			meshesCache.push(mesh4D);
		}
	}, dt);
	
	isDecoding = true;
}

function emitMesh(mesharrays) {
  if (meshesCache.length == 0) {
    // FIXME - should be event or async function based
    setTimeout(() => emitMesh(mesharrays), 0);
  } else {
    //console.log('populate frame', mesharrays);
    let mesh4D = meshesCache.shift();
    meshMap[mesh4D.frame] = mesh4D;

    let obj = {
      frame: mesh4D.frame,
      verts: mesh4D.GetVertices(),
      faces:  mesh4D.GetFaces(),
      uvs: mesh4D.GetUVs(),
      texture: mesh4D.GetTexture(),
      numverts: mesh4D.nbVertices,
      numfaces: mesh4D.nbFaces,
    };
    //obj.normals = generateNormals(obj);
    obj.radius = 0;
    for (let i = 0; i < obj.verts.length; i++) {
      let len = obj.verts[i];
      if (len > obj.radius) obj.radius = len;
    }
//console.log('copy mesh to array', mesharrays, obj);
    mesharrays.frame = obj.frame;
    if (obj.verts.length > 0) {
      mesharrays.vertices.set(obj.verts);
      //mesharrays.normals.set(obj.normals);
      mesharrays.uvs.set(obj.uvs);
      mesharrays.indices.set(obj.faces);
      mesharrays.texture.set(obj.texture);
//console.log('copy', mesharrays.vertices);
    }
    mesharrays.radius = obj.radius;
    mesharrays.numverts = obj.numverts;
    mesharrays.numfaces = obj.numfaces;


    postMessage({
      type: 'frame',
      frame: obj.frame,
      framedata: mesharrays,
    }, [mesharrays.buffer]);

    mesh4D.delete();
  }
}

function freeMesh(mesh4D) {
  if (meshMap[mesh4D.frame]) {
    meshMap[mesh4D.frame].delete();
    delete meshMap[mesh4D.frame];
  }
}

// Wait until WASM module is loaded, then finish initialization
let initTimer = setInterval(() => {
  if (Module.LinearEBD4DVDecoder) {
    clearInterval(initTimer);
    Module.Create();
    postMessage({type: 'initialized'});
  }
}, 10);

addEventListener('message', ev => {
  if (ev.data.type == 'load') {
    File4ds = ev.data.src;
    resourceManager.Open(Init3D);
  } else if (ev.data.type == 'requestframe') {
    emitMesh(ev.data.framedata);
  }
});

