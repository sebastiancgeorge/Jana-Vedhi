"use client";

import { useMemo } from "react";
import Image from "next/image";
import { scaleLinear } from "d3-scale";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { GrievanceLocation } from "@/app/heatmap/actions";

interface KeralaMapProps {
  points: GrievanceLocation[];
}

// Bounding box for Kerala
const KERALA_BOUNDS = {
  minLng: 74.8,
  maxLng: 77.5,
  minLat: 8.2,
  maxLat: 12.8,
};

// Image/SVG dimensions
const MAP_WIDTH = 500;
const MAP_HEIGHT = 800;

export function KeralaMap({ points }: KeralaMapProps) {
  const xScale = useMemo(
    () => scaleLinear().domain([KERALA_BOUNDS.minLng, KERALA_BOUNDS.maxLng]).range([0, MAP_WIDTH]),
    []
  );

  const yScale = useMemo(
    () => scaleLinear().domain([KERALA_BOUNDS.minLat, KERALA_BOUNDS.maxLat]).range([MAP_HEIGHT, 0]),
    []
  );

  return (
    <div className="relative" style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}>
      <TooltipProvider>
        <Image
          src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxrZXJhbGF8ZW58MHx8fHwxNzU1OTY0NDg1fDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Map of Kerala"
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          className="absolute inset-0 w-full h-full object-cover"
          data-ai-hint="kerala map"
        />
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          className="relative z-10" // Make SVG appear on top
        >
          {points.map((point) => {
            const cx = xScale(point.location.lng);
            const cy = yScale(point.location.lat);

            // Don't render points outside the viewport
            if (cx < 0 || cx > MAP_WIDTH || cy < 0 || cy > MAP_HEIGHT) {
              return null;
            }

            return (
              <Tooltip key={point.id}>
                <TooltipTrigger asChild>
                  <circle
                    cx={cx}
                    cy={cy}
                    r="5"
                    className="fill-destructive/70 stroke-destructive transition-all hover:fill-destructive hover:r-7"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{point.title}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </svg>
      </TooltipProvider>
    </div>
  );
}
