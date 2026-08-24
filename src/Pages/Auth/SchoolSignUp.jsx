import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import apiClient from '../../config/apiClient';
import { GraduationCap } from 'lucide-react';

const COUNTY_SUBCOUNTIES = {
  'Nairobi': ['Westlands', 'Dagoretti North', 'Dagoretti South', 'Lang\'ata', 'Kibra', 'Roysambu', 'Kasarani', 'Ruaraka', 'Embakasi South', 'Embakasi North', 'Embakasi Central', 'Embakasi East', 'Embakasi West', 'Makadara', 'Kamukunji', 'Starehe', 'Mathare'],
  'Mombasa': ['Mvita', 'Nyali', 'Changamwe', 'Jomvu', 'Kisauni', 'Likoni'],
  'Kiambu': ['Thika Town', 'Ruiru', 'Juja', 'Gatundu South', 'Gatundu North', 'Githunguri', 'Kiambu', 'Kiambaa', 'Kabete', 'Kikuyu', 'Limuru', 'Lari'],
  'Nakuru': ['Nakuru Town East', 'Nakuru Town West', 'Naivasha', 'Gilgil', 'Kuresoi South', 'Kuresoi North', 'Molo', 'Rongai', 'Subukia', 'Njoro', 'Bahati'],
  'Machakos': ['Machakos Town', 'Mavoko (Athi River)', 'Mwala', 'Yatta', 'Kangundo', 'Matungulu', 'Kathiani', 'Masinga'],
  'Kisumu': ['Kisumu Central', 'Kisumu East', 'Kisumu West', 'Seme', 'Nyando', 'Muhoroni', 'Nyakach'],
  'Uasin Gishu': ['Ainabkoi', 'Kapseret', 'Kesses', 'Moiben', 'Soy', 'Turbo'],
  'Kajiado': ['Kajiado Central', 'Kajiado North', 'Kajiado South', 'Kajiado East', 'Kajiado West'],
  'Kilifi': ['Kilifi North', 'Kilifi South', 'Kaloleni', 'Rabai', 'Ganze', 'Malindi', 'Magarini'],
  'Kakamega': ['Lurambi', 'Malava', 'Navakholo', 'Mumias East', 'Mumias West', 'Matungu', 'Butere', 'Khwisero', 'Shinyalu', 'Ikolomani', 'Lugari', 'Likuyani'],
  'Meru': ['Imenti North', 'Imenti South', 'Central Imenti', 'Buuri', 'Tigania East', 'Tigania West', 'Igembe North', 'Igembe South', 'Igembe Central'],
  'Nyeri': ['Nyeri Town', 'Tetu', 'Kieni East', 'Kieni West', 'Mathira East', 'Mathira West', 'Othaya', 'Mukurweini'],
  'Bungoma': ['Kanduyi', 'Bumula', 'Sirisia', 'Kabuchai', 'Webuye East', 'Webuye West', 'Tongaren', 'Kimilili', 'Mt. Elgon'],
  'Murang\'a': ['Kiharu', 'Kangema', 'Mathioya', 'Kigumo', 'Kandara', 'Gatanga', 'Maragua'],
  'Trans Nzoia': ['Cherangany', 'Endebess', 'Kiminini', 'Kwanza', 'Saboti'],
  'Nandi': ['Aldai', 'Chesumei', 'Emgwen', 'Mosop', 'Nandi Hills', 'Tinderet'],
  'Kericho': ['Ainamoi', 'Belgut', 'Bureti', 'Kipkelion East', 'Kipkelion West', 'Sigowet-Soin'],
  'Bomet': ['Bomet Central', 'Bomet East', 'Chepalungu', 'Konoin', 'Sotik'],
  'Kisii': ['Kitutu Chache North', 'Kitutu Chache South', 'Nyaribari Masaba', 'Nyaribari Chache', 'Bomachoge Borabu', 'Bomachoge Chache', 'Bobasi', 'South Mugirango', 'Bonchari'],
  'Homa Bay': ['Homa Bay Town', 'Kabondo Kasipul', 'Kasipul', 'Karachuonyo', 'Rangwe', 'Ndhiwa', 'Suba North', 'Suba South'],
  'Siaya': ['Alego Usonga', 'Gem', 'Bondo', 'Rarieda', 'Ugenya', 'Ugunja'],
  'Migori': ['Suna East', 'Suna West', 'Uriri', 'Awendo', 'Rongo', 'Nyatike', 'Kuria West', 'Kuria East'],
  'Embu': ['Manyatta', 'Runyenjes', 'Mbeere North', 'Mbeere South'],
  'Kitui': ['Kitui Central', 'Kitui West', 'Kitui East', 'Kitui Rural', 'Kitui South', 'Mwingi Central', 'Mwingi West', 'Mwingi North'],
  'Makueni': ['Makueni', 'Kaiti', 'Kibwezi East', 'Kibwezi West', 'Kilome', 'Mbooni'],
  'Nyandarua': ['Kinangop', 'Kipipiri', 'Ol Kalou', 'Ol Jorok', 'Ndaragwa'],
  'Kirinyaga': ['Kirinyaga Central', 'Gichugu', 'Ndia', 'Mwea'],
  'Laikipia': ['Laikipia East', 'Laikipia West', 'Laikipia North'],
  'Garissa': ['Garissa Township', 'Balambala', 'Dadaab', 'Fafi', 'Ijara', 'Lagdera'],
  'Turkana': ['Turkana Central', 'Turkana East', 'Turkana North', 'Turkana South', 'Turkana West', 'Loima'],
  'Narok': ['Narok North', 'Narok South', 'Narok East', 'Narok West', 'Kilgoris', 'Emurua Dikirr'],
  'Baringo': ['Baringo Central', 'Baringo North', 'Baringo South', 'Eldama Ravine', 'Mogotio', 'Tiaty'],
  'Busia': ['Budalangi', 'Funyula', 'Butula', 'Matayos', 'Nambale', 'Teso North', 'Teso South'],
  'Vihiga': ['Emuhaya', 'Hamisi', 'Luanda', 'Sabatia', 'Vihiga'],
  'Nyamira': ['Borabu', 'Manga', 'Masaba North', 'Nyamira North', 'Nyamira South'],
  'Isiolo': ['Isiolo', 'Merti', 'Garbatulla'],
  'Marsabit': ['Laisamis', 'Moyale', 'North Horr', 'Saku'],
  'Samburu': ['Samburu East', 'Samburu North', 'Samburu West'],
  'Taita Taveta': ['Mwatate', 'Taveta', 'Voi', 'Wundanyi'],
  'Kwale': ['Kinango', 'Lunga Lunga', 'Matuga', 'Msambweni'],
  'Tana River': ['Bura', 'Galole', 'Garsen'],
  'Lamu': ['Lamu East', 'Lamu West'],
  'Wajir': ['Eldas', 'Tarbaj', 'Wajir East', 'Wajir North', 'Wajir South', 'Wajir West'],
  'Mandera': ['Banissa', 'Lafey', 'Mandera East', 'Mandera North', 'Mandera South', 'Mandera West'],
  'West Pokot': ['Kapenguria', 'Kacheliba', 'Pokot South', 'Sigor'],
  'Elgeyo Marakwet': ['Keiyo North', 'Keiyo South', 'Marakwet East', 'Marakwet West'],
  'Tharaka Nithi': ['Chuka/Igambang\'ombe', 'Maara', 'Tharaka']
};

const COUNTIES = Object.keys(COUNTY_SUBCOUNTIES);
const CURRICULA = ['8-4-4', 'CBC', 'Both'];
const SCHOOL_TYPES = ['National School', 'Extra County School', 'County School', 'Sub-County School', 'Private School', 'International School'];

const SchoolSignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    schoolName: '',
    schoolType: 'County School',
    curriculum: '8-4-4',
    county: 'Nairobi',
    subCounty: 'Westlands',
    phone: '',
    adminName: '',
    adminPhone: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCountyChange = (e) => {
    const newCounty = e.target.value;
    const availableSubcounties = COUNTY_SUBCOUNTIES[newCounty] || [];
    setFormData(prev => ({
      ...prev,
      county: newCounty,
      subCounty: availableSubcounties.length > 0 ? availableSubcounties[0] : ''
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const targetPhone = formData.adminPhone.trim() || formData.phone.trim();
    if (!targetPhone) {
      setError('Please provide an administrator phone number.');
      setLoading(false);
      return;
    }
    
    try {
      const res = await apiClient.post('/api/auth/request-otp/', {
        phone_number: targetPhone,
        purpose: 'registration'
      });
      // Pass the returned code in development if present, along with signup data
      const devCode = res.data?.code || '';
      navigate('/verify-otp', { state: { signupData: formData, devCode } });
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to request OTP. Please try again.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const availableSubcounties = COUNTY_SUBCOUNTIES[formData.county] || [];

  return (
    <div className="min-h-screen bg-slate-50/70 flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-5xl xl:max-w-6xl">
        {/* Top Branding Header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-md shadow-primary/20 text-white">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-black font-heading text-navy text-2xl tracking-tight block">VizLearn</span>
              <span className="text-xs text-slate-400 font-semibold">Institutional Onboarding Portal</span>
            </div>
          </div>
          <Link
            to="/login"
            className="text-xs font-bold text-slate-600 hover:text-primary transition-colors px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300"
          >
            Already registered? Sign In
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 lg:p-10">
          <div className="border-b border-slate-100 pb-5 mb-8">
            <h2 className="text-2xl sm:text-3xl font-black font-heading text-navy tracking-tight">Register Your School</h2>
            <p className="text-sm text-slate-500 mt-1">
              Set up your institution on VizLearn. Instant registration with SMS verification — get started in minutes.
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl text-sm border border-red-200 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: School Information (7 cols on desktop) */}
              <div className="lg:col-span-7 space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-navy font-heading">
                    1. School Information & Location
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Official School Name *</label>
                    <input
                      required
                      name="schoolName"
                      value={formData.schoolName}
                      onChange={handleChange}
                      placeholder="e.g. Nairobi Academy High School"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/30 focus:bg-white transition-all text-navy font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">School Category *</label>
                      <select
                        required
                        name="schoolType"
                        value={formData.schoolType}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary bg-white transition-colors text-navy font-medium cursor-pointer"
                      >
                        {SCHOOL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Curriculum *</label>
                      <select
                        required
                        name="curriculum"
                        value={formData.curriculum}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary bg-white transition-colors text-navy font-medium cursor-pointer"
                      >
                        {CURRICULA.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">County *</label>
                      <select
                        required
                        name="county"
                        value={formData.county}
                        onChange={handleCountyChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary bg-white transition-colors text-navy font-medium cursor-pointer"
                      >
                        {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Sub-County *</label>
                      {availableSubcounties.length > 0 ? (
                        <select
                          required
                          name="subCounty"
                          value={formData.subCounty}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary bg-white transition-colors text-navy font-medium cursor-pointer"
                        >
                          {availableSubcounties.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                        </select>
                      ) : (
                        <input
                          required
                          name="subCounty"
                          value={formData.subCounty}
                          onChange={handleChange}
                          placeholder="e.g. Westlands"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary text-navy font-medium"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">School Official Telephone *</label>
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="07XX XXX XXX or 020 XXX XXXX"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary bg-slate-50/30 focus:bg-white text-navy font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Administrator Account & Platform Highlights (5 cols on desktop) */}
              <div className="lg:col-span-5 space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-navy font-heading">
                    2. Primary Administrator
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Principal / Admin Full Name *</label>
                    <input
                      required
                      name="adminName"
                      value={formData.adminName}
                      onChange={handleChange}
                      placeholder="e.g. Dr. Jane Mutua"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary bg-slate-50/30 focus:bg-white text-navy font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Admin Mobile Phone * (For SMS OTP)</label>
                    <input
                      required
                      type="tel"
                      name="adminPhone"
                      value={formData.adminPhone}
                      onChange={handleChange}
                      placeholder="07XX XXX XXX"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary bg-slate-50/30 focus:bg-white text-navy font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      Administrator Email <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="principal@school.ac.ke"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary bg-slate-50/30 focus:bg-white text-navy font-medium"
                    />
                  </div>

                  {/* Highlights Card */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                      What to expect next
                    </span>
                    <ul className="text-xs text-slate-600 space-y-1.5 font-medium">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                        <span>Instant 6-digit SMS verification code</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                        <span>Interactive 8-step teaching & structure setup</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                        <span>Full KCSE and CBC subject support</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors text-center cursor-pointer"
              >
                ← Back to Login
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-navy text-white text-sm font-bold font-heading hover:bg-navy-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-navy/10"
              >
                {loading ? 'Requesting SMS Verification...' : 'Continue to Verification →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SchoolSignUp;
