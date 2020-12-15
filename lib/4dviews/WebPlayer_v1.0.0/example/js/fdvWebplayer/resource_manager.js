// 4ds Sequence file
var File4ds = "";

//buffer of chunks read by the Resource Manager, waiting to be decoded by the Decoding Manager
var chunks4D = [];
var curChunkIndex = 0;

//var availableMeshes = 0;

//recup les fonctions c++
var instance;
var Module = {
    Create: function () {
        if (!instance) {
            instance = new Module.LinearEBD4DVDecoder();
        }
    },
    Destroy: function () {
		if (typeof instance !== 'undefined') {
			instance.delete();
			instance = null;
		}else{}
       
    },
    DecodeChunk: function () {
		var chunk4D;

        if (keepChunksInCache) {

            chunk4D = chunks4D[curChunkIndex];
			if(curChunkIndex < chunks4D.length){
				curChunkIndex++;
			} else {
				curChunkIndex = 0;
			}
        } else
            chunk4D = chunks4D.shift();

        if (chunk4D) {
            // console.time("decode");
			// console.log('there is chunk4D');
            var mesh4D = instance.AddChunk(chunk4D);
            //console.timeEnd("decode");
            if (!keepChunksInCache){
                chunk4D.delete();
				chunk4D = null;
			} else {
                if (curChunkIndex >= chunks4D.length){
                    curChunkIndex = 0;
				}
            }
            return mesh4D;
        }
        else {
			// console.log('there is NO chunk4D');
			return null;
		}
    }
}

class BlocInfo {
    constructor(keyFrameId, nbInterFrames, blocChunkPos) {
        this.KeyFrameId = keyFrameId;
        this.NbInterFrames = nbInterFrames;
        this.BlocChunkPos = blocChunkPos;
    }
}


class Chunk {

    constructor(type, codec, version, size) {
        this.Type = type;
        this.Codec = codec;
        this.Version = version;
        this.Size = size;
    }

    //SetData(data) {
    //    this.Data = data;
    //}
}


class ResourceManagerXHR {

    constructor() {
        //this._filename = "";

        //this._chunkBuffer = [];
        //this._maxBufferSize = 100;
        this._internalCacheSize = 20000000;


        this._sequenceInfo = {
            NbFrames: 0,
            NbBlocs: 0,
            FrameRate: 0,
            MaxVertices: 0,
            MaxTriangles: 0,
            TextureEncoding: 0,
            TextureSizeX: 0,
            TextureSizeY: 0
        };

        this._pointerToSequenceInfo;
        this._pointerToBlocIndex;

        this._blocInfos = [];
        this._KFPositions = [];
        this._currentBlocIndex = 0;
        this._firstBlocIndex = 0;
        this._lastBlocIndex = 0;

        this._isInitialized = false;
        this._isDownloading = false;

    }



    Open(callbackFunction) {
        //this._filename = filename;

        this._callback = callbackFunction;

        this.getFileHeader();

        ////sequence info
        //getOneChunk(_pointerToSequenceInfo);

        ////bloc index
        //getOneChunk(_pointerToBlocIndex);
    }


    SetXHR(firstByte, lastByte) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', File4ds);
        //xhr.onreadystatechange = handler;
        xhr.responseType = "arraybuffer";
        xhr.overrideMimeType('arrayBuffer; charset=x-user-defined');

        xhr.setRequestHeader('Range', `bytes=${firstByte}-${lastByte}`);

        xhr.send(); // for POST, can send a string or FormData

        return xhr;
    }


    getOneChunk(position) {
        console.log(`request range ${position} - ${position + 9}`);
        var xhr = this.SetXHR(position, position + 9);

        var parent = this;

        xhr.onload = function () {
            if (xhr.status == 206) {
                var headerChunk = xhr.response;

                var dv = new DataView(headerChunk);
                var type = dv.getUint8(0, true);
                var codec = dv.getUint16(1, true);
                var version = dv.getUint16(3, true);
                var chunkSize = dv.getUint32(5, true);

                var chunkHeader = { Type: type, Codec: codec, Version: version, Size: chunkSize };

                //console.log(`type = ${chunkHeader.Type}`);
                //console.log(`codec = ${chunkHeader.Codec}`);
                //console.log(`version = ${chunkHeader.Version}`);
                //console.log(`chunkSize = ${chunkHeader.Size}`);

                if (chunkHeader.Type == 1) {
                    parent.getSequenceInfo(position + 9, chunkHeader.Size);
                }
                else if (chunkHeader.Type == 3) {
                    parent.getBlocsInfos(position + 9, chunkHeader.Size);
                } else {
                    parent.getChunkData(position + 9, chunkHeader.Size);
                }


            } else if (xhr.status != 200) {
                // handle error
                console.error('Error: ' + xhr.status);
                return;
            }
        };

    }



    getBunchOfChunks(onLoadCallback) {
        if (!this._isInitialized) {
            console.log("reading 4ds error: XHR not initalized");
            return;
        }

        if (this._isDownloading)
            return;
        this._isDownloading = true;


        var pos0 = this._KFPositions[this._currentBlocIndex];
        var pos1 = pos0;

        while ((pos1 - pos0) < this._internalCacheSize && ++this._currentBlocIndex <= this._lastBlocIndex) {
            pos1 = this._KFPositions[this._currentBlocIndex];
        }

        //reset if end of file
        if (this._currentBlocIndex > this._lastBlocIndex) {
            if (this._lastBlocIndex == this._sequenceInfo.NbBlocs - 1)
                pos1 = this._pointerToBlocIndex;
            else
                pos1 = this._KFPositions[this._currentBlocIndex];
            this._currentBlocIndex = this._firstBlocIndex;
        }

        var memorySize = (pos1 - pos0);

        var xhr = this.SetXHR(pos0, pos1);
        //     console.log(`request range ${pos0} - ${pos1}`);

        var parent = this;

        xhr.onload = function () {
            if (xhr.status == 206) {

                var dv = new DataView(xhr.response);
                var dataPtr = 0;
                while (memorySize > 0) {
                    //extract a chunk

                    var chunkSize = dv.getUint32(dataPtr + 5, true);
                    //console.time("creationChunk");
					// console.log(chunkSize);

                    var cdataArray = new Uint8Array(xhr.response.slice(dataPtr + 9, dataPtr + 9 + chunkSize), 0, chunkSize);
                    var chunk4D = new Module.Chunk(dv.getUint8(dataPtr, true), dv.getUint16(dataPtr + 1, true), dv.getUint16(dataPtr + 3, true), chunkSize, cdataArray);

                    //console.timeEnd("creationChunk");
                    dataPtr += 9 + chunkSize;
                    memorySize -= (9 + chunkSize);

                    if (chunk4D.type == 10 || chunk4D.type == 11 || chunk4D.type == 12) {
                        if (!keepChunksInCache || chunks4D.length < parent._sequenceInfo.NbFrames * 2)
                            chunks4D.push(chunk4D);
                    }
                }

				// Chunks downloaded
                parent._isDownloading = false;
				//availableMeshes = (chunks4D.length/2);
            }
        };
    }



    addChunk(chunk4d) {
        chunks4D.push(chunk4d);
    }
	
	reinitResources(){
		
		this._sequenceInfo = {
            NbFrames: 0,
            NbBlocs: 0,
            FrameRate: 0,
            MaxVertices: 0,
            MaxTriangles: 0,
            TextureEncoding: 0,
            TextureSizeX: 0,
            TextureSizeY: 0
        };
		
		this._blocInfos = [];
        this._KFPositions = [];
        this._currentBlocIndex = 0;
        this._firstBlocIndex = 0;
        this._lastBlocIndex = 0;
		
		this._isInitialized = false;
        this._isDownloading = false;		
    }


    seek(frame) {
        //search for correct frame bloc
        let sf = 0;
        let i = 0;
        while (sf < frame) {
            sf += this._blocInfos[i].NbInterFrames + 1;
            i++;
        }

        //jump to bloc
        if (i>0)
            this._currentBlocIndex = i - 1;
        else
            this._currentBlocIndex = 0;
    }


    getChunkData(position, size) {
        var xhr = this.SetXHR(position, position + size);

        xhr.onload = function () {
            if (xhr.status == 206) {
                console.log(`chunk Data Downloaded`);

                return xhr.response;

            } else if (xhr.status != 200) {
                // handle error
                alert('Error: ' + xhr.status);
                return;
            }
        };
    }


    getFileHeader() {
        var xhr = this.SetXHR(0, 30);
        console.log(`file : ${File4ds}`);
        var parent = this;

        xhr.onload = function () {
            if (xhr.status == 206 && xhr.readyState == 4) {
                console.log(`Header Downloaded`);

                var headerChunk = xhr.response;

                var dv = new DataView(headerChunk);
                var version = dv.getInt16(4, true);
                parent._pointerToSequenceInfo = dv.getInt32(6, true);
                var pointerToSequenceInfoPart2 = dv.getInt32(10, true);
                parent._pointerToBlocIndex = dv.getInt32(14, true);
                var pointerToBlocIndexPart2 = dv.getInt32(18, true);
                var pointerToTrackIndex = dv.getInt32(22, true);
                var pointerToTrackIndexPart2 = dv.getInt32(26, true);

                console.log(`file magic= ${dv.getUint8(0, true)} ${dv.getUint8(1, true)} ${dv.getUint8(2, true)} ${dv.getUint8(3, true)}`);
                console.log(`version = ${version}`);
                console.log(`pointerToSequenceInfo = ${parent._pointerToSequenceInfo}`);
                console.log(`pointerToSequenceInfoPart2 = ${pointerToSequenceInfoPart2}`);
                console.log(`pointerToBlocIndex = ${parent._pointerToBlocIndex}`);
                console.log(`pointerToBlocIndexPart2 = ${pointerToBlocIndexPart2}`);

                //sequence info
                parent.getOneChunk(parent._pointerToSequenceInfo);

            } else if (xhr.status != 200) {
                // handle error
                alert('Error: ' + xhr.status);
                return;
            }
        };
    }


    getSequenceInfo(position, size) {
        var xhr = this.SetXHR(position, position + size);

        var parent = this;

        xhr.onload = function () {
            if (xhr.status == 206) {

                var dv = new DataView(xhr.response);
                parent._sequenceInfo.NbFrames = dv.getUint32(0, true);
                parent._sequenceInfo.NbBlocs = dv.getUint32(4, true);
                parent._sequenceInfo.FrameRate = dv.getFloat32(8, true);
                parent._sequenceInfo.MaxVertices = dv.getUint32(12, true);
                parent._sequenceInfo.MaxTriangles = dv.getUint32(16, true);
                parent._sequenceInfo.TextureEncoding = dv.getUint32(20, true);
                parent._sequenceInfo.TextureSizeX = dv.getUint32(24, true);
                parent._sequenceInfo.TextureSizeY = dv.getUint32(28, true);

                console.log(parent._sequenceInfo);

                //bloc index
                parent.getOneChunk(parent._pointerToBlocIndex);


            } else if (xhr.status != 200) {
                // handle error
                alert('Error: ' + xhr.status);
                return;
            }
        };
    }


    getBlocsInfos(position, size) {
        var xhr = this.SetXHR(position, position + size);

        var parent = this;

        xhr.onload = function () {
            if (xhr.status == 206) {
                var dv = new DataView(xhr.response);

                parent._KFPositions.push(79);

                for (let i = 0; i < parent._sequenceInfo.NbBlocs; i++) {
                    var bi = new BlocInfo(dv.getInt32(i * 16, true), dv.getInt32(i * 16 + 4, true), dv.getInt32(i * 16 + 8, true));
                    parent._blocInfos.push(bi);
                    parent._KFPositions.push(bi.BlocChunkPos + 9 + (bi.NbInterFrames + 1) * 16);
                }

                parent._firstBlocIndex = 0;
                parent._lastBlocIndex = parent._sequenceInfo.NbBlocs - 1;

                //console.log(parent._blocInfos);

                parent._isInitialized = true;
                parent._callback();
                //parent.Read();

            } else if (xhr.status != 200) {
                // handle error
                alert('Error: ' + xhr.status);
                return;
            }
        };
    }
}