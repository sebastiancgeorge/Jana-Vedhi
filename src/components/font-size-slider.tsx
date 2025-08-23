"use client";

import { Slider } from "@/components/ui/slider";
import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { CaseSensitive } from "lucide-react";

export function FontSizeSlider() {
  const [size, setSize] = useState(16);

  useEffect(() => {
    const storedSize = localStorage.getItem("font-size");
    if (storedSize) {
      const newSize = parseInt(storedSize, 10);
      setSize(newSize);
      document.documentElement.style.fontSize = `${newSize}px`;
    }
  }, []);

  const handleSizeChange = (value: number[]) => {
    const newSize = value[0];
    setSize(newSize);
    document.documentElement.style.fontSize = `${newSize}px`;
    localStorage.setItem("font-size", newSize.toString());
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <CaseSensitive className="h-5 w-5" />
          <span className="sr-only">Adjust font size</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="space-y-4">
          <label className="text-sm font-medium">Font Size</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Aa</span>
            <Slider
              value={[size]}
              min={12}
              max={20}
              step={1}
              onValueChange={handleSizeChange}
              className="w-full"
            />
            <span className="text-xl text-muted-foreground">Aa</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
