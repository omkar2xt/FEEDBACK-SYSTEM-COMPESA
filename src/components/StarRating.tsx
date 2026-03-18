import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
}

export function StarRating({ value, onChange }: StarRatingProps) {
  return (
    <div className="flex gap-2" role="radiogroup" aria-label="Star rating">
      {Array.from({ length: 5 }).map((_, index) => {
        const star = index + 1;
        const active = star <= value;
        return (
          <motion.button
            type="button"
            key={star}
            onClick={() => onChange(star)}
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="rounded-full p-1"
            role="radio"
            aria-checked={active}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              className={`h-8 w-8 transition ${
                active ? "fill-yellow-300 text-yellow-300" : "text-white/40"
              }`}
            />
          </motion.button>
        );
      })}
    </div>
  );
}
