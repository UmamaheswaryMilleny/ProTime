import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setIsDeleting(true);
        await onConfirm();
        setIsDeleting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-3xl w-full max-w-sm border border-white/10 overflow-hidden shadow-2xl">
                <div className="p-6 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-2">
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Delete Task?</h3>
                    <p className="text-sm text-zinc-400">
                        Are you sure you want to delete this task? This action cannot be undone.
                    </p>

                    <div className="pt-2 flex justify-center gap-3">
                        <button type="button" onClick={onClose} disabled={isDeleting} className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 transition-colors border border-white/5 flex-1">
                            Cancel
                        </button>
                        <button type="button" onClick={handleConfirm} disabled={isDeleting} className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 flex-1 flex items-center justify-center">
                            {isDeleting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Yes, Delete'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
