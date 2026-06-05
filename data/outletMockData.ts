import { Task, OutletInvoice, OutletPayout, PFPSlab, OutletActivity } from '../types';

// Per-outlet header info
export const OUTLET_INFO: Record<string, { name: string; code: string; classification: string; address: string; owner: string; initials: string; contact: string }> = {
  '1': { name: 'Sharma General Store', code: 'OUT-2024-892', classification: 'Platinum', address: '12/B, MG Road, Indiranagar, Bangalore', owner: 'Rajesh Kumar Sharma', initials: 'RK', contact: '+91 98765 43210' },
  '2': { name: 'Patel Supermart', code: 'OUT-2024-415', classification: 'Gold', address: 'CG Road, Navrangpura, Ahmedabad', owner: 'Hitesh Patel', initials: 'HP', contact: '+91 94265 78900' },
  '3': { name: 'Singh Medical Store', code: 'OUT-2024-207', classification: 'Diamond', address: 'Karol Bagh, New Delhi', owner: 'Gurpreet Singh', initials: 'GS', contact: '+91 99112 33445' },
};

export const COMPLETED_TASKS: Task[] = [
  { id: '1', title: 'Outlet Details', description: 'Basic details, geo auto-capture, classification & owner info', status: 'Completed', estimatedTime: '5 mins', isMandatory: true, phase: 1 },
  { id: '2', title: 'Onboarding Photos', description: 'Max 5 geo-tagged photos: Outside, Inside, Cooler Space, Shelf Visibility, Branding Opportunity', status: 'Completed', estimatedTime: '10 mins', isMandatory: true, phase: 1 },
  { id: '3', title: 'PFP Enrollment', description: 'Forecast, stock commitment, branding consent, bank details & digital declaration', status: 'Completed', estimatedTime: '8 mins', isMandatory: true, phase: 1 },
  { id: '4', title: 'Verification Photos & Location', description: 'Max 5 geo-tagged verification photos after third-party branding & cooler installation', status: 'Completed', estimatedTime: '10 mins', isMandatory: true, phase: 2 },
];

export const PFP_AGREEMENTS: Record<string, { url: string; caption: string }[]> = {
  '1': [
    { url: 'https://picsum.photos/seed/agreement1/800/1000', caption: 'Signed PFP Declaration' },
    { url: 'https://picsum.photos/seed/bank_passbook1/800/1000', caption: 'Bank Details Verification' },
  ],
  '2': [
    { url: 'https://picsum.photos/seed/agreement2/800/1000', caption: 'Signed PFP Declaration' },
  ],
  '3': [
    { url: 'https://picsum.photos/seed/agreement3/800/1000', caption: 'Signed PFP Declaration' },
  ],
  'default': [
    { url: 'https://picsum.photos/seed/agreement_def/800/1000', caption: 'Signed PFP Declaration' },
  ],
};

export const IN_PROGRESS_TASKS: Task[] = [
  { id: '1', title: 'Outlet Details', description: 'Basic details, geo auto-capture, classification & owner info', status: 'Completed', estimatedTime: '5 mins', isMandatory: true, phase: 1 },
  { id: '2', title: 'Onboarding Photos', description: 'Max 5 geo-tagged photos: Outside, Inside, Cooler Space, Shelf Visibility, Branding Opportunity', status: 'Completed', estimatedTime: '10 mins', isMandatory: true, phase: 1 },
  { id: '3', title: 'PFP Enrollment', description: 'Forecast, stock commitment, branding consent, bank details & digital declaration', status: 'In Progress', estimatedTime: '8 mins', isMandatory: true, isNextStep: true, phase: 1 },
  { id: '4', title: 'Verification Photos & Location', description: 'Max 5 geo-tagged verification photos after third-party branding & cooler installation', status: 'Locked', estimatedTime: '10 mins', isMandatory: true, phase: 2 },
];

// Completed outlets (1, 2, 3) = all done; others = in progress
export const COMPLETED_OUTLET_IDS = ['1', '2', '3'];

// Mock detail data for each step's slider — completed version
export const STEP_DETAILS_COMPLETED: Record<string, Record<string, { label: string; value: string }[]>> = {
  '1': {
    '1': [
      { label: 'Outlet Name', value: 'Sharma General Store' },
      { label: "Owner's Full Name", value: 'Rajesh Kumar Sharma' },
      { label: 'Contact Number', value: '+91 98765 43210' },
      { label: 'WhatsApp Number', value: '+91 98765 43210' },
      { label: 'Email ID', value: 'rajesh.sharma@email.com' },
      { label: 'Outlet Type', value: 'General Trade' },
      { label: 'Classification', value: 'Platinum' },
      { label: 'Outlet Address', value: '12/B, MG Road, Indiranagar, Bangalore, Karnataka - 560038' },
      { label: 'GPS Coordinates (Auto)', value: '12.9716° N, 77.5946° E' },
      { label: 'Pin Code', value: '560038' },
    ],
    '2': [
      { label: 'Photos Captured', value: '5 of 5' },
      { label: 'Photo 1 — Outside View', value: 'Captured ✓ (Geo-tagged)' },
      { label: 'Photo 2 — Inside View', value: 'Captured ✓ (Geo-tagged)' },
      { label: 'Photo 3 — Cooler Space', value: 'Captured ✓ (Geo-tagged)' },
      { label: 'Photo 4 — Shelf Visibility', value: 'Captured ✓ (Geo-tagged)' },
      { label: 'Photo 5 — Branding Opportunity', value: 'Captured ✓ (Geo-tagged)' },
      { label: 'Timestamp', value: '12 Jan 2025, 10:34 AM' },
      { label: 'Location Match', value: 'GPS Verified ✓' },
    ],
    '3': [
      { label: 'Stocking Commitment — RCPL Beverages', value: 'Selected below' },
      { label: 'Campa Cola', value: '✓ Yes' },
      { label: 'Campa Lemon', value: '✓ Yes' },
      { label: 'Campa Orange', value: '✓ Yes' },
      { label: 'Sosyo', value: '✗ No' },
      { label: 'Other Beverages', value: 'None' },
      { label: 'Average Weekly Purchase Plan (₹)', value: '₹12,000' },
      { label: 'Branding Consent', value: 'Agreed ✓' },
      { label: 'Bank Name', value: 'State Bank of India' },
      { label: 'Account Number', value: 'XXXX XXXX 4521' },
      { label: 'IFSC Code', value: 'SBIN0001234' },
      { label: 'Digital Declaration', value: 'Signed ✓' },
      { label: 'Enrollment Date', value: '12 Jan 2025' },
    ],
    '4': [
      { label: 'Verification Photos', value: '5 of 5' },
      { label: 'Photo 1 — Cooler Installed', value: 'Verified ✓ (Geo-tagged)' },
      { label: 'Photo 2 — Branding Installed', value: 'Verified ✓ (Geo-tagged)' },
      { label: 'Photo 3 — Prime Placement', value: 'Verified ✓ (Geo-tagged)' },
      { label: 'Photo 4 — Competition Replacement', value: 'N/A (Not Exclusive)' },
      { label: 'Photo 5 — Shelf Visibility', value: 'Verified ✓ (Geo-tagged)' },
      { label: 'GPS Coordinates', value: '12.9716° N, 77.5946° E' },
      { label: 'Timestamp', value: '28 Jan 2025, 2:15 PM' },
      { label: 'Location Match', value: 'GPS Verified ✓' },
      { label: 'CDO Status', value: 'CDO Complete ✓' },
    ],
  },
  '2': {
    '1': [
      { label: 'Outlet Name', value: 'Patel Supermart' },
      { label: "Owner's Full Name", value: 'Hitesh Patel' },
      { label: 'Contact Number', value: '+91 94265 78900' },
      { label: 'WhatsApp Number', value: '+91 94265 78900' },
      { label: 'Email ID', value: 'hitesh.patel@email.com' },
      { label: 'Outlet Type', value: 'Modern Trade' },
      { label: 'Classification', value: 'Gold' },
      { label: 'Outlet Address', value: 'CG Road, Navrangpura, Ahmedabad, Gujarat - 380009' },
      { label: 'GPS Coordinates (Auto)', value: '23.0225° N, 72.5714° E' },
      { label: 'Pin Code', value: '380009' },
    ],
    '2': [
      { label: 'Photos Captured', value: '5 of 5' },
      { label: 'Photo 1 — Outside View', value: 'Captured ✓ (Geo-tagged)' },
      { label: 'Photo 2 — Inside View', value: 'Captured ✓ (Geo-tagged)' },
      { label: 'Photo 3 — Cooler Space', value: 'Captured ✓ (Geo-tagged)' },
      { label: 'Photo 4 — Shelf Visibility', value: 'Captured ✓ (Geo-tagged)' },
      { label: 'Photo 5 — Branding Opportunity', value: 'Captured ✓ (Geo-tagged)' },
      { label: 'Timestamp', value: '20 Jan 2025, 11:22 AM' },
      { label: 'Location Match', value: 'GPS Verified ✓' },
    ],
    '3': [
      { label: 'Stocking Commitment — RCPL Beverages', value: 'Selected below' },
      { label: 'Campa Cola', value: '✓ Yes' },
      { label: 'Campa Lemon', value: '✓ Yes' },
      { label: 'Campa Orange', value: '✗ No' },
      { label: 'Sosyo', value: '✓ Yes' },
      { label: 'Other Beverages', value: 'Campa Masala Soda' },
      { label: 'Average Weekly Purchase Plan (₹)', value: '₹25,000' },
      { label: 'Branding Consent', value: 'Agreed ✓' },
      { label: 'Bank Name', value: 'Bank of Baroda' },
      { label: 'Account Number', value: 'XXXX XXXX 7890' },
      { label: 'IFSC Code', value: 'BARB0NAVRAN' },
      { label: 'Digital Declaration', value: 'Signed ✓' },
      { label: 'Enrollment Date', value: '20 Jan 2025' },
    ],
    '4': [
      { label: 'Verification Photos', value: '5 of 5' },
      { label: 'Photo 1 — Cooler Installed', value: 'Verified ✓ (Geo-tagged)' },
      { label: 'Photo 2 — Branding Installed', value: 'Verified ✓ (Geo-tagged)' },
      { label: 'Photo 3 — Prime Placement', value: 'Verified ✓ (Geo-tagged)' },
      { label: 'Photo 4 — Competition Replacement', value: 'Verified ✓ (Exclusive deal)' },
      { label: 'Photo 5 — Shelf Visibility', value: 'Verified ✓ (Geo-tagged)' },
      { label: 'GPS Coordinates', value: '23.0225° N, 72.5714° E' },
      { label: 'Timestamp', value: '5 Feb 2025, 3:40 PM' },
      { label: 'Location Match', value: 'GPS Verified ✓' },
      { label: 'CDO Status', value: 'CDO Complete ✓' },
    ],
  },
  '3': {
    '1': [
      { label: 'Outlet Name', value: 'Singh Medical Store' },
      { label: "Owner's Full Name", value: 'Gurpreet Singh' },
      { label: 'Contact Number', value: '+91 99112 33445' },
      { label: 'WhatsApp Number', value: '+91 99112 33445' },
      { label: 'Email ID', value: 'gurpreet.singh@email.com' },
      { label: 'Outlet Type', value: 'Medical & General' },
      { label: 'Classification', value: 'Diamond' },
      { label: 'Outlet Address', value: 'Shop 14, Karol Bagh Market, New Delhi - 110005' },
      { label: 'GPS Coordinates (Auto)', value: '28.6519° N, 77.1905° E' },
      { label: 'Pin Code', value: '110005' },
    ],
    '2': [
      { label: 'Photos Captured', value: '5 of 5' },
      { label: 'Photo 1 — Outside View', value: 'Captured ✓ (Geo-tagged)' },
      { label: 'Photo 2 — Inside View', value: 'Captured ✓ (Geo-tagged)' },
      { label: 'Photo 3 — Cooler Space', value: 'Captured ✓ (Geo-tagged)' },
      { label: 'Photo 4 — Shelf Visibility', value: 'Captured ✓ (Geo-tagged)' },
      { label: 'Photo 5 — Branding Opportunity', value: 'Captured ✓ (Geo-tagged)' },
      { label: 'Timestamp', value: '18 Jan 2025, 9:50 AM' },
      { label: 'Location Match', value: 'GPS Verified ✓' },
    ],
    '3': [
      { label: 'Stocking Commitment — RCPL Beverages', value: 'Selected below' },
      { label: 'Campa Cola', value: '✓ Yes' },
      { label: 'Campa Lemon', value: '✗ No' },
      { label: 'Campa Orange', value: '✓ Yes' },
      { label: 'Sosyo', value: '✓ Yes' },
      { label: 'Other Beverages', value: 'None' },
      { label: 'Average Weekly Purchase Plan (₹)', value: '₹8,000' },
      { label: 'Branding Consent', value: 'Agreed ✓' },
      { label: 'Bank Name', value: 'HDFC Bank' },
      { label: 'Account Number', value: 'XXXX XXXX 3345' },
      { label: 'IFSC Code', value: 'HDFC0000456' },
      { label: 'Digital Declaration', value: 'Signed ✓' },
      { label: 'Enrollment Date', value: '18 Jan 2025' },
    ],
    '4': [
      { label: 'Verification Photos', value: '5 of 5' },
      { label: 'Photo 1 — Cooler Installed', value: 'Verified ✓ (Geo-tagged)' },
      { label: 'Photo 2 — Branding Installed', value: 'Verified ✓ (Geo-tagged)' },
      { label: 'Photo 3 — Prime Placement', value: 'Verified ✓ (Geo-tagged)' },
      { label: 'Photo 4 — Competition Replacement', value: 'N/A (Not Exclusive)' },
      { label: 'Photo 5 — Shelf Visibility', value: 'Verified ✓ (Geo-tagged)' },
      { label: 'GPS Coordinates', value: '28.6519° N, 77.1905° E' },
      { label: 'Timestamp', value: '1 Feb 2025, 11:30 AM' },
      { label: 'Location Match', value: 'GPS Verified ✓' },
      { label: 'CDO Status', value: 'CDO Complete ✓' },
    ],
  },
};

// Default step details (for in-progress outlets)
export const STEP_DETAILS_DEFAULT: Record<string, { label: string; value: string }[]> = {
  '1': [
    { label: 'Outlet Name', value: 'City Mart 79' },
    { label: "Owner's Full Name", value: 'Vikram J.' },
    { label: 'Contact Number', value: '+91 90000 12345' },
    { label: 'WhatsApp Number', value: '+91 90000 12345' },
    { label: 'Email ID', value: 'vikram.j@email.com' },
    { label: 'Outlet Type', value: 'General Trade' },
    { label: 'Classification', value: 'Gold' },
    { label: 'Outlet Address', value: 'Anna Nagar, Chennai, Tamil Nadu - 600040' },
    { label: 'GPS Coordinates (Auto)', value: '13.0827° N, 80.2707° E' },
    { label: 'Pin Code', value: '600040' },
  ],
  '2': [
    { label: 'Photos Captured', value: '5 of 5' },
    { label: 'Photo 1 — Outside View', value: 'Captured ✓ (Geo-tagged)' },
    { label: 'Photo 2 — Inside View', value: 'Captured ✓ (Geo-tagged)' },
    { label: 'Photo 3 — Cooler Space', value: 'Captured ✓ (Geo-tagged)' },
    { label: 'Photo 4 — Shelf Visibility', value: 'Captured ✓ (Geo-tagged)' },
    { label: 'Photo 5 — Branding Opportunity', value: 'Captured ✓ (Geo-tagged)' },
    { label: 'Timestamp', value: '10 Feb 2025, 3:12 PM' },
    { label: 'Location Match', value: 'GPS Verified ✓' },
  ],
  '3': [
    { label: 'Stocking Commitment — RCPL Beverages', value: '—' },
    { label: 'Campa Cola', value: '—' },
    { label: 'Campa Lemon', value: '—' },
    { label: 'Campa Orange', value: '—' },
    { label: 'Sosyo', value: '—' },
    { label: 'Other Beverages', value: '—' },
    { label: 'Average Weekly Purchase Plan (₹)', value: '—' },
    { label: 'Branding Consent', value: '—' },
    { label: 'Bank Name', value: '—' },
    { label: 'Account Number', value: '—' },
    { label: 'IFSC Code', value: '—' },
    { label: 'Digital Declaration', value: 'Not signed yet' },
    { label: 'Enrollment Date', value: '—' },
  ],
  '4': [
    { label: 'Verification Photos', value: '—' },
    { label: 'Photo 1 — Cooler Installed', value: '—' },
    { label: 'Photo 2 — Branding Installed', value: '—' },
    { label: 'Photo 3 — Prime Placement', value: '—' },
    { label: 'Photo 4 — Competition Replacement', value: '—' },
    { label: 'Photo 5 — Shelf Visibility', value: '—' },
    { label: 'GPS Coordinates', value: '—' },
    { label: 'Timestamp', value: '—' },
    { label: 'Location Match', value: '—' },
    { label: 'CDO Status', value: 'Pending' },
  ],
};

// Onboarding photos (Step 2 — Before CDO)
export const ONBOARDING_PHOTOS: Record<string, { url: string; caption: string }[]> = {
  '1': [
    { url: 'https://picsum.photos/seed/s1out/800/600', caption: 'Outside View' },
    { url: 'https://picsum.photos/seed/s1in/800/600', caption: 'Inside View' },
    { url: 'https://picsum.photos/seed/s1cool/800/600', caption: 'Cooler Space' },
    { url: 'https://picsum.photos/seed/s1shelf/800/600', caption: 'Shelf Visibility' },
    { url: 'https://picsum.photos/seed/s1brand/800/600', caption: 'Branding Opportunity' },
  ],
  '2': [
    { url: 'https://picsum.photos/seed/p2out/800/600', caption: 'Outside View' },
    { url: 'https://picsum.photos/seed/p2in/800/600', caption: 'Inside View' },
    { url: 'https://picsum.photos/seed/p2cool/800/600', caption: 'Cooler Space' },
    { url: 'https://picsum.photos/seed/p2shelf/800/600', caption: 'Shelf Visibility' },
    { url: 'https://picsum.photos/seed/p2brand/800/600', caption: 'Branding Opportunity' },
  ],
  '3': [
    { url: 'https://picsum.photos/seed/g3out/800/600', caption: 'Outside View' },
    { url: 'https://picsum.photos/seed/g3in/800/600', caption: 'Inside View' },
    { url: 'https://picsum.photos/seed/g3cool/800/600', caption: 'Cooler Space' },
    { url: 'https://picsum.photos/seed/g3shelf/800/600', caption: 'Shelf Visibility' },
    { url: 'https://picsum.photos/seed/g3brand/800/600', caption: 'Branding Opportunity' },
  ],
  'default': [
    { url: 'https://picsum.photos/seed/storefront1/800/600', caption: 'Outside View' },
    { url: 'https://picsum.photos/seed/shopinterior/800/600', caption: 'Inside View' },
    { url: 'https://picsum.photos/seed/coolerspace/800/600', caption: 'Cooler Space' },
    { url: 'https://picsum.photos/seed/shelfview/800/600', caption: 'Shelf Visibility' },
    { url: 'https://picsum.photos/seed/brandopp/800/600', caption: 'Branding Opportunity' },
  ],
};

// Verification photos (Step 4 — After CDO) — only for completed outlets
export const VERIFICATION_PHOTOS: Record<string, { url: string; caption: string }[]> = {
  '1': [
    { url: 'https://picsum.photos/seed/s1vcool/800/600', caption: 'Cooler Installed' },
    { url: 'https://picsum.photos/seed/s1vbrand/800/600', caption: 'Branding Installed' },
    { url: 'https://picsum.photos/seed/s1vplace/800/600', caption: 'Prime Placement' },
    { url: 'https://picsum.photos/seed/s1vcomp/800/600', caption: 'Competition Area' },
    { url: 'https://picsum.photos/seed/s1vshelf/800/600', caption: 'Shelf Visibility' },
  ],
  '2': [
    { url: 'https://picsum.photos/seed/p2vcool/800/600', caption: 'Cooler Installed' },
    { url: 'https://picsum.photos/seed/p2vbrand/800/600', caption: 'Branding Installed' },
    { url: 'https://picsum.photos/seed/p2vplace/800/600', caption: 'Prime Placement' },
    { url: 'https://picsum.photos/seed/p2vcomp/800/600', caption: 'Competition Replaced' },
    { url: 'https://picsum.photos/seed/p2vshelf/800/600', caption: 'Shelf Visibility' },
  ],
  '3': [
    { url: 'https://picsum.photos/seed/g3vcool/800/600', caption: 'Cooler Installed' },
    { url: 'https://picsum.photos/seed/g3vbrand/800/600', caption: 'Branding Installed' },
    { url: 'https://picsum.photos/seed/g3vplace/800/600', caption: 'Prime Placement' },
    { url: 'https://picsum.photos/seed/g3vcomp/800/600', caption: 'Competition Area' },
    { url: 'https://picsum.photos/seed/g3vshelf/800/600', caption: 'Shelf Visibility' },
  ],
};

// PFP Classification Slabs
export const PFP_SLABS: PFPSlab[] = [
  { classification: 'Platinum', monthlyVPO: '500 cs & Above', incentiveRate: 'Up to 2% of GR Value', model: 'Exclusive Outlet with PFP' },
  { classification: 'Diamond', monthlyVPO: '200 cs - 499 cs', incentiveRate: 'Up to 2% of GR Value', model: 'Exclusive Outlet with PFP' },
  { classification: 'Gold', monthlyVPO: '80 cs - 199 cs', incentiveRate: 'Up to 2% of GR Value', model: 'Exclusive Outlet with PFP' },
  { classification: 'Silver', monthlyVPO: '50 cs - 79 cs', incentiveRate: 'Up to 2% of GR Value', model: 'Exclusive Outlet with PFP' },
];

// Mock Invoice Data (per outlet)
export const OUTLET_INVOICES: Record<string, OutletInvoice[]> = {
  '1': [
    {
      id: 'inv-1-1', invoiceNo: 'INV-2025-0112', month: 'January', year: 2025,
      distributorName: 'Metro Beverages Pvt Ltd', uploadDate: '2 Feb 2025', uploadedBy: 'Metro Beverages',
      items: [
        { sku: 'Campa Cola 300ml', qty: 40, value: 24000 },
        { sku: 'Campa Lemon 300ml', qty: 25, value: 15000 },
        { sku: 'Campa Orange 300ml', qty: 15, value: 9000 },
        { sku: 'Sosyo 250ml', qty: 10, value: 5000 },
      ],
      totalQty: 90, totalValue: 53000,
      status: 'Verified', verifiedBy: 'Amit Verma (SE)', verifiedDate: '4 Feb 2025',
    },
    {
      id: 'inv-1-2', invoiceNo: 'INV-2025-0245', month: 'February', year: 2025,
      distributorName: 'Metro Beverages Pvt Ltd', uploadDate: '3 Mar 2025', uploadedBy: 'Metro Beverages',
      items: [
        { sku: 'Campa Cola 300ml', qty: 50, value: 30000 },
        { sku: 'Campa Lemon 300ml', qty: 30, value: 18000 },
        { sku: 'Campa Orange 300ml', qty: 20, value: 12000 },
        { sku: 'Sosyo 250ml', qty: 12, value: 6000 },
      ],
      totalQty: 112, totalValue: 66000,
      status: 'Verified', verifiedBy: 'Amit Verma (SE)', verifiedDate: '5 Mar 2025',
    },
    {
      id: 'inv-1-3', invoiceNo: 'INV-2025-0389', month: 'March', year: 2025,
      distributorName: 'Metro Beverages Pvt Ltd', uploadDate: '1 Apr 2025', uploadedBy: 'Metro Beverages',
      items: [
        { sku: 'Campa Cola 300ml', qty: 45, value: 27000 },
        { sku: 'Campa Lemon 300ml', qty: 28, value: 16800 },
        { sku: 'Campa Orange 300ml', qty: 18, value: 10800 },
        { sku: 'Sosyo 250ml', qty: 8, value: 4000 },
      ],
      totalQty: 99, totalValue: 58600,
      status: 'Pending Verification',
    },
  ],
  '2': [
    {
      id: 'inv-2-1', invoiceNo: 'INV-2025-0156', month: 'January', year: 2025,
      distributorName: 'Gujarat Distributors', uploadDate: '5 Feb 2025', uploadedBy: 'Gujarat Distributors',
      items: [
        { sku: 'Campa Cola 300ml', qty: 60, value: 36000 },
        { sku: 'Campa Lemon 300ml', qty: 35, value: 21000 },
        { sku: 'Sosyo 250ml', qty: 20, value: 10000 },
      ],
      totalQty: 115, totalValue: 67000,
      status: 'Verified', verifiedBy: 'Priya Mehta (SE)', verifiedDate: '7 Feb 2025',
    },
    {
      id: 'inv-2-2', invoiceNo: 'INV-2025-0298', month: 'February', year: 2025,
      distributorName: 'Gujarat Distributors', uploadDate: '4 Mar 2025', uploadedBy: 'Gujarat Distributors',
      items: [
        { sku: 'Campa Cola 300ml', qty: 55, value: 33000 },
        { sku: 'Campa Lemon 300ml', qty: 40, value: 24000 },
        { sku: 'Sosyo 250ml', qty: 18, value: 9000 },
      ],
      totalQty: 113, totalValue: 66000,
      status: 'Verified', verifiedBy: 'Priya Mehta (SE)', verifiedDate: '6 Mar 2025',
    },
    {
      id: 'inv-2-3', invoiceNo: 'INV-2025-0421', month: 'March', year: 2025,
      distributorName: 'Gujarat Distributors', uploadDate: '', uploadedBy: '',
      items: [],
      totalQty: 0, totalValue: 0,
      status: 'Pending Upload',
    },
  ],
  '3': [
    {
      id: 'inv-3-1', invoiceNo: 'INV-2025-0178', month: 'January', year: 2025,
      distributorName: 'Delhi FMCG Hub', uploadDate: '3 Feb 2025', uploadedBy: 'Delhi FMCG Hub',
      items: [
        { sku: 'Campa Cola 300ml', qty: 70, value: 42000 },
        { sku: 'Campa Orange 300ml', qty: 45, value: 27000 },
        { sku: 'Campa Lemon 300ml', qty: 35, value: 21000 },
        { sku: 'Sosyo 250ml', qty: 25, value: 12500 },
      ],
      totalQty: 175, totalValue: 102500,
      status: 'Verified', verifiedBy: 'Rajan Kumar (SE)', verifiedDate: '5 Feb 2025',
    },
    {
      id: 'inv-3-2', invoiceNo: 'INV-2025-0312', month: 'February', year: 2025,
      distributorName: 'Delhi FMCG Hub', uploadDate: '2 Mar 2025', uploadedBy: 'Delhi FMCG Hub',
      items: [
        { sku: 'Campa Cola 300ml', qty: 80, value: 48000 },
        { sku: 'Campa Orange 300ml', qty: 50, value: 30000 },
        { sku: 'Campa Lemon 300ml', qty: 40, value: 24000 },
        { sku: 'Sosyo 250ml', qty: 30, value: 15000 },
      ],
      totalQty: 200, totalValue: 117000,
      status: 'Verified', verifiedBy: 'Rajan Kumar (SE)', verifiedDate: '4 Mar 2025',
    },
    {
      id: 'inv-3-3', invoiceNo: 'INV-2025-0445', month: 'March', year: 2025,
      distributorName: 'Delhi FMCG Hub', uploadDate: '3 Apr 2025', uploadedBy: 'Delhi FMCG Hub',
      items: [
        { sku: 'Campa Cola 300ml', qty: 75, value: 45000 },
        { sku: 'Campa Orange 300ml', qty: 48, value: 28800 },
        { sku: 'Campa Lemon 300ml', qty: 38, value: 22800 },
        { sku: 'Sosyo 250ml', qty: 28, value: 14000 },
      ],
      totalQty: 189, totalValue: 110600,
      status: 'Pending Verification',
    },
  ],
};

// Mock Payout Data (per outlet)
export const OUTLET_PAYOUTS: Record<string, OutletPayout[]> = {
  '1': [
    { id: 'pay-1-1', month: 'January', year: 2025, invoiceId: 'inv-1-1', forecastQty: 100, actualQty: 90, eligibility: 'Eligible', payoutAmount: 1060, status: 'Paid', paidDate: '15 Feb 2025', transactionRef: 'TXN-78234561' },
    { id: 'pay-1-2', month: 'February', year: 2025, invoiceId: 'inv-1-2', forecastQty: 100, actualQty: 112, eligibility: 'Eligible', payoutAmount: 1320, status: 'Paid', paidDate: '14 Mar 2025', transactionRef: 'TXN-91456782' },
    { id: 'pay-1-3', month: 'March', year: 2025, invoiceId: 'inv-1-3', forecastQty: 100, actualQty: 99, eligibility: 'Eligible', payoutAmount: 1172, status: 'Processing' },
  ],
  '2': [
    { id: 'pay-2-1', month: 'January', year: 2025, invoiceId: 'inv-2-1', forecastQty: 120, actualQty: 115, eligibility: 'Eligible', payoutAmount: 1340, status: 'Paid', paidDate: '15 Feb 2025', transactionRef: 'TXN-78234562' },
    { id: 'pay-2-2', month: 'February', year: 2025, invoiceId: 'inv-2-2', forecastQty: 120, actualQty: 113, eligibility: 'Eligible', payoutAmount: 1320, status: 'Paid', paidDate: '14 Mar 2025', transactionRef: 'TXN-91456783' },
    { id: 'pay-2-3', month: 'March', year: 2025, invoiceId: 'inv-2-3', forecastQty: 120, actualQty: 0, eligibility: 'Not Eligible', reason: 'Invoice not uploaded', payoutAmount: 0, status: 'Eligible' },
  ],
  '3': [
    { id: 'pay-3-1', month: 'January', year: 2025, invoiceId: 'inv-3-1', forecastQty: 200, actualQty: 175, eligibility: 'Eligible', payoutAmount: 2050, status: 'Paid', paidDate: '15 Feb 2025', transactionRef: 'TXN-78234563' },
    { id: 'pay-3-2', month: 'February', year: 2025, invoiceId: 'inv-3-2', forecastQty: 200, actualQty: 200, eligibility: 'Eligible', payoutAmount: 2340, status: 'Paid', paidDate: '14 Mar 2025', transactionRef: 'TXN-91456784' },
    { id: 'pay-3-3', month: 'March', year: 2025, invoiceId: 'inv-3-3', forecastQty: 200, actualQty: 189, eligibility: 'Eligible', payoutAmount: 2150, status: 'Processing' },
  ],
};

export const OUTLET_ACTIVITIES: Record<string, OutletActivity[]> = {
  '1': [
    { id: 'a1', type: 'system', title: 'Outlet Enrolled in CDO Program', user: 'System', timestamp: '12 Jan 2025' },
    { id: 'a2', type: 'onboarding', title: 'Onboarding Photos Approved', user: 'Amit Verma (SE)', timestamp: '15 Jan 2025', status: 'Verified' },
    { id: 'a3', type: 'onboarding', title: 'Cooler Installation Verified', user: 'Rohan Phalke (Auditor)', timestamp: '28 Jan 2025', status: 'Verified' },
    { id: 'a4', type: 'invoice', title: 'January Invoice Verified', user: 'System', timestamp: '4 Feb 2025', status: '₹53,000' },
    { id: 'a5', type: 'payout', title: 'January Payout Settled', user: 'Finance Dept', timestamp: '15 Feb 2025', status: '₹1,060' },
    { id: 'a6', type: 'invoice', title: 'February Invoice Verified', user: 'System', timestamp: '5 Mar 2025', status: '₹66,000' },
    { id: 'a7', type: 'payout', title: 'February Payout Settled', user: 'Finance Dept', timestamp: '14 Mar 2025', status: '₹1,320' },
  ],
  '2': [
    { id: 'a1', type: 'system', title: 'Outlet Enrolled in CDO Program', user: 'System', timestamp: '20 Jan 2025' },
    { id: 'a2', type: 'onboarding', title: 'Onboarding Photos Approved', user: 'Priya Mehta (SE)', timestamp: '22 Jan 2025' },
    { id: 'a3', type: 'onboarding', title: 'Digital Declaration Signed', user: 'Outlet Owner', timestamp: '22 Jan 2025' },
    { id: 'a4', type: 'invoice', title: 'January Invoice Verified', user: 'System', timestamp: '7 Feb 2025', status: '₹67,000' },
    { id: 'a5', type: 'payout', title: 'January Payout Settled', user: 'Finance Dept', timestamp: '16 Feb 2025', status: '₹1,340' },
  ],
  '3': [
    { id: 'a1', type: 'system', title: 'Outlet Enrolled in CDO Program', user: 'System', timestamp: '18 Jan 2025' },
    { id: 'a2', type: 'onboarding', title: 'PFP Agreement Signed', user: 'Outlet Owner', timestamp: '20 Jan 2025' },
    { id: 'a3', type: 'invoice', title: 'January Invoice Verified', user: 'System', timestamp: '5 Feb 2025', status: '₹102,500' },
  ]
};
