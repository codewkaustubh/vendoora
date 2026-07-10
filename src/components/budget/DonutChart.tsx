/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface DonutChartSlice {
  name: string;
  amount: number;
  color: string;
}

interface DonutChartProps {
  id?: string;
  data: DonutChartSlice[];
  totalAmount: number;
}

export default function DonutChart({ id, data, totalAmount }: DonutChartProps) {
  const radius = 50;
  const strokeWidth = 15;
  const circumference = 2 * Math.PI * radius;
  
  let currentOffset = 0;

  // Filter out zero amount slices
  const validSlices = data.filter(slice => slice.amount > 0);

  return (
    <div id={id} className="flex flex-col items-center justify-center p-4">
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* SVG Circle Stack */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            stroke="rgba(0,0,0,0.05)"
            strokeWidth={strokeWidth}
          />
          {validSlices.map((slice, index) => {
            const percentage = slice.amount / (totalAmount || 1);
            const strokeLength = percentage * circumference;
            const strokeOffset = circumference - currentOffset;
            
            // Advance cumulative offset
            currentOffset += strokeLength;

            return (
              <circle
                key={index}
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
                strokeDashoffset={strokeOffset}
                strokeLinecap="butt"
                className="transition-all duration-500 ease-out hover:stroke-[18px]"
                style={{ transformOrigin: '50% 50%' }}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute flex flex-col items-center text-center">
          <span className="text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">
            Estimated Cost
          </span>
          <span className="text-zinc-800 dark:text-zinc-100 text-lg font-bold font-mono">
            ₹{(totalAmount / 1000).toFixed(1)}k
          </span>
        </div>
      </div>

      {/* Custom Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-6 w-full max-w-sm text-xs">
        {validSlices.map((slice, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
            <span className="text-zinc-600 dark:text-zinc-400 truncate flex-1">{slice.name}</span>
            <span className="text-zinc-800 dark:text-zinc-200 font-mono font-medium">
              ₹{(slice.amount / 1000).toFixed(0)}k
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
