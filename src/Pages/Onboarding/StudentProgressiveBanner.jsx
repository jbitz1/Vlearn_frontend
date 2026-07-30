import { useState } from "react";
import studentOnboardingService from "../../services/studentOnboardingService";
import { Sparkles, CheckCircle2, X } from "lucide-react";

export default function StudentProgressiveBanner({ onComplete }) {
  const [isOpen, setIsOpen] = useState(true);
  const [county, setCounty] = useState("");
  const [device, setDevice] = useState("PERSONAL_PHONE");
  const [career, setCareer] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSaveProgressive = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await studentOnboardingService.completeProgressiveOnboarding({
        location_county: county,
        primary_device: device,
        career_aspiration: career
      });
      setIsOpen(false);
      if (onComplete) onComplete();
    } catch (err) {
      console.error("Failed to save progressive profile", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-custom-blue to-blue-700 text-white rounded-2xl p-5 mb-6 shadow-md relative overflow-hidden">
      <button onClick={() => setIsOpen(false)} className="absolute top-3 right-3 text-white/80 hover:text-white">
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start space-x-4">
        <div className="p-3 bg-white/10 rounded-xl">
          <Sparkles className="w-6 h-6 text-yellow-300" />
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-lg">Personalize Your AI Learning Path</h3>
          <p className="text-sm text-blue-100 mb-4">
            Tell us your county, primary device, and career goals so we can tailor study recommendations.
          </p>

          <form onSubmit={handleSaveProgressive} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="County (e.g., Nairobi)"
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-white/20 text-white placeholder-blue-200 border border-white/30 focus:outline-none focus:bg-white/30"
            />
            <select
              value={device}
              onChange={(e) => setDevice(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-white/20 text-white border border-white/30 focus:outline-none focus:bg-white/30"
            >
              <option value="PERSONAL_PHONE" className="text-gray-900">Personal Phone</option>
              <option value="TABLET" className="text-gray-900">Tablet</option>
              <option value="LAPTOP" className="text-gray-900">Laptop</option>
              <option value="SHARED_FAMILY_COMPUTER" className="text-gray-900">Shared Computer</option>
            </select>
            <input
              type="text"
              placeholder="Career Goal (e.g., Engineer)"
              value={career}
              onChange={(e) => setCareer(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-white/20 text-white placeholder-blue-200 border border-white/30 focus:outline-none focus:bg-white/30"
            />
            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-custom-orange hover:bg-white hover:text-custom-blue text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center space-x-1"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Profile Insights'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
