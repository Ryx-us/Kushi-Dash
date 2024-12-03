import * as React from "react"

export function CircularProgress({
  progress,
  size = 60,
  strokeWidth = 4
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    (<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        className="stroke-muted"
        strokeWidth={strokeWidth}
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2} />
      <circle
        className="stroke-primary transition-all duration-300 ease-in-out"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        className="fill-primary text-sm font-medium">
        {`${Math.round(progress)}%`}
      </text>
    </svg>)
  );
}

