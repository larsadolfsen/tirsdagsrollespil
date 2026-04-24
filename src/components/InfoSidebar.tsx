import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Info, X } from "lucide-react";
import type { ResolvedCharacterRecord, ResolvedCharacterSkill } from "../data/characters/resolved";
import { getCharacterSkillKey } from "../lib/gameSession";
import type { RulesIndex } from "../lib/gameSession";
import type { ActiveInfoState } from "./appTypes";

export function InfoSidebar({
  activeInfo,
  setActiveInfo,
  characterData,
  characterSkills,
  setCharacterSkills,
  rulesIndex,
  skillListRefs,
  propertyListRefs,
}: {
  activeInfo: ActiveInfoState | null;
  setActiveInfo: Dispatch<SetStateAction<ActiveInfoState | null>>;
  characterData: ResolvedCharacterRecord;
  characterSkills: ResolvedCharacterSkill[];
  setCharacterSkills: Dispatch<SetStateAction<ResolvedCharacterSkill[]>>;
  rulesIndex: RulesIndex;
  skillListRefs: MutableRefObject<Record<string, HTMLDivElement | null>>;
  propertyListRefs: MutableRefObject<Record<string, HTMLDivElement | null>>;
}) {
  return (
    <AnimatePresence mode="wait">
      {activeInfo && (
        <motion.aside
          key="info-sidebar"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="wfrp-sidebar-shell w-[400px]"
        >
          <div className="wfrp-sidebar-header p-4">
            <div className="flex flex-col">
              <h2 className="text-sm font-bold font-serif uppercase tracking-widest text-wfrp-gold">
                {activeInfo.type === "skill"
                  ? "Skill Compendium"
                  : activeInfo.type === "talent"
                    ? "Talent Ledger"
                    : activeInfo.type === "equipment"
                      ? "Equipment Manifest"
                      : activeInfo.type === "property"
                        ? "Weapon Properties"
                        : activeInfo.type === "attack"
                          ? "Combat Action"
                          : "Grimoire"}
              </h2>
              <span className="text-[8px] text-gray-500 font-bold uppercase tracking-tighter">
                Knowledge is power
              </span>
            </div>
            <button
              onClick={() => setActiveInfo(null)}
              className="wfrp-icon-btn p-1 rounded-full hover:bg-[#303030]"
              aria-label="Close sidebar"
            >
              <X size={20} className="cursor-pointer" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scroll-smooth pb-20 no-scrollbar">
            {activeInfo.type === "attack" && (
              <div className="p-6 flex flex-col gap-8">
                <div className="flex flex-col">
                  <h3 className="text-2xl font-serif font-bold text-gray-200 mb-1">
                    {activeInfo.name}
                  </h3>
                  <span className="wfrp-sidebar-section mb-6">
                    Rule-Book Description
                  </span>

                  <p className="wfrp-sidebar-body wfrp-subpanel rounded p-4 italic">
                    "
                    {rulesIndex.actionDescriptionByName[activeInfo.name] ||
                      "A standard combat maneuver. Consult the WFRP Core Rulebook for deep tactical situational rules."}
                    "
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                    Rule-Book Properties
                    <div className="h-px flex-1 bg-white/5" />
                  </h4>
                  <div className="flex flex-col gap-2">
                    {activeInfo.extra.properties.map((prop: string) => (
                      <button
                        key={prop}
                        onClick={() => setActiveInfo({ type: "property", name: prop })}
                        className="flex flex-col gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-lg text-left group hover:border-wfrp-gold/40 hover:bg-white/[0.04] transition-all cursor-pointer shadow-inner"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-300 group-hover:text-wfrp-gold transition-colors">
                            {prop}
                          </span>
                          <Info
                            size={12}
                            className="text-gray-700 group-hover:text-wfrp-gold/50 transition-all"
                          />
                        </div>
                        <p className="text-[11px] leading-relaxed text-gray-500 font-serif italic line-clamp-2">
                          {rulesIndex.propertyDescriptionByName[prop] ||
                            "No sanctioned rules found for this property."}
                        </p>
                      </button>
                    ))}
                    {activeInfo.extra.properties.length === 0 && (
                      <p className="text-[10px] text-gray-700 italic px-2">
                        No special properties apply to this standard action.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeInfo.type === "property" &&
              Object.entries(rulesIndex.propertyDescriptionByName)
                .filter(([name]) =>
                  activeInfo.extra?.weaponProperties
                    ? activeInfo.extra.weaponProperties.includes(name)
                    : true,
                )
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([name, desc]) => (
                  <div
                    key={name}
                    ref={(el) => {
                      propertyListRefs.current[name] = el;
                    }}
                    className={`p-5 border-b border-white/5 transition-all ${activeInfo.name === name ? "bg-wfrp-gold/5" : ""}`}
                  >
                    <div className="flex flex-col">
                      <h3
                        className={`text-lg font-serif font-bold mb-1 ${activeInfo.name === name ? "text-wfrp-gold" : "text-gray-200"}`}
                      >
                        {name}
                      </h3>
                      <p className="text-[11px] text-gray-400 leading-relaxed font-serif italic">
                        "{desc}"
                      </p>
                    </div>
                  </div>
                ))}

            {activeInfo.type === "skill" &&
              [...characterSkills]
                .sort((a, b) => a.displayName.localeCompare(b.displayName))
                .map((skill) => {
                  const charValue =
                    (characterData.attributes as Record<string, number>)[skill.characteristic] || 0;
                  const totalValue = charValue + skill.advances;

                  return (
                    <div
                      key={getCharacterSkillKey(skill)}
                      ref={(el) => {
                        skillListRefs.current[skill.displayName] = el;
                      }}
                      className="transition-colors p-4 border-b border-white/5 last:border-0"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex flex-col">
                          <h3 className="font-bold font-serif uppercase tracking-tight text-white mb-0.5">
                            {skill.displayName}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-black uppercase text-gray-600 tracking-widest">
                              {skill.characteristic}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            onClick={() => {
                              const updatedSkills = characterSkills.map((s) =>
                                getCharacterSkillKey(s) === getCharacterSkillKey(skill)
                                  ? { ...s, advances: s.advances + 1 }
                                  : s,
                              );
                              setCharacterSkills(updatedSkills);
                            }}
                            className="wfrp-mini-action-btn"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => {
                              const updatedSkills = characterSkills.map((s) =>
                                getCharacterSkillKey(s) === getCharacterSkillKey(skill)
                                  ? { ...s, advances: s.advances + 10 }
                                  : s,
                              );
                              setCharacterSkills(updatedSkills);
                            }}
                            className="wfrp-mini-action-btn"
                          >
                            +10
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] leading-relaxed font-serif italic text-gray-400 pr-2">
                        {rulesIndex.skillDescriptionByName[skill.displayName] ||
                          "Detailed rules for this skill can be found in the WFRP Core Rulebook."}
                      </p>
                    </div>
                  );
                })}

            {activeInfo.type === "spell" && (
              <div className="p-6 flex flex-col gap-8">
                <div className="flex flex-col">
                  <h3 className="text-2xl font-serif font-bold text-gray-200 mb-1">
                    {activeInfo.name}
                  </h3>
                  <span className="wfrp-sidebar-section mb-6">
                    Grimoire Entry
                  </span>

                  <div className="wfrp-subpanel space-y-4 p-4 rounded">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-0.5">
                          CN
                        </p>
                        <p className="text-xs font-bold text-gray-200">{activeInfo.extra?.cn}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-0.5">
                          Duration
                        </p>
                        <p className="text-xs font-bold text-gray-200">
                          {activeInfo.extra?.duration}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-0.5">
                          Range
                        </p>
                        <p className="text-xs font-bold text-gray-200">{activeInfo.extra?.range}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-0.5">
                          Target
                        </p>
                        <p className="text-xs font-bold text-gray-200">{activeInfo.extra?.target}</p>
                      </div>
                    </div>

                    <div className="h-px bg-white/5" />

                    <p className="text-[13px] leading-relaxed text-gray-400 font-serif italic">
                      "
                      {activeInfo.extra?.description ||
                        "A standard spell. Consult the WFRP Core Rulebook for deep tactical situational rules."}
                      "
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeInfo.type === "talent" &&
              characterData.talents.map((talent) => (
                <div key={talent.name} className="p-4">
                  <h3 className="font-bold font-serif uppercase tracking-tight text-white mb-2">
                    {talent.name}
                  </h3>
                  <p className="text-[11px] leading-relaxed font-serif italic text-gray-400">
                    {talent.description}
                  </p>
                </div>
              ))}

            {activeInfo.type === "equipment" &&
              characterData.equipment.map((item) => (
                <div key={item.name} className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold font-serif uppercase tracking-tight text-white">
                      {item.name}
                    </h3>
                    <span className="text-[8px] font-black uppercase text-gray-600">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed font-serif italic text-gray-400">
                    {item.description}
                  </p>
                </div>
              ))}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
