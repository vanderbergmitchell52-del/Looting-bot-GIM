// index.js — "message-as-database" (geen files)
// Slaat de progress op in de embed zelf en leest/pars’t die bij elke klik.
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
require('dotenv').config();
const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = "1404828020853969077";
const GUILD_ID  = "1354917107048911059"; // <-- jouw server ID

// === THUMBS ===
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
// DKS — ringen 3x, Dragon Axe 1x (per lid)
const DKS = {
  key: "dks",
  label: "Dagannoth Kings",
  items: [
    { name: "Berserker Ring", emoji: "<:Berserker_ring:1404814556768763974>", goal: 3 },
    { name: "Warrior Ring",   emoji: "<:Warrior_ring:1404814562041270314>",   goal: 3 },
    { name: "Archers Ring",   emoji: "<:Archers_ring:1404814555162480763>",   goal: 3 },
    { name: "Seers Ring",     emoji: "<:Seers_ring:1404814560484917260>",     goal: 3 },
    { name: "Dragon Axe",     emoji: "<:Dragon_axe:1404814559151390740>",     goal: 1, extra: "*(1 per lid)*" },
  ],
};

// Barrows (volgorde: HELM, BODY, LEGS, WPN)
// Ahrim & Karil: 3x; overige broers: 1x
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
    { name: "Dharok's Helm",      emoji: "<:Dharoks_helm:1404814660947021845>",      goal: 1 },
    { name: "Dharok's Platebody", emoji: "<:Dharoks_platebody:1404814663442759831>", goal: 1 },
    { name: "Dharok's Platelegs", emoji: "<:Dharoks_platelegs:1404814665061634128>", goal: 1 },
    { name: "Dharok's Greataxe",  emoji: "<:Dharoks_greataxe:1404814659235872779>",  goal: 1 },
  ],
};
const BARROWS_GUTHAN = {
  key: "barrows_guthan",
  label: "Barrows — Guthan",
  items: [
    { name: "Guthan's Helm",       emoji: "<:Guthans_helm:1404814668635050155>",       goal: 1 },
    { name: "Guthan's Platebody",  emoji: "<:Guthans_platebody:1404814670195458078>",  goal: 1 },
    { name: "Guthan's Chainskirt", emoji: "<:Guthans_chainskirt:1404814666810654780>", goal: 1 },
    { name: "Guthan's Warspear",   emoji: "<:Guthans_warspear:1404814810452852736>",   goal: 1 },
  ],
};
const BARROWS_KARIL = {
  key: "barrows_karil",
  label: "Barrows — Karil",
  items: [
    { name: "Karil's Coif",         emoji: "<:Karils_coif:1404814673978720409>",         goal: 3 },
    { name: "Karil's Leathertop",   emoji: "<:Karils_leathertop:1404814855256408064>",   goal: 3 },
    { name: "Karil's Leatherskirt", emoji: "<:Karils_leatherskirt:1404814677372047532>", goal: 3 },
    { name: "Karil's Crossbow",     emoji: "<:Karils_crossbow:1404814914031325306>",     goal: 3 },
  ],
};
const BARROWS_TORAG = {
  key: "barrows_torag",
  label: "Barrows — Torag",
  items: [
    { name: "Torag's Helm",      emoji: "<:Torags_helm:1404894067749294151>",       goal: 1 },
    { name: "Torag's Platebody", emoji: "<:Torags_platebody:1404814684632256522>",  goal: 1 },
    { name: "Torag's Platelegs", emoji: "<:Torags_platelegs:1404894069313896691>",  goal: 1 },
    { name: "Torag's Hammers",   emoji: "<:Torags_hammers:1404814681138532424>",    goal: 1 },
  ],
};
const BARROWS_VERAC = {
  key: "barrows_verac",
  label: "Barrows — Verac",
  items: [
    { name: "Verac's Helm",       emoji: "<:Veracs_helm:1404814980926275637>",       goal: 1 },
    { name: "Verac's Brassard",   emoji: "<:Veracs_brassard:1404814688138825858>",   goal: 1 },
    { name: "Verac's Plateskirt", emoji: "<:Veracs_plateskirt:1404814695688306690>", goal: 1 },
    { name: "Verac's Flail",      emoji: "<:Veracs_flail:1404814690814529646>",      goal: 1 },
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

// === CLIENT ===
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel],
});

// === UI helpers (bericht = database) ===
function countsZero(len) {
  return Array.from({ length: len }, () => 0);
}

// 👇 Mooie weergave + ✅ als doel gehaald, anders `n/goal`
function lineFor(item, n) {
  const done = n >= item.goal;
  const right = done ? "✅" : `\`${n}/${item.goal}\``; // inline code look
  const extra = item.extra ? ` ${item.extra}` : "";
  return `${item.emoji} **${item.name}**${extra}  ${right}`;
}

function buildDescription(items, counts) {
  return items.map((it, i) => lineFor(it, counts[i] || 0)).join("\n");
}

function goalFooter(key) {
  if (key === "dks") return "Doel: ringen 3× • axe 1× p.p.";
  if (key === "barrows_ahrim" || key === "barrows_karil") return "Doel: 3× per item";
  return "Doel: 1× per item";
}

function buildSetEmbed(key, label, items, counts) {
  const thumb = THUMBS[key] ? { url: THUMBS[key] } : undefined;
  return {
    embeds: [{
      title: label,
      description: buildDescription(items, counts),
      color: 0x2b2d31,
      thumbnail: thumb,
      footer: { text: goalFooter(key) },
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

// Parse counts uit embed.description:
// - herkent `n/goal` in backticks
// - herkent ✅ als "vol" (n = goal)
function parseCountsFromEmbed(embed, items) {
  const lines = (embed?.description || "").split("\n").filter(Boolean);
  const counts = [];
  for (let i = 0; i < items.length; i++) {
    const line = lines[i] || "";
    if (line.includes("✅")) {
      counts[i] = items[i].goal;
      continue;
    }
    const m = /`(\d+)\/(\d+)`/.exec(line);
    counts[i] = m ? Number(m[1]) : 0;
  }
  return counts;
}

// ===== Slash Commands registreren =====
(async () => {
  try {
    const cmds = [
      new SlashCommandBuilder()
        .setName("dks")
        .setDescription("Dagannoth Kings tracker")
        .addSubcommand(s => s.setName("setup").setDescription("Post DKS tracker"))
        .addSubcommand(s => s.setName("reset").setDescription("Post DKS tracker opnieuw (start op 0)")),
      new SlashCommandBuilder()
        .setName("barrows")
        .setDescription("Barrows tracker")
        .addSubcommand(s => s.setName("setup").setDescription("Post 6 berichten (1 per Barrows-broer)"))
        .addSubcommand(s => s.setName("reset").setDescription("Post Barrows opnieuw (start op 0)")),
    ].map(c => c.toJSON());

    const rest = new REST({ version: '10' }).setToken(TOKEN);
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: cmds });
    console.log("Slash commands geregistreerd.");
  } catch (err) {
    console.error("Fout bij registreren van commands:", err);
  }
})();

// ===== Events =====
client.on("ready", () => {
  console.log(`Bot ingelogd als ${client.user.tag}`);
});

client.on("interactionCreate", async interaction => {
  try {
    // Slash Commands
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === "dks") {
        if (interaction.options.getSubcommand() === "setup" || interaction.options.getSubcommand() === "reset") {
          await interaction.deferReply();
          const counts = countsZero(DKS.items.length);
          await interaction.editReply({
            ...buildSetEmbed(DKS.key, DKS.label, DKS.items, counts),
            components: buildButtonsForSet(DKS.key, DKS.items)
          });
          return;
        }
      }

      if (interaction.commandName === "barrows") {
        if (interaction.options.getSubcommand() === "setup" || interaction.options.getSubcommand() === "reset") {
          await interaction.deferReply();
          // eerste set in editReply, rest als followUp
          const first = BARROWS_SETS[0];
          await interaction.editReply({
            ...buildSetEmbed(first.key, first.label, first.items, countsZero(first.items.length)),
            components: buildButtonsForSet(first.key, first.items)
          });
          for (let i = 1; i < BARROWS_SETS.length; i++) {
            const set = BARROWS_SETS[i];
            await interaction.followUp({
              ...buildSetEmbed(set.key, set.label, set.items, countsZero(set.items.length)),
              components: buildButtonsForSet(set.key, set.items)
            });
          }
          return;
        }
      }
    }

    // Buttons
    if (interaction.isButton()) {
      await interaction.deferUpdate().catch(() => {});
      // customId kan underscores in key bevatten → pak laatste 2 als action/index
      const parts  = interaction.customId.split("_");
      const action = parts[parts.length - 2];
      const index  = Number(parts[parts.length - 1]);
      const key    = parts.slice(0, parts.length - 2).join("_");

      // Kies juiste preset
      let label, items;
      if (key === DKS.key) { label = DKS.label; items = DKS.items; }
      else {
        const set = BARROWS_SETS.find(s => s.key === key);
        if (!set) return;
        label = set.label; items = set.items;
      }

      // Huidige counts uit embed lezen
      const oldEmbed = interaction.message.embeds?.[0];
      let counts = parseCountsFromEmbed(oldEmbed, items);

      // Aanpassen
      if (action === "plus")  counts[index] = (counts[index] || 0) + 1;
      if (action === "minus") counts[index] = Math.max(0, (counts[index] || 0) - 1);

      // Updaten (schrijft terug in dezelfde embed = opslag)
      try {
        await interaction.message.edit({
          ...buildSetEmbed(key, label, items, counts),
          components: buildButtonsForSet(key, items)
        });
      } catch (e) {
        console.error("Edit faalde:", e.message);
      }
    }
  } catch (err) {
    console.error("Fout tijdens interaction:", err);
  }
});

client.login(TOKEN);
