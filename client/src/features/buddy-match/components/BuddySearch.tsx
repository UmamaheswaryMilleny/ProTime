// import React from 'react';
// import { Search } from 'lucide-react';

// interface BuddySearchProps {
//   value: string;
//   onChange: (value: string) => void;
//   placeholder?: string;
// }

// export const BuddySearch: React.FC<BuddySearchProps> = ({ value, onChange, placeholder }) => {
//   return (
//     <div className="relative group flex-1">
//       <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={18} />
//       <input
//         type="text"
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         placeholder={placeholder || "Search for buddies by username or skill.."}
//         className="w-full bg-[#18181B] border border-white/5 rounded-xl pl-12 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-white/10 focus:ring-0 outline-none transition-all"
//       />
//     </div>
//   );
// };
