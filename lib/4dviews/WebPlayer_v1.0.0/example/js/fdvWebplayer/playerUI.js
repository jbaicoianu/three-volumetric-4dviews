/* MASTER ELEMENT */
var container = document.getElementById("container4D");

/* BUILDING SPLASHSCREEN, MENU AND CONTROLS */
var wrapper = document.createElement("DIV");
var sizer = document.createElement("DIV");
var poster = document.createElement("DIV");
var waiter = document.createElement("DIV");
var logo = document.createElement("DIV");
var logoimg = document.createElement("SVG");
	logoimg.setAttribute("width","42");
	logoimg.setAttribute("height","34.501");
	logoimg.setAttribute("version","1.1");
	logoimg.setAttribute("viewBox","0 0 11.112 9.1283");
var logogroup = document.createElementNS("http://www.w3.org/2000/svg", 'g');
	logogroup.setAttribute("transform","translate(1.5427e-8 -287.87)");
var logopath = document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create a path in SVG's namespace
	logopath.setAttribute("d","m5.9093 294.02v-5.4412l1.4602-5e-3s3.0395-0.0553 3.0395 3.8011c0 3.8596-3.0395 3.9203-3.0395 3.9203h-3.4492v-7.7159h-0.47489l-2.742 5.4387v0.64266h3.2169"); //Set path's data
	logopath.setAttribute("fill","none");
	logopath.setAttribute("stroke-width","1.407");
var logostatus = document.createElement("DIV");
var logoprogress = document.createElement("DIV");
var logotext = document.createElement("DIV");
var menu = document.createElement("DIV");
var timeline = document.createElement("DIV");
var progress = document.createElement("DIV");
var controls = document.createElement("DIV");
var pausebtn = document.createElement("IMG");
var volume = document.createElement("DIV");
var volumebtn = document.createElement("IMG");
var volumeslider = document.createElement("DIV");
var volumelevel = document.createElement("INPUT");
var volumerange = document.createElement("DIV");
var volumethumb = document.createElement("DIV");
var framestext = document.createElement("DIV");
var menuright = document.createElement("DIV");
var fullscreenbtn = document.createElement("IMG");
var optionsbtn = document.createElement("IMG");
var optionsframe = document.createElement("DIV");
var optionsframemobileclose = document.createElement("DIV");
var optionstitle = document.createElement("DIV");
var optionslist = document.createElement("DIV");
var optionscamera = document.createElement("DIV");
var optionstexture = document.createElement("DIV");
var optionsbackground = document.createElement("DIV");

/**
* ELEMENTS IDs & ATTRIBUTES
**/
/* Icons SRC */
var pauseBtnSrc = "js/fdvWebplayer/img/pause_w.png";
var playBtnSrc = "js/fdvWebplayer/img/play_w.png";
var soundLowBtnSrc = "js/fdvWebplayer/img/low_sound_w.png";
var soundMedBtnSrc = "js/fdvWebplayer/img/med_sound_w.png";
var soundHighBtnSrc = "js/fdvWebplayer/img/high_sound_w.png";
var soundMutedBtnSrc = "js/fdvWebplayer/img/muted_w.png";
var optionsBtnSrc = "js/fdvWebplayer/img/options_w.png";
var fullscreenBtnSrc = "js/fdvWebplayer/img/fullscreen_w.png";
var fullscreenExitBtnSrc = "js/fdvWebplayer/img/fullscreen_exit_w.png";
var autorotateBtnSrc = "js/fdvWebplayer/img/autorotate_w.png";
var shadedBtnSrc = "js/fdvWebplayer/img/shaded_w.png";
var textureBtnSrc = "js/fdvWebplayer/img/texture_w.png";
var slideLeftBtnSrc = "js/fdvWebplayer/img/slide_panel_left_w.png";

var bgDarkSrc = "js/fdvWebplayer/img/bg_dark_logo.jpg";
var bgLightSrc = "js/fdvWebplayer/img/bg_light_logo.jpg";

var closeBtnSrc = "js/fdvWebplayer/img/close_w_218p.png";

/* IDs */
wrapper.id = "wrapper4D";
sizer.id = "sizer4D";
poster.id = "poster4D";
waiter.id = "waiter4D";
logo.id = "logo4D";
logoimg.id = "logo4D_svg";
logopath.id = "logo4D_path";
logostatus.id = "logo4D_statusbar";
logoprogress.id = "logo4D_progress";
logotext.id = "logo4D_text";
menu.id = "menu4D";
menuright.id = "menu4D_right";
timeline.id = "timeline4D_wrapper";
progress.id = "timeline4D_progress";
	progress.width = "0%";
controls.id = "controls4D";
pausebtn.id = "pause4D";
	pausebtn.setAttribute("src",pauseBtnSrc);
volume.id = "volume4D";
volumebtn.id = "volume4D_icon";
	volumebtn.setAttribute("src",soundMedBtnSrc);
volumeslider.id = "volume4D_slider";
volumelevel.id = "volume4D_level";
volumerange.id = "volume4D_range";
volumethumb.id = "volume4D_thumb";
framestext.id = "frame4D";
fullscreenbtn.id = "fullscreen4D";
	fullscreenbtn.setAttribute("src",fullscreenBtnSrc);
optionsbtn.id = "options4D";
	optionsbtn.setAttribute("src",optionsBtnSrc);
optionsframe.id = "options4D_frame";
optionstitle.classList.add("options4D_title");
optionslist.classList.add("options4D_list");

/**
* CONSTRUCTOR FUNCTIONS
**/
function addOptionsToggleBtn(containerElem,itemClass,itemLabel,itemActive) {
	var optionsparent = document.createElement("DIV");
		// optionsparent.classList.add('"'+itemClass+'"');
		optionsparent.className = "options4D_item "+itemClass;
		optionsparent.innerHTML = itemLabel;
		// optionsparent.addEventListener('click', function(){
			// this.classList.toggle("active");
			// alert('nok')
		// });
		if(itemActive == true){
			optionsparent.classList.add("active");
		}
	containerElem.appendChild(optionsparent);
	var optionstoggle = document.createElement("DIV");
		optionstoggle.className = "options4D_toggle";
	var optionstogglebtn = document.createElement("DIV");
		optionstogglebtn.className = "options4D_toggle_btn";
	optionsparent.appendChild(optionstoggle);
	optionstoggle.appendChild(optionstogglebtn);
}

/**
* ELEMENTS PUSH TO HTML 
**/
container.parentNode.insertBefore(wrapper, container);
wrapper.appendChild(container);
wrapper.appendChild(sizer);
wrapper.appendChild(poster);
wrapper.appendChild(waiter);
	waiter.appendChild(logo);
		logo.appendChild(logoimg);
			logoimg.appendChild(logogroup);
				logogroup.appendChild(logopath);
				logopath.webkitAnimationPlayState = "running";
		logo.appendChild(logostatus);
			logostatus.appendChild(logoprogress);
		logo.appendChild(logotext);
			logotext.innerHTML = ".. loading sequence";
container.parentNode.insertBefore(menu, container.nextSibling);
	menu.appendChild(timeline);
		timeline.appendChild(progress);
	menu.appendChild(controls);
		controls.appendChild(pausebtn);
		controls.appendChild(volume);
			volume.appendChild(volumebtn);
			volume.appendChild(volumeslider);
				volumeslider.appendChild(volumelevel);
					volumelevel.type = "range";
					volumelevel.min = "0";
					volumelevel.max = "0";
					volumelevel.value = "0";
					volumelevel.step = "0.01";
				volumeslider.appendChild(volumerange);
					volumerange.appendChild(volumethumb);
		controls.appendChild(framestext);
		controls.appendChild(menuright);
			menuright.appendChild(optionsbtn);
			menuright.appendChild(fullscreenbtn);	
container.appendChild(optionsframe);
	optionsframe.appendChild(optionstitle);
		optionstitle.innerHTML = "OPTIONS";
	optionsframe.appendChild(optionslist);
		addOptionsToggleBtn(optionslist,"options4D_camera", "Autorotate", true);
		addOptionsToggleBtn(optionslist,"options4D_texture", "Texture", true);
		addOptionsToggleBtn(optionslist,"options4D_background", "Dark Mode", false);
	var optionsframemobile = optionsframe.cloneNode(true);	
wrapper.appendChild(optionsframemobile);
	optionsframemobile.appendChild(optionsframemobileclose);
	optionsframemobileclose.id = 'options4D_frame_mobile_close';
	optionsframemobile.id = 'options4D_frame_mobile';
		
// EVENT LISTENER: Trigger LoadSequence()
var elemTriggerSequence = document.getElementsByClassName("triggerSequence");
for (var i = 0; i < elemTriggerSequence.length; i++) {
	elemTriggerSequence[i].addEventListener('click', LoadSequence, false);
}

// EVENT LISTENER: Options panel
if(document.getElementById("options4D") !== null){
	document.getElementById("options4D").addEventListener('click', function(){
		document.getElementById("wrapper4D").classList.toggle("menu-opened");
		document.getElementById("options4D").classList.toggle("active");
		
		if(this.classList.contains("active")){
			this.setAttribute("src",slideLeftBtnSrc);
		} else {
			this.setAttribute("src",optionsBtnSrc);
		}
	});
};

// EVENT LISTENER: Options panel close BTN
if(document.getElementById("options4D_frame_mobile_close") !== null){
	document.getElementById("options4D_frame_mobile_close").addEventListener('click', function(){
		document.getElementById("wrapper4D").classList.remove("menu-opened");
		document.getElementById("options4D").classList.remove("active");
		
		if(document.getElementById("options4D").classList.contains("active")){
			document.getElementById("options4D").setAttribute("src",slideLeftBtnSrc);
		} else {
			document.getElementById("options4D").setAttribute("src",optionsBtnSrc);
		}
	});
};
options4D_frame_mobile_close

// EVENT LISTENER: CACHE Option
var elemOptionCache = document.getElementsByClassName("cacheOptions4D");
for (var i = 0; i < elemOptionCache.length; i++) {
	elemOptionCache[i].addEventListener('change', function(){
		if(this.value == "onfly"){
			this.setAttribute('value',this.value);
			keepChunksInCache = false;
		}else if(this.value == "allsequence"){
			this.setAttribute('value',this.value);
			keepChunksInCache = true;
		}
	});
};

// EVENT LISTENER: AUTOROTATE Option
var elemOptionAutorotate = document.getElementsByClassName("options4D_camera");
for (var i = 0; i < elemOptionAutorotate.length; i++) {
	elemOptionAutorotate[i].addEventListener('click', function(){
		if(this.classList.contains("active")){
			this.classList.remove("active");
			autoRotate = false;
		} else {
			this.classList.add("active");
			autoRotate = true;
		}
	});
};



// EVENT LISTENER: Turn off texture
var elemOptionTexture = document.getElementsByClassName("options4D_texture");
for (var i = 0; i < elemOptionTexture.length; i++) {
	elemOptionTexture[i].addEventListener('click', function(){
		if(this.classList.contains("active")){
			this.classList.remove("active");
			mesh.material = new THREE.MeshPhongMaterial( { color: 0xCCCCCC, specular: 0x000000, shininess: 30, shading: THREE.FlatShading }   ); 
			
		} else {
			this.classList.add("active");
			mesh.material = new THREE.MeshBasicMaterial({ map: texture })
		}
	});
};

// EVENT LISTENER: Background Option
var elemOptionBackground = document.getElementsByClassName("options4D_background");
for (var i = 0; i < elemOptionBackground.length; i++) {
	elemOptionBackground[i].addEventListener('click', function () {
		if(this.classList.contains("active")){
			this.classList.remove("active");
			container.style.backgroundImage = "url('"+bgLightSrc+"')";
		} else {
			this.classList.add("active");
			container.style.backgroundImage = "url('"+bgDarkSrc+"')";
		}
	});
};

// FUNCTION: Fullscreen Option
function goFullscreen() {
	var screenWidth = window.screen.width;
	var screenHeight = window.screen.height;
	
	var wrapper = document.getElementById("wrapper4D");
	var fullscreenbtn = document.getElementById("fullscreen4D");
		
	fullscreenbtn.classList.toggle("active");
	wrapper.classList.toggle("fullscreen");
	
	if(fullscreenbtn.classList.contains("active")){
		fullscreenbtn.setAttribute("src",fullscreenExitBtnSrc);
	}else{
		fullscreenbtn.setAttribute("src",fullscreenBtnSrc);
	}
	
	if(wrapper.classList.contains("fullscreen")){
		if (wrapper.requestFullscreen) {
			wrapper.requestFullscreen();
		} else if (wrapper.mozRequestFullScreen) { /* Firefox */
			wrapper.mozRequestFullScreen();
		} else if (wrapper.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
			wrapper.webkitRequestFullscreen();
		} else if (wrapper.msRequestFullscreen) { /* IE/Edge */
			wrapper.msRequestFullscreen();
		}
		
		if(screen.width < 561){
			screen.orientation.lock("landscape-primary");
			if(renderer){
				renderer.setSize(screen.width*window.devicePixelRatio, screen.height*window.devicePixelRatio);
			}
		} else{
			if(renderer){
				renderer.setSize(screen.width*window.devicePixelRatio, screen.height*window.devicePixelRatio);
			}
		}
		
	} else{
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.mozCancelFullScreen) { /* Firefox */
			document.mozCancelFullScreen();
		} else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
			document.webkitExitFullscreen();
		} else if (document.msExitFullscreen) { /* IE/Edge */
			document.msExitFullscreen();
		}
		
		if(screen.width < 561){
			screen.orientation.unlock();
		}
		
		if(renderer){
			renderer.setSize(container.offsetWidth, container.offsetHeight);
		}
	}
}

// EVENT LISTENER: Fullscreen Option
if(document.getElementById("fullscreen4D") !== null){
	document.getElementById("fullscreen4D").addEventListener('click', function () {
		goFullscreen();
	});
};
// EVENT LISTENER: Fullscreen Option (Escape Key Behavior)
document.addEventListener('fullscreenchange', function(e) {
	if(!document.fullscreen){
		fullscreenbtn.classList.remove("active");
		wrapper.classList.remove("fullscreen");
		
		fullscreenbtn.setAttribute("src",fullscreenBtnSrc);
	}
});


// EVENT LISTENER: PAUSE/PLAY Button
if(document.getElementById("pause4D") !== null){
	document.getElementById("pause4D").addEventListener('click', function(){
		console.log("pushing play/pause");
		if (isPlaying) {
			console.log('pause');
			this.setAttribute("src",playBtnSrc);
			pauseSequence();
			autoRotatePause = true;
		} else{
			console.log('play');
			this.setAttribute("src",pauseBtnSrc);
			playSequence();
			autoRotatePause = false;
		}
	}, false);
};


// EVENT LISTENER: Timeline seek
timeline.addEventListener('click', function (ev) {
    console.log("clicking timeline");
    var rec = timeline.getBoundingClientRect();
    let x = ev.pageX - (rec.left + window.scrollX);
    

    let ratio = timeline.offsetWidth / resourceManager._sequenceInfo.NbFrames ;
    let frame = x / ratio;

    console.log(" seek frame: " + frame);

    gotoFrame(frame);
}, false);


// EVENT LISTENER: VOLUME
// Level slider
if(document.getElementById("volume4D_level") !== null){
	document.getElementById("volume4D_level").addEventListener('input', function(){
		document.getElementById("volume4D_range").style.width = ((this.value*80)-8)+"px";
		
		if(!isAudiomuted){
			this.setAttribute('value',this.value);
			audioLevel = this.value;
			
			if(audioLevel > 0){
				if(audioLevel <= 0.35){
					unmuteAudio();
					document.getElementById("volume4D_icon").setAttribute("src",soundLowBtnSrc);
				} else if(audioLevel <= 0.75) {
					unmuteAudio();
					document.getElementById("volume4D_icon").setAttribute("src",soundMedBtnSrc);
				} else {
					unmuteAudio();
					document.getElementById("volume4D_icon").setAttribute("src",soundHighBtnSrc);
				}
			}else {
				audioSound.setVolume(0);
				console.log('volume set at:'+audioLevel);
				document.getElementById("volume4D_icon").setAttribute("src",soundMutedBtnSrc);
			}
		}
	});
};
// Mute/Unmute
if(document.getElementById("volume4D_icon") !== null){
	document.getElementById("volume4D_icon").addEventListener('click', function(){

		// If the audio option is enabled
		if(enableAudio){
			
			if(audioLevel = undefined){
				audioLevel = 0.5;
			}
			
			// If audio is turned on, mute unless it reached level 0 without being muted
			if(!isAudiomuted)
			{
				if(audioLevel != 0){
					muteAudio();
					this.setAttribute("src",soundMutedBtnSrc);
					document.getElementById("volume4D_level").setAttribute("max",0);
				} else {
					document.getElementById("volume4D_level").setAttribute("value",0.5);
					audioSound.setVolume(0.5);
					this.setAttribute("src",soundMedBtnSrc);
				}
			}
			// If audio is turned off, unmute
			else{
				unmuteAudio();
				document.getElementById("volume4D_level").setAttribute("max",1);
				
				// If the default audioLevel has been changed, set volume icon based on the audio level
				console.log(audioLevel);
				if(audioLevel){
					if(audioLevel <= 0.35){
						this.setAttribute("src",soundLowBtnSrc);
					} else if(audioLevel <= 0.75){
						this.setAttribute("src",soundMedBtnSrc);
					} else {
						this.setAttribute("src",soundHighBtnSrc);
					}
				}
				// Else, set it to its default icon, medium level
				else {
					this.setAttribute("src",soundMedBtnSrc);
				}
			}			
		}
		else{}
		
	}, false);
};

// LOAD SEQUENCE
function LoadSequence() {
	document.getElementById('poster4D').style.display = "none";
	document.getElementById('wrapper4D').style.display = "block";
	document.getElementById('waiter4D').style.display = "block";
	document.getElementById('menu4D').style.display = "block";
	
	// Sequence URLs
	file4dsDesktop = this.dataset.desktopSequence;
	file4dsMobile = this.dataset.mobileSequence;
	file4dsAudio = this.dataset.audioFile;
	
	console.log('width: '+container.offsetWidth+', height: '+container.offsetHeight);
	
	if(screen.width < 561){
		goFullscreen();
	};
	
	// If there is no webplayer instance already created, do it
	if (!instance) {
		CreatePlayer();
		isAudiomuted = false;
	}
	else {
		console.log('CHANGE SEQUENCE sequence');
		DestroyPlayer(function(){
			
			CreatePlayer();
			isAudiomuted = false;
			
			/* hide the waiter splashscreen and play the sequence */
			var waiterSplashscreen = document.getElementById('waiter4D');
			waiterSplashscreen.style.display = "none";
			//initPlaying();
		});
	}
}

/* waiter's progress bar */
function ProgressWaiter(){
	var percent = meshesCache.length / maxCacheSize;
	
	var waiterProgress = document.getElementById('logo4D_progress');
	waiterProgress.style.width = (percent*100)+"%";
}

// Free memory on window loosing focus
window.onblur = function () {
	pauseSequence();
	document.getElementById("pause4D").setAttribute("src",playBtnSrc);
}

// Free memory on window closing
window.onunload = function () {
	DestroyPlayer();
}

var current_mode = screen.orientation;

// type
console.log(current_mode.type)

// angle
console.log(current_mode.angle)

