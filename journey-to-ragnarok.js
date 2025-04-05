import * as muspelheimr from "./scripts/muspelheimr.js"
import * as unshaped from "./scripts/unshapedRogue.js"

const DEBUG = "[Journey to Ragnarok].[DEBUG] "
const MODULEID = "journey-to-ragnarok"
const CLANS = ["None","Icy Crows","Gjallarhorn","Wolves of the Shadow","Bear Warriors","Odhinn's Eye","Jötunn Sons"]
const RUNES = ['None', 'Fehu', 'Uruz', 'Thurisaz', 'Ansuz', 'Raido', 'Kenaz', 'Gebo', 'Wunjo', 'Hagalaz', 'Nauthiz', 'Isaz', 'Jera', 'Eihwaz', 'Perth', 'Algiz', 'Sowilo', 'Teiwaz', 'Berkana', 'Ehwaz', 'Mannaz', 'Laguz', 'Ingwaz', 'Othila', 'Dagaz']

const PATH = "worlds/jtr/DM%20Data/Icons/"
const CLANPATH = PATH+"Flags/"
const RUNEPATH = PATH+"Runes/"

const CLANJOURNAL = "zlGZnmuLmVXV9Qro"

const DEFAULTFLAG = {
  clan: 0,
  clanImg: "",
  clanText: "",
  rune: 0,
  runeImg: "",
  runeText: ""
}

class RuneJournalPageData extends foundry.abstract.TypeDataModel {
}

class JournalRunePageSheet extends JournalPageSheet{
  get template() {
    return `systems/dnd5e/templates/journal/page-rune-${this.isEditable ? "edit" : "view"}.hbs`;
  }

}

function mingrateActor(actor){
  if(actor[MODULEID] == undefined){
    let flags = actor.flags
    flags[MODULEID] = DEFAULTFLAG
    actor.update({"flags": flags})  
  }
}

function getTemplateData(data) {
  let actor = data.actor
  let jtr = actor.flags[MODULEID]

  if(jtr == undefined){
    mingrateActor(actor)
    jtr = actor.flags[MODULEID]
  }


  data.test = false
  data.jtrClans = CLANS
  data.jtrRunes = RUNES


  data.jtrClan = jtr.clan
  data.jtrClanName = CLANS[jtr.clan]
  data.jtrClanImg = jtr.clanImg
  data.jtrClanText = jtr.clanText

  data.jtrRune = jtr.rune
  data.jtrRuneName = RUNES[jtr.rune]
  data.jtrRuneImg = jtr.runeImg
  data.jtrRuneText = jtr.runeText

  return data
}

async function addRuneTab(app,html,data){
  let tabName = "Journey To Ragnarok"
  let RuneTabBtn = ""
  
  if (app instanceof game.dnd5e.applications.actor.ActorSheet5eCharacter2) {
    RuneTabBtn = $(
        `<a class="item" data-tab="rune" data-group="primary" data-tooltip="${tabName}"><i class="fas fa-bluetooth"></i></a>`,
    );
  } else {
    RuneTabBtn = $('<a class="item" data-tab="rune">' + tabName + "</a>");
  }
  let tabs = html.find('.tabs[data-group="primary"]');
  tabs.append(RuneTabBtn);

  let RuneTabHtml = "";
  let sheet = "";
  let templateData = getTemplateData(data)
  if (app instanceof game.dnd5e.applications.actor.ActorSheet5eCharacter2) {
      sheet = html.find(".tab-body");
      RuneTabHtml = $(
        await renderTemplate(`modules/${MODULEID}/Templates/Character Sheet/runeTab.hbs`, templateData),
      );
  } else {
      sheet = html.find(".sheet-body");
      RuneTabHtml = $(
        await renderTemplate(`modules/${MODULEID}/Templates/Character Sheet/runeTab.hbs`, templateData),
      );
  }
  sheet.append(RuneTabHtml);

  html.find('.tabs .item[data-tab="rune"]').click((ev) => {
    app.activateRuneTab = true;
  });

// Unset Training Tab as Active
  html.find('.tabs .item:not(.tabs .item[data-tab="rune"])').click((ev) => {
    app.activateRuneTab = false;
  });
  
  activateTabListeners(data.actor, app, html, data)
}

function activateTabListeners(actor, app, html, data){
// Selector change - Clan
  html.find(".clan").change(async (event)=>{
    let clan = CLANS[event.target.value]
    let imgSrc = ""

    if(clan != "None"){
      imgSrc = CLANPATH+clan+".png"
    }

    html.find("#ClanFlag").attr("src",imgSrc)

    actor.setFlag(MODULEID, "clan",event.target.value) 
    actor.setFlag(MODULEID, "clanImg",imgSrc)
    actor.setFlag(MODULEID, "clanText", getClanInfo(clan))
  })

  // Selector change - Clan
    html.find("#Rune").change(async (event)=>{
      let rune = RUNES[event.target.value]
      let imgSrc = ""
  
      if(rune != "None"){
        imgSrc = RUNEPATH+rune+".png"
      }
  
      actor.setFlag(MODULEID, "rune",event.target.value) 
      actor.setFlag(MODULEID, "runeImg",imgSrc)
      actor.setFlag(MODULEID, "runeText", getRuneInfo(rune))
    })
}

function getRuneInfo(rune){
  if(rune == "None"){
    return ""
  }
  let RuneText = '<div class="column" style="float: left; width: ||PERCENT||%">'+game.items.getName(rune).system.description.value+'</div>'
  let c = 1
  try {
    RuneText += '<div class="column" style="float: left; width: ||PERCENT||%">'+game.items.getName(rune+"_Reversed").system.description.value+'</div>'
    c+=1
  }
  catch(err){/* Do nothing */}

  let width = 80/c
  RuneText = RuneText.replaceAll("||PERCENT||",width).replaceAll("<h2>","<h3>")

  return RuneText
}

function getClanInfo(clan){
  if(clan == "None"){
    return ""
  }
  let text = game.journal.get(CLANJOURNAL).pages.getName(clan).text.content
  let start = text.search("</h1>")+5
  let end = text.search("<h2>")

  return text.substring(start,end)
}

Hooks.once("init", function(){
  //load book
  CONFIG.DND5E.sourceBooks.JTR = "Journey To Ragnarok"

  //Create new skill
  CONFIG.DND5E.skills.asatru = {
    label: "Asatru",
    ability: "wis",
    fullKey: "asatru", // Full key used in enrichers
    //reference: "Compendium.world.journey-to-ragnarok-journals.JournalEntry.1LkenKskDv7Pk70l.JournalEntryPage.AN1wEK3YJ1oD0xxe", // UUID of journal entry page for rich tooltips
    icon: "" // Icon used in favorites on new character sheet
  };

  //load configuration for the unshaped rogue
  unshaped.configLoad()

  //Load Rune Journal page
  CONFIG.JournalEntryPage.typeLabels.rune = "TYPES.JournalEntryPage.rune"
  CONFIG.JournalEntryPage.sheetClasses.rune = JournalRunePageSheet
  CONFIG.JournalEntryPage.dataModels = RuneJournalPageData
})

Hooks.on("dnd5e.computeUnshapedProgression", unshaped.computeUnshapedProgression);
Hooks.on("dnd5e.prepareUnshapedSlots", unshaped.prepareUnshapedSlots);
Hooks.on("dnd5e.buildUnshapedSpellcastingTable", unshaped.buildSpellcastingTable);

  // Muspellheimr tiles
Hooks.on("ready", function(){
  console.log("[RUNNING] Journey to Ragnarok")

  //check to make sure actors have flags
  game.actors.filter(x => !x.flags[MODULEID]).forEach(a => mingrateActor(a))

 //set up API
  game.modules.get("journey-to-ragnarok").API ={
      MuspellsheimrLocs: muspelheimr.recreateMusLocs(),
      resetZones: muspelheimr.resetZones,
      moveZones: muspelheimr.moveZones,
      NextLoc: muspelheimr.NextLoc,
      saveState: muspelheimr.saveState
    }
})

Hooks.on("renderActorSheet", (app, html, data) => {
  addRuneTab(app, html, data).then(function () {
    if (app.activateRuneTab) {
        app._tabs[0].activate("rune");
    }
  });
})

