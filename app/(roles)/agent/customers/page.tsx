import CustomerList from "@/components/features/customer/customer-list";

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
      </div>
      <CustomerList />
    </div>
  );
}