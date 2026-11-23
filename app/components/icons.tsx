// Small line icons used in category chips and badges.
type P = { size?: number };
const base = (size: number) => ({
  width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true,
});

export const IconAll = ({ size = 18 }: P) => (
  <svg {...base(size)}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
);
export const IconPdf = ({ size = 18 }: P) => (
  <svg {...base(size)}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6M8 13h8M8 17h5" /></svg>
);
export const IconPlanner = ({ size = 18 }: P) => (
  <svg {...base(size)}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4M8 14h2M14 14h2M8 17h2" /></svg>
);
export const IconCourse = ({ size = 18 }: P) => (
  <svg {...base(size)}><rect x="3" y="5" width="18" height="13" rx="2" /><path d="M10 9.5v4l3.5-2z" /><path d="M8 21h8" /></svg>
);
export const IconSearch = ({ size = 18 }: P) => (
  <svg {...base(size)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const IconArrow = ({ size = 18, dir = "right" }: P & { dir?: "left" | "right" }) => (
  <svg {...base(size)} style={dir === "left" ? { transform: "scaleX(-1)" } : undefined}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const IconBolt = ({ size = 16 }: P) => (
  <svg {...base(size)}><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></svg>
);
export const IconShield = ({ size = 16 }: P) => (
  <svg {...base(size)}><path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z" /><path d="m9 12 2 2 4-4" /></svg>
);
export const IconHeart = ({ size = 16 }: P) => (
  <svg {...base(size)}><path d="M20.8 8.6a5 5 0 0 0-8.8-3.2 5 5 0 0 0-8.8 3.2c0 5.3 8.8 10.4 8.8 10.4s8.8-5.1 8.8-10.4z" /></svg>
);

export const kindIcon = { pdf: IconPdf, planner: IconPlanner, course: IconCourse };
