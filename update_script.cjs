const fs = require('fs');
const file = '/home/jason-bitega/Desktop/VL/vlearn_repositories/Vlearn_frontend/src/component-library/billing-and-payments/subscriptions/SubscriptionList.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add imports
content = content.replace(
    'import { useNavigate } from "react-router";',
    `import { useNavigate } from "react-router";
import { LockKeyhole, Phone, X } from "lucide-react";
import Swal from "sweetalert2";
import usePaymentPolling from "../../../hooks/usePaymentPolling";
import apiClient from "../../../config/apiClient";
import UserContext from "../../../Context/UserContext";`
);

// Update SubscriptionListItem
content = content.replace(
    'const SubscriptionListItem = ({ subscription }) => {',
    'const SubscriptionListItem = ({ subscription, onPayNow }) => {'
);
content = content.replace(
    `                                      label: "Pay Now",
                                      onClick: () => {
                                          payNowButtonRef.current.click();
                                      },`,
    `                                      label: "Pay Now",
                                      onClick: () => {
                                          onPayNow(subscription);
                                      },`
);

// We should remove the old MakePaymentDialog
content = content.replace(/<MakePaymentDialog[\s\S]*?\/>/, '');

// Update SubscriptionList
const listHeaderRegex = /const SubscriptionList = \(\) => {[\s\S]*?return \(/;
const match = content.match(listHeaderRegex);

if (match) {
    const listLogic = `
const SubscriptionList = () => {
    const [subscriptionList, setSubscriptionList] = React.useState([]);
    const [allowAdding, setAllowAdding] = React.useState(true);
    
    // Payment state
    const { user } = React.useContext(UserContext);
    const [selectedSubToPay, setSelectedSubToPay] = React.useState(null);
    const [phone, setPhone] = React.useState("");
    const [submittingPayment, setSubmittingPayment] = React.useState(false);
    const [pollingInvoiceNumber, setPollingInvoiceNumber] = React.useState(null);
    
    const { pollingStatus, secondsRemaining } = usePaymentPolling(
        pollingInvoiceNumber,
        () => {
            setPollingInvoiceNumber(null);
            Swal.fire({
                title: '\u2705 Payment Confirmed!',
                text: 'Your subscription is now active.',
                icon: 'success',
                confirmButtonColor: '#1E40AF'
            }).then(() => window.location.reload());
        },
        () => {
            setPollingInvoiceNumber(null);
            Swal.fire('Payment Failed', 'Your M-Pesa payment was not completed.', 'error');
        },
        () => {
            setPollingInvoiceNumber(null);
            Swal.fire({
                title: 'Awaiting Payment',
                text: 'We haven\u2019t received confirmation yet. It will activate automatically once confirmed.',
                icon: 'info',
                confirmButtonColor: '#1E40AF'
            }).then(() => window.location.reload());
        }
    );

    const handleInitiatePayment = async (e) => {
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

        setSubmittingPayment(true);
        try {
            const invoiceId = selectedSubToPay?.invoice_details?.invoice_number || selectedSubToPay?.invoice_details?.id;
            const amount = selectedSubToPay?.invoice_details?.total_amount;
            
            await apiClient.post(\`/api/billing-and-payments/invoices/\${invoiceId}/payment-transactions/\`, {
                amount: amount,
                payment_method: 'MPESA',
                payment_details: {
                    mpesa_phone_number: formattedPhone
                }
            });

            setSelectedSubToPay(null);
            setPollingInvoiceNumber(invoiceId);
        } catch (err) {
            console.error('Payment checkout error:', err);
            const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to initiate M-Pesa checkout.';
            Swal.fire('Payment Failed', msg, 'error');
        } finally {
            setSubmittingPayment(false);
        }
    };

    React.useEffect(() => {
        if (subscriptionList.length > 0) {
            const hasActiveSubscription = subscriptionList.some(
                (subscription) =>
                    subscription.status === "Active" ||
                    subscription.status === "Pending"
            );
            setAllowAdding(!hasActiveSubscription);
        } else {
            setAllowAdding(true);
        }
    }, [subscriptionList]);
    
    return (
`;
    content = content.replace(match[0], listLogic);
}

const listRenderRegex = /<SubscriptionListItem[\s\S]*?subscription={subscription}[\s\S]*?\/>/;
content = content.replace(
    listRenderRegex, 
    `<SubscriptionListItem
                                key={subscription.id}
                                subscription={subscription}
                                onPayNow={setSelectedSubToPay}
                            />`
);

const endRegex = /<\/Container>\s*\);\s*};/;
const modalUi = `
            {selectedSubToPay && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setSelectedSubToPay(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <div className="text-center mb-6">
                            <span className="inline-block p-3 bg-blue-50 text-custom-blue rounded-full mb-3">
                                <LockKeyhole className="h-8 w-8" />
                            </span>
                            <h3 className="text-2xl font-bold text-gray-900">M-Pesa Checkout</h3>
                            <p className="text-gray-500 text-sm mt-1">
                                You are paying for <strong className="text-gray-800">{selectedSubToPay.plan_name}</strong> (KSh {selectedSubToPay?.invoice_details?.total_amount})
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
                                    \`Pay KSh \${selectedSubToPay?.invoice_details?.total_amount}\`
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {pollingInvoiceNumber && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center animate-in fade-in zoom-in duration-200">
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
                                        style={{ width: \`\${(secondsRemaining / 100) * 100}%\` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-400">{Math.round(secondsRemaining)}s remaining</p>
                                <button
                                    onClick={() => setPollingInvoiceNumber(null)}
                                    className="mt-5 text-sm text-gray-400 hover:text-gray-600 underline cursor-pointer"
                                >
                                    Cancel and check later
                                </button>
                            </>
                        ) : null}
                    </div>
                </div>
            )}
        </Container>
    );
};
`;
content = content.replace(endRegex, modalUi);

fs.writeFileSync(file, content);
console.log('Update complete');
