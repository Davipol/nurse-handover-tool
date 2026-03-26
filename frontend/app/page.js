"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [units, setUnits] = useState([]);
  const [patients, setPatients] = useState([]);
  const [handovers, setHandovers] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const unitsRes = await fetch("http://localhost:9090/api/units");
        const unitData = await unitsRes.json();
        console.log("Units Data", unitData);
        setUnits(unitData.units);

        const patientsRes = await fetch("http://localhost:9090/api/patients");
        const patientsData = await patientsRes.json();
        setPatients(patientsData.patients);

        const handoversRes = await fetch("http://localhost:9090/api/handovers");
        const handoversData = await handoversRes.json();

        setHandovers(handoversData.handovers || []);

        const nursesRes = await fetch("http://localhost:9090/api/nurses");
        const nursesData = await nursesRes.json();
        setNurses(nursesData.nurses);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold flex justify-center">
        Nurse Handover Tool
      </h1>
      <section>
        <h2 className="text-2xl font-bold flex justify-center">Units:</h2>
        <ul>
          {units.map((unit) => (
            <li key={unit.id}>{unit.name}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-2xl font-bold flex justify-center">Patients:</h2>
        <ul>
          {patients.map((patient) => (
            <li key={patient.id}>{patient.last_name}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-2xl font-bold flex justify-center">Handovers:</h2>
        <ul>
          {handovers.map((handover) => (
            <li key={handover.id}>{handover.content}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-2xl font-bold flex justify-center">Nurses:</h2>
        <ul>
          {nurses.map((nurse) => (
            <li key={nurse.id}>{nurse.name}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
