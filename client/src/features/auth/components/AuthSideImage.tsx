import React, { useState, useEffect } from 'react';

export interface Slide {
    image: string;
    title: string;
    desc: string;
}

const defaultSlides: Slide[] = [
    {
        image: "https://images.unsplash.com/photo-1588873281272-14886ba1f737?q=80&w=2670&auto=format&fit=crop",
        title: "Find your perfect\nstudy buddy",
        desc: "Match with motivated peers and crush your study goals together."
    },
    {
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2670&auto=format&fit=crop",
        title: "Collaborate in\nVirtual Study Rooms",
        desc: "Join immersive focus sessions and stay accountable with your group."
    },
    {
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2670&auto=format&fit=crop",
        title: "Meet ProBuddy,\nyour AI sidekick",
        desc: "Get instant answers and keep your productivity on track 24/7."
    }
];

interface AuthSideImageProps {
    slides?: Slide[];
}

export const AuthSideImage: React.FC<AuthSideImageProps> = ({ slides = defaultSlides }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    return (
        <div className="hidden lg:flex flex-1 relative bg-zinc-900 overflow-hidden">
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <img
                        src={slide.image}
                        alt={slide.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                </div>
            ))}

            <div className="absolute bottom-0 left-0 w-full p-12 space-y-4 z-20">
                <div className="h-32 transition-all duration-500">
                    <h3 className="text-3xl font-bold text-white relative z-10 leading-tight whitespace-pre-line mb-3">
                        {slides[currentSlide].title}
                    </h3>
                    <p className="text-zinc-300 max-w-md relative z-10 text-lg transition-opacity duration-500">
                        {slides[currentSlide].desc}
                    </p>
                </div>

                {/* Pagination Dots */}
                <div className="flex gap-2 pt-4">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/60'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
