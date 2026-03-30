interface PlayerCardProps {
  name: string;
  photo: string | null;
  color: 'white' | 'black';
  isActive: boolean;
}

export default function PlayerCard({ name, photo, color, isActive }: PlayerCardProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg p-3 transition-all ${
        isActive
          ? 'bg-emerald-500/20 border border-emerald-500 shadow-lg shadow-emerald-500/10'
          : 'bg-gray-700/50 border border-gray-600'
      }`}
    >
      <div className="relative">
        {photo ? (
          <img
            src={photo}
            alt={name}
            className="w-10 h-10 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-lg font-bold">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div
          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
            color === 'white' ? 'bg-white' : 'bg-gray-900 border-gray-500'
          }`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{name}</p>
        <p className="text-xs text-gray-400">
          {color === 'white' ? 'Beyaz' : 'Siyah'}
        </p>
      </div>
      {isActive && (
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      )}
    </div>
  );
}
