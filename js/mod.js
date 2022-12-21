let modInfo = {
	name: "The Bad English Tree",
	id: "catfish_badenglish",
	author: "catfish",
	pointsName: "点数",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.5",
	name: "English version",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.0</h3><br>
		- Added things.<br>
		- Added stuff.`

let winText = `Congratulations! You have reached 5 endgames and beaten this game!`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return hasUpgrade("p", 11) && !player.p.paused
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)
	if (player.e.p11_buffed) gain = gain.mul(10)
	if (hasUpgrade("p", 12))
		gain = gain.mul(upgradeEffect("p", 12))
	if (hasUpgrade("p", 13))
		gain = gain.mul(upgradeEffect("p", 13))
	if (hasUpgrade("p", 14))
		gain = gain.mul(upgradeEffect("p", 14))
	if (hasUpgrade("p", 21))
		gain = gain.mul(upgradeEffect("p", 21))

	if (getBuyableAmount("p", 11).gte(1))
		gain = gain.mul(buyableEffect("p", 11))
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
	time_since_start: d(0)
}}

// Display extra things at the top of the page
var displayThings = [
	() => {
		return `This game is best experienced with ZERO KNOWLEDGE OF CHINESE. >v<<br>
			Tranlation tools will ruin the game please don't do that >_<<br><br>
			Current endgame: 5 endgames<br><br>`
	},
	() => {
		return player.p.paused ? translator(["游戏已暂停(按 w 继续)", "Game paused (w to resume)"]) : 
			translator(["按 w 暂停", "Press w to pause"])
	},
	() => {
		return translator([
			`你已经玩了这个游戏${format(player.time_since_start)}秒`,
			`You've been playing this game for ${format(player.time_since_start)}s`,
		])
	}
]

// Determines when the game "ends"
function isEndgame() {
	return player.e.points.gte(5)
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}