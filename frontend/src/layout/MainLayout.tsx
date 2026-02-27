import type { ReactNode } from 'react';
import Navbar from '../components/Navbar';

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
    return (
        <div className="min-h-screen flex flex-col bg-primary text-text-main">
            <Navbar />
            <main className="flex-grow w-full">
                {children}
            </main>
            <footer className="bg-white/40 backdrop-blur-md py-12 border-t border-black/5">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="font-serif text-lg font-bold text-accent mb-2">DOKA Luxury Cakes</p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-text-muted/60">
                        Experience the Art of Sweetness • Crafted with Passion
                    </p>
                    <div className="mt-8 pt-8 border-t border-black/5 text-[10px] text-text-muted/40 uppercase tracking-widest">
                        © {new Date().getFullYear()} DOKA Atelier. All Rights Reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
