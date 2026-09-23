/**
 * Pubali Bank PLC - Biometric Access Control & Attendance System (BioStar 2)
 * TypeScript Data Contract for Enterprise Attendance Report Hub
 * Endpoint: /api/v1/reports/attendance
 */

export type ReportType = 'group' | 'branch' | 'sub-branch' | 'ro' | 'head-office';

export type VerificationMode = 'ALL' | 'FINGERPRINT' | 'CARD' | 'MULTI';

export type EventResult = 'VERIFIED' | 'DENIED' | 'TAMPER';

export type PunchDirection = 'IN' | 'OUT' | 'ACCESS_ROOM';

export interface AttendanceReportQueryParams {
  /** The hierarchy level of the report */
  report_type: ReportType;
  /** Specific identifier: branch code (e.g. "0101"), zone name (e.g. "Dhaka Central"), group ID ("AG-PB-001"), or "ALL" */
  scope_id: string;
  /** ISO Date YYYY-MM-DD */
  start_date: string;
  /** ISO Date YYYY-MM-DD */
  end_date: string;
  /** Biometric modality filter */
  verify_mode?: VerificationMode;
  /** Status classification */
  status?: 'ALL' | 'NORMAL' | 'DENIED' | 'TAMPER';
  /** Format of output: json or streaming csv/excel */
  format?: 'json' | 'csv' | 'excel';
  /** Pagination offset */
  page?: number;
  /** Page size limit */
  limit?: number;
}

export interface AttendanceRecord {
  logId: string;
  timestamp: string; // ISO 8601 or YYYY-MM-DD HH:mm:ss
  userId: string;
  userName: string;
  department: string;
  systemRole: string;
  branchCode: string;
  branchName: string;
  zone: string;
  deviceId: string;
  deviceModel: string;
  doorName: string;
  punchType: PunchDirection;
  verifyMode: VerificationMode;
  result: EventResult;
  temperatureC?: number;
  maskDetected?: boolean;
}

export interface AttendanceReportSummary {
  totalRecords: number;
  uniqueEmployees: number;
  verifiedPunches: number;
  accessDenied: number;
  tamperAlerts: number;
  attendanceRate: string; // e.g. "97.8%"
}

export interface AttendanceReportMeta {
  reportType: ReportType;
  scopeId: string;
  scopeName?: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  filtersApplied: {
    verifyMode: VerificationMode;
    status: string;
  };
  bank: 'Pubali Bank PLC';
  serverNode: string;
  executionTimeMs: number;
  generatedAt: string;
}

export interface AttendanceReportResponse {
  success: boolean;
  meta: AttendanceReportMeta;
  summary: AttendanceReportSummary;
  records: AttendanceRecord[];
}
