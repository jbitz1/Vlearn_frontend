import React from "react";
import TableContainer from "../../tables/TableContainer";
import Container from "../../layout/Container";
import Button from "../../butttons/Button";
import CenteredDialog from "../../dialogs/CenteredDialog";
import UseFetcherData from "../../utils/UseFetcherData";
import SelectField from "../../forms/SelectField";
import BillingAddressForm from "../billing/BillingAddressForm";
import Card from "../../cards/Card";
import FormDialog from "../../forms/FormDialog";
import { createFormDataGroup } from "../../forms/FormWrapper";
import EmptyState from "../../utils/EmptyState";
import { EllipsisVerticalIcon, PlusIcon } from "@heroicons/react/24/outline";

import InvoiceDetails from "../billing/invoices/InvoiceDetails";
import PaymentForm, { MakePaymentDialog } from "../payments/PaymentForm";
import DropDownMenu from "../../dropdown-menus/DropDownMenu";

import { useNavigate } from "react-router";
import { LockKeyhole, Phone, X } from "lucide-react";
import Swal from "sweetalert2";
import usePaymentPolling from "../../../hooks/usePaymentPolling";
import apiClient from "../../../config/apiClient";
import UserContext from "../../../Context/UserContext";

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

const AddSubscriptionForm = ({ errors, setErrors, defaultvalues }) => {
    const [subscriptionPlans, setSubscriptionPlans] = React.useState([]);
    const [subScriptionPlanOptions, setSubscriptionPlanOptions] =
        React.useState([]);

    React.useEffect(() => {
        if (subscriptionPlans.length > 0) {
            const options = subscriptionPlans.map((plan) => ({
                value: plan.id,
                label: `${plan.name} - KSh ${plan.price || plan.variants?.[0]?.price || 0}`,
            }));
            setSubscriptionPlanOptions(options);
        }
    }, [subscriptionPlans]);

    const [selectedSubscriptionPlan, setSelectedSubscriptionPlan] =
        React.useState(undefined);

    React.useEffect(() => {
        if (defaultvalues && defaultvalues.plan) {
            let selectedPlan = subscriptionPlans.find(
                (plan) => String(plan.id) === String(defaultvalues.plan)
            );
            setSelectedSubscriptionPlan(selectedPlan);
        }
    }, [defaultvalues, subscriptionPlans]);

    return (
        <>
            <UseFetcherData
                url={"/api/subscriptions/products/?audience=STUDENT"}
                setData={(data) => {
                    let plans = data?.responseData?.results || data?.responseData?.data || data?.responseData;
                    if (plans && !Array.isArray(plans) && plans.results) {
                        plans = plans.results;
                    }
                    if (!Array.isArray(plans)) {
                        plans = [];
                    }
                    setSubscriptionPlans(plans);
                }}
            />
            <div className="flex flex-col space-y-3">
                <SelectField
                    name={"plan"}
                    label={"Subscription Plan"}
                    options={subScriptionPlanOptions}
                    error={Boolean(errors?.subscription_details?.plan)}
                    helpText={errors?.subscription_details?.plan}
                    defaultValue={selectedSubscriptionPlan?.id || ""}
                    onChange={(value) => {
                        let selectedPlan = subscriptionPlans.find(
                            (plan) => String(plan.id) === String(value)
                        );
                        setSelectedSubscriptionPlan(selectedPlan);
                    }}
                    internalControlledField={false}
                />
                <Card title={"Billing Address"}>
                    <BillingAddressForm errors={errors?.billing_address} />
                </Card>
            </div>
            <PaymentForm

                errors={errors?.invoice_payment_transaction}
                setErrors={setErrors}
                amount={selectedSubscriptionPlan?.price}
            />
        </>
    );
};

const AddSubscriptionDialog = () => {
    const navigate = useNavigate();
    return (
        <Button onClick={() => navigate("/subscription")}>
            <PlusIcon className="size-4 mr-1" /> Add Subscription
        </Button>
    );
};

const SubscriptionListItem = ({ subscription, onPayNow }) => {
    const status = {
        Active: "text-green-700 bg-green-50 ring-green-600/20",
        Pending: "text-gray-700 bg-gray-50 ring-gray-600/20",
        Expired: "text-red-700 bg-red-50 ring-red-600/20",
        Inactive: "text-red-700 bg-red-50 ring-red-600/20",
    };
    const viewInvoiceButtonRef = React.useRef(null);
    const payNowButtonRef = React.useRef(null);
    return (
        <tr>
            <td className="px-3 py-4 text-left whitespace-nowrap">
                {subscription.plan_name}
            </td>
            <td className="px-3 py-4 text-left">
                {subscription.invoice_details?.total_amount}
            </td>
            <td className="px-3 py-4 text-left">
                <div className="flex items-center justify-start">
                    <p
                        className={classNames(
                            status[subscription.status] ||
                                "text-gray-700 bg-gray-50 ring-gray-600/20",
                            "rounded-full whitespace-nowrap px-2 py-0.5 text-sm font-medium ring-1 ring-inset min-w-10 flex "
                        )}
                    >
                        {subscription.status}
                    </p>
                </div>
            </td>
            <td className="px-3 py-4 text-left whitespace-nowrap">
                {subscription.start_date || "-"}
            </td>
            <td className="px-3 py-4 text-left whitespace-nowrap">
                {subscription.end_date || "-"}
            </td>
            <td className="px-3 py-4 text-left whitespace-nowrap">
                <CenteredDialog
                    component={
                        <button
                            type="button"
                            ref={viewInvoiceButtonRef}
                            className="sr-only"
                        >
                            Invoice
                        </button>
                    }
                    size="lg"
                >
                    <InvoiceDetails invoice={subscription?.invoice_details} />
                </CenteredDialog>
                
                <DropDownMenu
                    component={<EllipsisVerticalIcon className="size-5" />}
                    menuItems={
                        Boolean(
                            subscription?.invoice_details?.status == "PENDING"
                        )
                            ? [
                                  {
                                      label: "View Invoice",
                                      onClick: () => {
                                          viewInvoiceButtonRef.current.click();
                                      },
                                  },
                                  {
                                      label: "Pay Now",
                                      onClick: () => {
                                          onPayNow(subscription);
                                      },
                                  },
                              ]
                            : [
                                  {
                                      label: "View Invoice",
                                      onClick: () => {
                                          viewInvoiceButtonRef.current.click();
                                      },
                                  },
                              ]
                    }
                />
            </td>
        </tr>
    );
};


const SubscriptionList = () => {
    const [subscriptionList, setSubscriptionList] = React.useState([]);
    const [allowAdding, setAllowAdding] = React.useState(true);
    
    // Payment state
    const { user } = React.useContext(UserContext);
    const [selectedSubToPay, setSelectedSubToPay] = React.useState(null);
    const [phone, setPhone] = React.useState("");
    const [submittingPayment, setSubmittingPayment] = React.useState(false);
    const [pollingInvoiceNumber, setPollingInvoiceNumber] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        if (user?.id) {
            setIsLoading(true);
            apiClient.get(`/api/subscriptions/users/${user.id}/subscriptions/`)
                .then(res => {
                    const data = res.data?.responseData?.data || res.data?.data || res.data?.results || res.data;
                    if (Array.isArray(data)) {
                        setSubscriptionList(data);
                    }
                })
                .catch(err => console.error("Failed to fetch subscriptions:", err))
                .finally(() => setIsLoading(false));
        }
    }, [user]);
    
    const { pollingStatus, secondsRemaining } = usePaymentPolling(
        pollingInvoiceNumber,
        () => {
            setPollingInvoiceNumber(null);
            Swal.fire({
                title: '✅ Payment Confirmed!',
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
                text: 'We haven’t received confirmation yet. It will activate automatically once confirmed.',
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
            
            await apiClient.post(`/api/billing-and-payments/invoices/${invoiceId}/payment-transactions/`, {
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

        <Container className="flex flex-col space-y-4">

            <TableContainer
                title={"Subscription History"}
                containerClassName="overflow-x-auto relative flex flex-col h-full"
                actions={allowAdding && <AddSubscriptionDialog />}
                tableHead={
                    <tr>
                        <th className="px-3 py-4 text-left">Plan</th>
                        <th className="px-3 py-4 text-left">Amount</th>
                        <th className="px-3 py-4 text-left">Status</th>
                        <th className="px-3 py-4 text-left">Start Date</th>
                        <th className="px-3 py-4 text-left">End Date</th>
                        <th className="px-3 py-4 text-left">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                }
                tableBody={
                    isLoading ? (
                        <tr>
                            <td colSpan={6} className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-custom-blue mx-auto" />
                            </td>
                        </tr>
                    ) : Boolean(subscriptionList?.length) ? (
                        subscriptionList.map((subscription) => (
                            <SubscriptionListItem
                                key={subscription.id}
                                subscription={subscription}
                                onPayNow={setSelectedSubToPay}
                            />
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="text-center">
                                <EmptyState
                                    title="No Subscription Found"
                                    message={
                                        "No previous or current subscription found."
                                    }
                                />
                            </td>
                        </tr>
                    )
                }
            />
        
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
                                    `Pay KSh ${selectedSubToPay?.invoice_details?.total_amount}`
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
                                        style={{ width: `${(secondsRemaining / 100) * 100}%` }}
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


export default SubscriptionList;
