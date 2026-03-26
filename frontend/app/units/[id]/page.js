"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function UnitPage() {
  const params = useParams();
  const { id } = params;

  const [unit, setUnit] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch unit details
        const unitRes = await fetch(`http://localhost:9090/api/units`);
        const unitData = await unitRes.json();
        const foundUnit = unitData.units.find((u) => u.id === Number(id));
        setUnit(foundUnit);

        // Fetch patients in this unit
        const patientsRes = await fetch(
          `http://localhost:9090/api/patients?unit=${id}`,
        );
        const patientsData = await patientsRes.json();
        setPatients(patientsData.patients || []);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <p className="text-red-700">Error: Unit not found</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Units
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Units
        </Link>
      </div>

      {/* Unit Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          {unit.name}
        </h1>

        {/* Patients List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Patients ({patients.length})
          </h2>

          {patients.length === 0 ? (
            <p className="text-gray-500">No patients in this unit</p>
          ) : (
            <div className="space-y-4">
              {patients.map((patient) => (
                <Link
                  key={patient.id}
                  href={`/patients/${patient.bed}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {patient.first_name} {patient.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Bed: {patient.bed}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        Status: {patient.status}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
