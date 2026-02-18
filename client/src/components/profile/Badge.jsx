import React from 'react';
import * as LucideIcons from 'lucide-react';

const Badge = ({ badge, isLocked }) => {
    const Icon = LucideIcons[badge.icon] || LucideIcons.Award;

    return (
        <div className="flex flex-col items-center gap-2 group relative">
            <div className={`
        relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500
        ${isLocked
                    ? 'bg-base-200/50 border-2 border-dashed border-base-content/10'
                    : 'bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary shadow-lg scale-105'}
      `}>
                <Icon
                    className={`w-10 h-10 ${isLocked ? 'text-base-content/20' : 'text-primary'}`}
                    strokeWidth={1.5}
                />

                {/* Fill effect on hover for unlocked, or indicator for locked */}
                {!isLocked && (
                    <div className="absolute inset-0 rounded-full bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
            </div>

            <div className="text-center">
                <p className={`text-xs font-bold ${isLocked ? 'opacity-40' : 'text-base-content'}`}>
                    {badge.name}
                </p>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-base-300 rounded-lg text-[10px] shadow-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none z-10 border border-base-content/10">
                    <p className="font-bold mb-1">{badge.name}</p>
                    <p className="opacity-70">{badge.description}</p>
                    {isLocked && <p className="mt-1 text-primary font-semibold italic">Locked</p>}
                </div>
            </div>
        </div>
    );
};

export default Badge;
