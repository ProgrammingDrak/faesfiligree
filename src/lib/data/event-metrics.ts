interface EventExpenseInput {
  amount: number;
}

interface EventSaleInput {
  productId: string;
  quantity: number;
  price: number;
  processingFee?: number | null;
}

interface EventInventoryInput {
  productId: string;
  quantitySold: number;
  priceAtEvent: number;
  partnerCommissionPercent?: number | null;
}

export interface EventMetricInput {
  attendeeCount?: number | null;
  travelHours?: number | null;
  setupHours?: number | null;
  sellingHours?: number | null;
  expenses: EventExpenseInput[];
  sales: EventSaleInput[];
  inventory: EventInventoryInput[];
}

export function calculateEventMetrics(event: EventMetricInput, laborRateCents = 0) {
  const totalExpenses = event.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const grossRevenue = event.sales.reduce(
    (sum, sale) => sum + sale.price * sale.quantity,
    0
  );
  const totalFees = event.sales.reduce(
    (sum, sale) => sum + (sale.processingFee ?? 0),
    0
  );
  const totalUnitsSold = event.sales.reduce((sum, sale) => sum + sale.quantity, 0);
  const travelHours = event.travelHours ?? 0;
  const setupHours = event.setupHours ?? 0;
  const sellingHours = event.sellingHours ?? 0;
  const totalHours = travelHours + setupHours + sellingHours;
  const timeValue = Math.round(totalHours * laborRateCents);

  const inventoryByProductId = new Map(
    event.inventory.map((item) => [item.productId, item])
  );
  const partnerPayout = event.sales.reduce((sum, sale) => {
    const inventoryItem = inventoryByProductId.get(sale.productId);
    const commissionPercent = inventoryItem?.partnerCommissionPercent ?? 0;
    return sum + Math.round(sale.price * sale.quantity * (commissionPercent / 100));
  }, 0);

  const netRevenue = grossRevenue - totalFees - partnerPayout;
  const profitAfterExpenses = netRevenue - totalExpenses;
  const profitAfterTime = profitAfterExpenses - timeValue;
  const attendeeCount = event.attendeeCount ?? null;

  return {
    totalExpenses,
    grossRevenue,
    totalFees,
    totalUnitsSold,
    travelHours,
    setupHours,
    sellingHours,
    totalHours,
    timeValue,
    partnerPayout,
    netRevenue,
    profitAfterExpenses,
    profitAfterTime,
    roi:
      totalExpenses > 0
        ? Math.round((profitAfterExpenses / totalExpenses) * 1000) / 10
        : null,
    hourlyReturn:
      totalHours > 0 ? Math.round(profitAfterExpenses / totalHours) : null,
    costPerAttendee:
      attendeeCount && attendeeCount > 0 ? Math.round(totalExpenses / attendeeCount) : null,
    revenuePerAttendee:
      attendeeCount && attendeeCount > 0 ? Math.round(grossRevenue / attendeeCount) : null,
    costPerSoldUnit:
      totalUnitsSold > 0 ? Math.round(totalExpenses / totalUnitsSold) : 0,
    hoursPerSoldUnit:
      totalUnitsSold > 0 ? totalHours / totalUnitsSold : 0,
    timeValuePerSoldUnit:
      totalUnitsSold > 0 ? Math.round(timeValue / totalUnitsSold) : 0,
  };
}

export type EventMetrics = ReturnType<typeof calculateEventMetrics>;
