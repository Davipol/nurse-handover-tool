"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LoadingSpinner from "./components/LoadingSpinner";
import UserMenu from "./components/UserMenu";

const Dashboard = () => {
  const [units, setUnits] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const unitsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/units`,
        );
        const unitData = await unitsRes.json();
        console.log("Units Data", unitData);
        setUnits(unitData.units);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching units:", err);
        setError("There was an error loading the page");
        setLoading(false);
      }
    };
    fetchUnits();
  }, []);

  if (error)
    return (
      <div className="flex justify-center text-2xl font-bold text-red-700">
        {error}
      </div>
    );
  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          Handover<span className="text-blue-500"> AI</span>
        </h1>
        <UserMenu />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          Units ({units.length})
        </h2>

        {/* Units Grid - Square Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {units.map((unit) => (
            <Link key={unit.id} href={`/units/${unit.id}`} className="block">
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-lg hover:border-blue-300 transition aspect-square flex flex-col items-center justify-center text-center">
                <h3 className="font-semibold text-xl text-gray-900">
                  {unit.name}
                </h3>
                <p className="text-sm text-gray-500 mt-2">View patients</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
