import React, { useState, useEffect, useContext } from 'react';
import { X, Building2, Layers, BookOpen, CreditCard, CheckCircle2, ArrowRight, ShieldCheck, Phone } from 'lucide-react';
import apiClient from '../../config/apiClient';
import Swal from 'sweetalert2';
import { useSchoolContext } from '../../Context/SchoolContext';
import UserContext from '../../Context/UserContext';

const SchoolCheckoutModal = ({ isOpen, onClose }) => {
    const { user } = useContext(UserContext);
    const { school, streams, subjects, activeAcademicYear } = useSchoolContext();
    const [step, setStep] = useState(1);
    
    const [plans, setPlans] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(false);
    
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedStreams, setSelectedStreams] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            fetchPlans();
            
            // Pre-select all streams and subjects by default to streamline the checkout process
            if (streams && streams.length > 0) {
                setSelectedStreams(streams.map(s => s.id));
            }
            if (subjects && subjects.length > 0) {
                setSelectedSubjects(subjects.map(s => s.id));
            }
        }
    }, [isOpen, streams, subjects]);

    const fetchPlans = async () => {
        setLoadingPlans(true);
        try {
            const res = await apiClient.get('/api/subscriptions/products/?audience=SCHOOL');
            const rawProducts = res.data.results || res.data || [];
            const formattedPlans = [];

            rawProducts.forEach(prod => {
                if (prod.variants) {
                    prod.variants.forEach(variant => {
                        if (variant.is_active !== false) {
                            formattedPlans.push({
                                id: variant.id,
                                name: variant.name,
                                productName: prod.name,
                                duration: variant.duration_days,
                                description: variant.duration_days === 365 ? 'Full Academic Year Access' : 'Single Academic Term Access'
                            });
                        }
                    });
                }
            });
            setPlans(formattedPlans);
        } catch (err) {
            console.error("Failed to load school plans:", err);
            Swal.fire('Error', 'Could not load subscription plans. Please try again later.', 'error');
            onClose();
        } finally {
            setLoadingPlans(false);
        }
    };

    const toggleStream = (id) => {
        if (selectedStreams.includes(id)) {
            setSelectedStreams(selectedStreams.filter(s => s !== id));
        } else {
            setSelectedStreams([...selectedStreams, id]);
        }
    };

    const toggleSubject = (id) => {
        if (selectedSubjects.includes(id)) {
            setSelectedSubjects(selectedSubjects.filter(s => s !== id));
        } else {
            setSelectedSubjects([...selectedSubjects, id]);
        }
    };

    const calculatePrice = () => {
        if (selectedStreams.length === 0 || selectedSubjects.length === 0) return 0;
        
        // Matches backend CommercialPricingService formula
        const streamCount = selectedStreams.length;
        const subjectCount = selectedSubjects.length;
        const perSubjectPrice = 1000 + ((streamCount - 1) * 300);
        return perSubjectPrice * subjectCount;
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        
        if (!phone || phone.trim().length < 9) {
            Swal.fire('Invalid Phone Number', 'Please enter a valid M-Pesa phone number.', 'error');
            return;
        }

        let formattedPhone = phone.trim();
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '254' + formattedPhone.slice(1);
        } else if (formattedPhone.startsWith('+')) {
            formattedPhone = formattedPhone.slice(1);
        }

        setIsSubmitting(true);
        try {
            // 1. Create Checkout Invoice
            const checkoutRes = await apiClient.post('/api/subscriptions/checkout/', {
                product_variant_id: selectedPlan.id,
                school_id: school.id,
                subject_ids: selectedSubjects,
                stream_ids: selectedStreams,
                academic_year_id: activeAcademicYear?.id,
                term_name: 'Term 1', // Default term
                billing_address: {
                    full_name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Admin',
                    phone_number: formattedPhone,
                    email: user?.email || 'admin@school.com'
                }
            });

            const invoiceId = checkoutRes.data.invoice_number || checkoutRes.data.invoice_id;
            const amount = checkoutRes.data.amount || calculatePrice();

            // 2. Trigger M-Pesa STK Push
            if (invoiceId) {
                await apiClient.post(`/api/billing-and-payments/invoices/${invoiceId}/payment-transactions/`, {
                    amount: amount,
                    payment_method: 'MPESA',
                    payment_details: {
                        mpesa_phone_number: formattedPhone
                    }
                });
            }

            Swal.fire({
                title: 'Payment Prompt Sent!',
                text: `An M-Pesa prompt for KSh ${amount.toLocaleString()} has been sent to ${formattedPhone}. Enter your PIN to complete.`,
                icon: 'success'
            }).then(() => {
                onClose();
            });

        } catch (err) {
            console.error('Checkout error:', err);
            const msg = err.response?.data?.error || 'Failed to complete checkout.';
            Swal.fire('Checkout Failed', msg, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 font-light">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 transition"
                >
                    <X className="h-6 w-6" />
                </button>

                {/* Wizard Header */}
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <Building2 className="text-custom-blue w-7 h-7" />
                        School Institutional Plan
                    </h2>
                    <p className="text-gray-500 mt-1">Configure your deployment scale to dynamically calculate the invoice.</p>
                </div>

                {/* Progress Indicators */}
                <div className="flex items-center gap-2 mb-8 px-4">
                    <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-custom-blue' : 'bg-gray-100'}`} />
                    <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-custom-blue' : 'bg-gray-100'}`} />
                    <div className={`flex-1 h-2 rounded-full ${step >= 3 ? 'bg-custom-blue' : 'bg-gray-100'}`} />
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto px-1 pb-4">
                    {/* Step 1: Select Plan */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-900">Select Billing Cycle</h3>
                            {loadingPlans ? (
                                <div className="text-center py-10">
                                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-custom-blue mx-auto" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {plans.map(plan => (
                                        <div 
                                            key={plan.id}
                                            onClick={() => setSelectedPlan(plan)}
                                            className={`border-2 rounded-2xl p-5 cursor-pointer transition-all ${
                                                selectedPlan?.id === plan.id 
                                                    ? 'border-custom-blue bg-blue-50/50' 
                                                    : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <h4 className="font-extrabold text-gray-900">{plan.name}</h4>
                                            <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                                            <div className="mt-4 flex items-center justify-between">
                                                <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full uppercase">
                                                    {plan.duration} Days
                                                </span>
                                                {selectedPlan?.id === plan.id && <CheckCircle2 className="w-5 h-5 text-custom-blue" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Scope Configuration */}
                    {step === 2 && (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                                    <Layers className="w-5 h-5 text-custom-orange" />
                                    Select Streams
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {streams.length === 0 ? <p className="text-sm text-gray-500 col-span-3">No streams configured.</p> : null}
                                    {streams.map(s => (
                                        <label key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedStreams.includes(s.id) ? 'border-custom-blue bg-blue-50/30' : 'border-gray-200'}`}>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedStreams.includes(s.id)}
                                                onChange={() => toggleStream(s.id)}
                                                className="w-4 h-4 text-custom-blue rounded border-gray-300 focus:ring-custom-blue"
                                            />
                                            <span className="text-sm font-semibold text-gray-800">{s.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                                    <BookOpen className="w-5 h-5 text-custom-orange" />
                                    Select Subjects
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {subjects.length === 0 ? <p className="text-sm text-gray-500 col-span-3">No subjects configured.</p> : null}
                                    {subjects.map(s => (
                                        <label key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedSubjects.includes(s.id) ? 'border-custom-blue bg-blue-50/30' : 'border-gray-200'}`}>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedSubjects.includes(s.id)}
                                                onChange={() => toggleSubject(s.id)}
                                                className="w-4 h-4 text-custom-blue rounded border-gray-300 focus:ring-custom-blue"
                                            />
                                            <span className="text-sm font-semibold text-gray-800">{s.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Checkout Summary & Payment */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                <h3 className="text-lg font-black text-gray-900 mb-4">Invoice Summary</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Plan Variant:</span>
                                        <span className="font-bold text-gray-900">{selectedPlan?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Streams Licensed:</span>
                                        <span className="font-bold text-gray-900">{selectedStreams.length} Streams</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Subjects Unlocked:</span>
                                        <span className="font-bold text-gray-900">{selectedSubjects.length} Subjects</span>
                                    </div>
                                    <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                                        <span className="text-base font-bold text-gray-900">Total Price</span>
                                        <span className="text-2xl font-black text-custom-blue">KSh {calculatePrice().toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleCheckout} className="space-y-4 pt-2">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        M-Pesa Phone Number
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                        <input
                                            type="tel"
                                            placeholder="e.g. 254712345678"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required
                                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-custom-blue focus:border-transparent outline-none transition"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> STK push will be securely sent to this number.
                                    </p>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between shrink-0">
                    {step > 1 ? (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                        >
                            Back
                        </button>
                    ) : (
                        <div />
                    )}
                    
                    {step < 3 ? (
                        <button
                            onClick={() => {
                                if (step === 1 && !selectedPlan) {
                                    Swal.fire('Select Plan', 'Please choose a billing cycle first.', 'warning');
                                    return;
                                }
                                if (step === 2 && (selectedStreams.length === 0 || selectedSubjects.length === 0)) {
                                    Swal.fire('Scope Required', 'Please select at least one stream and one subject.', 'warning');
                                    return;
                                }
                                setStep(step + 1);
                            }}
                            className="px-6 py-3 bg-custom-blue text-white text-sm font-bold rounded-xl hover:bg-custom-orange transition flex items-center gap-2 cursor-pointer"
                        >
                            Continue <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleCheckout}
                            disabled={isSubmitting}
                            className="px-8 py-3 bg-custom-orange text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                            {isSubmitting ? 'Processing...' : 'Pay with M-Pesa'} <CreditCard className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SchoolCheckoutModal;
