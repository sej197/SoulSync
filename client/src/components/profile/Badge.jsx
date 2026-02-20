import React from 'react';
import * as LucideIcons from 'lucide-react';

const Badge = ({ badge, isLocked }) => {
    const Icon = LucideIcons[badge.icon] || LucideIcons.Award;

    return (
        <div className="flex flex-col items-center gap-2 group relative">
            <div className={`
        relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500
        ${isLocked
                    ? 'bg-[#F5F0EB]/50 border-2 border-dashed border-[#8D6E63]/20'
                    : 'bg-gradient-to-br from-[#FFCC80]/30 to-[#EF6C00]/20 border-2 border-[#EF6C00] shadow-lg scale-105'}
      `}>
                <Icon
                    className={`w-10 h-10 ${isLocked ? 'text-[#8D6E63]/30' : 'text-[#EF6C00]'}`}
                    strokeWidth={1.5}
                />

                {/* Fill effect on hover for unlocked, or indicator for locked */}
                {!isLocked && (
                    <div className="absolute inset-0 rounded-full bg-[#EF6C00]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
            </div>

            <div className="text-center">
                <p className={`text-xs font-bold ${isLocked ? 'text-[#8D6E63]/40' : 'text-[#3E2723]'}`}>
                    {badge.name}
                </p>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#FFF8E1] rounded-lg text-[10px] text-[#3E2723] shadow-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none z-10 border border-[#FFCC80]/40">
                    <p className="font-bold mb-1">{badge.name}</p>
                    <p className="text-[#5D4037]/70">{badge.description}</p>
                    {isLocked && <p className="mt-1 text-[#EF6C00] font-semibold italic">Locked</p>}
                </div>
            </div>
        </div>
    );
};

export default Badge;
