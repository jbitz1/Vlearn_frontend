import React from "react";
import Card from "../cards/Card";

const TableContainer = ({
    title = null,
    actions = null,
    tableHead,
    tableBody,
    tableFooter = null,
    className="h-full rounded-sm",
    containerClassName="overflow-x-auto relative flex flex-col h-full"
}) => {
    return (
        <Card
            title={title}
            actions={actions}
            footer={tableFooter}
            className={className}
            cardContentClassName="overflow-hidden h-full"
        >
            <div className={containerClassName}>
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50 whitespace-nowrap text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {tableHead}
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {tableBody}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default TableContainer;
