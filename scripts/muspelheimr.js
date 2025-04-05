const MODULEID = "journey-to-ragnarok"

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

export function NextLoc(x, moveBy){
    var MusLocs= game.modules.get("journey-to-ragnarok").API.MuspellsheimrLocs
    var NextZone = x.zoneID+moveBy

    if(NextZone>=MusLocs.length)
    {
        NextZone = NextZone-MusLocs.length+1
    }
    
    //console.log(DEBUG, x.CurrTile, NextZone)
    return {
      x: MusLocs[NextZone.toString()].x,
      y: MusLocs[NextZone.toString()].y,
      next: NextZone.toString()}
}

export async function moveZones()
{
var MusLocs= game.modules.get("journey-to-ragnarok").API.MuspellsheimrLocs

MusLocs.forEach(z=>{    
    if(z.zoneID == 0){return}
    
    var tile = game.scenes.getName("Muspellsheimr").tiles.get(z.CurrTileID)
    var dest = NextLoc(MusLocs[z.zoneID],1)
    
    tile.update({"rotation":tile.rotation+60, "x":dest.x,"y":dest.y})
    MusLocs[dest.next].nextNum = z.CurrTile
    MusLocs[dest.next].nextID = z.CurrTileID
})

await sleep(100)

MusLocs.forEach(t=>{
    if(t.zoneID == 0){return}
    
    t.CurrTile=t.nextNum
    t.nextNum = -1

    t.CurrTileID=t.nextID
    t.nextID = "-1"
})

game.modules.get("journey-to-ragnarok").API.MuspellsheimrLocs = MusLocs
//console.log("[DEBUG] ",MusLocs)
}

export async function resetZones()
{
//var prev =  game.modules.get("journey-to-ragnarok").API.MuspellsheimrLocs
game.scenes.getName("Muspellsheimr").tiles.forEach(x=>{
    x.update({"rotation": 0, "x": x.flags[MODULEID].origX,"y": x.flags[MODULEID].origY})
})
await sleep(100)
game.modules.get("journey-to-ragnarok").API.MuspellsheimrLocs= recreateMusLocs()
//console.log(DEBUG, prev, game.modules.get("journey-to-ragnarok").API.MuspellsheimrLocs, recreateMusLocs())
}

export async function saveState()
{    
game.scenes.getName("Muspellsheimr").tiles.forEach(x=>{
    //var phoo = "flags."+MODULEID
    x.update({"flags.journey-to-ragnarok": {"origX": x.x, "origY":x.y}})
})

await sleep(100)
game.modules.get("journey-to-ragnarok").API.MuspellsheimrLocs= recreateMusLocs()
}

export function recreateMusLocs()
{
var MusLocs = []

game.scenes.getName("Muspellsheimr").tiles.forEach(x=>{
    var zone = x.texture.src.replace("worlds/jtr/DM%20Data/World%20Maps/Muspellsheimr/Tiles/Zone","").replace(".png","") 
    MusLocs[zone] = {
    x: x.x, 
    y: x.y, 
    z: x.z, 
    zoneID: parseInt(zone), 
    CurrTile: parseInt(zone),
    
    CurrTileID: x._id,
    
    nextNum: -1,
    nextID: "-1"
    }
    
})

return MusLocs
}  
