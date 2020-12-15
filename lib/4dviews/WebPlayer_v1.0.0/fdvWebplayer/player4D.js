/* CONSTRUCTORS */ //test
var keepChunksOption = document.getElementById('cacheOptions4D');


var waiterText = document.getElementById('logo4D_text');

/* OPTIONS */
var enableAudio = true;
var autoRotate = true;
var keepChunksInCache = false;


/* STATUS VARIABLES */ 
var autoRotatePause = false;
var audioListener = null;// = new THREE.AudioListener();
var audioSound = null;// = new THREE.Audio( listener );
var audioLoader = null;// = new THREE.AudioLoader();
var isPlaying = false;
var isDecoding = false;
var isAudioplaying = false;
var isAudiomuted = true;
var isAudioloaded = false;
var wasPlaying = true;

var firstChunks = false;

var meshesCache = [];
var maxCacheSize = 20;
var currentMesh = null;
var currentFrame = -1;
var resourceManager = new ResourceManagerXHR();

var playback;
var decodeLoop;
var renderLoop;

var waiter;
var waiterReady = false;

// for cross browser compatibility
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
var gainNode;
var audioStartOffset = 0;
var audioStartTime = 0;
var audioPassedTime = 0;
var audioTrack;

/* Initialize all the scene, called as callback at the end of the resource manager initialization */
function Init3D()
{
    var si = resourceManager._sequenceInfo;
    init(si.NbFrames, si.NbBlocs, si.Framerate, si.MaxVertices, si.MaxTriangles, si.TextureEncoding, si.TextureSizeX, si.TextureSizeY);

	/* First decode/download loop */
    Decode();
	

	/* Start playing when enough meshes in cache */
    waiter = setInterval(function () {
        if (meshesCache.length >= maxCacheSize){
			
			/* hide the waiter splashscreen and play the sequence */
			var waiterSplashscreen = document.getElementById('waiter4D');
			waiterSplashscreen.style.display = "none";
			initPlaying();

		}else {
			ProgressWaiter();
		}
    }, 0.1);
}



/* create emscripten module and initialize the viewer */
function CreatePlayer()
{
	document.getElementById("pause4D").setAttribute("src","js/fdvWebplayer/img/pause_w.png");
	document.getElementById("volume4D_icon").setAttribute("src","js/fdvWebplayer/img/med_sound_w.png");
	document.getElementById("volume4D_level").setAttribute("max",1);
	document.getElementById("volume4D_level").setAttribute("value",0.5);
	document.getElementById("volume4D_range").style.width = ((0.5*80)-8)+"px";
	
	Audio4ds = file4dsAudio;
	
	createViewer();

    if (renderer.extensions.get('WEBGL_compressed_texture_astc')){
		File4ds = file4dsMobile;
	}
    else
        File4ds = file4dsDesktop;

    Module.Create();
	
    resourceManager.Open(Init3D);
}

/* stop renderer and destroy the emscripten module */
function DestroyPlayer(callback) {
		
    clearInterval(playback);
    clearInterval(decodeLoop);
	clearInterval(renderLoop);
   	
    if (audioSound) {
        if (audioTrack)
            audioTrack.stop();

        audioSound = null;
        audioListener = null;
        audioLoader = null;

        audioStartTime = 0;
        audioStartOffset = 0;
        audioPassedTime = 0;
    }

	resourceManager.reinitResources();
	
	isPlaying = false;
    isDecoding = false;
    isAudioplaying = false;
	isAudioloaded = false;
    firstChunks = false;

    currentFrame = 0;
    currentMesh = null;

    chunks4D.forEach(element => {
        element.delete();
    });
    meshesCache.forEach(element => {
        element.delete();
    });
	
	meshesCache = [];
	chunks4D = [];
	
	Module.Destroy();
	
	if(callback)
		callback();
}

/* start decoding loop */
function Decode() {

    var dt = 1000.0 / (resourceManager._sequenceInfo.FrameRate * 3);

    /* Download a first pack of chunks at sequence init, bigger than the next ones */
	 if (firstChunks == false){
		 if ((keepChunksInCache==false && chunks4D.length < resourceManager._sequenceInfo.NbFrames*2)){
			resourceManager._internalCacheSize = 20000000; //20 Mo
			resourceManager.getBunchOfChunks();
		
			console.log('downloading first chunks');
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
		
        /* If a few chunks, download more */
        if (chunks4D.length < 300 || (keepChunksInCache==true && chunks4D.length < resourceManager._sequenceInfo.NbFrames*2)){
			resourceManager._internalCacheSize = 8000000; //8 Mo
			resourceManager.getBunchOfChunks();
		}

        /* If mesh is decoded, we stock it */
        if (mesh4D){
            meshesCache.push(mesh4D);
		}

    }, dt);
	
	isDecoding = true;
}

/* Start playing the sequence: first play function for one sequence */
function initPlaying(){
	
	/* clear the waiter */
	clearInterval(waiter);
	
	/* launch sequence playback */
	console.log('CREATING NEW SEQUENCE');
	LoadAudio(Audio4ds);
	playSequence();
	
	/* starting renderLoop for animation and render, at 60 FPS */
    renderLoop = setInterval(function () {
        requestAnimationFrame(animate);
		autoRotateCamera();
    }, 1.0 / 60.0);
}

/* Play sequence */
function playSequence(){
	console.log('start playing sequence, at: '+resourceManager._sequenceInfo.FrameRate+' FPS');
	
	if (isPlaying)
        return;
	
	/* If sequence is paused (decoding paused), we launch a new decoding loop */
	if (!isDecoding) {
		Decode();
	}
	
	var dt = 1000.0 / resourceManager._sequenceInfo.FrameRate;

    playback = setInterval(function () {
        //console.time("update");

        /* get first mesh from cache */
        var mesh4D = meshesCache.shift();

        if (mesh4D) {
			
			/* update buffers for rendering */
            updateMesh(mesh4D.GetVertices(), mesh4D.GetFaces(), mesh4D.GetUVs(), mesh4D.GetTexture(), mesh4D.nbVertices, mesh4D.nbFaces);
            if (currentMesh)
				currentMesh.delete();

			currentMesh = mesh4D;
			
			/**
			* Audio playback
			**/
            if (enableAudio) {

                if (isAudioloaded) {
                    if (mesh4D.frame == 0) {
                        restartAudio();
                    }

                    if (audioStartOffset + audioPassedTime > ((mesh4D.frame / resourceManager._sequenceInfo.FrameRate))) {
                        console.log("Audio Time: " + (audioStartOffset + audioPassedTime) + "  - sequence time:  " + (mesh4D.frame / resourceManager._sequenceInfo.FrameRate));
                        pauseAudio();
                    } else {
                        playAudio();
                        audioPassedTime = audioCtx.currentTime - audioStartTime;
                    }
				}
            }

			/** 
			* Timeline
			**/
			/* Display current frame (starting at 1 instead of 0) */
			document.getElementById('frame4D').innerHTML = (mesh4D.frame+1);
			
			/* Progress bar	(starting at 1 instead of 0) */
			currentFrame = ((mesh4D.frame+1) / resourceManager._sequenceInfo.NbFrames)*100;
            document.getElementById("timeline4D_progress").style.width = currentFrame + '%';

            if (!wasPlaying) {
                pauseSequence();
                wasPlaying = true;
            }

        } else{
			/* There is no mesh to be displayed, pauseAudio */
			if(enableAudio){
				pauseAudio();
			}
		}

        //console.timeEnd("update");
    }, dt);
	
	isPlaying = true;

    /* new loop for animation and rendering at 60 FPS */
    renderLoop = setInterval(function () {
        requestAnimationFrame(animate);		
    }, 1.0 / 60.0);
}

/* Stop playback and decode loops */
function pauseSequence() {
	isPlaying = false;
	
    clearInterval(playback);
	
    if(meshesCache >= maxCacheSize){
		clearInterval(decodeLoop);
		isDecoding = false;
	}
	pauseAudio();
}

function gotoFrame(frame) {
    wasPlaying = isPlaying;

    pauseSequence();
    clearInterval(decodeLoop);

    chunks4D.forEach(element => {
        element.delete();
    });
    meshesCache.forEach(element => {
        element.delete();
    });
    meshesCache = [];
    chunks4D = [];

    resourceManager.seek(frame);

    currentMesh = null;
    playSequence();
        
    audioPassedTime = 0;
    audioStartOffset = 0;
}


/** 
* Audio
**/


/* load the audio file and set its default settings */
function LoadAudio(audioFile) {

    audioLoader = new THREE.AudioLoader();
    audioListener = new THREE.AudioListener(audioCtx);
    audioSound = new THREE.PositionalAudio(audioListener);
    camera.add(audioListener);
    gainNode = audioCtx.createGain();

    console.log('loading audio file: ' + audioFile);

    audioLoader.load(audioFile, function (buffer) {
        audioSound.setBuffer(buffer);
        audioSound.setLoop(false);
        audioSound.setVolume(0);
        gainNode.gain.value = 0.5;
        isAudioloaded = true;

        playAudio();
    });

}


/* Play the audio file */
function playAudio(){	
    if (isAudioplaying === false) {

        audioTrack = audioCtx.createBufferSource();
        audioTrack.buffer = audioSound.buffer;
        audioTrack.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        if (currentMesh)
            audioStartOffset = currentMesh.frame / resourceManager._sequenceInfo.FrameRate;
        else
            audioStartOffset = 0;

        audioTrack.start(audioCtx.currentTime, audioStartOffset);
        console.log("start audio at time " + audioStartOffset);

        isAudioplaying = true;
        audioStartTime = audioCtx.currentTime;
	}	
}

/* Pause the audio playback */
function pauseAudio(){
	if(isAudioplaying === true){
        if (audioTrack)
            audioTrack.stop();

        isAudioplaying = false;
	}
}

/* When sequence loop, restart audio playback from beginning */
function restartAudio(){
	console.log('restart audio playback');
	if (audioTrack)
        audioTrack.stop();
    isAudioplaying = false;
    audioPassedTime = 0;

    playAudio();
}

/* Mute the audio */
function muteAudio(){
    audioLevel = gainNode.gain.value;
	console.log('volume will be set back at:'+audioLevel);
	
    gainNode.gain.value = 0;
	isAudiomuted = true;
}

/* Unmute the audio and set it back to its previously known level */
function unmuteAudio(){
	isAudiomuted = false;
	
	if(audioLevel){
        gainNode.gain.value = audioLevel;
		console.log('volume set at:'+audioLevel);
	} else {
        gainNode.gain.value = 0.5;
	}
}

