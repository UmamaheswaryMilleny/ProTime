import {
  User,
  MapPin,
  Languages,
  // BadgeCheck,
  Trophy,
  Settings,
  Eye,
} from "lucide-react";

export default function Profile() {
  return (
    <div className="p-6 pl-15 text-white bg-[#0f0f1a] min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-gray-400 text-sm mt-1">
            Let’s set up your profile so we can match you with the best buddies.
          </p>
        </div>

        {/* Profile Avatar */}
        <div className="flex items-center gap-3">
          <img
            src="https://i.pravatar.cc/100"
            alt="avatar"
            className="w-10 h-10 rounded-full border border-gray-600"
          />
          <span className="text-xs bg-green-600 px-2 py-1 rounded-full">
            Early Bird
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div className="bg-purple-500 h-2 rounded-full w-[10%]"></div>
        </div>
        <p className="text-right text-xs text-purple-400 mt-1">10%</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT SECTION */}
        <div className="lg:col-span-2 space-y-6">

          {/* Basic Profile Info */}
          <div className="bg-[#1a1a2e] p-5 rounded-xl shadow">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <User size={18} /> Basic Profile Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="bg-[#0f0f1a] p-3 rounded-lg outline-none"
                placeholder="Full Name"
              />
              <input
                className="bg-[#0f0f1a] p-3 rounded-lg outline-none"
                placeholder="Username"
              />

              <div className="flex items-center bg-[#0f0f1a] p-3 rounded-lg">
                <MapPin size={16} className="mr-2 text-gray-400" />
                <input
                  className="bg-transparent outline-none flex-1"
                  placeholder="Location"
                />
              </div>

              <div className="flex items-center bg-[#0f0f1a] p-3 rounded-lg">
                <Languages size={16} className="mr-2 text-gray-400" />
                <input
                  className="bg-transparent outline-none flex-1"
                  placeholder="Languages"
                />
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-[#1a1a2e] p-5 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-3">
              About Me & What I'm Looking For
            </h2>
            <textarea
              className="bg-[#0f0f1a] p-3 rounded-lg w-full h-28 outline-none resize-none"
              placeholder="Short description (max 300 characters)"
            />
          </div>

          {/* Learning Preferences */}
          <div className="bg-[#1a1a2e] p-5 rounded-xl shadow">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Settings size={18} /> Learning & Study Preferences
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select className="bg-[#0f0f1a] p-3 rounded-lg outline-none">
                <option>Time Zone</option>
                <option>IST</option>
                <option>EST</option>
              </select>

              <select className="bg-[#0f0f1a] p-3 rounded-lg outline-none">
                <option>Study Goal</option>
                <option>Technology</option>
                <option>Language</option>
              </select>

              <select className="bg-[#0f0f1a] p-3 rounded-lg outline-none">
                <option>Frequency</option>
                <option>Daily</option>
                <option>Weekly</option>
              </select>

              <select className="bg-[#0f0f1a] p-3 rounded-lg outline-none">
                <option>Language</option>
                <option>English</option>
                <option>Hindi</option>
              </select>
            </div>

            <p className="text-xs text-yellow-400 mt-3">
              Advanced settings not available for free users
            </p>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="space-y-6">

          {/* Profile Status Card */}
          <div className="bg-[#1a1a2e] p-5 rounded-xl shadow text-center">
            <h3 className="flex items-center justify-center gap-2 text-lg font-semibold mb-3">
              <Trophy size={18} /> Profile Status
            </h3>

            <p className="text-4xl font-bold text-purple-400">10 XP</p>
            <p className="text-green-500 mt-1">Early Bird (Level 0)</p>

            <button className="mt-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm">
              Subscribe To Premium To Unlock Badges
            </button>

            <div className="flex justify-between mt-3 text-xs text-gray-400">
              <span>View All Badges</span>
              <span>View All Levels</span>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-[#1a1a2e] p-5 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-3">Quick Tips</h3>
            <ul className="text-sm text-gray-400 space-y-2 list-disc ml-4">
              <li>Complete your profile to get better buddy matches</li>
              <li>Add specific skills to find skill exchange partners</li>
              <li>Set realistic study goals for better accountability</li>
            </ul>
          </div>

          {/* Buttons */}
          <button className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-lg flex items-center justify-center gap-2">
            <Eye size={16} /> Preview My Public Profile
          </button>

          <button className="w-full bg-[#23233b] hover:bg-[#2e2e4d] py-2 rounded-lg">
            Subscription Details
          </button>
        </div>
      </div>
    </div>
  );
}
