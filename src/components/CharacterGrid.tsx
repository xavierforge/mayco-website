import { motion } from "motion/react";
import type { Character } from "../data/characters";

interface CharacterGridProps {
  characters: Character[];
  onSelect: (character: Character) => void;
}

/** 角色家族格：貼紙風卡片，點下去開介紹 modal */
export function CharacterGrid({ characters, onSelect }: CharacterGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {characters.map((character, i) => (
        <motion.li
          key={character.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4, delay: (i % 3) * 0.08, ease: "easeOut" }}
        >
          <button
            type="button"
            onClick={() => onSelect(character)}
            className="sticker flex w-full flex-col items-center gap-2 p-5 transition-transform hover:-translate-y-1 hover:rotate-1"
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-cream">
              {character.img ? (
                <img
                  src={character.img}
                  alt={character.name.zh}
                  className="max-h-16 max-w-16 object-contain"
                />
              ) : (
                <span className="text-4xl leading-none">{character.emoji}</span>
              )}
            </span>
            <span className="text-base font-black text-stone-700">
              {character.name.zh}
            </span>
            <span className="text-xs font-bold text-mayco-soft">認識他 →</span>
          </button>
        </motion.li>
      ))}
    </ul>
  );
}
