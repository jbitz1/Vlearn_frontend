import React from "react";
import { CheckIcon } from "@heroicons/react/20/solid";
import EmptyState from "../../utils/EmptyState";
import Button from "../../butttons/Button";
import UseFetcherData from "../../utils/UseFetcherData";

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

const SubscriptionPlanList = ({ onSelect }) => {
    const [subscriptionPlans, setSubscriptionPlans] = React.useState([]);

    return (
        <div className="bg-white min-h-80">
            <UseFetcherData
                url={"/billing-and-payments/subscriptions/plans/list"}
                setData={(data) => {
                    setSubscriptionPlans(data.responseData.data);
                }}
            />
            {Boolean(subscriptionPlans.length) ? (
                <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                    {subscriptionPlans.map((plan) => (
                        <div
                            key={plan.id}
                            className={classNames(
                                plan.details?.most_popular
                                    ? "ring-2 ring-primary-palette-600"
                                    : "ring-1 ring-gray-200",
                                "rounded-3xl p-8 xl:p-10"
                            )}
                        >
                            <div className="flex items-center justify-between whitespace-nowrap gap-x-4">
                                <h3
                                    id={plan.id}
                                    className={classNames(
                                        plan.details?.most_popular
                                            ? "text-primary-palette-600"
                                            : "text-gray-900",
                                        "text-lg/8 font-semibold"
                                    )}
                                >
                                    {plan.name}
                                </h3>
                                {/* Hidden for now: Most popular badge */}
                                {false && plan.details?.most_popular ? (
                                    <p className="rounded-full bg-primary-palette-600/10 px-2.5 py-1 text-xs/5 font-semibold text-primary-palette-600">
                                        Most popular
                                    </p>
                                ) : null}
                            </div>
                            <p className="mt-4 text-sm/6 text-gray-600">
                                {plan.description}
                            </p>
                            <p className="mt-6 flex items-baseline gap-x-1">
                                <span className="text-4xl font-semibold tracking-tight text-gray-900">
                                    {plan.price}
                                </span>
                                <span className="text-sm/6 font-semibold text-gray-600">
                                    /month
                                </span>
                            </p>
                            <Button
                                variant={
                                    plan.details?.most_popular
                                        ? "contained"
                                        : "outlined"
                                }
                                className="w-full mt-6"
                                onClick={() => {
                                    if (onSelect) {
                                        onSelect(plan);
                                    }
                                }}
                            >
                                Get Plan
                            </Button>

                            <ul
                                role="list"
                                className="mt-8 space-y-3 text-sm/6 text-gray-600 xl:mt-10"
                            >
                                {plan?.details?.features?.map((feature) => (
                                    <li key={feature} className="flex gap-x-3">
                                        <CheckIcon
                                            aria-hidden="true"
                                            className="h-6 w-5 flex-none text-primary-palette-600"
                                        />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState
                    title="No Plans Found."
                    message={"No subscription plans currently available."}
                />
            )}
        </div>
    );
};

export default SubscriptionPlanList;
