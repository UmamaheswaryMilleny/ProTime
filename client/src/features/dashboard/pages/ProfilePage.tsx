import React from 'react';
import { ArrowLeft, User, MapPin, Globe, Camera, Clock, Target, Calendar, Eye, CreditCard, ChevronDown, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../../store/hooks';
import { ROUTES } from '../../../config/env';

interface Badge { name: string; color: string; icon: string; criteria: string; reward: string; }

const badges: Badge[] = [
  { name: 'High Achiever',     color: 'bg-green-500',   icon: '🍃', criteria: 'Complete 10 High-Priority tasks',                                         reward: '+50 XP' },
  { name: 'Medium Master',     color: 'bg-yellow-500',  icon: '💪', criteria: 'Complete 15 Medium-Priority tasks',                                        reward: '+50 XP' },
  { name: 'Steady Starter',    color: 'bg-teal-500',    icon: '🌱', criteria: 'Complete 20 Low-Priority tasks',                                           reward: '+50 XP' },
  { name: 'Focus Builder',     color: 'bg-rose-400',    icon: '⭐', criteria: 'Complete a 7-day streak (1 todo + Pomodoro daily)',                        reward: '+50 XP' },
  { name: 'Consistency Champ', color: 'bg-red-500',     icon: '❤️', criteria: 'Complete a 10-day streak (1 todo + Pomodoro daily)',                       reward: '+50 XP' },
  { name: 'Discipline Hero',   color: 'bg-blue-500',    icon: '🛡️', criteria: 'Complete a 16-day streak (1 todo + Pomodoro daily)',                       reward: '+50 XP' },
  { name: 'Persistence Pro',   color: 'bg-orange-800',  icon: '🏋️', criteria: 'Complete a 28-day streak (1 todo + Pomodoro daily)',                       reward: '+50 XP' },
  { name: 'Real Warrior',      color: 'bg-orange-500',  icon: '⚙️', criteria: 'Complete a 52-day streak (1 todo + Pomodoro daily)',                       reward: '+50 XP' },
  { name: 'Buddy Beginner',    color: 'bg-yellow-600',  icon: '🤝', criteria: 'Match with 2 buddies — min 4⭐ rating, 1 hour session each',               reward: '+50 XP' },
  { name: 'Buddy Builder',     color: 'bg-orange-400',  icon: '☀️', criteria: 'Match with 5 buddies — min 4⭐ rating, 1 hour session each',               reward: '+50 XP' },
  { name: 'Buddy Master',      color: 'bg-purple-600',  icon: '🌊', criteria: 'Match with 10 buddies — min 4⭐ rating, 1 hour session each',              reward: '+50 XP' },
  { name: 'Room Explorer',     color: 'bg-blue-600',    icon: '📍', criteria: 'Attend 2 group study rooms for min 1 hour each',                           reward: '+50 XP' },
  { name: 'Room Regular',      color: 'bg-sky-400',     icon: '🏠', criteria: 'Attend 5 group study rooms for min 1 hour each',                           reward: '+50 XP' },
  { name: 'Room Leader',       color: 'bg-pink-500',    icon: '🎯', criteria: 'Attend 10 group study rooms for min 1 hour each',                          reward: '+50 XP' },
];

export const ProfilePage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [showAdvancedSettings, setShowAdvancedSettings] = React.useState(false);
  const [showBadgesModal, setShowBadgesModal] = React.useState(false);
  const [selectedBadge, setSelectedBadge] = React.useState<Badge | null>(null);

  // ⚠️ XP/level placeholder — replace when backend returns these on profile endpoint
  const currentXP = 0;
  const currentLevel = 0;
  const currentTitle = 'Early Bird';
  const nextLevelXP = 100;
  const progress = nextLevelXP > 0 ? Math.round((currentXP / nextLevelXP) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-4 max-w-2xl">
          <Link to={ROUTES.DASHBOARD} className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft size={16} /><span>Back</span>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
            <p className="text-zinc-300 text-lg font-medium">Let's Set Up Your Profile So We Can Match You With The Best Buddies.</p>
            <p className="text-zinc-400 text-sm">This Helps Others Understand Your Goals And Helps Us Recommend Better Matches And Features.</p>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="relative">
            <img src={user?.profileImage || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop'} alt="Profile" className="w-16 h-16 rounded-full border-2 border-zinc-700" />
          </div>
          <span className="text-green-500 text-xs font-bold mt-1">{currentTitle}</span>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="relative w-full h-4 bg-zinc-800 rounded-full overflow-hidden">
        <div className="absolute top-0 left-0 h-full bg-[#8A2BE2] transition-all duration-500" style={{ width: `${progress}%` }} />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8A2BE2]">{progress}%</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Profile */}
          <section className="bg-zinc-900 rounded-2xl p-6 border border-white/5">
            <div className="flex items-center gap-2 mb-6">
              <User className="text-[#8A2BE2]" size={20} />
              <h2 className="text-xl font-bold text-white">Basic Profile Information</h2>
            </div>
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="relative flex-shrink-0">
                <img src={user?.profileImage || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop'} alt="Profile" className="w-24 h-24 rounded-full border-2 border-zinc-700 object-cover" />
                <button className="absolute bottom-0 right-0 p-1.5 bg-zinc-800 rounded-full border border-zinc-700 text-white hover:bg-zinc-700 transition-colors"><Camera size={16} /></button>
              </div>
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm text-zinc-400">Full Name</label>
                    <input type="text" defaultValue={user?.fullName || ''} className="w-full bg-zinc-800 border-none rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-[#8A2BE2] outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm text-zinc-400">Username</label>
                    <input type="text" className="w-full bg-zinc-800 border-none rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-[#8A2BE2] outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm text-zinc-400">Location</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input type="text" className="w-full bg-zinc-800 border-none rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-[#8A2BE2] outline-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm text-zinc-400">Languages</label>
                    <div className="relative">
                      <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <select className="w-full bg-zinc-800 border-none rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-[#8A2BE2] outline-none appearance-none cursor-pointer">
                        <option>English</option><option>Hindi</option><option>Spanish</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* About Me */}
          <section className="bg-zinc-900 rounded-2xl p-6 border border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#8A2BE2] text-xl font-bold">📖</span>
              <h2 className="text-xl font-bold text-white">About Me & What I'm Looking For</h2>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-zinc-400">Short Description (Max 300 Characters)</label>
              <textarea className="w-full bg-zinc-800 border-none rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-[#8A2BE2] outline-none resize-none h-32" maxLength={300} placeholder="Tell others about your goals and what you're looking for in a study buddy..." />
            </div>
          </section>

          {/* Study Preferences */}
          <section className="bg-zinc-900 rounded-2xl p-6 border border-white/5">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[#8A2BE2] text-xl font-bold">⚡</span>
              <h2 className="text-xl font-bold text-white">Learning & Study Preferences</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                { label: 'Time Zone', Icon: Clock, options: ['EST','PST','IST'] },
                { label: 'Study Goal', Icon: Target, options: ['Technology','Academics','Languages','Test Preparation','Other'] },
                { label: 'Frequency', Icon: Calendar, options: ['Daily','Weekly','Weekends'] },
                { label: 'Language', Icon: Globe, options: ['Hindi','English','Spanish'] },
              ].map(({ label, Icon, options }) => (
                <div key={label} className="space-y-1.5">
                  <label className="text-sm text-zinc-400">{label}</label>
                  <div className="relative">
                    <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <select className="w-full bg-zinc-800 border-none rounded-lg pl-10 pr-10 py-2.5 text-white focus:ring-2 focus:ring-[#8A2BE2] outline-none appearance-none cursor-pointer">
                      {options.map(o => <option key={o}>{o}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowAdvancedSettings(true)} className="hover:opacity-80 transition-opacity text-left">
              <span className="text-[#FFD700] text-sm font-bold">Advanced Settings</span>
              <span className="text-zinc-500 text-xs ml-2">(Not Available For Free Users)</span>
            </button>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Profile Status */}
          <section className="bg-zinc-900 rounded-2xl p-6 border border-white/5 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-[#FFD700] text-xl">🎖️</span>
              <h2 className="text-lg font-bold text-white">Profile Status</h2>
            </div>
            <div className="flex flex-col items-center mb-6">
              <div className="text-6xl font-bold text-[#8A2BE2] mb-2 flex items-baseline gap-1">
                {currentXP}<span className="text-zinc-500 text-lg font-normal">XP</span>
              </div>
              <div className="text-green-500 font-bold mb-1">{currentTitle} <span className="text-zinc-500 font-normal">(Level {currentLevel})</span></div>
              <p className="text-zinc-400 text-sm">Earned Badges (0)</p>
            </div>
            <Link to={ROUTES.DASHBOARD_SUBSCRIPTION} className="block w-full bg-[#5b2091] hover:bg-[#8A2BE2] text-white font-medium py-3 rounded-full transition-all shadow-lg shadow-[#8A2BE2]/20 text-sm mb-4">
              Subscribe To Premium
            </Link>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setShowBadgesModal(true)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium py-2 rounded-full transition-colors border border-white/5">View All Badges</button>
              <Link to={ROUTES.DASHBOARD_LEVELS} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium py-2 rounded-full transition-colors border border-white/5 flex items-center justify-center">View All Levels</Link>
            </div>
          </section>

          {/* Quick Tips */}
          <section className="bg-zinc-900 rounded-2xl p-6 border border-white/5">
            <h2 className="text-lg font-bold text-white mb-4">Quick Tips</h2>
            <ul className="space-y-4">
              {['Complete Your Profile To Get Better Buddy Matches','Add Specific Skills To Find Skill Exchange Partners','Set Realistic Study Goals For Better Accountability'].map((tip, i) => (
                <li key={i} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#8A2BE2] mt-2 flex-shrink-0" />
                  <p className="text-zinc-400 text-sm">{tip}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Actions */}
          <div className="space-y-3">
            <button className="w-full bg-[#8A2BE2] hover:bg-[#7c2ae8] text-white font-medium py-3 rounded-full transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#8A2BE2]/20">
              <Eye size={16} />Preview My Public Profile
            </button>
            <Link to={ROUTES.DASHBOARD_SUBSCRIPTION} className="w-full bg-[#5b2091] hover:bg-[#8A2BE2] text-white font-medium py-3 rounded-full transition-all flex items-center justify-center gap-2 text-sm">
              <CreditCard size={16} />Subscription Details
            </Link>
          </div>
        </div>
      </div>

      {/* Advanced Settings Modal */}
      {showAdvancedSettings && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-3xl w-full max-w-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Advanced Settings</h2>
              <button onClick={() => setShowAdvancedSettings(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Subject/Domain', options: ['Web Development','App Development','UI/UX','Data Science','Machine Learning','DevOps','AI / ML','Cyber Security','Others'] },
                { label: 'Availability', options: ['Morning','Noon','Evening','Night','Flexible'] },
                { label: 'Study Duration', options: ['25 Min','45 Min','1 Hour','2 Hours','Flexible'] },
                { label: 'Study Preference', options: ['Chat Only','Video Only','Flexible'] },
                { label: 'Focus Level', options: ['Casual','Moderate','High Intensity'] },
                { label: 'Group Study', options: ['Yes','No','Maybe'] },
              ].map(({ label, options }) => (
                <div key={label} className="space-y-1.5">
                  <label className="text-sm text-zinc-400">{label}</label>
                  <div className="relative">
                    <select className="w-full bg-zinc-800 border-none rounded-lg pl-4 pr-10 py-2.5 text-white focus:ring-2 focus:ring-[#8A2BE2] outline-none appearance-none cursor-pointer">
                      {options.map(o => <option key={o}>{o}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Badges Modal */}
      {showBadgesModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-3xl w-full max-w-2xl border border-white/10 overflow-hidden shadow-2xl relative">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">All Badges</h2>
              <button onClick={() => { setShowBadgesModal(false); setSelectedBadge(null); }} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges.map((badge, index) => (
                  <button key={index} onClick={() => setSelectedBadge(badge)} className={`${badge.color} p-3 rounded-xl flex items-center gap-2 shadow-lg hover:scale-105 transition-transform text-left w-full`}>
                    <span className="text-lg">{badge.icon}</span>
                    <span className="text-xs font-bold text-white leading-tight">{badge.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          {selectedBadge && (
            <div className="absolute inset-0 flex items-center justify-center z-[60] bg-black/40 backdrop-blur-sm">
              <div className={`relative ${selectedBadge.color} rounded-2xl p-6 w-80 shadow-2xl`}>
                <button onClick={(e) => { e.stopPropagation(); setSelectedBadge(null); }} className="absolute top-2 right-2 p-1 bg-black/20 rounded-full hover:bg-black/40 text-white transition-colors"><X size={16} /></button>
                <div className="text-center mb-6">
                  <div className="text-4xl mb-2">{selectedBadge.icon}</div>
                  <h3 className="text-xl font-bold text-white">Badge Details</h3>
                </div>
                <div className="space-y-4 text-white">
                  <div className="flex justify-between items-start border-b border-white/20 pb-2">
                    <span className="text-xs font-medium opacity-90">Badge Name</span>
                    <span className="text-sm font-bold text-right">{selectedBadge.name}</span>
                  </div>
                  <div className="flex justify-between items-start border-b border-white/20 pb-2">
                    <span className="text-xs font-medium opacity-90">Criteria</span>
                    <span className="text-sm font-bold text-right max-w-[60%]">{selectedBadge.criteria}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium opacity-90">Reward</span>
                    <span className="text-sm font-bold">{selectedBadge.reward}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};