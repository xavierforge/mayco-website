import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Character } from "../data/characters";

interface CharacterModalProps {
  character: Character | null;
  onClose: () => void;
}

/** 角色介紹卡：圓角白卡、貼紙感，從下方彈進來 */
export function CharacterModal({ character, onClose }: CharacterModalProps) {
  useEffect(() => {
    if (!character) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [character, onClose]);

  return (
    <AnimatePresence>
      {character && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div
            className="absolute inset-0 bg-stone-900/25 backdrop-blur-[2px]"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={character.name.zh}
            className="sticker relative w-full max-w-sm p-6 text-center"
            initial={{ y: 40, scale: 0.92, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="關閉"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-cream text-stone-400 transition-colors hover:bg-mayco hover:text-white"
            >
              ✕
            </button>

            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-cream">
              {character.img ? (
                <img
                  src={character.img}
                  alt={character.name.zh}
                  className="max-h-24 max-w-24 object-contain"
                />
              ) : (
                <span className="text-6xl leading-none">{character.emoji}</span>
              )}
            </div>

            <h3 className="mt-4 text-2xl font-black text-mayco">{character.name.zh}</h3>

            {character.foundAt && (
              <p className="mt-1 inline-block rounded-full bg-cream px-3 py-1 text-xs font-bold text-stone-500">
                {character.foundAt.zh}
              </p>
            )}

            <p className="mt-4 text-left text-[15px] leading-7 text-stone-600">
              {character.desc.zh}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
