import React from 'react';
import { ArrowLeft, User, MapPin, Globe, Camera, Clock, Target, Calendar, Eye, CreditCard, ChevronDown, X, Trash2, Edit2, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { ROUTES } from '../../../config/env';
import { userApi } from '../../user/user-service';
import toast from 'react-hot-toast';
import { updateUser } from '../../auth/store/authSlice';

interface Badge { name: string; color: string; icon: string; criteria: string; reward: string; }

const badges: Badge[] = [
  { name: 'High Achiever', color: 'bg-green-500', icon: '🍃', criteria: 'Complete 10 High-Priority tasks', reward: '+50 XP' },
  { name: 'Medium Master', color: 'bg-yellow-500', icon: '💪', criteria: 'Complete 15 Medium-Priority tasks', reward: '+50 XP' },
  { name: 'Steady Starter', color: 'bg-teal-500', icon: '🌱', criteria: 'Complete 20 Low-Priority tasks', reward: '+50 XP' },
  { name: 'Focus Builder', color: 'bg-rose-400', icon: '⭐', criteria: 'Complete a 7-day streak (1 todo + Pomodoro daily)', reward: '+50 XP' },
  { name: 'Consistency Champ', color: 'bg-red-500', icon: '❤️', criteria: 'Complete a 10-day streak (1 todo + Pomodoro daily)', reward: '+50 XP' },
  { name: 'Discipline Hero', color: 'bg-blue-500', icon: '🛡️', criteria: 'Complete a 16-day streak (1 todo + Pomodoro daily)', reward: '+50 XP' },
  { name: 'Persistence Pro', color: 'bg-orange-800', icon: '🏋️', criteria: 'Complete a 28-day streak (1 todo + Pomodoro daily)', reward: '+50 XP' },
  { name: 'Real Warrior', color: 'bg-orange-500', icon: '⚙️', criteria: 'Complete a 52-day streak (1 todo + Pomodoro daily)', reward: '+50 XP' },
  { name: 'Buddy Beginner', color: 'bg-yellow-600', icon: '🤝', criteria: 'Match with 2 buddies — min 4⭐ rating, 1 hour session each', reward: '+50 XP' },
  { name: 'Buddy Builder', color: 'bg-orange-400', icon: '☀️', criteria: 'Match with 5 buddies — min 4⭐ rating, 1 hour session each', reward: '+50 XP' },
  { name: 'Buddy Master', color: 'bg-purple-600', icon: '🌊', criteria: 'Match with 10 buddies — min 4⭐ rating, 1 hour session each', reward: '+50 XP' },
  { name: 'Room Explorer', color: 'bg-blue-600', icon: '📍', criteria: 'Attend 2 group study rooms for min 1 hour each', reward: '+50 XP' },
  { name: 'Room Regular', color: 'bg-sky-400', icon: '🏠', criteria: 'Attend 5 group study rooms for min 1 hour each', reward: '+50 XP' },
  { name: 'Room Leader', color: 'bg-pink-500', icon: '🎯', criteria: 'Attend 10 group study rooms for min 1 hour each', reward: '+50 XP' },
];

const ALL_LANGUAGES = [
  "Afrikaans", "Albanian", "Amharic", "Arabic", "Armenian", "Azerbaijani", "Basque", "Belarusian", "Bengali", "Bosnian", "Bulgarian", "Catalan", "Cebuano", "Chichewa", "Chinese", "Corsican", "Croatian", "Czech", "Danish", "Dutch", "English", "Esperanto", "Estonian", "Filipino", "Finnish", "French", "Frisian", "Galician", "Georgian", "German", "Greek", "Gujarati", "Haitian Creole", "Hausa", "Hawaiian", "Hebrew", "Hindi", "Hmong", "Hungarian", "Icelandic", "Igbo", "Indonesian", "Irish", "Italian", "Japanese", "Javanese", "Kannada", "Kazakh", "Khmer", "Kinyarwanda", "Korean", "Kurdish (Kurmanji)", "Kyrgyz", "Lao", "Latin", "Latvian", "Lithuanian", "Luxembourgish", "Macedonian", "Malagasy", "Malay", "Malayalam", "Maltese", "Maori", "Marathi", "Mongolian", "Myanmar (Burmese)", "Nepali", "Norwegian", "Odia (Oriya)", "Pashto", "Persian", "Polish", "Portuguese", "Punjabi", "Romanian", "Russian", "Samoan", "Scots Gaelic", "Serbian", "Sesotho", "Shona", "Sindhi", "Sinhala", "Slovak", "Slovenian", "Somali", "Spanish", "Sundanese", "Swahili", "Swedish", "Tajik", "Tamil", "Tatar", "Telugu", "Thai", "Turkish", "Turkmen", "Ukrainian", "Urdu", "Uyghur", "Uzbek", "Vietnamese", "Welsh", "Xhosa", "Yiddish", "Yoruba", "Zulu"
];

export const ProfilePage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [showAdvancedSettings, setShowAdvancedSettings] = React.useState(false);
  const [showBadgesModal, setShowBadgesModal] = React.useState(false);
  const [selectedBadge, setSelectedBadge] = React.useState<Badge | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);

  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = React.useState(false);
  const [languageSearch, setLanguageSearch] = React.useState('');

  const [profileForm, setProfileForm] = React.useState({
    fullName: user?.fullName || '',
    username: user?.username || (user?.email ? user.email.split('@')[0] : ''),
    country: user?.country || '',
    languages: user?.languages?.[0] || 'English',
  });

  const [isEditingAbout, setIsEditingAbout] = React.useState(false);
  const [isSavingAbout, setIsSavingAbout] = React.useState(false);
  const [aboutText, setAboutText] = React.useState(user?.bio || '');

  React.useEffect(() => {
    if (user) {
      // Always sync state when user object updates (e.g. from refresh/API)
      setProfileForm(prev => ({
        fullName: user.fullName || '',
        username: user.username || (user.email ? user.email.split('@')[0] : ''),
        country: user.country || prev.country || '',
        languages: user.languages?.[0] || 'English',
      }));
      setAboutText(user.bio || '');

      // Auto-detect location if they don't have one set yet
      if (!user.country) {
        fetch('https://ipapi.co/json/')
          .then(res => res.json())
          .then(data => {
            if (data && data.country_name) {
              setProfileForm(prev => ({ ...prev, country: data.country_name }));
            }
          })
          .catch(err => console.error('Failed to auto-detect location:', err));
      }
    }
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true);

      const payload = {
        fullName: profileForm.fullName,
        username: profileForm.username,
        country: profileForm.country,
        languages: [profileForm.languages] // Send as array per backend schema
      };

      await userApi.updateProfileService(payload);
      dispatch(updateUser(payload));
      setIsEditingProfile(false);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveAbout = async () => {
    try {
      setIsSavingAbout(true);
      await userApi.updateProfileService({ bio: aboutText });

      dispatch(updateUser({ bio: aboutText }));

      setIsEditingAbout(false);
      toast.success("About info updated successfully!");
    } catch {
      toast.error("Failed to update about info");
    } finally {
      setIsSavingAbout(false);
    }
  };

  // ⚠️ XP/level placeholder — replace when backend returns these on profile endpoint
  const currentXP = 0;
  const currentLevel = 0;
  const currentTitle = 'Early Bird';
  // const nextLevelXP = 100;
  // const progress = nextLevelXP > 0 ? Math.round((currentXP / nextLevelXP) * 100) : 0;

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size exceeds 2MB limit.");
      return;
    }

    // Validate format
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file format. Please upload JPG, PNG, or WEBP.");
      return;
    }

    try {
      setIsUploading(true);
      const secureUrl = await userApi.uploadProfileImage(file);

      // Update profile immediately with the new URL
      await userApi.updateProfileService({ profileImage: secureUrl });

      // Update Redux state so the image updates instantly in the UI
      dispatch(updateUser({ profileImage: secureUrl }));

      toast.success("Profile picture updated successfully!");

    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Failed to upload profile picture.");
    } finally {
      setIsUploading(false);
      // Reset input value so same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleImageRemove = async () => {
    try {
      setIsUploading(true);
      // Update profile immediately with an empty URL
      await userApi.updateProfileService({ profileImage: '' });

      // Update Redux state so the image updates instantly in the UI
      dispatch(updateUser({ profileImage: '' }));

      toast.success("Profile picture removed successfully!");
    } catch (error) {
      console.error("Remove failed", error);
      toast.error("Failed to remove profile picture.");
    } finally {
      setIsUploading(false);
    }
  };

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
          <div className="relative w-16 h-16 rounded-full border-2 border-zinc-700 flex items-center justify-center bg-zinc-800 overflow-hidden">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={32} className="text-zinc-500" />
            )}
          </div>
          <span className="text-green-500 text-xs font-bold mt-1">{currentTitle}</span>
        </div>
      </div>

      {/* XP Progress Bar */}
      {/* <div className="relative w-full h-4 bg-zinc-800 rounded-full overflow-hidden">
        <div className="absolute top-0 left-0 h-full bg-[#8A2BE2] transition-all duration-500" style={{ width: `${progress}%` }} />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8A2BE2]">{progress}%</span>
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Profile */}
          <section className="bg-zinc-900 rounded-2xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <User className="text-[#8A2BE2]" size={20} />
                <h2 className="text-xl font-bold text-white">Basic Profile Information</h2>
              </div>
              {isEditingProfile ? (
                <button
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#8A2BE2] hover:bg-[#7c2ae8] text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save size={16} />
                  {isSavingProfile ? 'Saving...' : 'Save'}
                </button>
              ) : (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
              )}
            </div>
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="relative flex-shrink-0 w-24 h-24">
                <div className="w-full h-full rounded-full border-2 border-zinc-700 flex items-center justify-center bg-zinc-800 overflow-hidden">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-zinc-500" />
                  )}
                </div>
                {user?.profileImage && (
                  <button
                    onClick={handleImageRemove}
                    disabled={isUploading}
                    className={`absolute bottom-0 left-0 p-1.5 rounded-full border border-zinc-700 text-white transition-colors ${isUploading ? 'bg-zinc-600 cursor-not-allowed' : 'bg-zinc-800 hover:bg-zinc-700'
                      }`}
                    title="Remove image"
                  >
                    <Trash2 size={16} className="text-red-400 hover:text-red-300" />
                  </button>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className={`absolute bottom-0 right-0 p-1.5 rounded-full border border-zinc-700 text-white transition-colors ${isUploading ? 'bg-zinc-600 cursor-not-allowed' : 'bg-zinc-800 hover:bg-zinc-700'
                    }`}
                  title={user?.profileImage ? "Change image" : "Upload image"}
                >
                  {isUploading ? <Clock size={16} className="animate-spin text-zinc-400" /> : <Camera size={16} />}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/jpeg, image/png, image/webp"
                  className="hidden"
                />
              </div>
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm text-zinc-400">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      disabled={!isEditingProfile}
                      className="w-full bg-zinc-800 border-none rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-[#8A2BE2] outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm text-zinc-400">Username</label>
                    <input
                      type="text"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                      disabled={!isEditingProfile}
                      className="w-full bg-zinc-800 border-none rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-[#8A2BE2] outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm text-zinc-400">Location (Auto-detected)</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="text"
                        value={profileForm.country}
                        disabled={true}
                        placeholder="Detecting..."
                        className="w-full bg-zinc-800 border-none rounded-lg pl-10 pr-4 py-2.5 text-zinc-400 opacity-70 cursor-not-allowed focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5 hover:cursor-pointer relative">
                    <label className="text-sm text-zinc-400">Language</label>
                    <div className="relative">
                      <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 z-10 pointer-events-none" />

                      <div
                        onClick={() => {
                          if (isEditingProfile) {
                            setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
                            setLanguageSearch('');
                          }
                        }}
                        className={`w-full bg-zinc-800 border-none rounded-lg pl-10 pr-10 py-2.5 text-white outline-none select-none ${isEditingProfile ? 'cursor-pointer focus:ring-2 focus:ring-[#8A2BE2]' : 'opacity-70 cursor-not-allowed'}`}
                        tabIndex={isEditingProfile ? 0 : -1}
                      >
                        {profileForm.languages || 'English'}
                      </div>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />

                      {isEditingProfile && isLanguageDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setIsLanguageDropdownOpen(false)} />
                          <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-white/10 rounded-xl shadow-2xl z-50 flex flex-col">
                            <div className="p-2 border-b border-white/5 relative z-50">
                              <input
                                autoFocus
                                type="text"
                                placeholder="Search language..."
                                value={languageSearch}
                                onChange={(e) => setLanguageSearch(e.target.value)}
                                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#8A2BE2]"
                              />
                            </div>
                            <div className="max-h-60 overflow-y-auto relative z-50">
                              {ALL_LANGUAGES.filter(l => l.toLowerCase().includes(languageSearch.toLowerCase())).length > 0 ? (
                                ALL_LANGUAGES.filter(l => l.toLowerCase().includes(languageSearch.toLowerCase())).map(lang => (
                                  <button
                                    key={lang}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setProfileForm({ ...profileForm, languages: lang });
                                      setIsLanguageDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${profileForm.languages === lang ? 'bg-[#8A2BE2]/20 text-[#8A2BE2] font-semibold' : 'text-zinc-300 hover:bg-zinc-700'}`}
                                  >
                                    {lang}
                                  </button>
                                ))
                              ) : (
                                <div className="px-4 py-3 text-sm text-zinc-500 text-center">No languages found</div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* About Me */}
          <section className="bg-zinc-900 rounded-2xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[#8A2BE2] text-xl font-bold">📖</span>
                <h2 className="text-xl font-bold text-white">About Me & What I'm Looking For</h2>
              </div>
              {isEditingAbout ? (
                <button
                  onClick={handleSaveAbout}
                  disabled={isSavingAbout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#8A2BE2] hover:bg-[#7c2ae8] text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save size={16} />
                  {isSavingAbout ? 'Saving...' : 'Save'}
                </button>
              ) : (
                <button
                  onClick={() => setIsEditingAbout(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-zinc-400">Short Description (Max 300 Characters)</label>
              <textarea
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                disabled={!isEditingAbout}
                className="w-full bg-zinc-800 border-none rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-[#8A2BE2] outline-none resize-none h-32 disabled:opacity-70 disabled:cursor-not-allowed"
                maxLength={300}
                placeholder="Tell others about your goals and what you're looking for in a study buddy..."
              />
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
                { label: 'Time Zone', Icon: Clock, options: ['EST', 'PST', 'IST'] },
                { label: 'Study Goal', Icon: Target, options: ['Technology', 'Academics', 'Languages', 'Test Preparation', 'Other'] },
                { label: 'Frequency', Icon: Calendar, options: ['Daily', 'Weekly', 'Weekends'] },
                { label: 'Language', Icon: Globe, options: ['Hindi', 'English', 'Spanish'] },
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
              {['Complete Your Profile To Get Better Buddy Matches', 'Add Specific Skills To Find Skill Exchange Partners', 'Set Realistic Study Goals For Better Accountability'].map((tip, i) => (
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
                { label: 'Subject/Domain', options: ['Web Development', 'App Development', 'UI/UX', 'Data Science', 'Machine Learning', 'DevOps', 'AI / ML', 'Cyber Security', 'Others'] },
                { label: 'Availability', options: ['Morning', 'Noon', 'Evening', 'Night', 'Flexible'] },
                { label: 'Study Duration', options: ['25 Min', '45 Min', '1 Hour', '2 Hours', 'Flexible'] },
                { label: 'Study Preference', options: ['Chat Only', 'Video Only', 'Flexible'] },
                { label: 'Focus Level', options: ['Casual', 'Moderate', 'High Intensity'] },
                { label: 'Group Study', options: ['Yes', 'No', 'Maybe'] },
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