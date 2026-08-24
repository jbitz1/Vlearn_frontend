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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold font-heading text-navy text-xl tracking-tight">VizLearn</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-2xl font-bold font-heading text-navy mb-1">Register Your School</h2>
          <p className="text-sm text-slate-500 mb-8">Set up your school on VizLearn. No email required — just your phone number.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">School Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">School Name *</label>
                  <input
                    required
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleChange}
                    placeholder="e.g. Nairobi Academy Secondary School"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">School Type *</label>
                  <select
                    required
                    name="schoolType"
                    value={formData.schoolType}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary bg-white transition-colors"
                  >
                    {SCHOOL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Curriculum *</label>
                  <select
                    required
                    name="curriculum"
                    value={formData.curriculum}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary bg-white transition-colors"
                  >
                    {CURRICULA.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">County *</label>
                  <select
                    required
                    name="county"
                    value={formData.county}
                    onChange={handleCountyChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary bg-white transition-colors"
                  >
                    {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Sub-County *</label>
                  {availableSubcounties.length > 0 ? (
                    <select
                      required
                      name="subCounty"
                      value={formData.subCounty}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary bg-white transition-colors"
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
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">School Contact *</label>
                  <input
                    required
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="07XX XXX XXX"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Administrator Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Administrator Name *</label>
                  <input
                    required
                    name="adminName"
                    value={formData.adminName}
                    onChange={handleChange}
                    placeholder="Full name"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Administrator Phone *</label>
                  <input
                    required
                    type="tel"
                    name="adminPhone"
                    value={formData.adminPhone}
                    onChange={handleChange}
                    placeholder="07XX XXX XXX"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Email <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@school.ac.ke"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Link
                to="/login"
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors text-center"
              >
                Back to Login
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-navy text-white text-sm font-semibold font-heading hover:bg-navy-700 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? 'Requesting Verification...' : 'Create School →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SchoolSignUp;
