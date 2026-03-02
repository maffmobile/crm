"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function NavigationProgress() {
    const pathname = usePathname();
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);
    const timer = useRef<ReturnType<typeof setInterval> | null>(null);
    const prevPathname = useRef(pathname);

    useEffect(() => {
        if (prevPathname.current !== pathname) {
            // Navigation completed - go to 100% and hide
            setProgress(100);
            const hide = setTimeout(() => {
                setVisible(false);
                setProgress(0);
            }, 300);
            prevPathname.current = pathname;
            return () => clearTimeout(hide);
        }
    }, [pathname]);

    useEffect(() => {
        // Intercept link clicks to start progress
        const handleClick = (e: MouseEvent) => {
            const anchor = (e.target as HTMLElement).closest("a");
            if (!anchor) return;
            const href = anchor.getAttribute("href");
            if (!href || href.startsWith("http") || href.startsWith("#") || href === pathname) return;

            setVisible(true);
            setProgress(15);

            let currentProgress = 15;
            timer.current = setInterval(() => {
                currentProgress += Math.random() * 12;
                if (currentProgress >= 85) {
                    currentProgress = 85;
                    if (timer.current) clearInterval(timer.current);
                }
                setProgress(currentProgress);
            }, 200);
        };

        document.addEventListener("click", handleClick);
        return () => {
            document.removeEventListener("click", handleClick);
            if (timer.current) clearInterval(timer.current);
        };
    }, [pathname]);

    if (!visible) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                zIndex: 9999,
                background: "rgba(0,0,0,0.1)",
                pointerEvents: "none",
            }}
        >
            <div
                style={{
                    height: "100%",
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #6366f1, #a855f7, #ec4899)",
                    transition: progress === 100 ? "width 0.2s ease, opacity 0.3s ease" : "width 0.3s ease",
                    boxShadow: "0 0 10px rgba(99, 102, 241, 0.8), 0 0 20px rgba(168, 85, 247, 0.4)",
                    borderRadius: "0 3px 3px 0",
                }}
            />
        </div>
    );
}
