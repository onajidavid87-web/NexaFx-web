import { useState } from "react";
import { AdminTransaction, flagTransaction, unflagTransaction } from "@/lib/api/admin";
import { TypeTransaction } from "./TypeTransaction";
import { Flag, X } from "lucide-react";

interface TableTransactionProps {
  transactions: AdminTransaction[];
}

export function TableTransaction({ transactions }: TableTransactionProps) {
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set())
  const [flagDialogId, setFlagDialogId] = useState<string | null>(null)
  const [flagReason, setFlagReason] = useState("")
  const [flagLoading, setFlagLoading] = useState(false)

  const handleFlag = async (id: string) => {
    if (!flagReason.trim()) return
    setFlagLoading(true)
    try {
      await flagTransaction(id, flagReason)
      setFlaggedIds(prev => new Set(prev).add(id))
      setFlagDialogId(null)
      setFlagReason("")
    } catch (err) {
      console.error("Failed to flag transaction", err)
    } finally {
      setFlagLoading(false)
    }
  }

  const handleUnflag = async (id: string) => {
    try {
      await unflagTransaction(id)
      setFlaggedIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    } catch (err) {
      console.error("Failed to unflag transaction", err)
    }
  }

  return (
    <div className="overflow-x-auto w-full max-w-[100vw]">
      <table className="rounded-t-2xl bg-white w-full min-w-[700px] text-left" role="table">
        <thead className="font-bold text-[12px]">
          <tr className="border border-transparent border-b-[#00000033]">
            <th className="py-4 pl-8 hidden sm:table-cell">
              <span className="inline-block rounded-full size-2.5 bg-black mr-3" />
              Amount
            </th>
            <th className="py-4 hidden sm:table-cell">Type</th>
            <th className="py-4">
              <span className="inline-block ml-8 sm:hidden rounded-full size-2.5 bg-black mr-3" />
              Username
            </th>
            <th className="py-4 hidden sm:table-cell">Date</th>
            <th className="py-4">Transaction ID</th>
            <th className="py-4 sm:hidden">Type</th>
            <th className="py-4 text-center">Flag</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-10 text-center text-gray-500">
                No transactions found.
              </td>
            </tr>
          ) : (
            transactions.map((item) => (
              <tr
                key={item.id}
                className={`text-[14px] font-medium ${flaggedIds.has(item.id) ? 'bg-red-50' : ''}`}
              >
                <td className="hidden sm:table-cell font-semibold pl-8 py-5 border border-transparent border-b-[#00000033]">
                  <span className="inline-block rounded-full size-2.5 bg-[#66FF47] mr-3" />
                  {item.currency}
                  <span className="pl-1">{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </td>
                <td className="hidden sm:table-cell py-5 border border-transparent border-b-[#00000033]">
                  <TypeTransaction>{item.type}</TypeTransaction>
                </td>
                <td className="py-5 border border-transparent border-b-[#00000033]">
                  <span className="ml-8 sm:hidden inline-block rounded-full size-2.5 bg-[#66FF47] mr-3" />
                  {item.username}
                </td>
                <td className="hidden sm:table-cell py-5 border border-transparent border-b-[#00000033]">
                  {item.date}
                </td>
                <td className="py-5 border border-transparent border-b-[#00000033]">
                  {item.txId}
                </td>
                <td className="sm:hidden py-5 border border-transparent border-b-[#00000033]">
                  <TypeTransaction>{item.type}</TypeTransaction>
                </td>
                <td className="py-5 border border-transparent border-b-[#00000033] text-center">
                  {flaggedIds.has(item.id) ? (
                    <button
                      onClick={() => handleUnflag(item.id)}
                      className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                      title="Unflag"
                    >
                      <X size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setFlagDialogId(item.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
                      title="Flag transaction"
                    >
                      <Flag size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Flag Reason Dialog */}
      {flagDialogId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setFlagDialogId(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Flag Transaction</h3>
            <textarea
              value={flagReason}
              onChange={e => setFlagReason(e.target.value)}
              placeholder="Reason for flagging..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 min-h-[100px] resize-none"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { setFlagDialogId(null); setFlagReason("") }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleFlag(flagDialogId)}
                disabled={!flagReason.trim() || flagLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {flagLoading ? "Flagging..." : "Flag"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
