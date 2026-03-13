import React, { useState, useEffect } from 'react';
import { 
  StudyGoal, 
  StudyFrequency, 
  SubjectDomain, 
  Availability, 
  SessionDuration, 
  FocusLevel, 
  StudyPreference, 
  GroupStudy, 
  StudyMode,
  type BuddyPreference
} from '../types/buddy.types';
import { ChevronDown, ShieldCheck, Search } from 'lucide-react';
import { ALL_COUNTRIES, ALL_LANGUAGES } from '../../../shared/constants/locations';

interface BuddyPreferenceFormProps {
  initialData: BuddyPreference | null;
  isPremium: boolean;
  onSave: (data: any) => Promise<void>;
  onChange?: (data: any) => void;
  isSaving: boolean;
  section?: 'basic' | 'advanced' | 'all';
}

export const BuddyPreferenceForm: React.FC<BuddyPreferenceFormProps> = ({
  initialData,
  isPremium,
  onSave,
  onChange,
  isSaving,
  section = 'all'
}) => {
  const [formData, setFormData] = useState<any>({
    country: '',
    studyGoal: StudyGoal.OTHER,
    studyLanguage: 'English',
    frequency: StudyFrequency.FLEXIBLE,
    isVisible: true,
    subjectDomain: SubjectDomain.OTHERS,
    availability: Availability.FLEXIBLE,
    sessionDuration: SessionDuration.FLEXIBLE,
    focusLevel: FocusLevel.CASUAL,
    studyPreference: StudyPreference.FLEXIBLE,
    groupStudy: GroupStudy.MAYBE,
    studyMode: StudyMode.ANY,
  });

  const [searchStates, setSearchStates] = useState({
    country: { isOpen: false, query: '' },
    studyLanguage: { isOpen: false, query: '' },
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData
      });
    }
  }, [initialData]);

  const handleChange = (key: string, value: any) => {
    const newData = { ...formData, [key]: value };
    setFormData(newData);
    if (onChange) {
      // For real-time sync, we can send the whole thing or just the diff
      onChange(newData);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Prepare data - only send whitelisted DTO fields
    const submissionData: any = {};
    const whitelistedFields = [
      'country', 'studyGoal', 'studyLanguage', 'frequency', 'isVisible',
      'subjectDomain', 'availability', 'sessionDuration', 'focusLevel',
      'studyPreference', 'groupStudy', 'studyMode'
    ];

    whitelistedFields.forEach(field => {
      if (formData[field] !== undefined) {
        submissionData[field] = formData[field];
      }
    });

    if (!isPremium) {
      // Stripping premium fields for non-premium users
      const premiumFields = [
        'subjectDomain', 'availability', 'sessionDuration', 
        'focusLevel', 'studyPreference', 'groupStudy', 'studyMode'
      ];
      premiumFields.forEach(field => delete submissionData[field]);
    }

    onSave(submissionData);
  };

  const renderSelect = (label: string, value: string, options: Record<string, string>, key: string, isAdvanced: boolean = false) => {
    const isLocked = isAdvanced && !isPremium;
    
    return (
      <div className={`space-y-1.5 ${isLocked ? 'opacity-60' : ''}`}>
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</label>
          {isLocked && (
            <span className="flex items-center gap-1 text-[9px] bg-[blueviolet]/10 text-[blueviolet] px-1.5 py-0.5 rounded border border-[blueviolet]/20 font-bold">
               PRO
            </span>
          )}
        </div>
        <div className="relative group">
          <select
            value={value}
            disabled={isLocked}
            onChange={(e) => handleChange(key, e.target.value)}
            title={isLocked ? "Upgrade to Premium to unlock advanced matching" : ""}
            className={`w-full bg-[#27272A] rounded-lg pl-3 pr-10 py-2.5 text-xs text-zinc-300 border border-white/5 focus:border-white/10 outline-none transition-all appearance-none cursor-pointer ${isLocked ? 'cursor-not-allowed select-none' : 'hover:bg-zinc-800 group-hover:border-white/10'}`}
          >
            {Object.entries(options).map(([k, v]) => (
              <option key={k} value={v} className="bg-zinc-900 text-zinc-200">{v.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
            <ChevronDown size={14} />
          </div>
        </div>
      </div>
    );
  };

  const renderSearchableSelect = (label: string, value: string, options: string[], key: 'country' | 'studyLanguage') => {
    const state = searchStates[key];
    const filteredOptions = options.filter(opt => opt.toLowerCase().includes(state.query.toLowerCase()));

    return (
      <div className="space-y-1.5 relative">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</label>
        <div className="relative group">
          <div
            onClick={() => setSearchStates(prev => ({ ...prev, [key]: { ...prev[key], isOpen: !prev[key].isOpen, query: '' } }))}
            className="w-full bg-[#27272A] rounded-lg px-3 py-2.5 text-xs text-zinc-300 border border-white/5 hover:bg-zinc-800 hover:border-white/10 cursor-pointer flex items-center justify-between transition-all"
          >
            <span className={value ? 'text-zinc-300' : 'text-zinc-600'}>{value || `Select ${label}...`}</span>
            <ChevronDown size={14} className={`text-zinc-500 transition-transform ${state.isOpen ? 'rotate-180' : ''}`} />
          </div>

          {state.isOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setSearchStates(prev => ({ ...prev, [key]: { ...prev[key], isOpen: false } }))} />
              <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-2 border-b border-white/5 flex items-center gap-2">
                  <Search size={14} className="text-zinc-500 ml-2" />
                  <input
                    autoFocus
                    type="text"
                    placeholder={`Search ${label}...`}
                    value={state.query}
                    onChange={(e) => setSearchStates(prev => ({ ...prev, [key]: { ...prev[key], query: e.target.value } }))}
                    className="w-full bg-transparent border-none text-xs text-white focus:ring-0 placeholder:text-zinc-600 py-1"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          handleChange(key, opt);
                          setSearchStates(prev => ({ ...prev, [key]: { ...prev[key], isOpen: false } }));
                        }}
                        className={`w-full text-left px-4 py-2 text-xs transition-colors ${value === opt ? 'bg-[blueviolet]/20 text-[blueviolet] font-bold' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                      >
                        {opt}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-[10px] text-zinc-600 text-center italic">No results found</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderBasicFields = () => (
    <div className="space-y-4">
      {renderSearchableSelect('Country', formData.country, ALL_COUNTRIES, 'country')}
      {renderSelect('Study Goal', formData.studyGoal, StudyGoal, 'studyGoal')}
      {renderSearchableSelect('Language', formData.studyLanguage, ALL_LANGUAGES, 'studyLanguage')}
      {renderSelect('Frequency', formData.frequency, StudyFrequency, 'frequency')}
    </div>
  );


  const renderAdvancedFields = () => (
    <div className="space-y-4">
      {renderSelect('Subject/ Domain', formData.subjectDomain, SubjectDomain, 'subjectDomain', true)}
      {renderSelect('Focul Level', formData.focusLevel, FocusLevel, 'focusLevel', true)}
      {renderSelect('Study Preference', formData.studyPreference, StudyPreference, 'studyPreference', true)}
      {renderSelect('Availability', formData.availability, Availability, 'availability', true)}
      {renderSelect('Study Duration', formData.sessionDuration, SessionDuration, 'sessionDuration', true)}
      {renderSelect('Study Mode', formData.studyMode, StudyMode, 'studyMode', true)}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-8">
        {section === 'basic' && renderBasicFields()}
        {section === 'advanced' && renderAdvancedFields()}
        {section === 'all' && (
          <>
            {renderBasicFields()}
            
            <div className="pt-4 border-t border-white/5">
                <div className="mb-6">
                    <button
                        type="button"
                        onClick={() => isPremium && setShowAdvanced(!showAdvanced)}
                        className={`flex items-center gap-2 group transition-all ${isPremium ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                    >
                        <ShieldCheck size={18} className={isPremium ? 'text-[blueviolet]' : 'text-zinc-600'} />
                        <span className={`text-sm font-bold ${isPremium ? 'text-white group-hover:text-[blueviolet]' : 'text-zinc-500'}`}>
                            Advanced Settings
                        </span>
                        {!isPremium && (
                            <span className="text-[10px] text-amber-500/80 font-normal ml-2 italic underline underline-offset-2 decoration-amber-500/20">
                                (Not Available For Free Users)
                            </span>
                        )}
                        {isPremium && (
                            <ChevronDown 
                                size={14} 
                                className={`text-zinc-500 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} 
                            />
                        )}
                    </button>
                    {isPremium && !showAdvanced && (
                        <p className="text-[10px] text-zinc-500 mt-1 italic">Click to expand advanced matching filters</p>
                    )}
                </div>
                
                {showAdvanced && (
                    <div className="transition-all duration-500 overflow-hidden max-h-[1000px]">
                        {renderAdvancedFields()}
                    </div>
                )}
            </div>
          </>
        )}
      </div>

      {(section === 'all' || section === 'advanced') && (
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold py-2.5 rounded-lg text-xs transition-all shadow-lg shadow-[blueviolet]/10 disabled:opacity-50"
          >
            {isSaving ? 'Applying...' : 'Apply'}
          </button>
        </div>
      )}
    </form>
  );
};
