import React, { useState, useEffect } from 'react';
import { Layers, Plus, Search, Edit2, Trash2, X, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Tag, Info } from 'lucide-react';
import { ProTimeBackend } from '../../../api/instance';
import { API_ROUTES } from '../../../shared/constants/constants.routes';
import toast from 'react-hot-toast';

interface Skill {
    _id: string;
    name: string;
    category: string;
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface Stats {
    total: number;
    active: number;
    inactive: number;
    categoriesCount: number;
}

// Matches server-side StudyGoal enum exactly
const STUDY_GOAL_CATEGORIES = [
    { value: 'TECHNOLOGY',       label: 'Technology',        emoji: '💻' },
    { value: 'ACADEMICS',        label: 'Academics',         emoji: '📚' },
    { value: 'LANGUAGES',        label: 'Languages',         emoji: '🌐' },
    { value: 'TEST_PREPARATION', label: 'Test Preparation',  emoji: '📝' },
    { value: 'MACHINE_LEARNING', label: 'Machine Learning',  emoji: '🤖' },
    { value: 'OTHER',            label: 'Other',             emoji: '🎯' },
];

const formatCategory = (cat: string): string => {
    const found = STUDY_GOAL_CATEGORIES.find(c => c.value === cat);
    if (found) return `${found.emoji} ${found.label}`;
    return cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

const getCategoryStyles = (cat: string): string => {
    switch (cat) {
        case 'TECHNOLOGY':       return 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20';
        case 'ACADEMICS':        return 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20';
        case 'LANGUAGES':        return 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20';
        case 'TEST_PREPARATION': return 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20';
        case 'MACHINE_LEARNING': return 'bg-[#EC4899]/10 text-[#EC4899] border-[#EC4899]/20';
        case 'OTHER':            return 'bg-[#6B7280]/10 text-[#9CA3AF] border-[#6B7280]/20';
        default:                 return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
};

export const SkillManagementPage: React.FC = () => {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, active: 0, inactive: 0, categoriesCount: 0 });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Pagination & Filter state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

    // Form fields
    const [formData, setFormData] = useState({
        name: '',
        category: STUDY_GOAL_CATEGORIES[0].value,
        description: ''
    });

    const fetchSkills = async () => {
        try {
            setLoading(true);
            const params = {
                page,
                limit,
                search: search || undefined,
                category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
                status: statusFilter !== 'ALL' ? statusFilter : undefined
            };
            const response = await ProTimeBackend.get(API_ROUTES.ADMIN_SKILLS, { params });
            if (response.data?.success) {
                const { skills, stats, totalPages } = response.data.data;
                setSkills(skills || []);
                setStats(stats || { total: 0, active: 0, inactive: 0, categoriesCount: 0 });
                setTotalPages(totalPages || 1);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to load skills');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSkills();
    }, [page, categoryFilter, statusFilter]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchSkills();
    };



    // ─── Create Skill ───────────────────────────────────────────────────────────
    const handleCreateSkill = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return toast.error('Skill name is required');

        try {
            setSubmitting(true);
            const response = await ProTimeBackend.post(API_ROUTES.ADMIN_SKILLS, formData);
            if (response.data?.success) {
                toast.success('Skill added successfully');
                setIsAddModalOpen(false);
                setFormData({ name: '', category: STUDY_GOAL_CATEGORIES[0].value, description: '' });
                fetchSkills();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to add skill');
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Update Skill ───────────────────────────────────────────────────────────
    const handleUpdateSkill = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSkill) return;
        if (!formData.name.trim()) return toast.error('Skill name is required');

        try {
            setSubmitting(true);
            const response = await ProTimeBackend.put(
                API_ROUTES.ADMIN_SKILL_BY_ID(selectedSkill._id),
                formData
            );
            if (response.data?.success) {
                toast.success('Skill updated successfully');
                setIsEditModalOpen(false);
                setSelectedSkill(null);
                fetchSkills();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update skill');
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Toggle Status ──────────────────────────────────────────────────────────
    const handleToggleStatus = async (skill: Skill) => {
        try {
            const response = await ProTimeBackend.patch(API_ROUTES.ADMIN_SKILL_TOGGLE(skill._id));
            if (response.data?.success) {
                toast.success(`Skill set to ${!skill.isActive ? 'Active' : 'Inactive'}`);
                fetchSkills();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to toggle status');
        }
    };

    // ─── Delete Skill (toast confirmation — no window.confirm) ──────────────────
    const handleDeleteSkill = (skill: Skill) => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <Trash2 size={16} className="text-red-400 shrink-0" />
                    <p className="text-sm font-semibold text-white">Delete "{skill.name}"?</p>
                </div>
                <p className="text-xs text-zinc-400">
                    This skill will be permanently removed and won't appear in buddy matching or user profiles.
                </p>
                <div className="flex gap-2 mt-1">
                    <button
                        className="flex-1 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors"
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                const response = await ProTimeBackend.delete(API_ROUTES.ADMIN_SKILL_BY_ID(skill._id));
                                if (response.data?.success) {
                                    toast.success('Skill deleted successfully');
                                    fetchSkills();
                                }
                            } catch (error: any) {
                                toast.error(error.response?.data?.message || 'Failed to delete skill');
                            }
                        }}
                    >
                        Yes, Delete
                    </button>
                    <button
                        className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-bold transition-colors"
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), {
            duration: 10000,
            style: { background: '#18181B', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', maxWidth: '320px' }
        });
    };

    const openEditModal = (skill: Skill) => {
        setSelectedSkill(skill);
        setFormData({
            name: skill.name,
            category: skill.category,
            description: skill.description
        });
        setIsEditModalOpen(true);
    };

    // ─── Modal Form ─────────────────────────────────────────────────────────────
    const renderSkillForm = (
        onSubmit: (e: React.FormEvent) => void,
        title: string,
        submitLabel: string,
        onClose: () => void
    ) => (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-[#0D0D10] border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between p-5 border-b border-zinc-800/80">
                    <div className="flex items-center gap-2">
                        <Layers className="text-[#2563EB]" size={20} />
                        <h2 className="text-lg font-bold text-white">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white outline-none cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-5 space-y-4">
                    {/* Study Goal (Category) */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                            Study Goal (Category)
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-[#2563EB] transition-all cursor-pointer"
                        >
                            {STUDY_GOAL_CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.emoji} {cat.label}
                                </option>
                            ))}
                        </select>
                        <p className="text-[10px] text-zinc-600">
                            Maps to the Study Goal shown in buddy matching preferences.
                        </p>
                    </div>

                    {/* Skill / Domain Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                            Skill / Domain Name
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Web Development, Deep Learning, French..."
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-[#2563EB] transition-all"
                        />
                        <p className="text-[10px] text-zinc-600">
                            This becomes a selectable subject domain under the chosen Study Goal.
                        </p>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                            Description <span className="normal-case font-normal text-zinc-600">(optional)</span>
                        </label>
                        <textarea
                            placeholder="Brief description of what this skill covers..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-[#2563EB] transition-all resize-none h-20"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800/80">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 font-medium rounded-xl transition-all text-sm outline-none cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-medium rounded-xl transition-all text-sm outline-none shadow-lg shadow-[#2563EB]/25 cursor-pointer"
                        >
                            {submitting ? 'Saving...' : submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Skills Management</h1>
                    <p className="text-zinc-400 text-sm mt-1">
                        Manage study skills and subject domains for buddy matching. Each skill belongs to a <strong className="text-zinc-300">Study Goal</strong> category.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setFormData({ name: '', category: STUDY_GOAL_CATEGORIES[0].value, description: '' });
                        setIsAddModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-[#2563EB]/25 text-sm self-start md:self-auto"
                >
                    <Plus size={18} />
                    <span>Add New Skill</span>
                </button>
            </div>

            {/* Study Goal Category Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {STUDY_GOAL_CATEGORIES.map(cat => (
                    <button
                        key={cat.value}
                        onClick={() => { setCategoryFilter(cat.value); setPage(1); }}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            categoryFilter === cat.value
                                ? `${getCategoryStyles(cat.value)} scale-105 shadow-lg`
                                : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                        }`}
                    >
                        <span className="text-xl">{cat.emoji}</span>
                        <span className="text-[11px] font-semibold leading-tight">{cat.label}</span>
                    </button>
                ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0D0D10] border border-zinc-800/80 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Total Skills</p>
                        <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
                    </div>
                    <div className="p-3 bg-zinc-800/50 text-zinc-300 rounded-xl">
                        <Layers size={22} />
                    </div>
                </div>
                <div className="bg-[#0D0D10] border border-zinc-800/80 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Active Skills</p>
                        <p className="text-3xl font-bold text-green-500 mt-2">{stats.active}</p>
                    </div>
                    <div className="p-3 bg-green-500/10 text-green-500 rounded-xl">
                        <CheckCircle2 size={22} />
                    </div>
                </div>
                <div className="bg-[#0D0D10] border border-zinc-800/80 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Inactive Skills</p>
                        <p className="text-3xl font-bold text-zinc-500 mt-2">{stats.inactive}</p>
                    </div>
                    <div className="p-3 bg-zinc-800/80 text-zinc-500 rounded-xl">
                        <XCircle size={22} />
                    </div>
                </div>
                <div className="bg-[#0D0D10] border border-zinc-800/80 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Study Goal Categories</p>
                        <p className="text-3xl font-bold text-blue-400 mt-2">{stats.categoriesCount}</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                        <Tag size={22} />
                    </div>
                </div>
            </div>

            {/* Filter Panel */}
            <div className="bg-[#0D0D10] border border-zinc-800/80 rounded-2xl p-5">
                <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative md:col-span-2">
                        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search skills by name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-[#2563EB] transition-all"
                        />
                    </div>
                    <div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:ring-2 focus:ring-[#2563EB] transition-all cursor-pointer"
                        >
                            <option value="ALL">All Study Goals</option>
                            {STUDY_GOAL_CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.emoji} {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:ring-2 focus:ring-[#2563EB] transition-all cursor-pointer"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="ACTIVE">Active Only</option>
                            <option value="INACTIVE">Inactive Only</option>
                        </select>
                    </div>
                </form>
                {categoryFilter !== 'ALL' && (
                    <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-zinc-500">Filtering by:</span>
                        <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${getCategoryStyles(categoryFilter)}`}>
                            {formatCategory(categoryFilter)}
                        </span>
                        <button
                            onClick={() => { setCategoryFilter('ALL'); setPage(1); }}
                            className="text-xs text-zinc-500 hover:text-white flex items-center gap-1 transition-colors"
                        >
                            <X size={12} /> Clear
                        </button>
                    </div>
                )}
            </div>

            {/* Skills Table */}
            <div className="bg-[#0D0D10] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl">
                {loading ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
                        <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
                        <p className="text-zinc-400 text-sm">Loading skills catalog...</p>
                    </div>
                ) : skills.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
                        <div className="p-4 bg-zinc-900 rounded-full text-zinc-600">
                            <Info size={40} />
                        </div>
                        <h3 className="text-lg font-semibold text-white">No Skills Found</h3>
                        <p className="text-zinc-500 max-w-sm text-sm">
                            No skills match your current filters. Try clearing the filters or search.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-800/80 bg-zinc-900/30">
                                    <th className="px-6 py-4 text-xs font-semibold uppercase text-zinc-400 tracking-wider">Skill / Domain</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase text-zinc-400 tracking-wider">Study Goal</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase text-zinc-400 tracking-wider">Description</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase text-zinc-400 tracking-wider text-center">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase text-zinc-400 tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {skills.map((skill) => (
                                    <tr key={skill._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/10 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-white">{skill.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${getCategoryStyles(skill.category)}`}>
                                                {formatCategory(skill.category)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-400 text-sm max-w-xs truncate" title={skill.description}>
                                            {skill.description || <span className="text-zinc-600 italic">No description</span>}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleToggleStatus(skill)}
                                                className={`mx-auto flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border outline-none ${
                                                    skill.isActive
                                                        ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20'
                                                        : 'bg-zinc-800 text-zinc-500 border-zinc-700/80 hover:bg-zinc-700/50'
                                                }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${skill.isActive ? 'bg-green-500' : 'bg-zinc-500'}`} />
                                                {skill.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2.5">
                                                <button
                                                    onClick={() => openEditModal(skill)}
                                                    className="p-1.5 bg-zinc-800/80 hover:bg-[#2563EB]/20 border border-zinc-700 hover:border-[#2563EB]/40 rounded-lg text-zinc-300 hover:text-[#2563EB] transition-all"
                                                    title="Edit Skill"
                                                >
                                                    <Edit2 size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSkill(skill)}
                                                    className="p-1.5 bg-zinc-800/80 hover:bg-red-500/10 border border-zinc-700 hover:border-red-500/30 rounded-lg text-zinc-300 hover:text-red-400 transition-all"
                                                    title="Delete Skill"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/10">
                        <p className="text-zinc-500 text-xs font-medium">Page {page} of {totalPages}</p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                disabled={page === 1}
                                className="p-1.5 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={page === totalPages}
                                className="p-1.5 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Skill Modal */}
            {isAddModalOpen && renderSkillForm(
                handleCreateSkill,
                'Add New Skill',
                'Add Skill',
                () => setIsAddModalOpen(false)
            )}

            {/* Edit Skill Modal */}
            {isEditModalOpen && selectedSkill && renderSkillForm(
                handleUpdateSkill,
                `Edit "${selectedSkill.name}"`,
                'Save Changes',
                () => { setIsEditModalOpen(false); setSelectedSkill(null); }
            )}
        </div>
    );
};
