import { useState, useEffect, useRef } from 'react';
import apiClient from '../config/apiClient';

/**
 * Custom hook for polling an invoice payment status.
 *
 * @param {string|null} invoiceNumber - The invoice number to poll. Pass null to disable polling.
 * @param {Function} onSuccess - Callback invoked when payment is confirmed (invoice_status === 'PAID').
 * @param {Function} onFailure - Callback invoked when payment explicitly fails (transaction_status === 'FAILED').
 * @param {Function} onTimeout - Callback invoked when 100s polling window elapses without resolution.
 * @returns {{ pollingStatus: 'IDLE'|'POLLING'|'PAID'|'CANCELLED'|'TIMEOUT', secondsRemaining: number }}
 */
const usePaymentPolling = (invoiceNumber, onSuccess, onFailure, onTimeout) => {
    const [pollingStatus, setPollingStatus] = useState('IDLE');
    const [secondsRemaining, setSecondsRemaining] = useState(100);
    const intervalRef = useRef(null);
    const pollCountRef = useRef(0);
    const MAX_POLLS = 40;
    const POLL_INTERVAL_MS = 2500;

    useEffect(() => {
        if (!invoiceNumber) {
            setPollingStatus('IDLE');
            setSecondsRemaining(100);
            return;
        }

        setPollingStatus('POLLING');
        setSecondsRemaining(100);
        pollCountRef.current = 0;

        const poll = async () => {
            pollCountRef.current += 1;
            setSecondsRemaining(prev => Math.max(0, prev - (POLL_INTERVAL_MS / 1000)));

            if (pollCountRef.current > MAX_POLLS) {
                clearInterval(intervalRef.current);
                setPollingStatus('TIMEOUT');
                onTimeout?.();
                return;
            }

            try {
                const res = await apiClient.get(`/api/billing-and-payments/invoices/${invoiceNumber}/status/`);
                const { invoice_status, transaction_status, is_active } = res.data;

                if (invoice_status === 'PAID' || transaction_status === 'COMPLETED') {
                    clearInterval(intervalRef.current);
                    setPollingStatus('PAID');
                    onSuccess?.({ invoice_status, transaction_status, is_active });
                } else if (transaction_status === 'FAILED') {
                    clearInterval(intervalRef.current);
                    setPollingStatus('CANCELLED');
                    onFailure?.();
                }
                // Otherwise: still PENDING, keep polling
            } catch (err) {
                // Network errors during polling are non-fatal — keep trying
                console.warn('Polling request failed:', err.message);
            }
        };

        intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

        return () => {
            clearInterval(intervalRef.current);
        };
    }, [invoiceNumber]);

    return { pollingStatus, secondsRemaining };
};

export default usePaymentPolling;
