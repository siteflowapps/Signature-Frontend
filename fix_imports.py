import os

files = [
    ("hooks/useBulkInvoiceApprove.ts", "../utils/errorUtils"),
    ("hooks/useDistributorForm.ts", "../utils/errorUtils"),
    ("hooks/useUserForm.ts", "../utils/errorUtils"),
    ("pages/AddBusiness.tsx", "../utils/errorUtils"),
    ("pages/AdminLogin.tsx", "../utils/errorUtils"),
    ("pages/DistributorsList.tsx", "../utils/errorUtils"),
    ("pages/Users.tsx", "../utils/errorUtils"),
    ("pages/business-detail/BusinessDetailPage.tsx", "../../utils/errorUtils"),
    ("pages/business-detail/components/AddUserForm.tsx", "../../../utils/errorUtils"),
    ("pages/landing/sections/SignInModal.tsx", "../../../utils/errorUtils"),
    ("pages/login/LoginPage.tsx", "../../utils/errorUtils"),
    ("pages/outlet/InvoicesTab.tsx", "../../utils/errorUtils"),
    ("pages/payout/TransactionDetail.tsx", "../../utils/errorUtils"),
    ("pages/payouts/PayoutsPage.tsx", "../../utils/errorUtils")
]

for filepath, import_path in files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Fix the typo if it exists
    content = content.replace("showToast('Export error: ' + (getErrorMessage(err), 3000);", "showToast('Export error: ' + getErrorMessage(err), 'error', 3000);")
    
    # Add import
    import_stmt = f"import {{ getErrorMessage }} from '{import_path}';"
    if "getErrorMessage } from" not in content:
        lines = content.split('\n')
        last_import = 0
        for i, line in enumerate(lines):
            if line.startswith('import '):
                last_import = i
        lines.insert(last_import + 1, import_stmt)
        content = '\n'.join(lines)
        
        with open(filepath, 'w') as f:
            f.write(content)

print("Done")
