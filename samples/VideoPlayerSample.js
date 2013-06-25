
enyo.kind({
	name: "moon.sample.VideoPlayerSample",
	classes: "enyo-fit enyo-unselectable moon moon-video-player-sample",
	fit: true,
	components: [
		{kind: "enyo.Spotlight"},
		{name: "player", kind: "moon.VideoPlayer",
			sourceComponents: [
				{src: "http://media.w3.org/2010/05/sintel/trailer.mp4",  type: "video/mp4"},
				{src: "http://media.w3.org/2010/05/sintel/trailer.webm", type: "video/webm"},
				{src: "http://media.w3.org/2010/05/sintel/trailer.ogv",  type: "video/ogg"}
			],
			infoComponents: [
				{classes: "moon-video-player-description-info", components: [
					{name: "videoDateTime", classes: "moon-header-font moon-videoplayer-info-datetime", content: new Date()},
					{name: "videoTitle", classes: "moon-header-font moon-video-player-info-showname", content: "Big Buck Bunny"},
					{name: "videoChannel", classes: "moon-video-player-info-channel", content: "Channel Name"},
					{name: "videoDescription", classes: "moon-video-player-info-description", content: "Description of the current show"}
				]},
				{classes: "moon-video-player-settings-info", components: [
					{content: "SUB ENGLISH", classes: "moon-video-player-info-icon"},
					{content: "CINEMA", classes: "moon-video-player-info-icon"},
					{content: "3D", classes: "moon-video-player-info-icon"},
					{content: "REC 00:00", classes: "moon-video-player-info-icon moon-video-player-info-redicon"}
				]}
			],
			components: [
				{kind: "moon.IconButton", src: "$lib/moonstone/images/icon-placeholder.png"},
				{kind: "moon.IconButton", src: "$lib/moonstone/images/icon-placeholder.png"},
				{kind: "moon.IconButton", src: "$lib/moonstone/images/icon-placeholder.png"},
				{kind: "moon.IconButton", src: "$lib/moonstone/images/icon-placeholder.png"},
				{kind: "moon.IconButton", src: "$lib/moonstone/images/icon-placeholder.png"},
				{kind: "moon.IconButton", src: "$lib/moonstone/images/icon-placeholder.png"},
				{kind: "moon.IconButton", src: "$lib/moonstone/images/icon-placeholder.png"},
				{kind: "moon.IconButton", src: "$lib/moonstone/images/icon-placeholder.png"},
				{kind: "moon.IconButton", src: "$lib/moonstone/images/icon-placeholder.png"},
				{kind: "moon.IconButton", src: "$lib/moonstone/images/icon-placeholder.png"}
			]
		}]
	}
);
