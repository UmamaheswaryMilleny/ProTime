import React from 'react';
import { ArrowLeft, User, MapPin, Globe, Camera, Clock, Eye, CreditCard, ChevronDown, X, Trash2, Edit2, Save, Library, Zap, Target } from 'lucide-react';
import { ALL_COUNTRIES, ALL_LANGUAGES } from '../../../shared/constants/locations';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { ROUTES, API_ROUTES } from '../../../shared/constants/constants.routes';
import { userApi } from '../../user/user-service';
import toast from 'react-hot-toast';
import { updateUser } from '../../auth/store/authSlice';
import { fetchPreferences, savePreferences } from '../../buddy-match/store/buddySlice';
import { BuddyPreferenceForm } from '../../buddy-match/components/BuddyPreferenceForm';
import { useGamification } from '../../gamification/hooks/useGamification';

interface Badge {
  key: string;
  name: string;
  description: string;
  iconUrl: string | null;
  xpReward: number;
  premiumRequired: boolean;
  category: string;
}

const getBadgeColor = (category: string) => {
  switch (category?.toUpperCase()) {
    case 'TASK':
      return 'bg-emerald-600';
    case 'STREAK':
      return 'bg-rose-600';
    case 'BUDDY':
      return 'bg-indigo-600';
    case 'ROOM':
      return 'bg-violet-600';
    default:
      return 'bg-zinc-700';
  }
};

const getBadgeFallbackIcon = (category: string) => {
  switch (category?.toUpperCase()) {
    case 'TASK':
      return '🎯';
    case 'STREAK':
      return '🔥';
    case 'BUDDY':
      return '🤝';
    case 'ROOM':
      return '🏠';
    default:
      return '🏆';
  }
};

// ─── Module-level guard ─────────────────────────────────────────────────────
// Persists across remounts so the IP lookup fires at most once per session
let detectionAttempted = false;

export const ProfilePage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { gamification } = useGamification();
  const { preferences, loading } = useAppSelector((state) => state.buddy);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [showBadgesModal, setShowBadgesModal] = React.useState(false);
  const [selectedBadge, setSelectedBadge] = React.useState<Badge | null>(null);

  React.useEffect(() => {
    if (location.state?.openBadges) {
      setShowBadgesModal(true);
    }
  }, [location]);
  const [showPreviewModal, setShowPreviewModal] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);


  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = React.useState(false);
  const [languageSearch, setLanguageSearch] = React.useState('');

  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = React.useState(false);
  const [countrySearch, setCountrySearch] = React.useState('');

  const [profileForm, setProfileForm] = React.useState({
    fullName: user?.fullName || '',
    username: user?.username || (user?.email ? user.email.split('@')[0] : ''),
    country: user?.country || '',
    languages: user?.languages?.[0] || 'English',
  });

  const [activeSkills, setActiveSkills] = React.useState<any[]>([]);
  const [selectedSkills, setSelectedSkills] = React.useState<any[]>([]);
  const [skillSearch, setSkillSearch] = React.useState('');
  const [isSkillDropdownOpen, setIsSkillDropdownOpen] = React.useState(false);

  const [isEditingAbout, setIsEditingAbout] = React.useState(false);
  const [isSavingAbout, setIsSavingAbout] = React.useState(false);
  const [aboutText, setAboutText] = React.useState(user?.bio || '');

  React.useEffect(() => {
    dispatch(fetchPreferences());

    // Fetch active skills catalog
    userApi.getActiveSkillsService()
      .then(res => {
        setActiveSkills(res || []);
      })
      .catch(err => {
        console.error("Failed to fetch active skills", err);
      });

    // Refresh profile from server to get latest averageRating and ratingCount
    // (ratings are computed dynamically from buddy connections on the backend)
    userApi.getProfileService()
      .then(freshProfile => {
        dispatch(updateUser({
          averageRating: freshProfile.averageRating,
          ratingCount: freshProfile.ratingCount,
        }));
      })
      .catch(err => {
        console.error("Failed to refresh profile rating stats", err);
      });
  }, [dispatch]);

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
      setSelectedSkills(user.skills || []);

      // Auto-detect location if they don't have one saved yet
      if (!user.country && !detectionAttempted) {
        detectionAttempted = true;

        import('../../../api/instance').then(({ ProTimeBackend }) => {
          ProTimeBackend.get(API_ROUTES.UTILITY_LOCATION)
            .then(res => {
              const data = res.data?.data;
              if (data && data.country) {
                setProfileForm(prev => ({ ...prev, country: data.country }));
              }
            })
            .catch(() => {
              // Silently fail — country field stays empty
            });
        });
      }
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!profileForm.fullName.trim()) {
      toast.error("Full Name cannot be empty.");
      return;
    }
    if (!profileForm.username.trim()) {
      toast.error("Username cannot be empty.");
      return;
    }
    try {
      setIsSavingProfile(true);

      const payload = {
        fullName: profileForm.fullName,
        username: profileForm.username,
        country: profileForm.country,
        languages: [profileForm.languages], // Send as array per backend schema
        skills: selectedSkills.map(s => s._id || s) // Send as array of IDs/strings
      };

      const updatedProfileDTO = await userApi.updateProfileService(payload);
      dispatch(updateUser(updatedProfileDTO));
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

  // Dynamic XP/level values from user's gamification data
  const currentXP = gamification?.totalXp ?? 0;
  const currentLevel = gamification?.currentLevel ?? 1;
  const currentTitle = gamification?.currentTitle ?? 'Early Bird';
  const progress = gamification?.xpProgress ?? 0;

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

  const handleSaveBuddyPreferences = async (data: any) => {
    try {
      await dispatch(savePreferences(data)).unwrap();
      toast.success("Buddy preferences saved successfully!");
    } catch (err) {
      // toast.error handled by effect or handled by unwrap if necessary
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
              <img
                src={user.profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }}
              />
            ) : null}
            <User size={32} className={`text-zinc-500 ${user?.profileImage ? 'hidden' : ''}`} />
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <User className="text-[#8A2BE2]" size={20} />
                <h2 className="text-xl font-bold text-white">Basic Profile Information</h2>
              </div>
              {isEditingProfile ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditingProfile(false);
                      if (user) {
                        setProfileForm({
                          fullName: user.fullName || '',
                          username: user.username || (user.email ? user.email.split('@')[0] : ''),
                          country: user.country || '',
                          languages: user.languages?.[0] || 'English',
                        });
                        setSelectedSkills(user.skills || []);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#8A2BE2] hover:bg-[#7c2ae8] text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Save size={16} />
                    {isSavingProfile ? 'Saving...' : 'Save'}
                  </button>
                </div>
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
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }}
                    />
                  ) : null}
                  <User size={48} className={`text-zinc-500 ${user?.profileImage ? 'hidden' : ''}`} />
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
                  <div className="space-y-1.5 hover:cursor-pointer relative">
                    <label className="text-sm text-zinc-400">Location</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 z-10 pointer-events-none" />
                      <div
                        onClick={() => {
                          if (isEditingProfile) {
                            setIsCountryDropdownOpen(!isCountryDropdownOpen);
                            setCountrySearch('');
                          }
                        }}
                        className={`w-full bg-zinc-800 border-none rounded-lg pl-10 pr-10 py-2.5 text-white outline-none select-none ${isEditingProfile ? 'cursor-pointer focus:ring-2 focus:ring-[#8A2BE2]' : 'opacity-70 cursor-not-allowed'}`}
                        tabIndex={isEditingProfile ? 0 : -1}
                      >
                        {profileForm.country || 'Select Country...'}
                      </div>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />

                      {isEditingProfile && isCountryDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setIsCountryDropdownOpen(false)} />
                          <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-white/10 rounded-xl shadow-2xl z-50 flex flex-col">
                            <div className="p-2 border-b border-white/5 relative z-50">
                              <input
                                autoFocus
                                type="text"
                                placeholder="Search country..."
                                value={countrySearch}
                                onChange={(e) => setCountrySearch(e.target.value)}
                                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#8A2BE2]"
                              />
                            </div>
                            <div className="max-h-60 overflow-y-auto relative z-50">
                              {ALL_COUNTRIES.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase())).length > 0 ? (
                                ALL_COUNTRIES.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase())).map(country => (
                                  <button
                                    key={country}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setProfileForm({ ...profileForm, country });
                                      setIsCountryDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${profileForm.country === country ? 'bg-[#8A2BE2]/20 text-[#8A2BE2] font-semibold' : 'text-zinc-300 hover:bg-zinc-700'}`}
                                  >
                                    {country}
                                  </button>
                                ))
                              ) : (
                                <div className="px-4 py-3 text-sm text-zinc-500 text-center">No countries found</div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
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

                {/* Skills Autocomplete / Tag Input */}
                <div className="space-y-1.5 mt-4 relative">
                  <label className="text-sm text-zinc-400 font-medium">My Skills & Expertise</label>

                  {/* Selected Tags Display */}
                  <div className="flex flex-wrap gap-2 p-3 bg-zinc-800 rounded-xl min-h-[46px] border border-white/5">
                    {selectedSkills.length > 0 ? (
                      selectedSkills.map((skill) => {
                        const name = typeof skill === 'string' ? skill : (skill.name || '');
                        const id = typeof skill === 'string' ? skill : (skill._id || '');
                        return (
                          <div
                            key={id}
                            className="flex items-center gap-1 px-3 py-1 bg-[#8A2BE2]/10 border border-[#8A2BE2]/20 hover:border-[#8A2BE2]/40 rounded-full text-white text-xs font-medium transition-all group"
                          >
                            <span>{name}</span>
                            {isEditingProfile && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setSelectedSkills(selectedSkills.filter(s => (s._id || s) !== id));
                                }}
                                className="text-zinc-400 hover:text-white transition-colors"
                              >
                                <X size={12} className="stroke-[2.5]" />
                              </button>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-zinc-500 text-xs my-auto">No skills added yet. Click edit to customize your expertise.</span>
                    )}
                  </div>

                  {/* Autocomplete Input Search and Dropdown when in Edit Mode */}
                  {isEditingProfile && (
                    <div className="relative mt-2">
                      <input
                        type="text"
                        placeholder="Search & add skills (e.g. React, Python, C++)..."
                        value={skillSearch}
                        onChange={(e) => {
                          setSkillSearch(e.target.value);
                          setIsSkillDropdownOpen(true);
                        }}
                        onFocus={() => setIsSkillDropdownOpen(true)}
                        className="w-full bg-zinc-800/60 border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] outline-none"
                      />

                      {isSkillDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setIsSkillDropdownOpen(false)} />
                          <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-white/10 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                            {activeSkills.filter(s => {
                              const skillName = s.name || '';
                              const alreadySelected = selectedSkills.some(sel => (sel._id || sel) === s._id);
                              return skillName.toLowerCase().includes(skillSearch.toLowerCase()) && !alreadySelected;
                            }).length > 0 ? (
                              activeSkills
                                .filter(s => {
                                  const skillName = s.name || '';
                                  const alreadySelected = selectedSkills.some(sel => (sel._id || sel) === s._id);
                                  return skillName.toLowerCase().includes(skillSearch.toLowerCase()) && !alreadySelected;
                                })
                                .map((skill) => (
                                  <button
                                    key={skill._id}
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setSelectedSkills([...selectedSkills, skill]);
                                      setSkillSearch('');
                                      setIsSkillDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors flex justify-between items-center"
                                  >
                                    <span className="font-medium text-white">{skill.name}</span>
                                    <span className="text-xs bg-zinc-900 px-2 py-0.5 rounded text-zinc-400">{skill.category}</span>
                                  </button>
                                ))
                            ) : (
                              <div className="px-4 py-3 text-sm text-zinc-500 text-center">No matching new skills found</div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* About Me */}
          <section className="bg-zinc-900 rounded-2xl p-6 border border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[#8A2BE2] text-xl font-bold">📖</span>
                <h2 className="text-xl font-bold text-white">About Me & What I'm Looking For</h2>
              </div>
              {isEditingAbout ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditingAbout(false);
                      setAboutText(user?.bio || '');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAbout}
                    disabled={isSavingAbout}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#8A2BE2] hover:bg-[#7c2ae8] text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Save size={16} />
                    {isSavingAbout ? 'Saving...' : 'Save'}
                  </button>
                </div>
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
              <p className="text-zinc-400 text-sm">Earned Badges ({gamification?.totalBadgeCount ?? 0})</p>
            </div>
            <Link to={ROUTES.DASHBOARD_SUBSCRIPTION} className="block w-full bg-[#5b2091] hover:bg-[#8A2BE2] text-white font-medium py-3 rounded-full transition-all shadow-lg shadow-[#8A2BE2]/20 text-sm mb-4">
              {user?.isPremium ? 'Subscribed To Premium' : 'Subscribe To Premium'}
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
            <button
              onClick={() => setShowPreviewModal(true)}
              className="w-full bg-[#8A2BE2] hover:bg-[#7c2ae8] text-white font-medium py-3 rounded-full transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#8A2BE2]/20"
            >
              <Eye size={16} />Preview My Public Profile
            </button>
            <Link to={ROUTES.DASHBOARD_SUBSCRIPTION} className="w-full bg-[#5b2091] hover:bg-[#8A2BE2] text-white font-medium py-3 rounded-full transition-all flex items-center justify-center gap-2 text-sm">
              <CreditCard size={16} />Subscription Details
            </Link>
          </div>
        </div>
      </div>


      {/* Badges Modal */}
      {showBadgesModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-3xl w-full max-w-2xl max-h-[85vh] border border-white/10 overflow-hidden shadow-2xl relative flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
              <h2 className="text-xl font-bold text-white">All Badges</h2>
              <button onClick={() => { setShowBadgesModal(false); setSelectedBadge(null); }} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(gamification?.activeBadges || []).map((badge, index) => {
                  const isEarned = gamification?.earnedBadges.some(b => b.badgeKey === badge.key);
                  const badgeColor = getBadgeColor(badge.category);
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedBadge(badge)}
                      className={`p-3 rounded-xl flex items-center gap-2 shadow-lg hover:scale-105 transition-transform text-left w-full ${isEarned
                          ? `${badgeColor} text-white`
                          : 'bg-zinc-800/40 text-zinc-500 border border-zinc-700/50 hover:bg-zinc-800/60'
                        }`}
                    >
                      {badge.iconUrl ? (
                        <img 
                          src={badge.iconUrl} 
                          alt={badge.name} 
                          className={`w-6 h-6 object-contain ${isEarned ? '' : 'grayscale opacity-50'}`} 
                        />
                      ) : (
                        <span className={`text-lg ${isEarned ? '' : 'grayscale opacity-50'}`}>
                          {getBadgeFallbackIcon(badge.category)}
                        </span>
                      )}
                      <div className="flex flex-col">
                        <span className={`text-xs font-bold leading-tight ${isEarned ? 'text-white' : 'text-zinc-400'}`}>
                          {badge.name}
                        </span>
                        <span className="text-[9px] opacity-75">
                          {isEarned ? 'Earned' : 'Locked'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          {selectedBadge && (() => {
            const isEarned = gamification?.earnedBadges.some(b => b.badgeKey === selectedBadge.key);
            const badgeColor = getBadgeColor(selectedBadge.category);
            return (
              <div className="absolute inset-0 flex items-center justify-center z-[60] bg-black/40 backdrop-blur-sm">
                <div className={`relative rounded-2xl p-6 w-80 shadow-2xl ${isEarned ? `${badgeColor} text-white` : 'bg-zinc-800 border border-zinc-700/80 text-zinc-300'
                  }`}>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedBadge(null); }} className="absolute top-2 right-2 p-1 bg-black/20 rounded-full hover:bg-black/40 text-white transition-colors"><X size={16} /></button>
                  <div className="text-center mb-6">
                    <div className="flex justify-center mb-2">
                      {selectedBadge.iconUrl ? (
                        <img 
                          src={selectedBadge.iconUrl} 
                          alt={selectedBadge.name} 
                          className={`w-12 h-12 object-contain ${isEarned ? '' : 'grayscale opacity-50'}`} 
                        />
                      ) : (
                        <div className={`text-4xl ${isEarned ? '' : 'grayscale opacity-50'}`}>
                          {getBadgeFallbackIcon(selectedBadge.category)}
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white">Badge Details</h3>
                  </div>
                  <div className="space-y-4">
                    <div className={`flex justify-between items-start border-b pb-2 ${isEarned ? 'border-white/20' : 'border-zinc-700'}`}>
                      <span className="text-xs font-medium opacity-90">Badge Name</span>
                      <span className="text-sm font-bold text-right text-white">{selectedBadge.name}</span>
                    </div>
                    <div className={`flex justify-between items-start border-b pb-2 ${isEarned ? 'border-white/20' : 'border-zinc-700'}`}>
                      <span className="text-xs font-medium opacity-90">Criteria</span>
                      <span className="text-sm font-bold text-right max-w-[60%] text-white">{selectedBadge.description}</span>
                    </div>
                    <div className={`flex justify-between items-start border-b pb-2 ${isEarned ? 'border-white/20' : 'border-zinc-700'}`}>
                      <span className="text-xs font-medium opacity-90">Status</span>
                      <span className="text-sm font-bold text-right text-white">
                        {isEarned ? '🏆 Earned' : '🔒 Locked'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium opacity-90">Reward</span>
                      <span className="text-sm font-bold text-white">+{selectedBadge.xpReward} XP</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Buddy Preferences Section */}
      <section className="bg-zinc-900 rounded-3xl p-8 border border-white/5 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[blueviolet]/10 flex items-center justify-center">
            <Library className="text-[blueviolet]" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Learning & Study Preferences</h2>
            <p className="text-zinc-500 text-sm">Fine-tune your study goals to find the perfect study partner.</p>
          </div>
        </div>

        <BuddyPreferenceForm
          initialData={preferences}
          isPremium={user?.isPremium || false}
          onSave={handleSaveBuddyPreferences}
          isSaving={loading.preferences}
        />
      </section>

      {/* Preview My Public Profile Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowPreviewModal(false)} />
          <div className="bg-zinc-900 border border-white/5 rounded-[32px] w-full max-w-md overflow-hidden relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            {/* Header Cover banner */}
            <div className="h-28 bg-gradient-to-br from-[blueviolet] to-[#4b0082] relative">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all backdrop-blur-md flex items-center justify-center border border-white/10"
              >
                <X size={16} />
              </button>
            </div>

            {/* Profile Info */}
            <div className="px-6 pb-8 -mt-12 relative text-center sm:text-left">
              <div className="relative inline-block mb-4">
                <img
                  src={user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || '')}&background=8A2BE2&color=fff`}
                  alt={user?.fullName || 'User'}
                  className="w-24 h-24 rounded-full border-4 border-zinc-900 object-cover shadow-2xl"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || '')}&background=8A2BE2&color=fff`;
                  }}
                />
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-zinc-900 rounded-full" />
              </div>

              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                  <h2 className="text-xl font-bold text-white tracking-tight">{user?.fullName}</h2>
                  <span className="inline-block self-center sm:self-auto bg-[blueviolet]/10 text-[blueviolet] text-[9px] font-bold px-2 py-0.5 rounded-lg border border-[blueviolet]/20">YOU</span>
                </div>
                <p className="text-zinc-500 text-sm font-medium">@{user?.username || (user?.email ? user.email.split('@')[0] : '')}</p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 mt-2 text-zinc-400 text-sm">
                  {user?.country && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-[blueviolet]" /> {user.country}
                    </span>
                  )}
                  <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                    ⭐ {user?.averageRating !== undefined && user?.averageRating !== null ? user.averageRating.toFixed(1) : '0.0'} ({user?.ratingCount || 0})
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-8 text-left">
                <div>
                  <h4 className="text-white font-bold text-xs mb-2 flex items-center gap-2">
                    <Zap size={14} className="text-yellow-500" /> About Me
                  </h4>
                  <p className="text-zinc-400 text-[13px] leading-relaxed bg-black/40 p-4 rounded-xl border border-white/5 italic">
                    "{user?.bio || "Tell others about your goals and what you're looking for in a study buddy..."}"
                  </p>
                </div>

                {selectedSkills && selectedSkills.length > 0 && (
                  <div>
                    <h4 className="text-white font-bold text-xs mb-2">Skills & Expertise</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSkills.map((skill) => {
                        const name = typeof skill === 'string' ? skill : (skill.name || '');
                        const id = typeof skill === 'string' ? skill : (skill._id || '');
                        return (
                          <span
                            key={id}
                            className="bg-[#8A2BE2]/10 border border-[#8A2BE2]/20 text-[#8A2BE2] text-[10px] font-bold px-2.5 py-1 rounded-full"
                          >
                            {name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                    <h4 className="text-zinc-600 text-[9px] font-bold uppercase mb-0.5 flex items-center gap-1">
                      <Target size={10} /> Goal
                    </h4>
                    <p className="text-zinc-200 text-xs font-semibold truncate">
                      {preferences?.studyGoal || 'FLEXIBLE'}
                    </p>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                    <h4 className="text-zinc-600 text-[9px] font-bold uppercase mb-0.5 flex items-center gap-1">
                      <Clock size={10} /> Freq
                    </h4>
                    <p className="text-zinc-200 text-xs font-semibold truncate">
                      {preferences?.frequency || 'FLEXIBLE'}
                    </p>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                    <h4 className="text-zinc-600 text-[9px] font-bold uppercase mb-0.5">Language</h4>
                    <p className="text-zinc-200 text-xs font-semibold truncate">
                      {preferences?.studyLanguage || 'English'}
                    </p>
                  </div>
                  {preferences?.subjectDomain && (
                    <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                      <h4 className="text-zinc-600 text-[9px] font-bold uppercase mb-0.5">Domain</h4>
                      <p className="text-zinc-200 text-xs font-semibold truncate">
                        {preferences.subjectDomain}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowPreviewModal(false)}
                className="w-full bg-[blueviolet] hover:bg-[#7c2ae8] text-white font-bold py-3 rounded-xl transition-all shadow-xl shadow-[blueviolet]/20 text-xs uppercase tracking-wider active:scale-95"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};