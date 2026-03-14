"use client";

import { addEventExpense, removeEventExpense } from "@/lib/actions/events";
import { formatPrice } from "@/lib/utils";

const EXPENSE_CATEGORIES = ["travel", "lodging", "booth", "food", "supplies", "other"];

interface Expense {
  id: string;
  category: string;
  description: string | null;
  amount: number;
}

interface EventExpensesProps {
  eventId: string;
  expenses: Expense[];
}

export function EventExpenses({ eventId, expenses }: EventExpensesProps) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="bg-warm-white/5 border border-warm-white/10 rounded-lg p-4">
      {/* Existing expenses */}
      {expenses.length > 0 && (
        <div className="space-y-2 mb-4">
          {expenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                <span className="text-xs bg-warm-white/10 text-warm-white/60 px-2 py-0.5 rounded capitalize">
                  {expense.category}
                </span>
                <span className="text-warm-white text-sm">
                  {expense.description || expense.category}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-warm-white/70 text-sm">{formatPrice(expense.amount)}</span>
                <form action={async () => {
                  await removeEventExpense(expense.id, eventId);
                }}>
                  <button type="submit" className="text-rose-gold/50 hover:text-rose-gold text-xs">
                    Remove
                  </button>
                </form>
              </div>
            </div>
          ))}
          <div className="border-t border-warm-white/10 pt-2">
            <span className="text-warm-white font-medium text-sm">Total: {formatPrice(total)}</span>
          </div>
        </div>
      )}

      {/* Add expense form */}
      <form
        action={async (formData) => {
          await addEventExpense(eventId, formData);
        }}
        className="flex gap-2"
      >
        <select
          name="category"
          required
          className="px-2 py-1.5 bg-warm-white/10 border border-warm-white/20 rounded text-warm-white text-sm"
        >
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat} className="capitalize">{cat}</option>
          ))}
        </select>
        <input
          name="description"
          placeholder="Description"
          className="flex-1 px-2 py-1.5 bg-warm-white/10 border border-warm-white/20 rounded text-warm-white text-sm"
        />
        <input
          name="amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="$0.00"
          required
          className="w-24 px-2 py-1.5 bg-warm-white/10 border border-warm-white/20 rounded text-warm-white text-sm"
        />
        <button
          type="submit"
          className="px-3 py-1.5 bg-copper hover:bg-copper-dark text-white rounded text-sm transition-colors"
        >
          Add
        </button>
      </form>
    </div>
  );
}
