import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Square, Plus, Loader } from 'lucide-react';
import { todoService } from '../../todo/services/todo.service';
import type { TodoItem, CreateTodoDTO } from '../../todo/types/todo.types';
import { AddTodoModal } from '../../todo/components/AddTodoModal';
import toast from 'react-hot-toast';

interface ShareTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (todos: TodoItem[]) => void;
}

export const ShareTodoModal: React.FC<ShareTodoModalProps> = ({ isOpen, onClose, onShare }) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchPendingTodos = async () => {
    setIsLoading(true);
    try {
      const response = await todoService.getTodos('pending');
      // only keep today's pending todos or all pending
      // The user requested 'not completed on that day' which implies pending.
      setTodos(response.todos || []);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPendingTodos();
      setSelectedIds(new Set());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const selectAll = () => {
    if (selectedIds.size === todos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(todos.map((t) => t.id)));
    }
  };

  const handleShare = () => {
    if (selectedIds.size === 0) {
      toast.error('Select at least one task to share');
      return;
    }
    const selectedTodos = todos.filter((t) => selectedIds.has(t.id));
    onShare(selectedTodos);
  };

  const handleAddTodo = async (dto: CreateTodoDTO) => {
    try {
      const newTodo = await todoService.addTodo(dto);
      setTodos((prev) => [newTodo, ...prev]);
      setSelectedIds((prev) => new Set(prev).add(newTodo.id));
      toast.success('Task created successfully');
      return true;
    } catch (error) {
      toast.error('Failed to create task');
      return false;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
        <div className="bg-zinc-900 rounded-3xl w-full max-w-lg border border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-zinc-900/50">
            <h2 className="text-xl font-bold text-white">Share To-Do List</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[200px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader className="animate-spin text-[#8A2BE2]" size={32} />
              </div>
            ) : todos.length === 0 ? (
              <div className="text-center text-zinc-400 py-10">
                <p>No pending tasks found for today.</p>
                <p className="text-sm mt-2 opacity-70">Create a new task to share it.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-4 px-2">
                  <span className="text-sm font-medium text-zinc-400">{selectedIds.size} selected</span>
                  <button onClick={selectAll} className="text-[#8A2BE2] text-sm hover:underline font-medium">
                    {selectedIds.size === todos.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    onClick={() => toggleSelect(todo.id)}
                    className={`flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${
                      selectedIds.has(todo.id) ? 'bg-[#8A2BE2]/10 border-[#8A2BE2]/30' : 'bg-zinc-800/30 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="mt-0.5 text-[#8A2BE2]">
                      {selectedIds.has(todo.id) ? <CheckSquare size={20} /> : <Square size={20} className="text-zinc-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate w-full" title={todo.title}>
                        {todo.title}
                      </p>
                      {todo.estimatedTime && (
                        <p className="text-xs text-zinc-400 mt-1">
                          {todo.estimatedTime} min • {todo.priority}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 bg-zinc-900/50 flex flex-col gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-medium transition-colors border border-white/5"
            >
              <Plus size={18} /> Create New Task
            </button>
            <button
              onClick={handleShare}
              disabled={selectedIds.size === 0}
              className={`w-full py-3 rounded-xl text-sm font-bold text-white transition-all shadow-lg ${
                selectedIds.size === 0 ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed hidden' : 'bg-[#8A2BE2] hover:bg-[#7c2ae8] shadow-[#8A2BE2]/20'
              }`}
            >
              Share {selectedIds.size} {selectedIds.size === 1 ? 'Task' : 'Tasks'}
            </button>
          </div>
        </div>
      </div>

      <AddTodoModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTodo}
      />
    </>
  );
};
