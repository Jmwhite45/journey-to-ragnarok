export function configLoad()
{
      //Load spellcasting for rogue
      CONFIG.DND5E.unshapedCastingProgression = {
        1: {slots: 0, level: 0},
        3: {slots: 1, level: 1},
        9: {slots: 2, level: 2},
        13: {slots: 3, level: 3},
        17: {slots: 4, level: 4}
      }
      CONFIG.DND5E.spellProgression.unshaped = "Way of the Trickster"
      CONFIG.DND5E.spellcastingTypes.unshaped = {
        label: 'Way of the Trickster',
        img: "icons/magic/perception/silhouette-stealth-shadow.webp",
        shortRest: true
      }
    
      CONFIG.DND5E.spellPreparationModes.unshaped={
        label: "Way of the Trickster",
        upcast: true,
        cantrips: true,
        order: 0.74
      }
}

export function computeUnshapedProgression(progression, actor, cls, spellcasting, count) {
  progression.unshaped ??= 0;
  progression.unshaped += spellcasting.levels;

  //console.log(DEBUG, progression,spellcasting)
}

export function prepareUnshapedSlots(spells, actor, progression) {
  const table = CONFIG.DND5E.unshapedCastingProgression;
  //console.log(DEBUG,{spells, actor, progression,type: "unshaped", table})
  Actor.implementation.prepareAltSlots(spells, actor, progression, "unshaped", table);
}

export function buildSpellcastingTable(table, item, spellcasting) {
  const spells = {unshaped: {}};
  table.headers = [[
    {content: game.i18n.localize("JOURNALENTRYPAGE.DND5E.Class.SpellSlots")},
    {content: game.i18n.localize("JOURNALENTRYPAGE.DND5E.Class.SpellSlotLevel")}
  ]];
  table.cols = [{class: "spellcasting", span: 2}];

  // Loop through each level, gathering "Spell Slots" & "Slot Level" for each one
  for (const level of Array.fromRange(CONFIG.DND5E.maxLevel, 1)) {
    const progression = {unshaped: 0};
    spellcasting.levels = level;
    Actor.implementation.computeClassProgression(progression, item, {spellcasting});
    Actor.implementation.prepareSpellcastingSlots(spells, "unshaped", progression);
    table.rows.push([
      {class: "spell-slots", content: `${spells.unshaped.max}`},
      {class: "slot-level", content: spells.unshaped.level.ordinalString()}
    ]);
  }
}
