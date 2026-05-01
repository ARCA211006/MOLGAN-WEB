import * as Slider from "@radix-ui/react-slider";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Info } from "lucide-react";

interface PropertySliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  tooltip: string;
}

export function PropertySlider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  tooltip,
}: PropertySliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground/90">{label}</span>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <Info className="w-3.5 h-3.5" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="bg-popover text-popover-foreground px-3 py-2 rounded-lg text-xs max-w-xs border border-border shadow-lg"
                  sideOffset={5}
                >
                  {tooltip}
                  <Tooltip.Arrow className="fill-popover" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>
        <span className="text-sm font-mono text-[var(--neon-blue)]">
          {value.toFixed(2)}
        </span>
      </div>
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        min={min}
        max={max}
        step={step}
      >
        <Slider.Track className="bg-white/10 relative grow rounded-full h-1.5">
          <Slider.Range className="absolute bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-blue)] rounded-full h-full" />
        </Slider.Track>
        <Slider.Thumb
          className="block w-4 h-4 bg-white rounded-full shadow-lg hover:bg-[var(--neon-blue)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--neon-blue)] focus:ring-offset-2 focus:ring-offset-background"
          aria-label={label}
        />
      </Slider.Root>
    </div>
  );
}
