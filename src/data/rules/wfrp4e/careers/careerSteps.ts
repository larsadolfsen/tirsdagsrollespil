import type { CareerStepDefinition } from "../../../../types";

// Generated from the WFRP 4e career tables.
// Note: characteristicAdvances are left empty because the PDF text extraction does not reliably map the advance-scheme markers to each career step.

export const careerSteps: CareerStepDefinition[] = [
  {
    "id": "apothecary_apothecarys_apprentice",
    "careerPathId": "apothecary",
    "rank": 1,
    "name": "Apothecary’s Apprentice",
    "status": "Brass 3",
    "characteristicAdvances": [],
    "skillIds": [
      "consume_alcohol",
      "heal",
      "language_classical",
      "lore_chemistry",
      "lore_medicine",
      "lore_plants",
      "trade_apothecary",
      "trade_poisoner"
    ],
    "talentIds": [
      "concoct",
      "craftsman_apothecary",
      "etiquette_scholar",
      "read_write"
    ],
    "trappingIds": [
      "book_blank",
      "healing_draught",
      "leather_jerkin",
      "pestle_and_mortar"
    ]
  },
  {
    "id": "apothecary_apothecary",
    "careerPathId": "apothecary",
    "rank": 2,
    "name": "Apothecary",
    "status": "Silver 1",
    "characteristicAdvances": [],
    "skillIds": [
      "charm",
      "haggle",
      "lore_science",
      "gossip",
      "language_guilder",
      "perception"
    ],
    "talentIds": [
      "criminal",
      "dealmaker",
      "etiquette_guilder",
      "pharmacist"
    ],
    "trappingIds": [
      "guild_licence",
      "trade_tools"
    ]
  },
  {
    "id": "apothecary_master_apothecary",
    "careerPathId": "apothecary",
    "rank": 3,
    "name": "Master Apothecary",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "intuition",
      "leadership",
      "research",
      "secret_signs_guilder"
    ],
    "talentIds": [
      "bookish",
      "master_tradesman_apothecary",
      "resistance_poison",
      "savvy"
    ],
    "trappingIds": [
      "book_apothecary",
      "apprentice",
      "workshop"
    ]
  },
  {
    "id": "apothecary_apothecary_general",
    "careerPathId": "apothecary",
    "rank": 4,
    "name": "Apothecary-General",
    "status": "Gold 1",
    "characteristicAdvances": [],
    "skillIds": [
      "intimidate",
      "ride_horse"
    ],
    "talentIds": [
      "acute_sense_taste",
      "coolheaded",
      "master_tradesman_poisoner",
      "savant_apothecary"
    ],
    "trappingIds": [
      "commission_papers",
      "large_workshop"
    ]
  },
  {
    "id": "engineer_student_engineer",
    "careerPathId": "engineer",
    "rank": 1,
    "name": "Student Engineer",
    "status": "Brass 4",
    "characteristicAdvances": [],
    "skillIds": [
      "consume_alcohol",
      "cool",
      "endurance",
      "language_classical",
      "lore_engineer",
      "perception",
      "ranged_blackpowder",
      "trade_engineer"
    ],
    "talentIds": [
      "artistic",
      "gunner",
      "read_write",
      "tinker"
    ],
    "trappingIds": [
      "book_engineer",
      "hammer_and_spikes"
    ]
  },
  {
    "id": "engineer_engineer",
    "careerPathId": "engineer",
    "rank": 2,
    "name": "Engineer",
    "status": "Silver 2",
    "characteristicAdvances": [],
    "skillIds": [
      "drive",
      "dodge",
      "navigation",
      "ranged_engineering",
      "research",
      "language_guilder"
    ],
    "talentIds": [
      "craftsman_engineer",
      "etiquette_guilder",
      "marksman",
      "orientation"
    ],
    "trappingIds": [
      "guild_licence",
      "trade_tools"
    ]
  },
  {
    "id": "engineer_master_engineer",
    "careerPathId": "engineer",
    "rank": 3,
    "name": "Master Engineer",
    "status": "Silver 4",
    "characteristicAdvances": [],
    "skillIds": [
      "language_khazalid",
      "leadership",
      "ride_horse",
      "secret_signs_guilder"
    ],
    "talentIds": [
      "etiquette_scholar",
      "master_tradesman_engineering",
      "sniper",
      "super_numerate"
    ],
    "trappingIds": [
      "workshop"
    ]
  },
  {
    "id": "engineer_chartered_engineer",
    "careerPathId": "engineer",
    "rank": 4,
    "name": "Chartered Engineer",
    "status": "Gold 2",
    "characteristicAdvances": [],
    "skillIds": [
      "language_any",
      "lore_any"
    ],
    "talentIds": [
      "magnum_opus",
      "rapid_reload",
      "savant_engineering",
      "unshakeable"
    ],
    "trappingIds": [
      "guild_license",
      "library_engineer",
      "quality_trade_tools_engineer",
      "large_workshop_engineer"
    ]
  },
  {
    "id": "lawyer_student_lawyer",
    "careerPathId": "lawyer",
    "rank": 1,
    "name": "Student Lawyer",
    "status": "Brass 4",
    "characteristicAdvances": [],
    "skillIds": [
      "consume_alcohol",
      "endurance",
      "haggle",
      "language_classical",
      "lore_law",
      "lore_theology",
      "perception",
      "research"
    ],
    "talentIds": [
      "blather",
      "etiquette_scholar",
      "read_write",
      "speedreader"
    ],
    "trappingIds": [
      "book_law",
      "magnifying_glass"
    ]
  },
  {
    "id": "lawyer_lawyer",
    "careerPathId": "lawyer",
    "rank": 2,
    "name": "Lawyer",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "bribery",
      "charm",
      "gossip",
      "intuition",
      "language_guilder",
      "secret_signs_guilder"
    ],
    "talentIds": [
      "argumentative",
      "criminal",
      "etiquette_guilder",
      "suave"
    ],
    "trappingIds": [
      "court_robes",
      "guild_licence",
      "writing_kit"
    ]
  },
  {
    "id": "lawyer_barrister",
    "careerPathId": "lawyer",
    "rank": 3,
    "name": "Barrister",
    "status": "Gold 1",
    "characteristicAdvances": [],
    "skillIds": [
      "art_writing",
      "entertain_speeches",
      "intimidate",
      "lore_any"
    ],
    "talentIds": [
      "bookish",
      "cat_tongued",
      "impassioned_zeal",
      "savvy"
    ],
    "trappingIds": [
      "office",
      "assistant_student_or_servant"
    ]
  },
  {
    "id": "lawyer_judge",
    "careerPathId": "lawyer",
    "rank": 4,
    "name": "Judge",
    "status": "Gold 2",
    "characteristicAdvances": [],
    "skillIds": [
      "cool",
      "lore_any"
    ],
    "talentIds": [
      "commanding_presence",
      "kingpin",
      "savant_law",
      "wealthy"
    ],
    "trappingIds": [
      "gavel",
      "ostentatious_wig"
    ]
  },
  {
    "id": "nun_novitiate",
    "careerPathId": "nun",
    "rank": 1,
    "name": "Novitiate",
    "status": "Brass 1",
    "characteristicAdvances": [],
    "skillIds": [
      "art_calligraphy",
      "cool",
      "endurance",
      "entertain_storyteller",
      "gossip",
      "heal",
      "lore_theology",
      "pray"
    ],
    "talentIds": [
      "bless_any",
      "stone_soup",
      "panhandle",
      "read_write"
    ],
    "trappingIds": [
      "religious_symbol",
      "robes"
    ]
  },
  {
    "id": "nun_nun",
    "careerPathId": "nun",
    "rank": 2,
    "name": "Nun",
    "status": "Brass 4",
    "characteristicAdvances": [],
    "skillIds": [
      "charm",
      "melee_any",
      "research",
      "trade_brewer",
      "trade_herbalist",
      "trade_vintner"
    ],
    "talentIds": [
      "etiquette_cultists",
      "field_dressing",
      "holy_visions",
      "invoke_any"
    ],
    "trappingIds": [
      "book_religion",
      "religious_relic",
      "trade_tools_any"
    ]
  },
  {
    "id": "nun_abbess",
    "careerPathId": "nun",
    "rank": 3,
    "name": "Abbess",
    "status": "Silver 2",
    "characteristicAdvances": [],
    "skillIds": [
      "leadership",
      "lore_local",
      "lore_politics",
      "perception"
    ],
    "talentIds": [
      "resistance_any",
      "robust",
      "savant_theology",
      "stout_hearted"
    ],
    "trappingIds": [
      "abbey",
      "library_theology"
    ]
  },
  {
    "id": "nun_prioress_general",
    "careerPathId": "nun",
    "rank": 4,
    "name": "Prioress General",
    "status": "Silver 5",
    "characteristicAdvances": [],
    "skillIds": [
      "language_any",
      "lore_any"
    ],
    "talentIds": [
      "commanding_presence",
      "iron_will",
      "pure_soul",
      "strong_minded"
    ],
    "trappingIds": [
      "religious_order"
    ]
  },
  {
    "id": "physician_physicians_apprentice",
    "careerPathId": "physician",
    "rank": 1,
    "name": "Physician’s Apprentice",
    "status": "Brass 4",
    "characteristicAdvances": [],
    "skillIds": [
      "bribery",
      "cool",
      "drive",
      "endurance",
      "gossip",
      "heal",
      "perception",
      "sleight_of_hand"
    ],
    "talentIds": [
      "bookish",
      "field_dressing",
      "read_write",
      "strike_to_stun"
    ],
    "trappingIds": [
      "bandages",
      "healing_draught"
    ]
  },
  {
    "id": "physician_physician",
    "careerPathId": "physician",
    "rank": 2,
    "name": "Physician",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "charm",
      "haggle",
      "language_guilder",
      "lore_anatomy",
      "lore_medicine",
      "trade_barber"
    ],
    "talentIds": [
      "coolheaded",
      "criminal",
      "etiquette_guilder",
      "surgery"
    ],
    "trappingIds": [
      "book_medicine",
      "guild_licence",
      "trade_tools_medicine"
    ]
  },
  {
    "id": "physician_doktor",
    "careerPathId": "physician",
    "rank": 3,
    "name": "Doktor",
    "status": "Silver 5",
    "characteristicAdvances": [],
    "skillIds": [
      "consume_alcohol",
      "intimidate",
      "leadership",
      "research"
    ],
    "talentIds": [
      "etiquette_scholars",
      "resistance_disease",
      "savvy",
      "strike_to_injure"
    ],
    "trappingIds": [
      "apprentice",
      "workshop_medicine"
    ]
  },
  {
    "id": "physician_court_physician",
    "careerPathId": "physician",
    "rank": 4,
    "name": "Court Physician",
    "status": "Gold 1",
    "characteristicAdvances": [],
    "skillIds": [
      "lore_noble",
      "perform_dancing"
    ],
    "talentIds": [
      "etiquette_nobles",
      "nimble_fingered",
      "savant_medicine",
      "strong_minded"
    ],
    "trappingIds": [
      "courtly_attire",
      "letter_of_appointment"
    ]
  },
  {
    "id": "priest_initiate",
    "careerPathId": "priest",
    "rank": 1,
    "name": "Initiate",
    "status": "Brass 2",
    "characteristicAdvances": [],
    "skillIds": [
      "athletics",
      "cool",
      "endurance",
      "intuition",
      "lore_theology",
      "perception",
      "pray",
      "research"
    ],
    "talentIds": [
      "bless_any",
      "holy_visions",
      "read_write",
      "suave"
    ],
    "trappingIds": [
      "religious_symbol",
      "robes"
    ]
  },
  {
    "id": "priest_priest",
    "careerPathId": "priest",
    "rank": 2,
    "name": "Priest",
    "status": "Silver 1",
    "characteristicAdvances": [],
    "skillIds": [
      "charm",
      "entertain_storytelling",
      "gossip",
      "heal",
      "intimidate",
      "melee_basic"
    ],
    "talentIds": [
      "blather",
      "bookish",
      "etiquette_cultists",
      "invoke_any"
    ],
    "trappingIds": [
      "book_religion",
      "ceremonial_robes"
    ]
  },
  {
    "id": "priest_high_priest",
    "careerPathId": "priest",
    "rank": 3,
    "name": "High Priest",
    "status": "Gold 1",
    "characteristicAdvances": [],
    "skillIds": [
      "art_writing",
      "entertain_speeches",
      "leadership",
      "lore_heraldry"
    ],
    "talentIds": [
      "acute_sense_any",
      "hatred_any",
      "impassioned_zeal",
      "strong_minded"
    ],
    "trappingIds": [
      "quality_robes",
      "religious_relic",
      "subordinate_priests",
      "temple"
    ]
  },
  {
    "id": "priest_lector",
    "careerPathId": "priest",
    "rank": 4,
    "name": "Lector",
    "status": "Gold 2",
    "characteristicAdvances": [],
    "skillIds": [
      "language_any",
      "lore_politics"
    ],
    "talentIds": [
      "master_orator",
      "pure_soul",
      "resistance_any",
      "savant_theology"
    ],
    "trappingIds": [
      "library_theology",
      "subordinate_high_priests"
    ]
  },
  {
    "id": "scholar_student",
    "careerPathId": "scholar",
    "rank": 1,
    "name": "Student",
    "status": "Brass 3",
    "characteristicAdvances": [],
    "skillIds": [
      "consume_alcohol",
      "entertain_storytelling",
      "gamble",
      "gossip",
      "haggle",
      "language_classical",
      "lore_any",
      "research"
    ],
    "talentIds": [
      "carouser",
      "read_write",
      "savvy",
      "super_numerate"
    ],
    "trappingIds": [
      "alcohol",
      "book",
      "opinions",
      "writing_kit"
    ]
  },
  {
    "id": "scholar_scholar",
    "careerPathId": "scholar",
    "rank": 2,
    "name": "Scholar",
    "status": "Silver 2",
    "characteristicAdvances": [],
    "skillIds": [
      "art_writing",
      "intuition",
      "language_any",
      "lore_any",
      "perception",
      "trade_any"
    ],
    "talentIds": [
      "bookish",
      "etiquette_scholars",
      "speedreader",
      "suave"
    ],
    "trappingIds": [
      "access_to_a_library",
      "degree"
    ]
  },
  {
    "id": "scholar_fellow",
    "careerPathId": "scholar",
    "rank": 3,
    "name": "Fellow",
    "status": "Silver 5",
    "characteristicAdvances": [],
    "skillIds": [
      "entertain_lecture",
      "intimidate",
      "language_any",
      "lore_any"
    ],
    "talentIds": [
      "linguistics",
      "public_speaker",
      "savant_any",
      "tower_of_memories"
    ],
    "trappingIds": [
      "mortarboard",
      "robes"
    ]
  },
  {
    "id": "scholar_professor",
    "careerPathId": "scholar",
    "rank": 4,
    "name": "Professor",
    "status": "Gold 1",
    "characteristicAdvances": [],
    "skillIds": [
      "entertain_rhetoric",
      "lore_any"
    ],
    "talentIds": [
      "magnum_opus",
      "master_orator",
      "savant_any",
      "sharp"
    ],
    "trappingIds": [
      "study"
    ]
  },
  {
    "id": "wizard_wizards_apprentice",
    "careerPathId": "wizard",
    "rank": 1,
    "name": "Wizard’s Apprentice",
    "status": "Brass 3",
    "characteristicAdvances": [],
    "skillIds": [
      "channelling_any_colour",
      "dodge",
      "intuition",
      "language_magick",
      "lore_magic",
      "melee_basic",
      "melee_polearm",
      "perception"
    ],
    "talentIds": [
      "aethyric_attunement",
      "petty_magic",
      "read_write",
      "second_sight"
    ],
    "trappingIds": [
      "grimoire",
      "staff"
    ]
  },
  {
    "id": "wizard_wizard",
    "careerPathId": "wizard",
    "rank": 2,
    "name": "Wizard",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "charm",
      "cool",
      "gossip",
      "intimidate",
      "language_battle",
      "language_any"
    ],
    "talentIds": [
      "arcane_magic_any_arcane_lore",
      "detect_artefact",
      "fast_hands",
      "sixth_sense"
    ],
    "trappingIds": [
      "magical_license"
    ]
  },
  {
    "id": "wizard_master_wizard",
    "careerPathId": "wizard",
    "rank": 3,
    "name": "Master Wizard",
    "status": "Gold 1",
    "characteristicAdvances": [],
    "skillIds": [
      "animal_care",
      "evaluate",
      "lore_warfare",
      "ride_horse"
    ],
    "talentIds": [
      "dual_wielder",
      "instinctive_diction",
      "magical_sense",
      "menacing"
    ],
    "trappingIds": [
      "apprentice",
      "light_warhorse",
      "magical_item"
    ]
  },
  {
    "id": "wizard_wizard_lord",
    "careerPathId": "wizard",
    "rank": 4,
    "name": "Wizard Lord",
    "status": "Gold 2",
    "characteristicAdvances": [],
    "skillIds": [
      "language_any",
      "lore_any"
    ],
    "talentIds": [
      "combat_aware",
      "frightening",
      "iron_will",
      "war_wizard"
    ],
    "trappingIds": [
      "apprentice",
      "library_magic",
      "workshop_magic"
    ]
  },
  {
    "id": "agitator_pamphleteer",
    "careerPathId": "agitator",
    "rank": 1,
    "name": "Pamphleteer",
    "status": "Brass 1",
    "characteristicAdvances": [],
    "skillIds": [
      "art_writing",
      "bribery",
      "charm",
      "consume_alcohol",
      "gossip",
      "haggle",
      "lore_politics",
      "trade_printing"
    ],
    "talentIds": [
      "blather",
      "gregarious",
      "panhandle",
      "read_write"
    ],
    "trappingIds": [
      "writing_kit",
      "hammer_and_nails",
      "pile_of_leaflets"
    ]
  },
  {
    "id": "agitator_agitator",
    "careerPathId": "agitator",
    "rank": 2,
    "name": "Agitator",
    "status": "Brass 2",
    "characteristicAdvances": [],
    "skillIds": [
      "cool",
      "dodge",
      "entertain_storytelling",
      "gamble",
      "intuition",
      "leadership"
    ],
    "talentIds": [
      "alley_cat",
      "argumentative",
      "impassioned_zeal",
      "public_speaker"
    ],
    "trappingIds": [
      "leather_jack"
    ]
  },
  {
    "id": "agitator_rabble_rouser",
    "careerPathId": "agitator",
    "rank": 3,
    "name": "Rabble Rouser",
    "status": "Brass 3",
    "characteristicAdvances": [],
    "skillIds": [
      "athletics",
      "intimidate",
      "melee_fist",
      "perception"
    ],
    "talentIds": [
      "cat_tongued",
      "dirty_fighting",
      "flee",
      "step_aside"
    ],
    "trappingIds": [
      "hand_weapon",
      "pamphleteer"
    ]
  },
  {
    "id": "agitator_demagogue",
    "careerPathId": "agitator",
    "rank": 4,
    "name": "Demagogue",
    "status": "Brass 5",
    "characteristicAdvances": [],
    "skillIds": [
      "lore_heraldry",
      "ride_horse"
    ],
    "talentIds": [
      "etiquette_any",
      "master_orator",
      "schemer",
      "suave"
    ],
    "trappingIds": [
      "3_pamphleteers",
      "patron",
      "printing_press",
      "impressive_hat"
    ]
  },
  {
    "id": "artisan_apprentice_artisan",
    "careerPathId": "artisan",
    "rank": 1,
    "name": "Apprentice Artisan",
    "status": "Brass 2",
    "characteristicAdvances": [],
    "skillIds": [
      "athletics",
      "cool",
      "consume_alcohol",
      "dodge",
      "endurance",
      "evaluate",
      "stealth_urban",
      "trade_any"
    ],
    "talentIds": [
      "artistic",
      "craftsman_any",
      "strong_back",
      "very_strong"
    ],
    "trappingIds": [
      "chalk",
      "leather_jerkin",
      "d10_rags"
    ]
  },
  {
    "id": "artisan_artisan",
    "careerPathId": "artisan",
    "rank": 2,
    "name": "Artisan",
    "status": "Silver 1",
    "characteristicAdvances": [],
    "skillIds": [
      "charm",
      "haggle",
      "lore_local",
      "gossip",
      "language_guilder",
      "perception"
    ],
    "talentIds": [
      "dealmaker",
      "etiquette_guilder",
      "nimble_fingered",
      "sturdy"
    ],
    "trappingIds": [
      "guild_licence",
      "trade_tools"
    ]
  },
  {
    "id": "artisan_master_artisan",
    "careerPathId": "artisan",
    "rank": 3,
    "name": "Master Artisan",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "intuition",
      "leadership",
      "research",
      "secret_signs_guilder"
    ],
    "talentIds": [
      "acute_sense_taste_or_touch",
      "master_tradesman_any",
      "read_write",
      "tinker"
    ],
    "trappingIds": [
      "apprentice",
      "workshop"
    ]
  },
  {
    "id": "artisan_guildmaster",
    "careerPathId": "artisan",
    "rank": 4,
    "name": "Guildmaster",
    "status": "Gold 1",
    "characteristicAdvances": [],
    "skillIds": [
      "bribery",
      "intimidate"
    ],
    "talentIds": [
      "briber",
      "magnum_opus",
      "public_speaker",
      "schemer"
    ],
    "trappingIds": [
      "guild",
      "quality_clothing"
    ]
  },
  {
    "id": "beggar_pauper",
    "careerPathId": "beggar",
    "rank": 1,
    "name": "Pauper",
    "status": "Brass 0",
    "characteristicAdvances": [],
    "skillIds": [
      "athletics",
      "charm",
      "consume_alcohol",
      "cool",
      "dodge",
      "endurance",
      "intuition",
      "stealth_urban"
    ],
    "talentIds": [
      "panhandle",
      "resistance_disease",
      "stone_soup",
      "very_resilient"
    ],
    "trappingIds": [
      "poor_quality_blanket",
      "cup"
    ]
  },
  {
    "id": "beggar_beggar",
    "careerPathId": "beggar",
    "rank": 2,
    "name": "Beggar",
    "status": "Brass 2",
    "characteristicAdvances": [],
    "skillIds": [
      "entertain_acting",
      "entertain_any",
      "gossip",
      "haggle",
      "perception",
      "sleight_of_hand"
    ],
    "talentIds": [
      "alley_cat",
      "beneath_notice",
      "criminal",
      "etiquette_criminals"
    ],
    "trappingIds": [
      "crutch",
      "bowl"
    ]
  },
  {
    "id": "beggar_master_beggar",
    "careerPathId": "beggar",
    "rank": 3,
    "name": "Master Beggar",
    "status": "Brass 4",
    "characteristicAdvances": [],
    "skillIds": [
      "charm_animal",
      "leadership",
      "lore_local",
      "secret_signs_vagabond"
    ],
    "talentIds": [
      "blather",
      "dirty_fighting",
      "hardy",
      "step_aside"
    ],
    "trappingIds": [
      "disguise_kit",
      "hiding_place",
      "pauper_follower"
    ]
  },
  {
    "id": "beggar_beggar_king",
    "careerPathId": "beggar",
    "rank": 4,
    "name": "Beggar King",
    "status": "Silver 2",
    "characteristicAdvances": [],
    "skillIds": [
      "bribery",
      "intimidate"
    ],
    "talentIds": [
      "cat_tongued",
      "fearless_watchmen",
      "kingpin",
      "suave"
    ],
    "trappingIds": [
      "lair",
      "large_group_of_beggar_followers"
    ]
  },
  {
    "id": "investigator_sleuth",
    "careerPathId": "investigator",
    "rank": 1,
    "name": "Sleuth",
    "status": "Silver 1",
    "characteristicAdvances": [],
    "skillIds": [
      "charm",
      "climb",
      "cool",
      "gossip",
      "intuition",
      "perception",
      "stealth_urban",
      "track"
    ],
    "talentIds": [
      "alley_cat",
      "beneath_notice",
      "read_write",
      "sharp"
    ],
    "trappingIds": [
      "lantern",
      "lamp_oil",
      "journal",
      "quill_and_ink"
    ]
  },
  {
    "id": "investigator_investigator",
    "careerPathId": "investigator",
    "rank": 2,
    "name": "Investigator",
    "status": "Silver 2",
    "characteristicAdvances": [],
    "skillIds": [
      "consume_alcohol",
      "dodge",
      "lore_law",
      "melee_brawling",
      "pick_lock",
      "sleight_of_hand"
    ],
    "talentIds": [
      "etiquette_any",
      "savvy",
      "shadow",
      "tenacious"
    ],
    "trappingIds": [
      "leather_jack",
      "hand_weapon",
      "magnifying_glass",
      "lockpick"
    ]
  },
  {
    "id": "investigator_master_investigator",
    "careerPathId": "investigator",
    "rank": 3,
    "name": "Master Investigator",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "bribery",
      "evaluate",
      "leadership",
      "lore_any"
    ],
    "talentIds": [
      "bookish",
      "break_and_enter",
      "sixth_sense",
      "suave"
    ],
    "trappingIds": [
      "assistant",
      "office"
    ]
  },
  {
    "id": "investigator_detective",
    "careerPathId": "investigator",
    "rank": 4,
    "name": "Detective",
    "status": "Silver 5",
    "characteristicAdvances": [],
    "skillIds": [
      "intimidate",
      "lore_any"
    ],
    "talentIds": [
      "acute_sense_any",
      "savant_any",
      "speedreader",
      "tower_of_memories"
    ],
    "trappingIds": [
      "network_of_informants",
      "spyglass"
    ]
  },
  {
    "id": "merchant_trader",
    "careerPathId": "merchant",
    "rank": 1,
    "name": "Trader",
    "status": "Silver 2",
    "characteristicAdvances": [],
    "skillIds": [
      "animal_care",
      "bribery",
      "charm",
      "consume_alcohol",
      "drive",
      "gamble",
      "gossip",
      "haggle"
    ],
    "talentIds": [
      "blather",
      "dealmaker",
      "read_write",
      "suave"
    ],
    "trappingIds": [
      "abacus",
      "mule_and_cart",
      "canvas_tarpaulin",
      "3d10_silver_shillings"
    ]
  },
  {
    "id": "merchant_merchant",
    "careerPathId": "merchant",
    "rank": 2,
    "name": "Merchant",
    "status": "Silver 5",
    "characteristicAdvances": [],
    "skillIds": [
      "evaluate",
      "intuition",
      "language_any",
      "language_guilder",
      "lore_local",
      "perception"
    ],
    "talentIds": [
      "briber",
      "embezzle",
      "etiquette_guilder",
      "savvy"
    ],
    "trappingIds": [
      "riverboat_or_2_wagons",
      "guild_license",
      "20_gc"
    ]
  },
  {
    "id": "merchant_master_merchant",
    "careerPathId": "merchant",
    "rank": 3,
    "name": "Master Merchant",
    "status": "Gold 1",
    "characteristicAdvances": [],
    "skillIds": [
      "cool",
      "language_classical",
      "navigation",
      "secret_signs_guilder"
    ],
    "talentIds": [
      "cat_tongued",
      "etiquette_any",
      "numismatics",
      "sharp"
    ],
    "trappingIds": [
      "town_house_with_servants",
      "warehouse",
      "100_gc"
    ]
  },
  {
    "id": "merchant_merchant_prince",
    "careerPathId": "merchant",
    "rank": 4,
    "name": "Merchant Prince",
    "status": "Gold 3",
    "characteristicAdvances": [],
    "skillIds": [
      "lore_any",
      "intimidate"
    ],
    "talentIds": [
      "iron_will",
      "luck",
      "schemer",
      "wealthy"
    ],
    "trappingIds": [
      "2_riverboats_or_4_wagons",
      "large_town_estate",
      "2_warehouses",
      "1000_gc",
      "quality_clothing"
    ]
  },
  {
    "id": "rat_catcher_rat_hunter",
    "careerPathId": "rat_catcher",
    "rank": 1,
    "name": "Rat Hunter",
    "status": "Brass 3",
    "characteristicAdvances": [],
    "skillIds": [
      "athletics",
      "animal_training_dog",
      "charm_animal",
      "consume_alcohol",
      "endurance",
      "melee_basic",
      "ranged_sling",
      "stealth_underground_or_urban"
    ],
    "talentIds": [
      "night_vision",
      "resistance_disease",
      "strike_mighty_blow",
      "strike_to_stun"
    ],
    "trappingIds": [
      "sling_with_ammunition",
      "sack",
      "small_but_vicious_dog"
    ]
  },
  {
    "id": "rat_catcher_rat_catcher",
    "careerPathId": "rat_catcher",
    "rank": 2,
    "name": "Rat Catcher",
    "status": "Silver 1",
    "characteristicAdvances": [],
    "skillIds": [
      "animal_care",
      "gossip",
      "haggle",
      "lore_poison",
      "perception",
      "set_trap"
    ],
    "talentIds": [
      "enclosed_fighter",
      "etiquette_guilder",
      "fearless_rats",
      "very_resilient"
    ],
    "trappingIds": [
      "animal_traps",
      "pole_for_dead_rats"
    ]
  },
  {
    "id": "rat_catcher_sewer_jack",
    "careerPathId": "rat_catcher",
    "rank": 3,
    "name": "Sewer Jack",
    "status": "Silver 2",
    "characteristicAdvances": [],
    "skillIds": [
      "climb",
      "cool",
      "dodge",
      "ranged_crossbow_pistol"
    ],
    "talentIds": [
      "hardy",
      "stout_hearted",
      "strong_legs",
      "tunnel_rat"
    ],
    "trappingIds": [
      "davrich_lantern",
      "hand_weapon",
      "leather_jack"
    ]
  },
  {
    "id": "rat_catcher_exterminator",
    "careerPathId": "rat_catcher",
    "rank": 4,
    "name": "Exterminator",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "leadership",
      "track"
    ],
    "talentIds": [
      "fearless_skaven",
      "menacing",
      "robust",
      "strong_minded"
    ],
    "trappingIds": [
      "assistant",
      "large_and_vicious_dog",
      "sack_of_poisoned_bait_10_doses_of_heartkill"
    ]
  },
  {
    "id": "townsman_clerk",
    "careerPathId": "townsman",
    "rank": 1,
    "name": "Clerk",
    "status": "Silver 1",
    "characteristicAdvances": [],
    "skillIds": [
      "charm",
      "climb",
      "consume_alcohol",
      "drive",
      "dodge",
      "gamble",
      "gossip",
      "haggle"
    ],
    "talentIds": [
      "alley_cat",
      "beneath_notice",
      "etiquette_servants",
      "sturdy"
    ],
    "trappingIds": [
      "lodgings",
      "sturdy_boots"
    ]
  },
  {
    "id": "townsman_townsman",
    "careerPathId": "townsman",
    "rank": 2,
    "name": "Townsman",
    "status": "Silver 2",
    "characteristicAdvances": [],
    "skillIds": [
      "bribery",
      "evaluate",
      "intuition",
      "lore_local",
      "melee_brawling",
      "play_any"
    ],
    "talentIds": [
      "dealmaker",
      "embezzle",
      "etiquette_any",
      "gregarious"
    ],
    "trappingIds": [
      "modest_townhouse",
      "servant",
      "quill_and_ink"
    ]
  },
  {
    "id": "townsman_town_councillor",
    "careerPathId": "townsman",
    "rank": 3,
    "name": "Town Councillor",
    "status": "Silver 5",
    "characteristicAdvances": [],
    "skillIds": [
      "cool",
      "lore_law",
      "perception",
      "research"
    ],
    "talentIds": [
      "briber",
      "public_speaker",
      "read_write",
      "supportive"
    ],
    "trappingIds": [
      "coach_and_driver",
      "townhouse"
    ]
  },
  {
    "id": "townsman_burgomeister",
    "careerPathId": "townsman",
    "rank": 4,
    "name": "Burgomeister",
    "status": "Gold 1",
    "characteristicAdvances": [],
    "skillIds": [
      "lore_politics",
      "intimidate"
    ],
    "talentIds": [
      "commanding_presence",
      "master_orator",
      "schemer",
      "suave"
    ],
    "trappingIds": [
      "chains_of_office",
      "coach_and_footman",
      "quality_clothing",
      "large_townhouse_with_gardens_and_servants"
    ]
  },
  {
    "id": "watchman_watch_recruit",
    "careerPathId": "watchman",
    "rank": 1,
    "name": "Watch Recruit",
    "status": "Brass 3",
    "characteristicAdvances": [],
    "skillIds": [
      "athletics",
      "climb",
      "consume_alcohol",
      "dodge",
      "endurance",
      "gamble",
      "melee_any",
      "perception"
    ],
    "talentIds": [
      "drilled",
      "hardy",
      "strike_to_stun",
      "tenacious"
    ],
    "trappingIds": [
      "hand_weapon",
      "leather_jack",
      "uniform"
    ]
  },
  {
    "id": "watchman_watchman",
    "careerPathId": "watchman",
    "rank": 2,
    "name": "Watchman",
    "status": "Silver 1",
    "characteristicAdvances": [],
    "skillIds": [
      "charm",
      "cool",
      "gossip",
      "intimidate",
      "intuition",
      "lore_local"
    ],
    "talentIds": [
      "break_and_enter",
      "criminal",
      "night_vision",
      "sprinter"
    ],
    "trappingIds": [
      "lantern_and_pole",
      "lamp_oil",
      "copper_badge"
    ]
  },
  {
    "id": "watchman_watch_sergeant",
    "careerPathId": "watchman",
    "rank": 3,
    "name": "Watch Sergeant",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "entertain_storytelling",
      "haggle",
      "leadership",
      "lore_law"
    ],
    "talentIds": [
      "disarm",
      "etiquette_soldiers",
      "fearless_criminals",
      "nose_for_trouble"
    ],
    "trappingIds": [
      "breastplate",
      "helm",
      "symbol_of_rank"
    ]
  },
  {
    "id": "watchman_watch_captain",
    "careerPathId": "watchman",
    "rank": 4,
    "name": "Watch Captain",
    "status": "Gold 1",
    "characteristicAdvances": [],
    "skillIds": [
      "lore_politics",
      "ride_horse"
    ],
    "talentIds": [
      "public_speaker",
      "robust",
      "kingpin",
      "schemer"
    ],
    "trappingIds": [
      "riding_horse_with_saddle_and_tack",
      "quality_hat",
      "quality_hand_weapon",
      "quality_symbol_of_rank"
    ]
  },
  {
    "id": "advisor_aide",
    "careerPathId": "advisor",
    "rank": 1,
    "name": "Aide",
    "status": "Silver 2",
    "characteristicAdvances": [],
    "skillIds": [
      "bribery",
      "consume_alcohol",
      "endurance",
      "gossip",
      "haggle",
      "language_classical",
      "lore_politics",
      "perception"
    ],
    "talentIds": [
      "beneath_notice",
      "etiquette_any",
      "gregarious",
      "read_write"
    ],
    "trappingIds": [
      "writing_kit"
    ]
  },
  {
    "id": "advisor_advisor",
    "careerPathId": "advisor",
    "rank": 2,
    "name": "Advisor",
    "status": "Silver 4",
    "characteristicAdvances": [],
    "skillIds": [
      "charm",
      "cool",
      "evaluate",
      "gamble",
      "intuition",
      "lore_local"
    ],
    "talentIds": [
      "blather",
      "criminal",
      "schemer",
      "supportive"
    ],
    "trappingIds": [
      "livery"
    ]
  },
  {
    "id": "advisor_counsellor",
    "careerPathId": "advisor",
    "rank": 3,
    "name": "Counsellor",
    "status": "Gold 1",
    "characteristicAdvances": [],
    "skillIds": [
      "entertain_storytelling",
      "leadership",
      "language_any",
      "lore_any"
    ],
    "talentIds": [
      "argumentative",
      "briber",
      "carouser",
      "cat_tongued"
    ],
    "trappingIds": [
      "quality_clothing",
      "aide"
    ]
  },
  {
    "id": "advisor_chancellor",
    "careerPathId": "advisor",
    "rank": 4,
    "name": "Chancellor",
    "status": "Gold 3",
    "characteristicAdvances": [],
    "skillIds": [
      "lore_heraldry",
      "ride_horse"
    ],
    "talentIds": [
      "commanding_presence",
      "embezzle",
      "kingpin",
      "suave"
    ],
    "trappingIds": [
      "riding_horse_with_saddle_and_harness",
      "quality_courtly_garb",
      "staff_of_advisors_and_aides"
    ]
  },
  {
    "id": "artist_apprentice_artist",
    "careerPathId": "artist",
    "rank": 1,
    "name": "Apprentice Artist",
    "status": "Silver 1",
    "characteristicAdvances": [],
    "skillIds": [
      "art_any",
      "cool",
      "consume_alcohol",
      "evaluate",
      "endurance",
      "gossip",
      "perception",
      "stealth_urban"
    ],
    "talentIds": [
      "artistic",
      "sharp",
      "strong_back",
      "tenacious"
    ],
    "trappingIds": [
      "brush_or_chisel_or_quill_pen"
    ]
  },
  {
    "id": "artist_artist",
    "careerPathId": "artist",
    "rank": 2,
    "name": "Artist",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "climb",
      "gamble",
      "haggle",
      "intuition",
      "language_classical",
      "sleight_of_hand",
      "trade_art_supplies"
    ],
    "talentIds": [
      "carouser",
      "criminal",
      "gregarious",
      "nimble_fingered"
    ],
    "trappingIds": [
      "sling_bag_containing_trade_tools_artist"
    ]
  },
  {
    "id": "artist_master_artist",
    "careerPathId": "artist",
    "rank": 3,
    "name": "Master Artist",
    "status": "Silver 5",
    "characteristicAdvances": [],
    "skillIds": [
      "charm",
      "leadership",
      "lore_art",
      "lore_heraldry"
    ],
    "talentIds": [
      "acute_sense_any",
      "dealmaker",
      "etiquette_any",
      "nose_for_trouble"
    ],
    "trappingIds": [
      "apprentice",
      "patron",
      "workshop_artist"
    ]
  },
  {
    "id": "artist_maestro",
    "careerPathId": "artist",
    "rank": 4,
    "name": "Maestro",
    "status": "Gold 2",
    "characteristicAdvances": [],
    "skillIds": [
      "research",
      "ride_horse"
    ],
    "talentIds": [
      "ambidextrous",
      "kingpin",
      "magnum_opus",
      "read_write"
    ],
    "trappingIds": [
      "large_workshop_artist",
      "library_art",
      "3_apprentices"
    ]
  },
  {
    "id": "duellist_fencer",
    "careerPathId": "duellist",
    "rank": 1,
    "name": "Fencer",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "athletics",
      "dodge",
      "endurance",
      "heal",
      "intuition",
      "language_classical",
      "melee_any",
      "perception"
    ],
    "talentIds": [
      "beat_blade",
      "distract",
      "feint",
      "step_aside"
    ],
    "trappingIds": [
      "basic_weapon_or_rapier",
      "sling_bag_containing_clothing_and_1d10_bandages"
    ]
  },
  {
    "id": "duellist_duellist",
    "careerPathId": "duellist",
    "rank": 2,
    "name": "Duellist",
    "status": "Silver 5",
    "characteristicAdvances": [],
    "skillIds": [
      "charm",
      "cool",
      "gamble",
      "melee_parry",
      "ranged_blackpowder",
      "trade_gunsmith"
    ],
    "talentIds": [
      "combat_reflexes",
      "etiquette_any",
      "fast_shot",
      "reversal"
    ],
    "trappingIds": [
      "main_gauche_or_sword_breaker",
      "pistol_with_gunpowder_and_ammunition"
    ]
  },
  {
    "id": "duellist_duelmaster",
    "careerPathId": "duellist",
    "rank": 3,
    "name": "Duelmaster",
    "status": "Gold 1",
    "characteristicAdvances": [],
    "skillIds": [
      "intimidate",
      "leadership",
      "melee_basic",
      "perform_acrobatics"
    ],
    "talentIds": [
      "ambidextrous",
      "disarm",
      "dual_wielder",
      "riposte"
    ],
    "trappingIds": [
      "quality_rapier",
      "hand_weapon",
      "trusty_second",
      "2_wooden_training_swords"
    ]
  },
  {
    "id": "duellist_judicial_champion",
    "careerPathId": "duellist",
    "rank": 4,
    "name": "Judicial Champion",
    "status": "Gold 3",
    "characteristicAdvances": [],
    "skillIds": [
      "lore_law",
      "melee_any"
    ],
    "talentIds": [
      "combat_master",
      "menacing",
      "reaction_strike",
      "strike_to_injure"
    ],
    "trappingIds": [
      "2_quality_weapons"
    ]
  },
  {
    "id": "envoy_herald",
    "careerPathId": "envoy",
    "rank": 1,
    "name": "Herald",
    "status": "Silver 2",
    "characteristicAdvances": [],
    "skillIds": [
      "athletics",
      "charm",
      "drive",
      "dodge",
      "endurance",
      "intuition",
      "ride_horse",
      "row"
    ],
    "talentIds": [
      "blather",
      "etiquette_nobles",
      "read_write",
      "suave"
    ],
    "trappingIds": [
      "leather_jack",
      "livery",
      "scroll_case"
    ]
  },
  {
    "id": "envoy_envoy",
    "careerPathId": "envoy",
    "rank": 2,
    "name": "Envoy",
    "status": "Silver 4",
    "characteristicAdvances": [],
    "skillIds": [
      "art_writing",
      "bribery",
      "cool",
      "gossip",
      "haggle",
      "lore_politics"
    ],
    "talentIds": [
      "attractive",
      "cat_tongued",
      "etiquette_any",
      "seasoned_traveller"
    ],
    "trappingIds": [
      "quill_and_ink",
      "10_sheets_of_parchment"
    ]
  },
  {
    "id": "envoy_diplomat",
    "careerPathId": "envoy",
    "rank": 3,
    "name": "Diplomat",
    "status": "Gold 2",
    "characteristicAdvances": [],
    "skillIds": [
      "intimidate",
      "language_any",
      "leadership",
      "navigation"
    ],
    "talentIds": [
      "carouser",
      "dealmaker",
      "gregarious",
      "schemer"
    ],
    "trappingIds": [
      "aide",
      "quality_clothes",
      "map"
    ]
  },
  {
    "id": "envoy_ambassador",
    "careerPathId": "envoy",
    "rank": 4,
    "name": "Ambassador",
    "status": "Gold 5",
    "characteristicAdvances": [],
    "skillIds": [
      "language_any",
      "lore_any"
    ],
    "talentIds": [
      "briber",
      "commanding_presence",
      "noble_blood",
      "savvy"
    ],
    "trappingIds": [
      "aide",
      "best_quality_courtly_clothes",
      "staff_of_diplomats",
      "herald"
    ]
  },
  {
    "id": "noble_scion",
    "careerPathId": "noble",
    "rank": 1,
    "name": "Scion",
    "status": "Gold 1",
    "characteristicAdvances": [],
    "skillIds": [
      "bribery",
      "consume_alcohol",
      "gamble",
      "intimidate",
      "leadership",
      "lore_heraldry",
      "melee_fencing",
      "play_any"
    ],
    "talentIds": [
      "etiquette_nobles",
      "luck",
      "noble_blood",
      "read_write"
    ],
    "trappingIds": [
      "courtly_garb",
      "foil_or_hand_mirror",
      "jewellery_worth_3d10_gc",
      "personal_servant"
    ]
  },
  {
    "id": "noble_noble",
    "careerPathId": "noble",
    "rank": 2,
    "name": "Noble",
    "status": "Gold 3",
    "characteristicAdvances": [],
    "skillIds": [
      "charm",
      "gossip",
      "language_classical",
      "lore_local",
      "ride_horse",
      "melee_parry"
    ],
    "talentIds": [
      "attractive",
      "briber",
      "carouser",
      "suave"
    ],
    "trappingIds": [
      "4_household_servants",
      "quality_courtly_garb",
      "courtly_garb",
      "riding_horse_with_saddle_and_harness_or_coach",
      "main_gauche_or_quality_cloak",
      "jewellery_worth_50_gc"
    ]
  },
  {
    "id": "noble_magnate",
    "careerPathId": "noble",
    "rank": 3,
    "name": "Magnate",
    "status": "Gold 5",
    "characteristicAdvances": [],
    "skillIds": [
      "language_any",
      "intuition",
      "lore_politics",
      "perception"
    ],
    "talentIds": [
      "coolheaded",
      "dealmaker",
      "public_speaker",
      "schemer"
    ],
    "trappingIds": [
      "2_sets_of_quality_courtly_garb",
      "200_gc",
      "fiefdom",
      "jewellery_worth_200_gc",
      "signet_ring"
    ]
  },
  {
    "id": "noble_noble_lord",
    "careerPathId": "noble",
    "rank": 4,
    "name": "Noble Lord",
    "status": "Gold 7",
    "characteristicAdvances": [],
    "skillIds": [
      "lore_any",
      "track"
    ],
    "talentIds": [
      "commanding_presence",
      "iron_will",
      "warleader",
      "wealthy"
    ],
    "trappingIds": [
      "4_sets_of_best_quality_courtly_garb",
      "quality_foil_or_hand_mirror",
      "500_gc",
      "jewellery_worth_500_gc",
      "province"
    ]
  },
  {
    "id": "servant_menial",
    "careerPathId": "servant",
    "rank": 1,
    "name": "Menial",
    "status": "Silver 1",
    "characteristicAdvances": [],
    "skillIds": [
      "athletics",
      "climb",
      "drive",
      "dodge",
      "endurance",
      "intuition",
      "perception",
      "stealth_any"
    ],
    "talentIds": [
      "beneath_notice",
      "strong_back",
      "strong_minded",
      "sturdy"
    ],
    "trappingIds": [
      "floor_brush"
    ]
  },
  {
    "id": "servant_servant",
    "careerPathId": "servant",
    "rank": 2,
    "name": "Servant",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "animal_care",
      "consume_alcohol",
      "evaluate",
      "gamble",
      "gossip",
      "haggle"
    ],
    "talentIds": [
      "etiquette_servants",
      "shadow",
      "tenacious",
      "well_prepared"
    ],
    "trappingIds": [
      "livery"
    ]
  },
  {
    "id": "servant_attendant",
    "careerPathId": "servant",
    "rank": 3,
    "name": "Attendant",
    "status": "Silver 5",
    "characteristicAdvances": [],
    "skillIds": [
      "charm",
      "cool",
      "intimidate",
      "lore_local"
    ],
    "talentIds": [
      "embezzle",
      "resistance_poison",
      "suave",
      "supportive"
    ],
    "trappingIds": [
      "quality_livery",
      "storm_lantern",
      "tinderbox",
      "lamp_oil"
    ]
  },
  {
    "id": "servant_steward",
    "careerPathId": "servant",
    "rank": 4,
    "name": "Steward",
    "status": "Gold 1",
    "characteristicAdvances": [],
    "skillIds": [
      "leadership",
      "melee_basic"
    ],
    "talentIds": [
      "etiquette_any",
      "numismatics",
      "read_write",
      "savvy"
    ],
    "trappingIds": [
      "hand_weapon",
      "fine_clothes",
      "servant"
    ]
  },
  {
    "id": "spy_informer",
    "careerPathId": "spy",
    "rank": 1,
    "name": "Informer",
    "status": "Brass 3",
    "characteristicAdvances": [],
    "skillIds": [
      "bribery",
      "charm",
      "cool",
      "gamble",
      "gossip",
      "haggle",
      "perception",
      "stealth_any"
    ],
    "talentIds": [
      "blather",
      "carouser",
      "gregarious",
      "shadow"
    ],
    "trappingIds": [
      "charcoal_stick",
      "sling_bag_containing_2_different_sets_of_clothing_and_hooded_cloak"
    ]
  },
  {
    "id": "spy_spy",
    "careerPathId": "spy",
    "rank": 2,
    "name": "Spy",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "climb",
      "entertain_act",
      "intuition",
      "melee_basic",
      "secret_signs_any",
      "sleight_of_hand"
    ],
    "talentIds": [
      "etiquette_any",
      "lip_reading",
      "read_write",
      "secret_identity"
    ],
    "trappingIds": [
      "informer",
      "hand_weapon",
      "disguise_kit",
      "ring_of_informers",
      "telescope"
    ]
  },
  {
    "id": "spy_agent",
    "careerPathId": "spy",
    "rank": 3,
    "name": "Agent",
    "status": "Gold 1",
    "characteristicAdvances": [],
    "skillIds": [
      "animal_care",
      "animal_training_pigeon",
      "language_any",
      "leadership"
    ],
    "talentIds": [
      "attractive",
      "cat_tongued",
      "master_of_disguise",
      "mimic"
    ],
    "trappingIds": [
      "book_cryptography",
      "ring_of_spies_and_informers",
      "loft_of_homing_pigeons",
      "quill_and_ink"
    ]
  },
  {
    "id": "spy_spymaster",
    "careerPathId": "spy",
    "rank": 4,
    "name": "Spymaster",
    "status": "Gold 4",
    "characteristicAdvances": [],
    "skillIds": [
      "lore_any",
      "research"
    ],
    "talentIds": [
      "briber",
      "schemer",
      "suave",
      "tower_of_memories"
    ],
    "trappingIds": [
      "office_and_staff",
      "large_spy_ring_of_agents",
      "spies",
      "and_informers"
    ]
  },
  {
    "id": "warden_custodian",
    "careerPathId": "warden",
    "rank": 1,
    "name": "Custodian",
    "status": "Silver 1",
    "characteristicAdvances": [],
    "skillIds": [
      "athletics",
      "charm_animal",
      "consume_alcohol",
      "cool",
      "endurance",
      "intuition",
      "lore_local",
      "perception"
    ],
    "talentIds": [
      "menacing",
      "night_vision",
      "sharp",
      "strike_to_stun"
    ],
    "trappingIds": [
      "keys",
      "lantern",
      "lamp_oil",
      "livery"
    ]
  },
  {
    "id": "warden_warden",
    "careerPathId": "warden",
    "rank": 2,
    "name": "Warden",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "animal_care",
      "melee_basic",
      "outdoor_survival",
      "ranged_bow",
      "ride_horse",
      "swim"
    ],
    "talentIds": [
      "animal_affinity",
      "etiquette_servants",
      "strider_any",
      "rover"
    ],
    "trappingIds": [
      "hand_weapon_or_bow_with_10_arrows",
      "riding_horse_with_saddle_and_harness",
      "leather_jack"
    ]
  },
  {
    "id": "warden_seneschal",
    "careerPathId": "warden",
    "rank": 3,
    "name": "Seneschal",
    "status": "Gold 1",
    "characteristicAdvances": [],
    "skillIds": [
      "bribery",
      "charm",
      "gossip",
      "leadership"
    ],
    "talentIds": [
      "embezzle",
      "numismatics",
      "read_write",
      "supportive"
    ],
    "trappingIds": [
      "breastplate",
      "ceremonial_staff_of_office",
      "staff_of_wardens_and_custodians"
    ]
  },
  {
    "id": "warden_governor",
    "careerPathId": "warden",
    "rank": 4,
    "name": "Governor",
    "status": "Gold 3",
    "characteristicAdvances": [],
    "skillIds": [
      "evaluate",
      "language_any"
    ],
    "talentIds": [
      "commanding_presence",
      "etiquette_any",
      "savant_local",
      "suave"
    ],
    "trappingIds": [
      "aide",
      "governors_residence",
      "servant"
    ]
  },
  {
    "id": "bailiff_tax_collector",
    "careerPathId": "bailiff",
    "rank": 1,
    "name": "Tax Collector",
    "status": "Silver 1",
    "characteristicAdvances": [],
    "skillIds": [
      "cool",
      "dodge",
      "endurance",
      "gossip",
      "haggle",
      "intimidate",
      "melee",
      "perception"
    ],
    "talentIds": [
      "embezzle",
      "numismatics",
      "strong_back",
      "tenacious"
    ],
    "trappingIds": [
      "hand_weapon",
      "small_lock_box"
    ]
  },
  {
    "id": "bailiff_bailiff",
    "careerPathId": "bailiff",
    "rank": 2,
    "name": "Bailiff",
    "status": "Silver 5",
    "characteristicAdvances": [],
    "skillIds": [
      "bribery",
      "charm",
      "evaluate",
      "intuition",
      "leadership",
      "lore_local"
    ],
    "talentIds": [
      "break_and_enter",
      "criminal",
      "public_speaking",
      "strike_to_stun"
    ],
    "trappingIds": [
      "leather_jack",
      "3_tax_collectors"
    ]
  },
  {
    "id": "bailiff_reeve",
    "careerPathId": "bailiff",
    "rank": 3,
    "name": "Reeve",
    "status": "Gold 1",
    "characteristicAdvances": [],
    "skillIds": [
      "animal_care",
      "lore_heraldry",
      "navigation",
      "ride_horse"
    ],
    "talentIds": [
      "kingpin",
      "menacing",
      "nose_for_trouble",
      "read_write"
    ],
    "trappingIds": [
      "horse_with_saddle_and_tack",
      "breastplate",
      "bailiff"
    ]
  },
  {
    "id": "bailiff_magistrate",
    "careerPathId": "bailiff",
    "rank": 4,
    "name": "Magistrate",
    "status": "Gold 3",
    "characteristicAdvances": [],
    "skillIds": [
      "language_classical",
      "lore_law"
    ],
    "talentIds": [
      "commanding_presence",
      "iron_will",
      "savvy",
      "schemer"
    ],
    "trappingIds": [
      "library_law",
      "quality_robes",
      "seal_of_office"
    ]
  },
  {
    "id": "hedge_witch_hedge_apprentice",
    "careerPathId": "hedge_witch",
    "rank": 1,
    "name": "Hedge Apprentice",
    "status": "Brass 1",
    "characteristicAdvances": [],
    "skillIds": [
      "channelling",
      "endurance",
      "intuition",
      "language_magick",
      "lore_folklore",
      "lore_herbs",
      "outdoor_survival",
      "perception"
    ],
    "talentIds": [
      "fast_hands",
      "petty_magic",
      "rover",
      "strider_woodlands"
    ],
    "trappingIds": [
      "1d10_lucky_charms",
      "quarterstaff",
      "backpack"
    ]
  },
  {
    "id": "hedge_witch_hedge_witch",
    "careerPathId": "hedge_witch",
    "rank": 2,
    "name": "Hedge Witch",
    "status": "Brass 2",
    "characteristicAdvances": [],
    "skillIds": [
      "cool",
      "gossip",
      "heal",
      "lore_local",
      "trade_charms",
      "trade_herbalist"
    ],
    "talentIds": [
      "aethyric_attunement",
      "animal_affinity",
      "arcane_magic_hedgecraft",
      "sixth_sense"
    ],
    "trappingIds": [
      "antitoxin_kit",
      "healing_poultice",
      "trade_tools_herbalist"
    ]
  },
  {
    "id": "hedge_witch_hedge_master",
    "careerPathId": "hedge_witch",
    "rank": 3,
    "name": "Hedge Master",
    "status": "Brass 3",
    "characteristicAdvances": [],
    "skillIds": [
      "haggle",
      "lore_genealogy",
      "lore_magic",
      "lore_spirits"
    ],
    "talentIds": [
      "craftsman_herbalist",
      "magical_sense",
      "pure_soul",
      "resistance_disease"
    ],
    "trappingIds": [
      "isolated_hut",
      "apprentice"
    ]
  },
  {
    "id": "hedge_witch_hedgewise",
    "careerPathId": "hedge_witch",
    "rank": 4,
    "name": "Hedgewise",
    "status": "Brass 5",
    "characteristicAdvances": [],
    "skillIds": [
      "intimidate",
      "pray"
    ],
    "talentIds": [
      "acute_sense_any",
      "master_craftsman_herbalist",
      "night_vision",
      "strong_minded"
    ],
    "trappingIds": [
      "assortment_of_animal_skulls",
      "ceremonial_cloak_and_garland"
    ]
  },
  {
    "id": "herbalist_herb_gatherer",
    "careerPathId": "herbalist",
    "rank": 1,
    "name": "Herb Gatherer",
    "status": "Brass 2",
    "characteristicAdvances": [],
    "skillIds": [
      "charm_animal",
      "climb",
      "endurance",
      "lore_herbs",
      "outdoor_survival",
      "perception",
      "swim",
      "trade_herbalist"
    ],
    "talentIds": [
      "acute_sense_taste",
      "orientation",
      "rover",
      "strider_any"
    ],
    "trappingIds": [
      "boots",
      "cloak",
      "sling_bag_containing_assortment_of_herbs"
    ]
  },
  {
    "id": "herbalist_herbalist",
    "careerPathId": "herbalist",
    "rank": 2,
    "name": "Herbalist",
    "status": "Brass 4",
    "characteristicAdvances": [],
    "skillIds": [
      "consume_alcohol",
      "cool",
      "gossip",
      "haggle",
      "heal",
      "lore_local"
    ],
    "talentIds": [
      "dealmaker",
      "nimble_fingered",
      "sharp",
      "sturdy"
    ],
    "trappingIds": [
      "hand_weapon_sickle",
      "healing_poultice",
      "trade_tools_herbalist"
    ]
  },
  {
    "id": "herbalist_herb_master",
    "careerPathId": "herbalist",
    "rank": 3,
    "name": "Herb Master",
    "status": "Silver 1",
    "characteristicAdvances": [],
    "skillIds": [
      "intuition",
      "leadership",
      "lore_medicine",
      "trade_poisons"
    ],
    "talentIds": [
      "craftsman_herbalist",
      "field_dressing",
      "hardy",
      "savvy"
    ],
    "trappingIds": [
      "herb_gatherer",
      "3_healing_poultices",
      "healing_draught",
      "workshop_herbalist"
    ]
  },
  {
    "id": "herbalist_herbwise",
    "careerPathId": "herbalist",
    "rank": 4,
    "name": "Herbwise",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "drive",
      "navigation"
    ],
    "talentIds": [
      "concoct",
      "master_tradesman_herbalist",
      "resistance_poison",
      "savant_herbs"
    ],
    "trappingIds": [
      "pony_and_cart"
    ]
  },
  {
    "id": "hunter_trapper",
    "careerPathId": "hunter",
    "rank": 1,
    "name": "Trapper",
    "status": "Brass 2",
    "characteristicAdvances": [],
    "skillIds": [
      "charm_animal",
      "climb",
      "endurance",
      "lore_beasts",
      "outdoor_survival",
      "perception",
      "ranged_bow",
      "set_trap"
    ],
    "talentIds": [
      "hardy",
      "rover",
      "strider_any",
      "trapper"
    ],
    "trappingIds": [
      "selection_of_animal_traps",
      "hand_weapon",
      "sturdy_boots_and_cloak"
    ]
  },
  {
    "id": "hunter_hunter",
    "careerPathId": "hunter",
    "rank": 2,
    "name": "Hunter",
    "status": "Brass 4",
    "characteristicAdvances": [],
    "skillIds": [
      "cool",
      "intuition",
      "melee_basic",
      "ranged_sling",
      "secret_signs_hunter",
      "stealth_rural"
    ],
    "talentIds": [
      "accurate_shot",
      "fast_shot",
      "hunters_eye",
      "marksman"
    ],
    "trappingIds": [
      "bow_with_10_arrows",
      "sling_with_ammunition"
    ]
  },
  {
    "id": "hunter_tracker",
    "careerPathId": "hunter",
    "rank": 3,
    "name": "Tracker",
    "status": "Silver 1",
    "characteristicAdvances": [],
    "skillIds": [
      "navigation",
      "ride_horse",
      "swim",
      "track"
    ],
    "talentIds": [
      "acute_sense_any",
      "deadeye_shot",
      "fearless_animals",
      "sharpshooter"
    ],
    "trappingIds": [
      "backpack",
      "bedroll",
      "tent"
    ]
  },
  {
    "id": "hunter_huntsmaster",
    "careerPathId": "hunter",
    "rank": 4,
    "name": "Huntsmaster",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "animal_care",
      "animal_training_any"
    ],
    "talentIds": [
      "fearless_monsters",
      "robust",
      "sniper",
      "sure_shot"
    ],
    "trappingIds": [
      "riding_horse_with_saddle_and_tack",
      "kennel_of_hunting_dogs"
    ]
  },
  {
    "id": "miner_prospector",
    "careerPathId": "miner",
    "rank": 1,
    "name": "Prospector",
    "status": "Brass 2",
    "characteristicAdvances": [],
    "skillIds": [
      "cool",
      "endurance",
      "intuition",
      "lore_local",
      "melee_two_handed",
      "outdoor_survival",
      "perception",
      "swim"
    ],
    "talentIds": [
      "rover",
      "strider_rocky",
      "sturdy",
      "tenacious"
    ],
    "trappingIds": [
      "charcoal_stick",
      "crude_map",
      "pan",
      "spade"
    ]
  },
  {
    "id": "miner_miner",
    "careerPathId": "miner",
    "rank": 2,
    "name": "Miner",
    "status": "Brass 4",
    "characteristicAdvances": [],
    "skillIds": [
      "climb",
      "consume_alcohol",
      "evaluate",
      "melee_basic",
      "secret_signs_miner",
      "trade_explosives"
    ],
    "talentIds": [
      "night_vision",
      "strike_mighty_blow",
      "strong_back",
      "very_strong"
    ],
    "trappingIds": [
      "davrich_lamp",
      "hand_weapon_pick",
      "lamp_oil",
      "leather_jack"
    ]
  },
  {
    "id": "miner_master_miner",
    "careerPathId": "miner",
    "rank": 3,
    "name": "Master Miner",
    "status": "Brass 5",
    "characteristicAdvances": [],
    "skillIds": [
      "gossip",
      "lore_geology",
      "stealth_underground",
      "trade_engineer"
    ],
    "talentIds": [
      "careful_strike",
      "craftsman_explosives",
      "tinker",
      "tunnel_rat"
    ],
    "trappingIds": [
      "great_weapon_two_handed_pick",
      "helmet",
      "trade_tools_engineer"
    ]
  },
  {
    "id": "miner_mine_foreman",
    "careerPathId": "miner",
    "rank": 4,
    "name": "Mine Foreman",
    "status": "Silver 4",
    "characteristicAdvances": [],
    "skillIds": [
      "charm",
      "leadership"
    ],
    "talentIds": [
      "argumentative",
      "strong_minded",
      "embezzle",
      "read_write"
    ],
    "trappingIds": [
      "crew_of_miners",
      "writing_kit"
    ]
  },
  {
    "id": "mystic_fortune_teller",
    "careerPathId": "mystic",
    "rank": 1,
    "name": "Fortune Teller",
    "status": "Brass 1",
    "characteristicAdvances": [],
    "skillIds": [
      "charm",
      "entertain_fortune_telling",
      "dodge",
      "gossip",
      "haggle",
      "intuition",
      "perception",
      "sleight_of_hand"
    ],
    "talentIds": [
      "attractive",
      "luck",
      "second_sight",
      "suave"
    ],
    "trappingIds": [
      "deck_of_cards_or_dice",
      "cheap_jewellery"
    ]
  },
  {
    "id": "mystic_mystic",
    "careerPathId": "mystic",
    "rank": 2,
    "name": "Mystic",
    "status": "Brass 2",
    "characteristicAdvances": [],
    "skillIds": [
      "bribery",
      "cool",
      "entertain_prophecy",
      "evaluate",
      "intimidate",
      "lore_astrology"
    ],
    "talentIds": [
      "detect_artefact",
      "holy_visions",
      "sixth_sense",
      "well_prepared"
    ],
    "trappingIds": [
      "selection_of_amulets"
    ]
  },
  {
    "id": "mystic_sage",
    "careerPathId": "mystic",
    "rank": 3,
    "name": "Sage",
    "status": "Brass 3",
    "characteristicAdvances": [],
    "skillIds": [
      "charm_animal",
      "entertain_storytelling",
      "language_any",
      "trade_writing"
    ],
    "talentIds": [
      "nose_for_trouble",
      "petty_magic",
      "read_write",
      "witch"
    ],
    "trappingIds": [
      "trade_tools_writing"
    ]
  },
  {
    "id": "mystic_seer",
    "careerPathId": "mystic",
    "rank": 4,
    "name": "Seer",
    "status": "Brass 4",
    "characteristicAdvances": [],
    "skillIds": [
      "lore_prophecy",
      "channelling_azyr"
    ],
    "talentIds": [
      "arcane_magic_celestial",
      "magical_sense",
      "menacing",
      "strong_minded"
    ],
    "trappingIds": [
      "trade_tools_astrology"
    ]
  },
  {
    "id": "scout_guide",
    "careerPathId": "scout",
    "rank": 1,
    "name": "Guide",
    "status": "Brass 3",
    "characteristicAdvances": [],
    "skillIds": [
      "charm_animal",
      "climb",
      "endurance",
      "gossip",
      "lore_local",
      "melee_basic",
      "outdoor_survival",
      "perception"
    ],
    "talentIds": [
      "orientation",
      "rover",
      "sharp",
      "strider_any"
    ],
    "trappingIds": [
      "hand_weapon",
      "leather_jack",
      "sturdy_boots_and_cloak",
      "rope"
    ]
  },
  {
    "id": "scout_scout",
    "careerPathId": "scout",
    "rank": 2,
    "name": "Scout",
    "status": "Brass 5",
    "characteristicAdvances": [],
    "skillIds": [
      "athletics",
      "navigation",
      "ranged_bow",
      "ride_horse",
      "stealth_rural",
      "track"
    ],
    "talentIds": [
      "combat_aware",
      "night_vision",
      "nose_for_trouble",
      "seasoned_traveller"
    ],
    "trappingIds": [
      "bow_and_10_arrows",
      "mail_shirt"
    ]
  },
  {
    "id": "scout_pathfinder",
    "careerPathId": "scout",
    "rank": 3,
    "name": "Pathfinder",
    "status": "Silver 1",
    "characteristicAdvances": [],
    "skillIds": [
      "animal_care",
      "haggle",
      "secret_signs_hunter",
      "swim"
    ],
    "talentIds": [
      "acute_sense_sight",
      "sixth_sense",
      "strong_legs",
      "very_resilient"
    ],
    "trappingIds": [
      "map",
      "riding_horse_with_saddle_and_tack",
      "saddlebags_with_2_weeks_rations",
      "tent"
    ]
  },
  {
    "id": "scout_explorer",
    "careerPathId": "scout",
    "rank": 4,
    "name": "Explorer",
    "status": "Silver 5",
    "characteristicAdvances": [],
    "skillIds": [
      "language_any",
      "trade_cartographer"
    ],
    "talentIds": [
      "hardy",
      "linguistics",
      "savant_local",
      "tenacious"
    ],
    "trappingIds": [
      "selection_of_maps",
      "trade_tools_cartographer"
    ]
  },
  {
    "id": "villager_peasant",
    "careerPathId": "villager",
    "rank": 1,
    "name": "Peasant",
    "status": "Brass 2",
    "characteristicAdvances": [],
    "skillIds": [
      "animal_care",
      "athletics",
      "consume_alcohol",
      "endurance",
      "gossip",
      "melee_brawling",
      "lore_local",
      "outdoor_survival"
    ],
    "talentIds": [
      "rover",
      "strong_back",
      "strong_minded",
      "stone_soup"
    ],
    "trappingIds": [
      "none"
    ]
  },
  {
    "id": "villager_villager",
    "careerPathId": "villager",
    "rank": 2,
    "name": "Villager",
    "status": "Brass 3",
    "characteristicAdvances": [],
    "skillIds": [
      "drive",
      "entertain_storytelling",
      "haggle",
      "melee_basic",
      "trade_any"
    ],
    "talentIds": [
      "animal_affinity",
      "hardy",
      "tenacious",
      "very_strong"
    ],
    "trappingIds": [
      "leather_jerkin",
      "hand_weapon_axe",
      "trade_tools_as_trade"
    ]
  },
  {
    "id": "villager_councillor",
    "careerPathId": "villager",
    "rank": 3,
    "name": "Councillor",
    "status": "Brass 4",
    "characteristicAdvances": [],
    "skillIds": [
      "bribery",
      "charm",
      "intimidate",
      "leadership"
    ],
    "talentIds": [
      "craftsman_any",
      "dealmaker",
      "stout_hearted",
      "very_resilient"
    ],
    "trappingIds": [
      "mule_and_cart",
      "village_home_and_workshop"
    ]
  },
  {
    "id": "villager_village_elder",
    "careerPathId": "villager",
    "rank": 4,
    "name": "Village Elder",
    "status": "Silver 2",
    "characteristicAdvances": [],
    "skillIds": [
      "intuition",
      "lore_history"
    ],
    "talentIds": [
      "master_tradesman_any",
      "nimble_fingered",
      "public_speaker",
      "savant_local"
    ],
    "trappingIds": [
      "the_respect_of_the_village"
    ]
  },
  {
    "id": "bounty_hunter_thief_taker",
    "careerPathId": "bounty_hunter",
    "rank": 1,
    "name": "Thief-taker",
    "status": "Silver 1",
    "characteristicAdvances": [],
    "skillIds": [
      "bribery",
      "charm",
      "gossip",
      "haggle",
      "intuition",
      "melee_basic",
      "outdoor_survival",
      "perception"
    ],
    "talentIds": [
      "break_and_enter",
      "shadow",
      "strike_to_stun",
      "suave"
    ],
    "trappingIds": [
      "hand_weapon",
      "leather_jerkin",
      "rope"
    ]
  },
  {
    "id": "bounty_hunter_bounty_hunter",
    "careerPathId": "bounty_hunter",
    "rank": 2,
    "name": "Bounty Hunter",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "athletics",
      "endurance",
      "intimidate",
      "ranged_crossbow",
      "ranged_entangling",
      "track"
    ],
    "talentIds": [
      "marksman",
      "relentless",
      "seasoned_traveller",
      "strong_back"
    ],
    "trappingIds": [
      "crossbow_and_10_bolts",
      "leather_skullcap",
      "manacles",
      "net",
      "warrant_papers"
    ]
  },
  {
    "id": "bounty_hunter_master_bounty_hunter",
    "careerPathId": "bounty_hunter",
    "rank": 3,
    "name": "Master Bounty Hunter",
    "status": "Silver 5",
    "characteristicAdvances": [],
    "skillIds": [
      "animal_care",
      "climb",
      "ride_horse",
      "swim"
    ],
    "talentIds": [
      "accurate_shot",
      "careful_strike",
      "dual_wielder",
      "sprinter"
    ],
    "trappingIds": [
      "mail_shirt",
      "riding_horse_and_saddle"
    ]
  },
  {
    "id": "bounty_hunter_bounty_hunter_general",
    "careerPathId": "bounty_hunter",
    "rank": 4,
    "name": "Bounty Hunter General",
    "status": "Gold 1",
    "characteristicAdvances": [],
    "skillIds": [
      "drive",
      "lore_law"
    ],
    "talentIds": [
      "deadeye_shot",
      "fearless_bounties",
      "hardy",
      "sure_shot"
    ],
    "trappingIds": [
      "draught_horse_and_cart",
      "mail_shirt",
      "4_pairs_of_manacles"
    ]
  },
  {
    "id": "coachman_postilion",
    "careerPathId": "coachman",
    "rank": 1,
    "name": "Postilion",
    "status": "Silver 1",
    "characteristicAdvances": [],
    "skillIds": [
      "animal_care",
      "charm_animal",
      "climb",
      "drive",
      "endurance",
      "perception",
      "ranged_entangling",
      "ride_horse"
    ],
    "talentIds": [
      "animal_affinity",
      "seasoned_traveller",
      "trick_riding",
      "tenacious"
    ],
    "trappingIds": [
      "warm_coat_and_gloves",
      "whip"
    ]
  },
  {
    "id": "coachman_coachman",
    "careerPathId": "coachman",
    "rank": 2,
    "name": "Coachman",
    "status": "Silver 2",
    "characteristicAdvances": [],
    "skillIds": [
      "consume_alcohol",
      "gossip",
      "intuition",
      "lore_local",
      "navigation",
      "ranged_blackpowder"
    ],
    "talentIds": [
      "coolheaded",
      "crack_the_whip",
      "gunner",
      "strong_minded"
    ],
    "trappingIds": [
      "blunderbuss_with_10_shots",
      "coach_horn",
      "leather_jack",
      "hat"
    ]
  },
  {
    "id": "coachman_coach_master",
    "careerPathId": "coachman",
    "rank": 3,
    "name": "Coach Master",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "animal_training_horse",
      "intimidate",
      "language_any",
      "lore_routes"
    ],
    "talentIds": [
      "accurate_shot",
      "dealmaker",
      "fearless_outlaws",
      "nose_for_trouble"
    ],
    "trappingIds": [
      "mail_shirt",
      "pistol",
      "quality_cloak"
    ]
  },
  {
    "id": "coachman_route_master",
    "careerPathId": "coachman",
    "rank": 4,
    "name": "Route Master",
    "status": "Silver 5",
    "characteristicAdvances": [],
    "skillIds": [
      "charm",
      "leadership"
    ],
    "talentIds": [
      "fearless_beastmen",
      "marksman",
      "orientation",
      "rapid_reload"
    ],
    "trappingIds": [
      "fleet_of_coaches_and_horses",
      "maps"
    ]
  },
  {
    "id": "entertainer_busker",
    "careerPathId": "entertainer",
    "rank": 1,
    "name": "Busker",
    "status": "Brass 3",
    "characteristicAdvances": [],
    "skillIds": [
      "athletics",
      "charm",
      "entertain_any",
      "gossip",
      "haggle",
      "perform_any",
      "play_any",
      "sleight_of_hand"
    ],
    "talentIds": [
      "attractive",
      "mimic",
      "public_speaking",
      "suave"
    ],
    "trappingIds": [
      "bowl",
      "instrument"
    ]
  },
  {
    "id": "entertainer_entertainer",
    "careerPathId": "entertainer",
    "rank": 2,
    "name": "Entertainer",
    "status": "Brass 5",
    "characteristicAdvances": [],
    "skillIds": [
      "entertain_any",
      "ride_any",
      "melee_basic",
      "perform_any",
      "play_any_ranged_throwing"
    ],
    "talentIds": [
      "contortionist",
      "jump_up",
      "sharpshooter",
      "trick_riding"
    ],
    "trappingIds": [
      "costume",
      "instrument",
      "selection_of_scripts_that_you_cant_yet_read",
      "throwing_weapons"
    ]
  },
  {
    "id": "entertainer_troubadour",
    "careerPathId": "entertainer",
    "rank": 3,
    "name": "Troubadour",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "animal_care",
      "animal_training",
      "art_writing",
      "language_any"
    ],
    "talentIds": [
      "blather",
      "master_of_disguise",
      "perfect_pitch",
      "read_write"
    ],
    "trappingIds": [
      "trained_animal",
      "writing_kit"
    ]
  },
  {
    "id": "entertainer_troupe_leader",
    "careerPathId": "entertainer",
    "rank": 4,
    "name": "Troupe Leader",
    "status": "Gold 1",
    "characteristicAdvances": [],
    "skillIds": [
      "drive",
      "leadership"
    ],
    "talentIds": [
      "dealmaker",
      "etiquette_any",
      "seasoned_traveller",
      "sharp"
    ],
    "trappingIds": [
      "draught_horses_and_wagon_stage",
      "wardrobe_of_costumes_and_props",
      "troupe_of_entertainers"
    ]
  },
  {
    "id": "flagellant_zealot",
    "careerPathId": "flagellant",
    "rank": 1,
    "name": "Zealot",
    "status": "Brass 0",
    "characteristicAdvances": [],
    "skillIds": [
      "dodge",
      "endurance",
      "heal",
      "intimidate",
      "intuition",
      "lore_sigmar",
      "melee_flail",
      "outdoor_survival"
    ],
    "talentIds": [
      "berserk_charge",
      "frenzy",
      "read_write",
      "stone_soup"
    ],
    "trappingIds": [
      "flail",
      "tattered_robes"
    ]
  },
  {
    "id": "flagellant_flagellant",
    "careerPathId": "flagellant",
    "rank": 2,
    "name": "Flagellant",
    "status": "Brass 0",
    "characteristicAdvances": [],
    "skillIds": [
      "art_icons",
      "athletics",
      "cool",
      "language_classical",
      "lore_the_empire",
      "ranged_sling"
    ],
    "talentIds": [
      "hardy",
      "hatred_heretics",
      "flagellant",
      "implacable"
    ],
    "trappingIds": [
      "placard",
      "religious_symbol",
      "sling"
    ]
  },
  {
    "id": "flagellant_penitent",
    "careerPathId": "flagellant",
    "rank": 3,
    "name": "Penitent",
    "status": "Brass 0",
    "characteristicAdvances": [],
    "skillIds": [
      "charm",
      "language_any",
      "lore_theology",
      "perception"
    ],
    "talentIds": [
      "field_dressing",
      "furious_assault",
      "menacing",
      "seasoned_traveller"
    ],
    "trappingIds": [
      "religious_relic"
    ]
  },
  {
    "id": "flagellant_prophet_of_doom",
    "careerPathId": "flagellant",
    "rank": 4,
    "name": "Prophet of Doom",
    "status": "Brass 0",
    "characteristicAdvances": [],
    "skillIds": [
      "entertain_speeches",
      "leadership"
    ],
    "talentIds": [
      "battle_rage",
      "fearless_heretics",
      "frightening",
      "impassioned_zeal"
    ],
    "trappingIds": [
      "book_religion",
      "followers_including_penitents",
      "flagellants",
      "and_zealots"
    ]
  },
  {
    "id": "messenger_runner",
    "careerPathId": "messenger",
    "rank": 1,
    "name": "Runner",
    "status": "Brass 3",
    "characteristicAdvances": [],
    "skillIds": [
      "athletics",
      "climb",
      "dodge",
      "endurance",
      "gossip",
      "navigation",
      "perception",
      "melee_brawling"
    ],
    "talentIds": [
      "flee",
      "fleet_footed",
      "sprinter",
      "step_aside"
    ],
    "trappingIds": [
      "scroll_case"
    ]
  },
  {
    "id": "messenger_messenger",
    "careerPathId": "messenger",
    "rank": 2,
    "name": "Messenger",
    "status": "Silver 1",
    "characteristicAdvances": [],
    "skillIds": [
      "animal_care",
      "charm",
      "cool",
      "lore_local",
      "melee_basic",
      "ride_horse"
    ],
    "talentIds": [
      "crack_the_whip",
      "criminal",
      "orientation",
      "seasoned_traveller"
    ],
    "trappingIds": [
      "hand_weapon",
      "leather_jack",
      "riding_horse_with_saddle_and_tack"
    ]
  },
  {
    "id": "messenger_courier",
    "careerPathId": "messenger",
    "rank": 3,
    "name": "Courier",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "charm_animal",
      "bribery",
      "consume_alcohol",
      "outdoor_survival"
    ],
    "talentIds": [
      "nose_for_trouble",
      "relentless",
      "tenacious",
      "trick_rider"
    ],
    "trappingIds": [
      "backpack",
      "saddlebags",
      "shield"
    ]
  },
  {
    "id": "messenger_courier_captain",
    "careerPathId": "messenger",
    "rank": 4,
    "name": "Courier-Captain",
    "status": "Silver 5",
    "characteristicAdvances": [],
    "skillIds": [
      "intimidate",
      "leadership"
    ],
    "talentIds": [
      "dealmaker",
      "hatred_outlaws",
      "kingpin",
      "very_resilient"
    ],
    "trappingIds": [
      "couriers",
      "mail_shirt",
      "writing_kit"
    ]
  },
  {
    "id": "pedlar_vagabond",
    "careerPathId": "pedlar",
    "rank": 1,
    "name": "Vagabond",
    "status": "Brass 1",
    "characteristicAdvances": [],
    "skillIds": [
      "charm",
      "endurance",
      "entertain_storytelling",
      "gossip",
      "haggle",
      "intuition",
      "outdoor_survival",
      "stealth_rural_or_urban"
    ],
    "talentIds": [
      "fisherman",
      "flee",
      "rover",
      "tinker"
    ],
    "trappingIds": [
      "backpack",
      "bedroll",
      "goods_worth_2d10_brass",
      "tent"
    ]
  },
  {
    "id": "pedlar_pedlar",
    "careerPathId": "pedlar",
    "rank": 2,
    "name": "Pedlar",
    "status": "Brass 4",
    "characteristicAdvances": [],
    "skillIds": [
      "animal_care",
      "charm_animal",
      "consume_alcohol",
      "evaluate",
      "ride_horse",
      "trade_tinker"
    ],
    "talentIds": [
      "dealmaker",
      "orientation",
      "seasoned_traveller",
      "strong_back"
    ],
    "trappingIds": [
      "mule_and_saddlebags",
      "goods_worth_2d10_silver",
      "selection_of_pots_and_pans",
      "trade_tools_tinker"
    ]
  },
  {
    "id": "pedlar_master_pedlar",
    "careerPathId": "pedlar",
    "rank": 3,
    "name": "Master Pedlar",
    "status": "Silver 1",
    "characteristicAdvances": [],
    "skillIds": [
      "drive",
      "intimidate",
      "language_any",
      "perception"
    ],
    "talentIds": [
      "numismatics",
      "sharp",
      "sturdy",
      "well_prepared",
      "very_resilient"
    ],
    "trappingIds": [
      "cart",
      "goods_worth_at_least_2d10_gold"
    ]
  },
  {
    "id": "pedlar_wandering_trader",
    "careerPathId": "pedlar",
    "rank": 4,
    "name": "Wandering Trader",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "lore_local",
      "lore_geography"
    ],
    "talentIds": [
      "cat_tongued",
      "strong_minded",
      "suave",
      "tenacious"
    ],
    "trappingIds": [
      "draught_horse_and_wagon",
      "goods_worth_at_least_5d10_gold",
      "50_silver_in_coin"
    ]
  },
  {
    "id": "road_warden_toll_keeper",
    "careerPathId": "road_warden",
    "rank": 1,
    "name": "Toll Keeper",
    "status": "Brass 5",
    "characteristicAdvances": [],
    "skillIds": [
      "bribery",
      "consume_alcohol",
      "gamble",
      "gossip",
      "haggle",
      "melee_basic",
      "perception",
      "ranged_crossbow"
    ],
    "talentIds": [
      "coolheaded",
      "embezzle",
      "marksman",
      "numismatics"
    ],
    "trappingIds": [
      "crossbow_with_10_bolts",
      "leather_jack"
    ]
  },
  {
    "id": "road_warden_road_warden",
    "careerPathId": "road_warden",
    "rank": 2,
    "name": "Road Warden",
    "status": "Silver 2",
    "characteristicAdvances": [],
    "skillIds": [
      "animal_care",
      "endurance",
      "intimidate",
      "intuition",
      "outdoor_survival",
      "ride_horse"
    ],
    "talentIds": [
      "crack_the_whip",
      "criminal",
      "roughrider",
      "seasoned_traveller"
    ],
    "trappingIds": [
      "hand_weapon",
      "mail_shirt",
      "riding_horse_with_saddle_and_harness",
      "rope"
    ]
  },
  {
    "id": "road_warden_road_sergeant",
    "careerPathId": "road_warden",
    "rank": 3,
    "name": "Road Sergeant",
    "status": "Silver 4",
    "characteristicAdvances": [],
    "skillIds": [
      "athletics",
      "charm",
      "leadership",
      "ranged_blackpowder"
    ],
    "talentIds": [
      "etiquette_soldiers",
      "fearless_outlaws",
      "hatred_any",
      "nose_for_trouble"
    ],
    "trappingIds": [
      "squad_of_road_wardens",
      "pistol_with_10_shots",
      "shield",
      "symbol_of_rank"
    ]
  },
  {
    "id": "road_warden_road_captain",
    "careerPathId": "road_warden",
    "rank": 4,
    "name": "Road Captain",
    "status": "Gold 1",
    "characteristicAdvances": [],
    "skillIds": [
      "lore_empire",
      "navigation"
    ],
    "talentIds": [
      "combat_aware",
      "commanding_presence",
      "kingpin",
      "public_speaker"
    ],
    "trappingIds": [
      "light_warhorse",
      "pistol_with_10_shots",
      "quality_hat_and_cloak",
      "unit_of_road_wardens"
    ]
  },
  {
    "id": "witch_hunter_interrogator",
    "careerPathId": "witch_hunter",
    "rank": 1,
    "name": "Interrogator",
    "status": "Silver 1",
    "characteristicAdvances": [],
    "skillIds": [
      "charm",
      "consume_alcohol",
      "heal",
      "intimidate",
      "intuition",
      "lore_torture",
      "melee_fist",
      "perception"
    ],
    "talentIds": [
      "coolheaded",
      "menacing",
      "read_write",
      "resolute"
    ],
    "trappingIds": [
      "hand_weapon",
      "instruments_of_torture"
    ]
  },
  {
    "id": "witch_hunter_witch_hunter",
    "careerPathId": "witch_hunter",
    "rank": 2,
    "name": "Witch Hunter",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "cool",
      "dodge",
      "gossip",
      "lore_witches",
      "ranged_any",
      "ride_horse"
    ],
    "talentIds": [
      "dual_wielder",
      "marksman",
      "seasoned_traveller",
      "shadow"
    ],
    "trappingIds": [
      "crossbow_pistol_or_pistol",
      "hat_henin",
      "leather_jack",
      "riding_horse_with_saddle_and_tack",
      "rope",
      "silvered_sword"
    ]
  },
  {
    "id": "witch_hunter_inquisitor",
    "careerPathId": "witch_hunter",
    "rank": 3,
    "name": "Inquisitor",
    "status": "Silver 5",
    "characteristicAdvances": [],
    "skillIds": [
      "endurance",
      "leadership",
      "lore_law",
      "lore_local"
    ],
    "talentIds": [
      "fearless_witches",
      "nose_for_trouble",
      "relentless",
      "strong_minded"
    ],
    "trappingIds": [
      "quality_clothing",
      "subordinate_interrogators"
    ]
  },
  {
    "id": "witch_hunter_witchfinder_general",
    "careerPathId": "witch_hunter",
    "rank": 4,
    "name": "Witchfinder General",
    "status": "Gold 1",
    "characteristicAdvances": [],
    "skillIds": [
      "lore_chaos",
      "lore_politics"
    ],
    "talentIds": [
      "frightening",
      "iron_will",
      "magical_sense",
      "pure_soul"
    ],
    "trappingIds": [
      "best_quality_courtly_garb",
      "subordinate_witch_hunters"
    ]
  },
  {
    "id": "boatman_boat_hand",
    "careerPathId": "boatman",
    "rank": 1,
    "name": "Boat-hand",
    "status": "Silver 1",
    "characteristicAdvances": [],
    "skillIds": [
      "consume_alcohol",
      "dodge",
      "endurance",
      "gossip",
      "melee_basic",
      "row",
      "sail",
      "swim"
    ],
    "talentIds": [
      "dirty_fighting",
      "fisherman",
      "strong_back",
      "strong_swimmer"
    ],
    "trappingIds": [
      "hand_weapon_boat_hook",
      "leather_jack",
      "pole"
    ]
  },
  {
    "id": "boatman_boatman",
    "careerPathId": "boatman",
    "rank": 2,
    "name": "Boatman",
    "status": "Silver 2",
    "characteristicAdvances": [],
    "skillIds": [
      "athletics",
      "entertain_storytelling",
      "haggle",
      "intuition",
      "lore_riverways",
      "perception"
    ],
    "talentIds": [
      "etiquette_guilder",
      "seasoned_traveller",
      "very_strong",
      "waterman"
    ],
    "trappingIds": [
      "rope",
      "rowboat"
    ]
  },
  {
    "id": "boatman_bargeswain",
    "careerPathId": "boatman",
    "rank": 3,
    "name": "Bargeswain",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "climb",
      "entertain_singing",
      "heal",
      "trade_boatbuilding"
    ],
    "talentIds": [
      "dealmaker",
      "embezzle",
      "nose_for_trouble",
      "strike_mighty_blow"
    ],
    "trappingIds": [
      "backpack",
      "trade_tools_carpenter"
    ]
  },
  {
    "id": "boatman_barge_master",
    "careerPathId": "boatman",
    "rank": 4,
    "name": "Barge Master",
    "status": "Silver 5",
    "characteristicAdvances": [],
    "skillIds": [
      "leadership",
      "navigation"
    ],
    "talentIds": [
      "menacing",
      "orientation",
      "pilot",
      "public_speaker"
    ],
    "trappingIds": [
      "hat",
      "riverboat_and_crew"
    ]
  },
  {
    "id": "huffer_riverguide",
    "careerPathId": "huffer",
    "rank": 1,
    "name": "Riverguide",
    "status": "Brass 4",
    "characteristicAdvances": [],
    "skillIds": [
      "consume_alcohol",
      "gossip",
      "intuition",
      "lore_local",
      "lore_riverways",
      "perception",
      "row",
      "swim"
    ],
    "talentIds": [
      "fisherman",
      "night_vision",
      "orientation",
      "waterman"
    ],
    "trappingIds": [
      "hand_weapon_boat_hook",
      "storm_lantern_and_oil"
    ]
  },
  {
    "id": "huffer_huffer",
    "careerPathId": "huffer",
    "rank": 2,
    "name": "Huffer",
    "status": "Silver 1",
    "characteristicAdvances": [],
    "skillIds": [
      "charm",
      "cool",
      "entertain_storytelling",
      "language_any",
      "melee_basic",
      "navigation"
    ],
    "talentIds": [
      "dealmaker",
      "etiquette_guilder",
      "nose_for_trouble",
      "river_guide"
    ],
    "trappingIds": [
      "leather_jerkin",
      "rope",
      "row_boat"
    ]
  },
  {
    "id": "huffer_pilot",
    "careerPathId": "huffer",
    "rank": 3,
    "name": "Pilot",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "haggle",
      "intimidate",
      "lore_local",
      "lore_wrecks"
    ],
    "talentIds": [
      "acute_sense_sight",
      "pilot",
      "sea_legs",
      "very_strong"
    ],
    "trappingIds": [
      "pole",
      "storm_lantern_and_oil"
    ]
  },
  {
    "id": "huffer_master_pilot",
    "careerPathId": "huffer",
    "rank": 4,
    "name": "Master Pilot",
    "status": "Silver 5",
    "characteristicAdvances": [],
    "skillIds": [
      "leadership",
      "sail"
    ],
    "talentIds": [
      "sixth_sense",
      "sharp",
      "strong_swimmer",
      "tenacious"
    ],
    "trappingIds": [
      "boathand",
      "small_riverboat"
    ]
  },
  {
    "id": "riverwarden_river_recruit",
    "careerPathId": "riverwarden",
    "rank": 1,
    "name": "River Recruit",
    "status": "Silver 1",
    "characteristicAdvances": [],
    "skillIds": [
      "athletics",
      "dodge",
      "endurance",
      "melee_basic",
      "perception",
      "row",
      "sail",
      "swim"
    ],
    "talentIds": [
      "strong_swimmer",
      "strong_back",
      "very_strong",
      "waterman"
    ],
    "trappingIds": [
      "hand_weapon_sword",
      "leather_jack",
      "uniform"
    ]
  },
  {
    "id": "riverwarden_riverwarden",
    "careerPathId": "riverwarden",
    "rank": 2,
    "name": "Riverwarden",
    "status": "Silver 2",
    "characteristicAdvances": [],
    "skillIds": [
      "bribery",
      "charm",
      "intimidate",
      "gossip",
      "lore_riverways",
      "ranged_blackpowder"
    ],
    "talentIds": [
      "criminal",
      "gunner",
      "fisherman",
      "seasoned_traveller"
    ],
    "trappingIds": [
      "lantern_and_oil",
      "pistol_with_10_shot",
      "shield"
    ]
  },
  {
    "id": "riverwarden_shipsword",
    "careerPathId": "riverwarden",
    "rank": 3,
    "name": "Shipsword",
    "status": "Silver 4",
    "characteristicAdvances": [],
    "skillIds": [
      "climb",
      "cool",
      "intuition",
      "leadership"
    ],
    "talentIds": [
      "fearless_wreckers",
      "hatred_any",
      "pilot",
      "sea_legs"
    ],
    "trappingIds": [
      "grappling_hook",
      "helmet",
      "mail_shirt"
    ]
  },
  {
    "id": "riverwarden_shipsword_master",
    "careerPathId": "riverwarden",
    "rank": 4,
    "name": "Shipsword Master",
    "status": "Gold 1",
    "characteristicAdvances": [],
    "skillIds": [
      "lore_law",
      "navigation"
    ],
    "talentIds": [
      "commanding_presence",
      "kingpin",
      "menacing",
      "orientation"
    ],
    "trappingIds": [
      "patrol_boats_and_crew",
      "symbol_of_rank"
    ]
  },
  {
    "id": "riverwoman_greenfish",
    "careerPathId": "riverwoman",
    "rank": 1,
    "name": "Greenfish",
    "status": "Brass 2",
    "characteristicAdvances": [],
    "skillIds": [
      "athletics",
      "consume_alcohol",
      "dodge",
      "endurance",
      "gossip",
      "outdoor_survival",
      "row",
      "swim"
    ],
    "talentIds": [
      "fisherman",
      "gregarious",
      "strider_marshes",
      "strong_swimmer"
    ],
    "trappingIds": [
      "bucket",
      "fishing_rod_and_bait",
      "leather_leggings"
    ]
  },
  {
    "id": "riverwoman_riverwoman",
    "careerPathId": "riverwoman",
    "rank": 2,
    "name": "Riverwoman",
    "status": "Brass 3",
    "characteristicAdvances": [],
    "skillIds": [
      "gamble",
      "lore_local",
      "lore_riverways",
      "ranged_entangling",
      "ranged_throwing",
      "set_trap"
    ],
    "talentIds": [
      "craftsman_boatbuilder",
      "rover",
      "strong_back",
      "waterman"
    ],
    "trappingIds": [
      "eel_trap",
      "leather_jerkin",
      "net",
      "spear"
    ]
  },
  {
    "id": "riverwoman_riverwise",
    "careerPathId": "riverwoman",
    "rank": 3,
    "name": "Riverwise",
    "status": "Brass 5",
    "characteristicAdvances": [],
    "skillIds": [
      "charm",
      "intuition",
      "melee_polearm",
      "perception"
    ],
    "talentIds": [
      "savant_riverways",
      "stout_hearted",
      "tenacious",
      "very_strong"
    ],
    "trappingIds": [
      "row_boat",
      "storm_lantern_and_oil"
    ]
  },
  {
    "id": "riverwoman_river_elder",
    "careerPathId": "riverwoman",
    "rank": 4,
    "name": "River Elder",
    "status": "Silver 2",
    "characteristicAdvances": [],
    "skillIds": [
      "entertain_storytelling",
      "lore_folklore"
    ],
    "talentIds": [
      "master_craftsman_boatbuilder",
      "public_speaker",
      "sharp",
      "strong_minded"
    ],
    "trappingIds": [
      "hut_or_riverboat"
    ]
  },
  {
    "id": "seaman_landsman",
    "careerPathId": "seaman",
    "rank": 1,
    "name": "Landsman",
    "status": "Silver 1",
    "characteristicAdvances": [],
    "skillIds": [
      "climb",
      "consume_alcohol",
      "gamble",
      "gossip",
      "row",
      "melee_brawling",
      "sail",
      "swim"
    ],
    "talentIds": [
      "fisherman",
      "strider_coastal",
      "strong_back",
      "strong_swimmer"
    ],
    "trappingIds": [
      "bucket",
      "brush",
      "mop"
    ]
  },
  {
    "id": "seaman_seaman",
    "careerPathId": "seaman",
    "rank": 2,
    "name": "Seaman",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "athletics",
      "dodge",
      "endurance",
      "entertain_singing",
      "language_any",
      "melee_basic"
    ],
    "talentIds": [
      "catfall",
      "sea_legs",
      "seasoned_traveller",
      "strong_legs"
    ],
    "trappingIds": [
      "hand_weapon_boat_hook",
      "leather_jerkin"
    ]
  },
  {
    "id": "seaman_boatswain",
    "careerPathId": "seaman",
    "rank": 3,
    "name": "Boatswain",
    "status": "Silver 5",
    "characteristicAdvances": [],
    "skillIds": [
      "cool",
      "leadership",
      "perception",
      "trade_carpenter"
    ],
    "talentIds": [
      "old_salt",
      "strike_mighty_blow",
      "tenacious",
      "very_strong"
    ],
    "trappingIds": [
      "trade_tools_carpenter"
    ]
  },
  {
    "id": "seaman_ships_master",
    "careerPathId": "seaman",
    "rank": 4,
    "name": "Ship’s Master",
    "status": "Gold 2",
    "characteristicAdvances": [],
    "skillIds": [
      "charm",
      "navigation"
    ],
    "talentIds": [
      "orientation",
      "pilot",
      "public_speaking",
      "savvy"
    ],
    "trappingIds": [
      "shipping_charts",
      "sailing_ship_and_crew",
      "sextant",
      "spyglass"
    ]
  },
  {
    "id": "smuggler_river_runner",
    "careerPathId": "smuggler",
    "rank": 1,
    "name": "River Runner",
    "status": "Brass 2",
    "characteristicAdvances": [],
    "skillIds": [
      "athletics",
      "bribery",
      "cool",
      "consume_alcohol",
      "row",
      "sail",
      "stealth_rural_or_urban",
      "swim"
    ],
    "talentIds": [
      "criminal",
      "fisherman",
      "strider_marshes",
      "strong_back"
    ],
    "trappingIds": [
      "large_sack",
      "mask_or_scarves",
      "tinderbox",
      "storm_lantern_and_oil"
    ]
  },
  {
    "id": "smuggler_smuggler",
    "careerPathId": "smuggler",
    "rank": 2,
    "name": "Smuggler",
    "status": "Brass 3",
    "characteristicAdvances": [],
    "skillIds": [
      "haggle",
      "charm",
      "gossip",
      "lore_local",
      "melee_basic",
      "perception",
      "secret_signs_smuggler"
    ],
    "talentIds": [
      "dealmaker",
      "etiquette_criminals",
      "waterman",
      "very_strong"
    ],
    "trappingIds": [
      "2_barrels",
      "hand_weapon",
      "leather_jack",
      "row_boat"
    ]
  },
  {
    "id": "smuggler_master_smuggler",
    "careerPathId": "smuggler",
    "rank": 3,
    "name": "Master Smuggler",
    "status": "Brass 5",
    "characteristicAdvances": [],
    "skillIds": [
      "evaluate",
      "intimidate",
      "intuition",
      "lore_riverways"
    ],
    "talentIds": [
      "briber",
      "fearless_riverwardens",
      "pilot",
      "strong_swimmer"
    ],
    "trappingIds": [
      "river_runner",
      "speedy_riverboat"
    ]
  },
  {
    "id": "smuggler_smuggler_king",
    "careerPathId": "smuggler",
    "rank": 4,
    "name": "Smuggler King",
    "status": "Silver 2",
    "characteristicAdvances": [],
    "skillIds": [
      "language_any",
      "leadership"
    ],
    "talentIds": [
      "kingpin",
      "savvy",
      "strider_coastal",
      "sea_legs"
    ],
    "trappingIds": [
      "disguise_kit",
      "small_fleet_of_riverboats"
    ]
  },
  {
    "id": "stevedore_dockhand",
    "careerPathId": "stevedore",
    "rank": 1,
    "name": "Dockhand",
    "status": "Brass 3",
    "characteristicAdvances": [],
    "skillIds": [
      "athletics",
      "climb",
      "consume_alcohol",
      "dodge",
      "endurance",
      "gossip",
      "melee_basic",
      "swim"
    ],
    "talentIds": [
      "dirty_fighting",
      "strong_back",
      "sturdy",
      "very_strong"
    ],
    "trappingIds": [
      "hand_weapon_boat_hook",
      "leather_gloves"
    ]
  },
  {
    "id": "stevedore_stevedore",
    "careerPathId": "stevedore",
    "rank": 2,
    "name": "Stevedore",
    "status": "Silver 1",
    "characteristicAdvances": [],
    "skillIds": [
      "bribery",
      "entertain_storytelling",
      "gamble",
      "intimidate",
      "perception",
      "stealth_urban"
    ],
    "talentIds": [
      "criminal",
      "etiquette_guilders",
      "strong_legs",
      "tenacious"
    ],
    "trappingIds": [
      "guild_licence",
      "leather_jerkin",
      "pipe_and_tobacco",
      "porter_cap"
    ]
  },
  {
    "id": "stevedore_foreman",
    "careerPathId": "stevedore",
    "rank": 3,
    "name": "Foreman",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "cool",
      "evaluate",
      "intuition",
      "leadership"
    ],
    "talentIds": [
      "dealmaker",
      "embezzle",
      "etiquette_criminals",
      "public_speaking"
    ],
    "trappingIds": [
      "gang_of_stevedores",
      "whistle"
    ]
  },
  {
    "id": "stevedore_dock_master",
    "careerPathId": "stevedore",
    "rank": 4,
    "name": "Dock Master",
    "status": "Silver 5",
    "characteristicAdvances": [],
    "skillIds": [
      "charm",
      "lore_taxes"
    ],
    "talentIds": [
      "kingpin",
      "menacing",
      "numismatics",
      "read_write"
    ],
    "trappingIds": [
      "office_and_staff",
      "writing_kit"
    ]
  },
  {
    "id": "wrecker_cargo_scavenger",
    "careerPathId": "wrecker",
    "rank": 1,
    "name": "Cargo Scavenger",
    "status": "Brass 2",
    "characteristicAdvances": [],
    "skillIds": [
      "climb",
      "consume_alcohol",
      "dodge",
      "endurance",
      "row",
      "melee_basic",
      "outdoor_survival",
      "swim"
    ],
    "talentIds": [
      "break_and_enter",
      "criminal",
      "fisherman",
      "strong_back"
    ],
    "trappingIds": [
      "crowbar",
      "large_sack",
      "leather_gloves"
    ]
  },
  {
    "id": "wrecker_wrecker",
    "careerPathId": "wrecker",
    "rank": 2,
    "name": "Wrecker",
    "status": "Brass 3",
    "characteristicAdvances": [],
    "skillIds": [
      "bribery",
      "cool",
      "intuition",
      "navigation",
      "perception",
      "set_trap"
    ],
    "talentIds": [
      "flee",
      "rover",
      "strong_swimmer",
      "trapper"
    ],
    "trappingIds": [
      "hand_weapon_boat_hook",
      "leather_jack",
      "storm_lantern_and_oil"
    ]
  },
  {
    "id": "wrecker_river_pirate",
    "careerPathId": "wrecker",
    "rank": 3,
    "name": "River Pirate",
    "status": "Brass 5",
    "characteristicAdvances": [],
    "skillIds": [
      "gossip",
      "intimidate",
      "ranged_crossbow",
      "stealth_rural"
    ],
    "talentIds": [
      "dirty_fighting",
      "etiquette_criminals",
      "menacing",
      "waterman"
    ],
    "trappingIds": [
      "crossbow_with_10_bolts",
      "grappling_hook_and_rope",
      "riverboat"
    ]
  },
  {
    "id": "wrecker_wrecker_captain",
    "careerPathId": "wrecker",
    "rank": 4,
    "name": "Wrecker Captain",
    "status": "Silver 2",
    "characteristicAdvances": [],
    "skillIds": [
      "leadership",
      "lore_riverways"
    ],
    "talentIds": [
      "furious_assault",
      "in_fighter",
      "pilot",
      "warrior_born"
    ],
    "trappingIds": [
      "fleet_of_riverboats_and_wrecker_crew",
      "keg_of_ale",
      "manacles"
    ]
  },
  {
    "id": "bawd_hustler",
    "careerPathId": "bawd",
    "rank": 1,
    "name": "Hustler",
    "status": "Brass 1",
    "characteristicAdvances": [],
    "skillIds": [
      "bribery",
      "charm",
      "consume_alcohol",
      "entertain_any",
      "gamble",
      "gossip",
      "haggle",
      "intimidate"
    ],
    "talentIds": [
      "attractive",
      "alley_cat",
      "blather",
      "gregarious"
    ],
    "trappingIds": [
      "flask_of_spirits"
    ]
  },
  {
    "id": "bawd_bawd",
    "careerPathId": "bawd",
    "rank": 2,
    "name": "Bawd",
    "status": "Brass 3",
    "characteristicAdvances": [],
    "skillIds": [
      "dodge",
      "endurance",
      "intuition",
      "lore_local",
      "melee_basic",
      "perception"
    ],
    "talentIds": [
      "ambidextrous",
      "carouser",
      "criminal",
      "resistant_disease"
    ],
    "trappingIds": [
      "dose_of_weirdroot",
      "quality_clothing"
    ]
  },
  {
    "id": "bawd_procurer",
    "careerPathId": "bawd",
    "rank": 3,
    "name": "Procurer",
    "status": "Silver 1",
    "characteristicAdvances": [],
    "skillIds": [
      "cool",
      "evaluate",
      "language_any",
      "lore_law"
    ],
    "talentIds": [
      "dealmaker",
      "embezzle",
      "etiquette_any",
      "suave"
    ],
    "trappingIds": [
      "a_ring_of_hustlers"
    ]
  },
  {
    "id": "bawd_ringleader",
    "careerPathId": "bawd",
    "rank": 4,
    "name": "Ringleader",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "leadership",
      "lore_heraldry"
    ],
    "talentIds": [
      "briber",
      "kingpin",
      "numismatics",
      "savvy"
    ],
    "trappingIds": [
      "townhouse_with_discreet_back_entrance",
      "a_ring_of_bawds"
    ]
  },
  {
    "id": "charlatan_swindler",
    "careerPathId": "charlatan",
    "rank": 1,
    "name": "Swindler",
    "status": "Brass 3",
    "characteristicAdvances": [],
    "skillIds": [
      "bribery",
      "consume_alcohol",
      "charm",
      "entertain_storytelling",
      "gamble",
      "gossip",
      "haggle",
      "sleight_of_hand"
    ],
    "talentIds": [
      "cardsharp",
      "diceman",
      "etiquette_any",
      "luck"
    ],
    "trappingIds": [
      "backpack",
      "2_sets_of_clothing",
      "deck_of_cards",
      "dice"
    ]
  },
  {
    "id": "charlatan_charlatan",
    "careerPathId": "charlatan",
    "rank": 2,
    "name": "Charlatan",
    "status": "Brass 5",
    "characteristicAdvances": [],
    "skillIds": [
      "cool",
      "dodge",
      "entertain_acting",
      "evaluate",
      "intuition",
      "perception"
    ],
    "talentIds": [
      "blather",
      "criminal",
      "fast_hands",
      "secret_identity"
    ],
    "trappingIds": [
      "1_forged_document",
      "2_sets_of_quality_clothing",
      "selection_of_coloured_powders_and_water",
      "selection_of_trinkets_and_charms"
    ]
  },
  {
    "id": "charlatan_con_artist",
    "careerPathId": "charlatan",
    "rank": 3,
    "name": "Con Artist",
    "status": "Silver 2",
    "characteristicAdvances": [],
    "skillIds": [
      "language_thief",
      "lore_heraldry",
      "pick_lock",
      "secret_signs_thief"
    ],
    "talentIds": [
      "attractive",
      "cat_tongued",
      "dealmaker",
      "read_write"
    ],
    "trappingIds": [
      "disguise_kit",
      "lock_picks",
      "multiple_forged_documents"
    ]
  },
  {
    "id": "charlatan_scoundrel",
    "careerPathId": "charlatan",
    "rank": 4,
    "name": "Scoundrel",
    "status": "Silver 4",
    "characteristicAdvances": [],
    "skillIds": [
      "lore_genealogy",
      "research"
    ],
    "talentIds": [
      "gregarious",
      "master_of_disguise",
      "nose_for_trouble",
      "suave"
    ],
    "trappingIds": [
      "forged_seal",
      "writing_kit"
    ]
  },
  {
    "id": "fence_broker",
    "careerPathId": "fence",
    "rank": 1,
    "name": "Broker",
    "status": "Silver 1",
    "characteristicAdvances": [],
    "skillIds": [
      "charm",
      "consume_alcohol",
      "dodge",
      "evaluate",
      "gamble",
      "gossip",
      "haggle",
      "melee_basic"
    ],
    "talentIds": [
      "alley_cat",
      "cardsharp",
      "dealmaker",
      "gregarious"
    ],
    "trappingIds": [
      "hand_weapon",
      "stolen_goods_worth_3d10_shillings"
    ]
  },
  {
    "id": "fence_fence",
    "careerPathId": "fence",
    "rank": 2,
    "name": "Fence",
    "status": "Silver 2",
    "characteristicAdvances": [],
    "skillIds": [
      "cool",
      "intimidate",
      "intuition",
      "perception",
      "secret_signs_thief",
      "trade_engraver"
    ],
    "talentIds": [
      "criminal",
      "etiquette_criminals",
      "numismatics",
      "savvy"
    ],
    "trappingIds": [
      "eye_glass",
      "trade_tools_engraver",
      "writing_kit"
    ]
  },
  {
    "id": "fence_master_fence",
    "careerPathId": "fence",
    "rank": 3,
    "name": "Master Fence",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "bribery",
      "entertain_storytelling",
      "lore_art",
      "lore_local"
    ],
    "talentIds": [
      "kingpin",
      "strike_to_stun",
      "suave",
      "super_numerate"
    ],
    "trappingIds": [
      "pawnbrokers_shop"
    ]
  },
  {
    "id": "fence_black_marketeer",
    "careerPathId": "fence",
    "rank": 4,
    "name": "Black Marketeer",
    "status": "Silver 4",
    "characteristicAdvances": [],
    "skillIds": [
      "lore_heraldry",
      "research"
    ],
    "talentIds": [
      "dirty_fighting",
      "iron_will",
      "menacing",
      "briber"
    ],
    "trappingIds": [
      "hired_muscle",
      "network_of_informants",
      "warehouse"
    ]
  },
  {
    "id": "grave_robber_body_snatcher",
    "careerPathId": "grave_robber",
    "rank": 1,
    "name": "Body Snatcher",
    "status": "Brass 2",
    "characteristicAdvances": [],
    "skillIds": [
      "climb",
      "cool",
      "dodge",
      "endurance",
      "gossip",
      "intuition",
      "perception",
      "stealth_any"
    ],
    "talentIds": [
      "alley_cat",
      "criminal",
      "flee",
      "strong_back"
    ],
    "trappingIds": [
      "crowbar",
      "handcart",
      "hooded_cloak",
      "tarpaulin"
    ]
  },
  {
    "id": "grave_robber_grave_robber",
    "careerPathId": "grave_robber",
    "rank": 2,
    "name": "Grave Robber",
    "status": "Brass 3",
    "characteristicAdvances": [],
    "skillIds": [
      "bribery",
      "endurance",
      "evaluate",
      "haggle",
      "lore_medicine",
      "melee_basic"
    ],
    "talentIds": [
      "break_and_enter",
      "night_vision",
      "resistance_disease",
      "very_strong"
    ],
    "trappingIds": [
      "backpack",
      "hand_weapon",
      "spade",
      "storm_lantern_and_oil"
    ]
  },
  {
    "id": "grave_robber_tomb_robber",
    "careerPathId": "grave_robber",
    "rank": 3,
    "name": "Tomb Robber",
    "status": "Silver 1",
    "characteristicAdvances": [],
    "skillIds": [
      "drive",
      "lore_history",
      "pick_lock",
      "set_trap"
    ],
    "talentIds": [
      "read_write",
      "strike_mighty_blow",
      "tenacious",
      "tunnel_rat"
    ],
    "trappingIds": [
      "hand_weapon_pick",
      "horse_and_cart",
      "leather_jack",
      "rope",
      "trade_tools_thief"
    ]
  },
  {
    "id": "grave_robber_treasure_hunter",
    "careerPathId": "grave_robber",
    "rank": 4,
    "name": "Treasure Hunter",
    "status": "Silver 5",
    "characteristicAdvances": [],
    "skillIds": [
      "navigation",
      "trade_engineer"
    ],
    "talentIds": [
      "fearless_undead",
      "sixth_sense",
      "strong_minded",
      "trapper"
    ],
    "trappingIds": [
      "bedroll",
      "maps",
      "tent",
      "trade_tools_engineer",
      "writing_kit"
    ]
  },
  {
    "id": "outlaw_brigand",
    "careerPathId": "outlaw",
    "rank": 1,
    "name": "Brigand",
    "status": "Brass 1",
    "characteristicAdvances": [],
    "skillIds": [
      "athletics",
      "consume_alcohol",
      "cool",
      "endurance",
      "gamble",
      "intimidate",
      "melee_basic",
      "outdoor_survival"
    ],
    "talentIds": [
      "combat_aware",
      "criminal",
      "rover",
      "flee"
    ],
    "trappingIds": [
      "bedroll",
      "hand_weapon",
      "leather_jerkin",
      "tinderbox"
    ]
  },
  {
    "id": "outlaw_outlaw",
    "careerPathId": "outlaw",
    "rank": 2,
    "name": "Outlaw",
    "status": "Brass 2",
    "characteristicAdvances": [],
    "skillIds": [
      "dodge",
      "heal",
      "lore_local",
      "perception",
      "ranged_bow",
      "stealth_rural"
    ],
    "talentIds": [
      "dirty_fighting",
      "marksman",
      "strike_to_stun",
      "trapper"
    ],
    "trappingIds": [
      "bow_with_10_arrows",
      "shield",
      "tent"
    ]
  },
  {
    "id": "outlaw_outlaw_chief",
    "careerPathId": "outlaw",
    "rank": 3,
    "name": "Outlaw Chief",
    "status": "Brass 4",
    "characteristicAdvances": [],
    "skillIds": [
      "gossip",
      "intuition",
      "leadership",
      "ride_horse"
    ],
    "talentIds": [
      "rapid_reload",
      "roughrider",
      "menacing",
      "very_resilient"
    ],
    "trappingIds": [
      "helmet",
      "riding_horse_with_saddle_and_tack",
      "sleeved_mail_shirt",
      "band_of_outlaws"
    ]
  },
  {
    "id": "outlaw_bandit_king",
    "careerPathId": "outlaw",
    "rank": 4,
    "name": "Bandit King",
    "status": "Silver 2",
    "characteristicAdvances": [],
    "skillIds": [
      "charm",
      "lore_empire"
    ],
    "talentIds": [
      "deadeye_shot",
      "fearless_road_wardens",
      "iron_will",
      "robust"
    ],
    "trappingIds": [
      "fiefdom_of_outlaw_chiefs",
      "lair"
    ]
  },
  {
    "id": "racketeer_thug",
    "careerPathId": "racketeer",
    "rank": 1,
    "name": "Thug",
    "status": "Brass 3",
    "characteristicAdvances": [],
    "skillIds": [
      "consume_alcohol",
      "cool",
      "dodge",
      "endurance",
      "intimidate",
      "lore_local",
      "melee_brawling",
      "stealth_urban"
    ],
    "talentIds": [
      "criminal",
      "etiquette_criminals",
      "menacing",
      "strike_mighty_blow"
    ],
    "trappingIds": [
      "knuckledusters",
      "leather_jack"
    ]
  },
  {
    "id": "racketeer_racketeer",
    "careerPathId": "racketeer",
    "rank": 2,
    "name": "Racketeer",
    "status": "Brass 5",
    "characteristicAdvances": [],
    "skillIds": [
      "bribery",
      "charm",
      "evaluate",
      "gossip",
      "language_estalian_or_tilean",
      "melee_basic"
    ],
    "talentIds": [
      "embezzle",
      "street_fighting",
      "strike_to_stun",
      "warrior_born"
    ],
    "trappingIds": [
      "hand_weapon",
      "hat",
      "mail_shirt"
    ]
  },
  {
    "id": "racketeer_gang_boss",
    "careerPathId": "racketeer",
    "rank": 3,
    "name": "Gang Boss",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "intuition",
      "leadership",
      "perception",
      "ranged_crossbow"
    ],
    "talentIds": [
      "fearless_watchmen",
      "iron_will",
      "resistance_poison",
      "robust"
    ],
    "trappingIds": [
      "crossbow_pistol_with_10_bolts",
      "gang_of_thugs_and_racketeers",
      "lair"
    ]
  },
  {
    "id": "racketeer_crime_lord",
    "careerPathId": "racketeer",
    "rank": 4,
    "name": "Crime Lord",
    "status": "Silver 5",
    "characteristicAdvances": [],
    "skillIds": [
      "lore_law",
      "lore_politics"
    ],
    "talentIds": [
      "commanding_presence",
      "kingpin",
      "frightening",
      "wealthy"
    ],
    "trappingIds": [
      "network_of_informers",
      "quality_clothing_and_hat",
      "subordinate_gang_bosses"
    ]
  },
  {
    "id": "thief_prowler",
    "careerPathId": "thief",
    "rank": 1,
    "name": "Prowler",
    "status": "Brass 1",
    "characteristicAdvances": [],
    "skillIds": [
      "athletics",
      "climb",
      "cool",
      "dodge",
      "endurance",
      "intuition",
      "perception",
      "stealth_urban"
    ],
    "talentIds": [
      "alley_cat",
      "criminal",
      "flee",
      "strike_to_stun"
    ],
    "trappingIds": [
      "crowbar",
      "leather_jerkin",
      "sack"
    ]
  },
  {
    "id": "thief_thief",
    "careerPathId": "thief",
    "rank": 2,
    "name": "Thief",
    "status": "Brass 3",
    "characteristicAdvances": [],
    "skillIds": [
      "evaluate",
      "gossip",
      "lore_local",
      "pick_lock",
      "secret_signs_thief",
      "sleight_of_hand"
    ],
    "talentIds": [
      "break_and_enter",
      "etiquette_criminals",
      "fast_hands",
      "shadow"
    ],
    "trappingIds": [
      "trade_tools_thief",
      "rope"
    ]
  },
  {
    "id": "thief_master_thief",
    "careerPathId": "thief",
    "rank": 3,
    "name": "Master Thief",
    "status": "Brass 5",
    "characteristicAdvances": [],
    "skillIds": [
      "bribery",
      "gamble",
      "intimidate",
      "ranged_crossbow"
    ],
    "talentIds": [
      "night_vision",
      "nimble_fingered",
      "step_aside",
      "trapper"
    ],
    "trappingIds": [
      "crossbow_pistol_with_10_bolts",
      "throwing_knives"
    ]
  },
  {
    "id": "thief_cat_burglar",
    "careerPathId": "thief",
    "rank": 4,
    "name": "Cat Burglar",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "charm",
      "set_trap"
    ],
    "talentIds": [
      "catfall",
      "scale_sheer_surface",
      "strong_legs",
      "wealthy"
    ],
    "trappingIds": [
      "dark_clothing",
      "grappling_hook",
      "mask_or_scarves"
    ]
  },
  {
    "id": "witch_hexer",
    "careerPathId": "witch",
    "rank": 1,
    "name": "Hexer",
    "status": "Brass 1",
    "characteristicAdvances": [],
    "skillIds": [
      "channelling",
      "cool",
      "endurance",
      "gossip",
      "intimidate",
      "language_magick",
      "sleight_of_hand",
      "stealth_rural"
    ],
    "talentIds": [
      "criminal",
      "instinctive_diction",
      "menacing",
      "petty_magic"
    ],
    "trappingIds": [
      "candles",
      "chalk",
      "doll",
      "pins"
    ]
  },
  {
    "id": "witch_witch",
    "careerPathId": "witch",
    "rank": 2,
    "name": "Witch",
    "status": "Brass 2",
    "characteristicAdvances": [],
    "skillIds": [
      "charm_animal",
      "dodge",
      "intuition",
      "melee_polearm",
      "perception",
      "trade_herbalist"
    ],
    "talentIds": [
      "arcane_magic_witchery",
      "attractive",
      "sixth_sense",
      "witch"
    ],
    "trappingIds": [
      "quarterstaff",
      "sack",
      "selection_of_herbs",
      "trade_tools_herbalist"
    ]
  },
  {
    "id": "witch_wyrd",
    "careerPathId": "witch",
    "rank": 3,
    "name": "Wyrd",
    "status": "Brass 3",
    "characteristicAdvances": [],
    "skillIds": [
      "bribery",
      "charm",
      "haggle",
      "lore_dark_magic"
    ],
    "talentIds": [
      "animal_affinity",
      "fast_hands",
      "frightening",
      "magical_sense"
    ],
    "trappingIds": [
      "backpack",
      "cloak_with_several_pockets",
      "lucky_charm"
    ]
  },
  {
    "id": "witch_warlock",
    "careerPathId": "witch",
    "rank": 4,
    "name": "Warlock",
    "status": "Brass 5",
    "characteristicAdvances": [],
    "skillIds": [
      "lore_daemonology",
      "lore_magic"
    ],
    "talentIds": [
      "aethyric_attunement",
      "luck",
      "strong_minded",
      "very_resilient"
    ],
    "trappingIds": [
      "robes",
      "skull"
    ]
  },
  {
    "id": "cavalryman_horseman",
    "careerPathId": "cavalryman",
    "rank": 1,
    "name": "Horseman",
    "status": "Silver 2",
    "characteristicAdvances": [],
    "skillIds": [
      "animal_care",
      "charm_animal",
      "endurance",
      "language_battle",
      "melee_basic",
      "outdoor_survival",
      "perception",
      "ride_horse"
    ],
    "talentIds": [
      "combat_aware",
      "crack_the_whip",
      "lightning_reflexes",
      "roughrider"
    ],
    "trappingIds": [
      "leather_jack",
      "riding_horse_with_saddle_and_tack"
    ]
  },
  {
    "id": "cavalryman_cavalryman",
    "careerPathId": "cavalryman",
    "rank": 2,
    "name": "Cavalryman",
    "status": "Silver 4",
    "characteristicAdvances": [],
    "skillIds": [
      "charm",
      "consume_alcohol",
      "cool",
      "gossip",
      "melee_cavalry",
      "ranged_blackpowder"
    ],
    "talentIds": [
      "etiquette_soldiers",
      "gunner",
      "seasoned_traveller",
      "trick_riding"
    ],
    "trappingIds": [
      "breastplate",
      "demilance",
      "helmet",
      "light_warhorse_with_saddle_and_tack",
      "pistol_with_10_shots",
      "shield"
    ]
  },
  {
    "id": "cavalryman_cavalry_sergeant",
    "careerPathId": "cavalryman",
    "rank": 3,
    "name": "Cavalry Sergeant",
    "status": "Gold 1",
    "characteristicAdvances": [],
    "skillIds": [
      "intimidate",
      "intuition",
      "leadership",
      "lore_warfare"
    ],
    "talentIds": [
      "combat_reflexes",
      "fast_shot",
      "hatred_any",
      "warleader"
    ],
    "trappingIds": [
      "sash"
    ]
  },
  {
    "id": "cavalryman_cavalry_officer",
    "careerPathId": "cavalryman",
    "rank": 4,
    "name": "Cavalry Officer",
    "status": "Gold 2",
    "characteristicAdvances": [],
    "skillIds": [
      "gamble",
      "lore_heraldry"
    ],
    "talentIds": [
      "accurate_shot",
      "inspiring",
      "reaction_strike",
      "robust"
    ],
    "trappingIds": [
      "deck_of_cards",
      "quality_clothing"
    ]
  },
  {
    "id": "guard_sentry",
    "careerPathId": "guard",
    "rank": 1,
    "name": "Sentry",
    "status": "Silver 1",
    "characteristicAdvances": [],
    "skillIds": [
      "consume_alcohol",
      "endurance",
      "entertain_storytelling",
      "gamble",
      "gossip",
      "intuition",
      "melee_basic",
      "perception"
    ],
    "talentIds": [
      "diceman",
      "etiquette_servants",
      "strike_to_stun",
      "tenacious"
    ],
    "trappingIds": [
      "buckler",
      "leather_jerkin",
      "storm_lantern_with_oil"
    ]
  },
  {
    "id": "guard_guard",
    "careerPathId": "guard",
    "rank": 2,
    "name": "Guard",
    "status": "Silver 2",
    "characteristicAdvances": [],
    "skillIds": [
      "athletics",
      "cool",
      "dodge",
      "intimidate",
      "melee_polearm",
      "ranged_bow"
    ],
    "talentIds": [
      "relentless",
      "reversal",
      "shieldsman",
      "strike_mighty_blow"
    ],
    "trappingIds": [
      "bow_with_10_arrows",
      "sleeved_mail_shirt",
      "shield",
      "spear"
    ]
  },
  {
    "id": "guard_honour_guard",
    "careerPathId": "guard",
    "rank": 3,
    "name": "Honour Guard",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "heal",
      "language_battle",
      "lore_etiquette",
      "melee_two_handed"
    ],
    "talentIds": [
      "fearless_intruders",
      "jump_up",
      "stout_hearted",
      "unshakeable"
    ],
    "trappingIds": [
      "great_weapon_or_halberd",
      "helmet",
      "uniform"
    ]
  },
  {
    "id": "guard_guard_officer",
    "careerPathId": "guard",
    "rank": 4,
    "name": "Guard Officer",
    "status": "Silver 5",
    "characteristicAdvances": [],
    "skillIds": [
      "leadership",
      "lore_warfare"
    ],
    "talentIds": [
      "combat_master",
      "furious_assault",
      "iron_will",
      "robust"
    ],
    "trappingIds": [
      "breastplate"
    ]
  },
  {
    "id": "knight_squire",
    "careerPathId": "knight",
    "rank": 1,
    "name": "Squire",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "athletics",
      "animal_care",
      "charm_animal",
      "heal",
      "lore_heraldry",
      "melee_cavalry",
      "ride_horse",
      "trade_farrier"
    ],
    "talentIds": [
      "etiquette_any",
      "roughrider",
      "sturdy",
      "warrior_born"
    ],
    "trappingIds": [
      "leather_jack",
      "mail_shirt",
      "riding_horse_with_saddle_and_tack",
      "shield",
      "trade_tools_farrier"
    ]
  },
  {
    "id": "knight_knight",
    "careerPathId": "knight",
    "rank": 2,
    "name": "Knight",
    "status": "Silver 5",
    "characteristicAdvances": [],
    "skillIds": [
      "cool",
      "dodge",
      "endurance",
      "intimidate",
      "language_battle",
      "melee_any"
    ],
    "talentIds": [
      "menacing",
      "seasoned_traveller",
      "shieldsman",
      "strike_mighty_blow"
    ],
    "trappingIds": [
      "destrier_with_saddle_and_tack",
      "melee_weapon_any",
      "lance",
      "plate_armour_and_helm"
    ]
  },
  {
    "id": "knight_first_knight",
    "careerPathId": "knight",
    "rank": 3,
    "name": "First Knight",
    "status": "Gold 2",
    "characteristicAdvances": [],
    "skillIds": [
      "charm",
      "consume_alcohol",
      "leadership",
      "lore_warfare"
    ],
    "talentIds": [
      "fearless_any",
      "stout_hearted",
      "unshakeable",
      "warleader"
    ],
    "trappingIds": [
      "barding",
      "small_unit_of_knights"
    ]
  },
  {
    "id": "knight_knight_of_the_inner_circle",
    "careerPathId": "knight",
    "rank": 4,
    "name": "Knight of the Inner Circle",
    "status": "Gold 4",
    "characteristicAdvances": [],
    "skillIds": [
      "lore_any",
      "secret_signs_knightly_order"
    ],
    "talentIds": [
      "disarm",
      "inspiring",
      "iron_will",
      "strike_to_injure"
    ],
    "trappingIds": [
      "plumed_great_helm",
      "squire",
      "large_unit_of_knights_or_several_small_units_of_knights"
    ]
  },
  {
    "id": "pit_fighter_pugilist",
    "careerPathId": "pit_fighter",
    "rank": 1,
    "name": "Pugilist",
    "status": "Brass 4",
    "characteristicAdvances": [],
    "skillIds": [
      "athletics",
      "cool",
      "dodge",
      "endurance",
      "gamble",
      "intimidate",
      "melee_any",
      "melee_brawling"
    ],
    "talentIds": [
      "dirty_fighter",
      "in_fighter",
      "iron_jaw",
      "reversal"
    ],
    "trappingIds": [
      "bandages",
      "knuckledusters",
      "leather_jack"
    ]
  },
  {
    "id": "pit_fighter_pit_fighter",
    "careerPathId": "pit_fighter",
    "rank": 2,
    "name": "Pit Fighter",
    "status": "Silver 2",
    "characteristicAdvances": [],
    "skillIds": [
      "haggle",
      "intuition",
      "melee_basic",
      "melee_flail_or_two_handed",
      "perception",
      "ranged_entangling"
    ],
    "talentIds": [
      "ambidextrous",
      "combat_reflexes",
      "dual_wielder",
      "shieldsman"
    ],
    "trappingIds": [
      "flail_or_great_weapon",
      "hand_weapon",
      "net_or_whip",
      "shield_or_buckler"
    ]
  },
  {
    "id": "pit_fighter_pit_champion",
    "careerPathId": "pit_fighter",
    "rank": 3,
    "name": "Pit Champion",
    "status": "Silver 5",
    "characteristicAdvances": [],
    "skillIds": [
      "consume_alcohol",
      "gossip",
      "lore_anatomy",
      "perform_fight"
    ],
    "talentIds": [
      "combat_master",
      "disarm",
      "menacing",
      "robust"
    ],
    "trappingIds": [
      "breast_plate",
      "helmet"
    ]
  },
  {
    "id": "pit_fighter_pit_legend",
    "careerPathId": "pit_fighter",
    "rank": 4,
    "name": "Pit Legend",
    "status": "Gold 2",
    "characteristicAdvances": [],
    "skillIds": [
      "charm",
      "ranged_any"
    ],
    "talentIds": [
      "frightening",
      "furious_assault",
      "implacable",
      "reaction_strike"
    ],
    "trappingIds": [
      "quality_helmet"
    ]
  },
  {
    "id": "protagonist_braggart",
    "careerPathId": "protagonist",
    "rank": 1,
    "name": "Braggart",
    "status": "Brass 2",
    "characteristicAdvances": [],
    "skillIds": [
      "athletics",
      "dodge",
      "endurance",
      "entertain_taunt",
      "gossip",
      "haggle",
      "intimidate",
      "melee_any"
    ],
    "talentIds": [
      "in_fighter",
      "dirty_fighting",
      "menacing",
      "warrior_born"
    ],
    "trappingIds": [
      "hood_or_mask",
      "knuckledusters",
      "leather_jack"
    ]
  },
  {
    "id": "protagonist_protagonist",
    "careerPathId": "protagonist",
    "rank": 2,
    "name": "Protagonist",
    "status": "Silver 1",
    "characteristicAdvances": [],
    "skillIds": [
      "bribery",
      "charm",
      "intuition",
      "melee_basic",
      "perception",
      "ride_horse"
    ],
    "talentIds": [
      "combat_reflexes",
      "criminal",
      "reversal",
      "strike_to_stun"
    ],
    "trappingIds": [
      "hand_weapon",
      "mail_shirt",
      "riding_horse_with_saddle_and_tack",
      "shield"
    ]
  },
  {
    "id": "protagonist_hitman",
    "careerPathId": "protagonist",
    "rank": 3,
    "name": "Hitman",
    "status": "Silver 4",
    "characteristicAdvances": [],
    "skillIds": [
      "climb",
      "cool",
      "navigation",
      "ranged_thrown"
    ],
    "talentIds": [
      "careful_strike",
      "disarm",
      "marksman",
      "relentless"
    ],
    "trappingIds": [
      "cloak",
      "garotte",
      "poison",
      "throwing_knives"
    ]
  },
  {
    "id": "protagonist_assassin",
    "careerPathId": "protagonist",
    "rank": 4,
    "name": "Assassin",
    "status": "Gold 1",
    "characteristicAdvances": [],
    "skillIds": [
      "entertain_acting",
      "ranged_crossbow"
    ],
    "talentIds": [
      "accurate_shot",
      "ambidextrous",
      "furious_assault",
      "strike_to_injure"
    ],
    "trappingIds": [
      "crossbow_with_10_shots",
      "disguise_kit"
    ]
  },
  {
    "id": "soldier_recruit",
    "careerPathId": "soldier",
    "rank": 1,
    "name": "Recruit",
    "status": "Silver 1",
    "characteristicAdvances": [],
    "skillIds": [
      "athletics",
      "climb",
      "cool",
      "dodge",
      "endurance",
      "language_battle",
      "melee_basic",
      "play_drum_or_fife"
    ],
    "talentIds": [
      "diceman",
      "marksman",
      "strong_back",
      "warrior_born"
    ],
    "trappingIds": [
      "dagger",
      "leather_breastplate",
      "uniform"
    ]
  },
  {
    "id": "soldier_soldier",
    "careerPathId": "soldier",
    "rank": 2,
    "name": "Soldier",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "consume_alcohol",
      "gamble",
      "gossip",
      "melee_any",
      "ranged_any",
      "outdoor_survival"
    ],
    "talentIds": [
      "drilled",
      "etiquette_soldiers",
      "rapid_reload",
      "shieldsman"
    ],
    "trappingIds": [
      "breastplate",
      "helmet",
      "weapon_any"
    ]
  },
  {
    "id": "soldier_sergeant",
    "careerPathId": "soldier",
    "rank": 3,
    "name": "Sergeant",
    "status": "Silver 5",
    "characteristicAdvances": [],
    "skillIds": [
      "heal",
      "intuition",
      "leadership",
      "perception"
    ],
    "talentIds": [
      "combat_aware",
      "enclosed_fighter",
      "unshakeable",
      "warleader"
    ],
    "trappingIds": [
      "symbol_of_rank",
      "unit_of_troops"
    ]
  },
  {
    "id": "soldier_officer",
    "careerPathId": "soldier",
    "rank": 4,
    "name": "Officer",
    "status": "Gold 1",
    "characteristicAdvances": [],
    "skillIds": [
      "lore_warfare",
      "navigation"
    ],
    "talentIds": [
      "inspiring",
      "public_speaking",
      "seasoned_traveller",
      "stout_hearted"
    ],
    "trappingIds": [
      "letter_of_commission",
      "light_warhorse_with_saddle_and_tack",
      "map",
      "orders",
      "unit_of_soldiers",
      "quality_uniform",
      "symbol_of_rank"
    ]
  },
  {
    "id": "slayer_troll_slayer",
    "careerPathId": "slayer",
    "rank": 1,
    "name": "Troll Slayer",
    "status": "Brass 2",
    "characteristicAdvances": [],
    "skillIds": [
      "consume_alcohol",
      "cool",
      "dodge",
      "endurance",
      "gamble",
      "heal",
      "lore_trolls",
      "melee_basic"
    ],
    "talentIds": [
      "dual_wielder",
      "fearless_everything",
      "frenzy",
      "slayer"
    ],
    "trappingIds": [
      "axe",
      "flask_of_spirits",
      "shame",
      "tattoos"
    ]
  },
  {
    "id": "slayer_giant_slayer",
    "careerPathId": "slayer",
    "rank": 2,
    "name": "Giant Slayer",
    "status": "Brass 2",
    "characteristicAdvances": [],
    "skillIds": [
      "evaluate",
      "intimidate",
      "language_battle",
      "lore_giants",
      "melee_two_handed",
      "outdoor_survival"
    ],
    "talentIds": [
      "hardy",
      "implacable",
      "menacing",
      "reversal"
    ],
    "trappingIds": [
      "great_axe",
      "jewellery",
      "trolls_head"
    ]
  },
  {
    "id": "slayer_dragon_slayer",
    "careerPathId": "slayer",
    "rank": 3,
    "name": "Dragon Slayer",
    "status": "Brass 2",
    "characteristicAdvances": [],
    "skillIds": [
      "entertain_storytelling",
      "lore_dragons",
      "perception",
      "ranged_thrown"
    ],
    "talentIds": [
      "ambidextrous",
      "furious_assault",
      "relentless",
      "robust"
    ],
    "trappingIds": [
      "giants_head",
      "throwing_axes"
    ]
  },
  {
    "id": "slayer_daemon_slayer",
    "careerPathId": "slayer",
    "rank": 4,
    "name": "Daemon Slayer",
    "status": "Brass 2",
    "characteristicAdvances": [],
    "skillIds": [
      "intuition",
      "lore_chaos"
    ],
    "talentIds": [
      "combat_master",
      "frightening",
      "strike_mighty_blow",
      "very_strong"
    ],
    "trappingIds": [
      "dragons_head"
    ]
  },
  {
    "id": "warrior_priest_novitiate",
    "careerPathId": "warrior_priest",
    "rank": 1,
    "name": "Novitiate",
    "status": "Brass 2",
    "characteristicAdvances": [],
    "skillIds": [
      "cool",
      "dodge",
      "endurance",
      "heal",
      "leadership",
      "lore_theology",
      "melee_any",
      "pray"
    ],
    "talentIds": [
      "bless_any",
      "etiquette_cultists",
      "read_write",
      "strong_minded"
    ],
    "trappingIds": [
      "book_religion",
      "leather_jerkin",
      "religious_symbol",
      "robes",
      "weapon_any_melee"
    ]
  },
  {
    "id": "warrior_priest_warrior_priest",
    "careerPathId": "warrior_priest",
    "rank": 2,
    "name": "Warrior Priest",
    "status": "Silver 2",
    "characteristicAdvances": [],
    "skillIds": [
      "charm",
      "entertain_speeches",
      "intimidate",
      "language_battle",
      "melee_any",
      "ranged_any"
    ],
    "talentIds": [
      "dual_wielder",
      "inspiring",
      "invoke_any",
      "seasoned_traveller"
    ],
    "trappingIds": [
      "breastplate",
      "weapon_any"
    ]
  },
  {
    "id": "warrior_priest_priest_sergeant",
    "careerPathId": "warrior_priest",
    "rank": 3,
    "name": "Priest Sergeant",
    "status": "Silver 3",
    "characteristicAdvances": [],
    "skillIds": [
      "animal_care",
      "intuition",
      "perception",
      "ride_horse"
    ],
    "talentIds": [
      "combat_aware",
      "holy_visions",
      "pure_soul",
      "stout_hearted"
    ],
    "trappingIds": [
      "light_warhorse_with_saddle_and_tack"
    ]
  },
  {
    "id": "warrior_priest_priest_captain",
    "careerPathId": "warrior_priest",
    "rank": 4,
    "name": "Priest Captain",
    "status": "Silver 4",
    "characteristicAdvances": [],
    "skillIds": [
      "consume_alcohol",
      "lore_warfare"
    ],
    "talentIds": [
      "fearless_any",
      "furious_assault",
      "holy_hatred",
      "warleader"
    ],
    "trappingIds": [
      "religious_relic"
    ]
  }
];
