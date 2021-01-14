/*
System Design
-------------

4dview ships a web player that's based on a WASM decoder managed by some JavaScript.
In their default player, this all runs in the main thread, which causes blocking of 
other processes, like the renderer.

Instead, we run our WASM decoder in a worker, so it doesn't slow down our main thread.
Our main thread preallocates buffers for a configurable number of frames, then it
asks the worker to load the 4dview file for us.  Once it reports that the file has been
loaded, we start requesting frames, transferring ownership of one of the framedata 
buffers in our ring buffer.  The worker fills this buffer with the appropriate frame 
data, then transfers ownership back to the main thread.

*/
 
class VolumetricFrame4DViews {
  constructor(seq) {
    this.frame = 0;
    this.ready = true;
    this.played = true;

    let buffersize = seq.MaxVertices * 8 * 4 + seq.MaxTriangles * 3 * 4 + seq.TextureSizeX * seq.TextureSizeY / 2;
    this.buffer = new ArrayBuffer(buffersize);

    this.vertices = new Float32Array(this.buffer, 0, seq.MaxVertices * 3);
    this.normals = new Float32Array(this.buffer, this.vertices.byteLength, seq.MaxVertices * 3);
    this.uvs = new Float32Array(this.buffer, this.normals.byteOffset + this.normals.byteLength, seq.MaxVertices * 2);
    this.indices = new Uint32Array(this.buffer, this.uvs.byteOffset + this.uvs.byteLength, seq.MaxTriangles * 3);
    this.texture = new Uint8Array(this.buffer, this.indices.byteOffset + this.indices.byteLength, seq.TextureSizeX * seq.TextureSizeY / 2);
    this.numverts = seq.MaxVertices;
    this.numfaces = seq.MaxTriangles;
  }
}
class VolumetricPlayer4DViews extends EventTarget {
  constructor(lighting=false, workerScriptURL='4dviews-worker.js') {
    super();
    this.framecache = [];
    this.cacheframes = 30;
    this.currentframe = 0;
    this.autoplay = true;
    this.loop = true;
    this.lighting = lighting;
    this.workerScriptURL = workerScriptURL;
  }
  load(url) {
    if (typeof url == 'object') {
      url = url.url;
    }
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        this.worker = new Worker(this.workerScriptURL);
        this.worker.addEventListener('message', ev => {
          let msg = ev.data;
          if (msg.type == 'initialized') {
            this.worker.postMessage({type: 'load', src: url});
          } else if (msg.type == 'loaded') {
            console.log('got load event', msg);
            this.updateSequenceInfo(msg.sequenceInfo);
            this.prefetchFrames();
            if (this.autoplay) {
              setTimeout(() => {
                this.play();
              }, 1000);
            }
            resolve(this);
          } else if (msg.type == 'frame') {
            this.updateFrameData(msg.framedata);
          }
        });
      }
      // TODO - need to make normalworker js code available in the worker bundle, then pass messages to generate normals
      /*
      if (this.lighting && !this.normalworker) {
        this.normalworker = new Worker(this.workerScriptURL);
        this.normalworker.addEventListener('message', ev => {
          let framedata = ev.data;
          this.framecache[framedata.frame % this.cacheframes] = framedata;
          framedata.ready = true;
          framedata.played = false;
        });
      }
      */
    });
  }
  updateSequenceInfo(sequenceInfo) {
    this.sequenceInfo = sequenceInfo;
    this.initBuffers(sequenceInfo);
  }
  initBuffers(sequenceInfo) {
    for (let i = 0; i < this.cacheframes; i++) {
      this.framecache[i] = new VolumetricFrame4DViews(sequenceInfo);
    }
  }
  play() {
    // TODO - we should start the worker going, then wait until we have a few frames buffered up before we start using them
    // This will allow us to maintain smoother frame timing
    //this.prefetchFrames(this.currentframe);
    if (this.frameinterval) {
      clearInterval(this.frameinterval);
      this.frameinterval = false;
    } else {
    this.frameinterval = setInterval(() => {
      let framedata = this.framecache[this.currentframe % this.cacheframes];
      if (framedata.ready && document.visibilityState == 'visible') {
        this.setActiveFrame(this.currentframe);
        this.currentframe++;
        if (this.currentframe >= this.sequenceInfo.NbFrames) {
          this.currentframe = (this.loop ? 0 : this.sequenceInfo.NbFrames - 1);
        }
        this.prefetchFrames();
      }
    }, 1000 / this.sequenceInfo.FrameRate);
    }
  }
  pause() {
    if (this.frameinterval) {
      clearInterval(this.frameinterval);
      this.frameinterval = false;
    }
  }
  stop() {
    if (this.frameinterval) {
      clearTimeout(this.frameinterval);
      this.currentframe = 0;
      this.setActiveFrame(0);
    }
  }
  seek(frame) {
  }
  prefetchFrames() {
    for (let i = this.currentframe; i < this.currentframe + this.cacheframes / 2; i++) {
      let frame = i; //i % (this.sequenceInfo.NbFrames - 1);
      if (frame >= this.sequenceInfo.NbFrames) {
        frame = this.sequenceInfo.NbFrames - 1;
      }
      let framedata = this.framecache[frame % this.cacheframes];
      if (framedata.ready && framedata.played) {
        this.requestFrame(frame);
      }
    }
  }
  requestFrame(frame) {
    let framedata = this.framecache[frame % this.cacheframes];
    //console.log('request frame', frame, framedata);
    framedata.ready = false;
    this.worker.postMessage({
      type: 'requestframe',
      frame: frame,
      framedata: framedata
    }, [framedata.buffer]);
  }
  setActiveFrame(frame) {
    let framedata = this.framecache[frame % this.cacheframes];
    framedata.played = true;
    this.dispatchEvent(new CustomEvent('frame', {detail: framedata}));
  }
  updateFrameData(framedata) {
//console.log('received frame', framedata.frame, framedata);
    if (this.lighting) {
      this.computeNormals(framedata);
    } else {
      this.framecache[framedata.frame % this.cacheframes] = framedata;
      framedata.ready = true;
    }
    framedata.played = false;
  }
  computeNormals(framedata) {
    if (this.normalworker) {
      this.normalworker.postMessage(framedata, [framedata.buffer]);
/*
framedata.ready = true;
this.framecache[framedata.frame % this.cacheframes] = framedata;
*/

    }
  }
}

export { VolumetricFrame4DViews, VolumetricPlayer4DViews };
