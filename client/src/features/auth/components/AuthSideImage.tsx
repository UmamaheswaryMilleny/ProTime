import React, { useState, useEffect } from 'react';

export interface Slide {
    image: string;
    title: string;
    desc: string;
}

const defaultSlides: Slide[] = [
    {
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2669&auto=format&fit=crop",
        title: "Manage your time,\nmaximize your productivity",
        desc: "ProTime gives you the clarity you need to focus on what matters most."
    },
    {
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop",
        title: "Collaborate seamlessly\nacross teams",
        desc: "Keep everyone aligned and moving forward with shared timelines."
    },
    {
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop",
        title: "Gain insights into\nyour workflow",
        desc: "Data-driven decisions to optimize your daily efficiency."
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
