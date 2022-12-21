
function translator(text_array) {
    let t = tmp.p.translateLvl
    t = Math.min(t, text_array.length-1)
    return text_array[t]
}

function d(n) {
    return new Decimal(n)
}

function isPrime(n) {
    for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i == 0) return false
    }
    return true
}


addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: () => translator(["点", "P"]), // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        cur_best: new Decimal(0),
        paused: false,
        p12_buffed: false,
        row2_unlocked: false,
        row2_list: [],
        row3_solved: false,
        p31_unlocked: false
    }},
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: () => translator(["重置点", "prestige points"]), // Name of prestige currency
    baseResource: () => translator(["点数", "points"]), // Name of resource prestige is based on
    baseAmount() {
        return player.points
    }, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        
        if (hasUpgrade("p", 15))
            mult = mult.mul(upgradeEffect("p", 15))
        if (hasUpgrade("p", 22))
            mult = mult.mul(upgradeEffect("p", 22))

        if (getBuyableAmount("p", 12).gte(1))
            mult = mult.mul(buyableEffect("p", 12))

        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = d(1)
        if (hasUpgrade("p", 23)) {
            exp = exp.mul(upgradeEffect("p", 23))
        }
        return new Decimal(1)
    },
    translateLvl() {
        return player.e.translate_lvl
    },

    resetDescription() {
        return translator(["重置获得 ", "Reset for "])
    },

    nextAtDescription() {
        return translator(["下一个在 ", "Next at "])
    },

    youHaveDescription() {
        return translator(["你有 ", "You have "])
    },
    costDescription() {
        return translator(["价格 ", "Cost "])
    },

    currentlyDescription() {
        return translator(["现在:", "Currently:"])
    },

    row2Correct() {
        return player.p.row2_list[0] == 23 && player.p.row2_list[1] == 22 && player.p.row2_list[2] == 24 && player.p.row2_list[3] == 21
    },

    row3Correct() {
        let n1 = getBuyableAmount("p", 11).toNumber()
        let n2 = getBuyableAmount("p", 12).toNumber()
        if (n1.toString().length != 3 || n2.toString().length != 3) return false
        if (n1[0] != n2[2] && n1[1] != n2[1] && n1[2] != n2[0]) return false
        return isPrime(n1) && isPrime(n2)
    },

    upgrades: {
        11: {
            title: () => translator(["开始", "Start"]),
            description: () => {
                let text = [
                    "开始生产点数，如果你一分钟内在设置里切换十次高质量树，这个产量永久成为十倍",
                    "Start 生产 point ，如果你 one 分钟内在设置里切换 ten 次高质量 tree，this 产量永久成为 ten 倍",
                    "Start grow points, if you one minute in at place cut ten times high mass tree, this production forever becomes ten times",
                    "Start generating points, if you switch High-Quality Tree option ten times within one minute, this production is permenantly ten times better"
                ]
                return translator(text)
            },
            cost: d(1),
        },

        12: {
            title: () => translator(["加成", "Boost"]),
            description: () => {
                let text = [
                    "本次重置最高重置点加成点数，如果在游戏暂停时购买这个升级，它的效果会x4",
                    "本次重置 best prestige point 加成 point, 如果在 game paused 时 purchase this 升级, 它的 effect 会 x4",
                    "This reset best prestige points boost points, if game paused when purchase this upgrade, its effect will x4",
                    "Best prestige points in this reset boost points, if you purchase this upgrade while the game is paused, its effect x4."
                ] // But will be better if pressed w
                return translator(text)
            },
            effect: () => {
                let eff = player.p.cur_best.mul(2).add(2).sqrt()
                if (player.p.p12_buffed) eff = eff.mul(4)
                return eff
            },
            onPurchase: () => {
                if (player.p.paused) {
                    player.p.p12_buffed = true
                }
            },
            effectDisplay: () => {
                return `x${format(upgradeEffect("p", 12))}` 
            },
            cost: d(2),
            unlocked: () => hasUpgrade("p", 11)
        },

        13: {
            title: () => translator(["加成 2", "Boost 2"]),
            description: () => {
                let text = [
                    "点数加成点数",
                    "Point 加成 point",
                    "Points boost points",
                    "Points boost points"
                ]
                return translator(text)
            },
            effect: () => {
                return player.points.add(4).log(4)
            },
            effectDisplay: () => {
                return `x${format(upgradeEffect("p", 13))}` 
            },
            cost: d(6),
            unlocked: () => hasUpgrade("p", 12)
        },

        14: {
            title: () => translator(["升级", "Upgrades"]),
            description: () => {
                let text = [
                    "你购买的升级数量加成点数，但是 加成 2 这个升级算做负七个",
                    "你 purchased 的升级数量加成 point, 但是 Boost 2 这个升级 count as negative seven 个",
                    "Your purchased upgrade amount boost point, but Boost 2 this upgrade count as negative seven",
                    "The amount of upgrades purchased boost point, but Boost 2 counts as -7"
                ]
                return translator(text)
            },
            effect: () => {
                let n = player.p.upgrades.length
                if (hasUpgrade("p", 13)) n -= 6
                return d(n).add(4).pow(2)
            },
            effectDisplay: () => {
                return hasUpgrade("p", 14) ? `x${format(upgradeEffect("p", 14))}` : "???"
            },
            cost: d(15),
            unlocked: () => hasUpgrade("p", 12)
        },

        15: {
            title: () => translator(["产能", "Production"]),
            description: () => {
                let text = [
                    "直接加成重置点获取，购买这个，你将无法看到第二行升级。别着急，它们会在100,000点数时解锁",
                    "直接加成 prestige point 获取，但是你将 can't 看到 second row 升级。别着急，它们会在 100,000 points 时 unlock",
                    "Straight boost prestige point gain, but you will can't see second row upgrades. Do not worry, they will at 100,000 points when unlock.",
                    "Directly boost prestige points, but the second row of upgrades will be hidden. Don't worry, they will unlock at 100,000 points."
                ] // But row 2 will be locked
                return translator(text)
            },
            effect: () => {
                return d(10)
            },
            effectDisplay: () => {
                return `x${format(upgradeEffect("p", 15))}`
            },
            cost: d(60),
            unlocked: () => hasUpgrade("p", 14)
        },

        21: {
            title: () => translator(["突破限制 A", "Limit break A"]),
            description: () => {
                let text = [
                    "加成点数<br><br>请最后购买这个",
                    "加成 point <br><br>请最后 purchase 这个",
                    "Boost point <br><br> Please finally purchase this",
                    "Boost points <br><br> Please purchase this as the last one."
                ]
                return translator(text)
            },
            effect: () => {
                return player.p.points.add(2).log(2)
            },
            effectDisplay: () => {
                return `x${format(upgradeEffect("p", 21))}`
            },
            cost: d(400),
            unlocked: () => !hasUpgrade("p", 15) && player.p.row2_unlocked,
            onPurchase() { player.p.row2_list.push(21) }
        },
        
        22: {
            title: () => translator(["突破限制 B", "Limit break B"]),
            description: () => {
                let text = [
                    "加成重置点<br><br>应该什么时候购买呢？",
                    "加成 prestige point <br><br>应该什么时候 purchase 呢？",
                    "Boost prestige point <br><br> When should purchase?",
                    "Boost prestige points <br><br> When should this be purchased?"
                ]
                return translator(text)
            },
            effect: () => {
                return player.points.add(2).log(2)
            },
            effectDisplay: () => {
                return `x${format(upgradeEffect("p", 22))}`
            },
            cost: d(500),
            unlocked: () => !hasUpgrade("p", 15) && player.p.row2_unlocked,
            onPurchase() { player.p.row2_list.push(22) }
        },

        23: {
            title: () => translator(["突破限制 C", "Limit break C"]),
            description: () => {
                let text = [
                    "提升重置点指数<br><br>请首先购买我，然后接着买我左边的那个升级",
                    "提升 prestige point 指数<br><br>请首先 purchase 我，然后接着买我左边的那个升级",
                    "Raise prestige point exponent<br><br> Please first purchase me, and then buy my left that upgrade",
                    "Raise prestige points exponent<br><br> Please purchase me first, and then buy the upgrade on my left"
                ] 
                return translator(text)
            },
            effect: () => {
                return d(1.1)
            },
            effectDisplay: () => {
                return `^${format(upgradeEffect("p", 23))}`
            },
            cost: d(700),
            unlocked: () => !hasUpgrade("p", 15) && player.p.row2_unlocked,
            onPurchase() { player.p.row2_list.push(23) }
        },

        
        24: {
            title: () => translator(["突破限制 D", "Limit break D"]),
            description: () => {
                let text = [
                    "这个升级加成效果是假的<br><br>什么时候购买我，可以由此行别的升级判断出来",
                    "这个升级加成效果是假的<br><br>什么时候 purchase 我，可以由此行别的升级判断出来",
                    "This upgrade boost effect is fake<br><br> When to purchase me, can be this row other upgrades decided",
                    "The effect of this upgrade is fake<br><br> The timing for purchasing me can be decided by other upgrades in this row"
                ] 
                return translator(text)
            },
            effect: () => {
                return d(1.75)
            },
            effectDisplay: () => {
                return `^${format(upgradeEffect("p", 24))}`
            },
            cost: d(900),
            unlocked: () => !hasUpgrade("p", 15) && player.p.row2_unlocked,
            onPurchase() { player.p.row2_list.push(24) }
        },

        31: {
            title: "TIME TO FINISH THIS",
            description: () => {
                return `ALLOWS BUY MAX FOR ENDGAME LAYER`
            },
            cost: d("1e19"),
            unlocked: () => player.p.p31_unlocked
        }
    },

    buyables: {
        11: {
            cost(x) { return new Decimal(1).mul(x) },
            display() { 
                let helper = [
                    "当这两个可购买项等级都是三位数的质数，且右边购买项的等级数是这个购买项等级从右到左写的结果时，就会有奇妙的事情发生。",
                    "当这两个可购买项等级都是三位数的质数，且右边购买项的等级数是这个购买项等级从右到左写的结果时，就会有奇妙的事情发生。",
                    "When this two buyable level all are three place number of mass number, and the right buyable level is this buyable level right to left write result, will be strange things happen.",
                    "When the level of these two buyables are all 3-digit prime numbers, and the level of the right buyable is the level of this buyable written backwards, something amazing will happen."
                ]

                let lvl = [
                    "目前等级:", 
                    "目前等级:", 
                    "Current level:",
                    "Current level:"
                ]

                let eff = [
                    "效果: 提升点数获取 x",
                    "效果: 提升 point 获取 x",
                    "Effect: boost point gain x",
                    "Effect: points gain x",
                ]

                return `
                    ${translator(helper)}<br>
                    ${translator(lvl)} ${formatWhole(getBuyableAmount("p", 11))}
                    ${translator(eff)}${format(buyableEffect("p", 11))}
                `
            },
            effect() {
                let buff = player.time_since_start.gte(60) ? d(1) : player.time_since_start.pow(1.6)
                return getBuyableAmount("p", 11).add(1).pow(0.75).mul(buff)
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked: () => tmp.p.row2Correct
        },
        12: {
            cost(x) { return new Decimal(1).mul(x) },
            display() { 
                let helper = [
                    "当这两个可购买项等级都是三位数的质数，且左边购买项的等级数是这个购买项等级从右到左写的结果时，就会有奇妙的事情发生。",
                    "当这两个可购买项等级都是三位数的质数，且左边购买项的等级数是这个购买项等级从右到左写的结果时，就会有奇妙的事情发生。",
                    "When this two buyable level all are three place number of mass number, and the left buyable level is this buyable level right to left write result, will be strange things happen.",
                    "When the level of these two buyables are all 3-digit prime numbers, and the level of the right buyable is the level of this buyable written backwards, something amazing will happen."
                ]

                let lvl = [
                    "目前等级:", 
                    "目前等级:", 
                    "Current level:",
                    "Current level:"
                ]

                let eff = [
                    "效果: 提升重置点获取 x",
                    "效果: 提升 prestige point 获取 x",
                    "Effect: boost prestige point gain x",
                    "Effect: prestige points gain x",
                ]

                return `
                    ${translator(helper)}<br>
                    ${translator(lvl)} ${formatWhole(getBuyableAmount("p", 12))}
                    ${translator(eff)}${format(buyableEffect("p", 12))}
                `
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            effect() {
                let buff = player.time_since_start.gte(60) ? d(1) : player.time_since_start.pow(1.5)
                return getBuyableAmount("p", 12).add(1).pow(0.75).mul(buff)
            },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked: () => tmp.p.row2Correct
        },
    },

    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        {key: "w", description: "W: pause / unpause", onPress(){player.p.paused = !player.p.paused}}
    ],
    update(diff) {
        player.p.cur_best = player.p.cur_best.max(player.p.points)
        if (player.points.gte(100000)) {
            player.p.row2_unlocked = true
        }

        if (tmp.p.row3Correct) {
            player.p.row3_solved = true
        }

        if (!player.p.paused && player.p.row3_solved) {
            buyBuyable("p", 11)
            buyBuyable("p", 12)
        }

        if (!player.p.paused) {
            player.time_since_start = player.time_since_start.add(diff)
        }

        if (player.time_since_start.lte(60) && player.p.row3_solved) {
            player.p.p31_unlocked = true
        }
    },

    passiveGeneration: () => {
        if (player.p.paused) return d(0)
        return player.p.row3_solved ? d(1) : d(0)
    },
    layerShown(){return true}
})

var translation_desc = [
    "No translation at all",
    "Translated partly",
    "Very translated!",
    "Fully translated",
    "Translated (including the changelog)"
]

addLayer("e", {
    name: "endgame",
    symbol: () => translator(["终", "E"]),
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        translate_lvl: 0,
        p11_buffed: false,
    }},
    color: "#ccc",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "endgame", // Name of prestige currency
    baseResource: () => translator(["点数", "points"]), // Name of resource prestige is based on
    baseAmount() {
        return player.points
    }, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    requires: 100000,
    base: 20000,
    exponent: 1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },

    pointsName: () => translator(["点数", "points"]),

    resetDescription() {
        return translator(["重置获得 ", "Reset for "])
    },

    reqDescription() {
        return translator(["需要:", "Req:"])
    },

    youHaveDescription() {
        return translator(["你有 ", "You have "])
    },
    costDescription() {
        return translator(["价格 ", "Cost "])
    },

    milestones: {
        0: {
            requirementDescription: "1 Endgame",
            effectDescription: "0/10 Okay I've played through it, but can you at least translate your game into English?",
            done: () => player.e.points.gte(1),
            unlocked: () => hasMilestone("e", 0)
        },
        
        1: {
            requirementDescription: "2 Endgames",
            effectDescription: "3/10 Only several words are translated. Can't you try just a little bit harder?",
            done: () => player.e.points.gte(2),
            unlocked: () => hasMilestone("e", 1)
        },
        
        2: {
            requirementDescription: "3 Endgames",
            effectDescription: "1/10 The translation makes no sense at all. Even Google / DeepL could do better than that.",
            done: () => player.e.points.gte(3),
            unlocked: () => hasMilestone("e", 2)
        },

        3: {
            requirementDescription: "4 Endgames",
            effectDescription: "7/10 It's basically fine now, but can you translate the changelog so I could read it? ",
            done: () => player.e.points.gte(4),
            unlocked: () => hasMilestone("e", 3)
        },
    },

    clickables: {
        11: {
            title: "SWITCH TRANSLATION LEVEL",
            display: () => {
                let max_lvl = player.e.points.min(4).toNumber()
                return `Switch between translation level.<br>
                    Currently ${player.e.translate_lvl} / ${max_lvl}:<br>
                    ${translation_desc[player.e.translate_lvl]}`
            },
            
            style: {
                "width": "150px",
                "height": "150px",
                "margin-bottom": "30px"
            },

            canClick: () => player.e.points.gte(1),
            onClick: () => {
                let max_lvl = player.e.points.min(4)
                player.e.translate_lvl = player.e.translate_lvl + 1
                if (max_lvl.lt(player.e.translate_lvl)) {
                    player.e.translate_lvl = 0
                }
            },
            unlocked: () => player.e.points.gte(1)
        },
        21: {
            title: "DO A HARD RESET",
            display: () => {
                return `Reset the previous layer.<br><br>
                <div style='color:red'>This does not boost anything, but feel free to click this when you get stuck!</div>`
            },
            style: {
                "width": "200px",
                "height": "200px"
            },
            canClick: () => player.e.points.gte(1),
            onClick: () => {
                doReset("e", true)
            },
            unlocked: () => player.e.points.gte(1)
        },
    },

    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        {key: "w", description: "W: pause / unpause", onPress(){player.p.paused = !player.p.paused}}
    ],
    layerShown(){
        return player.p.best.gte(60) || player.e.points.gte(1)
    },

    doReset() {
        player.e.translate_lvl = player.e.points.toNumber()
        player.p.row2_list = []
    },

    changelog: () => {
        let cn_text = `<h1>更新日志:</h1><br>
        
        <h3>v0.5</h3><br>
            - 对了，为了鼓励速通（有人会速通这玩意吗），给可购买项加了一个和总游戏时间相关的加成。<br>
            - 不过，要吃到这个加成，就得非常快地一次成功才行。<br>
            - 如果有兴趣的话就试试吧，这次是真正的从头开始。<br>
            <br>

        <h3>v0.4</h3><br>
            - 有人说买可购买项还有点重置太累了，我加了一堆自动化，这下应该没问题了。<br>
            - 还是基本没什么内容。<br>
            <br>
        <h3>v0.3</h3><br>
            - 又写了两个可购买，还是基本没什么内容。<br>
            - 这树也太水了，但是不知道怎么做好<br>
            <br>
        <h3>v0.2</h3><br>
            - 又写了一行升级，还是基本没什么内容。<br>
            - 光写了这么两行升级就绞尽脑汁了，我是不是智障<br>
            <br>
        <h3>v0.1</h3><br>
            - 写了一行升级，基本没什么内容。<br>`

        let en_text = `<h1>Changelog:</h1><br>
        
        <h3>v0.5</h3><br>
            - To encourage a speedrun (idk who would want to speedrun this thing), I added a huge boost to the buyables that based on total time played.  <br>
            - However, if you want this boost, you have to make it really fast, and in one shot. <br>
            - If you are interested, just have a try. But remember to start FROM THE VERY, VERY BEGINNING.
            <br>
            <br>

        <h3>v0.4</h3><br>
            - Someone said it's tiring to buying those buyables and doing prestige point resets. So I added a whole bunch of QoLs and everything is totally fine. <br>
            - Not much content rn. <br>
            <br>
        <h3>v0.3</h3><br>
            - Added two buyables. Still not much content rn. <br>
            - This tree is sooo bad but I don't know how to improve<br>
            <br>
        <h3>v0.2</h3><br>
            - Added another row of upgrades, still not much content rn. <br>
            - Two rows of upgrades have used up all my braincells am I brainded<br>
            <br>
        <h3>v0.1</h3><br>
            - Added a row of upgrades, not much content rn.<br>`

        return tmp.p.translateLvl >= 4 ? en_text : cn_text
    },

    canBuyMax: () => hasUpgrade("p", 31),

    branches: ["p"]
})