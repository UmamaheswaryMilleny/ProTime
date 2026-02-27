import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
    {
        name: "Rajesh K.",
        role: "Project Manager",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces",
        text: "“Building with a team used to be chaos. ProTime streamlined our whole workflow in ways I didn't think were possible.”"
    },
    {
        name: "Emily Chen",
        role: "Graphic Designer",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=faces",
        text: "“I love the focus pomodoro! It keeps me zoned in and I feel like I get double the work done in half the time. It's magic.”"
    },
    {
        name: "Arjun S.",
        role: "Law Student",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
        text: "“The study rooms are a lifesaver. Finding a group that's actually meaningful has never been this simple. Highly recommend!”"
    }
];

export const TestimonialsSection: React.FC = () => {
    return (
        <section id="testimonials" className="py-24 bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">What Our Users Say</h2>
                    <p className="text-zinc-400">See What Users Say About Our ProTime App</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <div key={i} className="bg-white rounded-2xl p-8 relative">
                            {/* Quote decoration */}
                            <div className="flex gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} size={16} className="text-yellow-400 fill-yellow-400" />
                                ))}
                            </div>

                            <p className="text-gray-700 text-sm leading-relaxed mb-6 font-medium">
                                {t.text}
                            </p>

                            <div className="flex items-center gap-4">
                                <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                                <div>
                                    <h4 className="font-bold text-black text-sm">{t.name}</h4>
                                    <p className="text-gray-500 text-xs">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
