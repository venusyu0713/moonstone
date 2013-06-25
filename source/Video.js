/**
	_enyo.Video_ is a control that allows you to play video. It is an
	abstraction of HTML 5 Video.

	Initialize a video component as follows:

		{kind: "Video", src: "http://www.w3schools.com/html/movie.mp4"}
	
	To play a video, call `this.$.video.play()`.

	To get a reference to the actual HTML 5 Video element, call
	`this.$.video.hasNode()`.
*/
enyo.kind({
	name: "enyo.Video",
	kind: enyo.Control,
	published: {
		//* source URL of the video file, can be relative to the application's HTML file
		src: "",
		//* Specify multiple sources for the same video file
		sourceComponents: null,
		//* source of image file to show when video isn't available
		poster: "",
		//* if true, show controls for starting and stopping video player
		showControls: false,
		/**
			This value determines if/how the video object should preload. Possible values:
				auto: preload the video data as soon as possible.
				metadata: preload only the video metadata.
				none: do not preload any video data.
		*/
		preload: "metadata",
		//* if true, video will automatically start
		autoplay: false,
		//* if true, restart video player from beginning when finished
		loop: false,
		//* (webOS only) if true, stretch the video to fill the entire window
		fitToWindow: false,
		//* Video aspect ratio in the format _width:height_
		aspectRatio: null,
		//* jump forward or backward time in seconds
		jumpSec: 30,
		//* set video playbackRate
		playbackRate: 1
	},
	handlers: {
		//* Catch video _loadedmetadata_ event
		onloadedmetadata: "metadataLoaded",
		//* Decorate _timeupdate_ event
		onTimeupdate: "decorateTimeUpdate"
	},
	tag: "video",
	//* @protected
	_playbackRateHash: {
		fastForward: [4, 15, 60, 300],
		rewind: [-4, -15, -60, -300],
		slowForward: [1/15, 1/4],
		slowRewind: [-1/4, -1]
	},
	_playbackRateArray: null,
	_speedIndex: 0,

	create: function() {
		this.inherited(arguments);
		this.posterChanged();
		this.showControlsChanged();
		this.preloadChanged();
		this.autoplayChanged();
		this.loopChanged();
	},
	rendered: function() {
		this.inherited(arguments);
		this.hookupVideoEvents();
	},
	updateSource: function() {
		var src = this.src,
			rewrittenSrc
		;
		
		this.log(this.src);
		
		if (!src || src === "") {
			this.addSources();
		
		} else {
			rewrittenSrc = enyo.path.rewrite(src);
			
			// Don't reset to the same value
			if (this.getAttribute("src") === rewrittenSrc) {
				return;
			}
			
			this.setAttribute("src", rewrittenSrc);
		}
		
		// HTML5 spec says that if you change src after page is loaded, you
		// need to call load() to load the new data
		if (this.hasNode()) {
			this.node.load();	// not called
		}
	},
	//* Add _<source>_ tags for each sources specified in _this.sources_
	addSources: function() {
		var sources = this.getSourceComponents();
		
		if (!sources || sources.length == 0) {
			return;
		}
		
		// Wipe out any previous sources
		this.destroyClientControls();
		
		// Add a source tag for each source
		for (i = 0; i < sources.length; i++) {
			this.createComponent(enyo.mixin(sources[i], {tag: "source"}));
		}
		
		// Rerender
		this.render();
	},
	srcChanged: function() {
		this.updateSource();
	},
	sourceComponentsChanged: function() {
		this.updateSource();
	},
	posterChanged: function() {
		if (this.poster) {
			var path = enyo.path.rewrite(this.poster);
			this.setAttribute("poster", path);
		}
		else {
			this.setAttribute("poster", null);
		}
	},
	showControlsChanged: function() {
		this.setAttribute("controls", this.showControls ? "controls" : null);
	},
	preloadChanged: function() {
		this.setAttribute("preload", this.preload ? this.preload : null);
	},
	autoplayChanged: function() {
		this.setAttribute("autoplay", this.autoplay ? "autoplay" : null);
		this._prevCommand = this.autoplay ? "play" : "pause";
	},
	loopChanged: function() {
		this.setAttribute("loop", this.loop ? "loop" : null);
	},
	fitToWindowChanged: function() { 
		if (!this.hasNode()) {
			return;
		}
	},
	//* @public
	play: function() {
		if (!this.hasNode()) {return;}
		this.setPlaybackRate(1);
		this.node.play();
		this._prevCommand = "play";
	},
	pause: function() {
		if (!this.hasNode()) {return;}
		this.setPlaybackRate(1);
		this.node.pause();
		this._prevCommand = "pause";
	},
	fastForward: function() {
		if (!this.hasNode()) {return;}
		switch (this._prevCommand) {
		case "pause":
			this.selectPlaybackRateArray("slowForward");
			this._speedIndex = 0;
			this.node.play();
			break;
		case "fastForward":
			this._speedIndex = this.clampPlaybackRate(this._speedIndex+1);
			break;
		default:
			this.selectPlaybackRateArray("fastForward");
			this._speedIndex = 0;
		}
		
		this.setPlaybackRate(this.selectPlaybackRate(this._speedIndex));
		this._prevCommand = "fastForward";
	},
	rewind: function() {
		if (!this.hasNode()) {return;}
		switch (this._prevCommand) {
		case "pause":
			this.selectPlaybackRateArray("slowRewind");
			this._speedIndex = 0;
			this.node.play();
			break;
		case "rewind":
			this._speedIndex = this.clampPlaybackRate(this._speedIndex+1);
			break;
		default:
			this.selectPlaybackRateArray("rewind");
			this._speedIndex = 0;
		}
		this.setPlaybackRate(this.selectPlaybackRate(this._speedIndex));
		this._prevCommand = "rewind";
	},
	jumpBackward: function() {
		if (!this.hasNode()) {return;}
		this.setPlaybackRate(1);
		this.node.currentTime -= this.jumpSec;
		this._prevCommand = "jumpBackward";
	},
	jumpForward: function() {
		if (!this.hasNode()) {return;}
		this.setPlaybackRate(1);
		this.node.currentTime += this.jumpSec;
		this._prevCommand = "jumpForward";
	},
	jumpToStart: function() {
		if (!this.hasNode()) {return;}
		this.setPlaybackRate(1);
		this.node.pause();
		this.node.currentTime = 0;
		this._prevCommand = "jumpToStart";
	},
	jumpToEnd: function() {
		if (!this.hasNode()) {return;}
		this.setPlaybackRate(1);
		this.node.pause();
		this.node.currentTime = this.node.duration;
		this._prevCommand = "jumpToEnd";
	},
	selectPlaybackRateArray: function(cmd) {
		this._playbackRateArray = this._playbackRateHash[cmd];
	},
	clampPlaybackRate: function(index) {
		if (!this._playbackRateArray) {return;}
		return index % this._playbackRateArray.length;
	},
	selectPlaybackRate: function(index) {
		return this._playbackRateArray[index];
	},
	setPlaybackRate: function(playbackRate) {
		if (this.hasNode()) {
			// Do playbackRate if platform support otherwise try moving currentTime tric
			this.node.playbackRate = this.playbackRate = playbackRate;
		}
	},
	isPaused: function() {
		if (this.hasNode()) {
			return this.node.paused;
		}
		return true;
	},
	
	//* Return current player position in the video (in seconds)
	getCurrentTime: function() {
		if (this.hasNode()) {
			return this.node.currentTime;
		}
		return 0;
	},
	//* Return buffered time ranges
	getBufferedTimeRange: function() {
		if (this.hasNode()) {
			return this.node.buffered;
		}
		return 0;
	},
	//* Set current player position in the video (in seconds)
	setCurrentTime: function(inTime) {
		if ((typeof inTime === 'number') && this.hasNode()) {
			this.node.currentTime = inTime;
		}
	},
	//* Get play duration in the video (in seconds)
	getDuration: function() {
		if (this.hasNode()) {
			return this.node.duration;
		}
		return 0;
	},
	//* When we get the video metadata, update _this.aspectRatio_
	metadataLoaded: function(inSender, inEvent) {
		var node = this.hasNode();
		if (!node || !node.videoWidth || !node.videoHeight) {
			return;
		}
		this.setAspectRatio(node.videoWidth/node.videoHeight+":1");
	},
	decorateTimeUpdate: function(inSender, inEvent) {
		// this.log(inSender, inEvent);
		//TODO - make this work
	},
	//* Add all html5 video events
	hookupVideoEvents: function() {
		enyo.makeBubble(this,
			"loadstart",
			"emptied",
			"canplaythrough",
			"ended",
			"ratechange",
			"progress",
			"stalled",
			"playing",
			"durationchange",
			"volumechange",
			"suspend",
			"loadedmetadata",
			"waiting",
			"timeupdate",
			"abort",
			"loadeddata",
			"seeking",
			"play",
			"error",
			"canplay",
			"seeked",
			"pause"
		);
	}
});

