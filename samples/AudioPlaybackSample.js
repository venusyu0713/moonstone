enyo.kind({
	name: "moon.sample.AudioPlaybackSample",
	classes: "enyo-unselectable moon sample-audio-playback",
	audioFiles: [
		{src: "http://enyojs.com/_media/thunder.mp3", trackName: "Thunder", artistName: "Sound Effects Artist", albumName: "Sound Effects", duration: "0:22", albumSrc: "assets/default-music-sm.png"},
		{src: "http://enyojs.com/_media/engine.mp3", trackName: "Engine", artistName: "Sound Effects Artist", albumName: "Sound Effects", duration: "0:04", albumSrc: "assets/default-music-sm.png"}
	],
	handlers: {
		onPlayIndex: "playIndex"
	},
	components: [
		{kind:"moon.Drawers", drawers:[
			{kind: "moon.AudioPlayback", name: "audioPlayback"}
		],
		components: [
			{kind: "moon.sample.audioPlayback.pageContent"}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.setupAudioTracks();
	},
	setupAudioTracks: function() {
		var a = this.audioFiles;
		var len = a.length;
		for (var i=0; i<len; i++) {
			this.$.audioPlayback.addAudioTrack(a[i]);
		}
	},
	playIndex: function(inSender, inEvent) {
		this.$.audioPlayback.playAtIndex(inEvent.index);
	}
});


enyo.kind({
    name: "moon.sample.audioPlayback.pageContent",
    kind: "moon.Panel",
	classes: "moon",
    title: "Browse Tracks",
    titleAbove: "02",
    titleBelow: "2 Tracks",
    headerComponents: [
		{components: [
			{kind: "moon.IconButton", src: "assets/icon-album.png"},
			{kind: "moon.IconButton", src: "assets/icon-list.png"}
		]}
    ],
    components: [
        {classes: "sample-audio-item", components: [
            {classes: "sample-audio-item-image", style: "background-image: url(assets/default-music.png);", components: [
				{classes: "sample-audio-play-icon", ontap: "playIndex", trackIndex: 0, spotlight: true}
            ]},
			{style: "display: table-cell; width: 20px;"},
            {classes: "sample-audio-item-label", components: [{classes: "sample-audio-item-label-content", content: "Thunder"}]},
            {classes: "sample-audio-item-label", components: [{classes: "sample-audio-item-label-content", content: "Sound Effects"}]},
            {classes: "sample-audio-item-label", components: [{classes: "sample-audio-item-label-content", content: "Album"}]},
            {classes: "sample-audio-item-label-right", content: "0:22"}
        ]},
        {classes: "sample-audio-item", components: [
            {classes: "sample-audio-item-image", style: "background-image: url(assets/default-music.png);", components: [
				{classes: "sample-audio-play-icon", ontap: "playIndex", trackIndex: 1, spotlight: true}
            ]},
			{style: "display: table-cell; width: 20px;"},
            {classes: "sample-audio-item-label", components: [{classes: "sample-audio-item-label-content", content: "Engine"}]},
            {classes: "sample-audio-item-label", components: [{classes: "sample-audio-item-label-content", content: "Sound Effects"}]},
            {classes: "sample-audio-item-label", components: [{classes: "sample-audio-item-label-content", content: "Album"}]},
            {classes: "sample-audio-item-label-right", content: "0:04"}
        ]}
    ],
    playIndex: function(inSender, inEvent) {
		this.bubble("onPlayIndex", {index: inSender.trackIndex});
    }
});
