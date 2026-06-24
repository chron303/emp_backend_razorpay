/* 

define a  roles object have 4 roles 
EMP-Employee{
- Default role for every newly registered account.
- Every registration starts with EMP role.
- Reports to exactly one RM.
- Cannot access GET /rest/employees.
- Can create reimbursements.
- Can view only their own reimbursements.
- Cannot modify reimbursements after creation.

}
RM-Reporting Manager{
- Assigned by CFO.
- One RM can manage multiple EMPs.
- Can access GET /rest/employees.
- Can view employees reporting to them.
- Can approve/reject reimbursements raised by subordinate EMPs.
}
APE-Accounts payable Executive{
- Assigned by CFO.
- Can access GET /rest/employees.
- Can view all EMPs and RMs.
- Can approve/reject reimbursements already approved by RM.
}
CFO-Cheif Financial Officer{
- Root user.
- Seeded during db:seed-data.
- Credentials:
  cfo@org.com
  CFO#ORG@April2026
- Can assign roles.
- Can assign employees to managers.
- Can access GET /rest/employees.
- Can view all users.
- Can approve/reject reimbursements.
}
*/

export const ROLES = Object.freeze({
    EMP: "EMP", // Employee — default role on registration
    RM: "RM",  // Reporting Manager — assigned by CFO
    APE: "APE", // Accounts Payable Executive — assigned by CFO
    CFO: "CFO", // Chief Financial Officer — root / seeded user
});