import React from 'react';
import { InfoAlert } from '@/components/shared/InfoAlert';
import { DetailRow } from '@/components/shared/DetailRow';

interface TradeDetailsProps {
  tradeType: string;
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: string;
  amountPaidNGN?: string;
  amountPaidUSD?: string;
  amountPaidGBP?: string;
  amountPaidCAD?: string;
  amountToReceiveUSD?: string;
  amountToReceiveNGN?: string;
  amountToReceiveGBP?: string;
  amountToReceiveCAD?: string;
  serviceFee: string;
  totalCharged: string;
  message?: string;
}

export function TradeDetails({
  tradeType,
  fromCurrency,
  toCurrency,
  exchangeRate,
  amountPaidNGN,
  amountPaidUSD,
  amountPaidGBP,
  amountPaidCAD,
  amountToReceiveUSD,
  amountToReceiveNGN,
  amountToReceiveGBP,
  amountToReceiveCAD,
  serviceFee,
  totalCharged,
  message,
}: TradeDetailsProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-(--border-light)">
      <h2 className="text-lg font-bold text-(--text-primary) mb-6">Trade Details</h2>

      <div className="space-y-3">
        <DetailRow
          label="Trade Type:"
          value={<span className="font-semibold">{tradeType}</span>}
        />
        <DetailRow
          label="From Currency:"
          value={<span className="font-semibold">{fromCurrency}</span>}
        />
        <DetailRow
          label="To Currency:"
          value={<span className="font-semibold">{toCurrency}</span>}
        />
        <DetailRow
          label="Exchange Rate:"
          value={<span className="font-semibold">{exchangeRate}</span>}
        />
        <DetailRow
          label={`Amount Paid (${fromCurrency}):`}
          value={<span className="font-bold">{totalCharged}</span>}
        />
        <DetailRow
          label={`Amount to Receive (${toCurrency}):`}
          value={<span className="font-bold text-green-600">{amountToReceiveUSD || amountToReceiveNGN || amountToReceiveGBP || amountToReceiveCAD}</span>}
        />
        <DetailRow
          label="Service Fee:"
          value={<span className="font-semibold">{serviceFee}</span>}
        />
        <div className="pt-2 border-t border-(--border-light)">
          <DetailRow
            label="Total Charged:"
            value={<span className="font-bold text-lg">{totalCharged}</span>}
          />
        </div>
      </div>

      {message && (
        <InfoAlert className="mt-4">
          {message}
        </InfoAlert>
      )}
    </section>
  );
}
