export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  BUSINESS_ADMIN = 'BUSINESS_ADMIN',
  BUSINESS_USER = 'BUSINESS_USER',
  RBL = 'RBL',
  SM = 'SM',
  TRADE_MARKETING = 'TRADE_MARKETING',
  FINANCE = 'FINANCE',
  FINANCE_ADMIN = 'FINANCE_ADMIN',
  ASM = 'ASM',
  ASE = 'ASE',
  CSO = 'CSO',
  SALES_EXECUTIVE = 'SALES_EXECUTIVE',
  OUTLET = 'OUTLET',
  DISTRIBUTOR = 'DISTRIBUTOR',
  DISTRIBUTOR_MANAGER = 'DISTRIBUTOR_MANAGER',
  SUPPORT = 'SUPPORT'
}

export enum OutletStatus {
  PROSPECT = 'Prospect',
  RECCE_DONE = 'Recce Done',
  APPROVED = 'Approved',
  ENROLLED = 'Enrolled',
  INSTALLED = 'Installed',
  ACTIVE = 'Active',
  AUDIT_REQUIRED = 'Audit Required',
  SUSPENDED = 'Suspended',
  ARCHIVED = 'Archived',
  INACTIVE = 'Inactive'
}

export enum OutletClassification {
  PLATINUM = 'Platinum',
  DIAMOND = 'Diamond',
  GOLD = 'Gold',
  SILVER = 'Silver'
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  businessId?: string;
  locationId?: string;
  status?: string;
  createdAt?: string;
  dmsId?: string | null;
  manager?: { id: string; name: string; phone: string } | null;
}

export interface UserMeResponse {
  success: boolean;
  data: User;
  timestamp: string;
}

// --- Hierarchy Types ---
export interface HierarchyMember {
  id: string;
  name: string;
  phone: string;
  role: string;
}

export interface UserHierarchy {
  self: HierarchyMember;
  parents: HierarchyMember[];
  siblings: HierarchyMember[];
  children: HierarchyMember[];
}

export interface HierarchyRelation {
  id: string;
  businessId: string;
  parentUserId: string;
  parentUserName: string;
  parentUserRole: string;
  childUserId: string;
  childUserName: string;
  childUserRole: string;
  relationType: string;
  locationId: string;
}

// --- API Auth Types ---

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface LoginOtpRequest {
  phone: string;
}

export interface LoginOtpVerifyRequest {
  phone: string;
  otp: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    role: string;
    userId: string;
  };
  error?: string;
  timestamp: string;
}

export interface OtpSendResponse {
  success: boolean;
  data: string; // "OTP sent successfully"
  timestamp: string;
}

// ----------------------

export interface OutletPhoto {
  id: string;
  photoUrl: string;
  photoType: string;
  uploadedAt: string;
  uploadedByName: string;
}

export interface ComplianceImage {
  id: string;
  imageUrl: string;
  imageType: string;
}

export interface ComplianceRecord {
  id: string;
  outletId: string;
  coolerInstalled: boolean;
  serialNo: string;
  coolerType: string;
  capacity: string;
  signageInstalled: boolean;
  verified: boolean;
  uploadedAt: string;
  uploadedByName: string;
  verifiedAt: string | null;
  verifiedByName: string | null;
  images: ComplianceImage[];
}

export interface Outlet {
  id: string;
  name: string;
  phone: string;
  ownerName: string;
  ownerMobile: string;
  ownerWhatsapp: string;
  email: string;
  outletType: string;
  address: string;
  landmark: string;
  locality: string;
  locationId: string;
  pincode: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  classification: string;
  plannedAnnualVolume: number;
  stockingCommitment: string;
  outletStatus: string;
  operationalStatus: string;
  assetStatus: string;
  complianceState: string;
  relaxationEndDate: string;
  daysRemaining: number;
  coolerType: string | null;
  capacity: string | null;
  signageType: string | null;
  dmsId: string | null;
  businessId: string | null;
  distributorId: string;
  createdByAseId: string;
  createdByAseName: string;
  onboardedAt: string;
  activatedAt: string | null;
  createdAt: string;
  photos: OutletPhoto[];
  complianceRecords: ComplianceRecord[];
}

export interface OutletListResponse {
  success: boolean;
  data: {
    content: Outlet[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  };
  error?: string;
  errorCode?: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'Completed' | 'In Progress' | 'Locked';
  estimatedTime: string;
  isMandatory: boolean;
  isNextStep?: boolean;
  phase?: number;
}

export interface Invoice {
  id: string;
  items?: InvoiceItem[];
  estimatedPayoutAmount?: number;
  totalMrpRevenue?: number;
  /** Legacy — kept for compat, no longer the primary payout driver. */
  estimatedPayoutPercentage?: number;
  /** Total case count in the invoice (API converts all units to CASE). */
  totalCases?: number;
  invoiceNumber: string; // The endpoint returns invoiceNumber, but also could use invoiceNo.
  invoiceNo?: string; // keeping for backward compatibility with mocked data temporarily
  date?: string; // backward compat with mock
  distributor?: string; // backward compat with mock
  qty?: number; // backward compat with mock
  value?: number; // backward compat with mock
  invoiceDate: string;
  outletName: string;
  distributorName: string;
  skus: string;
  totalQuantity: number;
  quantity?: number; // Some mock/api versions use quantity instead of totalQuantity
  totalAmount: number;
  digitalSignature?: boolean;
  gr?: number;
  status: 'SUBMITTED' | 'ASE_APPROVED' | 'ASM_APPROVED' | 'FINANCE_APPROVED' | 'CALCULATED' | 'PAID' | 'REJECTED' | 'Extracted' | 'Pending' | 'Validated' | 'Error';
  photoUrl: string;
  uploadDate: string;
  createdAt?: string;
  createdByName?: string;
  createdByRole?: string;
}

export interface InvoiceApproveRequest {
  remarks: string;
}

export interface InvoiceRejectRequest {
  remarks: string;
}

export interface InvoiceLineItemDto {
  skuId?: string | null;
  skuName?: string;
  invoicedSkuName?: string;
  invoicedQuantity?: number;
  invoicedUnit?: string;
  invoicedUnitPrice?: number;
  invoicedTotalPrice?: number;
  isSchemeItem?: boolean;
  isNonCatalogItem?: boolean;
}

export interface InvoiceEditRequest {
  distributorId: string;
  invoiceNumber: string;
  invoiceDate: string;
  items: InvoiceLineItemDto[];
  totalAmount: number;
  digitalSignature: boolean;
  gr: number;
  remarks: string;
}

export interface InvoiceListResponse {
  success: boolean;
  data: {
    content: Invoice[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  };
  error?: string;
  errorCode?: string;
  timestamp: string;
}

export interface InvoiceSingleResponse {
  success: boolean;
  data: Invoice;
  error?: string;
  errorCode?: string;
  timestamp: string;
}

export interface PayoutResult {
  id: string;
  invoiceId: string;
  /** Legacy percentage-based slab — kept for backward compat. */
  slabPercentage: number;
  /** Fixed ₹ rate per case for the achieved slab tier. */
  ratePerCase?: number;
  /** Slab classification label (e.g. "Gold", "Platinum"). */
  classification?: string;
  calculatedAmount: number;
  status: string;
  calculatedAt: string;
  paidAt: string;
  /** Enriched fields — may be present in joined API responses. */
  invoiceNumber?: string;
  outletName?: string;
  distributorName?: string;
}

export interface PayoutCycleResponse {
  success: boolean;
  data: PayoutResult[];
  error?: string;
  errorCode?: string;
  timestamp: string;
}

export interface PayoutListResponse {
  success: boolean;
  data: {
    content: PayoutResult[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  };
  error?: string;
  errorCode?: string;
  timestamp: string;
}

export interface PayoutSingleResponse {
  success: boolean;
  data: PayoutResult;
  error?: string;
  errorCode?: string;
  timestamp: string;
}

export interface BulkApproveFailure {
  invoiceId: string;
  reason: string;
}

export interface PayoutLineItem {
  skuName?: string;
  category?: string;
  mrpPerCase?: number;
  invoicedQuantity?: number;
  caseConfiguration?: number;
  physicalCases?: number;
  mrpRevenue?: number;
  ratePerCase?: number;
  payoutAmount?: number;
  excludedFromPayout?: boolean;
}

export interface PayoutEstimate {
  outletId: string;
  outletName: string;
  complianceState: string;
  slabId: string;
  classification: string;
  minQuantity: number;
  maxQuantity: number | null;
  /** Legacy — kept for compat, no longer the primary payout driver. */
  slabPercentage?: number;
  /** Fixed ₹ rate per case for the achieved slab tier. */
  ratePerCase: number;
  /** Total case count in THIS invoice only. */
  totalCases: number;
  /** Cumulative monthly volume across ALL invoices this month. */
  totalMonthlyVolumePc?: number;
  /** Volume qualifying for the current slab (may exclude water). */
  slabVolumePc?: number;
  /** Water-category volume tracked separately. */
  waterVolumePc?: number;
  /** True when the result is still an estimate (not finalised by finance). */
  isEstimated?: boolean;
  /** True when the outlet hasn't crossed the minimum slab threshold. */
  belowMinimumThreshold?: boolean;
  invoiceTotalAmount: number;
  /** Total MRP revenue for this invoice. */
  invoiceTotalMrpRevenue?: number;
  /** Per-invoice payout contribution (NOT the monthly total). */
  calculatedPayoutAmount: number;
  /** Per-SKU line items. */
  lineItems?: PayoutLineItem[];
}

export interface PayoutEstimateResponse {
  success: boolean;
  data: PayoutEstimate;
  error?: string;
  errorCode?: string;
  timestamp: string;
}

export interface BulkApproveResponse {
  success: boolean;
  data: {
    totalRequested: number;
    successCount: number;
    failureCount: number;
    failures: BulkApproveFailure[];
  };
  error?: string;
  errorCode?: string;
  timestamp: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Draft' | 'Ended';
  ruleDescription: string;
}

export interface InvoiceItem {
  sku?: string;
  qty?: number;
  value?: number;
  skuName?: string;
  matchedSkuName?: string;
  invoicedSkuName?: string;
  category?: string;
  caseConfiguration?: string;
  physicalCases?: number;
  invoicedQuantity?: number;
  invoicedUnit?: string;
  mrpPerCase?: number;
  mrpRevenue?: number;
  /** Legacy — kept for compat, no longer primary. */
  payoutPercentage?: number;
  payoutAmount?: number;
  confidence?: number;
  [key: string]: unknown;
}

export interface OutletInvoice {
  id: string;
  invoiceNo: string;
  month: string;
  year: number;
  distributorName: string;
  uploadDate: string;
  uploadedBy: string;
  items: InvoiceItem[];
  totalQty: number;
  totalValue: number;
  status: 'Pending Upload' | 'Pending Verification' | 'Verified' | 'Rejected';
  verifiedBy?: string;
  verifiedDate?: string;
  remarks?: string;
}

export interface OutletPayout {
  id: string;
  month: string;
  year: number;
  invoiceId: string;
  forecastQty: number;
  actualQty: number;
  eligibility: 'Eligible' | 'Not Eligible';
  reason?: string;
  payoutAmount: number;
  status: 'Eligible' | 'Processing' | 'Paid';
  paidDate?: string;
  transactionRef?: string;
}

export interface PFPSlab {
  classification: string;
  monthlyVPO: string;
  incentiveRate: string;
  model: string;
}

export interface OutletActivity {
  id: string;
  type: 'onboarding' | 'invoice' | 'payout' | 'system';
  title: string;
  user: string;
  timestamp: string;
  status?: string;
}

// ── Payouts Module Types ──────────────────────────────────

export interface BankDetails {
  accountNo: string;
  ifsc: string;
  bankName: string;
  beneficiaryName: string;
}

export interface PayoutRecord {
  id: string;
  outletId: string;
  outletName: string;
  classification: string;
  month: string;
  year: number;
  invoiceCount: number;
  invoiceNos: string[];
  totalInvoiceValue: number;
  payoutAmount: number;
  status: 'Eligible' | 'Pending' | 'Settled' | 'On Hold';
  transactionId?: string;
  settledDate?: string;
  linkedBy?: string;
  remarks?: string;
}

// ── Business Module Types ──────────────────────────────────

export interface Business {
  id: string;
  name: string;
  phone: string;
  address: string;
  status: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BusinessCreateRequest {
  name: string;
  phone: string;
  address: string;
}

export interface BusinessListResponse {
  success: boolean;
  data: {
    content: Business[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  };
  error?: string;
  errorCode?: string;
  timestamp: string;
}

export interface BusinessCreateResponse {
  success: boolean;
  data: Business;
  error?: string;
  errorCode?: string;
  timestamp: string;
}

// ── Location Types ────────────────────────────────────────

export interface Location {
  id: string;
  pincode: string;
  city: string;
  state: string;
}

export interface LocationListResponse {
  success: boolean;
  data: Location[];
  timestamp: string;
}

// ── User Management Types ────────────────────────────────────

export enum AuthType {
  EMAIL = 'EMAIL',
  OTP = 'OTP'
}

export interface SystemUser {
  id: string;
  name: string;
  role: string;
  authType: string;
  email?: string;
  phone?: string;
  status: string;
  businessId?: string;
  locationId?: string;
  createdAt: string;
}

export interface UserListResponse {
  success: boolean;
  data: {
    content: SystemUser[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  };
  error?: string;
  errorCode?: string;
  timestamp: string;
}

export interface CreateUserRequest {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  role: string;
  authType: string;
  businessId: string;
  locationId?: string;
  parentUserId?: string;
  distributorIds?: string[];
}

export interface CreateUserResponse {
  success: boolean;
  data: SystemUser;
  error?: string;
  errorCode?: string;
  timestamp: string;
}
// ── Distributor Types ────────────────────────────────────────

export interface Distributor {
  id: string;
  name: string;
  address: string;
  gstNumber: string;
  email?: string;
  phone?: string;
  status?: string;
  businessId?: string;
  locationId?: string;
  business?: Business | null;
  location?: Location | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DistributorCreateRequest {
  name: string;
  address: string;
  gstNumber: string;
  businessId: string;
  locationId: string;
  email?: string;
  phone?: string;
}

export interface DistributorListResponse {
  success: boolean;
  data: {
    content: Distributor[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  };
  error?: string;
  errorCode?: string;
  timestamp: string;
}

export interface DistributorCreateResponse {
  success: boolean;
  data: Distributor;
  error?: string;
  errorCode?: string;
  timestamp: string;
}

export interface Slab {
  id: string;
  businessId: string;
  classification: string;
  minQuantity: number;
  maxQuantity: number | null;
  /** Fixed ₹ per case paid out at this slab tier. */
  ratePerCase: number;
  /** Legacy percentage — kept for backward compat. */
  percentage?: number;
  locationId: string | null;
}

// ── Dashboard Stats ───────────────────────────────────────

export interface DashboardStats {
  // Common fields (all roles)
  totalOutlets?: number;
  inProgressOutlets?: number;
  activeOutlets?: number;
  suspendedOutlets?: number;
  asmPendingOutlets?: number;
  totalDistributors?: number;

  // Business Admin / Finance Admin / Business User
  totalInvoices?: number;
  submittedInvoices?: number;
  aseApprovedInvoices?: number;
  asmApprovedInvoices?: number;
  financeApprovedInvoices?: number;
  rejectedInvoices?: number;
  paidInvoices?: number;

  // Admin-only
  totalPayouts?: number;
  pendingPayouts?: number;
  paidPayouts?: number;
  totalUsers?: number;

  // RBL / SM specific
  totalSm?: number;
  totalAsm?: number;
  totalAse?: number;
  pendingInvoicesAse?: number;
  pendingInvoicesAsm?: number;
  pendingInvoicesFinance?: number;
}

export interface DashboardStatsResponse {
  success: boolean;
  data: DashboardStats;
  timestamp: string;
}

export interface SlabListResponse {
  success: boolean;
  data: {
    content: Slab[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  };
  timestamp: string;
}

// ── Support Ticket Types ───────────────────────────────────

export type SupportTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  raisedBy: string;
  raisedByName: string;
  raisedByPhone: string;
  category: string;
  description: string;
  status: SupportTicketStatus;
  appVersion: string;
  platform: string;
  osVersion: string;
  deviceModel: string;
  screenshotUrls: string[];
  resolutionNote: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Stock Management Types ───────────────────────────────────────────────

export interface StockItem {
  id: string;
  label: string;
  displayOrder: number;
  active: boolean;
}

export interface StockItemResponse {
  success: boolean;
  data: StockItem[];
  requestId?: string;
  timestamp: string;
}

export interface StockReportLine {
  stockItemId: string;
  label?: string;
  closingCases: number;
  gitCases: number;
}

export interface StockReportSubmitRequest {
  reportWeek: string;
  closingAsOn: string;
  gitAsOn: string;
  lines: StockReportLine[];
}

export interface StockReport {
  reportId: string;
  distributorId: string;
  distributorName: string;
  reportWeek: string;
  closingAsOn: string;
  gitAsOn: string;
  submittedBy: string;
  submittedAt: string;
  lines: StockReportLine[];
}

export interface StockReportSubmitResponse {
  success: boolean;
  data: StockReport;
  requestId?: string;
  timestamp: string;
}

export interface StockReportListResponse {
  success: boolean;
  data: {
    content: StockReport[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  };
  requestId?: string;
  timestamp: string;
}

export interface StockDashboardData {
  reportWeek: string;
  totalDistributors: number;
  reported: number;
  pending: number;
  reportingRatePct: number;
  byStockItem?: any[];
}

export interface StockDashboardResponse {
  success: boolean;
  data: StockDashboardData;
}

export interface StockPendingDistributor {
  distributorId: string;
  distributorName: string;
  phone?: string;
}

export interface StockPendingResponse {
  success: boolean;
  data: StockPendingDistributor[];
}

