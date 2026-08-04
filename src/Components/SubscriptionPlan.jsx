import { useEffect, useState, useContext } from 'react';
import apiClient from '../config/apiClient';
import UserContext from '../Context/UserContext';
import { GraduationCap, LockKeyhole, ArrowLeft, CheckCircle2, Phone, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router';
import Swal from 'sweetalert2';
import usePaymentPolling from '../hooks/usePaymentPolling';

const SubscriptionPlan = () => {
    const { token, user } = useContext(UserContext);
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // Selected plan state for Payment Modal
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [phone, setPhone] = useState('');
    const [submittingPayment, setSubmittingPayment] = useState(false);

    const [pollingInvoiceNumber, setPollingInvoiceNumber] = useState(null);
    const { pollingStatus, secondsRemaining } = usePaymentPolling(
        pollingInvoiceNumber,
        () => {
            // Payment confirmed
            setPollingInvoiceNumber(null);
            Swal.fire({
                title: '\u2705 Payment Confirmed!',
                text: 'Your subscription is now active. You have full access to VizLearn.',
                icon: 'success',
                confirmButtonColor: '#1E40AF'
            }).then(() => navigate('/billing-and-payments/subscriptions'));
        },
        () => {
            // Explicit failure
            setPollingInvoiceNumber(null);
            Swal.fire('Payment Failed', 'Your M-Pesa payment was not completed. Please try again.', 'error');
        },
        () => {
            // Timeout — user might still complete it later
            setPollingInvoiceNumber(null);
            Swal.fire({
                title: 'Awaiting Payment',
                text: 'We haven\u2019t received confirmation yet. Your subscription will activate automatically once payment is confirmed.',
                icon: 'info',
                confirmButtonColor: '#1E40AF'
            }).then(() => navigate('/billing-and-payments/subscriptions'));
        }
    );

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await apiClient.get('/api/subscriptions/products/?audience=STUDENT');
                const rawProducts = response.data.results || response.data || [];
                const formattedPlans = [];

                rawProducts.forEach(prod => {
                    if (prod.variants && prod.variants.length > 0) {
                        prod.variants.forEach(variant => {
                            if (variant.is_active === false) return;
                            const standardPrice = parseFloat(variant.standard_price || variant.price || 0);
                            const effectivePrice = parseFloat(variant.effective_price || variant.price || 0);
                            const promo = variant.promotion;

                            formattedPlans.push({
                                id: prod.id,
                                variantId: variant.id,
                                name: variant.name,
                                productName: prod.name,
                                price: effectivePrice,
                                standardPrice: standardPrice,
                                hasPromo: !!(promo && promo.eligible),
                                promoDetails: promo,
                                displayPrice: `KSh ${effectivePrice.toLocaleString()}`,
                                displayStandardPrice: `KSh ${standardPrice.toLocaleString()}`,
                                duration: variant.duration_days === 1 ? 'day' :
                                    variant.duration_days === 30 ? 'month' :
                                        variant.duration_days === 365 ? 'year' :
                                            `${variant.duration_days || 30} days`,
                                features: variant.access_scopes && variant.access_scopes.length > 0 ?
                                    variant.access_scopes.map(s => s.description || (s.scope_type === 'SUBJECT' ? 'Selected Subject Curriculum Access' : 'Full Platform Access')) : [
                                    'Selected Curriculum & Topic Access',
                                    'Interactive Science Simulations',
                                    'Progress Analytics & Performance Tracking'
                                ],
                                popular: variant.slug === 'monthly-standard',
                            });
                        });
                    }
                });

                setPlans(formattedPlans);
            } catch (err) {
                console.error('Error fetching plans:', err);
                setError('Failed to load subscription plans.');
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, [token]);

    const handleSelectPlan = (plan) => {
        if (!token) {
            Swal.fire({
                title: 'Login Required',
                text: 'Please log in to purchase a subscription plan.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Log In',
                confirmButtonColor: '#1E40AF',
            }).then((res) => {
                if (res.isConfirmed) {
                    navigate('/login');
                }
            });
            return;
        }
        setSelectedPlan(plan);
    };

    const handleInitiatePayment = async (e) => {
        e.preventDefault();
        if (!phone || phone.trim().length < 9) {
            Swal.fire('Invalid Phone Number', 'Please enter a valid M-Pesa phone number (e.g. 254712345678).', 'error');
            return;
        }

        let formattedPhone = phone.trim();
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '254' + formattedPhone.slice(1);
        } else if (formattedPhone.startsWith('+')) {
            formattedPhone = formattedPhone.slice(1);
        }

        setSubmittingPayment(true);
        try {
            // Call subscription checkout endpoint
            const res = await apiClient.post('/api/subscriptions/checkout/', {
                product_variant_id: selectedPlan.variantId || selectedPlan.id,
                billing_address: {
                    full_name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || 'Learner',
                    phone_number: formattedPhone,
                    email: user?.email || 'billing@vlearn.app'
                }
            });

            const data = res.data;
            const invoiceId = data.invoice_number || data.invoice_id;
            // Initiate M-Pesa STK push for the generated invoice if available
            if (invoiceId) {
                await apiClient.post(`/api/billing-and-payments/invoices/${invoiceId}/payment-transactions/`, {
                    amount: data.amount || selectedPlan.price,
                    payment_method: 'MPESA',
                    payment_details: {
                        mpesa_phone_number: formattedPhone
                    }
                });
            }

            setSelectedPlan(null);
            setPollingInvoiceNumber(invoiceId);

        } catch (err) {
            console.error('Payment checkout error:', err);
            const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to initiate M-Pesa checkout. Please try again.';
            Swal.fire('Payment Failed', msg, 'error');
        } finally {
            setSubmittingPayment(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-2 sm:px-4 lg:px-6 font-light">
            {/* Header */}
            <div className="max-w-7xl mx-auto text-center mb-10">
                <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl text-gray-900">
                    VizLearn Subscription Plans
                </h1>
                <p className="mt-5 max-w-xl mx-auto text-xl text-gray-600">
                    Choose the plan that works best for your learning journey
                </p>
            </div>

            {/* Loading and Error State */}
            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-blue mx-auto" />
                    <p className="mt-4 text-gray-600">Loading subscription plans...</p>
                </div>
            ) : error ? (
                <div className="text-center text-red-600">{error}</div>
            ) : (
                <div className="max-w-7xl mx-auto grid gap-8 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative flex flex-col rounded-3xl border border-gray-200 bg-white p-8 shadow-sm ${plan.popular ? 'border-custom-blue ring-2 ring-custom-blue' : ''}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-custom-blue px-3 py-2 text-center text-sm font-semibold text-white">
                                    Most Popular
                                </div>
                            )}

                            <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                            <div className="mt-4 flex items-baseline">
                                <span className="text-4xl font-extrabold tracking-tight text-gray-900">{plan.displayPrice}</span>
                                <span className="ml-1 text-xl font-semibold text-gray-500">/{plan.duration}</span>
                            </div>

                            <ul className="mt-6 space-y-4 flex-1">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex">
                                        <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-custom-orange" />
                                        <span className="ml-3 text-gray-600">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                type="button"
                                className="mt-8 block w-full rounded-3xl py-3 px-6 text-center font-semibold bg-custom-blue text-white hover:bg-custom-orange transition-colors cursor-pointer"
                                onClick={() => handleSelectPlan(plan)}
                            >
                                Select Plan
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Payment Modal */}
            {selectedPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setSelectedPlan(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <div className="text-center mb-6">
                            <span className="inline-block p-3 bg-blue-50 text-custom-blue rounded-full mb-3">
                                <LockKeyhole className="h-8 w-8" />
                            </span>
                            <h3 className="text-2xl font-bold text-gray-900">M-Pesa Checkout</h3>
                            <p className="text-gray-500 text-sm mt-1">
                                You selected <strong className="text-gray-800">{selectedPlan.name}</strong> ({selectedPlan.displayPrice})
                            </p>
                        </div>

                        <form onSubmit={handleInitiatePayment} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    M-Pesa Phone Number
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                    <input
                                        type="tel"
                                        placeholder="e.g. 254712345678 or 0712345678"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-custom-blue focus:border-transparent outline-none"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">An STK push request will be sent to this phone number.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={submittingPayment}
                                className="w-full py-3.5 px-6 rounded-2xl font-semibold bg-custom-blue text-white hover:bg-custom-orange transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                {submittingPayment ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                                        Sending STK Push...
                                    </>
                                ) : (
                                    `Pay ${selectedPlan.displayPrice}`
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Payment Confirmation Waiting Modal */}
            {pollingInvoiceNumber && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
                        {pollingStatus === 'POLLING' ? (
                            <>
                                <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-custom-blue mx-auto mb-5" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Waiting for Payment</h3>
                                <p className="text-gray-500 text-sm mb-4">
                                    Enter your M-Pesa PIN on your phone to complete the payment.
                                </p>
                                <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                                    <div
                                        className="bg-custom-blue h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${(secondsRemaining / 100) * 100}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-400">{Math.round(secondsRemaining)}s remaining</p>
                                <button
                                    onClick={() => setPollingInvoiceNumber(null)}
                                    className="mt-5 text-sm text-gray-400 hover:text-gray-600 underline"
                                >
                                    Cancel and check later
                                </button>
                            </>
                        ) : null}
                    </div>
                </div>
            )}

            {/* Why Choose VizLearn section */}
            <div className="mt-12 bg-blue-50 rounded-3xl shadow-md p-8 font-light">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Why Choose VizLearn?</h2>
                <p className="text-gray-600 mb-6 text-center max-w-4xl mx-auto">
                    Our subscription plans are designed to provide flexible learning options for every type of student.
                    Whether you're just starting out or looking to master advanced concepts, we have a plan that fits your needs.
                </p>
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <div className="flex items-start">
                        <GraduationCap className="text-white h-12 w-12 bg-custom-orange p-2 rounded-full flex-shrink-0" />
                        <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">Learn at Your Pace</h3>
                            <p className="mt-1 text-gray-600">
                                Access courses anytime, anywhere with our mobile-friendly platform.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start">
                        <LockKeyhole className="text-white h-12 w-12 bg-custom-orange p-2 rounded-full flex-shrink-0" />
                        <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">Secure M-Pesa Payment</h3>
                            <p className="mt-1 text-gray-600">
                                Direct M-Pesa STK push integration ensures safe, instant subscription activation.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex text-center mx-auto mt-6">
                <Link to="/dashboard" className="flex items-center bg-custom-blue px-6 py-3 rounded-full mx-auto text-white hover:bg-custom-orange transition-colors">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">Back to Dashboard</span>
                </Link>
            </div>
        </div>
    );
};

export default SubscriptionPlan;
