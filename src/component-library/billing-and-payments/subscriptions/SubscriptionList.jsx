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
import UseLoaderData from "../../utils/UseLoaderData";
import InvoiceDetails from "../billing/invoices/InvoiceDetails";
import PaymentForm, { MakePaymentDialog } from "../payments/PaymentForm";
import DropDownMenu from "../../dropdown-menus/DropDownMenu";

import { useNavigate } from "react-router";

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

const SubscriptionListItem = ({ subscription }) => {
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
                <MakePaymentDialog
                    component={
                        <button
                            type="button"
                            className="sr-only"
                            ref={payNowButtonRef}
                        >
                            Pay Now
                        </button>
                    }
                    invoiceDetails={subscription?.invoice_details}
                />
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
                                          payNowButtonRef.current.click();
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
            <UseLoaderData
                setData={(data) => {
                    setSubscriptionList(data.responseData.data);
                }}
            />
            <TableContainer
                title={"Subscription History"}
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
                    Boolean(subscriptionList?.length) ? (
                        subscriptionList.map((subscription) => (
                            <SubscriptionListItem
                                key={subscription.id}
                                subscription={subscription}
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
        </Container>
    );
};

export default SubscriptionList;
