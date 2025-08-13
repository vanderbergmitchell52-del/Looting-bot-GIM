// index.js
const fs = require('fs');
const fsp = fs.promises;
const {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
  REST,
  Routes,
} = require('discord.js');

// === CONFIG ===
const TOKEN     = "MTQwNDgyODAyMDg1Mzk2OTA3Nw.GejJku.pVCbZtx0AOQRHp5_maLa_Fv5_zrK5jHP5-JLZs";        // <-- jouw bot token
const CLIENT_ID = "1404828020853969077";             // Application ID
const GUILD_ID  = "1354917107048911059";        // <-- jouw server ID
const DATA_FILE = 'counts.json';

// === THUMBNAILS ===
const THUMBS = {
  dks: "https://oldschool.runescape.wiki/images/Pet_dagannoth_prime.png?e2d9b",
  barrows_ahrim:  "https://oldschool.runescape.wiki/images/thumb/Ahrim_the_Blighted.png/45px-Ahrim_the_Blighted.png?33092",
  barrows_dharok: "https://oldschool.runescape.wiki/images/thumb/Dharok_the_Wretched.png/45px-Dharok_the_Wretched.png?33092",
  barrows_guthan: "https://oldschool.runescape.wiki/images/thumb/Guthan_the_Infested.png/37px-Guthan_the_Infested.png?33092",
  barrows_karil:  "https://oldschool.runescape.wiki/images/thumb/Karil_the_Tainted.png/67px-Karil_the_Tainted.png?33092",
  barrows_torag:  "https://oldschool.runescape.wiki/images/thumb/Torag_the_Corrupted.png/58px-Torag_the_Corrupted.png?33092",
  barrows_verac:  "https://oldschool.runescape.wiki/images/thumb/Verac_the_Defiled.png/50px-Verac_the_Defiled.png?33092",
};

// === PRESETS ===
// DKS
const DKS = {
  key: "dks",
  label: "Dagannoth Kings",
  items: [
    { name: "Berserker Ring", emoji: "<:Berserker_ring:1404814556768763974>", goal: 3 },
    { name: "Warrior Ring",   emoji: "<:Warrior_ring:1404814562041270314>",   goal: 3 },
    { name: "Archers Ring",   emoji: "<:Archers_ring:1404814555162480763>",   goal: 3 },
    { name: "Seers Ring",     emoji: "<:Seers_ring:1404814560484917260>",     goal: 3 },
    { name: "Dragon Axe",     emoji: "<:Dragon_axe:1404814559151390740>",     goal: 3 },
  ],
};

// Barrows (volgorde: HELM, BODY, LEGS, WPN)
const BARROWS_AHRIM = {
  key: "barrows_ahrim",
  label: "Barrows — Ahrim",
  items: [
    { name: "Ahrim's Hood",      emoji: "<:Ahrims_hood:1404814651669086361>",      goal: 3 },
    { name: "Ahrim's Robetop",   emoji: "<:Ahrims_robetop:1404814656031162368>",   goal: 3 },
    { name: "Ahrim's Robeskirt", emoji: "<:Ahrims_robeskirt:1404814654651502693>", goal: 3 },
    { name: "Ahrim's Staff",     emoji: "<:Ahrims_staff:1404814657599967292>",     goal: 3 },
  ],
};
const BARROWS_DHAROK = {
  key: "barrows_dharok",
  label: "Barrows — Dharok",
  items: [
    { name: "Dharok's Helm",      emoji: "<:Dharoks_helm:1404814660947021845>",     goal: 3 },
    { name: "Dharok's Platebody", emoji: "<:Dharoks_platebody:1404814663442759831>",goal: 3 },
    { name: "Dharok's Platelegs", emoji: "<:Dharoks_platelegs:1404814665061634128>",goal: 3 },
    { name: "Dharok's Greataxe",  emoji: "<:Dharoks_greataxe:1404814659235872779>", goal: 3 },
  ],
};
const BARROWS_GUTHAN = {
  key: "barrows_guthan",
  label: "Barrows — Guthan",
  items: [
    { name: "Guthan's Helm",       emoji: "<:Guthans_helm:1404814668635050155>",       goal: 3 },
    { name: "Guthan's Platebody",  emoji: "<:Guthans_platebody:1404814670195458078>",  goal: 3 },
    { name: "Guthan's Chainskirt", emoji: "<:Guthans_chainskirt:1404814666810654780>", goal: 3 },
    { name: "Guthan's Warspear",   emoji: "<:Guthans_warspear:1404814810452852736>",   goal: 3 },
  ],
};
const BARROWS_KARIL = {
  key: "barrows_karil",
  label: "Barrows — Karil",
  items: [
    { name: "Karil's Coif",         emoji: "<:Karils_coif:1404814673978720409>",        goal: 3 },
    { name: "Karil's Leathertop",   emoji: "<:Karils_leathertop:1404814855256408064>",  goal: 3 },
    { name: "Karil's Leatherskirt", emoji: "<:Karils_leatherskirt:1404814677372047532>",goal: 3 },
    { name: "Karil's Crossbow",     emoji: "<:Karils_crossbow:1404814914031325306>",    goal: 3 },
  ],
};
const BARROWS_TORAG = {
  key: "barrows_torag",
  label: "Barrows — Torag",
  items: [
    { name: "Torag's Helm",      emoji: "<:Torags_helm:1404894067749294151>",       goal: 3 },
    { name: "Torag's Platebody", emoji: "<:Torags_platebody:1404814684632256522>",  goal: 3 },
    { name: "Torag's Platelegs", emoji: "<:Torags_platelegs:1404894069313896691>",  goal: 3 },
    { name: "Torag's Hammers",   emoji: "<:Torags_hammers:1404814681138532424>",    goal: 3 },
  ],
};
const BARROWS_VERAC = {
  key: "barrows_verac",
  label: "Barrows — Verac",
  items: [
    { name: "Verac's Helm",       emoji: "<:Veracs_helm:1404814980926275637>",      goal: 3 },
    { name: "Verac's Brassard",   emoji: "<:Veracs_brassard:1404814688138825858>",  goal: 3 },
    { name: "Verac's Plateskirt", emoji: "<:Veracs_plateskirt:1404814695688306690>",goal: 3 },
    { name: "Verac's Flail",      emoji: "<:Veracs_flail:1404814690814529646>",     goal: 3 },
  ],
};

const BARROWS_SETS = [
  BARROWS_AHRIM,
  BARROWS_DHAROK,
  BARROWS_GUTHAN,
  BARROWS_KARIL,
  BARROWS_TORAG,
  BARROWS_VERAC,
];

// === Opslag ===
let stateByPreset = {}; // { key: { counts: { idx:number } } }

function ensurePresetInit(key, len) {
  if (!stateByPreset[key]) stateByPreset[key] = { counts: {} };
  for (let i = 0; i < len; i++) {
    if (typeof stateByPreset[key].counts[i] !== 'number') {
      stateByPreset[key].counts[i] = 0;
    }
  }
}
function saveStateFireAndForget() {
  // schrijf async zonder de interactie te blokkeren
  fsp.writeFile(DATA_FILE, JSON.stringify(stateByPreset, null, 2), 'utf8')
     .catch(err => console.error("Opslag fout:", err));
}
function loadState() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      stateByPreset = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {
    console.error("Kon counts.json niet lezen — start met leeg bestand. Fout:", e.message);
    stateByPreset = {};
  }
  ensurePresetInit(DKS.key, DKS.items.length);
  BARROWS_SETS.forEach(s => ensurePresetInit(s.key, s.items.length));
}

// === Client ===
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel],
});

// === UI ===
function lineForItem(item, count) {
  return `${item.emoji} **${item.name}** — **${count}/${item.goal}**${count >= item.goal ? " ✅" : ""}`;
}
function buildSetEmbed(key, label, items) {
  const st = stateByPreset[key] || { counts: {} };
  const desc = items.map((it, i) => lineForItem(it, st.counts[i] || 0)).join("\n");
  const thumb = THUMBS[key] ? { url: THUMBS[key] } : undefined;
  return {
    embeds: [{
      title: label,
      description: desc || "_Nog geen progress._",
      color: 0x2b2d31,
      thumbnail: thumb,
      footer: { text: "Doel: 3x per item" },
      timestamp: new Date().toISOString(),
    }]
  };
}
function buildButtonsForSet(key, items) {
  const plusRow = new ActionRowBuilder().addComponents(
    items.map((it, i) => new ButtonBuilder()
      .setCustomId(`${key}_plus_${i}`)
      .setEmoji(it.emoji)
      .setLabel("+")
      .setStyle(ButtonStyle.Secondary))
  );
  const minusRow = new ActionRowBuilder().addComponents(
    items.map((it, i) => new ButtonBuilder()
      .setCustomId(`${key}_minus_${i}`)
      .setEmoji(it.emoji)
      .setLabel("-")
      .setStyle(ButtonStyle.Secondary))
  );
  return [plusRow, minusRow];
}

// === Commands registreren ===
(async () => {
  try {
    const cmds = [
      new SlashCommandBuilder()
        .setName("dks")
        .setDescription("Dagannoth Kings tracker")
        .addSubcommand(s => s.setName("setup").setDescription("Post DKS tracker"))
        .addSubcommand(s => s.setName("reset").setDescription("Reset DKS teller")),
      new SlashCommandBuilder()
        .setName("barrows")
        .setDescription("Barrows tracker")
        .addSubcommand(s => s.setName("setup").setDescription("Post Barrows trackers (6 berichten)"))
        .addSubcommand(s => s.setName("reset").setDescription("Reset Barrows teller")),
    ].map(c => c.toJSON());

    const rest = new REST({ version: '10' }).setToken(TOKEN);
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: cmds });
    console.log("Slash commands geregistreerd.");
  } catch (err) {
    console.error("Fout bij registreren van commands:", err);
  }
})();

// === Events ===
client.on("ready", () => {
  console.log(`Bot ingelogd als ${client.user.tag}`);
  loadState();
});

client.on("interactionCreate", async interaction => {
  try {
    // Slash commands
    if (interaction.isChatInputCommand()) {
      // DKS
      if (interaction.commandName === "dks") {
        if (interaction.options.getSubcommand() === "setup") {
          await interaction.deferReply(); // ACK direct
          ensurePresetInit(DKS.key, DKS.items.length);
          await interaction.editReply({
            ...buildSetEmbed(DKS.key, DKS.label, DKS.items),
            components: buildButtonsForSet(DKS.key, DKS.items)
          });
          return;
        }
        if (interaction.options.getSubcommand() === "reset") {
          await interaction.deferReply({ ephemeral: true });
          stateByPreset[DKS.key].counts = {};
          ensurePresetInit(DKS.key, DKS.items.length);
          saveStateFireAndForget();
          await interaction.editReply({ content: "DKS teller gereset." });
          return;
        }
      }

      // BARROWS
      if (interaction.commandName === "barrows") {
        if (interaction.options.getSubcommand() === "setup") {
          await interaction.deferReply(); // ACK direct

          const first = BARROWS_SETS[0];
          ensurePresetInit(first.key, first.items.length);
          await interaction.editReply({
            ...buildSetEmbed(first.key, first.label, first.items),
            components: buildButtonsForSet(first.key, first.items)
          });

          for (let i = 1; i < BARROWS_SETS.length; i++) {
            const set = BARROWS_SETS[i];
            ensurePresetInit(set.key, set.items.length);
            await interaction.followUp({
              ...buildSetEmbed(set.key, set.label, set.items),
              components: buildButtonsForSet(set.key, set.items)
            });
          }
          return;
        }
        if (interaction.options.getSubcommand() === "reset") {
          await interaction.deferReply({ ephemeral: true });
          BARROWS_SETS.forEach(s => {
            stateByPreset[s.key].counts = {};
            ensurePresetInit(s.key, s.items.length);
          });
          saveStateFireAndForget();
          await interaction.editReply({ content: "Barrows teller gereset." });
          return;
        }
      }
    }

    // Buttons
   const [key, action, idx] = interaction.customId.split("_");

  } catch (err) {
    console.error("Fout tijdens interaction:", err);
    // laatste redmiddel: als er nog niks ge-ACK’t is, probeer toch te antwoorden
    try {
      if (!interaction.deferred && !interaction.replied) {
        await interaction.reply({ content: "Er ging iets mis, probeer het nogmaals.", ephemeral: true });
      }
    } catch { /* ignore */ }
  }
});

client.login(TOKEN);
