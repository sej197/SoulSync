import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';


export default function MoodMismatchBanner({ message, onDismiss }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (message) {
            const t = setTimeout(() => setVisible(true), 50);
            return () => clearTimeout(t);
        } else {
            setVisible(false);
        }
    }, [message]);

    if (!message) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 10000,
                transform: visible ? 'translateY(0)' : 'translateY(-100%)',
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                padding: '12px 20px',
                display: 'flex',
                justifyContent: 'center',
            }}
        >
            <div
                className="glass-banner"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px 24px',
                    maxWidth: '800px',
                    width: '100%',
                    background: 'rgba(255, 251, 235, 0.85)', 
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(245, 158, 11, 0.15)',
                    fontFamily: "'Quicksand', sans-serif",
                }}
            >
                <div
                    style={{
                        background: '#fef3c7',
                        padding: '8px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}
                >
                    <AlertTriangle size={20} style={{ color: '#d97706' }} />
                </div>

                <p
                    style={{
                        flex: 1,
                        margin: 0,
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#92400e',
                        lineHeight: 1.5,
                    }}
                >
                    {message}
                </p>

                <button
                    onClick={() => {
                        setVisible(false);
                        setTimeout(() => onDismiss && onDismiss(), 400);
                    }}
                    style={{
                        background: 'rgba(146, 64, 14, 0.08)',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#92400e',
                        transition: 'background 0.2s',
                        flexShrink: 0
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(146, 64, 14, 0.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(146, 64, 14, 0.08)'}
                    title="Dismiss"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}
