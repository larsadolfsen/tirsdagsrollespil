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
      "skill_consume_alcohol",
      "skill_heal",
      "skill_language_classical",
      "skill_lore_chemistry",
      "skill_lore_medicine",
      "skill_lore_plants",
      "skill_trade_apothecary",
      "skill_trade_poisoner"
    ],
    "talentIds": [
      "talent_concoct",
      "talent_craftsman_apothecary",
      "talent_etiquette_scholar",
      "talent_read_write"
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
      "skill_charm",
      "skill_haggle",
      "skill_lore_science",
      "skill_gossip",
      "skill_language_guilder",
      "skill_perception"
    ],
    "talentIds": [
      "talent_criminal",
      "talent_dealmaker",
      "talent_etiquette_guilder",
      "talent_pharmacist"
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
      "skill_intuition",
      "skill_leadership",
      "skill_research",
      "skill_secret_signs_guilder"
    ],
    "talentIds": [
      "talent_bookish",
      "talent_master_tradesman_apothecary",
      "talent_resistance_poison",
      "talent_savvy"
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
      "skill_intimidate",
      "skill_ride_horse"
    ],
    "talentIds": [
      "talent_acute_sense_taste",
      "talent_coolheaded",
      "talent_master_tradesman_poisoner",
      "talent_savant_apothecary"
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
      "skill_consume_alcohol",
      "skill_cool",
      "skill_endurance",
      "skill_language_classical",
      "skill_lore_engineer",
      "skill_perception",
      "skill_ranged_blackpowder",
      "skill_trade_engineer"
    ],
    "talentIds": [
      "talent_artistic",
      "talent_gunner",
      "talent_read_write",
      "talent_tinker"
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
      "skill_drive",
      "skill_dodge",
      "skill_navigation",
      "skill_ranged_engineering",
      "skill_research",
      "skill_language_guilder"
    ],
    "talentIds": [
      "talent_craftsman_engineer",
      "talent_etiquette_guilder",
      "talent_marksman",
      "talent_orientation"
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
      "skill_language_khazalid",
      "skill_leadership",
      "skill_ride_horse",
      "skill_secret_signs_guilder"
    ],
    "talentIds": [
      "talent_etiquette_scholar",
      "talent_master_tradesman_engineering",
      "talent_sniper",
      "talent_super_numerate"
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
      "skill_language_any",
      "skill_lore_any"
    ],
    "talentIds": [
      "talent_magnum_opus",
      "talent_rapid_reload",
      "talent_savant_engineering",
      "talent_unshakable"
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
      "skill_consume_alcohol",
      "skill_endurance",
      "skill_haggle",
      "skill_language_classical",
      "skill_lore_law",
      "skill_lore_theology",
      "skill_perception",
      "skill_research"
    ],
    "talentIds": [
      "talent_blather",
      "talent_etiquette_scholar",
      "talent_read_write",
      "talent_speedreader"
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
      "skill_bribery",
      "skill_charm",
      "skill_gossip",
      "skill_intuition",
      "skill_language_guilder",
      "skill_secret_signs_guilder"
    ],
    "talentIds": [
      "talent_argumentative",
      "talent_criminal",
      "talent_etiquette_guilder",
      "talent_suave"
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
      "skill_art_writing",
      "skill_entertain_speeches",
      "skill_intimidate",
      "skill_lore_any"
    ],
    "talentIds": [
      "talent_bookish",
      "talent_cat_tongued",
      "talent_impassioned_zeal",
      "talent_savvy"
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
      "skill_cool",
      "skill_lore_any"
    ],
    "talentIds": [
      "talent_commanding_presence",
      "talent_kingpin",
      "talent_savant_law",
      "talent_wealthy"
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
      "skill_art_calligraphy",
      "skill_cool",
      "skill_endurance",
      "skill_entertain_storyteller",
      "skill_gossip",
      "skill_heal",
      "skill_lore_theology",
      "skill_pray"
    ],
    "talentIds": [
      "talent_bless_any",
      "talent_stone_soup",
      "talent_panhandle",
      "talent_read_write"
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
      "skill_charm",
      "skill_melee_any",
      "skill_research",
      "skill_trade_brewer",
      "skill_trade_herbalist",
      "skill_trade_vintner"
    ],
    "talentIds": [
      "talent_etiquette_cultists",
      "talent_field_dressing",
      "talent_holy_visions",
      "talent_invoke_any"
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
      "skill_leadership",
      "skill_lore_local",
      "skill_lore_politics",
      "skill_perception"
    ],
    "talentIds": [
      "talent_resistance_any",
      "talent_robust",
      "talent_savant_theology",
      "talent_stout_hearted"
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
      "skill_language_any",
      "skill_lore_any"
    ],
    "talentIds": [
      "talent_commanding_presence",
      "talent_iron_will",
      "talent_pure_soul",
      "talent_strong_minded"
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
      "skill_bribery",
      "skill_cool",
      "skill_drive",
      "skill_endurance",
      "skill_gossip",
      "skill_heal",
      "skill_perception",
      "skill_sleight_of_hand"
    ],
    "talentIds": [
      "talent_bookish",
      "talent_field_dressing",
      "talent_read_write",
      "talent_strike_to_stun"
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
      "skill_charm",
      "skill_haggle",
      "skill_language_guilder",
      "skill_lore_anatomy",
      "skill_lore_medicine",
      "skill_trade_barber"
    ],
    "talentIds": [
      "talent_coolheaded",
      "talent_criminal",
      "talent_etiquette_guilder",
      "talent_surgery"
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
      "skill_consume_alcohol",
      "skill_intimidate",
      "skill_leadership",
      "skill_research"
    ],
    "talentIds": [
      "talent_etiquette_scholars",
      "talent_resistance_disease",
      "talent_savvy",
      "talent_strike_to_injure"
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
      "skill_lore_noble",
      "skill_perform_dancing"
    ],
    "talentIds": [
      "talent_etiquette_nobles",
      "talent_nimble_fingered",
      "talent_savant_medicine",
      "talent_strong_minded"
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
      "skill_athletics",
      "skill_cool",
      "skill_endurance",
      "skill_intuition",
      "skill_lore_theology",
      "skill_perception",
      "skill_pray",
      "skill_research"
    ],
    "talentIds": [
      "talent_bless_any",
      "talent_holy_visions",
      "talent_read_write",
      "talent_suave"
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
      "skill_charm",
      "skill_entertain_storytelling",
      "skill_gossip",
      "skill_heal",
      "skill_intimidate",
      "skill_melee_basic"
    ],
    "talentIds": [
      "talent_blather",
      "talent_bookish",
      "talent_etiquette_cultists",
      "talent_invoke_any"
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
      "skill_art_writing",
      "skill_entertain_speeches",
      "skill_leadership",
      "skill_lore_heraldry"
    ],
    "talentIds": [
      "talent_acute_sense_any",
      "talent_hatred_any",
      "talent_impassioned_zeal",
      "talent_strong_minded"
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
      "skill_language_any",
      "skill_lore_politics"
    ],
    "talentIds": [
      "talent_master_orator",
      "talent_pure_soul",
      "talent_resistance_any",
      "talent_savant_theology"
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
      "skill_consume_alcohol",
      "skill_entertain_storytelling",
      "skill_gamble",
      "skill_gossip",
      "skill_haggle",
      "skill_language_classical",
      "skill_lore_any",
      "skill_research"
    ],
    "talentIds": [
      "talent_carouser",
      "talent_read_write",
      "talent_savvy",
      "talent_super_numerate"
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
      "skill_art_writing",
      "skill_intuition",
      "skill_language_any",
      "skill_lore_any",
      "skill_perception",
      "skill_trade_any"
    ],
    "talentIds": [
      "talent_bookish",
      "talent_etiquette_scholars",
      "talent_speedreader",
      "talent_suave"
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
      "skill_entertain_lecture",
      "skill_intimidate",
      "skill_language_any",
      "skill_lore_any"
    ],
    "talentIds": [
      "talent_linguistics",
      "talent_public_speaker",
      "talent_savant_any",
      "talent_tower_of_memories"
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
      "skill_entertain_rhetoric",
      "skill_lore_any"
    ],
    "talentIds": [
      "talent_magnum_opus",
      "talent_master_orator",
      "talent_savant_any",
      "talent_sharp"
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
      "skill_channelling_any_colour",
      "skill_dodge",
      "skill_intuition",
      "skill_language_magick",
      "skill_lore_magick",
      "skill_melee_basic",
      "skill_melee_pole_arm",
      "skill_perception"
    ],
    "talentIds": [
      "talent_aethyric_attunement",
      "talent_petty_magic",
      "talent_read_write",
      "talent_second_sight"
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
      "skill_charm",
      "skill_cool",
      "skill_gossip",
      "skill_intimidate",
      "skill_language_battle",
      "skill_language_any"
    ],
    "talentIds": [
      "talent_arcane_magic_any_arcane_lore",
      "talent_detect_artefact",
      "talent_fast_hands",
      "talent_sixth_sense"
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
      "skill_animal_care",
      "skill_evaluate",
      "skill_lore_warfare",
      "skill_ride_horse"
    ],
    "talentIds": [
      "talent_dual_wielder",
      "talent_instinctive_diction",
      "talent_magical_sense",
      "talent_menacing"
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
      "skill_language_any",
      "skill_lore_any"
    ],
    "talentIds": [
      "talent_combat_aware",
      "talent_frightening",
      "talent_iron_will",
      "talent_war_wizard"
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
      "skill_art_writing",
      "skill_bribery",
      "skill_charm",
      "skill_consume_alcohol",
      "skill_gossip",
      "skill_haggle",
      "skill_lore_politics",
      "skill_trade_printing"
    ],
    "talentIds": [
      "talent_blather",
      "talent_gregarious",
      "talent_panhandle",
      "talent_read_write"
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
      "skill_cool",
      "skill_dodge",
      "skill_entertain_storytelling",
      "skill_gamble",
      "skill_intuition",
      "skill_leadership"
    ],
    "talentIds": [
      "talent_alley_cat",
      "talent_argumentative",
      "talent_impassioned_zeal",
      "talent_public_speaker"
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
      "skill_athletics",
      "skill_intimidate",
      "skill_melee_fist",
      "skill_perception"
    ],
    "talentIds": [
      "talent_cat_tongued",
      "talent_dirty_fighting",
      "talent_flee",
      "talent_step_aside"
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
      "skill_lore_heraldry",
      "skill_ride_horse"
    ],
    "talentIds": [
      "talent_etiquette_any",
      "talent_master_orator",
      "talent_schemer",
      "talent_suave"
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
      "skill_athletics",
      "skill_cool",
      "skill_consume_alcohol",
      "skill_dodge",
      "skill_endurance",
      "skill_evaluate",
      "skill_stealth_urban",
      "skill_trade_any"
    ],
    "talentIds": [
      "talent_artistic",
      "talent_craftsman_any",
      "talent_strong_back",
      "talent_very_strong"
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
      "skill_charm",
      "skill_haggle",
      "skill_lore_local",
      "skill_gossip",
      "skill_language_guilder",
      "skill_perception"
    ],
    "talentIds": [
      "talent_dealmaker",
      "talent_etiquette_guilder",
      "talent_nimble_fingered",
      "talent_sturdy"
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
      "skill_intuition",
      "skill_leadership",
      "skill_research",
      "skill_secret_signs_guilder"
    ],
    "talentIds": [
      "talent_acute_sense_taste_or_touch",
      "talent_master_tradesman_any",
      "talent_read_write",
      "talent_tinker"
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
      "skill_bribery",
      "skill_intimidate"
    ],
    "talentIds": [
      "talent_briber",
      "talent_magnum_opus",
      "talent_public_speaker",
      "talent_schemer"
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
      "skill_athletics",
      "skill_charm",
      "skill_consume_alcohol",
      "skill_cool",
      "skill_dodge",
      "skill_endurance",
      "skill_intuition",
      "skill_stealth_urban"
    ],
    "talentIds": [
      "talent_panhandle",
      "talent_resistance_disease",
      "talent_stone_soup",
      "talent_very_resilient"
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
      "skill_entertain_acting",
      "skill_entertain_any",
      "skill_gossip",
      "skill_haggle",
      "skill_perception",
      "skill_sleight_of_hand"
    ],
    "talentIds": [
      "talent_alley_cat",
      "talent_beneath_notice",
      "talent_criminal",
      "talent_etiquette_criminals"
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
      "skill_charm_animal",
      "skill_leadership",
      "skill_lore_local",
      "skill_secret_signs_vagabond"
    ],
    "talentIds": [
      "talent_blather",
      "talent_dirty_fighting",
      "talent_hardy",
      "talent_step_aside"
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
      "skill_bribery",
      "skill_intimidate"
    ],
    "talentIds": [
      "talent_cat_tongued",
      "talent_fearless_watchmen",
      "talent_kingpin",
      "talent_suave"
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
      "skill_charm",
      "skill_climb",
      "skill_cool",
      "skill_gossip",
      "skill_intuition",
      "skill_perception",
      "skill_stealth_urban",
      "skill_track"
    ],
    "talentIds": [
      "talent_alley_cat",
      "talent_beneath_notice",
      "talent_read_write",
      "talent_sharp"
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
      "skill_consume_alcohol",
      "skill_dodge",
      "skill_lore_law",
      "skill_melee_brawling",
      "skill_pick_lock",
      "skill_sleight_of_hand"
    ],
    "talentIds": [
      "talent_etiquette_any",
      "talent_savvy",
      "talent_shadow",
      "talent_tenacious"
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
      "skill_bribery",
      "skill_evaluate",
      "skill_leadership",
      "skill_lore_any"
    ],
    "talentIds": [
      "talent_bookish",
      "talent_break_and_enter",
      "talent_sixth_sense",
      "talent_suave"
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
      "skill_intimidate",
      "skill_lore_any"
    ],
    "talentIds": [
      "talent_acute_sense_any",
      "talent_savant_any",
      "talent_speedreader",
      "talent_tower_of_memories"
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
      "skill_animal_care",
      "skill_bribery",
      "skill_charm",
      "skill_consume_alcohol",
      "skill_drive",
      "skill_gamble",
      "skill_gossip",
      "skill_haggle"
    ],
    "talentIds": [
      "talent_blather",
      "talent_dealmaker",
      "talent_read_write",
      "talent_suave"
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
      "skill_evaluate",
      "skill_intuition",
      "skill_language_any",
      "skill_language_guilder",
      "skill_lore_local",
      "skill_perception"
    ],
    "talentIds": [
      "talent_briber",
      "talent_embezzle",
      "talent_etiquette_guilder",
      "talent_savvy"
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
      "skill_cool",
      "skill_language_classical",
      "skill_navigation",
      "skill_secret_signs_guilder"
    ],
    "talentIds": [
      "talent_cat_tongued",
      "talent_etiquette_any",
      "talent_numismatics",
      "talent_sharp"
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
      "skill_lore_any",
      "skill_intimidate"
    ],
    "talentIds": [
      "talent_iron_will",
      "talent_luck",
      "talent_schemer",
      "talent_wealthy"
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
      "skill_athletics",
      "skill_animal_training_dog",
      "skill_charm_animal",
      "skill_consume_alcohol",
      "skill_endurance",
      "skill_melee_basic",
      "skill_ranged_sling",
      "skill_stealth_underground_or_urban"
    ],
    "talentIds": [
      "talent_night_vision",
      "talent_resistance_disease",
      "talent_strike_mighty_blow",
      "talent_strike_to_stun"
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
      "skill_animal_care",
      "skill_gossip",
      "skill_haggle",
      "skill_lore_poison",
      "skill_perception",
      "skill_set_trap"
    ],
    "talentIds": [
      "talent_enclosed_fighter",
      "talent_etiquette_guilder",
      "talent_fearless_rats",
      "talent_very_resilient"
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
      "skill_climb",
      "skill_cool",
      "skill_dodge",
      "skill_ranged_crossbow_pistol"
    ],
    "talentIds": [
      "talent_hardy",
      "talent_stout_hearted",
      "talent_strong_legs",
      "talent_tunnel_rat"
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
      "skill_leadership",
      "skill_track"
    ],
    "talentIds": [
      "talent_fearless_skaven",
      "talent_menacing",
      "talent_robust",
      "talent_strong_minded"
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
      "skill_charm",
      "skill_climb",
      "skill_consume_alcohol",
      "skill_drive",
      "skill_dodge",
      "skill_gamble",
      "skill_gossip",
      "skill_haggle"
    ],
    "talentIds": [
      "talent_alley_cat",
      "talent_beneath_notice",
      "talent_etiquette_servants",
      "talent_sturdy"
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
      "skill_bribery",
      "skill_evaluate",
      "skill_intuition",
      "skill_lore_local",
      "skill_melee_brawling",
      "skill_play_any"
    ],
    "talentIds": [
      "talent_dealmaker",
      "talent_embezzle",
      "talent_etiquette_any",
      "talent_gregarious"
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
      "skill_cool",
      "skill_lore_law",
      "skill_perception",
      "skill_research"
    ],
    "talentIds": [
      "talent_briber",
      "talent_public_speaker",
      "talent_read_write",
      "talent_supportive"
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
      "skill_lore_politics",
      "skill_intimidate"
    ],
    "talentIds": [
      "talent_commanding_presence",
      "talent_master_orator",
      "talent_schemer",
      "talent_suave"
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
      "skill_athletics",
      "skill_climb",
      "skill_consume_alcohol",
      "skill_dodge",
      "skill_endurance",
      "skill_gamble",
      "skill_melee_any",
      "skill_perception"
    ],
    "talentIds": [
      "talent_drilled",
      "talent_hardy",
      "talent_strike_to_stun",
      "talent_tenacious"
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
      "skill_charm",
      "skill_cool",
      "skill_gossip",
      "skill_intimidate",
      "skill_intuition",
      "skill_lore_local"
    ],
    "talentIds": [
      "talent_break_and_enter",
      "talent_criminal",
      "talent_night_vision",
      "talent_sprinter"
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
      "skill_entertain_storytelling",
      "skill_haggle",
      "skill_leadership",
      "skill_lore_law"
    ],
    "talentIds": [
      "talent_disarm",
      "talent_etiquette_soldiers",
      "talent_fearless_criminals",
      "talent_nose_for_trouble"
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
      "skill_lore_politics",
      "skill_ride_horse"
    ],
    "talentIds": [
      "talent_public_speaker",
      "talent_robust",
      "talent_kingpin",
      "talent_schemer"
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
      "skill_bribery",
      "skill_consume_alcohol",
      "skill_endurance",
      "skill_gossip",
      "skill_haggle",
      "skill_language_classical",
      "skill_lore_politics",
      "skill_perception"
    ],
    "talentIds": [
      "talent_beneath_notice",
      "talent_etiquette_any",
      "talent_gregarious",
      "talent_read_write"
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
      "skill_charm",
      "skill_cool",
      "skill_evaluate",
      "skill_gamble",
      "skill_intuition",
      "skill_lore_local"
    ],
    "talentIds": [
      "talent_blather",
      "talent_criminal",
      "talent_schemer",
      "talent_supportive"
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
      "skill_entertain_storytelling",
      "skill_leadership",
      "skill_language_any",
      "skill_lore_any"
    ],
    "talentIds": [
      "talent_argumentative",
      "talent_briber",
      "talent_carouser",
      "talent_cat_tongued"
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
      "skill_lore_heraldry",
      "skill_ride_horse"
    ],
    "talentIds": [
      "talent_commanding_presence",
      "talent_embezzle",
      "talent_kingpin",
      "talent_suave"
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
      "skill_art_any",
      "skill_cool",
      "skill_consume_alcohol",
      "skill_evaluate",
      "skill_endurance",
      "skill_gossip",
      "skill_perception",
      "skill_stealth_urban"
    ],
    "talentIds": [
      "talent_artistic",
      "talent_sharp",
      "talent_strong_back",
      "talent_tenacious"
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
      "skill_climb",
      "skill_gamble",
      "skill_haggle",
      "skill_intuition",
      "skill_language_classical",
      "skill_sleight_of_hand",
      "skill_trade_art_supplies"
    ],
    "talentIds": [
      "talent_carouser",
      "talent_criminal",
      "talent_gregarious",
      "talent_nimble_fingered"
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
      "skill_charm",
      "skill_leadership",
      "skill_lore_art",
      "skill_lore_heraldry"
    ],
    "talentIds": [
      "talent_acute_sense_any",
      "talent_dealmaker",
      "talent_etiquette_any",
      "talent_nose_for_trouble"
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
      "skill_research",
      "skill_ride_horse"
    ],
    "talentIds": [
      "talent_ambidextrous",
      "talent_kingpin",
      "talent_magnum_opus",
      "talent_read_write"
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
      "skill_athletics",
      "skill_dodge",
      "skill_endurance",
      "skill_heal",
      "skill_intuition",
      "skill_language_classical",
      "skill_melee_any",
      "skill_perception"
    ],
    "talentIds": [
      "talent_beat_blade",
      "talent_distract",
      "talent_feint",
      "talent_step_aside"
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
      "skill_charm",
      "skill_cool",
      "skill_gamble",
      "skill_melee_parry",
      "skill_ranged_blackpowder",
      "skill_trade_gunsmith"
    ],
    "talentIds": [
      "talent_combat_reflexes",
      "talent_etiquette_any",
      "talent_fast_shot",
      "talent_reversal"
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
      "skill_intimidate",
      "skill_leadership",
      "skill_melee_basic",
      "skill_perform_acrobatics"
    ],
    "talentIds": [
      "talent_ambidextrous",
      "talent_disarm",
      "talent_dual_wielder",
      "talent_riposte"
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
      "skill_lore_law",
      "skill_melee_any"
    ],
    "talentIds": [
      "talent_combat_master",
      "talent_menacing",
      "talent_reaction_strike",
      "talent_strike_to_injure"
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
      "skill_athletics",
      "skill_charm",
      "skill_drive",
      "skill_dodge",
      "skill_endurance",
      "skill_intuition",
      "skill_ride_horse",
      "skill_row"
    ],
    "talentIds": [
      "talent_blather",
      "talent_etiquette_nobles",
      "talent_read_write",
      "talent_suave"
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
      "skill_art_writing",
      "skill_bribery",
      "skill_cool",
      "skill_gossip",
      "skill_haggle",
      "skill_lore_politics"
    ],
    "talentIds": [
      "talent_attractive",
      "talent_cat_tongued",
      "talent_etiquette_any",
      "talent_seasoned_traveller"
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
      "skill_intimidate",
      "skill_language_any",
      "skill_leadership",
      "skill_navigation"
    ],
    "talentIds": [
      "talent_carouser",
      "talent_dealmaker",
      "talent_gregarious",
      "talent_schemer"
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
      "skill_language_any",
      "skill_lore_any"
    ],
    "talentIds": [
      "talent_briber",
      "talent_commanding_presence",
      "talent_noble_blood",
      "talent_savvy"
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
      "skill_bribery",
      "skill_consume_alcohol",
      "skill_gamble",
      "skill_intimidate",
      "skill_leadership",
      "skill_lore_heraldry",
      "skill_melee_fencing",
      "skill_play_any"
    ],
    "talentIds": [
      "talent_etiquette_nobles",
      "talent_luck",
      "talent_noble_blood",
      "talent_read_write"
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
      "skill_charm",
      "skill_gossip",
      "skill_language_classical",
      "skill_lore_local",
      "skill_ride_horse",
      "skill_melee_parry"
    ],
    "talentIds": [
      "talent_attractive",
      "talent_briber",
      "talent_carouser",
      "talent_suave"
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
      "skill_language_any",
      "skill_intuition",
      "skill_lore_politics",
      "skill_perception"
    ],
    "talentIds": [
      "talent_coolheaded",
      "talent_dealmaker",
      "talent_public_speaker",
      "talent_schemer"
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
      "skill_lore_any",
      "skill_track"
    ],
    "talentIds": [
      "talent_commanding_presence",
      "talent_iron_will",
      "talent_war_leader",
      "talent_wealthy"
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
      "skill_athletics",
      "skill_climb",
      "skill_drive",
      "skill_dodge",
      "skill_endurance",
      "skill_intuition",
      "skill_perception",
      "skill_stealth_any"
    ],
    "talentIds": [
      "talent_beneath_notice",
      "talent_strong_back",
      "talent_strong_minded",
      "talent_sturdy"
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
      "skill_animal_care",
      "skill_consume_alcohol",
      "skill_evaluate",
      "skill_gamble",
      "skill_gossip",
      "skill_haggle"
    ],
    "talentIds": [
      "talent_etiquette_servants",
      "talent_shadow",
      "talent_tenacious",
      "talent_well_prepared"
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
      "skill_charm",
      "skill_cool",
      "skill_intimidate",
      "skill_lore_local"
    ],
    "talentIds": [
      "talent_embezzle",
      "talent_resistance_poison",
      "talent_suave",
      "talent_supportive"
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
      "skill_leadership",
      "skill_melee_basic"
    ],
    "talentIds": [
      "talent_etiquette_any",
      "talent_numismatics",
      "talent_read_write",
      "talent_savvy"
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
      "skill_bribery",
      "skill_charm",
      "skill_cool",
      "skill_gamble",
      "skill_gossip",
      "skill_haggle",
      "skill_perception",
      "skill_stealth_any"
    ],
    "talentIds": [
      "talent_blather",
      "talent_carouser",
      "talent_gregarious",
      "talent_shadow"
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
      "skill_climb",
      "skill_entertain_act",
      "skill_intuition",
      "skill_melee_basic",
      "skill_secret_signs_any",
      "skill_sleight_of_hand"
    ],
    "talentIds": [
      "talent_etiquette_any",
      "talent_lip_reading",
      "talent_read_write",
      "talent_secret_identity"
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
      "skill_animal_care",
      "skill_animal_training_pigeon",
      "skill_language_any",
      "skill_leadership"
    ],
    "talentIds": [
      "talent_attractive",
      "talent_cat_tongued",
      "talent_master_of_disguise",
      "talent_mimic"
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
      "skill_lore_any",
      "skill_research"
    ],
    "talentIds": [
      "talent_briber",
      "talent_schemer",
      "talent_suave",
      "talent_tower_of_memories"
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
      "skill_athletics",
      "skill_charm_animal",
      "skill_consume_alcohol",
      "skill_cool",
      "skill_endurance",
      "skill_intuition",
      "skill_lore_local",
      "skill_perception"
    ],
    "talentIds": [
      "talent_menacing",
      "talent_night_vision",
      "talent_sharp",
      "talent_strike_to_stun"
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
      "skill_animal_care",
      "skill_melee_basic",
      "skill_outdoor_survival",
      "skill_ranged_bow",
      "skill_ride_horse",
      "skill_swim"
    ],
    "talentIds": [
      "talent_animal_affinity",
      "talent_etiquette_servants",
      "talent_strider_any",
      "talent_rover"
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
      "skill_bribery",
      "skill_charm",
      "skill_gossip",
      "skill_leadership"
    ],
    "talentIds": [
      "talent_embezzle",
      "talent_numismatics",
      "talent_read_write",
      "talent_supportive"
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
      "skill_evaluate",
      "skill_language_any"
    ],
    "talentIds": [
      "talent_commanding_presence",
      "talent_etiquette_any",
      "talent_savant_local",
      "talent_suave"
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
      "skill_cool",
      "skill_dodge",
      "skill_endurance",
      "skill_gossip",
      "skill_haggle",
      "skill_intimidate",
      "skill_melee",
      "skill_perception"
    ],
    "talentIds": [
      "talent_embezzle",
      "talent_numismatics",
      "talent_strong_back",
      "talent_tenacious"
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
      "skill_bribery",
      "skill_charm",
      "skill_evaluate",
      "skill_intuition",
      "skill_leadership",
      "skill_lore_local"
    ],
    "talentIds": [
      "talent_break_and_enter",
      "talent_criminal",
      "talent_public_speaker",
      "talent_strike_to_stun"
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
      "skill_animal_care",
      "skill_lore_heraldry",
      "skill_navigation",
      "skill_ride_horse"
    ],
    "talentIds": [
      "talent_kingpin",
      "talent_menacing",
      "talent_nose_for_trouble",
      "talent_read_write"
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
      "skill_language_classical",
      "skill_lore_law"
    ],
    "talentIds": [
      "talent_commanding_presence",
      "talent_iron_will",
      "talent_savvy",
      "talent_schemer"
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
      "skill_channelling",
      "skill_endurance",
      "skill_intuition",
      "skill_language_magick",
      "skill_lore_folklore",
      "skill_lore_herbs",
      "skill_outdoor_survival",
      "skill_perception"
    ],
    "talentIds": [
      "talent_fast_hands",
      "talent_petty_magic",
      "talent_rover",
      "talent_strider_woodlands"
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
      "skill_cool",
      "skill_gossip",
      "skill_heal",
      "skill_lore_local",
      "skill_trade_charms",
      "skill_trade_herbalist"
    ],
    "talentIds": [
      "talent_aethyric_attunement",
      "talent_animal_affinity",
      "talent_arcane_magic_hedgecraft",
      "talent_sixth_sense"
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
      "skill_haggle",
      "skill_lore_genealogy",
      "skill_lore_magick",
      "skill_lore_spirits"
    ],
    "talentIds": [
      "talent_craftsman_herbalist",
      "talent_magical_sense",
      "talent_pure_soul",
      "talent_resistance_disease"
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
      "skill_intimidate",
      "skill_pray"
    ],
    "talentIds": [
      "talent_acute_sense_any",
      "talent_master_tradesman_herbalist",
      "talent_night_vision",
      "talent_strong_minded"
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
      "skill_charm_animal",
      "skill_climb",
      "skill_endurance",
      "skill_lore_herbs",
      "skill_outdoor_survival",
      "skill_perception",
      "skill_swim",
      "skill_trade_herbalist"
    ],
    "talentIds": [
      "talent_acute_sense_taste",
      "talent_orientation",
      "talent_rover",
      "talent_strider_any"
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
      "skill_consume_alcohol",
      "skill_cool",
      "skill_gossip",
      "skill_haggle",
      "skill_heal",
      "skill_lore_local"
    ],
    "talentIds": [
      "talent_dealmaker",
      "talent_nimble_fingered",
      "talent_sharp",
      "talent_sturdy"
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
      "skill_intuition",
      "skill_leadership",
      "skill_lore_medicine",
      "skill_trade_poisons"
    ],
    "talentIds": [
      "talent_craftsman_herbalist",
      "talent_field_dressing",
      "talent_hardy",
      "talent_savvy"
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
      "skill_drive",
      "skill_navigation"
    ],
    "talentIds": [
      "talent_concoct",
      "talent_master_tradesman_herbalist",
      "talent_resistance_poison",
      "talent_savant_herbs"
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
      "skill_charm_animal",
      "skill_climb",
      "skill_endurance",
      "skill_lore_beasts",
      "skill_outdoor_survival",
      "skill_perception",
      "skill_ranged_bow",
      "skill_set_trap"
    ],
    "talentIds": [
      "talent_hardy",
      "talent_rover",
      "talent_strider_any",
      "talent_trapper"
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
      "skill_cool",
      "skill_intuition",
      "skill_melee_basic",
      "skill_ranged_sling",
      "skill_secret_signs_hunter",
      "skill_stealth_rural"
    ],
    "talentIds": [
      "talent_accurate_shot",
      "talent_fast_shot",
      "talent_hunters_eye",
      "talent_marksman"
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
      "skill_navigation",
      "skill_ride_horse",
      "skill_swim",
      "skill_track"
    ],
    "talentIds": [
      "talent_acute_sense_any",
      "talent_deadeye_shot",
      "talent_fearless_animals",
      "talent_sharpshooter"
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
      "skill_animal_care",
      "skill_animal_training_any"
    ],
    "talentIds": [
      "talent_fearless_monsters",
      "talent_robust",
      "talent_sniper",
      "talent_sure_shot"
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
      "skill_cool",
      "skill_endurance",
      "skill_intuition",
      "skill_lore_local",
      "skill_melee_two_handed",
      "skill_outdoor_survival",
      "skill_perception",
      "skill_swim"
    ],
    "talentIds": [
      "talent_rover",
      "talent_strider_rocky",
      "talent_sturdy",
      "talent_tenacious"
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
      "skill_climb",
      "skill_consume_alcohol",
      "skill_evaluate",
      "skill_melee_basic",
      "skill_secret_signs_miner",
      "skill_trade_explosives"
    ],
    "talentIds": [
      "talent_night_vision",
      "talent_strike_mighty_blow",
      "talent_strong_back",
      "talent_very_strong"
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
      "skill_gossip",
      "skill_lore_geology",
      "skill_stealth_underground",
      "skill_trade_engineer"
    ],
    "talentIds": [
      "talent_careful_strike",
      "talent_craftsman_explosives",
      "talent_tinker",
      "talent_tunnel_rat"
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
      "skill_charm",
      "skill_leadership"
    ],
    "talentIds": [
      "talent_argumentative",
      "talent_strong_minded",
      "talent_embezzle",
      "talent_read_write"
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
      "skill_charm",
      "skill_entertain_fortune_telling",
      "skill_dodge",
      "skill_gossip",
      "skill_haggle",
      "skill_intuition",
      "skill_perception",
      "skill_sleight_of_hand"
    ],
    "talentIds": [
      "talent_attractive",
      "talent_luck",
      "talent_second_sight",
      "talent_suave"
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
      "skill_bribery",
      "skill_cool",
      "skill_entertain_prophecy",
      "skill_evaluate",
      "skill_intimidate",
      "skill_lore_astrology"
    ],
    "talentIds": [
      "talent_detect_artefact",
      "talent_holy_visions",
      "talent_sixth_sense",
      "talent_well_prepared"
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
      "skill_charm_animal",
      "skill_entertain_storytelling",
      "skill_language_any",
      "skill_trade_writing"
    ],
    "talentIds": [
      "talent_nose_for_trouble",
      "talent_petty_magic",
      "talent_read_write",
      "talent_witch"
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
      "skill_lore_prophecy",
      "skill_channelling_azyr"
    ],
    "talentIds": [
      "talent_arcane_magic_celestial",
      "talent_magical_sense",
      "talent_menacing",
      "talent_strong_minded"
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
      "skill_charm_animal",
      "skill_climb",
      "skill_endurance",
      "skill_gossip",
      "skill_lore_local",
      "skill_melee_basic",
      "skill_outdoor_survival",
      "skill_perception"
    ],
    "talentIds": [
      "talent_orientation",
      "talent_rover",
      "talent_sharp",
      "talent_strider_any"
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
      "skill_athletics",
      "skill_navigation",
      "skill_ranged_bow",
      "skill_ride_horse",
      "skill_stealth_rural",
      "skill_track"
    ],
    "talentIds": [
      "talent_combat_aware",
      "talent_night_vision",
      "talent_nose_for_trouble",
      "talent_seasoned_traveller"
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
      "skill_animal_care",
      "skill_haggle",
      "skill_secret_signs_hunter",
      "skill_swim"
    ],
    "talentIds": [
      "talent_acute_sense_sight",
      "talent_sixth_sense",
      "talent_strong_legs",
      "talent_very_resilient"
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
      "skill_language_any",
      "skill_trade_cartographer"
    ],
    "talentIds": [
      "talent_hardy",
      "talent_linguistics",
      "talent_savant_local",
      "talent_tenacious"
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
      "skill_animal_care",
      "skill_athletics",
      "skill_consume_alcohol",
      "skill_endurance",
      "skill_gossip",
      "skill_melee_brawling",
      "skill_lore_local",
      "skill_outdoor_survival"
    ],
    "talentIds": [
      "talent_rover",
      "talent_strong_back",
      "talent_strong_minded",
      "talent_stone_soup"
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
      "skill_drive",
      "skill_entertain_storytelling",
      "skill_haggle",
      "skill_melee_basic",
      "skill_trade_any"
    ],
    "talentIds": [
      "talent_animal_affinity",
      "talent_hardy",
      "talent_tenacious",
      "talent_very_strong"
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
      "skill_bribery",
      "skill_charm",
      "skill_intimidate",
      "skill_leadership"
    ],
    "talentIds": [
      "talent_craftsman_any",
      "talent_dealmaker",
      "talent_stout_hearted",
      "talent_very_resilient"
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
      "skill_intuition",
      "skill_lore_history"
    ],
    "talentIds": [
      "talent_master_tradesman_any",
      "talent_nimble_fingered",
      "talent_public_speaker",
      "talent_savant_local"
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
      "skill_bribery",
      "skill_charm",
      "skill_gossip",
      "skill_haggle",
      "skill_intuition",
      "skill_melee_basic",
      "skill_outdoor_survival",
      "skill_perception"
    ],
    "talentIds": [
      "talent_break_and_enter",
      "talent_shadow",
      "talent_strike_to_stun",
      "talent_suave"
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
      "skill_athletics",
      "skill_endurance",
      "skill_intimidate",
      "skill_ranged_crossbow",
      "skill_ranged_entangling",
      "skill_track"
    ],
    "talentIds": [
      "talent_marksman",
      "talent_relentless",
      "talent_seasoned_traveller",
      "talent_strong_back"
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
      "skill_animal_care",
      "skill_climb",
      "skill_ride_horse",
      "skill_swim"
    ],
    "talentIds": [
      "talent_accurate_shot",
      "talent_careful_strike",
      "talent_dual_wielder",
      "talent_sprinter"
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
      "skill_drive",
      "skill_lore_law"
    ],
    "talentIds": [
      "talent_deadeye_shot",
      "talent_fearless_bounties",
      "talent_hardy",
      "talent_sure_shot"
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
      "skill_animal_care",
      "skill_charm_animal",
      "skill_climb",
      "skill_drive",
      "skill_endurance",
      "skill_perception",
      "skill_ranged_entangling",
      "skill_ride_horse"
    ],
    "talentIds": [
      "talent_animal_affinity",
      "talent_seasoned_traveller",
      "talent_trick_riding",
      "talent_tenacious"
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
      "skill_consume_alcohol",
      "skill_gossip",
      "skill_intuition",
      "skill_lore_local",
      "skill_navigation",
      "skill_ranged_blackpowder"
    ],
    "talentIds": [
      "talent_coolheaded",
      "talent_crack_the_whip",
      "talent_gunner",
      "talent_strong_minded"
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
      "skill_animal_training_horse",
      "skill_intimidate",
      "skill_language_any",
      "skill_lore_routes"
    ],
    "talentIds": [
      "talent_accurate_shot",
      "talent_dealmaker",
      "talent_fearless_outlaws",
      "talent_nose_for_trouble"
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
      "skill_charm",
      "skill_leadership"
    ],
    "talentIds": [
      "talent_fearless_beastmen",
      "talent_marksman",
      "talent_orientation",
      "talent_rapid_reload"
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
      "skill_athletics",
      "skill_charm",
      "skill_entertain_any",
      "skill_gossip",
      "skill_haggle",
      "skill_perform_any",
      "skill_play_any",
      "skill_sleight_of_hand"
    ],
    "talentIds": [
      "talent_attractive",
      "talent_mimic",
      "talent_public_speaker",
      "talent_suave"
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
      "skill_entertain_any",
      "skill_ride_any",
      "skill_melee_basic",
      "skill_perform_any",
      "skill_play_any_ranged_throwing"
    ],
    "talentIds": [
      "talent_contortionist",
      "talent_jump_up",
      "talent_sharpshooter",
      "talent_trick_riding"
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
      "skill_animal_care",
      "skill_animal_training",
      "skill_art_writing",
      "skill_language_any"
    ],
    "talentIds": [
      "talent_blather",
      "talent_master_of_disguise",
      "talent_perfect_pitch",
      "talent_read_write"
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
      "skill_drive",
      "skill_leadership"
    ],
    "talentIds": [
      "talent_dealmaker",
      "talent_etiquette_any",
      "talent_seasoned_traveller",
      "talent_sharp"
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
      "skill_dodge",
      "skill_endurance",
      "skill_heal",
      "skill_intimidate",
      "skill_intuition",
      "skill_lore_sigmar",
      "skill_melee_flail",
      "skill_outdoor_survival"
    ],
    "talentIds": [
      "talent_berserk_charge",
      "talent_frenzy",
      "talent_read_write",
      "talent_stone_soup"
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
      "skill_art_icons",
      "skill_athletics",
      "skill_cool",
      "skill_language_classical",
      "skill_lore_the_empire",
      "skill_ranged_sling"
    ],
    "talentIds": [
      "talent_hardy",
      "talent_hatred_heretics",
      "talent_flagellant",
      "talent_implacable"
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
      "skill_charm",
      "skill_language_any",
      "skill_lore_theology",
      "skill_perception"
    ],
    "talentIds": [
      "talent_field_dressing",
      "talent_furious_assault",
      "talent_menacing",
      "talent_seasoned_traveller"
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
      "skill_entertain_speeches",
      "skill_leadership"
    ],
    "talentIds": [
      "talent_battle_rage",
      "talent_fearless_heretics",
      "talent_frightening",
      "talent_impassioned_zeal"
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
      "skill_athletics",
      "skill_climb",
      "skill_dodge",
      "skill_endurance",
      "skill_gossip",
      "skill_navigation",
      "skill_perception",
      "skill_melee_brawling"
    ],
    "talentIds": [
      "talent_flee",
      "talent_fleet_footed",
      "talent_sprinter",
      "talent_step_aside"
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
      "skill_animal_care",
      "skill_charm",
      "skill_cool",
      "skill_lore_local",
      "skill_melee_basic",
      "skill_ride_horse"
    ],
    "talentIds": [
      "talent_crack_the_whip",
      "talent_criminal",
      "talent_orientation",
      "talent_seasoned_traveller"
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
      "skill_charm_animal",
      "skill_bribery",
      "skill_consume_alcohol",
      "skill_outdoor_survival"
    ],
    "talentIds": [
      "talent_nose_for_trouble",
      "talent_relentless",
      "talent_tenacious",
      "talent_trick_riding"
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
      "skill_intimidate",
      "skill_leadership"
    ],
    "talentIds": [
      "talent_dealmaker",
      "talent_hatred_outlaws",
      "talent_kingpin",
      "talent_very_resilient"
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
      "skill_charm",
      "skill_endurance",
      "skill_entertain_storytelling",
      "skill_gossip",
      "skill_haggle",
      "skill_intuition",
      "skill_outdoor_survival",
      "skill_stealth_rural_or_urban"
    ],
    "talentIds": [
      "talent_fisherman",
      "talent_flee",
      "talent_rover",
      "talent_tinker"
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
      "skill_animal_care",
      "skill_charm_animal",
      "skill_consume_alcohol",
      "skill_evaluate",
      "skill_ride_horse",
      "skill_trade_tinker"
    ],
    "talentIds": [
      "talent_dealmaker",
      "talent_orientation",
      "talent_seasoned_traveller",
      "talent_strong_back"
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
      "skill_drive",
      "skill_intimidate",
      "skill_language_any",
      "skill_perception"
    ],
    "talentIds": [
      "talent_numismatics",
      "talent_sharp",
      "talent_sturdy",
      "talent_well_prepared",
      "talent_very_resilient"
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
      "skill_lore_local",
      "skill_lore_geography"
    ],
    "talentIds": [
      "talent_cat_tongued",
      "talent_strong_minded",
      "talent_suave",
      "talent_tenacious"
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
      "skill_bribery",
      "skill_consume_alcohol",
      "skill_gamble",
      "skill_gossip",
      "skill_haggle",
      "skill_melee_basic",
      "skill_perception",
      "skill_ranged_crossbow"
    ],
    "talentIds": [
      "talent_coolheaded",
      "talent_embezzle",
      "talent_marksman",
      "talent_numismatics"
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
      "skill_animal_care",
      "skill_endurance",
      "skill_intimidate",
      "skill_intuition",
      "skill_outdoor_survival",
      "skill_ride_horse"
    ],
    "talentIds": [
      "talent_crack_the_whip",
      "talent_criminal",
      "talent_roughrider",
      "talent_seasoned_traveller"
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
      "skill_athletics",
      "skill_charm",
      "skill_leadership",
      "skill_ranged_blackpowder"
    ],
    "talentIds": [
      "talent_etiquette_soldiers",
      "talent_fearless_outlaws",
      "talent_hatred_any",
      "talent_nose_for_trouble"
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
      "skill_lore_empire",
      "skill_navigation"
    ],
    "talentIds": [
      "talent_combat_aware",
      "talent_commanding_presence",
      "talent_kingpin",
      "talent_public_speaker"
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
      "skill_charm",
      "skill_consume_alcohol",
      "skill_heal",
      "skill_intimidate",
      "skill_intuition",
      "skill_lore_torture",
      "skill_melee_fist",
      "skill_perception"
    ],
    "talentIds": [
      "talent_coolheaded",
      "talent_menacing",
      "talent_read_write",
      "talent_resolute"
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
      "skill_cool",
      "skill_dodge",
      "skill_gossip",
      "skill_lore_witches",
      "skill_ranged_any",
      "skill_ride_horse"
    ],
    "talentIds": [
      "talent_dual_wielder",
      "talent_marksman",
      "talent_seasoned_traveller",
      "talent_shadow"
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
      "skill_endurance",
      "skill_leadership",
      "skill_lore_law",
      "skill_lore_local"
    ],
    "talentIds": [
      "talent_fearless_witches",
      "talent_nose_for_trouble",
      "talent_relentless",
      "talent_strong_minded"
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
      "skill_lore_chaos",
      "skill_lore_politics"
    ],
    "talentIds": [
      "talent_frightening",
      "talent_iron_will",
      "talent_magical_sense",
      "talent_pure_soul"
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
      "skill_consume_alcohol",
      "skill_dodge",
      "skill_endurance",
      "skill_gossip",
      "skill_melee_basic",
      "skill_row",
      "skill_sail",
      "skill_swim"
    ],
    "talentIds": [
      "talent_dirty_fighting",
      "talent_fisherman",
      "talent_strong_back",
      "talent_strong_swimmer"
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
      "skill_athletics",
      "skill_entertain_storytelling",
      "skill_haggle",
      "skill_intuition",
      "skill_lore_riverways",
      "skill_perception"
    ],
    "talentIds": [
      "talent_etiquette_guilder",
      "talent_seasoned_traveller",
      "talent_very_strong",
      "talent_waterman"
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
      "skill_climb",
      "skill_entertain_singing",
      "skill_heal",
      "skill_trade_boatbuilding"
    ],
    "talentIds": [
      "talent_dealmaker",
      "talent_embezzle",
      "talent_nose_for_trouble",
      "talent_strike_mighty_blow"
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
      "skill_leadership",
      "skill_navigation"
    ],
    "talentIds": [
      "talent_menacing",
      "talent_orientation",
      "talent_pilot",
      "talent_public_speaker"
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
      "skill_consume_alcohol",
      "skill_gossip",
      "skill_intuition",
      "skill_lore_local",
      "skill_lore_riverways",
      "skill_perception",
      "skill_row",
      "skill_swim"
    ],
    "talentIds": [
      "talent_fisherman",
      "talent_night_vision",
      "talent_orientation",
      "talent_waterman"
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
      "skill_charm",
      "skill_cool",
      "skill_entertain_storytelling",
      "skill_language_any",
      "skill_melee_basic",
      "skill_navigation"
    ],
    "talentIds": [
      "talent_dealmaker",
      "talent_etiquette_guilder",
      "talent_nose_for_trouble",
      "talent_river_guide"
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
      "skill_haggle",
      "skill_intimidate",
      "skill_lore_local",
      "skill_lore_wrecks"
    ],
    "talentIds": [
      "talent_acute_sense_sight",
      "talent_pilot",
      "talent_sea_legs",
      "talent_very_strong"
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
      "skill_leadership",
      "skill_sail"
    ],
    "talentIds": [
      "talent_sixth_sense",
      "talent_sharp",
      "talent_strong_swimmer",
      "talent_tenacious"
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
      "skill_athletics",
      "skill_dodge",
      "skill_endurance",
      "skill_melee_basic",
      "skill_perception",
      "skill_row",
      "skill_sail",
      "skill_swim"
    ],
    "talentIds": [
      "talent_strong_swimmer",
      "talent_strong_back",
      "talent_very_strong",
      "talent_waterman"
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
      "skill_bribery",
      "skill_charm",
      "skill_intimidate",
      "skill_gossip",
      "skill_lore_riverways",
      "skill_ranged_blackpowder"
    ],
    "talentIds": [
      "talent_criminal",
      "talent_gunner",
      "talent_fisherman",
      "talent_seasoned_traveller"
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
      "skill_climb",
      "skill_cool",
      "skill_intuition",
      "skill_leadership"
    ],
    "talentIds": [
      "talent_fearless_wreckers",
      "talent_hatred_any",
      "talent_pilot",
      "talent_sea_legs"
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
      "skill_lore_law",
      "skill_navigation"
    ],
    "talentIds": [
      "talent_commanding_presence",
      "talent_kingpin",
      "talent_menacing",
      "talent_orientation"
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
      "skill_athletics",
      "skill_consume_alcohol",
      "skill_dodge",
      "skill_endurance",
      "skill_gossip",
      "skill_outdoor_survival",
      "skill_row",
      "skill_swim"
    ],
    "talentIds": [
      "talent_fisherman",
      "talent_gregarious",
      "talent_strider_marshes",
      "talent_strong_swimmer"
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
      "skill_gamble",
      "skill_lore_local",
      "skill_lore_riverways",
      "skill_ranged_entangling",
      "skill_ranged_throwing",
      "skill_set_trap"
    ],
    "talentIds": [
      "talent_craftsman_boatbuilder",
      "talent_rover",
      "talent_strong_back",
      "talent_waterman"
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
      "skill_charm",
      "skill_intuition",
      "skill_melee_pole_arm",
      "skill_perception"
    ],
    "talentIds": [
      "talent_savant_riverways",
      "talent_stout_hearted",
      "talent_tenacious",
      "talent_very_strong"
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
      "skill_entertain_storytelling",
      "skill_lore_folklore"
    ],
    "talentIds": [
      "talent_master_tradesman_boatbuilder",
      "talent_public_speaker",
      "talent_sharp",
      "talent_strong_minded"
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
      "skill_climb",
      "skill_consume_alcohol",
      "skill_gamble",
      "skill_gossip",
      "skill_row",
      "skill_melee_brawling",
      "skill_sail",
      "skill_swim"
    ],
    "talentIds": [
      "talent_fisherman",
      "talent_strider_coastal",
      "talent_strong_back",
      "talent_strong_swimmer"
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
      "skill_athletics",
      "skill_dodge",
      "skill_endurance",
      "skill_entertain_singing",
      "skill_language_any",
      "skill_melee_basic"
    ],
    "talentIds": [
      "talent_catfall",
      "talent_sea_legs",
      "talent_seasoned_traveller",
      "talent_strong_legs"
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
      "skill_cool",
      "skill_leadership",
      "skill_perception",
      "skill_trade_carpenter"
    ],
    "talentIds": [
      "talent_old_salt",
      "talent_strike_mighty_blow",
      "talent_tenacious",
      "talent_very_strong"
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
      "skill_charm",
      "skill_navigation"
    ],
    "talentIds": [
      "talent_orientation",
      "talent_pilot",
      "talent_public_speaker",
      "talent_savvy"
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
      "skill_athletics",
      "skill_bribery",
      "skill_cool",
      "skill_consume_alcohol",
      "skill_row",
      "skill_sail",
      "skill_stealth_rural_or_urban",
      "skill_swim"
    ],
    "talentIds": [
      "talent_criminal",
      "talent_fisherman",
      "talent_strider_marshes",
      "talent_strong_back"
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
      "skill_haggle",
      "skill_charm",
      "skill_gossip",
      "skill_lore_local",
      "skill_melee_basic",
      "skill_perception",
      "skill_secret_signs_smuggler"
    ],
    "talentIds": [
      "talent_dealmaker",
      "talent_etiquette_criminals",
      "talent_waterman",
      "talent_very_strong"
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
      "skill_evaluate",
      "skill_intimidate",
      "skill_intuition",
      "skill_lore_riverways"
    ],
    "talentIds": [
      "talent_briber",
      "talent_fearless_riverwardens",
      "talent_pilot",
      "talent_strong_swimmer"
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
      "skill_language_any",
      "skill_leadership"
    ],
    "talentIds": [
      "talent_kingpin",
      "talent_savvy",
      "talent_strider_coastal",
      "talent_sea_legs"
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
      "skill_athletics",
      "skill_climb",
      "skill_consume_alcohol",
      "skill_dodge",
      "skill_endurance",
      "skill_gossip",
      "skill_melee_basic",
      "skill_swim"
    ],
    "talentIds": [
      "talent_dirty_fighting",
      "talent_strong_back",
      "talent_sturdy",
      "talent_very_strong"
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
      "skill_bribery",
      "skill_entertain_storytelling",
      "skill_gamble",
      "skill_intimidate",
      "skill_perception",
      "skill_stealth_urban"
    ],
    "talentIds": [
      "talent_criminal",
      "talent_etiquette_guilders",
      "talent_strong_legs",
      "talent_tenacious"
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
      "skill_cool",
      "skill_evaluate",
      "skill_intuition",
      "skill_leadership"
    ],
    "talentIds": [
      "talent_dealmaker",
      "talent_embezzle",
      "talent_etiquette_criminals",
      "talent_public_speaker"
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
      "skill_charm",
      "skill_lore_taxes"
    ],
    "talentIds": [
      "talent_kingpin",
      "talent_menacing",
      "talent_numismatics",
      "talent_read_write"
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
      "skill_climb",
      "skill_consume_alcohol",
      "skill_dodge",
      "skill_endurance",
      "skill_row",
      "skill_melee_basic",
      "skill_outdoor_survival",
      "skill_swim"
    ],
    "talentIds": [
      "talent_break_and_enter",
      "talent_criminal",
      "talent_fisherman",
      "talent_strong_back"
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
      "skill_bribery",
      "skill_cool",
      "skill_intuition",
      "skill_navigation",
      "skill_perception",
      "skill_set_trap"
    ],
    "talentIds": [
      "talent_flee",
      "talent_rover",
      "talent_strong_swimmer",
      "talent_trapper"
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
      "skill_gossip",
      "skill_intimidate",
      "skill_ranged_crossbow",
      "skill_stealth_rural"
    ],
    "talentIds": [
      "talent_dirty_fighting",
      "talent_etiquette_criminals",
      "talent_menacing",
      "talent_waterman"
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
      "skill_leadership",
      "skill_lore_riverways"
    ],
    "talentIds": [
      "talent_furious_assault",
      "talent_in_fighter",
      "talent_pilot",
      "talent_warrior_born"
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
      "skill_bribery",
      "skill_charm",
      "skill_consume_alcohol",
      "skill_entertain_any",
      "skill_gamble",
      "skill_gossip",
      "skill_haggle",
      "skill_intimidate"
    ],
    "talentIds": [
      "talent_attractive",
      "talent_alley_cat",
      "talent_blather",
      "talent_gregarious"
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
      "skill_dodge",
      "skill_endurance",
      "skill_intuition",
      "skill_lore_local",
      "skill_melee_basic",
      "skill_perception"
    ],
    "talentIds": [
      "talent_ambidextrous",
      "talent_carouser",
      "talent_criminal",
      "talent_resistance_disease"
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
      "skill_cool",
      "skill_evaluate",
      "skill_language_any",
      "skill_lore_law"
    ],
    "talentIds": [
      "talent_dealmaker",
      "talent_embezzle",
      "talent_etiquette_any",
      "talent_suave"
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
      "skill_leadership",
      "skill_lore_heraldry"
    ],
    "talentIds": [
      "talent_briber",
      "talent_kingpin",
      "talent_numismatics",
      "talent_savvy"
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
      "skill_bribery",
      "skill_consume_alcohol",
      "skill_charm",
      "skill_entertain_storytelling",
      "skill_gamble",
      "skill_gossip",
      "skill_haggle",
      "skill_sleight_of_hand"
    ],
    "talentIds": [
      "talent_cardsharp",
      "talent_diceman",
      "talent_etiquette_any",
      "talent_luck"
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
      "skill_cool",
      "skill_dodge",
      "skill_entertain_acting",
      "skill_evaluate",
      "skill_intuition",
      "skill_perception"
    ],
    "talentIds": [
      "talent_blather",
      "talent_criminal",
      "talent_fast_hands",
      "talent_secret_identity"
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
      "skill_language_thief",
      "skill_lore_heraldry",
      "skill_pick_lock",
      "skill_secret_signs_thief"
    ],
    "talentIds": [
      "talent_attractive",
      "talent_cat_tongued",
      "talent_dealmaker",
      "talent_read_write"
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
      "skill_lore_genealogy",
      "skill_research"
    ],
    "talentIds": [
      "talent_gregarious",
      "talent_master_of_disguise",
      "talent_nose_for_trouble",
      "talent_suave"
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
      "skill_charm",
      "skill_consume_alcohol",
      "skill_dodge",
      "skill_evaluate",
      "skill_gamble",
      "skill_gossip",
      "skill_haggle",
      "skill_melee_basic"
    ],
    "talentIds": [
      "talent_alley_cat",
      "talent_cardsharp",
      "talent_dealmaker",
      "talent_gregarious"
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
      "skill_cool",
      "skill_intimidate",
      "skill_intuition",
      "skill_perception",
      "skill_secret_signs_thief",
      "skill_trade_engraver"
    ],
    "talentIds": [
      "talent_criminal",
      "talent_etiquette_criminals",
      "talent_numismatics",
      "talent_savvy"
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
      "skill_bribery",
      "skill_entertain_storytelling",
      "skill_lore_art",
      "skill_lore_local"
    ],
    "talentIds": [
      "talent_kingpin",
      "talent_strike_to_stun",
      "talent_suave",
      "talent_super_numerate"
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
      "skill_lore_heraldry",
      "skill_research"
    ],
    "talentIds": [
      "talent_dirty_fighting",
      "talent_iron_will",
      "talent_menacing",
      "talent_briber"
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
      "skill_climb",
      "skill_cool",
      "skill_dodge",
      "skill_endurance",
      "skill_gossip",
      "skill_intuition",
      "skill_perception",
      "skill_stealth_any"
    ],
    "talentIds": [
      "talent_alley_cat",
      "talent_criminal",
      "talent_flee",
      "talent_strong_back"
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
      "skill_bribery",
      "skill_endurance",
      "skill_evaluate",
      "skill_haggle",
      "skill_lore_medicine",
      "skill_melee_basic"
    ],
    "talentIds": [
      "talent_break_and_enter",
      "talent_night_vision",
      "talent_resistance_disease",
      "talent_very_strong"
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
      "skill_drive",
      "skill_lore_history",
      "skill_pick_lock",
      "skill_set_trap"
    ],
    "talentIds": [
      "talent_read_write",
      "talent_strike_mighty_blow",
      "talent_tenacious",
      "talent_tunnel_rat"
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
      "skill_navigation",
      "skill_trade_engineer"
    ],
    "talentIds": [
      "talent_fearless_undead",
      "talent_sixth_sense",
      "talent_strong_minded",
      "talent_trapper"
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
      "skill_athletics",
      "skill_consume_alcohol",
      "skill_cool",
      "skill_endurance",
      "skill_gamble",
      "skill_intimidate",
      "skill_melee_basic",
      "skill_outdoor_survival"
    ],
    "talentIds": [
      "talent_combat_aware",
      "talent_criminal",
      "talent_rover",
      "talent_flee"
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
      "skill_dodge",
      "skill_heal",
      "skill_lore_local",
      "skill_perception",
      "skill_ranged_bow",
      "skill_stealth_rural"
    ],
    "talentIds": [
      "talent_dirty_fighting",
      "talent_marksman",
      "talent_strike_to_stun",
      "talent_trapper"
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
      "skill_gossip",
      "skill_intuition",
      "skill_leadership",
      "skill_ride_horse"
    ],
    "talentIds": [
      "talent_rapid_reload",
      "talent_roughrider",
      "talent_menacing",
      "talent_very_resilient"
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
      "skill_charm",
      "skill_lore_empire"
    ],
    "talentIds": [
      "talent_deadeye_shot",
      "talent_fearless_road_wardens",
      "talent_iron_will",
      "talent_robust"
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
      "skill_consume_alcohol",
      "skill_cool",
      "skill_dodge",
      "skill_endurance",
      "skill_intimidate",
      "skill_lore_local",
      "skill_melee_brawling",
      "skill_stealth_urban"
    ],
    "talentIds": [
      "talent_criminal",
      "talent_etiquette_criminals",
      "talent_menacing",
      "talent_strike_mighty_blow"
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
      "skill_bribery",
      "skill_charm",
      "skill_evaluate",
      "skill_gossip",
      "skill_language_estalian_or_tilean",
      "skill_melee_basic"
    ],
    "talentIds": [
      "talent_embezzle",
      "talent_street_fighting",
      "talent_strike_to_stun",
      "talent_warrior_born"
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
      "skill_intuition",
      "skill_leadership",
      "skill_perception",
      "skill_ranged_crossbow"
    ],
    "talentIds": [
      "talent_fearless_watchmen",
      "talent_iron_will",
      "talent_resistance_poison",
      "talent_robust"
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
      "skill_lore_law",
      "skill_lore_politics"
    ],
    "talentIds": [
      "talent_commanding_presence",
      "talent_kingpin",
      "talent_frightening",
      "talent_wealthy"
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
      "skill_athletics",
      "skill_climb",
      "skill_cool",
      "skill_dodge",
      "skill_endurance",
      "skill_intuition",
      "skill_perception",
      "skill_stealth_urban"
    ],
    "talentIds": [
      "talent_alley_cat",
      "talent_criminal",
      "talent_flee",
      "talent_strike_to_stun"
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
      "skill_evaluate",
      "skill_gossip",
      "skill_lore_local",
      "skill_pick_lock",
      "skill_secret_signs_thief",
      "skill_sleight_of_hand"
    ],
    "talentIds": [
      "talent_break_and_enter",
      "talent_etiquette_criminals",
      "talent_fast_hands",
      "talent_shadow"
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
      "skill_bribery",
      "skill_gamble",
      "skill_intimidate",
      "skill_ranged_crossbow"
    ],
    "talentIds": [
      "talent_night_vision",
      "talent_nimble_fingered",
      "talent_step_aside",
      "talent_trapper"
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
      "skill_charm",
      "skill_set_trap"
    ],
    "talentIds": [
      "talent_catfall",
      "talent_scale_sheer_surface",
      "talent_strong_legs",
      "talent_wealthy"
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
      "skill_channelling",
      "skill_cool",
      "skill_endurance",
      "skill_gossip",
      "skill_intimidate",
      "skill_language_magick",
      "skill_sleight_of_hand",
      "skill_stealth_rural"
    ],
    "talentIds": [
      "talent_criminal",
      "talent_instinctive_diction",
      "talent_menacing",
      "talent_petty_magic"
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
      "skill_charm_animal",
      "skill_dodge",
      "skill_intuition",
      "skill_melee_pole_arm",
      "skill_perception",
      "skill_trade_herbalist"
    ],
    "talentIds": [
      "talent_arcane_magic_witchery",
      "talent_attractive",
      "talent_sixth_sense",
      "talent_witch"
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
      "skill_bribery",
      "skill_charm",
      "skill_haggle",
      "skill_lore_dark_magic"
    ],
    "talentIds": [
      "talent_animal_affinity",
      "talent_fast_hands",
      "talent_frightening",
      "talent_magical_sense"
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
      "skill_lore_daemonology",
      "skill_lore_magick"
    ],
    "talentIds": [
      "talent_aethyric_attunement",
      "talent_luck",
      "talent_strong_minded",
      "talent_very_resilient"
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
      "skill_animal_care",
      "skill_charm_animal",
      "skill_endurance",
      "skill_language_battle",
      "skill_melee_basic",
      "skill_outdoor_survival",
      "skill_perception",
      "skill_ride_horse"
    ],
    "talentIds": [
      "talent_combat_aware",
      "talent_crack_the_whip",
      "talent_lightning_reflexes",
      "talent_roughrider"
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
      "skill_charm",
      "skill_consume_alcohol",
      "skill_cool",
      "skill_gossip",
      "skill_melee_cavalry",
      "skill_ranged_blackpowder"
    ],
    "talentIds": [
      "talent_etiquette_soldiers",
      "talent_gunner",
      "talent_seasoned_traveller",
      "talent_trick_riding"
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
      "skill_intimidate",
      "skill_intuition",
      "skill_leadership",
      "skill_lore_warfare"
    ],
    "talentIds": [
      "talent_combat_reflexes",
      "talent_fast_shot",
      "talent_hatred_any",
      "talent_war_leader"
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
      "skill_gamble",
      "skill_lore_heraldry"
    ],
    "talentIds": [
      "talent_accurate_shot",
      "talent_inspiring",
      "talent_reaction_strike",
      "talent_robust"
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
      "skill_consume_alcohol",
      "skill_endurance",
      "skill_entertain_storytelling",
      "skill_gamble",
      "skill_gossip",
      "skill_intuition",
      "skill_melee_basic",
      "skill_perception"
    ],
    "talentIds": [
      "talent_diceman",
      "talent_etiquette_servants",
      "talent_strike_to_stun",
      "talent_tenacious"
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
      "skill_athletics",
      "skill_cool",
      "skill_dodge",
      "skill_intimidate",
      "skill_melee_pole_arm",
      "skill_ranged_bow"
    ],
    "talentIds": [
      "talent_relentless",
      "talent_reversal",
      "talent_shieldsman",
      "talent_strike_mighty_blow"
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
      "skill_heal",
      "skill_language_battle",
      "skill_lore_etiquette",
      "skill_melee_two_handed"
    ],
    "talentIds": [
      "talent_fearless_intruders",
      "talent_jump_up",
      "talent_stout_hearted",
      "talent_unshakable"
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
      "skill_leadership",
      "skill_lore_warfare"
    ],
    "talentIds": [
      "talent_combat_master",
      "talent_furious_assault",
      "talent_iron_will",
      "talent_robust"
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
      "skill_athletics",
      "skill_animal_care",
      "skill_charm_animal",
      "skill_heal",
      "skill_lore_heraldry",
      "skill_melee_cavalry",
      "skill_ride_horse",
      "skill_trade_farrier"
    ],
    "talentIds": [
      "talent_etiquette_any",
      "talent_roughrider",
      "talent_sturdy",
      "talent_warrior_born"
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
      "skill_cool",
      "skill_dodge",
      "skill_endurance",
      "skill_intimidate",
      "skill_language_battle",
      "skill_melee_any"
    ],
    "talentIds": [
      "talent_menacing",
      "talent_seasoned_traveller",
      "talent_shieldsman",
      "talent_strike_mighty_blow"
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
      "skill_charm",
      "skill_consume_alcohol",
      "skill_leadership",
      "skill_lore_warfare"
    ],
    "talentIds": [
      "talent_fearless_any",
      "talent_stout_hearted",
      "talent_unshakable",
      "talent_war_leader"
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
      "skill_lore_any",
      "skill_secret_signs_knightly_order"
    ],
    "talentIds": [
      "talent_disarm",
      "talent_inspiring",
      "talent_iron_will",
      "talent_strike_to_injure"
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
      "skill_athletics",
      "skill_cool",
      "skill_dodge",
      "skill_endurance",
      "skill_gamble",
      "skill_intimidate",
      "skill_melee_any",
      "skill_melee_brawling"
    ],
    "talentIds": [
      "talent_dirty_fighting",
      "talent_in_fighter",
      "talent_iron_jaw",
      "talent_reversal"
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
      "skill_haggle",
      "skill_intuition",
      "skill_melee_basic",
      "skill_melee_flail_or_two_handed",
      "skill_perception",
      "skill_ranged_entangling"
    ],
    "talentIds": [
      "talent_ambidextrous",
      "talent_combat_reflexes",
      "talent_dual_wielder",
      "talent_shieldsman"
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
      "skill_consume_alcohol",
      "skill_gossip",
      "skill_lore_anatomy",
      "skill_perform_fight"
    ],
    "talentIds": [
      "talent_combat_master",
      "talent_disarm",
      "talent_menacing",
      "talent_robust"
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
      "skill_charm",
      "skill_ranged_any"
    ],
    "talentIds": [
      "talent_frightening",
      "talent_furious_assault",
      "talent_implacable",
      "talent_reaction_strike"
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
      "skill_athletics",
      "skill_dodge",
      "skill_endurance",
      "skill_entertain_taunt",
      "skill_gossip",
      "skill_haggle",
      "skill_intimidate",
      "skill_melee_any"
    ],
    "talentIds": [
      "talent_in_fighter",
      "talent_dirty_fighting",
      "talent_menacing",
      "talent_warrior_born"
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
      "skill_bribery",
      "skill_charm",
      "skill_intuition",
      "skill_melee_basic",
      "skill_perception",
      "skill_ride_horse"
    ],
    "talentIds": [
      "talent_combat_reflexes",
      "talent_criminal",
      "talent_reversal",
      "talent_strike_to_stun"
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
      "skill_climb",
      "skill_cool",
      "skill_navigation",
      "skill_ranged_thrown"
    ],
    "talentIds": [
      "talent_careful_strike",
      "talent_disarm",
      "talent_marksman",
      "talent_relentless"
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
      "skill_entertain_acting",
      "skill_ranged_crossbow"
    ],
    "talentIds": [
      "talent_accurate_shot",
      "talent_ambidextrous",
      "talent_furious_assault",
      "talent_strike_to_injure"
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
      "skill_athletics",
      "skill_climb",
      "skill_cool",
      "skill_dodge",
      "skill_endurance",
      "skill_language_battle",
      "skill_melee_basic",
      "skill_play_drum_or_fife"
    ],
    "talentIds": [
      "talent_diceman",
      "talent_marksman",
      "talent_strong_back",
      "talent_warrior_born"
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
      "skill_consume_alcohol",
      "skill_gamble",
      "skill_gossip",
      "skill_melee_any",
      "skill_ranged_any",
      "skill_outdoor_survival"
    ],
    "talentIds": [
      "talent_drilled",
      "talent_etiquette_soldiers",
      "talent_rapid_reload",
      "talent_shieldsman"
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
      "skill_heal",
      "skill_intuition",
      "skill_leadership",
      "skill_perception"
    ],
    "talentIds": [
      "talent_combat_aware",
      "talent_enclosed_fighter",
      "talent_unshakable",
      "talent_war_leader"
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
      "skill_lore_warfare",
      "skill_navigation"
    ],
    "talentIds": [
      "talent_inspiring",
      "talent_public_speaker",
      "talent_seasoned_traveller",
      "talent_stout_hearted"
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
      "skill_consume_alcohol",
      "skill_cool",
      "skill_dodge",
      "skill_endurance",
      "skill_gamble",
      "skill_heal",
      "skill_lore_trolls",
      "skill_melee_basic"
    ],
    "talentIds": [
      "talent_dual_wielder",
      "talent_fearless_everything",
      "talent_frenzy",
      "talent_slayer"
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
      "skill_evaluate",
      "skill_intimidate",
      "skill_language_battle",
      "skill_lore_giants",
      "skill_melee_two_handed",
      "skill_outdoor_survival"
    ],
    "talentIds": [
      "talent_hardy",
      "talent_implacable",
      "talent_menacing",
      "talent_reversal"
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
      "skill_entertain_storytelling",
      "skill_lore_dragons",
      "skill_perception",
      "skill_ranged_thrown"
    ],
    "talentIds": [
      "talent_ambidextrous",
      "talent_furious_assault",
      "talent_relentless",
      "talent_robust"
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
      "skill_intuition",
      "skill_lore_chaos"
    ],
    "talentIds": [
      "talent_combat_master",
      "talent_frightening",
      "talent_strike_mighty_blow",
      "talent_very_strong"
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
      "skill_cool",
      "skill_dodge",
      "skill_endurance",
      "skill_heal",
      "skill_leadership",
      "skill_lore_theology",
      "skill_melee_any",
      "skill_pray"
    ],
    "talentIds": [
      "talent_bless_any",
      "talent_etiquette_cultists",
      "talent_read_write",
      "talent_strong_minded"
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
      "skill_charm",
      "skill_entertain_speeches",
      "skill_intimidate",
      "skill_language_battle",
      "skill_melee_any",
      "skill_ranged_any"
    ],
    "talentIds": [
      "talent_dual_wielder",
      "talent_inspiring",
      "talent_invoke_any",
      "talent_seasoned_traveller"
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
      "skill_animal_care",
      "skill_intuition",
      "skill_perception",
      "skill_ride_horse"
    ],
    "talentIds": [
      "talent_combat_aware",
      "talent_holy_visions",
      "talent_pure_soul",
      "talent_stout_hearted"
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
      "skill_consume_alcohol",
      "skill_lore_warfare"
    ],
    "talentIds": [
      "talent_fearless_any",
      "talent_furious_assault",
      "talent_holy_hatred",
      "talent_war_leader"
    ],
    "trappingIds": [
      "religious_relic"
    ]
  }
];
