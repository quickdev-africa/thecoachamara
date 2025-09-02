export default function Tooltip({ children, tip }: { children: React.ReactNode; tip: string }) {
  return (
    <span className="relative inline-block">
      {children}
      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:inline-block bg-gray-800 text-white text-xs px-2 py-1 rounded">
        {tip}
      </span>
    </span>
  );
}
