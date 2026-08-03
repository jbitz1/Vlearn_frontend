import React from "react";
import {
    Menu,
    Disclosure,
    DisclosureButton,
    MenuButton,
    MenuItems,
    DisclosurePanel,
    MenuItem,
} from "@headlessui/react";
import { Link } from "react-router";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

// var itemsExample = [
// {
// 	label: "Account settings",
// 	icon: PencilIcon,
// 	onClick: () => {
// 		console.log("Item clicked");
// 	},
// 	url: "/accounts/settings",
//  active: true,
// },
// ];

const DropDownMenu = ({
    component,
    menuItems = [],
    position = "origin-top-right right-0",
}) => {
    return (
        <Menu as="div" className="relative inline-block">
            <MenuButton className="flex items-center w-full cursor-pointer">
                <span className="sr-only">Open Menu</span>
                {component}
            </MenuButton>

            <MenuItems
                anchor="bottom end"
                className="min-w-min whitespace-nowrap z-50 py-1 mt-2 rounded-xs bg-white shadow-lg ring-1 ring-gray-400 ring-opacity-5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-leave:duration-75 data-enter:ease-out data-leave:ease-in"
            >
                {Boolean(menuItems.length) ? (
                    menuItems.map((item, index) =>
                        Boolean(item.nestedMenuItems) ? (
                            <Disclosure key={index}>
                                <div className="px-4 py-2 text-sm flex w-full items-center justify-between space-x-2 text-gray-500 hover:text-gray-700">
                                    {Boolean(!item.onClick && !item.url) ? (
                                        <p className="w-full pointer-events-none">
                                            {item.label}
                                        </p>
                                    ) : (
                                        <>
                                            {Boolean(item.url) ? (
                                                <Link
                                                    to={item.url}
                                                    className="w-full cursor-pointer"
                                                >
                                                    {item.label}
                                                </Link>
                                            ) : (
                                                <p
                                                    className="w-full cursor-pointer"
                                                    onClick={item.onClick}
                                                >
                                                    {item.label}
                                                </p>
                                            )}
                                        </>
                                    )}

                                    <DisclosureButton>
                                        {(props) => (
                                            <>
                                                {Boolean(
                                                    Boolean(props) && props.open
                                                ) ? (
                                                    <ChevronUpIcon className="h-5 w-5" />
                                                ) : (
                                                    <ChevronDownIcon className="h-5 w-5" />
                                                )}
                                            </>
                                        )}
                                    </DisclosureButton>
                                </div>

                                <DisclosurePanel className="text-gray-500">
                                    {item.nestedMenuItems.map((item, index) => (
                                        <MenuItem key={index}>
                                            {({ focus }) => (
                                                <div
                                                    className={classNames(
                                                        Boolean(
                                                            focus || item.active
                                                        )
                                                            ? "bg-gray-100"
                                                            : "text-gray-700",
                                                        "group text-sm cursor-pointer pl-2"
                                                    )}
                                                >
                                                    {Boolean(item.onClick) ? (
                                                        <div
                                                            onClick={
                                                                item.onClick
                                                            }
                                                            className="flex items-center px-4 py-2 "
                                                        >
                                                            {Boolean(
                                                                item.icon
                                                            ) && (
                                                                <span className="mr-2 text-gray-400 group-hover:text-gray-500">
                                                                    <item.icon className="size-5" />
                                                                </span>
                                                            )}
                                                            <span>
                                                                {item.label}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <Link
                                                            to={item.url}
                                                            className="flex items-center px-4 py-2 "
                                                        >
                                                            {Boolean(
                                                                item.icon
                                                            ) && (
                                                                <span className="mr-2 text-gray-400 group-hover:text-gray-500">
                                                                    <item.icon className="size-5" />
                                                                </span>
                                                            )}
                                                            <span>
                                                                {item.label}
                                                            </span>
                                                        </Link>
                                                    )}
                                                </div>
                                            )}
                                        </MenuItem>
                                    ))}
                                </DisclosurePanel>
                            </Disclosure>
                        ) : (
                            <MenuItem key={index}>
                                {({ focus }) => (
                                    <div
                                        className={classNames(
                                            Boolean(focus || item.active)
                                                ? "bg-gray-100"
                                                : "text-gray-700",
                                            "group text-sm cursor-pointer"
                                        )}
                                    >
                                        {Boolean(item.onClick) ? (
                                            <div
                                                onClick={item.onClick}
                                                className="flex items-center px-4 py-2 "
                                            >
                                                {Boolean(item.icon) && (
                                                    <span className="mr-2 text-gray-400 group-hover:text-gray-500">
                                                        <item.icon className="size-5" />
                                                    </span>
                                                )}
                                                <span>{item.label}</span>
                                            </div>
                                        ) : (
                                            <Link
                                                to={item.url}
                                                className="flex items-center px-4 py-2 "
                                            >
                                                {Boolean(item.icon) && (
                                                    <span className="mr-2 text-gray-400 group-hover:text-gray-500">
                                                        <item.icon className="size-5" />
                                                    </span>
                                                )}
                                                <span>{item.label}</span>
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </MenuItem>
                        )
                    )
                ) : (
                    <MenuItem disabled>
                        <p className="p-1 text-gray-400 text-sm">
                            No Options Available
                        </p>
                    </MenuItem>
                )}
            </MenuItems>
        </Menu>
    );
};

export default DropDownMenu;
