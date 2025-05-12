import type { Metadata } from "next";
import React from "react";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import AuthGuard from "@/components/AuthGuard";

export const metadata: Metadata = {
  title:
    "Prueba de la vida",
  description: "Proyecto para el Code Challenge de la universidad La Salle Oaxaca | LUDWIG-ASUS",
};

 function Ecommerce() {
  return (
    <AuthGuard>
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">

          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <RecentOrders />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-7">
        </div>
      </div>
    </AuthGuard>
  );
}

export default Ecommerce;