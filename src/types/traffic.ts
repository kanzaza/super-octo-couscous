export interface TrafficFineRecord {
  id: string;
  paymentDate: string; // e.g. "01/09/2569"
  ticketDate: string;  // e.g. "18/08/2569"
  ticketNumber: string;
  legalSection: string;
  offense: string;
  amount: number;
  paymentChannel: string; // "KTB Mobile Banking" | "STATION"
  citizenId: string;
  payerName: string;
  helmetCode: string;
  officerName: string;
  actType: string; // "พ.ร.บ.รถยนต์" | "พ.ร.บ.จราจรทางบก" | "พ.ร.บ.ขนส่ง"
}

export interface OfficerSummary {
  officerName: string;
  helmetCode: string;
  ticketCount: number;
  totalAmount: number;
  avgFine: number;
  actDistribution: Record<string, number>;
}

export interface OffenseCategorySummary {
  offense: string;
  count: number;
  totalAmount: number;
  actType: string;
}

export interface DateSummary {
  date: string;
  count: number;
  totalAmount: number;
  ktbAmount: number;
  stationAmount: number;
}
