"use client";
import DashboardLayout from '@/components/dashboardlayout';

export default function RootLayout({ children }) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}